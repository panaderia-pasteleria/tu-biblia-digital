#!/usr/bin/env python3
"""Validate and convert an independently licensed Torres Amat JSON transcription.

Input schema: {"books": [{"id":"GEN","chapters":[["Verse 1", "Verse 2"], ...]}]}
No content is fetched from third-party sites. Verify source rights before running.
"""
import argparse
import json
import re
from pathlib import Path

BOOK_ID = re.compile(r"^[A-Z0-9]{2,12}$")

def build(catalog_path: Path, input_path: Path, output: Path):
    catalog = json.loads(catalog_path.read_text(encoding="utf-8"))
    expected = {book["id"]: book for book in catalog["books"]}
    payload = json.loads(input_path.read_text(encoding="utf-8"))
    books = payload.get("books")
    if not isinstance(books, list):
        raise ValueError("Input must contain a books array")
    found = set()
    prepared = []
    for book in books:
        bid = book.get("id")
        if not isinstance(bid, str) or not BOOK_ID.fullmatch(bid) or bid not in expected or bid in found:
            raise ValueError(f"Unknown, unsafe or duplicate book: {bid!r}")
        found.add(bid)
        chapters = book.get("chapters")
        if not isinstance(chapters, list) or len(chapters) != expected[bid]["chapters"]:
            raise ValueError(f"Chapter count mismatch for {bid}")
        for number, verses in enumerate(chapters, 1):
            if not isinstance(verses, list) or not verses or any(not isinstance(v, str) or not v.strip() for v in verses):
                raise ValueError(f"Invalid verses: {bid} chapter {number}")
            content = "\n".join(f"{i}. {verse.strip()}" for i, verse in enumerate(verses, 1)) + "\n"
            prepared.append((output / "licensed" / "es" / bid / f"{number}.txt", content))
    missing = sorted(set(expected) - found)
    if missing:
        raise ValueError(f"Missing books: {', '.join(missing)}")
    # Validate everything before writing any files.
    for path, content in prepared:
        path.parent.mkdir(parents=True, exist_ok=True)
        path.write_text(content, encoding="utf-8")
    print(f"Validated {len(found)} books; wrote {len(prepared)} chapters to {output}")

if __name__ == "__main__":
    p = argparse.ArgumentParser()
    p.add_argument("--catalog", default="comercial/catalogo-catolico.json", type=Path)
    p.add_argument("--input", required=True, type=Path)
    p.add_argument("--output", required=True, type=Path)
    args = p.parse_args()
    build(args.catalog, args.input, args.output)
