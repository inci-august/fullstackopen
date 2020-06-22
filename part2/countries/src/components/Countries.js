import React from "react";

function Countries({ countries }) {
  return (
    <div>
      {countries.length >= 10 ? (
        <div>Too many matches, specify another filter</div>
      ) : (
        <ul>
          {countries.map((country) => (
            <li key={country.alpha3Code}>{country.name}</li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default Countries;
