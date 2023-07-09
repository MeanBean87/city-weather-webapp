function getWeather(cityName, stateCode) {
  $.ajax({
    url: `${window.API_URL}?q=${cityName},${stateCode}&appid=${window.API_KEY}&units=imperial`,
    method: "GET",
    dataType: "json",
  })

    .done(function (weatherData) {
      responseData = weatherData;
      console.log(weatherData);
    })

    .fail(function (jqXHR, textStatus, error) {
      console.log("Error: " + error);
    });
}

let responseData;

$("#search").on("click", function (event) {
  event.preventDefault();
  const cityName = $("#city-name").val();
  const stateCode = $("#state-name").val();
  getWeather(cityName, stateCode);
});
