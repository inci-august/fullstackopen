const mongoose = require("mongoose")

if (process.argv.length < 3) {
  console.log("Please provide the password as an argument: node mongo.js <password>")
  process.exit(1)
}

const password = process.argv[2]

const url = `mongodb+srv://fullstack:${password}@cluster0.nmvcx.mongodb.net/note-app?retryWrites=true&w=majority`

mongoose.connect(url, { useNewUrlParser: true, useUnifiedTopology: true, useFindAndModify: false, useCreateIndex: true })

const noteSchema = new mongoose.Schema({
  content: String,
  date: Date,
  important: Boolean,
})

const Note = mongoose.model("Note", noteSchema)

const note = new Note({
  content: "HTML is Easy",
  date: new Date(),
  important: true,
})

const note2 = new Note({
  content: "Mongoose makes use of mongo easy",
  date: new Date(),
  important: true,
})

const note3 = new Note({
  content: "Callback functions suck",
  date: new Date(),
  important: true,
})

note
  .save()
  .then(() => note2.save())
  .then(() => note3.save())
  .then((res) => {
    console.log("notes saved")
    mongoose.connection.close()
  })

// Note.find({}).then((notes) => {
//   notes.forEach((note) => {
//     console.log(note)
//   })
//   mongoose.connection.close()
// })
