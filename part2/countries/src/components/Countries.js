import React from "react";

function Countries({ countries, showInfo }) {
  return (
    <div style={{ margin: "20px 0" }}>
      {countries.length >= 10 ? (
        <div>Too many matches, specify another filter</div>
      ) : (
        <div>
          {countries.map((country) => (
            <div key={country.alpha3Code}>
              {country.name}{" "}
              <button onClick={() => showInfo(country.name)}>Show</button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default Countries;
