#!/usr/bin/env python3
"""
Test script for sending email via Django using Mailgun API backend
"""
import os
import django

# Set up Django environment
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from django.core.mail import send_mail
from django.conf import settings
from backend.mailgun_backend import MailgunAPIEmailBackend

def test_django_email():
    """Test sending an email via Django using Mailgun API backend"""
    # Get API key from environment variable
    api_key = os.environ.get('MAILGUN_API_KEY')
    if not api_key:
        print("MAILGUN_API_KEY environment variable not set")
        print("Please set it with: export MAILGUN_API_KEY=your_key_here")
        return False
        
    domain = os.environ.get('MAILGUN_DOMAIN', 'mg.wish-list.social')
    recipient = os.environ.get('TEST_EMAIL', 'tiagos3373@gmail.com')
    
    # Create a backend instance
    backend = MailgunAPIEmailBackend(
        api_key=api_key,
        domain=domain
    )
    
    print(f"Sending test email to {recipient} via Django+Mailgun...")
    
    # Use Django's send_mail function with our backend
    try:
        result = send_mail(
            subject="Django Mailgun Test",
            message="This is a test email sent via Django with the Mailgun API backend.",
            from_email=f"Test <postmaster@{domain}>",
            recipient_list=[recipient],
            fail_silently=False,
            connection=backend
        )
        
        if result > 0:
            print(f"Success! Sent {result} email(s)")
            print("Check your inbox at: " + recipient)
            return True
        else:
            print("Error: No emails were sent")
            return False
            
    except Exception as e:
        print(f"Exception occurred: {str(e)}")
        return False

if __name__ == "__main__":
    test_django_email() 