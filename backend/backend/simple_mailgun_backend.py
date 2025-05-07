"""
A simplified Mailgun backend that uses exactly what works in our direct test.
"""
from django.core.mail.backends.base import BaseEmailBackend
import requests
import os
import logging

logger = logging.getLogger(__name__)

class SimpleMailgunBackend(BaseEmailBackend):
    """
    A simple Django email backend that uses Mailgun API directly.
    """
    
    def __init__(self, **kwargs):
        super().__init__(**kwargs)
        # Get API key from environment
        self.api_key = os.environ.get('MAILGUN_API_KEY')
        if not self.api_key:
            logger.warning("MAILGUN_API_KEY not found in environment variables. Emails will not be sent.")
            
        self.domain = os.environ.get('MAILGUN_DOMAIN', 'mg.wish-list.social')
        self.api_url = f"https://api.mailgun.net/v3/{self.domain}/messages"
    
    def send_messages(self, email_messages):
        """
        Send one or more EmailMessage objects and return the number of messages sent.
        """
        if not email_messages:
            return 0
            
        # Check if API key is available
        if not self.api_key:
            if self.fail_silently:
                return 0
            raise ValueError("MAILGUN_API_KEY environment variable not set")
            
        num_sent = 0
        
        for message in email_messages:
            if self._send(message):
                num_sent += 1
                
        return num_sent
    
    def _send(self, email_message):
        """
        Send a single EmailMessage using the Mailgun API.
        """
        if not email_message.recipients():
            return False
            
        # Prepare the email data
        data = {
            'from': email_message.from_email or f"postmaster@{self.domain}",
            'to': ', '.join(email_message.recipients()),
            'subject': email_message.subject,
            'text': email_message.body
        }
        
        # Send the request - exactly as in our direct test that works
        try:
            response = requests.post(
                self.api_url,
                auth=('api', self.api_key),
                data=data
            )
            
            # Log the response for debugging
            logger.debug(f"Mailgun API response: {response.status_code} - {response.text}")
                
            # Return success if status code is 200
            return response.status_code == 200
            
        except Exception as e:
            logger.error(f"Mailgun error: {str(e)}")
            if self.fail_silently:
                return False
            raise e 