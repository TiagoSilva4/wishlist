#!/usr/bin/env python
"""
Script to completely reset the authentication system.
This will delete all users and related auth data.

WARNING: This is a destructive operation that cannot be undone.
Only use this in development or when setting up a fresh system.
"""
import os
import django
import sys

# Set up Django environment
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from django.contrib.auth.models import User, Group, Permission
from allauth.account.models import EmailAddress, EmailConfirmation
from allauth.socialaccount.models import SocialAccount, SocialToken, SocialApp
from django.contrib.sessions.models import Session

def main():
    print("===== AUTHENTICATION SYSTEM RESET =====")
    print("WARNING: This will delete ALL authentication data!")
    print("This includes: users, email addresses, social accounts, sessions")
    
    # Clean related models first due to foreign key constraints
    
    # 1. Clean allauth related models
    email_confirmation_count = EmailConfirmation.objects.all().count()
    EmailConfirmation.objects.all().delete()
    print(f"Deleted {email_confirmation_count} email confirmations")
    
    email_address_count = EmailAddress.objects.all().count()
    EmailAddress.objects.all().delete()
    print(f"Deleted {email_address_count} email addresses")
    
    social_token_count = SocialToken.objects.all().count()
    SocialToken.objects.all().delete()
    print(f"Deleted {social_token_count} social tokens")
    
    social_account_count = SocialAccount.objects.all().count()
    SocialAccount.objects.all().delete()
    print(f"Deleted {social_account_count} social accounts")
    
    # 2. Clean sessions
    session_count = Session.objects.all().count()
    Session.objects.all().delete()
    print(f"Deleted {session_count} sessions")
    
    # 3. Finally delete users
    # List users before deletion
    users = User.objects.all()
    print("\nUsers to be deleted:")
    for user in users:
        superuser_status = " (SUPERUSER)" if user.is_superuser else ""
        print(f"- {user.username} (Email: {user.email}, ID: {user.id}){superuser_status}")
    
    user_count = users.count()
    users.delete()
    print(f"Deleted {user_count} users")
    
    print("\n===== AUTHENTICATION SYSTEM RESET COMPLETE =====")
    print("The system has been reset to a clean state.")
    print("You can now create new users and set up authentication as needed.")

if __name__ == "__main__":
    main() 