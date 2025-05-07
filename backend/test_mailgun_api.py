#!/usr/bin/env python
"""
Script to test sending emails using Mailgun's API directly instead of SMTP.
This approach may be more reliable when SMTP ports are blocked by network restrictions.
"""
import os
import requests
import sys

def send_mailgun_email(recipient_email, subject, text, api_key=None):
    """
    Send email using Mailgun's API
    
    Args:
        recipient_email: Email address of the recipient
        subject: Email subject
        text: Email body text
        api_key: Mailgun API key (optional, defaults to hardcoded key)
    
    Returns:
        tuple: (success_boolean, response_data)
    """
    # Use the API key from parameter, environment, or prompt user
    if api_key is None:
        # Try to get from environment variable
        raw_key = os.environ.get('MAILGUN_API_KEY', '')
        
        # If not available, prompt user
        if not raw_key:
            print("No MAILGUN_API_KEY environment variable found.")
            print("Please set the MAILGUN_API_KEY environment variable or provide it now:")
            raw_key = input("Enter your Mailgun API key: ").strip()
        
        # Modern Mailgun API keys don't need the 'key-' prefix
        # Use the API key exactly as provided by Mailgun
        api_key = raw_key
    
    # Get domain from environment or use default
    mailgun_domain = os.environ.get('MAILGUN_DOMAIN', 'mg.wish-list.social')
    mailgun_url = f'https://api.mailgun.net/v3/{mailgun_domain}/messages'
    
    # Prepare the email data
    email_data = {
        'from': f'Wishlist App <noreply@{mailgun_domain}>',
        'to': recipient_email,
        'subject': subject,
        'text': text
    }
    
    # Make a temporary print of the API key ending for debugging (should be removed in production)
    if len(api_key) > 10:
        print(f"Using API key ending in: ...{api_key[-5:]}")
    else:
        print("Warning: API key seems too short")
    
    # Send the request
    print(f"Sending email to {recipient_email}...")
    try:
        response = requests.post(
            mailgun_url,
            auth=('api', api_key),
            data=email_data
        )
        
        # Print the response
        print(f"Status code: {response.status_code}")
        print(f"Response: {response.text}")
        
        if response.status_code == 200:
            return True, response.json()
        else:
            return False, response.text
    
    except Exception as e:
        print(f"Error: {str(e)}")
        return False, str(e)

def main():
    """Main function that sends a test email"""
    if len(sys.argv) < 2:
        email = "tiagos3373@gmail.com"  # Default recipient
        print(f"No email provided, using default: {email}")
    else:
        email = sys.argv[1]
    
    # Check if API key is provided as an environment variable
    api_key = os.environ.get('API_KEY') or os.environ.get('MAILGUN_API_KEY')
    if api_key:
        print("Using API key from environment variable")
        # Modern Mailgun API keys don't need the 'key-' prefix
        # Use API key exactly as provided by Mailgun
    else:
        print("No API_KEY or MAILGUN_API_KEY environment variable found, will prompt for key")
    
    # Prepare email content
    subject = "Test Email from Wishlist App"
    text = f"""
Hello,

This is a test email sent from the Wishlist application using the Mailgun API.
If you received this, the API integration is working correctly.

Best regards,
The Wishlist Team
"""
    
    # Send the email
    success, response = send_mailgun_email(email, subject, text, api_key)
    
    if success:
        print("\nEmail sent successfully!")
        print(f"Response data: {response}")
    else:
        print("\nFailed to send email.")
        print(f"Error: {response}")

if __name__ == "__main__":
    main() 