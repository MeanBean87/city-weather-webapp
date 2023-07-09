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

let currentWeatherObj = {};
let fiveDayForecastObj = {};

function getCurrentWeather(cityName, stateName) {
	return $.ajax({
	  url: `${window.CURRENT_DAY_API_URL}?q=${cityName},${stateName}&appid=${window.API_KEY}&units=imperial`,
	  method: "GET",
	  dataType: "json",
	});
  }

  function getFiveDayForecast(cityName, stateName) {
	return $.ajax({
	  url: `${window.FIVE_DAY_API_URL}?q=${cityName},${stateName}&appid=${window.API_KEY}&units=imperial`,
	  method: "GET",
	  dataType: "json",
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
	  renderContent(cityName, stateName);
	} else {
	  renderContent(cityName, stateName);
	}
  }

  function renderContent(cityName, stateName) {
	getCurrentWeather(cityName, stateName)
	  .done(function (currentWeatherObj) {
		getFiveDayForecast(cityName, stateName)
		  .done(function (fiveDayForecastObj) {
			createElements(currentWeatherObj, fiveDayForecastObj);
		  })
		  .fail(function (jqXHR, textStatus, error) {
			console.log("Error: " + error);
		  });
	  })
	  .fail(function (jqXHR, textStatus, error) {
		console.log("Error: " + error);
	  });
  }

function createElements(currentWeatherObj, fiveDayForecastObj) {
  $(".current-weather").append(
    `<h2>${currentWeatherObj.name} ${dayjs.unix(currentWeatherObj.dt).format("MM/DD/YYYY")}</h2>
		<img src="${`http://openweathermap.org/img/wn/${currentWeatherObj.weather[0].icon}@2x.png`}"></img>
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
		  <h3>${dayjs.unix(fiveDayForecastObj.list[storedIndexes[i]].dt).format("MM/DD/YYYY")}</h3>
		  <img src="${`http://openweathermap.org/img/wn/${fiveDayForecastObj.list[storedIndexes[i]].weather[0].icon}@2x.png`}"></img>
		  <p>Temperature: ${fiveDayForecastObj.list[storedIndexes[i]].main.temp}°F</p>
		  <p>Wind: ${fiveDayForecastObj.list[storedIndexes[i]].wind.speed}MPH</p>
		  <p>Humidity: ${fiveDayForecastObj.list[storedIndexes[i]].main.humidity}%</p>`
    );
  }
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
	updateLocalStorage(cityName, stateName);
  });

  $("#city-name").autocomplete({
    source: cities,
  });

  $("#state-name").autocomplete({
    source: states,
  });

});

