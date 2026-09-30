#!/usr/bin/env python3
"""Refresh the upstream catalog and place unknown SKUs in a review queue.

Known products keep their manually reviewed category, name, specifications and
platform grouping. The script only adds newly observed markets and fills a
missing image. Unknown products are written to pending-products.json and are
never published to the portfolio automatically.
"""

from __future__ import annotations

import argparse
import datetime as dt
import json
import os
import urllib.error
import urllib.parse
import urllib.request
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
CATALOG = ROOT / "data/catalog-snapshot.json"
PENDING = ROOT / "data/pending-products.json"
REPORT = ROOT / "data/discovery-report.json"
DEFAULT_ORIGIN = "https://shark-portfolio-victor.jg749nmqt5.chatgpt.site"
DEFAULT_SOURCE_COUNT = 26
HEADERS = {
    "Accept": "application/json",
    "Content-Type": "application/json",
    "User-Agent": "SharkPortfolioAutomation/1.0",
}


def utc_now() -> str:
    return dt.datetime.now(dt.timezone.utc).isoformat(timespec="seconds").replace("+00:00", "Z")


def endpoint(origin: str, path: str) -> str:
    parsed = urllib.parse.urlsplit(origin)
    if parsed.scheme != "https" or not parsed.netloc:
        raise ValueError("SHARK_DATA_ORIGIN must be an https URL")
    return urllib.parse.urljoin(origin.rstrip("/") + "/", path.lstrip("/"))


def request_json(url: str, *, payload: dict | None = None, timeout: int = 40) -> dict:
    body = json.dumps(payload).encode() if payload is not None else None
    request = urllib.request.Request(url, data=body, method="POST" if body else "GET", headers=HEADERS)
    with urllib.request.urlopen(request, timeout=timeout) as response:
        if response.status < 200 or response.status >= 300:
            raise RuntimeError(f"HTTP {response.status}")
        data = json.load(response)
    if not isinstance(data, dict):
        raise ValueError("upstream response is not an object")
    return data


def refresh_sources(origin: str, count: int) -> tuple[int, list[str]]:
    succeeded = 0
    failures: list[str] = []
    refresh_url = endpoint(origin, "/api/refresh")
    for index in range(count):
        try:
            result = request_json(refresh_url, payload={"categoryIndex": index})
            label = str(result.get("source") or f"source {index + 1}")
            status = str(result.get("status") or "unknown")
            if status == "ok":
                succeeded += 1
                print(f"[{index + 1}/{count}] {label}: ok")
            else:
                detail = str(result.get("detail") or status)
                failures.append(f"{label}: {detail}")
                print(f"[{index + 1}/{count}] {label}: {detail}")
        except (OSError, ValueError, RuntimeError, urllib.error.HTTPError) as error:
            failures.append(f"source {index + 1}: {type(error).__name__}: {error}")
            print(f"[{index + 1}/{count}] failed: {type(error).__name__}: {error}")
    return succeeded, failures


def normalized_model(value: object) -> str:
    return str(value or "").strip().upper()


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--skip-source-refresh", action="store_true", help="Read the upstream snapshot without triggering its scanners")
    args = parser.parse_args()

    origin = os.environ.get("SHARK_DATA_ORIGIN", DEFAULT_ORIGIN).rstrip("/")
    source_count = int(os.environ.get("SHARK_SCAN_SOURCE_COUNT", DEFAULT_SOURCE_COUNT))
    checked_at = utc_now()
    succeeded = 0
    failures: list[str] = []
    if not args.skip_source_refresh:
        succeeded, failures = refresh_sources(origin, source_count)
        if succeeded == 0:
            raise RuntimeError("No upstream catalog source refreshed successfully; keeping the published snapshot unchanged")

    upstream = request_json(endpoint(origin, "/api/products"), timeout=45)
    remote_products = upstream.get("products")
    if not isinstance(remote_products, list) or not remote_products:
        raise ValueError("upstream catalog is empty")

    catalog = json.loads(CATALOG.read_text())
    pending = json.loads(PENDING.read_text()) if PENDING.exists() else []
    if not isinstance(catalog, list) or not isinstance(pending, list):
        raise ValueError("catalog or pending product file has an invalid format")

    catalog_by_model = {normalized_model(item.get("model")): item for item in catalog if normalized_model(item.get("model"))}
    pending_by_model = {
        normalized_model(item.get("model")): item
        for item in pending
        if normalized_model(item.get("model")) and normalized_model(item.get("model")) not in catalog_by_model
    }
    known_updates = 0
    new_candidates = 0

    for remote in remote_products:
        if not isinstance(remote, dict):
            continue
        model = normalized_model(remote.get("model"))
        if not model:
            continue
        if model in catalog_by_model:
            local = catalog_by_model[model]
            changed = False
            remote_markets = [str(m).upper() for m in remote.get("markets", []) if str(m).strip()]
            merged_markets = list(dict.fromkeys([*local.get("markets", []), *remote_markets]))
            if merged_markets != local.get("markets", []):
                local["markets"] = merged_markets
                changed = True
            if not local.get("imageUrl") and remote.get("imageUrl"):
                local["imageUrl"] = remote["imageUrl"]
                changed = True
            known_updates += int(changed)
            continue

        previous = pending_by_model.get(model, {})
        if not previous:
            new_candidates += 1
        pending_by_model[model] = {
            "model": model,
            "name": remote.get("name") or previous.get("name") or model,
            "suggestedCategory": remote.get("category") or previous.get("suggestedCategory") or "待审核",
            "officialUrl": remote.get("officialUrl") or previous.get("officialUrl"),
            "imageUrl": remote.get("imageUrl") or previous.get("imageUrl"),
            "markets": list(dict.fromkeys([*previous.get("markets", []), *remote.get("markets", [])])),
            "firstSeen": previous.get("firstSeen") or checked_at,
            "lastSeen": checked_at,
            "status": "pending",
            "reviewNote": previous.get("reviewNote") or "请核验品类、上市时间及是否应并入现有平台合集",
        }

    pending_output = sorted(pending_by_model.values(), key=lambda item: normalized_model(item.get("model")))
    CATALOG.write_text(json.dumps(catalog, ensure_ascii=False, indent=2) + "\n")
    PENDING.write_text(json.dumps(pending_output, ensure_ascii=False, indent=2) + "\n")
    REPORT.write_text(json.dumps({
        "checkedAt": checked_at,
        "sourceRefreshSkipped": args.skip_source_refresh,
        "sourceCount": source_count,
        "sourcesSucceeded": succeeded,
        "sourceFailures": failures,
        "remoteProductCount": len(remote_products),
        "publishedProductCount": len(catalog),
        "knownProductsUpdated": known_updates,
        "newCandidates": new_candidates,
        "pendingReviewCount": len(pending_output),
    }, ensure_ascii=False, indent=2) + "\n")
    print(f"Catalog {len(catalog)} · pending {len(pending_output)} · new {new_candidates} · known updates {known_updates}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
