#!/usr/bin/env python3
"""Validate RoomQuest scene cases without third-party packages."""

from __future__ import annotations

import json
import re
import sys
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
DATA_PATH = ROOT / "data" / "scenarios.json"
REQUIRED_FIELDS = {
    "slug",
    "title",
    "status",
    "summary",
    "location",
    "finalCode",
    "objects",
    "clues",
    "validationNotes",
}
ALLOWED_STATUSES = {"示意案例", "測試中", "已驗證"}
SLUG_PATTERN = re.compile(r"^[a-z0-9]+(?:-[a-z0-9]+)*$")


def fail(message: str) -> None:
    print(f"ERROR: {message}")
    raise SystemExit(1)


def require_text(value: object, label: str) -> None:
    if not isinstance(value, str) or not value.strip():
        fail(f"{label} must be a non-empty string")


def main() -> int:
    try:
        scenarios = json.loads(DATA_PATH.read_text(encoding="utf-8"))
    except FileNotFoundError:
        fail(f"missing file: {DATA_PATH}")
    except json.JSONDecodeError as exc:
        fail(f"invalid JSON at line {exc.lineno}, column {exc.colno}: {exc.msg}")

    if not isinstance(scenarios, list) or not scenarios:
        fail("data/scenarios.json must contain a non-empty array")

    seen_slugs: set[str] = set()

    for scenario_index, scenario in enumerate(scenarios, start=1):
        label = f"scenario #{scenario_index}"
        if not isinstance(scenario, dict):
            fail(f"{label} must be an object")

        missing = REQUIRED_FIELDS - scenario.keys()
        if missing:
            fail(f"{label} is missing fields: {', '.join(sorted(missing))}")

        for field in ("slug", "title", "status", "summary", "location", "finalCode"):
            require_text(scenario[field], f"{label}.{field}")

        slug = scenario["slug"]
        if not SLUG_PATTERN.fullmatch(slug):
            fail(f"{label}.slug must use lowercase letters, numbers, and hyphens")
        if slug in seen_slugs:
            fail(f"duplicate slug: {slug}")
        seen_slugs.add(slug)

        if scenario["status"] not in ALLOWED_STATUSES:
            fail(f"{label}.status must be one of: {', '.join(sorted(ALLOWED_STATUSES))}")

        for field in ("objects", "validationNotes"):
            values = scenario[field]
            if not isinstance(values, list) or not values:
                fail(f"{label}.{field} must be a non-empty array")
            for item_index, item in enumerate(values, start=1):
                require_text(item, f"{label}.{field}[{item_index}]")

        clues = scenario["clues"]
        if not isinstance(clues, list) or not clues:
            fail(f"{label}.clues must be a non-empty array")

        expected_steps = list(range(1, len(clues) + 1))
        actual_steps: list[int] = []

        for clue_index, clue in enumerate(clues, start=1):
            clue_label = f"{label}.clues[{clue_index}]"
            if not isinstance(clue, dict):
                fail(f"{clue_label} must be an object")
            missing_clue_fields = {"step", "prompt", "answer", "verification"} - clue.keys()
            if missing_clue_fields:
                fail(f"{clue_label} is missing fields: {', '.join(sorted(missing_clue_fields))}")
            if not isinstance(clue["step"], int):
                fail(f"{clue_label}.step must be an integer")
            actual_steps.append(clue["step"])
            for field in ("prompt", "answer", "verification"):
                require_text(clue[field], f"{clue_label}.{field}")

        if actual_steps != expected_steps:
            fail(f"{label}.clues steps must be consecutive starting at 1")

    print(f"OK: validated {len(scenarios)} scenario(s) from {DATA_PATH.relative_to(ROOT)}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
