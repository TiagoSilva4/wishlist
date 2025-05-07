# Email Setup Guide for Wishlist Application

This guide explains the available email configurations for the Wishlist application, focusing on authentication-related emails (signup verification, password reset).

## Available Email Backends

### 1. Console Backend (Development)
Prints emails to the console instead of sending them. Useful for development.

```python
EMAIL_BACKEND = 'django.core.mail.backends.console.EmailBackend'
```

### 2. SMTP Backend (Production)
Uses Mailgun's SMTP server to send emails.

```python
EMAIL_BACKEND = 'django.core.mail.backends.smtp.EmailBackend'
EMAIL_HOST = 'smtp.mailgun.org'
EMAIL_PORT = 587
EMAIL_USE_TLS = True
EMAIL_HOST_USER = 'postmaster@mg.wish-list.social'
EMAIL_HOST_PASSWORD = 'your-mailgun-smtp-password'
DEFAULT_FROM_EMAIL = 'noreply@mg.wish-list.social'
```

### 3. Mailgun API Backend (Alternative Production)
Uses Mailgun's API to send emails. Useful when SMTP ports are blocked.

```python
EMAIL_BACKEND = 'backend.mailgun_backend.MailgunAPIEmailBackend'
MAILGUN_API_KEY = 'your-mailgun-api-key'  # Will be formatted with 'key-' prefix if needed
MAILGUN_DOMAIN = 'mg.wish-list.social'
DEFAULT_FROM_EMAIL = 'noreply@mg.wish-list.social'
```

## Testing Your Configuration

We've created several utilities to help you test and troubleshoot email functionality:

### Comprehensive Testing Script

```bash
python email_integration_test.py your_email@example.com
```

This script tests all email backends and provides detailed output and recommendations.

### Individual Testing Scripts

1. **Console Backend Testing**:
   ```bash
   python test_direct_email.py your_email@example.com
   ```

2. **Mailgun API Testing**:
   ```bash
   python test_mailgun_api.py your_email@example.com
   ```

3. **Custom Backend Testing**:
   ```bash
   python test_mailgun_backend.py your_email@example.com
   ```

## Manual Email Verification (for Testing)

During development, you might want to manually verify user emails:

```bash
python manually_verify_email.py user@example.com
```

## Common Issues & Troubleshooting

### 1. SMTP Timeouts
**Symptoms**: Email sending times out when using SMTP backend.

**Possible Causes**:
- Port 587 is blocked by your network/firewall
- Connection issues to Mailgun's SMTP servers

**Solutions**:
- Use the Mailgun API backend instead
- Try alternate SMTP port (2525) if available in your network

### 2. API Authentication Errors (401)
**Symptoms**: You get a 401 Unauthorized error when using the Mailgun API.

**Possible Causes**:
- Incorrect API key
- API key missing the 'key-' prefix
- API key has been revoked or restricted

**Solutions**:
- Verify your API key in the Mailgun dashboard
- Ensure your API key has the 'key-' prefix
- Our custom backend now automatically adds the 'key-' prefix if missing

### 3. Domain Not Found (404)
**Symptoms**: You get a 404 Not Found error when using the Mailgun API.

**Possible Causes**:
- The domain 'mg.wish-list.social' is not registered with your account
- The domain isn't properly verified in Mailgun

**Solutions**:
- Verify domain configuration in the Mailgun dashboard
- Ensure all DNS records are properly set up

### 4. Sandbox Restrictions
**Symptoms**: You can only send to certain email addresses.

**Cause**: You're using Mailgun's sandbox domain which restricts recipients.

**Solution**: Set up a custom domain in Mailgun or add your test email as an authorized recipient.

## Production Recommendations

For production use:

1. **Preferred**: Use the Mailgun API backend
   - More reliable when facing network restrictions
   - Not affected by SMTP port blocking
   - Our custom implementation adds proper error handling

2. **Alternative**: Use the SMTP backend
   - Works well when SMTP ports are not blocked
   - Slightly simpler configuration

## Security Recommendations

For better security:

1. Store API keys and passwords as environment variables:
   ```python
   EMAIL_HOST_PASSWORD = os.environ.get('MAILGUN_SMTP_PASSWORD')
   MAILGUN_API_KEY = os.environ.get('MAILGUN_API_KEY')
   ```

2. Never commit API keys to version control
3. Use a .env file for local development (add to .gitignore)
4. Use secrets management in production environments 