import React, { useState, useEffect } from "react";
import Country from "./components/Country";
import Countries from "./components/Countries";
import axios from "axios";

function App() {
  const [filter, setFilter] = useState("");
  const [countries, setCountries] = useState([]);

  useEffect(() => {
    axios.get("https://restcountries.eu/rest/v2/all").then((res) => {
      setCountries(res.data);
    });
  }, []);

  const handleChange = (e) => {
    setFilter(e.target.value);
  };

  const countriesToDisplay =
    filter &&
    countries.filter((country) =>
      country.name.toLowerCase().includes(filter.toLowerCase())
    );

  return (
    <div className="App">
      <label>
        Find countries{" "}
        <input value={filter} onChange={handleChange} type="search" />
      </label>

      {countriesToDisplay.length === 1 ? (
        <Country country={countriesToDisplay[0]} />
      ) : (
        <Countries countries={countriesToDisplay ? countriesToDisplay : []} />
      )}
    </div>
  );
}

export default App;
