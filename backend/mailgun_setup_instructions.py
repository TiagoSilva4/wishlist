#!/usr/bin/env python
"""
This script provides detailed instructions for finding your correct Mailgun API key
and verifying domain setup.
"""

def print_mailgun_setup_guide():
    """Print a detailed guide for Mailgun setup"""
    print("""
====================================
MAILGUN EMAIL INTEGRATION GUIDE
====================================

The current Mailgun API key doesn't seem to be working. Here's a guide to set up email for your application:

1. VERIFY YOUR MAILGUN ACCOUNT
   - Ensure your Mailgun account is fully verified (including credit card for free tier)
   - Verify that your domain "mg.wish-list.social" is properly set up in Mailgun

2. FIND THE CORRECT API KEY
   - Log in to your Mailgun account: https://app.mailgun.com/app/dashboard
   - Navigate to "Settings" > "API Keys"
   - You'll see two types of keys:
     a) Private API Key - For sending emails (begins with "key-")
     b) Public API Key - For validating emails (should not be used for sending)
   - Copy the PRIVATE API key (the one that starts with "key-")

3. VERIFY YOUR DOMAIN
   - In Mailgun dashboard, go to "Domains" > "mg.wish-list.social"
   - Make sure all DNS records are properly set up (green checkmarks)
   - If you're still in the Mailgun sandbox, you can only send to authorized recipients

4. UPDATE YOUR SETTINGS
   - Edit the backend/backend/settings.py file
   - Uncomment and update the Mailgun API settings section:
     ```
     EMAIL_BACKEND = 'backend.mailgun_backend.MailgunAPIEmailBackend'
     MAILGUN_API_KEY = 'key-xxxxxxxxxxxxxxxxxxxx'  # Your actual private API key
     MAILGUN_DOMAIN = 'mg.wish-list.social'
     DEFAULT_FROM_EMAIL = 'noreply@mg.wish-list.social'
     ```

5. TEST YOUR INTEGRATION
   - Run this command:
     python3 test_mailgun_backend.py your_email@example.com

6. TROUBLESHOOTING
   - If you get a 401 error: Your API key is incorrect or improperly formatted
   - If you get a 404 error: Your domain doesn't exist or isn't set up correctly
   - If you get "not an authorized recipient": Your recipient email isn't authorized in the sandbox

7. SANDBOX VS. CUSTOM DOMAIN
   - If you're using Mailgun's sandbox domain, you can only send to verified recipients
   - To send to any recipient, you need a verified custom domain
   
THE CORRECT API KEY FORMAT:
   - Your private API key should look like: key-8d915d69c015fae52bed0abcdefg1234
   - It MUST start with "key-" followed by a long alphanumeric string

BEST PRACTICE:
   For security, use environment variables instead of hardcoding API keys in settings:
   ```
   # Add this to your .env file (don't commit to git)
   MAILGUN_API_KEY=key-xxxxxxxxxxxxxxxxxxxx
   
   # Then in settings.py
   MAILGUN_API_KEY = os.environ.get('MAILGUN_API_KEY')
   ```
""")

if __name__ == "__main__":
    print_mailgun_setup_guide() 