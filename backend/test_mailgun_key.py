#!/usr/bin/env python
"""
Script to test sending emails using Mailgun's API with a specified API key.
"""
import requests
import os

def send_test_email():
    # Get API key from environment variable or prompt user
    raw_key = os.environ.get('MAILGUN_API_KEY', '')
    
    # If not available, prompt user
    if not raw_key:
        print("No MAILGUN_API_KEY environment variable found.")
        print("Please set the MAILGUN_API_KEY environment variable or provide it now:")
        raw_key = input("Enter your Mailgun API key: ").strip()
    
    # Ensure API key has required 'key-' prefix
    api_key = f"key-{raw_key}" if not raw_key.startswith('key-') else raw_key
    
    # Domain from environment or default
    domain = os.environ.get('MAILGUN_DOMAIN', 'mg.wish-list.social')
    url = f"https://api.mailgun.net/v3/{domain}/messages"
    
    # Email data - exactly matching the Java example
    recipient = os.environ.get('TEST_EMAIL', 'tiagos3373@gmail.com')
    data = {
        "from": f"Mailgun Test <postmaster@{domain}>",
        "to": f"Test User <{recipient}>",
        "subject": "Hello from Mailgun Test",
        "text": "This is a test email sent with Mailgun! If you received this, the API is working correctly."
    }
    
    print("Sending Mailgun API request with the following data:")
    print(f"URL: {url}")
    print(f"API Key (last 5 chars): ...{api_key[-5:] if len(api_key) > 5 else 'key too short'}")
    print(f"API Key format: {'correct (has key- prefix)' if api_key.startswith('key-') else 'incorrect (missing key- prefix)'}")
    print(f"From: {data['from']}")
    print(f"To: {data['to']}")
    
    # Send the request
    try:
        response = requests.post(
            url,
            auth=("api", api_key),
            data=data
        )
        
        # Print response details
        print(f"\nStatus code: {response.status_code}")
        print(f"Response body: {response.text}")
        
        if response.status_code == 200:
            print("\nSuccess! Email sent successfully.")
            return True
        else:
            print("\nError: Failed to send email.")
            return False
            
    except Exception as e:
        print(f"\nException occurred: {str(e)}")
        return False

if __name__ == "__main__":
    send_test_email() 