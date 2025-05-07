#!/bin/bash
# Helper script to set up environment variables for Mailgun integration

# Colors for better readability
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${GREEN}Setting up environment variables for Mailgun integration${NC}"
echo -e "${YELLOW}Note: This script will create a .env file in the current directory${NC}"
echo -e "${YELLOW}The .env file contains sensitive data and should not be committed to version control${NC}"
echo ""

# Check if .env already exists
if [ -f .env ]; then
    echo -e "${YELLOW}Warning: .env file already exists${NC}"
    read -p "Overwrite? (y/n): " overwrite
    if [ "$overwrite" != "y" ]; then
        echo "Exiting without changes"
        exit 0
    fi
fi

# Get Mailgun API key
echo -e "${GREEN}Enter your Mailgun API key:${NC}"
read -p "> " mailgun_api_key

# Get Mailgun domain (or use default)
echo -e "${GREEN}Enter your Mailgun domain [default: mg.wish-list.social]:${NC}"
read -p "> " mailgun_domain
mailgun_domain=${mailgun_domain:-mg.wish-list.social}

# Get test email
echo -e "${GREEN}Enter an email address for testing:${NC}"
read -p "> " test_email

# Create .env file
cat > .env << EOL
# Mailgun API credentials
# Created by setup_env.sh on $(date)
MAILGUN_API_KEY=${mailgun_api_key}
MAILGUN_DOMAIN=${mailgun_domain}

# Mailgun SMTP credentials (if using SMTP instead of API)
MAILGUN_SMTP_USERNAME=postmaster@${mailgun_domain}
MAILGUN_SMTP_PASSWORD=${mailgun_api_key}

# Test email for development
TEST_EMAIL=${test_email}
EOL

echo -e "${GREEN}Environment variables set up successfully!${NC}"
echo ""
echo -e "${YELLOW}To use these variables in your current shell session, run:${NC}"
echo -e "  source .env"
echo ""
echo -e "${YELLOW}To test the Mailgun integration, run:${NC}"
echo -e "  source .env && python test_mailgun_direct.py"
echo ""
echo -e "${RED}IMPORTANT: Never commit the .env file to version control!${NC}" 