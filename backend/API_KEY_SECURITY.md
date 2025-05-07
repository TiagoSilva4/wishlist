# API Key Security Guide

## 🔒 Important: Protecting Your API Keys

We've updated the codebase to improve security by removing hardcoded API keys. Here's what you need to know:

### Changes Made

1. **Removed hardcoded API keys** from all test scripts and settings files
2. **Added environment variable support** for all credentials
3. **Added interactive prompts** as fallback when environment variables are missing
4. **Added automatic 'key-' prefix handling** for Mailgun API keys

### Setting Up Environment Variables

#### For Development

Create a `.env` file in the `backend` directory with your credentials:

```
# Mailgun API credentials
MAILGUN_API_KEY=your_mailgun_api_key_here
MAILGUN_DOMAIN=mg.wish-list.social

# Mailgun SMTP credentials
MAILGUN_SMTP_USERNAME=postmaster@mg.wish-list.social
MAILGUN_SMTP_PASSWORD=your_mailgun_smtp_password_here

# Test email for development
TEST_EMAIL=your_email@example.com
```

Then load these variables into your environment before running scripts:

```bash
# For bash/zsh
source .env

# Or use the following before running scripts
export $(cat .env | grep -v '#' | xargs)
```

#### For Production

In production environments, set these environment variables securely according to your platform:

- **Docker**: Use environment variables in your docker-compose.yml
- **Kubernetes**: Use secrets and environment variables
- **Traditional hosting**: Configure environment variables on your server

### Running Tests

The test scripts now work in three modes:

1. **With environment variables**: Preferred and most secure
2. **Interactive mode**: Will prompt for API keys if not found in environment
3. **Default mode**: Will use placeholder domain values, but security-sensitive values must be provided

Example:

```bash
# Set environment variables first
export MAILGUN_API_KEY=your_key_here

# Then run tests
python test_mailgun_api.py your_email@example.com
```

### Checking for Leaked API Keys

Always run this check before committing code:

```bash
grep -r "your_actual_api_key" --include="*.py" .
```

### Security Best Practices

1. **Never commit .env files** to version control
2. **Add .env to your .gitignore file**
3. **Rotate API keys** regularly, especially if you suspect they've been exposed
4. **Use different API keys** for development and production
5. **Limit API key permissions** to only what's needed

### Next Steps

1. Create a `.env` file with your actual credentials
2. Add `.env` to your `.gitignore` file if not already there
3. Test the email functionality using the environment variables 