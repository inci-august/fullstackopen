const mongoose = require("mongoose")

if (process.argv.length < 3) {
  console.log("Please provide the password as an argument: node mongo.js <password>")
  process.exit(1)
}

if (process.argv.length > 5) {
  console.log(
    "Please provide maximum of 3 arguments: node mongo.js <password> <name> <number>"
  )
  process.exit(1)
}

const password = process.argv[2]
const name = process.argv[3]
const number = process.argv[4]

const url = `mongodb+srv://fullstack:${password}@cluster0.nmvcx.mongodb.net/phonebook?retryWrites=true&w=majority`

mongoose.connect(url, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useFindAndModify: false,
  useCreateIndex: true,
})

const personSchema = new mongoose.Schema({
  name: String,
  number: String,
})

const Person = mongoose.model("Person", personSchema)

const person = new Person({
  name,
  number,
})

process.argv.length > 3
  ? person.save().then(() => {
      console.log(`added ${name} number ${number} to phonebook`)
      mongoose.connection.close()
    })
  : Person.find({}).then((people) => {
      console.log("phonebook:")
      people.forEach((person) => {
        console.log(`${person.name} ${person.number}`)
      })
      mongoose.connection.close()
    })
