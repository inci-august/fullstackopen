import React, { useState, useEffect } from "react";
import Country from "./components/Country";
import Countries from "./components/Countries";
import CountrySearch from "./components/CountrySearch";
import axios from "axios";

function App() {
  const [filter, setFilter] = useState("");
  const [countries, setCountries] = useState(null);

  const countriesToDisplay =
    filter &&
    countries.filter((country) =>
      country.name.toLowerCase().includes(filter.toLowerCase())
    );

  useEffect(() => {
    axios.get("https://restcountries.eu/rest/v2/all").then((res) => {
      setCountries(res.data);
    });
  }, []);

  const handleFilterChange = (e) => {
    setFilter(e.target.value);
  };

  const showInfo = (countryName) => {
    setFilter(countryName);
  };

  return (
    <div className="App">
      <CountrySearch filter={filter} onFilterChange={handleFilterChange} />

      {!countriesToDisplay ? null : countriesToDisplay.length === 1 ? (
        <Country country={countriesToDisplay[0]} />
      ) : (
        <Countries
          showInfo={showInfo}
          countries={countriesToDisplay ? countriesToDisplay : []}
        />
      )}
    </div>
  );
}

export default App;
