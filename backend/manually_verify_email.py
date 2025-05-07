#!/usr/bin/env python
"""
Script to manually verify a user's email address.
This is useful for testing purposes or when users cannot access verification emails.
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
    if len(sys.argv) < 2:
        print("Usage: python manually_verify_email.py <email_address>")
        return
    
    email = sys.argv[1]
    
    # Check if user exists
    if not User.objects.filter(email=email).exists():
        print(f"Error: No user found with email '{email}'")
        return
    
    user = User.objects.get(email=email)
    print(f"Found user: {user.username} (Email: {email})")
    
    # Get or create email address record
    email_address, created = EmailAddress.objects.get_or_create(
        user=user,
        email=email,
        defaults={'primary': True}
    )
    
    if created:
        print(f"Created new email address record for {email}")
    
    # Check current verification status
    if email_address.verified:
        print(f"Email is already verified. No action needed.")
        return
    
    # Set verified flag and save
    email_address.verified = True
    email_address.save()
    
    print(f"Success! Email '{email}' has been verified manually.")
    print(f"User '{user.username}' can now log in with this email address.")

if __name__ == "__main__":
    main() 