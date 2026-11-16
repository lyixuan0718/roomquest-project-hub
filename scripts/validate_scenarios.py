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
    "pagePath",
    "finalCode",
    "objects",
    "clues",
    "uniquenessDemo",
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

        for field in ("slug", "title", "status", "summary", "location", "pagePath", "finalCode"):
            require_text(scenario[field], f"{label}.{field}")

        page_path = ROOT / scenario["pagePath"]
        if not page_path.is_file():
            fail(f"{label}.pagePath does not exist: {scenario['pagePath']}")

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
            missing_clue_fields = {"step", "prompt", "answer", "hints", "verification"} - clue.keys()
            if missing_clue_fields:
                fail(f"{clue_label} is missing fields: {', '.join(sorted(missing_clue_fields))}")
            if not isinstance(clue["step"], int):
                fail(f"{clue_label}.step must be an integer")
            actual_steps.append(clue["step"])
            for field in ("prompt", "answer", "verification"):
                require_text(clue[field], f"{clue_label}.{field}")
            hints = clue["hints"]
            if not isinstance(hints, list) or not hints:
                fail(f"{clue_label}.hints must be a non-empty array")
            for hint_index, hint in enumerate(hints, start=1):
                require_text(hint, f"{clue_label}.hints[{hint_index}]")

        if actual_steps != expected_steps:
            fail(f"{label}.clues steps must be consecutive starting at 1")

        demo = scenario["uniquenessDemo"]
        if not isinstance(demo, dict):
            fail(f"{label}.uniquenessDemo must be an object")
        missing_demo_fields = {"title", "target", "constraints", "candidates"} - demo.keys()
        if missing_demo_fields:
            fail(f"{label}.uniquenessDemo is missing fields: {', '.join(sorted(missing_demo_fields))}")
        for field in ("title", "target"):
            require_text(demo[field], f"{label}.uniquenessDemo.{field}")

        constraints = demo["constraints"]
        if not isinstance(constraints, list) or not constraints:
            fail(f"{label}.uniquenessDemo.constraints must be a non-empty array")
        for constraint_index, constraint in enumerate(constraints, start=1):
            require_text(constraint, f"{label}.uniquenessDemo.constraints[{constraint_index}]")

        candidates = demo["candidates"]
        if not isinstance(candidates, list) or len(candidates) < 2:
            fail(f"{label}.uniquenessDemo.candidates must contain at least two candidates")
        for candidate_index, candidate in enumerate(candidates, start=1):
            candidate_label = f"{label}.uniquenessDemo.candidates[{candidate_index}]"
            if not isinstance(candidate, dict) or {"name", "traits"} - candidate.keys():
                fail(f"{candidate_label} must contain name and traits")
            require_text(candidate["name"], f"{candidate_label}.name")
            if not isinstance(candidate["traits"], list) or not candidate["traits"]:
                fail(f"{candidate_label}.traits must be a non-empty array")
            for trait_index, trait in enumerate(candidate["traits"], start=1):
                require_text(trait, f"{candidate_label}.traits[{trait_index}]")

        matches = [
            candidate for candidate in candidates
            if all(constraint in candidate["traits"] for constraint in constraints)
        ]
        if len(matches) != 1 or matches[0]["name"] != demo["target"]:
            fail(f"{label}.uniquenessDemo constraints must uniquely identify target")

    print(f"OK: validated {len(scenarios)} scenario(s) from {DATA_PATH.relative_to(ROOT)}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
