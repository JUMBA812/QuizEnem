import requests
import json

# Fetch data from the Flagpedia codes JSON API
language_code = 'fr'  # Change for each languag
api_url = f'https://flagcdn.com/{language_code}/codes.json'
response = requests.get(api_url)
data = json.loads(response.text)

# Create a list of [country name, flag image link], excluding US states
country_flag_list = []
for code, name in data.items():
    if not code.startswith('us-'):
        flag_link = f'https://flagcdn.com/{code}.svg'
        country_flag_list.append([name, flag_link])
file_name = f'quiz_data_{language_code}.txt'
# Write the data to a text file with UTF-8 encoding
with open(file_name, 'w', encoding='utf-8') as file:
    for country, flag_link in country_flag_list:
        file.write(f'{country},{flag_link}\n')


print('Quiz data generated successfully!')
