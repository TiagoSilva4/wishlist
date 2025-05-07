#!/usr/bin/env python
"""
Script to directly send a verification email to a user.
This bypasses django-allauth's rate limiting and complex confirmation flow.
"""
import os
import django

# Set up Django environment
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from django.core.mail import send_mail
from django.contrib.auth.models import User
from django.utils.crypto import get_random_string

def main():
    # The email to send the verification to
    email = "tiagos3373@gmail.com"
    
    # Check if user exists or create one
    if User.objects.filter(email=email).exists():
        user = User.objects.get(email=email)
        print(f"Found existing user: {user.username} (Email: {email})")
    else:
        username = email.split('@')[0]
        user = User.objects.create_user(
            username=username,
            email=email,
            password="temporarypassword123"
        )
        print(f"Created new user: {user.username} (Email: {email})")
    
    # Generate a verification code/token
    verification_code = get_random_string(32)
    
    # Create verification URL
    domain = "wish-list.social"
    verification_url = f"https://{domain}/account/verify-email/{verification_code}/"
    
    # Compose the email message
    subject = "Verify Your Email Address"
    message = f"""
Hello {user.username},

Thank you for signing up! Please verify your email address by clicking the link below:

{verification_url}

If you did not request this, please ignore this email.

Best regards,
The Wishlist Team
    """
    
    from_email = "noreply@mg.wish-list.social"
    recipient_list = [email]
    
    # Send the email
    print(f"Sending verification email to {email}...")
    send_mail(
        subject, 
        message, 
        from_email, 
        recipient_list,
        fail_silently=False
    )
    
    print("\nVerification email has been sent.")
    print("Since we are using the console backend, the email is printed to the console.")
    print("Check your server logs or terminal output to see the email.")
    print(f"\nVerification URL for testing: {verification_url}")

if __name__ == "__main__":
    main() 