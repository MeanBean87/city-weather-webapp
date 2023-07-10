const cities = ["New York", "Los Angeles", "Chicago", "Houston", "Louisville"];

async function getCityInfo(cityName) {
  return $.ajax({
    url: `${window.GEOCODING_API_URL}?q=${cityName}&appid=${window.API_KEY}`,
    method: "GET",
    dataType: "json",
  }).fail(function (jqXHR, textStatus, errorThrown) {
    console.log("Error:", textStatus, errorThrown);
  });
}

async function getCurrentWeatherCoordinates(lat, lon) {
  return $.ajax({
    url: `${window.CURRENT_DAY_API_URL}?lat=${lat}&lon=${lon}&appid=${window.API_KEY}&units=imperial`,
    method: "GET",
    dataType: "json",
  }).fail(function (jqXHR, textStatus, errorThrown) {
    console.log("Error:", textStatus, errorThrown);
  });
}

async function getFiveDayForecastCoordinates(lat, lon) {
  return $.ajax({
    url: `${window.FIVE_DAY_API_URL}?lat=${lat}&lon=${lon}&appid=${window.API_KEY}&units=imperial`,
    method: "GET",
    dataType: "json",
  }).fail(function (jqXHR, textStatus, errorThrown) {
    console.log("Error:", textStatus, errorThrown);
  });
}

async function getCurrentWeather(cityName) {
  return $.ajax({
    url: `${window.CURRENT_DAY_API_URL}?q=${cityName}&appid=${window.API_KEY}&units=imperial`,
    method: "GET",
    dataType: "json",
  }).fail(function (jqXHR, textStatus, errorThrown) {
    console.log("Error:", textStatus, errorThrown);
  });
}

async function getFiveDayForecast(cityName) {
  return $.ajax({
    url: `${window.FIVE_DAY_API_URL}?q=${cityName}&appid=${window.API_KEY}&units=imperial`,
    method: "GET",
    dataType: "json",
  }).fail(function (jqXHR, textStatus, errorThrown) {
    console.log("Error:", textStatus, errorThrown);
  });
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

async function renderContent(cityName) {
  let cityObj = await getCityInfo(cityName);
  let resultIndex = searchResults(cityName, cityObj);

  if (resultIndex !== -1) {
    let currentWeatherObj = await getCurrentWeatherCoordinates(
      cityObj[resultIndex].lat,
      cityObj[resultIndex].lon
    );
    let fiveDayForecastObj = await getFiveDayForecastCoordinates(
      cityObj[resultIndex].lat,
      cityObj[resultIndex].lon
    );
    console.log("Pulling with Coords");
    createElements(currentWeatherObj, fiveDayForecastObj, cityObj, cityName);
  } else {
    let currentWeatherObj = await getCurrentWeather(cityName);
    let fiveDayForecastObj = await getFiveDayForecast(cityName);
    console.log("Pulling with City Name");
    createElements(currentWeatherObj, fiveDayForecastObj, cityObj, cityName);
  }
}
function removeSpecialCharacters(string) {
  return string.replace(/[^a-zA-Z0-9 ]/g, "").toLowerCase();
}

function searchResults(string, array) {
  let stringArray = removeSpecialCharacters(string).split(" ");
  let resultIndex = -1;

  for (let i = 0; i < array.length; i++) {
    if (stringArray.includes(array[i].state.toLowerCase())) {
      resultIndex = i;
      break;
    }
  }
  return resultIndex;
}

function createElements(
  currentWeatherObj,
  fiveDayForecastObj,
  cityObj,
  cityName
) {
  let index = searchResults(cityName, cityObj);
  let city = "";
  let state = "";
  if (index === -1) {
    city = cityName.charAt(0).toUpperCase() + cityName.slice(1);
  } else {
    city = cityObj[index].name;
    state = cityObj[index].state;
  }

  $(".current-weather").append(
    `<h2>${city}, ${state} ${dayjs
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
		  <p>Temperature: ${fiveDayForecastObj.list[storedIndexes[i]].main.temp}°F</p>
		  <p>Wind: ${fiveDayForecastObj.list[storedIndexes[i]].wind.speed}MPH</p>
		  <p>Humidity: ${fiveDayForecastObj.list[storedIndexes[i]].main.humidity}%</p>`
    );
  }
}

$(document).ready(function () {
  $("#search").on("click", function (event) {
    event.preventDefault();
    $(".current-weather").empty();
    $(".five-day-forecast").empty();
    const cityName = $("#city-name").val().toLowerCase();
    renderContent(cityName);
  });
});

async function getCityById(cityId) {
  return new Promise(function (resolve, reject) {
    const url = `https://meanbean87.github.io/city-list-API/city.list.min.json`;
    $.getJSON(url, function (data) {
      const city = data.find((city) => city.id === cityId);
      if (city) {
        resolve(city);
      } else {
        reject("City not found");
      }
    }).fail(function (jqxhr, textStatus, error) {
      console.log("Error:", textStatus, error);
      reject(error);
    });
  });
}

const cityId = 4299276;
getCityById(cityId)
  .then(function (city) {
    console.log(city);
  })
  .catch(function (error) {
    console.log(error);
  });
