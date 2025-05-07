#!/usr/bin/env python
"""
Test script for authentication emails in the Wishlist application.
This script demonstrates how the authentication-related emails look
when sent from the application.
"""
import os
import django

# Set up Django environment
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from django.contrib.auth.models import User
from django.contrib.auth.tokens import default_token_generator
from django.utils.http import urlsafe_base64_encode
from django.utils.encoding import force_bytes
from django.core.mail import EmailMultiAlternatives
from django.template.loader import render_to_string
from allauth.account.models import EmailAddress

def main():
    print("Testing authentication emails:")
    
    # Create a test user if it doesn't exist
    email = 'test@example.com'
    if not User.objects.filter(email=email).exists():
        user = User.objects.create_user(
            username='testuser',
            email=email,
            password='testpassword'
        )
        print(f"Created test user: {user.username} with email: {email}")
    else:
        user = User.objects.get(email=email)
        print(f"Found existing user: {user.username} with email: {email}")
    
    # Make sure the email address is registered
    if not EmailAddress.objects.filter(user=user, email=email).exists():
        EmailAddress.objects.create(user=user, email=email, primary=True)
        print(f"Added email address for user")
    
    # 1. Test password reset email
    print("\n=== PASSWORD RESET EMAIL ===")
    
    context = {
        'user': user,
        'uid': urlsafe_base64_encode(force_bytes(user.pk)),
        'token': default_token_generator.make_token(user),
        'protocol': 'https',
        'domain': 'wish-list.social',
    }
    
    # Plain text version
    email_text = """
    Hello,
    
    You're receiving this email because you requested a password reset for your user account.
    
    Please go to the following page and choose a new password:
    {protocol}://{domain}/account/password/reset/key/{uid}/{token}/
    
    Your username, in case you've forgotten: {username}
    
    Thanks for using our site!
    """.format(
        protocol=context['protocol'],
        domain=context['domain'],
        uid=context['uid'],
        token=context['token'],
        username=user.username
    )
    
    print(email_text)
    
    # 2. Test email verification
    print("\n=== EMAIL VERIFICATION ===")
    
    verification_text = """
    Hello from Wishlist!
    
    You're receiving this e-mail because user {username} has given your e-mail address to register an account.
    
    To confirm this is correct, go to {protocol}://{domain}/account/verify-email/{key}/
    
    Thank you for using Wishlist!
    """.format(
        username=user.username,
        protocol=context['protocol'],
        domain=context['domain'],
        key="verification-key-would-be-here"
    )
    
    print(verification_text)
    
    print("\nEmail testing complete. In production, these would be sent via SMTP.")

if __name__ == "__main__":
    main() 