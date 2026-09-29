#!/usr/bin/env python3
"""Read public Shark product offers and the latest ECB reference rates."""

from __future__ import annotations

import concurrent.futures
import datetime as dt
import html
import json
import re
import sys
import urllib.error
import urllib.parse
import urllib.request
import xml.etree.ElementTree as ET
from decimal import Decimal, InvalidOperation
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
CATALOG = ROOT / "data/catalog-snapshot.json"
PRICES = ROOT / "data/price-snapshot.json"
RATES = ROOT / "data/fx-snapshot.json"
ECB_URL = "https://www.ecb.europa.eu/stats/eurofxref/eurofxref-daily.xml"
OFFICIAL_HOSTS = {"www.sharkninja.com", "www.sharkninja.co.uk", "www.sharkninja.jp"}
SCRIPT_RE = re.compile(r"<script\b([^>]*)>(.*?)</script\s*>", re.I | re.S)
HEADERS = {"User-Agent": "Mozilla/5.0 (compatible; SharkPortfolioPriceCheck/1.0)", "Accept": "text/html,application/xhtml+xml"}


def get(url: str, timeout: int = 18) -> bytes:
    request = urllib.request.Request(url, headers=HEADERS)
    with urllib.request.urlopen(request, timeout=timeout) as response:
        return response.read(2_000_000)


def nested_products(data: object):
    if isinstance(data, list):
        for item in data:
            yield from nested_products(item)
    elif isinstance(data, dict):
        if data.get("@type") == "Product":
            yield data
        if "@graph" in data:
            yield from nested_products(data["@graph"])
        if "hasVariant" in data:
            yield from nested_products(data["hasVariant"])


def decimal_price(value: object) -> Decimal | None:
    try:
        amount = Decimal(str(value).replace(",", ""))
        return amount if amount > 0 and amount < 10_000_000 else None
    except (InvalidOperation, ValueError):
        return None


def price_for(item: dict, checked_at: str) -> tuple[str, dict | None]:
    model, url = item["model"], item["officialUrl"]
    if urllib.parse.urlsplit(url).hostname not in OFFICIAL_HOSTS:
        return model, None
    try:
        page = get(url).decode("utf-8", "ignore")
        offers: list[dict] = []
        for attrs, raw in SCRIPT_RE.findall(page):
            if not re.search(r"\bapplication/ld\+json\b", attrs, re.I):
                continue
            try:
                structured = json.loads(html.unescape(raw))
            except json.JSONDecodeError:
                continue
            for product in nested_products(structured):
                product_id = str(product.get("productID") or product.get("sku") or "").upper()
                if product_id and product_id != model.upper() and not model.upper().startswith(product_id + "-") and not product_id.startswith(model.upper()):
                    continue
                data = product.get("offers") or []
                offers.extend(data if isinstance(data, list) else [data])
        matching = []
        for offer in offers:
            if not isinstance(offer, dict):
                continue
            amount = decimal_price(offer.get("price"))
            currency = str(offer.get("priceCurrency") or "").upper()
            if amount and re.fullmatch(r"[A-Z]{3}", currency):
                matching.append((amount, currency))
        if not matching:
            return model, None
        currencies = {currency for _, currency in matching}
        if len(currencies) != 1:
            return model, None
        values = sorted({amount for amount, _ in matching})
        result = {"amount": float(values[0]), "currency": currencies.pop(), "checkedAt": checked_at, "sourceUrl": url}
        if values[-1] != values[0]:
            result["amountMax"] = float(values[-1])
        return model, result
    except (TimeoutError, OSError, UnicodeError, ValueError) as error:
        print(f"{model}: {type(error).__name__}: {error}", file=sys.stderr)
        return model, None


def exchange_rates() -> dict:
    root = ET.fromstring(get(ECB_URL, 20))
    day = next(element.attrib["time"] for element in root.iter() if "time" in element.attrib)
    rates = {element.attrib["currency"]: float(element.attrib["rate"]) for element in root.iter() if "currency" in element.attrib}
    if "USD" not in rates or "JPY" not in rates or "GBP" not in rates:
        raise ValueError("ECB response is missing a required rate")
    return {"base": "EUR", "asOf": day, "rates": {"EUR": 1, **rates}, "sourceUrl": ECB_URL}


def main():
    products = json.loads(CATALOG.read_text())
    previous = json.loads(PRICES.read_text()) if PRICES.exists() else {}
    checked_at = dt.datetime.now(dt.timezone.utc).isoformat(timespec="seconds").replace("+00:00", "Z")
    missing_only = "--missing-only" in sys.argv
    targets = [product for product in products if not missing_only or not previous.get(product["model"])]
    results = {product["model"]: previous.get(product["model"]) for product in products}
    with concurrent.futures.ThreadPoolExecutor(max_workers=6) as pool:
        futures = [pool.submit(price_for, product, checked_at) for product in targets]
        for i, future in enumerate(concurrent.futures.as_completed(futures), 1):
            model, current = future.result()
            results[model] = current or previous.get(model)
            if i % 25 == 0 or i == len(targets):
                print(f"Checked {i}/{len(targets)}; priced {sum(bool(p) for p in results.values())}", flush=True)
    PRICES.write_text(json.dumps(dict(sorted(results.items())), ensure_ascii=False, indent=2) + "\n")
    try:
        rates = exchange_rates()
        RATES.write_text(json.dumps(rates, ensure_ascii=False, indent=2) + "\n")
        print(f"ECB {rates['asOf']} · USD {rates['rates']['USD']}")
    except (OSError, ET.ParseError, ValueError) as error:
        if not RATES.exists():
            raise
        print(f"Keeping last verified FX rates: {error}", file=sys.stderr)
    print(f"Price coverage: {sum(bool(p) for p in results.values())}/{len(products)}", flush=True)


if __name__ == "__main__":
    main()
