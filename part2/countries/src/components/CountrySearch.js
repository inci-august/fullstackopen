import React from "react";

const CountrySearch = ({ filter, onFilterChange }) => {
  return (
    <div style={{ margin: "20px 0" }}>
      Find countries{" "}
      <input value={filter} onChange={onFilterChange} type="search" />
    </div>
  );
};

export default CountrySearch;
