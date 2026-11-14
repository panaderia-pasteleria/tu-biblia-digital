#!/usr/bin/env python3
"""Convert a rights-cleared Torres Amat transcription into private chapter files.

Input: {"source":{"edition":"...","provenance":"...","rights_review":"..."},
"books":[{"id":"GEN","chapters":[["verse one","verse two"], ...]}]}
Use --sample for an incomplete, clearly non-production smoke test.
"""
import argparse
import hashlib
import json
import os
import re
import shutil
import tempfile
from pathlib import Path

BOOK_ID = re.compile(r"^[A-Z0-9]{2,12}$")
REQUIRED_SOURCE = ("edition", "provenance", "rights_review")

def build(catalog_path: Path, input_path: Path, output: Path, sample=False):
    catalog = json.loads(catalog_path.read_text(encoding="utf-8"))
    expected = {book["id"]: book for book in catalog["books"]}
    if len(expected) != 73:
        raise ValueError("Catalog must contain 73 unique books")
    payload = json.loads(input_path.read_text(encoding="utf-8"))
    source = payload.get("source")
    if not isinstance(source, dict) or any(not isinstance(source.get(k), str) or not source[k].strip() for k in REQUIRED_SOURCE):
        raise ValueError("Source must include edition, provenance and rights_review")
    books = payload.get("books")
    if not isinstance(books, list) or not books:
        raise ValueError("Input must contain nonempty books array")
    found, prepared, total_verses = set(), [], 0
    for book in books:
        if not isinstance(book, dict):
            raise ValueError("Invalid book entry")
        bid = book.get("id")
        if not isinstance(bid, str) or not BOOK_ID.fullmatch(bid) or bid not in expected or bid in found:
            raise ValueError(f"Unknown, unsafe or duplicate book: {bid!r}")
        found.add(bid)
        chapters = book.get("chapters")
        if not isinstance(chapters, list) or not chapters:
            raise ValueError(f"Missing chapters for {bid}")
        if (not sample and len(chapters) != expected[bid]["chapters"]) or len(chapters) > expected[bid]["chapters"]:
            raise ValueError(f"Chapter count mismatch for {bid}")
        for number, verses in enumerate(chapters, 1):
            if not isinstance(verses, list) or not verses:
                raise ValueError(f"Empty chapter: {bid} {number}")
            if any(not isinstance(v, str) or not v.strip() or "\x00" in v for v in verses):
                raise ValueError(f"Invalid verse: {bid} {number}")
            # Internal gaps cannot be detected without an edition-specific verse index.
            content = "\n".join(f"{i}. {v.strip()}" for i, v in enumerate(verses, 1)) + "\n"
            prepared.append((Path("licensed") / "es" / bid / f"{number}.txt", content))
            total_verses += len(verses)
    missing = sorted(set(expected) - found)
    if missing and not sample:
        raise ValueError(f"Missing books: {', '.join(missing)}")
    if output.exists():
        raise FileExistsError(f"Output exists; choose a new empty destination: {output}")
    output.parent.mkdir(parents=True, exist_ok=True)
    stage = Path(tempfile.mkdtemp(prefix=".torres-amat-", dir=output.parent))
    try:
        manifest = {"format_version": 2, "sample": sample, "source": source,
                    "books": len(found), "chapters": len(prepared), "verses": total_verses,
                    "missing_books": missing, "files": {}}
        for relative, content in prepared:
            dest = stage / relative
            dest.parent.mkdir(parents=True, exist_ok=True)
            dest.write_text(content, encoding="utf-8")
            manifest["files"][relative.as_posix()] = hashlib.sha256(content.encode("utf-8")).hexdigest()
        (stage / "manifest.json").write_text(json.dumps(manifest, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
        os.rename(stage, output)
    except BaseException:
        shutil.rmtree(stage, ignore_errors=True)
        raise
    print(f"{'SAMPLE ONLY' if sample else 'COMPLETE'}: {len(found)} books, {len(prepared)} chapters, {total_verses} verses; output {output}")

if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--catalog", type=Path, default=Path("comercial/catalogo-catolico.json"))
    parser.add_argument("--input", type=Path, required=True)
    parser.add_argument("--output", type=Path, required=True)
    parser.add_argument("--sample", action="store_true", help="Allow partial books/chapters for testing only")
    args = parser.parse_args()
    build(args.catalog, args.input, args.output, args.sample)
