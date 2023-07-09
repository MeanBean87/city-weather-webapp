const states = [
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
  "AL",
  "AK",
  "AZ",
  "AR",
  "CA",
  "CO",
  "CT",
  "DE",
  "FL",
  "GA",
  "HI",
  "ID",
  "IL",
  "IN",
  "IA",
  "KS",
  "KY",
  "LA",
  "ME",
  "MD",
  "MA",
  "MI",
  "MN",
  "MS",
  "MO",
  "MT",
  "NE",
  "NV",
  "NH",
  "NJ",
  "NM",
  "NY",
  "NC",
  "ND",
  "OH",
  "OK",
  "OR",
  "PA",
  "RI",
  "SC",
  "SD",
  "TN",
  "TX",
  "UT",
  "VT",
  "VA",
  "WA",
  "WV",
  "WI",
  "WY",
];

const cities = [
  "New York",
  "Los Angeles",
  "Chicago",
  "Houston",
  "Phoenix",
  "Philadelphia",
  "San Antonio",
  "San Diego",
  "Dallas",
  "San Jose",
  "Austin",
  "Jacksonville",
  "Fort Worth",
  "Columbus",
  "San Francisco",
  "Charlotte",
  "Indianapolis",
  "Seattle",
  "Denver",
  "Washington",
  "Boston",
  "El Paso",
  "Detroit",
  "Nashville",
  "Portland",
  "Memphis",
  "Oklahoma City",
  "Las Vegas",
  "Louisville",
  "Baltimore",
  "Milwaukee",
  "Albuquerque",
  "Tucson",
  "Fresno",
  "Mesa",
  "Sacramento",
  "Atlanta",
  "Kansas City",
  "Colorado Springs",
  "Miami",
  "Raleigh",
  "Omaha",
  "Long Beach",
  "Virginia Beach",
  "Oakland",
  "Minneapolis",
  "Tampa",
  "Tulsa",
  "Arlington",
  "New Orleans",
];

function getCurrentWeather(cityName, stateName) {
  $.ajax({
    url: `${window.CURRENT_DAY_API_URL}?q=${cityName},${stateName}&appid=${window.API_KEY}&units=imperial`,
    method: "GET",
    dataType: "json",
  })

    .done(function (currentWeatherObj) {
      console.log(currentWeatherObj);
      return currentWeatherObj;
    })

    .fail(function (jqXHR, textStatus, error) {
      console.log("Error: " + error);
    });
}

function getFiveDayForecast(cityName, stateName) {
  $.ajax({
    url: `${window.FIVE_DAY_API_URL}?q=${cityName},${stateName}&appid=${window.API_KEY}&units=imperial`,
    method: "GET",
    dataType: "json",
  })

    .done(function (fiveDayForecastObj) {
      console.log(fiveDayForecastObj);
      return fiveDayForecastObj;
    })

    .fail(function (jqXHR, textStatus, error) {
      console.log("Error: " + error);
    });
}

function updateLocalStorage(cityName, stateName) {
  let tempStorage = JSON.parse(localStorage.getItem("locations")) || [];

  let locationExists = tempStorage.some(function () {
    return location.city === cityName && location.state === stateName;
  });

  if (!locationExists) {
    tempStorage.push({ city: cityName, state: stateName });
    localStorage.setItem("locations", JSON.stringify(tempStorage));
    renderContent(cityName, stateName);
  } else {
    renderContent(cityName, stateName);
  }
}

function renderContent(cityName, stateName) {
  updateLocalStorage(cityName, stateName);
  let currentWeatherObj = getCurrentWeather(cityName, stateName);
  let fiveDayForecastObj = getFiveDayForecast(cityName, stateName);
}

$(document).ready(function () {
  $("#search").on("click", function (event) {
    event.preventDefault();
    const cityName =
      $("#city-name").val().charAt(0).toUpperCase() +
      $("#city-name").val().slice(1);
    const stateName =
      $("#state-name").val().charAt(0).toUpperCase() +
      $("#state-name").val().slice(1);
	renderContent(cityName, stateName);
  });

  $("#city-name").autocomplete({
    source: cities,
  });

  $("#state-name").autocomplete({
    source: states,
  });
});
