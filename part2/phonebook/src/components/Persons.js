import React from "react";
import Person from "./Person";

function Persons({ persons, filter, handleDelete }) {
  return (
    <div>
      {persons
        .filter((person) =>
          person.name.toLowerCase().includes(filter.toLowerCase())
        )
        .map((filteredPerson) => (
          <Person
            key={filteredPerson.name}
            person={filteredPerson}
            handleDelete={handleDelete}
          />
        ))}
    </div>
  );
}

export default Persons;
