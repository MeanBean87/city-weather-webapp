// This array is used to populate the state select element
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

const apiKey = "c3a67a6baa2b74fa79ed801bde2fc0a9";
const $currentweatherEl = $(".current-weather");
const $fiveDayForecastEl = $(".five-day-forecast");
const $weatherEl = $(".weather");
const $fiveDayForecastContainerEl = $(".five-day-forecast-container");
const $savedCitiesEl = $("#saved-cities");
const $cityInput = $("#city-name");
const $stateSelect = $("#state");
const $recentSearchTextEl = $(".recent-search-text");

// These functions store the API URL for each endpoint and then call the fetchData function
// This function gets the city information from the OpenWeatherMap Geo API
const getCityInfo = async (cityName) => {
  const url = `https://api.openweathermap.org/geo/1.0/direct?q=${encodeURIComponent(
    cityName
  )}&limit=20&appid=${apiKey}`;
  return await fetchData(url);
};

// This function gets the current weather from the OpenWeatherMap Daily forecast API using longitude and latitude
const getCurrentWeatherCoordinates = async (lat, lon) => {
  const url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=imperial`;
  return await fetchData(url);
};

// This function gets the 5 day forecast from the OpenWeatherMap five day forecast API using longitude and latitude
const getFiveDayForecastCoordinates = async (lat, lon) => {
  const url = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${apiKey}&units=imperial`;
  return await fetchData(url);
};

// Fetch function to get data from OpenWeatherMap API all of the above functions use this function
const fetchData = async (url) => {
  try {
    const response = await fetch(url);
    const data = await response.json();
    return data;
  } catch (error) {
    console.log(error);
    throw error;
  }
};

// This function updates the local storage with the city and state name
// It also checks to see if the city and state already exist in the local storage
// and if it does it will not add it again.
// it will also remove the first item in the array if the array length is greater than 8
const  updateLocalStorage = (cityName, stateName) => {
  let $tempStorage = JSON.parse(localStorage.getItem("locations"));

  if (!Array.isArray($tempStorage)) {
    $tempStorage = [];
  }

  let locationExists = false;

  for (const location of $tempStorage) {
    if (location.city === cityName && location.state === stateName) {
      locationExists = true;
      break;
    }
  }

  if (!locationExists) {
    $tempStorage.push({ city: cityName, state: stateName });
    if ($tempStorage.length > 8) {
      $tempStorage.shift();
    }
    localStorage.setItem("locations", JSON.stringify($tempStorage));
    renderSavedCityButtons();
  }
}

// This will clear the current weather and five day forecast elements from the page
// and then append the current weather.
const clearAndDisplayCurrentWeather = () => {
  $currentweatherEl.empty();
  $fiveDayForecastEl.empty();
  $currentweatherEl.css("display", "flex");
  $fiveDayForecastContainerEl.css("display", "flex");
  resetInputFields();
}

// This function appends the current weather to the page
const appendCurrentWeather = (cityName, stateName, currentWeatherObj) => {
  $currentweatherEl.append(`
  <h2 class="current-weather-title">Current Weather</h2>
  <h2 class="city-title">${cityName}, ${stateName} ${dayjs
    .unix(currentWeatherObj.dt)
    .format("MM/DD/YYYY")}</h2>
    <img src="https://openweathermap.org/img/wn/${
      currentWeatherObj.weather[0].icon
    }.png"></img>
    <p>Temperature: ${currentWeatherObj.main.temp}°F</p>
    <p>Wind: ${currentWeatherObj.wind.speed}MPH</p>
    <p>Humidity: ${currentWeatherObj.main.humidity}%</p>
    `);
}

// This is the function that creates the elements on the page and appends them to the DOM
const createElements = (
  currentWeatherObj,
  fiveDayForecastObj,
  cityName,
  stateName
) => {
  clearAndDisplayCurrentWeather();
  appendCurrentWeather(cityName, stateName, currentWeatherObj);
  let storedIndexes = findNoonIndexes(fiveDayForecastObj);
  appendFiveDayForecast(storedIndexes, fiveDayForecastObj);
}

// This for loop will find the indexes of the 5 day forecast array that contain the
// 12:00:00 time stamp and store them in an array. This is done because the API returns
// 40 objects in the array and we only want the 5 day forecast at noon.
const findNoonIndexes = (array) => {
  let storedIndexes = [];

  for (let i = 0; i < array.list.length; i++) {
    if (array.list[i].dt_txt.includes("12:00:00")) {
      storedIndexes.push(i);
    }
  }
  return storedIndexes;
}

// This for loop will append the 5 day forecast cards to the page using the stored indexes
// from the previous for loop.
const appendFiveDayForecast = (storedIndexes, fiveDayForecastObj) => {
  for (let i = 0; i < storedIndexes.length; i++) {
    $fiveDayForecastEl.append(
      `<card id="day-${[i]}">
          <h3>${dayjs
            .unix(fiveDayForecastObj.list[storedIndexes[i]].dt)
            .format("MM/DD/YYYY")}</h3>
            <img src="https://openweathermap.org/img/wn/${
              fiveDayForecastObj.list[storedIndexes[i]].weather[0].icon
            }.png"></img>
            <p>Temperature: ${
              fiveDayForecastObj.list[storedIndexes[i]].main.temp
            }°F</p>
            <p>Wind: ${
              fiveDayForecastObj.list[storedIndexes[i]].wind.speed
            }MPH</p>
            <p>Humidity: ${
              fiveDayForecastObj.list[storedIndexes[i]].main.humidity
            }%</p>
            </card>
            `
    );
  }
}

// This function creates the buttons for the saved cities from local storage.
// It also adds an event listener to each button that will call the renderContent
const renderSavedCityButtons = () => {
  const $tempStorage = JSON.parse(localStorage.getItem("locations"));
  $($savedCitiesEl).empty();
  $recentSearchTextEl.text("");
  $.each($tempStorage, function (index, location) {
    const $button = $("<button>", {
      value: location.state,
      text: location.city,
    });
    $savedCitiesEl.append($button);
    $recentSearchTextEl.text("Recent Searches");
  });

  $($savedCitiesEl).on("mousedown", "button", function (event) {
    const clickedCityName = $(this).text();
    const clickedStateName = $(this).val();
    renderContent(clickedCityName, clickedStateName);
  });
}

// Fuzzy search function from Fuse.js, this checks the objects array for the closest match
// to the string. In this case it will consume the state name and return the closest matching
// object from getCityInfo state key value pair.
const fuzzySearch = (string, array) => {
  const options = {
    includeScore: true,
    keys: ["state"],
  };
  const fuse = new Fuse(array, options);
  let result = fuse.search(string);
  return result;
}

// This function will reset the input fields to the placeholder text
const resetInputFields = () => {
  $(".input-field").each(function () {
    let placeholder = $(this).attr("placeholder");
    $(this).val(placeholder);
  });
}

// Calls the fetch functions verifies the city exists and is from the correct state
// and passes the data to the createElements function
const validateCityAndState = (stateName, foundCityObj) => {
  if (foundCityObj.length === 0 || stateName !== foundCityObj[0].item.state) {
    displayErrorMessage();
  } else {
    const { name, state, lat, lon } = foundCityObj[0].item;
    updateLocalStorage(name, state);
    fetchWeatherData(name, state, lat, lon);
  }
};

//Shows error message if city is not found
const displayErrorMessage = () => {
  $currentweatherEl.css("display", "none");
  $fiveDayForecastContainerEl.css("display", "none");
  $weatherEl.append(`<h2 id="error-text">No results found</h2>`);
  $savedCitiesEl.removeClass("disabled");
};

// This function calls the fetch functions and passes the data to the createElements function
const fetchWeatherData = async (cityName, stateName, lat, lon) => {
  try {
    const currentWeatherObj = await getCurrentWeatherCoordinates(lat, lon);
    const fiveDayForecastObj = await getFiveDayForecastCoordinates(lat, lon);
    clearAndDisplayCurrentWeather();
    appendCurrentWeather(cityName, stateName, currentWeatherObj);
    const storedIndexes = findNoonIndexes(fiveDayForecastObj);
    appendFiveDayForecast(storedIndexes, fiveDayForecastObj);
  } catch (error) {
    console.error("An error occurred:", error);
  } finally {
    $savedCitiesEl.removeClass("disabled");
  }
};

// This function calls the fuzzy search function and then calls the validateCityAndState function
const renderContent = async (cityName, stateName) => {
  $savedCitiesEl.addClass("disabled");
  try {
    const foundCityObj = await fuzzySearch(
      stateName,
      await getCityInfo(cityName)
    );
    validateCityAndState(stateName, foundCityObj);
  } catch (error) {
    console.error("An error occurred:", error);
  }
};

// Document ready function
$(document).ready(function () {
  // This for loop will populate the state select element with the state names array
  $.each(stateNames, function (index, stateName) {
    const $option = $("<option>", { value: stateName, text: stateName });
    $stateSelect.append($option);
  });

  // This will call the makeButtons function on page load
  renderSavedCityButtons();

  // This event listener will call the renderContent function when the form is submitted
  $("form").on("submit", function (event) {
    event.preventDefault();
    if ($cityInput.val() !== "" && $stateSelect.val() !== "") {
      const cityName = $cityInput.val().trim();
      const stateName = $stateSelect.val();
      renderContent(cityName, stateName);
    }
  });
});
