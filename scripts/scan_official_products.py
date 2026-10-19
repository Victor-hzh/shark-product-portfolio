#!/usr/bin/env python3
"""Discover Shark SKUs directly from the official US, UK and Japan stores."""

from __future__ import annotations

import concurrent.futures
import html
import json
import re
import time
import urllib.error
import urllib.parse
import urllib.request
from html.parser import HTMLParser
from pathlib import Path


SOURCES = Path(__file__).resolve().parents[1] / "data/scan-sources.json"
HEADERS = {
    "User-Agent": "Mozilla/5.0 (compatible; SharkPortfolio/2.0)",
    "Accept": "text/html,application/json",
}
EVENTS = re.compile(r"var ga4DataLayerEvent\s*=\s*(\[[\s\S]*?\]);")
SKU_LINK = re.compile(r"href=[\"']([^\"']*?/([A-Z0-9-]+)\.html(?:\?[^\"']*)?)[\"']", re.I)
MODEL = re.compile(r"^[A-Z0-9-]+$")


def clean(value: object) -> str:
    return re.sub(r"\s+", " ", re.sub(r"®|™|<[^>]*>", "", html.unescape(str(value or "")))).strip()


def fetch_text(url: str, timeout: int = 14) -> str:
    request = urllib.request.Request(url, headers=HEADERS)
    for attempt in range(3):
        try:
            with urllib.request.urlopen(request, timeout=timeout) as response:
                return response.read(3_000_000).decode("utf-8", "replace")
        except (urllib.error.HTTPError, urllib.error.URLError, TimeoutError):
            if attempt == 2:
                raise
            time.sleep(attempt + 1)
    raise RuntimeError("source request failed")


class ImageMetaParser(HTMLParser):
    def __init__(self) -> None:
        super().__init__()
        self.image: str | None = None

    def handle_starttag(self, tag: str, attrs: list[tuple[str, str | None]]) -> None:
        if tag != "meta" or self.image:
            return
        fields = dict(attrs)
        if fields.get("property", "").lower() == "og:image":
            self.image = fields.get("content")


def image_from_html(page: str, url: str) -> str | None:
    parser = ImageMetaParser()
    parser.feed(page)
    image = parser.image
    if not image:
        match = re.search(r"https://assets\.sharkninja\.com/image/upload/[^\"\s]+/SharkNinja-EU/[A-Z0-9_-]+_01\.(?:jpg|png|webp)", page, re.I)
        image = match.group() if match else None
    if not image:
        return None
    parsed = urllib.parse.urlsplit(urllib.parse.urljoin(url, clean(image)))
    if parsed.scheme not in {"http", "https"} or not parsed.netloc:
        return None
    return urllib.parse.urlunsplit(("https", parsed.netloc, parsed.path, parsed.query, ""))


def product(model: str, name: str, category: str, url: str, image: str | None, market: str) -> dict:
    return {"model": model.upper(), "name": name, "category": category,
            "officialUrl": url, "imageUrl": image, "markets": [market]}


def japan_category(title: str) -> str | None:
    for pattern, category in (
        (r"コードレススティック|サイクロンスティック", "无线吸尘器"),
        (r"ハンディ", "手持吸尘器"), (r"シミ取り", "布艺清洗机"),
        (r"スチーム", "蒸汽清洁"), (r"ロボット", "扫地机器人"),
        (r"空気清浄", "空气净化器"), (r"ブロワー", "吹叶机"),
        (r"ファン|サーキュレーター", "风扇"),
    ):
        if re.search(pattern, title):
            return category
    return None


def shopify_products(body: str) -> list[dict]:
    entries = json.loads(body)["products"]
    found = []
    for entry in entries:
        title = str(entry.get("title") or "")
        model = str(entry.get("handle") or "").upper()
        category = japan_category(title)
        images = entry.get("images") or []
        if not category or not re.search(r"Shark|シャーク", title) or not re.fullmatch(r"[A-Z]{1,5}[0-9]{2,5}[A-Z0-9]*", model) or not images:
            continue
        image = next((i["src"] for i in images if re.search(r"[_-]01(?:[_-]|\.)", i.get("src", ""), re.I) and "icon" not in i.get("src", "").lower()), images[0].get("src"))
        found.append(product(model, re.sub(r"^【[^】]+】", "", title).strip(), category,
                             f"https://www.sharkninja.jp/products/{entry['handle']}", image, "JP"))
    return found


def sfcc_products(page: str, source: dict) -> list[dict]:
    match = EVENTS.search(page)
    if not match:
        raise ValueError("分类页没有产品数据")
    events = json.loads(match.group(1))
    links: dict[str, str] = {}
    for link, model in SKU_LINK.findall(page):
        url = urllib.parse.urljoin(source["url"], clean(link)).split("?", 1)[0]
        if urllib.parse.urlsplit(url).hostname == urllib.parse.urlsplit(source["url"]).hostname:
            links[model.upper()] = url
    found: dict[str, dict] = {}
    for event in events:
        for item in (event.get("ecommerce") or {}).get("items") or []:
            if item.get("item_brand") != "Shark" or item.get("product_type") != "main":
                continue
            model, name = str(item.get("item_id") or "").upper(), clean(item.get("item_name"))
            if not MODEL.fullmatch(model) or not name or re.search(r"\bbundle\b|accessor|\bpackage\b", name, re.I):
                continue
            url = links.get(model) or links.get(model.removesuffix("-MASTER"))
            if url:
                found[model] = product(model, name, source["category"], url, None, source["market"])
    return list(found.values())


def scan_sources(known_models: set[str], sources: list[dict] | None = None) -> tuple[list[dict], int, list[str], list[str]]:
    """Return products, successful sources, failures and models needing photos."""
    sources = sources if sources is not None else json.loads(SOURCES.read_text())
    found: dict[str, dict] = {}
    failures: list[str] = []
    succeeded = 0
    for index, source in enumerate(sources, 1):
        try:
            body = fetch_text(source["url"])
            products = shopify_products(body) if source["format"] == "shopify" else sfcc_products(body, source)
            if not products:
                raise ValueError("来源没有可识别的 Shark 主机商品")
            succeeded += 1
            for item in products:
                existing = found.get(item["model"])
                if existing:
                    existing["markets"] = list(dict.fromkeys([*existing["markets"], *item["markets"]]))
                    existing["imageUrl"] = existing["imageUrl"] or item["imageUrl"]
                else:
                    found[item["model"]] = item
            print(f"[{index}/{len(sources)}] {source['label']}: {len(products)} products", flush=True)
        except (OSError, ValueError, KeyError, TypeError, json.JSONDecodeError) as error:
            failures.append(f"{source['label']}: {error}")
            print(f"[{index}/{len(sources)}] {source['label']}: {error}", flush=True)

    def with_image(item: dict) -> tuple[dict, bool]:
        if item["model"] in known_models or item.get("imageUrl"):
            return item, True
        try:
            item["imageUrl"] = image_from_html(fetch_text(item["officialUrl"]), item["officialUrl"])
        except (OSError, ValueError) as error:
            print(f"{item['model']}: image lookup failed: {error}", flush=True)
        return item, bool(item.get("imageUrl"))

    missing_images = []
    with concurrent.futures.ThreadPoolExecutor(max_workers=6) as pool:
        results = pool.map(with_image, found.values())
        products = []
        for item, has_image in results:
            products.append(item)
            if not has_image:
                missing_images.append(item["model"])
    return products, succeeded, failures, missing_images
