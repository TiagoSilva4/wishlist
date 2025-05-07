#!/usr/bin/env python
"""
Email Setup and Testing Script for Wishlist Application

This script helps test and diagnose email configuration issues,
and supports both development (console) and production (Mailgun) setups.
"""
import os
import sys
import django
import argparse

# Set up Django environment
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from django.core.mail import send_mail
from django.conf import settings

# Import custom Mailgun backend if available
try:
    from backend.mailgun_backend import MailgunAPIEmailBackend
    MAILGUN_AVAILABLE = True
except ImportError:
    MAILGUN_AVAILABLE = False

def setup_argparser():
    """Configure command-line arguments"""
    parser = argparse.ArgumentParser(
        description='Test email configuration for Wishlist application'
    )
    parser.add_argument(
        'email', 
        nargs='?', 
        default='tiagos3373@gmail.com',
        help='Email address to send test email to (default: tiagos3373@gmail.com)'
    )
    parser.add_argument(
        '--mode', 
        choices=['console', 'mailgun', 'auto'], 
        default='auto',
        help='Email backend to use (default: auto - based on settings)'
    )
    parser.add_argument(
        '--api-key', 
        help='Mailgun API key (if using mailgun mode)'
    )
    parser.add_argument(
        '--domain', 
        default='mg.wish-list.social',
        help='Mailgun domain (if using mailgun mode)'
    )
    return parser.parse_args()

def test_console_email(to_email):
    """Test sending email using Django's console backend"""
    print("\n--- CONSOLE EMAIL TEST ---")
    
    # Temporarily set backend to console
    current_backend = getattr(settings, 'EMAIL_BACKEND', None)
    settings.EMAIL_BACKEND = 'django.core.mail.backends.console.EmailBackend'
    
    try:
        # Send test email
        print(f"Sending test email to {to_email} via console backend...")
        send_mail(
            subject="Test Email - Console Backend",
            message="This is a test email sent via Django's console backend.",
            from_email="noreply@wish-list.social",
            recipient_list=[to_email],
            fail_silently=False
        )
        print("Email was sent to console - check the output above.")
        print("In your actual Django application, this will be printed to the server logs.")
        success = True
    except Exception as e:
        print(f"Error sending console email: {str(e)}")
        success = False
        
    # Restore original backend
    if current_backend:
        settings.EMAIL_BACKEND = current_backend
        
    return success

def test_mailgun_email(to_email, api_key=None, domain=None):
    """Test sending email using Mailgun API"""
    print("\n--- MAILGUN API TEST ---")
    
    if not MAILGUN_AVAILABLE:
        print("Error: MailgunAPIEmailBackend not available. Make sure backend/mailgun_backend.py exists.")
        return False
    
    # Use provided API key or get from settings/environment
    if api_key is None:
        api_key = os.environ.get('MAILGUN_API_KEY', getattr(settings, 'MAILGUN_API_KEY', None))
    
    # Use provided domain or get from settings
    if domain is None:
        domain = getattr(settings, 'MAILGUN_DOMAIN', 'mg.wish-list.social')
    
    if not api_key:
        print("Error: No Mailgun API key provided.")
        print("Please provide a key using --api-key or set MAILGUN_API_KEY in settings.py")
        return False
    
    print(f"Using domain: {domain}")
    if len(api_key) > 5:
        print(f"Using API key ending in: ...{api_key[-5:]}")
    
    try:
        # Create backend instance
        backend = MailgunAPIEmailBackend(api_key=api_key, domain=domain)
        
        # Send test email
        print(f"Sending test email to {to_email} via Mailgun API...")
        result = backend.send_messages([
            django.core.mail.EmailMessage(
                subject="Test Email - Mailgun API",
                body="This is a test email sent via Mailgun API.",
                from_email=f"noreply@{domain}",
                to=[to_email]
            )
        ])
        
        if result > 0:
            print("Success! Email sent via Mailgun API.")
            if not api_key.startswith('key-'):
                print("\nWarning: Your API key doesn't start with 'key-'.")
                print("Mailgun private API keys typically start with 'key-'.")
                print("If you're having issues, check that you're using the private API key.")
            return True
        else:
            print("Failed to send email via Mailgun API.")
            return False
    except Exception as e:
        print(f"Error sending Mailgun email: {str(e)}")
        return False

def print_next_steps(console_success, mailgun_success):
    """Print instructions based on test results"""
    print("\n=== RESULTS AND NEXT STEPS ===")
    
    if console_success:
        print("✅ Console email backend is working.")
        print("   This is suitable for development but emails will only be printed to the console/logs.")
    else:
        print("❌ Console email backend failed.")
        print("   This is unexpected as the console backend should always work.")
    
    if mailgun_success:
        print("✅ Mailgun API backend is working.")
        print("   You can use this for production by setting:")
        print('   EMAIL_BACKEND = "backend.mailgun_backend.MailgunAPIEmailBackend"')
    else:
        print("❌ Mailgun API backend failed.")
        print("   Check your API key and domain settings.")
        print("   For detailed setup instructions, run: python mailgun_setup_instructions.py")
    
    print("\nRECOMMENDED CONFIGURATION:")
    if mailgun_success:
        print("You have a working Mailgun integration! Update settings.py to use it in production.")
    else:
        print("For development: Keep using the console backend")
        print("For production: Fix Mailgun API issues before deployment")
        print("Run 'python mailgun_setup_instructions.py' for a detailed setup guide")
    
    print("\nFor email verification during testing, you can manually verify users:")
    print("python manually_verify_email.py user@example.com")

def main():
    """Main function to run email tests"""
    args = setup_argparser()
    
    print(f"Testing email configuration for recipient: {args.email}")
    
    # Test console backend
    console_success = False
    if args.mode in ['console', 'auto']:
        console_success = test_console_email(args.email)
    
    # Test Mailgun backend
    mailgun_success = False
    if args.mode in ['mailgun', 'auto']:
        mailgun_success = test_mailgun_email(args.email, args.api_key, args.domain)
    
    # Print results and next steps
    print_next_steps(console_success, mailgun_success)

if __name__ == "__main__":
    main() 