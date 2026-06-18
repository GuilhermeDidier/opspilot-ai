from django.core.management.base import BaseCommand

from automation.seed import seed_demo_data


class Command(BaseCommand):
    help = "Seed OpsPilot AI with demo workflows, approvals, and audit events."

    def handle(self, *args, **options):
        seed_demo_data()
        self.stdout.write(self.style.SUCCESS("Seeded OpsPilot AI demo data."))
