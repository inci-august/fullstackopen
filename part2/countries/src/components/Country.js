import React from "react";

function Country({ country }) {
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
    </div>
  );
}

export default Country;
