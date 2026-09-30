#!/usr/bin/env python3
"""Upload a Next.js static export to the Shark Alibaba Cloud OSS bucket."""

from __future__ import annotations

import base64
import email.utils
import hashlib
import hmac
import mimetypes
import os
import sys
import time
import urllib.error
import urllib.parse
import urllib.request
from pathlib import Path


BUCKET = os.environ.get("ALIYUN_OSS_BUCKET", "shark-product-portfolio")
REGION = os.environ.get("ALIYUN_OSS_REGION", "cn-beijing")
ENDPOINT = f"https://{BUCKET}.oss-{REGION}.aliyuncs.com"


def auth_headers(method: str, resource: str, body: bytes, content_type: str) -> dict[str, str]:
    access_id = os.environ["ALIYUN_OSS_ACCESS_KEY_ID"]
    access_secret = os.environ["ALIYUN_OSS_ACCESS_KEY_SECRET"]
    date = email.utils.formatdate(usegmt=True)
    digest = base64.b64encode(hashlib.md5(body).digest()).decode() if body else ""
    string_to_sign = "\n".join([method, digest, content_type, date, resource])
    signature = base64.b64encode(hmac.new(access_secret.encode(), string_to_sign.encode(), hashlib.sha1).digest()).decode()
    return {
        "Date": date,
        "Authorization": f"OSS {access_id}:{signature}",
        "Content-Type": content_type,
        **({"Content-MD5": digest} if digest else {}),
    }


def put(key: str, body: bytes, content_type: str, cache_control: str) -> None:
    encoded_key = urllib.parse.quote(key, safe="/~")
    resource = f"/{BUCKET}/{encoded_key}"
    url = f"{ENDPOINT}/{encoded_key}"
    headers = auth_headers("PUT", resource, body, content_type)
    headers["Cache-Control"] = cache_control
    request = urllib.request.Request(url, data=body, method="PUT", headers=headers)
    for attempt in range(1, 4):
        try:
            with urllib.request.urlopen(request, timeout=60) as response:
                if response.status not in (200, 201):
                    raise RuntimeError(f"HTTP {response.status}")
            return
        except (OSError, RuntimeError, urllib.error.HTTPError) as error:
            if attempt == 3:
                raise RuntimeError(f"upload failed for {key}: {error}") from error
            time.sleep(attempt * 2)


def configure_website() -> None:
    body = b"""<?xml version=\"1.0\" encoding=\"UTF-8\"?>
<WebsiteConfiguration>
  <IndexDocument><Suffix>index.html</Suffix></IndexDocument>
  <ErrorDocument><Key>index.html</Key><HttpStatus>200</HttpStatus></ErrorDocument>
</WebsiteConfiguration>"""
    resource = f"/{BUCKET}/?website"
    headers = auth_headers("PUT", resource, body, "application/xml")
    request = urllib.request.Request(f"{ENDPOINT}/?website", data=body, method="PUT", headers=headers)
    with urllib.request.urlopen(request, timeout=60) as response:
        if response.status not in (200, 201):
            raise RuntimeError(f"website configuration failed: HTTP {response.status}")


def cache_policy(key: str) -> str:
    if key.endswith((".html", ".txt", ".json")):
        return "no-cache, no-store, must-revalidate"
    if key.startswith("_next/static/"):
        return "public, max-age=31536000, immutable"
    return "public, max-age=86400"


def main() -> int:
    if len(sys.argv) != 2:
        print(f"usage: {sys.argv[0]} STATIC_EXPORT_DIR", file=sys.stderr)
        return 2
    if not os.environ.get("ALIYUN_OSS_ACCESS_KEY_ID") or not os.environ.get("ALIYUN_OSS_ACCESS_KEY_SECRET"):
        print("Missing OSS credentials", file=sys.stderr)
        return 2
    root = Path(sys.argv[1]).resolve()
    if not root.is_dir() or not (root / "index.html").is_file():
        print(f"Expected a static export containing index.html: {root}", file=sys.stderr)
        return 2

    files = [path for path in root.rglob("*") if path.is_file()]
    files.sort(key=lambda path: (path.suffix in {".html", ".txt"}, path.as_posix()))
    for number, path in enumerate(files, 1):
        key = path.relative_to(root).as_posix()
        content_type = mimetypes.guess_type(key)[0] or "application/octet-stream"
        put(key, path.read_bytes(), content_type, cache_policy(key))
        print(f"[{number}/{len(files)}] uploaded {key}")
    configure_website()
    print(f"Published {len(files)} files to oss://{BUCKET}/")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
