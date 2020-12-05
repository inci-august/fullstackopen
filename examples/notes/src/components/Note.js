import React from "react";

const Note = ({ note, toggleImportance }) => {
  const label = note.important ? "Make not important" : "Make important";

  return (
    <li className="note">
      {note.content}
      <button onClick={toggleImportance}>{label}</button>
    </li>
  );
};

export default Note;
