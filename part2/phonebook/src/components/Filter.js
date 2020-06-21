import React from "react";

function Filter({ filter, onFilterChange }) {
  return (
    <div>
      Filter shown with <input value={filter} onChange={onFilterChange} />
    </div>
  );
}

export default Filter;
