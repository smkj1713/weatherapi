// On page load, fetch default comparison: "New Delhi"
window.addEventListener("load", function() {
    getComparison("New Delhi");
  });
  
  // Show custom city input if "Other" is selected
  document.getElementById("citySelect").addEventListener("change", function() {
    const customDiv = document.getElementById("customCityDiv");
    if (this.value === "other") {
      customDiv.classList.remove("d-none");
    } else {
      customDiv.classList.add("d-none");
    }
  });
  
  // Handle form submission
  document.getElementById("cityForm").addEventListener("submit", function(e) {
    e.preventDefault();
    let selectedCity = document.getElementById("citySelect").value;
    if (selectedCity === "other") {
      selectedCity = document.getElementById("customCity").value.trim();
    }
    getComparison(selectedCity);
  });
  
  function getComparison(selectedCity) {
    fetch(`/aggregated-data?city=${encodeURIComponent(selectedCity)}`)
      .then((response) => response.json())
      .then((data) => {
        renderResults(data);
      })
      .catch((error) => {
        console.error("Error fetching data:", error);
        const resultsDiv = document.getElementById("results");
        resultsDiv.innerHTML = `
          <div class="alert alert-danger">
            Error fetching data. Please try again later.
          </div>
        `;
      });
  }
  
  function renderResults(data) {
    const resultsDiv = document.getElementById("results");
    resultsDiv.innerHTML = "";
  
    // Build city card for Mumbai
    const mumbaiCard = createCityCard("Mumbai", data.Mumbai.weather, data.Mumbai.AQI);
    // Build city card for user city
    const userCityName = data["Selected City"].city;
    const userCityCard = createCityCard(userCityName, data["Selected City"].weather, data["Selected City"].AQI);
  
    resultsDiv.innerHTML = `
      <div class="col-md-6">
        ${mumbaiCard}
      </div>
      <div class="col-md-6">
        ${userCityCard}
      </div>
    `;
  }
  
  function createCityCard(cityName, weatherData, aqiData) {
    // Basic fields from weather
    const wTemp = weatherData.main ? weatherData.main.temp : "N/A";
    const wHumidity = weatherData.main ? weatherData.main.humidity : "N/A";
    const wDesc = weatherData.weather && weatherData.weather[0] ? weatherData.weather[0].description : "N/A";
    const wWind = weatherData.wind ? weatherData.wind.speed : "N/A";
  
    // Basic fields from AQI
    const aqiValue = aqiData.aqi || "N/A";
    const comps = aqiData.components || {};
    const pm25 = comps.pm2_5 !== undefined ? comps.pm2_5 : "N/A";
    const pm10 = comps.pm10 !== undefined ? comps.pm10 : "N/A";
    const no2 = comps.no2 !== undefined ? comps.no2 : "N/A";
    const so2 = comps.so2 !== undefined ? comps.so2 : "N/A";
  
    return `
      <div class="city-card">
        <h2>${cityName}</h2>
        <table>
          <thead>
            <tr><th colspan="2">Weather</th></tr>
          </thead>
          <tbody>
            <tr><td>Temperature (°C)</td><td>${wTemp}</td></tr>
            <tr><td>Humidity (%)</td><td>${wHumidity}</td></tr>
            <tr><td>Description</td><td>${wDesc}</td></tr>
            <tr><td>Wind Speed (m/s)</td><td>${wWind}</td></tr>
          </tbody>
        </table>
        <table>
          <thead>
            <tr><th colspan="2">AQI</th></tr>
          </thead>
          <tbody>
            <tr><td>Overall AQI</td><td>${aqiValue}</td></tr>
            <tr><td>PM2.5</td><td>${pm25}</td></tr>
            <tr><td>PM10</td><td>${pm10}</td></tr>
            <tr><td>NO2</td><td>${no2}</td></tr>
            <tr><td>SO2</td><td>${so2}</td></tr>
          </tbody>
        </table>
      </div>
    `;
  }
  