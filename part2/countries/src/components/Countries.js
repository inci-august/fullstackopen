import React from "react";

function Countries({ countries }) {
  return (
    <div style={{ margin: "20px 0" }}>
      {countries.length >= 10 ? (
        <div>Too many matches, specify another filter</div>
      ) : (
        <div>
          {countries.map((country) => (
            <div key={country.alpha3Code}>{country.name}</div>
          ))}
        </div>
      )}
    </div>
  );
}

export default Countries;
