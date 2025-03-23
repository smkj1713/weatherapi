from flask import Flask, render_template, request, jsonify
import requests
from timezonefinder import TimezoneFinder  # Even if skipping time, we can remove this import if you want.

app = Flask(__name__)

# Your API key for OpenWeatherMap (used for weather, geocoding, and air pollution)
WEATHER_API_KEY = "7ff8c9b8785450294c874dfa3b1c785c"

# Default cities with known coordinates
cities = {
    "Mumbai": {"lat": 19.0760, "lon": 72.8777},
    "New Delhi": {"lat": 28.6139, "lon": 77.2090},
    "Bangalore": {"lat": 12.9716, "lon": 77.5946},
    "New York": {"lat": 40.7128, "lon": -74.0060},
    "London": {"lat": 51.5074, "lon": -0.1278}
}

# Four default user choices (excluding Mumbai)
default_choices = ["New Delhi", "Bangalore", "New York", "London"]

def get_coordinates(city):
    """
    Uses OpenWeatherMap Geocoding API to get coordinates for any city.
    Returns a dict with {'lat': float, 'lon': float} or None if not found.
    """
    url = f"http://api.openweathermap.org/geo/1.0/direct?q={city}&limit=1&appid={WEATHER_API_KEY}"
    response = requests.get(url)
    data = response.json()
    if data:
        return {"lat": data[0]["lat"], "lon": data[0]["lon"]}
    else:
        return None

def get_weather(city):
    """
    Fetches current weather data from OpenWeatherMap for the given city.
    """
    url = f"http://api.openweathermap.org/data/2.5/weather?q={city}&appid={WEATHER_API_KEY}&units=metric"
    response = requests.get(url)
    return response.json()

def get_aqi(city):
    """
    Fetches comprehensive Air Quality data using OpenWeatherMap Air Pollution API.
    Returns overall AQI and pollutant components if available.
    """
    # If city is in our dict, use that. Otherwise, geocode.
    coords = cities.get(city)
    if not coords:
        coords = get_coordinates(city)
    if not coords:
        return {"error": f"Coordinates not found for city: {city}"}

    lat = coords["lat"]
    lon = coords["lon"]
    url = f"http://api.openweathermap.org/data/2.5/air_pollution?lat={lat}&lon={lon}&appid={WEATHER_API_KEY}"
    response = requests.get(url)
    data = response.json()

    try:
        aqi_value = data["list"][0]["main"]["aqi"]
        components = data["list"][0]["components"]
    except (KeyError, IndexError):
        aqi_value = None
        components = {}

    return {
        "aqi": aqi_value,
        "components": components,
        "raw": data
    }

@app.route('/')
def home():
    """
    Renders the main HTML page (index.html) with a form to select a city.
    """
    return render_template('index.html')

@app.route('/aggregated-data')
def aggregated_data():
    """
    Returns JSON with weather and AQI for Mumbai and the user-selected city.
    (Skipping time data due to worldtimeapi.org unavailability)
    """
    # Fixed city
    fixed_city = "Mumbai"
    # Fetch data for Mumbai
    mumbai_weather = get_weather(fixed_city)
    mumbai_aqi = get_aqi(fixed_city)

    # Get user-selected city from query param
    user_city = request.args.get('city', '').strip()
    # If none provided, default to first in default_choices
    if not user_city:
        user_city = default_choices[0]

    user_weather = get_weather(user_city)
    user_aqi = get_aqi(user_city)

    aggregated = {
        "Mumbai": {
            "weather": mumbai_weather,
            "AQI": mumbai_aqi
        },
        "Selected City": {
            "city": user_city,
            "weather": user_weather,
            "AQI": user_aqi
        }
    }

    return jsonify(aggregated)

if __name__ == '__main__':
    app.run(debug=True)
