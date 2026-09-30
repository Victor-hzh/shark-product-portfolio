#!/usr/bin/env python3
"""Run the verified data refresh tasks and publish a compact status snapshot."""

from __future__ import annotations

import argparse
import datetime as dt
import json
import subprocess
import sys
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
DATA = ROOT / "data"


def run(script: str, *args: str) -> None:
    subprocess.run([sys.executable, str(ROOT / "scripts" / script), *args], cwd=ROOT, check=True)


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--skip-source-refresh", action="store_true")
    parser.add_argument("--skip-prices", action="store_true", help="Keep the current price and FX snapshots")
    args = parser.parse_args()

    catalog_args = ("--skip-source-refresh",) if args.skip_source_refresh else ()
    run("sync_catalog_candidates.py", *catalog_args)
    if not args.skip_prices:
        run("sync_official_prices.py")

    catalog = json.loads((DATA / "catalog-snapshot.json").read_text())
    prices = json.loads((DATA / "price-snapshot.json").read_text())
    pending = json.loads((DATA / "pending-products.json").read_text())
    fx = json.loads((DATA / "fx-snapshot.json").read_text())
    status = {
        "updatedAt": dt.datetime.now(dt.timezone.utc).isoformat(timespec="seconds").replace("+00:00", "Z"),
        "catalogCount": len(catalog),
        "pricedCount": sum(bool(value) for value in prices.values()),
        "pendingCount": len(pending),
        "fxAsOf": fx.get("asOf"),
    }
    (DATA / "refresh-status.json").write_text(json.dumps(status, ensure_ascii=False, indent=2) + "\n")
    print(f"Refresh complete: {status}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
