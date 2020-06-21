import React from "react";

function PersonForm({
  onFormSubmit,
  onNameChange,
  nameValue,
  onNumberChange,
  numberValue,
}) {
  return (
    <form onSubmit={onFormSubmit}>
      <h2>Add a new</h2>
      <div>
        Name: <input onChange={onNameChange} value={nameValue} />
      </div>
      <div>
        Number: <input onChange={onNumberChange} value={numberValue} />
      </div>
      <div>
        <button type="submit">Add</button>
      </div>
    </form>
  );
}

export default PersonForm;
