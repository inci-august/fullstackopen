import React from "react";

function Person({ person }) {
  return (
    <p key={person.name}>
      {person.name} {person.number}
    </p>
  );
}

export default Person;
