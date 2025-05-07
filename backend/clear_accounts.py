#!/usr/bin/env python
"""
Script to clear all user accounts from the database.
For safety, this script will prompt for confirmation before deletion.
"""
import os
import django
import sys

# Set up Django environment
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from django.contrib.auth.models import User
from allauth.account.models import EmailAddress

def main():
    # Get all users
    users = User.objects.all()
    
    # Exclude superusers by default
    regular_users = users.exclude(is_superuser=True)
    superusers = users.filter(is_superuser=True)
    
    print(f"Found {regular_users.count()} regular users and {superusers.count()} superusers.")
    
    # List all users
    print("\nRegular users:")
    for user in regular_users:
        print(f"- {user.username} (Email: {user.email}, ID: {user.id})")
    
    print("\nSuperusers (will not be deleted by default):")
    for user in superusers:
        print(f"- {user.username} (Email: {user.email}, ID: {user.id})")
    
    # Confirm deletion
    if regular_users.count() > 0:
        confirm = input("\nAre you sure you want to delete all regular users? [y/N]: ")
        
        if confirm.lower() == 'y':
            # Delete EmailAddress objects first (foreign key constraint)
            email_addresses = EmailAddress.objects.filter(user__in=regular_users)
            email_count = email_addresses.count()
            email_addresses.delete()
            
            # Then delete users
            deleted_count = regular_users.delete()[0]
            
            print(f"\nDeleted {email_count} email addresses and {deleted_count} users.")
            print("All regular user accounts have been removed.")
        else:
            print("Operation cancelled.")
    else:
        print("\nNo regular users to delete.")
    
    # Option to delete superusers too
    if superusers.count() > 0:
        confirm = input("\nDo you also want to delete superusers? This is potentially dangerous! [y/N]: ")
        
        if confirm.lower() == 'y':
            # Extra confirmation for superusers
            confirm_again = input("Are you REALLY sure? Type 'DELETE SUPERUSERS' to confirm: ")
            
            if confirm_again == 'DELETE SUPERUSERS':
                # Delete EmailAddress objects first
                email_addresses = EmailAddress.objects.filter(user__in=superusers)
                email_count = email_addresses.count()
                email_addresses.delete()
                
                # Then delete superusers
                deleted_count = superusers.delete()[0]
                
                print(f"\nDeleted {email_count} email addresses and {deleted_count} superusers.")
                print("All superuser accounts have been removed.")
            else:
                print("Superuser deletion cancelled.")
        else:
            print("Superuser deletion cancelled.")

if __name__ == "__main__":
    main() 