#!/usr/bin/env python
"""
Test script for the custom Mailgun API backend.
This script will temporarily configure Django to use our custom backend.
"""
import os
import django
import sys

# Set up Django environment
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from django.core.mail import send_mail, EmailMessage
from django.conf import settings
from backend.mailgun_backend import MailgunAPIEmailBackend

def test_mailgun_api():
    """Test sending an email using the Mailgun API backend"""
    if len(sys.argv) < 2:
        recipient = os.environ.get('TEST_EMAIL', 'tiagos3373@gmail.com')  # Default recipient
        print(f"No recipient provided, using default: {recipient}")
    else:
        recipient = sys.argv[1]
    
    # API key from environment or prompt user
    api_key = os.environ.get('MAILGUN_API_KEY', '')
    
    # If not available, prompt user
    if not api_key:
        print("No MAILGUN_API_KEY environment variable found.")
        print("Please set the MAILGUN_API_KEY environment variable or provide it now:")
        api_key = input("Enter your Mailgun API key: ").strip()
    
    # Print last few characters of the key for verification
    if len(api_key) > 10:
        print(f"Using API key (last 5 chars): ...{api_key[-5:]}")
    else:
        print("Warning: API key seems too short")
    
    # Create a custom backend instance
    backend = MailgunAPIEmailBackend(
        api_key=api_key,
        domain=os.environ.get('MAILGUN_DOMAIN', 'mg.wish-list.social'),
        fail_silently=False
    )
    
    # Create an email message
    subject = "Test Email - Mailgun API Backend"
    message = """
Hello,

This is a test email sent using the custom Mailgun API backend.
If you received this, our API integration is working properly!

Best regards,
The Wishlist Team
    """
    from_email = "Wishlist App <noreply@mg.wish-list.social>"
    
    print(f"Sending test email to {recipient}...")
    
    # Option 1: Using EmailMessage
    email = EmailMessage(
        subject=subject,
        body=message,
        from_email=from_email,
        to=[recipient],
        headers={'X-Custom-Header': 'Test Message'}
    )
    
    # Send the email using our custom backend
    try:
        num_sent = backend.send_messages([email])
        if num_sent > 0:
            print(f"Success! Sent {num_sent} email(s)")
        else:
            print("Error: Failed to send email")
    except Exception as e:
        print(f"Exception occurred: {str(e)}")

if __name__ == "__main__":
    test_mailgun_api() 