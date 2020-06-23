import React, { useState, useEffect } from "react";
import CapitalWeather from "./CapitalWeather";
import axios from "axios";

function Country({ country }) {
  const [weather, setWeather] = useState(null);
  const capital = country.capital;

  useEffect(() => {
    const api_key = process.env.REACT_APP_API_KEY;
    axios
      .get(
        `http://api.weatherstack.com/current?access_key=${api_key}&query=${capital}`
      )
      .then((res) => setWeather(res.data));
  }, [capital]);

  return (
    <div>
      <h1>{country.name}</h1>
      <p>Capital {country.capital}</p>
      <p>Population {country.population}</p>

      <h2>Languages</h2>
      {country.languages.map((language) => (
        <li key={language.name}>{language.name}</li>
      ))}

      <img
        style={{ margin: "20px 0" }}
        width="100px"
        src={country.flag}
        alt={`${country.name} flag`}
      />

      <CapitalWeather weather={weather} />
    </div>
  );
}

export default Country;
