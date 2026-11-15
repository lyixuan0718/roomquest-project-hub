#!/usr/bin/env python3
"""Validate the reusable structure of the RoomQuest documentation site."""

from __future__ import annotations

import json
import re
import sys
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
NAVIGATION_PATH = ROOT / "data" / "navigation.json"
REQUIRED_PATHS = [
    ROOT / "AGENTS.md",
    ROOT / "README.md",
    ROOT / "index.html",
    ROOT / "assets" / "css" / "styles.css",
    ROOT / "assets" / "js" / "main.js",
    ROOT / "data" / "navigation.json",
    ROOT / "templates" / "content-page.html",
]
SLUG_PATTERN = re.compile(r"^[a-z0-9]+(?:-[a-z0-9]+)*$")


def main() -> int:
    errors: list[str] = []

    for path in REQUIRED_PATHS:
        if not path.is_file():
            errors.append(f"missing required file: {path.relative_to(ROOT)}")

    if errors:
        return report(errors)

    try:
        pages = json.loads(NAVIGATION_PATH.read_text(encoding="utf-8"))
    except json.JSONDecodeError as exc:
        return report([f"invalid navigation JSON at line {exc.lineno}: {exc.msg}"])

    if not isinstance(pages, list) or not pages:
        return report(["data/navigation.json must contain a non-empty array"])

    required_fields = {"id", "title", "summary", "path", "group"}
    ids: set[str] = set()
    paths: set[str] = set()
    page_by_path: dict[str, dict[str, str]] = {}

    for index, page in enumerate(pages, start=1):
        label = f"navigation item #{index}"
        if not isinstance(page, dict):
            errors.append(f"{label} must be an object")
            continue
        missing = required_fields - page.keys()
        if missing:
            errors.append(f"{label} missing fields: {', '.join(sorted(missing))}")
            continue
        for field in required_fields:
            if not isinstance(page[field], str) or not page[field].strip():
                errors.append(f"{label}.{field} must be a non-empty string")

        page_id = page["id"]
        page_path = page["path"]
        if not SLUG_PATTERN.fullmatch(page_id):
            errors.append(f"invalid page id: {page_id}")
        if page_id in ids:
            errors.append(f"duplicate page id: {page_id}")
        if page_path in paths:
            errors.append(f"duplicate page path: {page_path}")
        ids.add(page_id)
        paths.add(page_path)
        page_by_path[page_path] = page

        if not (ROOT / page_path).is_file():
            errors.append(f"navigation path does not exist: {page_path}")

    actual_content_paths = {"index.html"}
    actual_content_paths.update(
        path.relative_to(ROOT).as_posix() for path in (ROOT / "pages").glob("*.html")
    )
    for path in sorted(actual_content_paths - paths):
        errors.append(f"content page is missing from navigation: {path}")
    for path in sorted(paths - actual_content_paths):
        errors.append(f"navigation points outside the formal content pages: {path}")

    for relative_path in sorted(actual_content_paths):
        path = ROOT / relative_path
        if not path.is_file():
            continue
        html = path.read_text(encoding="utf-8")
        expected_id = page_by_path.get(relative_path, {}).get("id")
        body_match = re.search(r"<body\b[^>]*\bdata-page=[\"']([^\"']+)[\"']", html)
        actual_id = body_match.group(1) if body_match else None
        if actual_id != expected_id:
            errors.append(f"{relative_path}: data-page is {actual_id!r}, expected {expected_id!r}")
        if len(re.findall(r"<h1\b", html, flags=re.IGNORECASE)) != 1:
            errors.append(f"{relative_path}: must contain exactly one h1")
        for marker in ("id=\"main-content\"", "data-site-header", "data-sidebar", "data-site-footer"):
            if marker not in html:
                errors.append(f"{relative_path}: missing {marker}")
        if "assets/js/main.js" not in html:
            errors.append(f"{relative_path}: missing shared main.js")
        if "TODO" in html:
            errors.append(f"{relative_path}: contains an unreplaced TODO")

    template = (ROOT / "templates" / "content-page.html").read_text(encoding="utf-8")
    for marker in ("TODO_PAGE_ID", "TODO_TITLE", "TODO_SECTION_ONE"):
        if marker not in template:
            errors.append(f"template is missing placeholder: {marker}")

    return report(errors, page_count=len(actual_content_paths))


def report(errors: list[str], page_count: int = 0) -> int:
    if errors:
        for error in errors:
            print(f"ERROR: {error}")
        print(f"FAILED: {len(errors)} issue(s)")
        return 1
    print(f"OK: validated {page_count} page(s), navigation, template, and shared assets")
    return 0


if __name__ == "__main__":
    sys.exit(main())
