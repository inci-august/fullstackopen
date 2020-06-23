import React from "react";

const CapitalWeather = ({ weather }) => {
  return (
    <div>
      {!weather ? (
        <p>...</p>
      ) : (
        <>
          <h2>Weather in {weather.location.name}</h2>

          <div>Temperature: {weather.current.temperature} Celcius</div>
          <img src={weather.current.weather_icons[0]} alt="" />
          <div>
            Wind: {weather.current.wind_speed} mph, Direction:{" "}
            {weather.current.wind_dir}
          </div>
        </>
      )}
    </div>
  );
};

export default CapitalWeather;
