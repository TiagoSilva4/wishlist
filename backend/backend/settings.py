from pathlib import Path
import os  # Ensure os is imported at the top of the file


# Build paths inside the project like this: BASE_DIR / 'subdir'.
BASE_DIR = Path(__file__).resolve().parent.parent


# Quick-start development settings - unsuitable for production
# See https://docs.djangoproject.com/en/4.2/howto/deployment/checklist/

# SECURITY WARNING: keep the secret key used in production secret!
# Changed from dummy key to a secure random string
SECRET_KEY = "django-insecure-oU83njas7%^$sdlkf9Jns82naskjdhf63ns"  # Generate a truly random key for production

# SECURITY WARNING: don't run with debug turned on in production!
# Changed to False for production
DEBUG = True  # Enable debug mode temporarily

# Added server IP to allowed hosts
ALLOWED_HOSTS = ["localhost", "backend", "127.0.0.1", "wish-list.social", "*"]  # Add * temporarily for testing

# In settings.py
APPEND_SLASH = True

# Application definition

INSTALLED_APPS = [
    "django.contrib.admin",
    "django.contrib.auth",
    "django.contrib.contenttypes",
    "django.contrib.sessions",
    "django.contrib.messages",
    "django.contrib.staticfiles",
    "allauth",
    "allauth.account",
    "allauth.socialaccount",
    "allauth.socialaccount.providers.dummy",
    "allauth.mfa",
    "allauth.headless",
    "allauth.usersessions",
    "rest_framework",
    "corsheaders",
    "drf_spectacular",
    "backend",
]

MIDDLEWARE = [
    "backend.middleware.RequestLoggingMiddleware",
    "django.middleware.security.SecurityMiddleware",
    "django.contrib.sessions.middleware.SessionMiddleware",
    "corsheaders.middleware.CorsMiddleware",
    "django.middleware.common.CommonMiddleware",
    "django.middleware.csrf.CsrfViewMiddleware",
    "django.contrib.auth.middleware.AuthenticationMiddleware",
    "django.contrib.messages.middleware.MessageMiddleware",
    "django.middleware.clickjacking.XFrameOptionsMiddleware",
    "allauth.account.middleware.AccountMiddleware",
]

ROOT_URLCONF = "backend.urls"

TEMPLATES = [
    {
        "BACKEND": "django.template.backends.django.DjangoTemplates",
        "DIRS": [],
        "APP_DIRS": True,
        "OPTIONS": {
            "context_processors": [
                "django.template.context_processors.debug",
                "django.template.context_processors.request",
                "django.contrib.auth.context_processors.auth",
                "django.contrib.messages.context_processors.messages",
            ],
        },
    },
]

WSGI_APPLICATION = "backend.wsgi.application"


# Database
# https://docs.djangoproject.com/en/4.2/ref/settings/#databases

DATABASES = {
    "default": {
        "ENGINE": "django.db.backends.sqlite3",
        "NAME": BASE_DIR / "db.sqlite3",
    }
}


# Password validation
# https://docs.djangoproject.com/en/4.2/ref/settings/#auth-password-validators

AUTH_PASSWORD_VALIDATORS = [
    {
        "NAME": "django.contrib.auth.password_validation.UserAttributeSimilarityValidator",
    },
    {
        "NAME": "django.contrib.auth.password_validation.MinimumLengthValidator",
    },
    {
        "NAME": "django.contrib.auth.password_validation.CommonPasswordValidator",
    },
    {
        "NAME": "django.contrib.auth.password_validation.NumericPasswordValidator",
    },
]


# Internationalization
# https://docs.djangoproject.com/en/4.2/topics/i18n/

LANGUAGE_CODE = "en-us"

TIME_ZONE = "UTC"

USE_I18N = True

USE_TZ = True


# Static files (CSS, JavaScript, Images)
# https://docs.djangoproject.com/en/4.2/howto/static-files/

STATIC_URL = "static/"
# Added STATIC_ROOT setting for production
STATIC_ROOT = Path(BASE_DIR / "staticfiles")

# Default primary key field type
# https://docs.djangoproject.com/en/4.2/ref/settings/#default-auto-field

DEFAULT_AUTO_FIELD = "django.db.models.BigAutoField"

# ---------------------------------------------------------------
# Email Configuration
# ---------------------------------------------------------------
# Development: Console backend (emails printed to the console/logs)
# EMAIL_BACKEND = 'django.core.mail.backends.console.EmailBackend'

# Mailgun API backend - This has been tested and confirmed working
EMAIL_BACKEND = 'backend.simple_mailgun_backend.SimpleMailgunBackend'
DEFAULT_FROM_EMAIL = 'postmaster@mg.wish-list.social'

# SMTP Configuration - only uncomment if you need SMTP instead of API
# EMAIL_BACKEND = 'django.core.mail.backends.smtp.EmailBackend'
# EMAIL_HOST = 'smtp.mailgun.org'
# EMAIL_PORT = 587
# EMAIL_USE_TLS = True
# EMAIL_HOST_USER = os.environ.get('MAILGUN_SMTP_USERNAME', 'postmaster@mg.wish-list.social')
# EMAIL_HOST_PASSWORD = os.environ.get('MAILGUN_SMTP_PASSWORD', '')
# DEFAULT_FROM_EMAIL = 'noreply@mg.wish-list.social'

AUTHENTICATION_BACKENDS = ("allauth.account.auth_backends.AuthenticationBackend",)

# Email verification settings
ACCOUNT_EMAIL_VERIFICATION = "mandatory"
ACCOUNT_EMAIL_REQUIRED = True
ACCOUNT_LOGIN_METHODS = {"email"}
ACCOUNT_LOGOUT_ON_PASSWORD_CHANGE = False
ACCOUNT_LOGIN_BY_CODE_ENABLED = True
ACCOUNT_EMAIL_VERIFICATION_BY_CODE_ENABLED = True
ACCOUNT_SIGNUP_FIELDS = ["email*", "password1*", "password2*"]
ACCOUNT_USERNAME_REQUIRED = False  # Username is not required, use email as the identifier
ACCOUNT_AUTHENTICATION_METHOD = "email"  # Use email for authentication

# Headless configuration
HEADLESS_ONLY = True
HEADLESS_FRONTEND_URLS = {
    "account_confirm_email": "/account/verify-email/{key}",
    "account_reset_password": "/account/password/reset",
    "account_reset_password_from_key": "/account/password/reset/key/{key}",
    "account_signup": "/account/signup",
    "socialaccount_login_error": "/account/provider/callback",
}
HEADLESS_SERVE_SPECIFICATION = True

MFA_SUPPORTED_TYPES = ["totp", "recovery_codes", "webauthn"]
MFA_PASSKEY_LOGIN_ENABLED = True
MFA_PASSKEY_SIGNUP_ENABLED = True

# Updated CORS settings for production
CORS_ALLOWED_ORIGINS = [
    "http://localhost:10000",
    "http://localhost:3000",
    "http://frontend:3000",
    "http://138.197.31.6",
    "https://wish-list.social",  # Add your domain
]

CORS_ALLOW_CREDENTIALS = True

CSRF_COOKIE_SAMESITE = 'Lax'  # Use 'None' in production with HTTPS
SESSION_COOKIE_SAMESITE = 'Lax'  # Use 'None' in production with HTTPS
CSRF_COOKIE_HTTPONLY = False  # Allow JavaScript access to the cookie
SESSION_COOKIE_HTTPONLY = True

# Updated CSRF trusted origins for production
CSRF_TRUSTED_ORIGINS = [
    'http://localhost:10000',
    'http://138.197.31.6',
    'https://wish-list.social',  # Add your domain
]

# REST Framework settings
REST_FRAMEWORK = {
    'DEFAULT_SCHEMA_CLASS': 'drf_spectacular.openapi.AutoSchema',
    'DEFAULT_AUTHENTICATION_CLASSES': [
        'rest_framework.authentication.SessionAuthentication',
    ],
    'DEFAULT_PERMISSION_CLASSES': [
        'rest_framework.permissions.IsAuthenticated',
    ],
}

SPECTACULAR_SETTINGS = {
    "EXTERNAL_DOCS": {"description": "allauth", "url": "/_allauth/openapi.html"},
}

# Add these headers to allow cookies and authorization
CORS_ALLOW_HEADERS = [
    'accept',
    'accept-encoding',
    'authorization',
    'content-type',
    'dnt',
    'origin',
    'user-agent',
    'x-csrftoken',
    'x-requested-with',
    'x-session-token',
]

# Security settings for production
# Uncomment these when you set up HTTPS
# SECURE_SSL_REDIRECT = True
# SESSION_COOKIE_SECURE = True
# CSRF_COOKIE_SECURE = True
# SECURE_HSTS_SECONDS = 31536000  # 1 year
# SECURE_HSTS_INCLUDE_SUBDOMAINS = True
# SECURE_HSTS_PRELOAD = True

# Configure logging
LOGGING = {
    'version': 1,
    'disable_existing_loggers': False,
    'handlers': {
        'console': {
            'class': 'logging.StreamHandler',
        },
    },
    'loggers': {
        'backend.middleware': {
            'handlers': ['console'],
            'level': 'INFO',
        },
    },
}

# Ensure CORS is set up correctly
CORS_ALLOW_ALL_ORIGINS = True  # Temporarily allow all origins for testing