"""
Custom Django email backend that uses the Mailgun API instead of SMTP.
"""
from django.core.mail.backends.base import BaseEmailBackend
from django.conf import settings
import requests

class MailgunAPIEmailBackend(BaseEmailBackend):
    """
    A Django email backend that uses the Mailgun API.
    
    This backend is useful when SMTP ports are blocked by network restrictions.
    """
    
    def __init__(self, api_key=None, domain=None, **kwargs):
        super().__init__(**kwargs)
        # Get settings from Django settings or use defaults
        self.api_key = api_key or getattr(settings, 'MAILGUN_API_KEY', None)
        self.domain = domain or getattr(settings, 'MAILGUN_DOMAIN', 'mg.wish-list.social')
        
        if not self.api_key:
            raise ValueError("MAILGUN_API_KEY must be set in settings or provided to the backend")
            
        # Ensure API key has the required 'key-' prefix
        if not self.api_key.startswith('key-'):
            self.api_key = f'key-{self.api_key}'
            
        self.api_url = f"https://api.mailgun.net/v3/{self.domain}/messages"
    
    def send_messages(self, email_messages):
        """
        Send one or more EmailMessage objects and return the number of messages sent.
        """
        if not email_messages:
            return 0
            
        num_sent = 0
        
        for message in email_messages:
            if self._send(message):
                num_sent += 1
                
        return num_sent
    
    def _send(self, email_message):
        """
        Send a single EmailMessage using the Mailgun API.
        
        Returns True if the message was sent successfully, False if not.
        """
        if not email_message.recipients():
            return False
            
        # Prepare the email data
        data = {
            'from': email_message.from_email,
            'to': ', '.join(email_message.recipients()),
            'subject': email_message.subject,
        }
        
        # Handle multipart emails with html and text content
        if email_message.content_subtype == 'html':
            data['html'] = email_message.body
        else:
            data['text'] = email_message.body
            
        # Add CC recipients if available
        if email_message.cc:
            data['cc'] = ', '.join(email_message.cc)
            
        # Add BCC recipients if available
        if email_message.bcc:
            data['bcc'] = ', '.join(email_message.bcc)
            
        # Add custom headers if available
        for header, value in email_message.extra_headers.items():
            data[f'h:{header}'] = value
            
        # Send the request
        try:
            response = requests.post(
                self.api_url,
                auth=('api', self.api_key),
                data=data,
                timeout=10  # 10 second timeout
            )
            
            # Log the response for debugging
            if hasattr(settings, 'DEBUG') and settings.DEBUG:
                print(f"Mailgun API response: {response.status_code} - {response.text}")
                
            # Return success if status code is 200
            return response.status_code == 200
            
        except Exception as e:
            if self.fail_silently:
                return False
            raise e 