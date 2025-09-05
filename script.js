// =========================
// Weather App JS (script.js)
// =========================

// API key (already integrated)
const API_KEY = "60303b0f3ae8644b3632967cc2fb9480";

// DOM Elements
const yourtab = document.querySelector(".your-weather");
const searchtab = document.querySelector(".search-weather");
const grantUI = document.querySelector(".grant-location");
const grantbtn = document.querySelector(".loc");
const loadingUI = document.querySelector(".loading");
const input_field = document.querySelector("[input-field]");
const searchform = document.querySelector("#search-tab");
const weatherUI = document.querySelector(".user-info");
const vid = document.querySelector(".src");
const video = document.querySelector(".vid");
const videox = document.querySelector(".vide");
const novideo = document.querySelector(".slash");
const videobtn = document.querySelector("#videox");
const err = document.querySelector(".error");
const forecastContainer = document.querySelector(".forecast-container");
const forecastAndAdvisory = document.querySelector(".forecast-and-advisory-container");
const advisoryElement = document.getElementById("advisory");

// New and corrected DOM selections for buttons
const volumebtn = document.getElementById("volumex");
const themeToggle = document.getElementById("themeToggle");
const volumeOnIcon = document.querySelector(".volo");
const volumeOffIcon = document.querySelector(".xmark");
const lightIcon = document.querySelector(".sun");
const darkIcon = document.querySelector(".moon");

let currenttab = yourtab;
const msg = new SpeechSynthesisUtterance();
const prop = {};

// Initial setup
volumeOnIcon.classList.remove("hidden");
volumeOffIcon.classList.add("hidden");
videox.classList.remove("hidden");
novideo.classList.add("hidden");
currenttab.classList.add("current-tab");

// Check for a saved theme preference on page load
const savedTheme = localStorage.getItem('theme');
if (savedTheme === 'dark') {
    document.body.classList.add('dark');
    lightIcon.classList.add('hidden');
    darkIcon.classList.remove('hidden');
} else {
    lightIcon.classList.remove("hidden");
    darkIcon.classList.add("hidden");
}

// =========================
// Event Listeners
// =========================
yourtab.addEventListener("click", () => switchtab(yourtab));
searchtab.addEventListener("click", () => switchtab(searchtab));
grantbtn.addEventListener("click", getlocation);
searchform.addEventListener("submit", (e) => {
    e.preventDefault();
    if (input_field.value === "") return;
    fetchsearchweather(input_field.value);
});
videobtn.addEventListener("click", switchvideobtn);
volumebtn.addEventListener("click", switchvolumebtn);
themeToggle.addEventListener("click", switchTheme);


// =========================
// Function Definitions
// =========================

// Switches between "Your Weather" and "Search Weather" tabs
function switchtab(clickedtab) {
    if (clickedtab !== currenttab) {
        currenttab.classList.remove("current-tab");
        currenttab = clickedtab;
        currenttab.classList.add("current-tab");
        video.classList.add("hidden");
        stop();
    }

    if (!searchform.classList.contains("active")) {
        weatherUI.classList.remove("active");
        forecastAndAdvisory.classList.remove("active");
        stop();
        grantUI.classList.remove("active");
        err.classList.remove("active");
        searchform.classList.add("active");
    } else {
        searchform.classList.remove("active");
        weatherUI.classList.remove("active");
        err.classList.remove("active");
        getsessionstorage();
        video.classList.remove("hidden");
    }
}

// Gets user's geographical coordinates
function getlocation() {
    stop();
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(usercoords);
    } else {
        alert("Location Permission Denied ❌");
    }
}

// Handles the coordinates retrieved from geolocation
function usercoords(position) {
    const coordinates = {
        lats: position.coords.latitude,
        long: position.coords.longitude,
    };
    sessionStorage.setItem("user-coords", JSON.stringify(coordinates));
    fetchuserweather(coordinates);
}

// Fetches weather data based on user's location
async function fetchuserweather(position) {
    const lat = position.lats;
    const lon = position.long;

    grantUI.classList.remove("active");
    weatherUI.classList.remove("active");
    loadingUI.classList.add("active");
    stop();

    try {
        const response = await fetch(
            `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`
        );
        const data = await response.json();
        
        loadingUI.classList.remove("active");
        err.classList.remove("active");
        weatherUI.classList.add("active");
        volumebtn.classList.add("active");
        videobtn.classList.add("active");

        renderinfo(data);
        Object.assign(prop, data);
        fetchForecastAndAdvisory(lat, lon);
    } catch {
        loadingUI.classList.remove("active");
        err.classList.add("active");
    }
}

// Fetches weather data for a specified city
async function fetchsearchweather(loc) {
    loadingUI.classList.add("active");
    weatherUI.classList.remove("active");
    stop();

    try {
        const response = await fetch(
            `https://api.openweathermap.org/data/2.5/weather?q=${loc}&appid=${API_KEY}&units=metric`
        );
        const data = await response.json();

        loadingUI.classList.remove("active");
        weatherUI.classList.add("active");
        volumebtn.classList.add("active");
        videobtn.classList.add("active");

        renderinfo(data);
        Object.assign(prop, data);
        fetchForecastAndAdvisory(data.coord.lat, data.coord.lon);
    } catch {
        loadingUI.classList.remove("active");
        err.classList.add("active");
    }
}

// Renders the fetched weather information onto the UI
function renderinfo(stats) {
    const cityname = document.querySelector("[city-name]");
    const countryicon = document.querySelector("[country-icon]");
    const weatherdes = document.querySelector("[weather-desc]");
    const weathericon = document.querySelector("[weather-icon]");
    const temp = document.querySelector("[temp]");
    const windspeed = document.querySelector("[windspeed]");
    const humidity = document.querySelector("[humidity]");
    const cloud = document.querySelector("[cloud]");
    const pressure = document.querySelector("[pressure]");
    const sunrise = document.querySelector("[sunrise]");
    const sunset = document.querySelector("[sunset]");

    cityname.innerText = stats?.name;
    countryicon.src = `https://flagcdn.com/144x108/${stats?.sys?.country.toLowerCase()}.png`;
    weatherdes.innerText = stats?.weather[0]?.description;
    weathericon.src = `https://openweathermap.org/img/wn/${stats?.weather[0]?.icon}@2x.png`;
    temp.innerText = `${stats?.main?.temp} °C`;
    windspeed.innerText = `${stats?.wind?.speed} m/s`;
    humidity.innerText = `${stats?.main?.humidity}%`;
    cloud.innerText = `${stats?.clouds?.all}%`;
    pressure.innerText = `${stats?.main?.pressure} hPa`;
    
    const sunriseTime = new Date(stats?.sys?.sunrise * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const sunsetTime = new Date(stats?.sys?.sunset * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    sunrise.innerText = sunriseTime;
    sunset.innerText = sunsetTime;
    
    bgchange(stats?.weather[0]?.main);
}

// Changes the background video based on weather conditions
function bgchange(main) {
    video.classList.remove("hidden");
    if (main === "Clear") vid.src = "video/clear.mp4";
    else if (main === "Thunderstorm") vid.src = "video/light.mp4";
    else if (main === "Drizzle" || main === "Rain") vid.src = "video/rain.mp4";
    else if (main === "Snow") vid.src = "video/snow.mp4";
    else if (
        ["Mist", "Smoke", "Haze", "Dust", "Fog", "Sand", "Ash", "Squall", "Tornado"].includes(main)
    )
        vid.src = "video/fog.mp4";
    else if (main === "Clouds") vid.src = "video/clouds.mp4";
    
    video.load();
}

// Fetches 5-day forecast and advisory data
async function fetchForecastAndAdvisory(lat, lon) {
    try {
        const forecastResponse = await fetch(
            `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`
        );
        const forecastData = await forecastResponse.json();
        renderForecast(forecastData);
        renderAdvisory(forecastData);
        forecastAndAdvisory.classList.add("active");
    } catch (e) {
        console.error("Failed to fetch forecast or advisory data:", e);
    }
}

// Renders the 5-day forecast
function renderForecast(data) {
    forecastContainer.innerHTML = "";
    const dailyForecasts = data.list.filter(item => item.dt_txt.includes("12:00:00"));

    dailyForecasts.forEach(forecast => {
        const date = new Date(forecast.dt * 1000);
        const day = date.toLocaleString('en-US', { weekday: 'short' });
        const temp = `${Math.round(forecast.main.temp)}°C`;
        const icon = `https://openweathermap.org/img/wn/${forecast.weather[0].icon}@2x.png`;
        const description = forecast.weather[0].description;
        
        const cardHTML = `
            <div class="forecast-card">
                <p>${day}</p>
                <img src="${icon}" alt="${description}">
                <p>${description}</p>
                <p>${temp}</p>
            </div>
        `;
        forecastContainer.insertAdjacentHTML('beforeend', cardHTML);
    });
}

// Provides a weather-related advisory
function renderAdvisory(data) {
    const mainWeather = data.list[0].weather[0].main;
    let advisoryText = "Enjoy your day!";

    if (mainWeather === "Rain" || mainWeather === "Drizzle") {
        advisoryText = "Expect rain. Don't forget your umbrella!";
    } else if (mainWeather === "Thunderstorm") {
        advisoryText = "Thunderstorms are expected. Stay indoors and be safe!";
    } else if (mainWeather === "Snow") {
        advisoryText = "Snow is in the forecast. Drive carefully and dress warmly!";
    } else if (mainWeather === "Clear") {
        advisoryText = "A clear sky day. Great for outdoor activities!";
    } else if (["Mist", "Smoke", "Haze", "Dust", "Fog"].includes(mainWeather)) {
        advisoryText = "Poor visibility is expected. Drive with caution.";
    }

    advisoryElement.innerText = advisoryText;
}

// Checks for stored user coordinates and fetches weather if available
function getsessionstorage() {
    const localcord = sessionStorage.getItem("user-coords");
    if (localcord) {
        const coordinate = JSON.parse(localcord);
        fetchuserweather(coordinate);
    } else {
        grantUI.classList.add("active");
    }
}
getsessionstorage();

// Toggles the background video
function switchvideobtn() {
    videox.classList.toggle("hidden");
    novideo.classList.toggle("hidden");
    video.classList.toggle("hidden");
}

// Toggles the voice assistant (Text-to-Speech)
function switchvolumebtn() {
    if ("speechSynthesis" in window) {
        if (window.speechSynthesis.speaking) {
            stop();
        } else {
            const voicestr = voice_assist();
            msg.text = voicestr;
            window.speechSynthesis.getVoices();
            msg.voice = window.speechSynthesis.getVoices()[0];
            volumeOnIcon.classList.remove("hidden");
            volumeOffIcon.classList.add("hidden");
            window.speechSynthesis.speak(msg);
            alert("🎉 Voice Assistant Activated!");
        }
    } else {
        alert("❌ Your browser does not support speech synthesis.");
    }
}

// Constructs the string to be spoken by the voice assistant
function voice_assist() {
    const greeting = gettimestr();
    const temp = `${prop?.main?.temp}`;
    const city = prop?.name;
    const desc = prop?.weather[0]?.description;
    const windspeed = `${prop?.wind?.speed}`;
    const maxtemp = `${prop?.main?.temp_max}`;
    const mintemp = `${prop?.main?.temp_min}`;
    const humidity = `${prop?.main?.humidity}`;
    const cloud = `${prop?.clouds?.all}`;
    const sunrise = new Date(prop?.sys?.sunrise * 1000);
    const sunset = new Date(prop?.sys?.sunset * 1000);

    return `${greeting}, ${city}! Right now, we have ${desc} with a temperature of ${temp}°C. 
    Wind speed is ${windspeed} m/s. High of ${maxtemp}°C and low of ${mintemp}°C today. 
    Humidity: ${humidity}%. Clouds: ${cloud}%. 
    Sunrise at ${sunrise.getHours()}:${sunrise.getMinutes()}, Sunset at ${sunset.getHours()}:${sunset.getMinutes()}.`;
}

// Gets a time-based greeting
function gettimestr() {
    const d = new Date();
    const currhrs = d.getHours();
    if (currhrs < 12) return "Good Morning";
    else if (currhrs < 17) return "Good Afternoon";
    else return "Good Evening";
}

// Stops the voice assistant
function stop() {
    volumeOnIcon.classList.add("hidden");
    volumeOffIcon.classList.remove("hidden");
    window.speechSynthesis.cancel();
}

// Toggles Dark/Light mode and saves preference
function switchTheme() {
    document.body.classList.toggle('dark');
    
    const isDarkMode = document.body.classList.contains('dark');
    lightIcon.classList.toggle('hidden', isDarkMode);
    darkIcon.classList.toggle('hidden', !isDarkMode);
    
    if (isDarkMode) {
        localStorage.setItem('theme', 'dark');
    } else {
        localStorage.setItem('theme', 'light');
    }
}