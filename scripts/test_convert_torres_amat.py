"""Self-contained converter smoke tests, no copyrighted Bible content."""
import json
import tempfile
import unittest
from pathlib import Path
from convert_torres_amat import build

class ConverterTests(unittest.TestCase):
    def setUp(self):
        self.tmp = tempfile.TemporaryDirectory()
        self.root = Path(self.tmp.name)
        self.catalog = self.root / "catalog.json"
        self.catalog.write_text(json.dumps({"books": [{"id":"GEN","chapters":2}] + [{"id":f"B{i:02}","chapters":1} for i in range(72)]}), encoding="utf-8")
        self.input = self.root / "input.json"
        self.payload = {"source":{"edition":"fixture","provenance":"synthetic","rights_review":"synthetic data"},
                        "books":[{"id":"GEN","chapters":[["example 1","example 2"]]}]}
    def tearDown(self):
        self.tmp.cleanup()
    def run_build(self, sample=True):
        self.input.write_text(json.dumps(self.payload), encoding="utf-8")
        build(self.catalog, self.input, self.root / "out", sample=sample)
    def test_sample_writes_manifest(self):
        self.run_build()
        m = json.loads((self.root / "out" / "manifest.json").read_text())
        self.assertTrue(m["sample"])
        self.assertEqual(m["verses"], 2)
        self.assertTrue((self.root / "out" / "licensed/es/GEN/1.txt").exists())
    def test_complete_rejects_missing_books_without_output(self):
        with self.assertRaises(ValueError):
            self.run_build(sample=False)
        self.assertFalse((self.root / "out").exists())
    def test_rejects_empty_verse(self):
        self.payload["books"][0]["chapters"] = [[""]]
        with self.assertRaises(ValueError):
            self.run_build()
    def test_rejects_existing_destination(self):
        (self.root / "out").mkdir()
        with self.assertRaises(FileExistsError):
            self.run_build()
    def test_complete_fixture(self):
        self.payload["books"][0]["chapters"].append(["example 3"])
        self.payload["books"] += [{"id":f"B{i:02}","chapters":[["example"]]} for i in range(72)]
        self.run_build(sample=False)
        m = json.loads((self.root / "out" / "manifest.json").read_text())
        self.assertFalse(m["sample"])
        self.assertEqual(m["books"], 73)
        self.assertEqual(m["chapters"], 74)

if __name__ == "__main__":
    unittest.main()
