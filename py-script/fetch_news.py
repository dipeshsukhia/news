import os
import requests
import json
import sys

if len(sys.argv) != 2:
    print("Usage: python newsapi.py api_key")
    sys.exit(1)

# Access command-line arguments
script_name = sys.argv[0]
arguments = sys.argv[1:]

data_path = './docs/data/'
# Ensure the directory exists, creating it if necessary
os.makedirs(data_path, exist_ok=True)

# Replace 'YOUR_API_KEY' with your News API key
api_key = arguments[0]
language = 'en'

# Specify the endpoint URL for the everything News API
url = f'https://newsapi.org/v2/everything'
# Define the parameters for your news query (e.g., source, country, category)
params = {
    'apiKey': api_key,
    'q': 'news',
    'sortBy' : 'publishedAt',
    'language' : language,
    'pageSize' : 100
}

# Make the API request
response = requests.get(url, params=params)

# Check if the request was successful
if response.status_code == 200:
    # Parse the JSON response
    data = response.json()

    # Define the file path for storing the news data
    file_path = data_path + 'everything-' + language + '-news.json'

    # Save the news data to a JSON file
    with open(file_path, 'w', encoding='utf-8') as json_file:
        json.dump(data, json_file, ensure_ascii=False, indent=4)

    print(f"News data has been saved to {file_path}")

else:
    print(f"Failed to fetch news. Status code: {response.status_code}")


categories = [
  "business",
  "entertainment",
  "general",
  "health",
  "science",
  "sports",
  "technology"
];
countries = [
    "in",
    "us",
];

# Specify the endpoint URL for the News API
url = f'https://newsapi.org/v2/top-headlines'


for country in countries:
    for category in categories:
        # Define the parameters for your news query (e.g., source, country, category)
        params = {
            'apiKey': api_key,
            'country': country,  # Change this to your desired country
            'category': category,  # Change this to your desired category
            'language' : language,
            'pageSize' : 100
        }

        # Make the API request
        response = requests.get(url, params=params)

        # Check if the request was successful
        if response.status_code == 200:
            # Parse the JSON response
            data = response.json()

            # Define the file path for storing the news data
            file_path = data_path + country + '-' + language + '-' + category + '.json'

            # Save the news data to a JSON file
            with open(file_path, 'w', encoding='utf-8') as json_file:
                json.dump(data, json_file, ensure_ascii=False, indent=4)

            print(f"News data has been saved to {file_path}")

        else:
            print(f"Failed to fetch news. Status code: {response.status_code}")
