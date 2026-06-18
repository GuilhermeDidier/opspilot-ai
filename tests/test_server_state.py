import tempfile
import unittest
from copy import deepcopy
from pathlib import Path

import server


class ServerStateTests(unittest.TestCase):
    def setUp(self):
        self.tmpdir = tempfile.TemporaryDirectory()
        self.original_state = deepcopy(server.STATE)
        self.original_data_dir = server.DATA_DIR
        self.original_state_file = server.STATE_FILE
        server.DATA_DIR = Path(self.tmpdir.name)
        server.STATE_FILE = server.DATA_DIR / "state.json"
        server.STATE = deepcopy(server.DEFAULT_STATE)

    def tearDown(self):
        server.STATE = self.original_state
        server.DATA_DIR = self.original_data_dir
        server.STATE_FILE = self.original_state_file
        self.tmpdir.cleanup()

    def test_snapshot_includes_workflows_and_state(self):
        payload = server.snapshot()

        self.assertIn("workflows", payload)
        self.assertIn("state", payload)
        self.assertIn("revenue", payload["workflows"])
        self.assertGreater(len(payload["state"]["approvals"]), 0)

    def test_add_event_persists_audit_log(self):
        server.add_event("Unit test event", "State changes are persisted.")

        self.assertEqual(server.STATE["events"][0][1], "Unit test event")
        self.assertTrue(server.STATE_FILE.exists())

    def test_reset_state_restores_default_dataset(self):
        server.STATE["approvals"].clear()

        server.reset_state()

        self.assertEqual(len(server.STATE["approvals"]), len(server.DEFAULT_STATE["approvals"]))


if __name__ == "__main__":
    unittest.main()
