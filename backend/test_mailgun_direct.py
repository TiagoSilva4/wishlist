#!/usr/bin/env python3
"""
Direct test of Mailgun API using requests
"""
import requests
import os

def send_email():
    # Get API key from environment variable or prompt
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
        "subject": "Direct API Test",
        "text": "This is a direct test of the Mailgun API."
    }
    
    print(f"Sending email using Mailgun API:")
    print(f"URL: {url}")
    print(f"From: {data['from']}")
    print(f"To: {data['to']}")
    
    # Make the API request
    try:
        response = requests.post(
            url,
            auth=("api", api_key),
            data=data
        )
        
        print(f"\nStatus code: {response.status_code}")
        print(f"Response: {response.text}")
        
        if response.status_code == 200:
            print("\nSuccess! Email sent successfully.")
            return True
        else:
            print("\nError: Failed to send email.")
            
            if response.status_code == 401:
                print("Authentication Error (401):")
                print("1. Your API key might be incorrect")
                print("2. Your account might not be properly set up")
                
            return False
    except Exception as e:
        print(f"\nException: {e}")
        return False

if __name__ == "__main__":
    send_email() 