#!/usr/bin/env python
"""
Test script to manually create a user account and trigger verification email.
This will help verify if the email verification system is working correctly.
"""
import os
import django
import sys

# Set up Django environment
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from django.contrib.auth.models import User
from allauth.account.models import EmailAddress
from allauth.account.utils import send_email_confirmation

def main():
    email = "tiagos3373@gmail.com"  # Use the email that was attempted
    
    # Check if user already exists
    if User.objects.filter(email=email).exists():
        user = User.objects.get(email=email)
        print(f"User already exists: {user.username} (Email: {email})")
    else:
        # Create a new user
        username = email.split("@")[0]
        user = User.objects.create_user(
            username=username,
            email=email,
            password="temporarypassword123"
        )
        print(f"Created new user: {username} (Email: {email})")
    
    # Check if email address is registered
    email_address = EmailAddress.objects.filter(user=user, email=email).first()
    if not email_address:
        email_address = EmailAddress.objects.create(
            user=user,
            email=email,
            primary=True
        )
        print(f"Created email address record for {email}")
    
    # Check if email is verified
    if email_address.verified:
        print(f"Email {email} is already verified")
        
        # Force resending the verification email if needed
        if "--force" in sys.argv:
            email_address.verified = False
            email_address.save()
            print(f"Reset verification status for {email}")
    
    # Send verification email
    print(f"Sending verification email to {email}...")
    
    # Create a more complete mock request object
    class MockRequest:
        def __init__(self):
            self.META = {'HTTP_HOST': 'wish-list.social'}
            self.scheme = 'https'
            self.method = 'POST'  # Add method attribute
            self.user = user
            self.session = {}
            
        def is_secure(self):
            return True
            
        def get_host(self):
            return self.META['HTTP_HOST']
    
    request = MockRequest()
    
    # Directly create and send the email confirmation
    from allauth.account.adapter import get_adapter
    from allauth.account.models import EmailConfirmation
    
    # Get the email confirmation key
    confirmation = EmailConfirmation.create(email_address)
    confirmation.sent = django.utils.timezone.now()
    confirmation.save()
    
    # Get the confirmation URL
    adapter = get_adapter()
    activate_url = adapter.get_email_confirmation_url(request, confirmation)
    
    # Send the confirmation email
    adapter.send_confirmation_mail(request, email_address, signup=True)
    
    print("\nVerification email has been generated.")
    print("If you're using the console email backend, check your server logs.")
    print("If you're using SMTP, check your email inbox or spam folder.")
    print(f"\nVerification URL: {activate_url}")

if __name__ == "__main__":
    main() 