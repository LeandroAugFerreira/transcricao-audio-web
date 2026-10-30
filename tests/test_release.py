import tempfile
import unittest
from pathlib import Path

from scripts.validate_release import ROOT, validate


class ReleaseValidationTests(unittest.TestCase):
    def setUp(self):
        self.temp = tempfile.TemporaryDirectory()
        self.addCleanup(self.temp.cleanup)
        self.root = Path(self.temp.name)
        for name in ("app.py", "installer.iss", "version_info.txt"):
            (self.root / name).write_bytes((ROOT / name).read_bytes())

    def replace(self, name, old, new):
        path = self.root / name
        source = path.read_text(encoding="utf-8-sig")
        self.assertIn(old, source)
        path.write_text(source.replace(old, new), encoding="utf-8")

    def test_matching_release(self):
        version = validate(self.root)
        self.assertEqual(validate(self.root, tag=f"V{version}"), version)

    def test_wrong_tag(self):
        with self.assertRaisesRegex(ValueError, "tag"):
            validate(self.root, tag="v0.0.0")

    def test_old_installer_version(self):
        version = validate(self.root)
        self.replace("installer.iss", f'MyAppVersion "{version}"', 'MyAppVersion "0.0.0"')
        with self.assertRaisesRegex(ValueError, "versão do instalador"):
            validate(self.root)

    def test_old_executable_string_version(self):
        version = validate(self.root)
        self.replace("version_info.txt", f"'{version}'", "'0.0.0'")
        with self.assertRaisesRegex(ValueError, "metadados"):
            validate(self.root)

    def test_old_executable_numeric_version(self):
        version = validate(self.root)
        numeric = ", ".join(version.split(".")) + ", 0, 0"
        self.replace("version_info.txt", f"filevers=({numeric})", "filevers=(0, 0, 0, 0)")
        with self.assertRaisesRegex(ValueError, "metadados"):
            validate(self.root)

    def test_fixed_output_filename(self):
        self.replace("installer.iss", "OutputBaseFilename=TranscricaoEmTexto-Setup-V{#MyAppVersion}",
                     "OutputBaseFilename=TranscricaoEmTexto-Setup")
        with self.assertRaisesRegex(ValueError, "OutputBaseFilename"):
            validate(self.root)


if __name__ == "__main__":
    unittest.main()
