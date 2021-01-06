import React, { useEffect, useState } from "react"
import Filter from "./components/Filter"
import Notification from "./components/Notification"
import PersonForm from "./components/PersonForm"
import Persons from "./components/Persons"
import personService from "./services/persons"

const App = () => {
  const [persons, setPersons] = useState([])
  const [newName, setNewName] = useState("")
  const [newNumber, setNewNumber] = useState("")
  const [filter, setFilter] = useState("")
  const [successMessage, setSuccessMessage] = useState(null)
  const [errorMessage, setErrorMessage] = useState(null)

  useEffect(() => {
    personService
      .getAll()
      .then((allPersons) => {
        setPersons(allPersons)
      })
      .catch((err) => alert(err))
  }, [])

  const handleNameChange = (e) => {
    setNewName(e.target.value)
  }

  const handleNumberChange = (e) => {
    setNewNumber(e.target.value)
  }

  const handleFilterChange = (e) => {
    setFilter(e.target.value)
  }

  const handleSubmit = (e) => {
    e.preventDefault()

    if (!newName || !newNumber) {
      alert("Please fill in the fields")
      return
    }

    // Person exists in the database
    const existingPerson = persons.find(
      (person) => person.name.toLowerCase() === newName.toLowerCase()
    )

    if (existingPerson && existingPerson.number === newNumber) {
      alert(`${newName} is already added to phonebook`)
      setNewName("")
      setNewNumber("")
      return
    }

    // Change number for exiting person in database
    if (existingPerson && existingPerson.number !== newNumber) {
      if (
        window.confirm(
          `${existingPerson.name} is already added to phonebook, replace the old number with a new one?`
        )
      ) {
        const changedPerson = { ...existingPerson, number: newNumber }
        const id = existingPerson.id

        personService
          .update(id, changedPerson)
          .then((returnedPerson) => {
            setPersons(
              persons.map((person) => (person.id !== id ? person : returnedPerson))
            )
            setSuccessMessage(`Updated ${changedPerson.name}'s number`)
            setTimeout(() => {
              setSuccessMessage(null)
            }, 5000)
            setNewName("")
            setNewNumber("")
          })
          .catch((err) => {
            if (err.response.data) {
              setErrorMessage(err.response.data.error)
              setTimeout(() => {
                setErrorMessage(null)
              }, 5000)
            } else {
              setErrorMessage(
                `Information of ${changedPerson.name} has already been removed from server`
              )
              setPersons(persons.filter((p) => p.id !== id))
              setNewName("")
              setNewNumber("")
              setTimeout(() => {
                setErrorMessage(null)
              }, 5000)
            }
          })
        return
      } else {
        return
      }
    }

    // Create new person & send to database
    const newPerson = { name: newName, number: newNumber }
    personService
      .create(newPerson)
      .then((returnedPerson) => {
        setPersons(persons.concat(returnedPerson))
        setSuccessMessage(`Added ${returnedPerson.name}`)
        setTimeout(() => {
          setSuccessMessage(null)
        }, 3000)
        setNewName("")
        setNewNumber("")
      })
      .catch((err) => {
        setErrorMessage(err.response.data.error)
        setTimeout(() => {
          setErrorMessage(null)
        }, 5000)
      })
  }

  const handleDelete = (id) => {
    if (window.confirm("Do you really want to delete this person")) {
      personService
        .remove(id)
        .then(() => {
          setSuccessMessage(`Deleted ${persons.find((person) => person.id === id).name}`)
          setPersons(persons.filter((person) => person.id !== id))
          setTimeout(() => {
            setSuccessMessage(null)
          }, 3000)
        })
        .catch((err) => alert(err))
    } else {
      return
    }
  }

  return (
    <div>
      <h2>Phonebook</h2>
      <Notification successMessage={successMessage} errorMessage={errorMessage} />
      <Filter filter={filter} onFilterChange={handleFilterChange} />
      <PersonForm
        onFormSubmit={handleSubmit}
        onNameChange={handleNameChange}
        onNumberChange={handleNumberChange}
        nameValue={newName}
        numberValue={newNumber}
      />

      <h2>Numbers</h2>
      <Persons persons={persons} filter={filter} handleDelete={handleDelete} />
    </div>
  )
}

export default App
