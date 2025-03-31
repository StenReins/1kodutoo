/*Genereerimiseks kasutatud gpt-4o

Create a HTML digital clock, which is able to display the current time, current date (day of the week, day number, month, year), current weather and temperature. Add controls to be able to switch:
    the timezone (location)
    Celsius to fahrenheit and vice versa
    font
    font size (in px)
    font color
    clock background color
    toggle dark mode
    switch between 12- and 24 hour format
Add the ability to drag the clock around with a mouse and resize the box.
Also, generate a basic css design to accompany it. Use the Bulma framework.*/

let currentWeatherData = {
        temperatureC: null,
        isCelsius: true
    },
    is24Hour = false;
const timezoneToLatLon = {
    "Europe/Tallinn": {
        lat: 59,
        lon: 26
    },
    "America/New_York": {
        lat: 40.7128,
        lon: -74.0060
    },
    "Europe/London": {
        lat: 51.5072,
        lon: -0.1276
    },
    "Asia/Tokyo": {
        lat: 35.6895,
        lon: 139.6917
    },
    "Australia/Sydney": {
        lat: -33.865143,
        lon: 151.2099
    }
};
const weatherCodeMap = {
    0: "Clear sky",
    1: "Mainly clear",
    2: "Partly cloudy",
    3: "Overcast",
    45: "Fog",
    48: "Depositing rime fog",
    51: "Drizzle (Light)",
    53: "Drizzle (Moderate)",
    55: "Drizzle (Dense)",
    61: "Rain (Slight)",
    63: "Rain (Moderate)",
    65: "Rain (Heavy)",
    80: "Rain showers (Slight)",
    81: "Rain showers (Moderate)",
    82: "Rain showers (Violent)",
    95: "Thunderstorm",
    96: "Thunderstorm with hail"
};

function getWeatherDescription(e) {
    return weatherCodeMap[e] || "Unknown"
}

function updateClock() {
    const timezone = document.getElementById('timezone-select').value;
    const now = new Date();
    const timeString = now.toLocaleTimeString('en-US', {
        timeZone: timezone,
        hour12: !is24Hour
    });
    const dateString = now.toLocaleDateString('en-US', {
        timeZone: timezone,
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric'
    });
    document.getElementById('time').textContent = timeString;
    document.getElementById('date').textContent = dateString;
};
async function updateWeather() {
    const timezone = document.getElementById('timezone-select').value;
    const {
        lat,
        lon
    } = timezoneToLatLon[timezone] || timezoneToLatLon["Estonia/Tallinn"];
    const url =
        `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true`;
    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error('Weather data not available');
        }
        const data = await response.json();
        const tempC = data.current_weather.temperature;
        const code = data.current_weather.weathercode;
        const weatherDescription = getWeatherDescription(code);
        currentWeatherData.temperatureC = tempC;
        displayWeather(weatherDescription);
    } catch (error) {
        document.getElementById('weather').textContent = 'Error fetching weather data.';
    }
}

function displayWeather(weatherDescription) {
    if (currentWeatherData.temperatureC == null) {
        document.getElementById('weather').textContent = 'Weather data not available.';
        return;
    }
    let temperatureText;
    if (currentWeatherData.isCelsius) {
        temperatureText = `${currentWeatherData.temperatureC.toFixed(1)} °C`;
    } else {
        const tempF = currentWeatherData.temperatureC * 9 / 5 + 32;
        temperatureText = `${tempF.toFixed(1)} °F`;
    }
    const weatherHTML = ` <p>Condition: ${weatherDescription}</p> <p>Temperature: ${temperatureText}</p> `;
    document.getElementById('weather').innerHTML = weatherHTML;
}

function initControls() {
    document.getElementById("timezone-select").addEventListener("change", () => {
        updateClock(), updateWeather()
    }), document.getElementById("toggle-temp-btn").addEventListener("click", () => {
        currentWeatherData.isCelsius = !currentWeatherData.isCelsius, document.getElementById(
                "toggle-temp-btn").textContent = currentWeatherData.isCelsius ? "Show °F" : "Show °C",
            displayWeather()
    });
    const e = document.getElementById("fontSelect"),
        t = document.getElementById("fontSizeSelect"),
        n = document.getElementById("time"),
        o = document.getElementById("date"),
        a = document.getElementById("fontColorPicker");
    e.addEventListener("change", () => {
        n.style.fontFamily = e.value, o.style.fontFamily = e.value
    }), t.addEventListener("change", () => {
        n.style.fontSize = t.value, o.style.fontSize = t.value
    }), a.addEventListener("input", () => {
        n.style.color = a.value, o.style.color = a.value
    });
    const r = document.getElementById("bgColorPicker");
    r.addEventListener("input", () => {
        document.querySelector(".clock-container").style.backgroundColor = r.value
    });
    const l = document.getElementById("upload-bg");
    l.addEventListener("change", function (e) {
        const t = e.target.files[0];
        if (!t) return;
        const n = new FileReader;
        n.onload = function (e) {
            document.body.style.backgroundImage = `url(${e.target.result})`, document.body.style
                .backgroundSize = "cover", document.body.style.backgroundPosition = "center"
        }, n.readAsDataURL(t)
    });
    const i = document.getElementById("darkModeBtn");
    i.addEventListener("click", () => {
        const e = document.body,
            t = document.querySelector("h1.title");
        e.classList.contains("light-mode") ? (e.classList.remove("light-mode"), e.classList.add(
            "dark-mode"), t && (t.style.color = "#ffffff")) : (e.classList.remove("dark-mode"), e
            .classList.add("light-mode"), t && (t.style.color = "#000000"))
    });
    const s = document.getElementById("toggleFormatBtn");
    s.addEventListener("click", () => {
        is24Hour = !is24Hour, s.textContent = is24Hour ? "Switch to 12-hour" : "Switch to 24-hour",
            updateClock()
    })
}

function initDragAndResize() {
    const e = document.getElementById("draggable-clock"),
        t = document.getElementById("resize-handle");
    let n = 0,
        o = 0,
        a = !1,
        r = !1,
        l = 0,
        i = 0,
        s = 0,
        c = 0;
    e.addEventListener("mousedown", d => {
        if (d.target.id === "resize-handle") return;
        a = !0, n = d.clientX - e.offsetLeft, o = d.clientY - e.offsetTop
    }), document.addEventListener("mousemove", d => {
        if (!a) return;
        d.preventDefault(), e.style.left = d.clientX - n + "px", e.style.top = d.clientY - o + "px"
    }), document.addEventListener("mouseup", () => {
        a = !1
    }), t.addEventListener("mousedown", d => {
        r = !0, d.stopPropagation(), l = e.offsetWidth, i = e.offsetHeight, s = d.clientX, c = d.clientY
    }), document.addEventListener("mousemove", d => {
        if (!r) return;
        let u = l + (d.clientX - s),
            m = i + (d.clientY - c);
        u > 100 && (e.style.width = u + "px"), m > 50 && (e.style.height = m + "px")
    }), document.addEventListener("mouseup", () => {
        r = !1
    })
}

function init() {
    initControls(), initDragAndResize(), updateClock(), updateWeather(), setInterval(updateClock, 1e3)
}
document.addEventListener("DOMContentLoaded", init);