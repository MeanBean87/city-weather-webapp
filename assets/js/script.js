const cities = ["New York", "Los Angeles", "Chicago", "Houston", "Louisville"];

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

async function getCityInfo(cityName) {
  return await fetchData(
    `${window.GEOCODING_API_URL}?q=${encodeURIComponent(cityName)}&limit=20&appid=${window.API_KEY}`
  );
}

async function getCurrentWeatherCoordinates(lat, lon) {
  return await fetchData(
    `${window.CURRENT_DAY_API_URL}?lat=${lat}&lon=${lon}&appid=${window.API_KEY}&units=imperial`
  );
}

async function getFiveDayForecastCoordinates(lat, lon) {
  return await fetchData(
    `${window.FIVE_DAY_API_URL}?lat=${lat}&lon=${lon}&appid=${window.API_KEY}&units=imperial`
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
  let currentWeatherObj = await getCurrentWeatherCoordinates(
    foundCityObj[0].item.lat,
    foundCityObj[0].item.lon
  );
  let fiveDayForecastObj = await getFiveDayForecastCoordinates(
    foundCityObj[0].item.lat,
    foundCityObj[0].item.lon
  );
  console.log(fiveDayForecastObj)
  createElements(currentWeatherObj, fiveDayForecastObj, foundCityObj[0].item.name, foundCityObj[0].item.state);
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
    `<h2>${cityName}, ${stateName} ${dayjs
      .unix(currentWeatherObj.dt)
      .format("MM/DD/YYYY")}
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
}

$(document).ready(function () {
  const $stateSelect = $("#state");
  const $cityInput = $("#city-name");

  $.each(stateNames, function (index, stateName) {
    const $option = $("<option>", { value: stateName, text: stateName });
    $stateSelect.append($option);
  });

  $("form").on("submit", function (event) {
    event.preventDefault();
    if ($cityInput.val() !== "" && $stateSelect.val() !== "") {
      const cityName = $cityInput.val();
      const stateName = $stateSelect.val();
      renderContent(cityName, stateName);
    }
  });
});

