import os
import django

# Set up Django environment
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

# Now import our function
from backend.views import scrape_product_data

# Test URL
url = 'https://www.abercrombie.com/shop/us/p/oversized-essential-colorblock-popover-hoodie-46732320?categoryId=12202&faceout=prod&seq=38&afsource=social+proofing'

# Run the scraper and print results
try:
    print("Attempting to scrape:", url)
    result = scrape_product_data(url)
    print("\nScraping result:")
    print(f"Name: {result.get('name', 'Not found')}")
    print(f"Price: {result.get('price', 'Not found')}")
    print(f"Description: {result.get('description', 'Not found')}")
    print(f"Image URL: {result.get('image_url', 'Not found')}")
    print("\nFull result dictionary:")
    print(result)
except Exception as e:
    import traceback
    print(f"Error occurred: {e}")
    print("\nFull traceback:")
    traceback.print_exc() 