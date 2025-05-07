# Email Configuration Guide for Wishlist

We've set up email functionality for your application using Mailgun. Here's what you need to know:

## Current Setup

✅ **Emails now work!** We've configured a direct integration with Mailgun's API.

The application is using a custom Django email backend that sends emails directly through Mailgun's API. Environment variables are used for sensitive credentials.

## Required Environment Variables

You MUST set the following environment variables:

```bash
# Required Mailgun credentials
export MAILGUN_API_KEY=your_api_key_here
export MAILGUN_DOMAIN=mg.wish-list.social

# Optional email for testing
export TEST_EMAIL=your_email@example.com
```

You can add these to a `.env` file and source it:

```bash
source .env
```

## How to Use

### Sending Emails in Django

You can use Django's standard `send_mail` function:

```python
from django.core.mail import send_mail

send_mail(
    subject="Your Subject",
    message="Your message body",
    from_email="postmaster@mg.wish-list.social",
    recipient_list=["recipient@example.com"],
    fail_silently=False
)
```

### Auth Emails

Authentication emails (signup verification, password reset) will work automatically with the current setup, as long as the environment variables are set.

## Configuration Details

The email backend is configured in `backend/backend/settings.py`:

```python
EMAIL_BACKEND = 'backend.simple_mailgun_backend.SimpleMailgunBackend'
DEFAULT_FROM_EMAIL = 'postmaster@mg.wish-list.social'
```

The backend itself is in `backend/backend/simple_mailgun_backend.py` and uses environment variables for security.

## Troubleshooting

If you encounter any issues:

1. **Check environment variables** - Make sure `MAILGUN_API_KEY` is set
2. **Check mailbox spam/junk folder** - Authentication emails might be flagged as spam
3. **Test with direct API** - Use `test_mailgun_direct.py` to test direct API communication
4. **Check Django integration** - Use `test_with_settings.py` to test Django's integration

## Testing Scripts

We've provided several testing scripts to help diagnose issues:

```bash
# Set environment variables first
export MAILGUN_API_KEY=your_api_key_here

# Then run tests
python test_mailgun_direct.py
python test_with_settings.py
```

## Security Notes

- ✅ No API keys are hardcoded in the codebase
- ✅ All sensitive information is stored in environment variables
- ✅ The `.env` file is excluded from version control (.gitignore)

## Future Improvements

For improved security in production:

1. Use a secrets management system for environment variables
2. Set up proper sandbox domain verification or custom domain
3. Consider implementing email templates for better design 