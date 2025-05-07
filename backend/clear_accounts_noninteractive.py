#!/usr/bin/env python
"""
Script to clear all user accounts from the database without interactive prompts.
This script will remove all non-superuser accounts by default.
"""
import os
import django
import sys

# Set up Django environment
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from django.contrib.auth.models import User
from allauth.account.models import EmailAddress
from django.db.models import Q

def main():
    # Parse command-line arguments
    include_superusers = "--all" in sys.argv
    
    # Get all users
    if include_superusers:
        users_to_delete = User.objects.all()
        deletion_type = "all users (including superusers)"
    else:
        users_to_delete = User.objects.filter(Q(is_superuser=False) | Q(username='testuser'))
        deletion_type = "non-superuser accounts and test accounts"
    
    # Get count before deletion
    user_count = users_to_delete.count()
    
    # List users to be deleted
    print(f"Preparing to delete {user_count} {deletion_type}:")
    for user in users_to_delete:
        superuser_status = " (SUPERUSER)" if user.is_superuser else ""
        print(f"- {user.username} (Email: {user.email}, ID: {user.id}){superuser_status}")
    
    # Delete EmailAddress objects first (foreign key constraint)
    email_addresses = EmailAddress.objects.filter(user__in=users_to_delete)
    email_count = email_addresses.count()
    email_addresses.delete()
    
    # Then delete users
    deleted_count = users_to_delete.delete()[0]
    
    print(f"\nDeleted {email_count} email addresses and {deleted_count} user records.")
    print(f"All {deletion_type} have been removed.")

if __name__ == "__main__":
    main() 