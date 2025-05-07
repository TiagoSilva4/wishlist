#!/usr/bin/env python
"""
Script to test sending an email using Mailgun's API following their official documentation.
https://documentation.mailgun.com/en/latest/quickstart-sending.html
"""
import os
import requests

def send_simple_message():
    # Get API key from environment variable
    raw_key = os.environ.get('MAILGUN_API_KEY', '')
    
    # If not available, prompt user
    if not raw_key:
        print("No MAILGUN_API_KEY environment variable found.")
        print("Please set the MAILGUN_API_KEY environment variable or provide it now:")
        raw_key = input("Enter your Mailgun API key: ").strip()
    
    # API key - ensure it has the required 'key-' prefix
    api_key = f"key-{raw_key}" if not raw_key.startswith('key-') else raw_key
    
    # Domain from environment or default
    domain = os.environ.get('MAILGUN_DOMAIN', 'mg.wish-list.social')
    
    # Get recipient email from environment or default
    recipient = os.environ.get('TEST_EMAIL', 'tiagos3373@gmail.com')
    
    # This exact format follows Mailgun's documentation
    return requests.post(
        f"https://api.mailgun.net/v3/{domain}/messages",
        auth=("api", api_key),
        data={"from": f"Excited User <mailgun@{domain}>",
              "to": [recipient],
              "subject": "Hello from Mailgun Documentation Example",
              "text": "This is a test email sent using the format from Mailgun's official documentation."})

def main():
    print("Testing Mailgun API using format from official documentation...")
    
    # Try sending the email
    try:
        response = send_simple_message()
        
        # Print response information
        print(f"Status code: {response.status_code}")
        print(f"Response body: {response.text}")
        
        if response.status_code == 200:
            print("\nSuccess! Email sent according to Mailgun docs format.")
        else:
            print("\nError: Failed to send email.")
            
            # Additional debugging info for common issues
            if response.status_code == 401:
                print("Authentication Error (401): Check that your API key is correct and properly formatted.")
                print("API keys should start with 'key-' prefix.")
            elif response.status_code == 404:
                print("Not Found Error (404): Check that your domain is correct.")
                
    except Exception as e:
        print(f"\nException occurred: {str(e)}")

if __name__ == "__main__":
    main() 