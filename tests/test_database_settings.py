import os
import unittest
from unittest.mock import patch

from config.settings import database_config


class DatabaseSettingsTests(unittest.TestCase):
    def test_uses_sqlite_when_database_url_is_missing(self):
        with patch.dict(os.environ, {}, clear=True):
            config = database_config()

        self.assertEqual(config["ENGINE"], "django.db.backends.sqlite3")

    def test_parses_postgres_database_url(self):
        url = "postgres://opspilot:secret@localhost:5432/opspilot_ai?sslmode=require"
        with patch.dict(os.environ, {"DATABASE_URL": url}, clear=True):
            config = database_config()

        self.assertEqual(config["ENGINE"], "django.db.backends.postgresql")
        self.assertEqual(config["NAME"], "opspilot_ai")
        self.assertEqual(config["USER"], "opspilot")
        self.assertEqual(config["PASSWORD"], "secret")
        self.assertEqual(config["HOST"], "localhost")
        self.assertEqual(config["PORT"], 5432)
        self.assertEqual(config["OPTIONS"], {"sslmode": "require"})


if __name__ == "__main__":
    unittest.main()
