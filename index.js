// ==========================================
// 1. VARIABLES & CONFIGURATION
// ==========================================
let presentLat, presentLong;
let lat, long, locationDetails;

const input = document.getElementById("searchInput");
const list = document.getElementById("cityList");
const searchButton = document.getElementById("searchLocation");
const locationUi = document.getElementById("location");
const tempToUi = document.getElementById("tempToUi");
const loadingState = document.getElementById("loading");

const weatherIcons = {
  sunny: `<creattie-embed src="https://d1jj76g3lut4fe.cloudfront.net/saved_colors/139426/pxIZFjEforacmyq6.json" delay="1" speed="100" frame_rate="24" stroke_width="9.5" trigger="loop" style="width: 78px; height: 78px; display: block;"></creattie-embed>`,
  cloudy: `<creattie-embed src="https://d1jj76g3lut4fe.cloudfront.net/saved_colors/139426/NQnutbCrSrlUjh3v.json" delay="1" speed="100" frame_rate="24" stroke_width="9.5" trigger="loop" style="width: 78px; height: 78px; display: block;"></creattie-embed>`,
  rain: `<creattie-embed src="https://d1jj76g3lut4fe.cloudfront.net/saved_colors/139426/oqoQCzPP523gofNe.json" delay="1" speed="100" frame_rate="24" stroke_width="9.625" trigger="loop" style="width: 78px; height: 78px; display: block;"></creattie-embed>`,
  snow: `<creattie-embed src="https://d1jj76g3lut4fe.cloudfront.net/saved_colors/139426/LwkQma5cbvkRZ92l.json" delay="1" speed="100" frame_rate="24" stroke_width="7.5" trigger="loop" style="width: 78px; height: 78px; display: block;"></creattie-embed>`,
  thunderstorm: `<creattie-embed src="https://d1jj76g3lut4fe.cloudfront.net/saved_colors/139426/PdbaR1hrbPmrcCcs.json" delay="1" speed="100" frame_rate="24" stroke_width="7.5" trigger="loop" style="width: 78px; height: 78px; display: block;"></creattie-embed>`,
  extremeHeat: `<creattie-embed src="https://d1jj76g3lut4fe.cloudfront.net/saved_colors/139426/ISCjYrsLbF2Nip4j.json" delay="0" speed="400" frame_rate="24" stroke_width="7.5" trigger="loop" style="width: 78px; height: 78px; display: block;"></creattie-embed>`,
  clearNight: ` <img src="https://res.cloudinary.com/dvwo6ltjs/image/upload/v1768327250/outline-1_wnf6nc.svg" alt="cloud" class="cloud">`,
};

const nightBackground = {
  snow: "https://res.cloudinary.com/dwivnxoyv/image/upload/v1768513869/weather_snow_avk9zc.png",
  rain: "https://res.cloudinary.com/di8aoioek/image/upload/v1768434942/bg-weather_1_g9wcq7.png",
  cloudy:
    "https://res.cloudinary.com/dvwo6ltjs/image/upload/v1768327253/bg-weather_wrtd8l.jpg",
  thunderstorm:
    "https://res.cloudinary.com/di8aoioek/image/upload/v1768461458/bg-weather_l3lbnl.png",
  clear:
    "https://res.cloudinary.com/dwivnxoyv/image/upload/v1768514534/weather_night_ie5mow.png",
};

const dayBackground = {
  snow: "https://res.cloudinary.com/dwivnxoyv/image/upload/v1768513869/weather_snow_avk9zc.png",
  rain: "https://res.cloudinary.com/di8aoioek/image/upload/v1768434942/bg-weather_1_g9wcq7.png",
  cloudy:
    "https://res.cloudinary.com/dwivnxoyv/image/upload/v1768525272/marc-wieland-zrj-TPjcRLA-unsplash_utqpiz.jpg",
  clear:
    "https://res.cloudinary.com/dwivnxoyv/image/upload/v1768513868/weather_clear_pfsgqj.png",
  sunny:
    "https://res.cloudinary.com/dwivnxoyv/image/upload/v1768524050/jacek-ulinski-T6Dirfcmy0c-unsplash_eiphmg.jpg",
};

// ==========================================
// 2. MAIN LOGIC (Get Weather)
// ==========================================
async function getWeatherInfo(latitude, longitude) {
  try {
    let response = await fetch(
      `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&daily=weather_code,temperature_2m_max,temperature_2m_min&current=temperature_2m,weather_code,relative_humidity_2m,wind_speed_10m,cloud_cover&timezone=auto&past_days=3&forecast_days=4`
    );
    let data = await response.json();

    // --- UI Updates ---
    locationUi.innerText = locationDetails || "Current Location";
    tempToUi.innerText = Math.ceil(data.current.temperature_2m);

    document.getElementById("maxTemp").innerText =
      data.daily.temperature_2m_max[3];
    document.getElementById("minTemp").innerText =
      data.daily.temperature_2m_min[3];
    document.getElementById("humidity").innerText =
      data.current.relative_humidity_2m;
    document.getElementById("cloudy").innerText = data.current.cloud_cover;
    document.getElementById("wind").innerText = data.current.wind_speed_10m;

    updateDate(data.current.time);

    // --- Process Forecast Data ---
    let dates = data.daily.time.map((date) => formatDateOnly(date));
    let weathers = data.daily.temperature_2m_max;

    // Fill the forecast Text
    document.getElementById("pr").innerText = dates[0];
    document.getElementById("pr1").innerText = dates[1];
    document.getElementById("pr2").innerText = dates[2];
    document.getElementById("pr3").innerText = dates[4];
    document.getElementById("pr4").innerText = dates[5];
    document.getElementById("pr5").innerText = dates[6];

    document.getElementById("prr").innerText = weathers[0];
    document.getElementById("pr11").innerText = weathers[1];
    document.getElementById("pr22").innerText = weathers[2];
    document.getElementById("pr33").innerText = weathers[4];
    document.getElementById("pr44").innerText = weathers[5];
    document.getElementById("pr55").innerText = weathers[6];

    if (loadingState) loadingState.style.display = "none";

    // --- Current Weather Logic ---
    const serverTime = data.current.time;
    const code = data.current.weather_code;
    const temp = data.current.temperature_2m;

    console.log("Weather Code:", code, "Time:", serverTime);

    // Get Main Weather Details
    const weather = getWeatherDetails(code, temp, serverTime);

    // Get Forecast Details (Added "T12:00" so they show DAY icons)
    const dayOne = getWeatherDetails(
      data.daily.weather_code[0],
      data.daily.temperature_2m_max[0],
      data.daily.time[0] + "T12:00"
    );
    const dayTwo = getWeatherDetails(
      data.daily.weather_code[1],
      data.daily.temperature_2m_max[1],
      data.daily.time[1] + "T12:00"
    );
    const dayThree = getWeatherDetails(
      data.daily.weather_code[2],
      data.daily.temperature_2m_max[2],
      data.daily.time[2] + "T12:00"
    );
    const dayFour = getWeatherDetails(
      data.daily.weather_code[3],
      data.daily.temperature_2m_max[3],
      data.daily.time[3] + "T12:00"
    );
    const dayFive = getWeatherDetails(
      data.daily.weather_code[4],
      data.daily.temperature_2m_max[4],
      data.daily.time[4] + "T12:00"
    );
    const daySix = getWeatherDetails(
      data.daily.weather_code[5],
      data.daily.temperature_2m_max[5],
      data.daily.time[5] + "T12:00"
    );

    if (weather.text !== "Unknown") {
      // Update Main Status
      document.getElementById("WeatherStatus").innerText = weather.text;
      document.getElementById("icon").innerHTML = weather.icon;

      // Update Forecast Icons & Text
      document.getElementById("icon1").innerHTML = dayOne.icon;
      document.getElementById("icon2").innerHTML = dayTwo.icon;
      document.getElementById("icon3").innerHTML = dayThree.icon;
      document.getElementById("icon4").innerHTML = dayFour.icon;
      document.getElementById("icon5").innerHTML = dayFive.icon;
      document.getElementById("icon6").innerHTML = daySix.icon;

      document.getElementById("prrr").innerText = dayOne.text;
      document.getElementById("pr111").innerText = dayTwo.text;
      document.getElementById("pr222").innerText = dayThree.text;
      document.getElementById("pr333").innerText = dayFour.text;
      document.getElementById("pr444").innerText = dayFive.text;
      document.getElementById("pr555").innerText = daySix.text;

      // --- Background Logic (Simplified) ---
      const isNight = isNightTime(serverTime);
      const bgSet = isNight ? nightBackground : dayBackground;

      let bgUrl = "";

      if (weather.text === "Thunderstorm")
        bgUrl = bgSet.thunderstorm || bgSet.rain;
      else if (weather.text === "Rain") bgUrl = bgSet.rain;
      else if (weather.text === "Cloudy") bgUrl = bgSet.cloudy;
      else if (weather.text === "Snow") bgUrl = bgSet.snow;
      else if (weather.text === "Extreme Heat") bgUrl = dayBackground.sunny;
      else if (weather.text === "Sunny") bgUrl = dayBackground.sunny;
      else if (weather.text === "Clear Night") bgUrl = nightBackground.clear;
      else bgUrl = isNight ? nightBackground.clear : dayBackground.clear; // Fallback

      // Apply Background
      document.body.style.backgroundImage = `url('${bgUrl}')`;

      reloadCreattieScript();
      reloadCreattieScript();
      reloadCreattieScript();
      reloadCreattieScript();
      reloadCreattieScript();
      reloadCreattieScript();
      reloadCreattieScript();
    } else {
      console.log("Unknown Weather Code:", code);
    }
  } catch (error) {
    console.error(error);
    if (loadingState) loadingState.style.display = "none";
  }
}

// ==========================================
// 3. EVENT LISTENERS
// ==========================================

// Initial GPS Load
document.addEventListener("DOMContentLoaded", () => {
  navigator.geolocation.getCurrentPosition(
    async (position) => {
      if (loadingState) loadingState.style.display = "flex";
      const { latitude, longitude } = position.coords;
      presentLat = latitude.toFixed(6);
      presentLong = longitude.toFixed(6);
      console.log("GPS Caught:", presentLat, presentLong);
      getWeatherInfo(presentLat, presentLong);
      locationUi.innerText = "Current Location";
    },
    (error) => {
      console.error("Location error:", error);
      alert("Please allow location access or search manually.");
      if (loadingState) loadingState.style.display = "none";
    }
  );
});

// Search Input Logic
input.addEventListener("input", async () => {
  const cityName = input.value;
  if (cityName.length < 2) {
    list.style.display = "none";
    list.innerHTML = "";
    return;
  }
  try {
    const response = await fetch(
      `https://geocoding-api.open-meteo.com/v1/search?name=${cityName}&count=100&language=en&format=json`
    );
    const data = await response.json();
    list.innerHTML = "";

    if (data.results) {
      list.style.display = "block";
      data.results.forEach((city) => {
        const li = document.createElement("li");
        const currentCityNames = `${city.name},${city.admin1}, ${city.country}`;
        const currentCityNamesToUi = `${city.name}, ${city.admin1}.`;
        li.textContent = currentCityNames;

        li.addEventListener("click", () => {
          input.value = currentCityNames;
          locationDetails = currentCityNamesToUi;
          list.style.display = "none";
          lat = city.latitude;
          long = city.longitude;
        });
        list.appendChild(li);
      });
    } else {
      list.style.display = "none";
    }
  } catch (error) {
    console.error("Error:", error);
  }
});

// Close list on outside click
document.addEventListener("click", (e) => {
  if (e.target !== input && e.target !== list) {
    list.style.display = "none";
  }
});

// Search Button
searchButton.addEventListener("click", () => {
  locationUi.innerText = "--";
  tempToUi.innerText = "--";
  if (loadingState) loadingState.style.display = "flex";

  if (!lat || !long) {
    alert("Please select a city from the list first!");
    if (loadingState) loadingState.style.display = "none";
    return;
  }
  getWeatherInfo(lat, long);
});

// ==========================================
// 4. HELPER FUNCTIONS
// ==========================================

function updateDate(apiTimeString) {
  const date = new Date(apiTimeString);
  const hours = date.getHours().toString().padStart(2, "0");
  const minutes = date.getMinutes().toString().padStart(2, "0");
  const time = `${hours}:${minutes}`;
  const dayName = date.toLocaleDateString("en-US", { weekday: "long" });
  const dayNumber = date.getDate();
  const month = date.toLocaleDateString("en-US", { month: "short" });
  const year = date.getFullYear().toString().slice(-2);
  document.getElementById(
    "dateDisplay"
  ).innerText = `${time} - ${dayName}, ${dayNumber} ${month} '${year}`;
}

function formatDateOnly(apiDateString) {
  const date = new Date(apiDateString);
  const dayName = date.toLocaleDateString("en-US", { weekday: "long" });
  const dayNumber = date.getDate();
  const month = date.toLocaleDateString("en-US", { month: "short" });
  const year = date.getFullYear().toString().slice(-2);
  return `${dayName}, ${dayNumber} ${month} '${year}`;
}

function isNightTime(serverDateString) {
  const dateObj = new Date(serverDateString);
  const hour = dateObj.getHours();
  return hour < 6 || hour >= 18;
}

function reloadCreattieScript() {
  const scriptId = "creattie-script-loader";
  const oldScript = document.getElementById(scriptId);
  if (oldScript) oldScript.remove();

  const newScript = document.createElement("script");
  newScript.id = scriptId;
  newScript.src = "https://creattie.com/js/embed.js?id=3efa1fcb5d85991e845a";
  document.body.appendChild(newScript);
}

function getWeatherDetails(code, temp, serverTime) {
  code = Number(code);
  const isNight = isNightTime(serverTime);
  let result = { text: "", icon: "" };

  if (code >= 95) {
    result.text = "Thunderstorm";
    result.icon = weatherIcons.thunderstorm;
  } else if ((code >= 71 && code <= 77) || (code >= 85 && code <= 86)) {
    result.text = "Snow";
    result.icon = weatherIcons.snow;
  } else if ((code >= 51 && code <= 67) || (code >= 80 && code <= 82)) {
    result.text = "Rain";
    result.icon = weatherIcons.rain;
  } else if (code >= 2 && code <= 48) {
    result.text = "Cloudy";
    result.icon = weatherIcons.cloudy;
  } else if ((code === 0 || code === 1) && temp > 40) {
    result.text = "Extreme Heat";
    result.icon = weatherIcons.extremeHeat;
  } else if (code === 0 || code === 1) {
    if (isNight) {
      result.text = "Clear Night";
      result.icon = weatherIcons.clearNight;
    } else {
      result.text = "Sunny";
      result.icon = weatherIcons.sunny;
    }
  } else {
    result.text = "Unknown";
    result.icon = weatherIcons.cloudy;
  }
  return result;
}
