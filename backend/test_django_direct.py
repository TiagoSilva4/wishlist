#!/usr/bin/env python3
"""
Test script that uses Django settings but calls the Mailgun API directly
"""
import os
import django
import requests

# Set up Django environment
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from django.conf import settings

def send_via_mailgun_direct():
    """Send an email directly via Mailgun API but using Django settings"""
    # Get API key from environment
    api_key = os.environ.get('MAILGUN_API_KEY')
    if not api_key:
        print("MAILGUN_API_KEY environment variable not set")
        print("Please set it with: export MAILGUN_API_KEY=your_key_here")
        return False
        
    domain = os.environ.get('MAILGUN_DOMAIN', 'mg.wish-list.social')
    recipient = os.environ.get('TEST_EMAIL', 'tiagos3373@gmail.com')
    
    # API endpoint
    url = f"https://api.mailgun.net/v3/{domain}/messages"
    
    # Email data
    data = {
        "from": f"Test <postmaster@{domain}>",
        "to": recipient,
        "subject": "Django Settings + Direct API Test",
        "text": "This is an email sent using Django settings but direct API calls."
    }
    
    print(f"Sending email to {recipient} via direct API call...")
    
    # Make the API request
    try:
        response = requests.post(
            url,
            auth=("api", api_key),
            data=data
        )
        
        print(f"Status code: {response.status_code}")
        print(f"Response: {response.text}")
        
        if response.status_code == 200:
            print("\nSuccess! Email sent successfully.")
            print("Check your inbox at: " + recipient)
            
            # Update Django settings based on what works
            print("\nRecommended Django settings:")
            print("EMAIL_BACKEND = 'backend.simple_mailgun_backend.SimpleMailgunBackend'")
            print("# Use environment variables for credentials")
            print("# export MAILGUN_API_KEY=your_api_key")
            print(f"# export MAILGUN_DOMAIN={domain}")
            print("DEFAULT_FROM_EMAIL = 'postmaster@mg.wish-list.social'")
            
            return True
        else:
            print("\nError: Failed to send email.")
            return False
            
    except Exception as e:
        print(f"\nException: {e}")
        return False

if __name__ == "__main__":
    send_via_mailgun_direct() 