import React, { useState } from "react";
import ReactDOM from "react-dom";

const AnecdoteOfTheDay = ({ anecdote, vote, handleVote, handleSelect }) => {
  return (
    <div>
      <h2>Anecdote of the day</h2>
      <p>{anecdote}</p>
      <p>Has {vote} votes</p>

      <button onClick={handleVote}>Vote</button>
      <button onClick={handleSelect}>Next anecdote</button>
    </div>
  );
};

const AnecdoteWithMostVotes = ({ bestAnecdote, maxVote }) => {
  return (
    <div>
      <h2>Anecdote with most votes</h2>
      {maxVote ? (
        <div>
          <p>{bestAnecdote}</p>
          <p>Has {maxVote} votes</p>
        </div>
      ) : (
        <p>No votes given</p>
      )}
    </div>
  );
};

const App = () => {
  const [selected, setSelected] = useState(0);
  const [points, setPoints] = useState(Array(anecdotes.length).fill(0));

  let rand = generateRandom(anecdotes.length);
  const maxVote = Math.max(...points);
  const bestAnecdote = anecdotes[points.indexOf(maxVote)];

  const handleSelect = () => {
    let newSelected =
      selected !== rand ? rand : generateRandom(anecdotes.length);
    setSelected(newSelected);
  };

  const handleVote = () => {
    const newPoints = [...points];
    newPoints[selected] += 1;
    setPoints(newPoints);
  };

  return (
    <div>
      <AnecdoteOfTheDay
        anecdote={anecdotes[selected]}
        vote={points[selected]}
        handleVote={handleVote}
        handleSelect={handleSelect}
      />
      <AnecdoteWithMostVotes bestAnecdote={bestAnecdote} maxVote={maxVote} />
    </div>
  );
};

function generateRandom(length) {
  return Math.floor(Math.random() * length);
}

const anecdotes = [
  "If it hurts, do it more often",
  "Adding manpower to a late software project makes it later!",
  "The first 90 percent of the code accounts for the first 90 percent of the development time...The remaining 10 percent of the code accounts for the other 90 percent of the development time.",
  "Any fool can write code that a computer can understand. Good programmers write code that humans can understand.",
  "Premature optimization is the root of all evil.",
  "Debugging is twice as hard as writing the code in the first place. Therefore, if you write the code as cleverly as possible, you are, by definition, not smart enough to debug it.",
];

ReactDOM.render(<App anecdotes={anecdotes} />, document.getElementById("root"));
