#!/usr/bin/env python
"""
Comprehensive Email Integration Testing Script

This script tests all available email sending methods:
1. Django's built-in console backend (for development)
2. Django's SMTP backend (for Mailgun SMTP)
3. Custom Mailgun API backend

It provides detailed debugging output and recommendations.
"""
import os
import sys
import django
import time
import requests

# Set up Django environment
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from django.core.mail import send_mail, EmailMessage
from django.conf import settings

def print_header(title):
    """Print a formatted header"""
    print("\n" + "=" * 70)
    print(f" {title} ".center(70, '='))
    print("=" * 70)

def print_section(title):
    """Print a section header"""
    print("\n" + "-" * 60)
    print(f" {title} ".center(60, '-'))
    print("-" * 60)

def test_console_backend(recipient):
    """Test the Django console email backend"""
    print_section("Testing Console Backend")
    
    # Temporarily set backend to console
    original_backend = getattr(settings, 'EMAIL_BACKEND', None)
    settings.EMAIL_BACKEND = 'django.core.mail.backends.console.EmailBackend'
    
    try:
        print(f"Sending email to {recipient} via console...")
        send_mail(
            subject="Console Backend Test",
            message="This is a test email from the console backend.",
            from_email="noreply@wish-list.social",
            recipient_list=[recipient],
            fail_silently=False
        )
        print("Console backend test completed successfully.")
        print("The email content appears above ☝️ (not actually sent)")
        success = True
    except Exception as e:
        print(f"Error using console backend: {str(e)}")
        success = False
    
    # Restore original backend
    if original_backend:
        settings.EMAIL_BACKEND = original_backend
    
    return success

def test_smtp_backend(recipient):
    """Test the Django SMTP backend with Mailgun"""
    print_section("Testing SMTP Backend")
    
    # Save original settings
    original_backend = getattr(settings, 'EMAIL_BACKEND', None)
    
    # SMTP settings for testing
    settings.EMAIL_BACKEND = 'django.core.mail.backends.smtp.EmailBackend'
    settings.EMAIL_HOST = 'smtp.mailgun.org'
    settings.EMAIL_PORT = 587
    settings.EMAIL_USE_TLS = True
    settings.EMAIL_HOST_USER = os.environ.get('MAILGUN_SMTP_USERNAME', 'postmaster@mg.wish-list.social')
    settings.EMAIL_HOST_PASSWORD = os.environ.get('MAILGUN_SMTP_PASSWORD', '')
    
    print("SMTP Configuration:")
    print(f"  Host: {settings.EMAIL_HOST}")
    print(f"  Port: {settings.EMAIL_PORT}")
    print(f"  TLS: {settings.EMAIL_USE_TLS}")
    print(f"  User: {settings.EMAIL_HOST_USER}")
    print(f"  Password: {'*****' if settings.EMAIL_HOST_PASSWORD else 'Not Set - Please set MAILGUN_SMTP_PASSWORD env var'}")
    
    try:
        print(f"\nSending email to {recipient} via SMTP...")
        print("(This might take a few seconds or time out if port 587 is blocked)")
        
        # Set a timeout to avoid long waits
        os.environ['DJANGO_EMAIL_TIMEOUT'] = '10'  # 10 second timeout
        
        start_time = time.time()
        send_mail(
            subject="SMTP Backend Test",
            message="This is a test email sent via SMTP.",
            from_email=f"noreply@mg.wish-list.social",
            recipient_list=[recipient],
            fail_silently=False
        )
        
        elapsed = time.time() - start_time
        print(f"SMTP email sent successfully in {elapsed:.2f} seconds!")
        success = True
    except Exception as e:
        print(f"Error using SMTP backend: {str(e)}")
        success = False
        
        if "timed out" in str(e).lower() or "timeout" in str(e).lower():
            print("\nSMTP connection timed out. This usually means:")
            print("1. Port 587 might be blocked by your network/firewall")
            print("2. There might be connectivity issues with Mailgun's SMTP servers")
            print("\nRecommendation: Try the Mailgun API method instead of SMTP")
    
    # Restore original settings
    if original_backend:
        settings.EMAIL_BACKEND = original_backend
    
    return success

def test_mailgun_api_direct(recipient, api_key=None):
    """Test sending an email directly via the Mailgun API (no Django)"""
    print_section("Testing Direct Mailgun API")
    
    # Get API key
    if api_key is None:
        api_key = os.environ.get('MAILGUN_API_KEY', '')
        
        # If not available, prompt user
        if not api_key:
            print("No MAILGUN_API_KEY environment variable found.")
            print("Please set the MAILGUN_API_KEY environment variable or provide it now:")
            api_key = input("Enter your Mailgun API key: ").strip()
    
    # Ensure API key has required 'key-' prefix
    if not api_key.startswith('key-'):
        api_key = f'key-{api_key}'
    
    domain = os.environ.get('MAILGUN_DOMAIN', 'mg.wish-list.social')
    url = f'https://api.mailgun.net/v3/{domain}/messages'
    
    print("Mailgun API Configuration:")
    print(f"  Domain: {domain}")
    print(f"  API Key: {'*****' if api_key else 'Not set'}")
    print(f"  API Key Format: {'✅ Correct (has key- prefix)' if api_key.startswith('key-') else '❌ Incorrect (missing key- prefix)'}")
    
    data = {
        'from': f'Wishlist App <noreply@{domain}>',
        'to': recipient,
        'subject': 'Direct Mailgun API Test',
        'text': 'This is a test email sent directly through the Mailgun API.'
    }
    
    try:
        print(f"\nSending email to {recipient} via Mailgun API...")
        response = requests.post(
            url,
            auth=('api', api_key),
            data=data,
            timeout=10
        )
        
        print(f"Status code: {response.status_code}")
        
        if response.status_code == 200:
            print("Direct Mailgun API test successful!")
            print(f"Response: {response.text}")
            success = True
        else:
            print(f"Error response: {response.text}")
            success = False
            
            if response.status_code == 401:
                print("\nAuthentication failed (401 error). Possible causes:")
                print("1. The API key is incorrect")
                print("2. The API key is missing the 'key-' prefix")
                print("3. The API key has been revoked or is restricted")
            elif response.status_code == 404:
                print("\nDomain not found (404 error). Possible causes:")
                print("1. The domain 'mg.wish-list.social' is not registered with your account")
                print("2. The domain isn't properly verified in Mailgun")
    except Exception as e:
        print(f"Exception: {str(e)}")
        success = False
    
    return success

def test_mailgun_backend(recipient, api_key=None):
    """Test the custom Mailgun API backend"""
    print_section("Testing Custom Mailgun API Backend")
    
    try:
        from backend.mailgun_backend import MailgunAPIEmailBackend
        
        # Get API key
        if api_key is None:
            api_key = os.environ.get('MAILGUN_API_KEY', '')
            
            # If not available, prompt user
            if not api_key:
                print("No MAILGUN_API_KEY environment variable found.")
                print("Please set the MAILGUN_API_KEY environment variable or provide it now:")
                api_key = input("Enter your Mailgun API key: ").strip()
        
        # Create backend instance
        backend = MailgunAPIEmailBackend(
            api_key=api_key,
            domain=os.environ.get('MAILGUN_DOMAIN', 'mg.wish-list.social'),
            fail_silently=False
        )
        
        print(f"Using API key ending in: ...{backend.api_key[-5:] if len(backend.api_key) > 5 else ''}")
        print(f"API Key Format: {'✅ Correct (has key- prefix)' if backend.api_key.startswith('key-') else '❌ Incorrect (missing key- prefix)'}")
        
        # Create email message
        email = EmailMessage(
            subject="Custom Backend Test",
            body="This is a test email sent via the custom Mailgun API backend.",
            from_email="noreply@mg.wish-list.social",
            to=[recipient]
        )
        
        # Send the email
        print(f"\nSending email to {recipient} via custom backend...")
        result = backend.send_messages([email])
        
        if result > 0:
            print("Custom Mailgun backend test successful!")
            success = True
        else:
            print("Custom Mailgun backend test failed.")
            success = False
    except ImportError:
        print("The custom Mailgun backend is not available.")
        print("Make sure backend/mailgun_backend.py exists.")
        success = False
    except Exception as e:
        print(f"Error using custom Mailgun backend: {str(e)}")
        success = False
    
    return success

def print_recommendations(console_success, smtp_success, api_direct_success, api_backend_success):
    """Print recommendations based on test results"""
    print_header("RECOMMENDATIONS")
    
    print("\nTest Results:")
    print(f"✓ Console Backend: {'✅ Working' if console_success else '❌ Failed'}")
    print(f"✓ SMTP Backend: {'✅ Working' if smtp_success else '❌ Failed'}")
    print(f"✓ Direct Mailgun API: {'✅ Working' if api_direct_success else '❌ Failed'}")
    print(f"✓ Custom Mailgun Backend: {'✅ Working' if api_backend_success else '❌ Failed'}")
    
    print("\nRecommended Configuration:")
    
    if api_backend_success or api_direct_success:
        print("► Use the Mailgun API backend for production:")
        print("  1. Update backend/backend/settings.py:")
        print("     EMAIL_BACKEND = 'backend.mailgun_backend.MailgunAPIEmailBackend'")
        print("     MAILGUN_API_KEY = 'key-xxxxxxxxxxxxxxxxxxxx'  # Your API key with key- prefix")
        print("     MAILGUN_DOMAIN = 'mg.wish-list.social'")
        print("     DEFAULT_FROM_EMAIL = 'noreply@mg.wish-list.social'")
    elif smtp_success:
        print("► Use the SMTP backend for production:")
        print("  1. Update backend/backend/settings.py:")
        print("     EMAIL_BACKEND = 'django.core.mail.backends.smtp.EmailBackend'")
        print("     EMAIL_HOST = 'smtp.mailgun.org'")
        print("     EMAIL_PORT = 587")
        print("     EMAIL_USE_TLS = True")
        print("     EMAIL_HOST_USER = 'postmaster@mg.wish-list.social'")
        print("     EMAIL_HOST_PASSWORD = 'your-password'")
        print("     DEFAULT_FROM_EMAIL = 'noreply@mg.wish-list.social'")
    else:
        print("► Use the console backend for development:")
        print("  1. Update backend/backend/settings.py:")
        print("     EMAIL_BACKEND = 'django.core.mail.backends.console.EmailBackend'")
    
    if not (api_backend_success or api_direct_success or smtp_success):
        print("\nTroubleshooting:")
        print("1. Verify your Mailgun account is fully set up and verified")
        print("2. Check that domain 'mg.wish-list.social' is configured in your Mailgun account")
        print("3. Ensure you're using the Private API key, not the Public key")
        print("4. Make sure the API key has the 'key-' prefix")
        print("5. If you're still in the Sandbox, you can only send to authorized recipients")
        print("\nIn the meantime, use the console backend to preview emails during development.")

def main():
    """Main function to run all tests"""
    print_header("EMAIL INTEGRATION TESTING")
    
    # Get recipient email
    if len(sys.argv) > 1:
        recipient = sys.argv[1]
    else:
        recipient = "test@example.com"
        print(f"No recipient provided, using default: {recipient}")
    
    print("\nThis script will test all available email sending methods.")
    print("This helps identify which method works best for your environment.")
    print(f"Test recipient: {recipient}")
    
    # Run tests
    console_success = test_console_backend(recipient)
    smtp_success = test_smtp_backend(recipient)
    api_direct_success = test_mailgun_api_direct(recipient)
    api_backend_success = test_mailgun_backend(recipient)
    
    # Print recommendations
    print_recommendations(console_success, smtp_success, api_direct_success, api_backend_success)

if __name__ == "__main__":
    main() 