from django.core.management.base import BaseCommand
from django.contrib.auth.models import User
from store.models import Profile

class Command(BaseCommand):
    help = 'Creates a profile for users that don\'t have one'

    def handle(self, *args, **options):
        users_without_profile = User.objects.filter(profile__isnull=True)
        for user in users_without_profile:
            Profile.objects.create(user=user)
            self.stdout.write(self.style.SUCCESS(f'Successfully created profile for {user.username}'))

