- [Validation and ESLint](#validation-and-eslint)

# Validation and ESLint

There are usually constraints that we want to apply to the data that is stored in our app's db. Our app shouldn't accept notes that have a missing or empty **_content_** property. The validity of the note is checked in the route handler:

```js
app.post("/api/notes", (req, res) => {
  const body = req.body

  if (body.content === undefined) {
    return res.status(400).json({
      error: "content missing",
    })
  }

  // ...
})
```

If the note does not have the **_content_** property, we respond to the request with the status code **_400 bad request_**.

One smarter way of validating the format of the data before it is stored in the database, is to use the [validation](https://mongoosejs.com/docs/validation.html) functionality available in Mongoose.

We can define specific validation rules for each field in the schema:

```js
const noteSchema = new mongoose.Schema({
  content: {
    type: String,
    minlength: 5,
    required: true,
  },
  date: {
    type: Date,
    required: true,
  },
  important: Boolean,
})
```

The **`minlength`** and **`required`** validators are [built-in](https://mongoosejs.com/docs/validation.html#built-in-validators) and provided by Mongoose. The Mongoose [custom validator](https://mongoosejs.com/docs/validation.html#custom-validators) functionality allows us to create new validators, if none of the built-in ones cover our needs.

If we try to store an object in the db that breaks one of the constraints, the operation will throw an exception. Let's change our handler for creating a new note so that it passes any potential exceptions to the error handler middleware:

```js
app.post("/api/notes", (req, res, next) => {
  const body = req.body

  const note = new Note({
    content: body.content,
    important: body.important || false,
    date: new Date(),
  })

  note
    .save()
    .then((savedNote) => {
      res.json(savedNote.toJSON())
    })
    .catch((error) => next(error))
})
```

Let's expand the error handler to deal with these validation errors:

```js
const errorHandler = (error, req, res, next) => {
  console.error(error.message)

  if (error.name === "CastError") {
    return res.status(400).send({ error: "malformatted id" })
  } else if (error.name === "ValidationError") {
    return res.status(400).json({ error: error.message })
  }

  next(error)
}
```

When validating an object fails, we return the following default error message from Mongoose:

![Validation Error](../readme-imgs/validation_error.png)

Mongoose doesn't have a built-in validator for making sure that the value being added is unique. For this, we can use npm package [mongoose-unique-validator](https://github.com/blakehaswell/mongoose-unique-validator#readme)
