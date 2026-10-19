#!/usr/bin/env python3
"""Refresh the published catalog directly from official Shark product pages.

Known products keep their manually curated fields. Valid new Shark products are
published as individual cards; rejected records remain in the exception queue.
"""

from __future__ import annotations

import argparse
import datetime as dt
import json
import urllib.parse
from pathlib import Path

from scan_official_products import SOURCES, scan_sources


ROOT = Path(__file__).resolve().parents[1]
CATALOG = ROOT / "data/catalog-snapshot.json"
PENDING = ROOT / "data/pending-products.json"
REPORT = ROOT / "data/discovery-report.json"
VALID_CATEGORIES = {
    "洗地机", "布艺清洗机", "扫地机器人", "无线吸尘器", "有线杆式吸尘器",
    "手持吸尘器", "蒸汽清洁", "立式吸尘器", "地毯清洗机", "吹叶机",
    "吹风机", "美发造型", "直发器", "热风梳", "美容仪", "光疗面罩", "风扇", "空气净化器",
}
OFFICIAL_HOSTS = {"www.sharkninja.com", "www.sharkninja.co.uk", "www.sharkninja.jp"}
def utc_now() -> str:
    return dt.datetime.now(dt.timezone.utc).isoformat(timespec="seconds").replace("+00:00", "Z")


def normalized_model(value: object) -> str:
    return str(value or "").strip().upper()


def canonical_url(value: object) -> str:
    parsed = urllib.parse.urlsplit(str(value or ""))
    return f"{parsed.scheme}://{parsed.netloc.lower()}{parsed.path.rstrip('/')}" if parsed.netloc else ""


def publishable(remote: dict) -> tuple[bool, str]:
    model = normalized_model(remote.get("model"))
    name = str(remote.get("name") or "").strip()
    category = str(remote.get("category") or "").strip()
    parsed = urllib.parse.urlsplit(str(remote.get("officialUrl") or ""))
    markets = remote.get("markets")
    if not model or not name:
        return False, "缺少商品名称或型号"
    if category not in VALID_CATEGORIES:
        return False, "品类未识别"
    if parsed.scheme != "https" or parsed.netloc.lower() not in OFFICIAL_HOSTS:
        return False, "缺少可核实的 Shark 官方商品链接"
    if not isinstance(markets, list) or not markets or not all(m in {"US", "UK", "JP"} for m in markets):
        return False, "销售市场未识别"
    return True, ""


def display_category(model: str, category: str) -> str:
    if model.startswith("EX") and len(model) > 2 and model[2].isdigit():
        return "地毯清洗机"
    if model.startswith("WD") and len(model) > 2 and model[2].isdigit():
        return "洗地机"
    return category


def reconcile(remote_products: list, catalog: list, previous_pending: list, checked_at: str) -> tuple[list, list, int, int]:
    catalog_by_model = {normalized_model(item.get("model")): item for item in catalog if normalized_model(item.get("model"))}
    catalog_urls = {canonical_url(item.get("officialUrl")) for item in catalog}
    previous_by_model = {normalized_model(item.get("model")): item for item in previous_pending}
    exceptions: dict[str, dict] = {}
    known_updates = 0
    added = 0

    # Prefer concrete SKUs when the source exposes both a product and a -MASTER alias.
    for remote in sorted((item for item in remote_products if isinstance(item, dict)),
                         key=lambda item: normalized_model(item.get("model")).endswith("-MASTER")):
        model = normalized_model(remote.get("model"))
        if not model:
            continue
        if model in catalog_by_model:
            local = catalog_by_model[model]
            remote_markets = [str(m).upper() for m in remote.get("markets", []) if str(m).strip()]
            merged_markets = list(dict.fromkeys([*local.get("markets", []), *remote_markets]))
            changed = merged_markets != local.get("markets", [])
            if changed:
                local["markets"] = merged_markets
            if not local.get("imageUrl") and remote.get("imageUrl"):
                local["imageUrl"] = remote["imageUrl"]
                changed = True
            known_updates += int(changed)
            continue

        url = canonical_url(remote.get("officialUrl"))
        if url and url in catalog_urls:
            continue
        valid, reason = publishable(remote)
        if not valid:
            previous = previous_by_model.get(model, {})
            exceptions[model] = {
                "model": model, "name": remote.get("name") or previous.get("name") or model,
                "suggestedCategory": remote.get("category") or previous.get("suggestedCategory") or "待核实",
                "officialUrl": remote.get("officialUrl") or previous.get("officialUrl"),
                "imageUrl": remote.get("imageUrl") or previous.get("imageUrl"),
                "markets": remote.get("markets", []),
                "firstSeen": previous.get("firstSeen") or checked_at, "lastSeen": checked_at,
                "status": "needs_attention", "reviewNote": reason,
            }
            continue

        catalog.append({
            "model": model, "name": remote["name"], "category": display_category(model, remote["category"]),
            "officialUrl": remote["officialUrl"], "markets": list(dict.fromkeys(remote["markets"])),
            "imageUrl": remote.get("imageUrl"),
        })
        catalog_by_model[model] = catalog[-1]
        catalog_urls.add(url)
        added += 1

    return catalog, sorted(exceptions.values(), key=lambda item: item["model"]), added, known_updates


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--skip-source-refresh", action="store_true", help="Check local snapshots without requesting official sources")
    args = parser.parse_args()

    sources = json.loads(SOURCES.read_text())
    source_count = len(sources)
    checked_at = utc_now()
    catalog = json.loads(CATALOG.read_text())
    pending = json.loads(PENDING.read_text()) if PENDING.exists() else []
    if not isinstance(catalog, list) or not isinstance(pending, list):
        raise ValueError("catalog or pending product file has an invalid format")

    succeeded, failures, missing_images, remote_products = 0, [], 0, []
    added, known_updates = 0, 0
    pending_output = pending
    if not args.skip_source_refresh:
        remote_products, succeeded, failures, missing_images = scan_sources(
            {normalized_model(item.get("model")) for item in catalog}, sources)
        if succeeded == 0:
            raise RuntimeError("No official Shark source could be scanned; keeping the published snapshot unchanged")
        catalog, pending_output, added, known_updates = reconcile(remote_products, catalog, pending, checked_at)
        CATALOG.write_text(json.dumps(catalog, ensure_ascii=False, indent=2) + "\n")
        PENDING.write_text(json.dumps(pending_output, ensure_ascii=False, indent=2) + "\n")

    REPORT.write_text(json.dumps({
        "checkedAt": checked_at,
        "sourceRefreshSkipped": args.skip_source_refresh,
        "sourceCount": source_count,
        "sourcesSucceeded": succeeded,
        "sourceFailures": failures,
        "remoteProductCount": len(remote_products),
        "skippedMissingImageCount": missing_images,
        "publishedProductCount": len(catalog),
        "knownProductsUpdated": known_updates,
        "autoPublished": added,
        "unverifiedCount": len(pending_output),
    }, ensure_ascii=False, indent=2) + "\n")
    print(f"Catalog {len(catalog)} · auto published {added} · exceptions {len(pending_output)} · known updates {known_updates}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
