#!/usr/bin/env python3
"""
Test script that uses Django's send_mail with the configured settings
"""
import os
import django

# Set up Django environment
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from django.core.mail import send_mail
from django.conf import settings

def test_send_mail():
    """Test sending an email with Django's send_mail"""
    recipient = "tiagos3373@gmail.com"
    
    print(f"Sending test email to {recipient} via Django's send_mail...")
    print(f"Using EMAIL_BACKEND: {settings.EMAIL_BACKEND}")
    
    try:
        result = send_mail(
            subject="Django Settings Test",
            message="This is a test email sent via Django's send_mail function with the configured settings.",
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[recipient],
            fail_silently=False
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
    test_send_mail() 