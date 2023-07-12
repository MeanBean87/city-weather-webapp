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

// Functions to get data objects from OpenWeatherMap API

// This function gets the city information from the OpenWeatherMap Geo API
async function getCityInfo(cityName) {
  const url = `https://api.openweathermap.org/geo/1.0/direct?q=${encodeURIComponent(
    cityName
  )}&limit=20&appid=${apiKey}`;
  $("body").addClass("loading");
  $("#saved-cities").addClass("disabled");
  return await fetchData(url);
}

// This function gets the current weather from the OpenWeatherMap Daily forecast API using longitude and latitude
async function getCurrentWeatherCoordinates(lat, lon) {
  const url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=imperial`;
  return await fetchData(url);
}

// This function gets the 5 day forecast from the OpenWeatherMap five day forecast API using longitude and latitude
async function getFiveDayForecastCoordinates(lat, lon) {
  const url = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${apiKey}&units=imperial`;
  $("#saved-cities").removeClass("disabled");
  $("body").removeClass("loading");
  resetInputFields();
  return await fetchData(url);
}

// Fetch function to get data from OpenWeatherMap API all of the above functions use this function
async function fetchData(url) {
  try {
    const response = await fetch(url);
    const data = await response.json();
    await new Promise((resolve) => setTimeout(resolve, 500));
    return data;
  } catch (error) {
    console.log(error);
    throw error;
  }
}

// This function updates the local storage with the city and state name
// It also checks to see if the city and state already exist in the local storage
// and if it does it will not add it again.
// it will also remove the first item in the array if the array length is greater than 8
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
    if (tempStorage.length > 8) {
      tempStorage.shift();
    }
    localStorage.setItem("locations", JSON.stringify(tempStorage));
    makeButtons();
  }
}

// This is the function that creates the elements on the page and appends them to the DOM
function createElements(
  currentWeatherObj,
  fiveDayForecastObj,
  cityName,
  stateName
) {
  // This will clear the current weather and five day forecast elements from the page
  // and then append the current weather.
  $(".current-weather").empty();
  $(".five-day-forecast").empty();
  $(".current-weather").css("display", "flex");
  $(".five-day-forecast-container").css("display", "flex");
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

  // This for loop will find the indexes of the 5 day forecast array that contain the
  // 12:00:00 time stamp and store them in an array. This is done because the API returns
  // 40 objects in the array and we only want the 5 day forecast at noon.
  let storedIndexes = [];

  for (let i = 0; i < fiveDayForecastObj.list.length; i++) {
    if (fiveDayForecastObj.list[i].dt_txt.includes("12:00:00")) {
      storedIndexes.push(i);
    }
  }

  // This for loop will append the 5 day forecast cards to the page using the stored indexes
  // from the previous for loop.
  for (let i = 0; i < storedIndexes.length; i++) {
    $(".five-day-forecast").append(
      `<card id="day-${[i]}">
      <h3>${dayjs
        .unix(fiveDayForecastObj.list[storedIndexes[i]].dt)
        .format("MM/DD/YYYY")}</h3>
        <img src="${`http://openweathermap.org/img/wn/${
          fiveDayForecastObj.list[storedIndexes[i]].weather[0].icon
        }@2x.png`}"></img>
              <p>Temperature: ${
                fiveDayForecastObj.list[storedIndexes[i]].main.temp
              }°F</p>
              <p>Wind: ${
                fiveDayForecastObj.list[storedIndexes[i]].wind.speed
              }MPH</p>
              <p>Humidity: ${
                fiveDayForecastObj.list[storedIndexes[i]].main.humidity
              }%</p>`
    );
  }
}

// This function creates the buttons for the saved cities from local storage.
// It also adds an event listener to each button that will call the renderContent
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

  $($("#saved-cities")).on("mousedown", "button", function (event) {
    const clickedCityName = $(this).text();
    const clickedStateName = $(this).val();
    renderContent(clickedCityName, clickedStateName);
  });
}

// Fuzzy search function from Fuse.js, this checks the objects array for the closest match
// to the string. In this case it will consume the state name and return the closest matching
// object from getCityInfo state key value pair.
function fuzzySearch(string, array) {
  const options = {
    includeScore: true,
    keys: ["state"],
  };
  const fuse = new Fuse(array, options);
  let result = fuse.search(string);
  return result;
}

function resetInputFields() {
  // Assuming your input fields have class "input-field", you can select them using $(".input-field")
  $(".input-field").each(function () {
    var placeholder = $(this).attr("placeholder");
    $(this).val(placeholder);
  });
}

// Calls the fetch functions verifies the city exists and is from the correct state
// and passes the data to the createElements function
async function renderContent(cityName, stateName) {
  try {
    let foundCityObj = await fuzzySearch(
      stateName,
      await getCityInfo(cityName)
    );

    // This if statement will check to see if the city exists in the state
    // and if it does not it will display an error message
    if (foundCityObj.length === 0 || stateName !== foundCityObj[0].item.state) {
      $(".current-weather").css("display", "none");
      $(".five-day-forecast-container").css("display", "none");
      $(".weather").append(`<h2 id="error-text">No results found</h2>`);
      return;
    } else {
      $(".weather").find("#error-text").remove();
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
  } catch (error) {
    console.error("An error occurred:", error);
  }
}

function resetInputFields() {
  let inputField = $("#city-name");
  let placeholder = inputField.attr("placeholder");
  inputField.val("");
  let selectElement = $("#state");
  selectElement.val("");
}

// Document ready function
$(document).ready(function () {
  let $cityInput = $("#city-name");
  let $stateSelect = $("#state");

  // This for loop will populate the state select element with the state names array
  $.each(stateNames, function (index, stateName) {
    const $option = $("<option>", { value: stateName, text: stateName });
    $stateSelect.append($option);
  });

  // This will call the makeButtons function on page load
  makeButtons();

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
