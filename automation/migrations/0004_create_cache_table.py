"""Create the database cache table used by the rate-limit throttles.

Doing this in a migration (rather than only via `manage.py createcachetable` in
the entrypoint) guarantees the table exists everywhere the schema is built —
including the test database — so the throttled endpoint never hits a missing
`opspilot_cache` table.
"""

from django.core.management import call_command
from django.db import migrations


def create_cache_table(apps, schema_editor):
    # createcachetable reads the CACHES setting and is idempotent.
    call_command(
        "createcachetable", database=schema_editor.connection.alias, verbosity=0
    )


class Migration(migrations.Migration):
    dependencies = [
        ("automation", "0003_approval_draft_approval_provider"),
    ]

    operations = [
        migrations.RunPython(create_cache_table, migrations.RunPython.noop),
    ]
