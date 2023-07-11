const cities = ["New York", "Los Angeles", "Chicago", "Houston", "Louisville"];
import.meta.env;


const stateNames = [
  "Alabama",
  "Alaska",
  "Arizona",
  "Arkansas",
  "California",
  "Colorado",
  "Connecticut",
  "Delaware",
  "Florida",
  "Georgia",
  "Hawaii",
  "Idaho",
  "Illinois",
  "Indiana",
  "Iowa",
  "Kansas",
  "Kentucky",
  "Louisiana",
  "Maine",
  "Maryland",
  "Massachusetts",
  "Michigan",
  "Minnesota",
  "Mississippi",
  "Missouri",
  "Montana",
  "Nebraska",
  "Nevada",
  "New Hampshire",
  "New Jersey",
  "New Mexico",
  "New York",
  "North Carolina",
  "North Dakota",
  "Ohio",
  "Oklahoma",
  "Oregon",
  "Pennsylvania",
  "Rhode Island",
  "South Carolina",
  "South Dakota",
  "Tennessee",
  "Texas",
  "Utah",
  "Vermont",
  "Virginia",
  "Washington",
  "West Virginia",
  "Wisconsin",
  "Wyoming",
];

const apiKey = process.env.MY_SECRET_KEY
console.log (apiKey)

async function getCityInfo(cityName) {
  return await fetchData(
    `https://api.openweathermap.org/geo/1.0/direct?q=${encodeURIComponent(
      cityName
    )}&limit=20&appid=${apiKey}`
  );
}

async function getCurrentWeatherCoordinates(lat, lon) {
  return await fetchData(
    `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=imperial`
  );
}

async function getFiveDayForecastCoordinates(lat, lon) {
  return await fetchData(
    `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${apiKey}&units=imperial`
  );
}

async function fetchData(url) {
  try {
    const response = await fetch(url);
    const data = await response.json();
    return data;
  } catch (error) {
    console.log(error);
    throw error;
  }
}

function updateLocalStorage(cityName, stateName) {
  let tempStorage = JSON.parse(localStorage.getItem("locations"));

  if (!Array.isArray(tempStorage)) {
    tempStorage = [];
  }

  let locationExists = false;

  for (const location of tempStorage) {
    if (location.city === cityName && location.state === stateName) {
      locationExists = true;
      break;
    }
  }

  if (!locationExists) {
    tempStorage.push({ city: cityName, state: stateName });
    localStorage.setItem("locations", JSON.stringify(tempStorage));
  }
}

async function renderContent(cityName, stateName) {
  let foundCityObj = await fuzzySearch(stateName, await getCityInfo(cityName));
  if (stateName !== foundCityObj[0].item.state) {
    $(".current-weather").empty();
    $(".current-weather").append(
      `<h2 id="error-text" class="error-text">Could Not Find City</h2>`
    );
    $("#forecast-title").text("");
    return;
  } else {
    $(".current-weather").remove("#error-text");
    $("#forecast-title").text("5-Day Forecast:");
    let currentWeatherObj = await getCurrentWeatherCoordinates(
      foundCityObj[0].item.lat,
      foundCityObj[0].item.lon
    );
    let fiveDayForecastObj = await getFiveDayForecastCoordinates(
      foundCityObj[0].item.lat,
      foundCityObj[0].item.lon
    );
    updateLocalStorage(foundCityObj[0].item.name, foundCityObj[0].item.state);
    createElements(
      currentWeatherObj,
      fiveDayForecastObj,
      foundCityObj[0].item.name,
      foundCityObj[0].item.state
    );
  }
}

function fuzzySearch(string, array) {
  const options = {
    includeScore: true,
    keys: ["state"],
  };
  const fuse = new Fuse(array, options);
  let result = fuse.search(string);
  return result;
}

function createElements(
  currentWeatherObj,
  fiveDayForecastObj,
  cityName,
  stateName
) {
  $(".current-weather").empty();
  $(".current-weather").append(
    `<h2 class="current-weather-title">Current Weather</h2>
    <h2 class="city-title">${cityName}, ${stateName} ${dayjs
      .unix(currentWeatherObj.dt)
      .format("MM/DD/YYYY")}</h2>
      <img src="${`http://openweathermap.org/img/wn/${currentWeatherObj.weather[0].icon}@2x.png`}"></img></h2>
		<p>Temperature: ${currentWeatherObj.main.temp}°F</p>
		<p>Wind: ${currentWeatherObj.wind.speed}MPH</p>
		<p>Humidity: ${currentWeatherObj.main.humidity}%</p>`
  );

  let storedIndexes = [];

  for (let i = 0; i < fiveDayForecastObj.list.length; i++) {
    if (fiveDayForecastObj.list[i].dt_txt.includes("12:00:00")) {
      storedIndexes.push(i);
    }
  }

  $(".five-day-forecast").append(
    `<h3 id="forecast-title">5-Day Forecast:</h3>`
  );

  for (let i = 0; i < storedIndexes.length; i++) {
    $(".five-day-forecast").append(
      `<card id="day-${[i]}">
		  <h3>${dayjs
        .unix(fiveDayForecastObj.list[storedIndexes[i]].dt)
        .format("MM/DD/YYYY")}</h3>
		  <img src="${`http://openweathermap.org/img/wn/${
        fiveDayForecastObj.list[storedIndexes[i]].weather[0].icon
      }@2x.png`}"></img>
		  <p>High: ${fiveDayForecastObj.list[storedIndexes[i]].main.temp}°F</p>
		  <p>Wind: ${fiveDayForecastObj.list[storedIndexes[i]].wind.speed}MPH</p>
		  <p>Humidity: ${fiveDayForecastObj.list[storedIndexes[i]].main.humidity}%</p>`
    );
  }
  makeButtons();
}

function makeButtons() {
  const tempStorage = JSON.parse(localStorage.getItem("locations"));

  $("#saved-cities").empty();

  $.each(tempStorage, function (index, location) {
    const $button = $("<button>", {
      value: location.state,
      text: location.city,
    });
    $("#saved-cities").append($button);
  });

  $($("#saved-cities")).on("click", "button", function (event) {
    const clickedCityName = $(this).text();
    const clickedStateName = $(this).val();
    renderContent(clickedCityName, clickedStateName);
    $(".current-weather").empty();
    $(".five-day-forecast").empty();
  });
}

$(document).ready(function () {
  const $cityInput = $("#city-name");
  const $stateSelect = $("#state");

  $.each(stateNames, function (index, stateName) {
    const $option = $("<option>", { value: stateName, text: stateName });
    $stateSelect.append($option);
  });

  makeButtons();

  $("form").on("submit", function (event) {
    event.preventDefault();
    if ($cityInput.val() !== "" && $stateSelect.val() !== "") {
      const cityName = $cityInput.val().trim();
      const stateName = $stateSelect.val();
      renderContent(cityName, stateName);
    }
  });
});
