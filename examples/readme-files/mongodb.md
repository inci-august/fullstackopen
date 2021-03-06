- [Saving Data to MongoDB](#saving-data-to-mongodb)
  - [MongoDB](#mongodb)
  - [Schema](#schema)
  - [Creating and Saving Objects](#creating-and-saving-objects)
  - [Fetching Objects from the Database](#fetching-objects-from-the-database)
  - [Backend Connected to a Database](#backend-connected-to-a-database)
  - [Database Configuration into Its Own Module](#database-configuration-into-its-own-module)
  - [Using Database in Route Handlers](#using-database-in-route-handlers)
  - [Verifying Frontend and Backend Integration](#verifying-frontend-and-backend-integration)
  - [Error Handling](#error-handling)
  - [Moving Error Handling into Middleware](#moving-error-handling-into-middleware)
  - [The Order of Middleware Loading](#the-order-of-middleware-loading)
  - [Other Operations](#other-operations)


# Saving Data to MongoDB

## MongoDB

You can install & run MongoDB on your own computer. However, the internet is full of Mongo database services that you can use. Our preferred MongoDB provider in this course wil be [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)

- create and log into your account
- create a cluster
  - let's choose _AWS_ as the provider & _Frankfurt_ as the region, and create a cluster
- use <kbd>database access</kbd> tab for creating user credentials for the database
  - note that these are not the same credentials you use for logging into MongoDB Atlas. These will be used for your app to connect to the database
- grant the user with permissions to read and write to the database
- next we have to define the IP addresses that are allowed access to the db using <kbd>network access</kbd>
  - for the sake of simplicity we will allow access from all IP addresses
- finally we're ready to connect to our db. start by clicking <kbd>connect</kbd>
  - and choose <kbd>Connect your application</kbd>
  - ![mongodb connect](../readme-imgs/mongodb-connect.png)
  - the view display the **_MongoDB URI_**, which is the address of the database that we willsupply to the MongoDB client library we will add to our app.
  - the address looks like this:
  - ```bash
    mongodb+srv://fullstack:<PASSWORD>@cluster0-ostce.mongodb.net/test?retryWrites=true
    ```
  - we are now ready to use the database

We could use the db directly from our JS code with the [official MongoDB Node.js driver](https://mongodb.github.io/node-mongodb-native/) library, but it's cumbersome to use. We will instead use the [Mongoose](http://mongoosejs.com/index.html) library that offers a higher level API.

Mongoose could be described as an **_object document mapper_** (ODM), and saving JS objects as Mongo docs is straightforward with this library.

- install Mongoose

```bash
npm install mongoose
```

Let's not add any code dealing with Mongo to our backend just yet. Instead, let's make a practive app by creating a new file, **_mongo.js_**

```js
const mongoose = require("mongoose")

if (process.argv.length < 3) {
  console.log("Please provide the password as an argument: node mongo.js <password>")
  process.exit(1)
}

const password = process.argv[2]

const url = `mongodb+srv://fullstack:${password}@cluster0.nmvcx.mongodb.net/test?retryWrites=true&w=majority`

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

note.save().then((res) => {
  console.log("note saved")
  mongoose.connection.close()
})
```

**NB:** Depending on which region you selected when building your cluster, the **_MongoDb URI_** may be different from the example above.

The code also assumes that it will be passed the password from the credentials we created in MongoDB Atlas, as a command line parameter. We can access the command line parameter like this:

```js
const password = process.argv[2]
```

When the code is run with the command **`node mongo.jd <password>`**, Mongo will add a new document to the database.

**NB:** Please note the password is the password created for the database use, not your MongoDB Atlas password. Also, if you created password with special characters, then you'll need to [URL encode that password](https://docs.atlas.mongodb.com/troubleshoot-connection/#special-characters-in-connection-string-password).

We can view the current state of the database from the MongoDb Atlas from **_Collections_**, in the Overview tab.

![MongoDB Collections](../readme-imgs/mongodb-collections.png)

As the view states, the **_document_** matching the note has been added to the **_notes_** collection in the **_test_** database.

![MongoDB Notes](../readme-imgs/mongodb-notes.png)

We should give a better name to the database. Like the documentation says, we can change the name of the database from the URI:

![MongoDB Change DB Name](../readme-imgs/mongodb-renamedb.png)

- Let's destroy the **_test_** database.
- Let's now change the name of database referenced in our connection string to **_note-app_** instead, by modifying the URI:

```SH
mongodb+srv://fullstack:<PASSWORD>@cluster0.nmvcx.mongodb.net/note-app?retryWrites=true&w=majority
```

- Let's run our code again

The data is now stored in the right db. The view also offers the <kbd>create database</kbd> functionality, that can be used to create new dbs from the website. Creating a db like this is not necessary, since MongoDB Atlas automatically creates a new db when an app tries to connect to a db that does not exist yet.

## Schema

After establishing the connection to the db, we define the [schema](http://mongoosejs.com/docs/guide.html) for a note and the matching [model](http://mongoosejs.com/docs/models.html).

```js
const noteSchema = new mongoose.Schema({
  content: String,
  date: Date,
  important: Boolean,
})

const Note = mongoose.model("Note", noteSchema)
```

- first we define the schema of a note that is stored in the **`noteSchema`** variable. The schema tells Mongoose how the note objects are to be stored in the database.
- in the **`Note`** model definition, the first **_"Note"_** parameter is the singular name of the model. The name of the collection will be the lowercased plural **_notes_**, because the Mongoose convention is to automatically name collections as the plural (e.g. **_notes_**) when the schema refers to them in the singular (e.g. **_Note_**).

Document dbs like Mongo are **_schemaless_**, meaning that the db itself does not care about the structure of the data that is stored in the db. It is possible to store docs with completely different fields in the same collection.

The idea behind **Mongoose** is that the data stored in the db is given a **_schema at the level of the app_** that defines the shape of the docs stored in any given collection.

## Creating and Saving Objects

Nextç the app creates a new note object with the help of the **_Note_** model:

```js
const note = new Note({
  content: "HTML is Easy",
  date: new Date(),
  important: false,
})
```

Models are so-called **_constructor functions_** that create new JavaScript objects based on the provided parameters. Since the objects are created with the model's constructor function,they have all the properties of the model, which include methods for saving the object to the db.

Savind the object to the db happens with the **`save`** method, that can be provided with an event handler with the **`then`** method:

```js
note.save().then((result) => {
  console.log("note saved")
  mongoose.connection.close()
})
```

When the object is saved to the db, the event handler provided to **`then`** gets called. The event handler closes the db connection with the command **`mongoose.connection.close()`**. If the connection is not closed, the program will never finish its execution.

The result of the save operation is in the **`result`** parameter of the event handler. The result is not that interesting when we're storing one object to the db. You can print the object to the console if you want to take a closer look at it while implementing your app or during debugging.

Let's also save a few more notes by modifying the data in the code and by executing the program again.

```js
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
```

## Fetching Objects from the Database

Let's comment out the code for generating new notes and replace it with the following:

```js
Note.find({}).then((notes) => {
  notes.forEach((note) => {
    console.log(note)
  })

  mongoose.connection.close()
})
```

When the code is executed, the program prints all the notes stored in the db:

![Mongoose Find](../readme-imgs/mongoose-find.png)

The objects are retrieved from the db with the [find](https://mongoosejs.com/docs/api.html#model_Model.find) method of the **`Note`** model. The parameter of the method is an object expressing search conditions. since the parameter is an empty object **`{}`**, we get all of the notes stored in the **`notes`** collection.

The search conditions adhere to the Mongo search query [syntax](https://docs.mongodb.com/manual/reference/operator/).

We could restrict our search to only include important notes like this:

```js
Note.find({ important: true }).then((result) => {
  // ...
})
```

## Backend Connected to a Database

Let's add the Mongoose definitions to the **index.js** file:

```js
const mongoose = require("mongoose")

const url = `mongodb+srv://fullstack:${your_password}@cluster0.nmvcx.mongodb.net/note-app?retryWrites=true&w=majority`

mongoose.connect(url, { useNewUrlParser: true, useUnifiedTopology: true, useFindAndModify: false, useCreateIndex: true })

const noteSchema = new mongoose.Schema({
  content: String,
  date: Date,
  important: Boolean,
})

const Note = mongoose.model("Note", noteSchema)
```

Let's change the handler for fetching all notes:

```diff
app.get("/api/notes", (req, res) => {
-  res.json(notes)
+ Note.find({}).then((notes) => {
+   res.json(notes)
+ })
})
```

We can verify in the browser that the backend works for displaying all of the docs:

![api/notes](../readme-imgs/apinotes.png)

The frontend assumes that every object has a unique id in the **`id`** field. We also don't want to return the mongo versioning field **`__v`** to the frontend.

One way to format the objects returned by Mongoose is to [modify](https://stackoverflow.com/questions/7034848/mongodb-output-id-instead-of-id) the **`toJSON`** method of the schema, which is used on all instances of the models produced with that schema:

```js
noteSchema.set("toJSON", {
  transform: (doc, returnedObject) => {
    returnedObject.id = returnedObject._id.toString()
    delete returnedObject._id
    delete returnedObject.__v
  },
})
```

Even though the **`_id`** property of Mongoose objects looks like a string, it is in fact an object. The **`toJSON`** method we defined transforms it into a string just to be safe. If we didn't make this change, it would cause more harm for us in the future once we start writing tests.

Let's respond to the HTTP request with a list of objects formatted with the **`toJSON`** method:

```js
app.get("/api/notes", (request, response) => {
  Note.find({}).then((notes) => {
    response.json(notes)
  })
})
```

Now the **`notes`** variable is assigned to an array of objects returned by Mongo. When the response is sent in the JSON format, the **`toJSON`** method of each object in the array is called automatically by the **`JSON.stringify`** method.

## Database Configuration into Its Own Module

Let's extract the Mongoose specific code into its own module.

Let's create a new directory for the module called models, and add a file called **_note.js_**:

```js
const mongoose = require("mongoose")

const url = process.env.MONGODB_URI

console.log("connecting to", url)

mongoose
  .connect(url, { useNewUrlParser: true, useUnifiedTopology: true, useFindAndModify: false, useCreateIndex: true })
  .then((result) => {
    console.log("connected to MongoDB")
  })
  .catch((error) => {
    console.log("error connecting to MongoDB: ", error.message)
  })

const noteSchema = new mongoose.Schema({
  content: String,
  date: Date,
  important: Boolean,
})

noteSchema.set("toJSON", {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString()
    delete returnedObject._id
    delete returnedObject.__v
  },
})

module.exports = mongoose.model("Note", noteSchema)
```

Defining Node [modules](https://nodejs.org/docs/latest-v8.x/api/modules.html) differs from the way of defining [ES6 modules](https://fullstackopen.com/en/part2/rendering_a_collection_modules#refactoring-modules).


The public interface of the module is defined by setting a value to the **`module.exports`** variable. We will set the value to be the **`Note`** model. The other things defined inside of the module, like the variables **`mongoose`** and **`url`** will not be accessible or visible to users of the module.

Importing the module happens by adding the following line to index.js:

```js
const Note = require("./models/note")
```

This way the **`Note`** variable will be assigned to the same object that the module defines.

The way that the connection is made has changed slightly:

```js
const url = process.env.MONGODB_URI

console.log("connecting to", uri)

mongoose
  .connect(url, { useNewUrlParser: true, useUnifiedTopology: true, useFindAndModify: false, useCreateIndex: true })
  .then((result) => {
    console.log("connected to MongoDB")
  })
  .catch((error) => {
    console.log("error connecting to MongoDB: ", error.message)
  })
```

It's not a good idea to hardcode the address of the database into the code, so instead the address of the db is passed to the app via the **`MONGODB_URI`** environmental variable.

There are many ways to define the value of an environment variable. One way would be to define it when the app is started:

```sh
MONGODB_URI=address_here npm run dev
```

A more sophisticated way is to use the [dotenv](https://github.com/motdotla/dotenv#readme) library.

```sh
npm install dotenv
```

To use the library, we create a **_.env_** file at the root of the project. The environment variables are defined inside of the file, and it can look like this:

```sh
MONGODB_URI="mongodb+srv://fullstack:password@cluster0.nmvcx.mongodb.net/app_name?retryWrites=true&w=majority"
PORT=3001
```

The **_.env_** file should be gitignored right away, since we do not want to publish any confidential info publicly online!

The environment variables defined in the **_.env_** file can be taken into use with the expression **`require("dotenv").config()`** and you can reference them in your code just like you would reference normal environment variables, with the **`process.env.MONGODB_URI`** syntax.

Let's change the **_index.js_** file in the following way:

```js
require("dotenv").config()
const express = require("express")
const cors = require("cors")
const Note = require("./models/note")

// ...

const PORT = process.env.PORT
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})
```

It's important that **_dotenv_** gets imported before the **_note_** model to ensure that the environment vars from the **_.env_** file are available globally.

## Using Database in Route Handlers

Next, let's change the rest of the backend functionality to use the db.

Creating a new note is accomplished like this:

```js
app.post("/api/notes", (req, res) => {
  const body = req.body

  if (body.content === undefined) {
    return res.status(400).json({
      error: "content missing",
    })
  }

  const note = new Note({
    content: body.content,
    important: body.important || false,
    date: new Date(),
  })

  note.save().then((savedNote) => {
    res.json(savedNote)
  })
})
```

The note objects are created with the **`Note`** constructor function. The response is sent inside of the callback function for the **`save`** operation. This ensures that the response is sent only if the operation succeeded.

The **`savedNote`** parameter in the callback function is the saved and newly created note. The data sent back in the response is the formatted version created with the **`toJSON`** method:

Using Mongoose's **`findById`** method, fetching an individual note gets changed into the following:

```js
app.get("/api/notes/:id", (req, res) => {
  Note.findById(id).then((note) => {
    res.json(note)
  })
})
```

## Verifying Frontend and Backend Integration

When the backend gets expanded, its'a good idea to test the backend first with **browser, Postman or the VS Code REST client**. Next, let's try creating a new note after taking the db into use:

![REST test](../readme-imgs/rest_test.png)

Only once everything has been verified to work in the backend, is it a good idea to test that the frontend works with the backend. It is highly inefficient to test things exclusively through the frontend.

It's a good idea to integrate the frontend and backend one functionality at a time. First, we could implement fetching all of the notes from the database and test it through the backend endpoint in the browser. After this, we could verify that the frontend works with the new backend. Once everything seems to work, we would move onto the next feature.

Once we introduce a database into the mix, it is useful to inspect the state persisted in the database, e.g., from the control panel in MongoDB Atlas. Quite often little Node helper programs like the mongo.js program we wrote earlier can be very helpful during development.

## Error Handling

If we try to visit the URL of a note with an id that does not actually exist, e.g. http://localhost:3001/api/notes/5c41c90e84d891c15dfa3431 where
_5c41c90e84d891c15dfa3431_ is not an id stored in the db, then the response will be **`null`**.

Let's change this behavior so that if note with the given id doesn't exist, the server will repond to the request with the HTTP status code **404 not found**. In addition let's implement a simple **`catch`** block to handle cases where the promise returned by the **`findById`** method is **_rejected_**.

```js
app.get("/api/notes/:id", (req, res) => {
  Note.findById(req.params.id)
    .then((note) => {
      if (note) {
        res.json(note)
      } else {
        res.status(404).end()
      }
    })
    .catch((error) => {
      console.log(error)
      res.status(500).end()
    })
})
```

If no matching object is found in the db, the value of **`note`** will be **`null`** and the **`else`** block is executed. This results in a response with the status code **_404 not found_**. If promise returned by the **`findById`** method is rejected, the response will have the status code **_500 internal server error_**. The console display more detailed info about the error.

On top of the non-existing note, there's one more error situation needed to be handled. In this situation, we are trying to fetch a note with a wrong kind of **`id`**, meaning **`id`** that doesn't match the mongo identifier format.

If we make the following request, we will get the error message shown below:

```sh
Method: GET
Path:   /api/notes/someInvalidId
Body:   {}
---
{ CastError: Cast to ObjectId failed for value "someInvalidId" at path "_id"
    at CastError (/Users/mluukkai/opetus/_fullstack/osa3-muisiinpanot/node_modules/mongoose/lib/error/cast.js:27:11)
    at ObjectId.cast (/Users/mluukkai/opetus/_fullstack/osa3-muisiinpanot/node_modules/mongoose/lib/schema/objectid.js:158:13)
    ...
```

Given malformed id as an argument, the **`findById`** method will throw an error causing the returned promise to be rejected. This will cause the callback function defined in the **`catch`** block to be called.

Let's make some small adjustments to the response in the **`catch`** block:

```diff
app.get("/api/notes/:id", (req, res) => {
  Note.findById(req.params.id)
    .then((note) => {
      if (note) {
        res.json(note)
      } else {
        res.status(404).end()
      }
    })
    .catch((error) => {
      console.log(error)
-     res.status(500).end()
+     res.status(400).send({ error: "malformatted id" })
    })
})
```

If the format of the id is incorrect, then we will end up in the error handler defined in the **`catch`** block. The appropriate status code for the situation is [400 Bad Request](https://www.w3.org/Protocols/rfc2616/rfc2616-sec10.html#sec10.4.1), because the situation fits the description perfectly:

> The request could not be understood by the server due to malformed syntax. The client SHOULD NOT repeat the request without modifications.

We have also added some data to the response to shed some light on the cause of the error.

When dealing with Promises, it's almost always a good idea to add error and exception handling.

It's never a bad idea to print the object that caused the exception to the console in the error handle:

```js
.catch(error => {
  console.log(error)
  reponse.status(400).send({error: "malformatted id"})
})
```

The reason the error handler gets called might be something completely different than what you had anticipated. If you log the error to the console, you may save yourself from long and frustrating debugging sessions. Moreover, most modern services to where you deploy your app support some form of logging system that you can use to check these logs. Heroku is one.

Ever time you're working on a project with a backend, **_it is critical to keep an eye on the console output of the backend_**. If you are working on a small screen , it's enough to just see a tiny slice of the output in the background. Any error messages will catch your attention even when the console is far back in the background.

![Error logs](../readme-imgs/error_logs.png)

## Moving Error Handling into Middleware

We have written the code for the error handler among the rest of our code. This can be a reasonable solution at times, but there are cases where it is better to implement all error handling in a single place. This can be particularly useful if we later on want to report data related to errors to an external error tracking system like [Sentry](https://sentry.io/welcome/).

Let's change the handler for the **_/api/notes/:id_** route, so that it passes the error forward with the **`next`** function. The next function is passed to the handler as the third parameter.

```diff
-app.get("/api/notes/:id", (req, res) => {
+app.get("/api/notes/:id", (req, res, next) => {
   Note.findById(req.params.id)
     .then((note) => {
       if (note) {
         res.json(note)
       } else {
         res.status(404).end()
       }
     })
-    .catch((error) => {
-      console.log(error)
-      res.status(400).send({ error: "malformatted id" })
-    })
+    .catch((error) => next(error))
})
```

The error that is passed forwards is given to the **`next`** function as a parameter. If **`next`** was called without a parameter, then the execution would simply move onto the next route or middleware. If the **`next`** function is called with a parameter, then the execution will continue to the **_error handler middleware_**.

Express [error handlers](https://expressjs.com/en/guide/error-handling.html) are middleware that are defined with a function that accepts **_four parameters_**. Our error handler looks like this:

```js
const errorHandler = (error, req, res, next) => {
  console.error(error.message)

  if (error.name === "CastError") {
    return res.status(400).send({ error: "malformatted id" })
  }

  next(error)
}

app.use(errorHandler)
```

The error handler checks if the error is a **_CastError_** exception, in which case we know that the error was caused by an invalid object id for Mongo. In this situation the error handler will send a response to the browsser with the response object passed as a parameter. In all other error situations, the middleware passes the error forward to the default Express error handler.

## The Order of Middleware Loading

The execution order of middleware is the same as the order that they are loaded into express with the **`app.use`** function. For this reason it is important to be careful when defining middleware.

The correct order is the following:

```js
app.use(express.static("build"))
app.use(express.json())
app.use(cors())
app.use(requestLogger)

// ...

app.post("/api/notes", (req, res) => {
  const body = req.body

  // ...
})

const unknownEndpoint = (req, res) => {
  res.status(404).send({ error: "unknown endpoint" })
}

app.use(unknownEndpoint)

const errorHandler = (error, req, res, next) => {
  // ...
}

app.use(errorHandler)
```

The **json-parser** middleware should be among the very first middleware loaded into Express. If the order was the following:

```js
app.use(logger) // request.body is undefined!

app.post("/api/notes", (req, res) => {
  // request.body is undefined!
  const body = request.body
  // ...
})

app.use(express.json())
```

Then the JSON data sent with the HTTP requests would not be available for the logger middleware or the POST route  handler, since the **`request.body`** would be **`undefined`** at that point.

It's also important that the middleware for handling unsupported routes is next to the last middleware that is loaded into Express, just before the error handler.

For example, the following loading order would cause an issue:

```js
const unknownEndpoint = (req, res) => {
  res.status(404).send({ error: "unknown endpoint" })
}

// handler of requests with unknown endpoint
app.use(unknownEndpoint)

app.get("/api/notes", (req, res) => {
  // ...
})
```

Now the handling of unknown endpoints is ordered **_before the HTTP request handler_**. Since the unknown endpoint handler responds to all requests with **_404 unknown endpoint_**, no routes or middleware will be called after the response  has been sent by unknown endpoint middleware. The only exception to this is the error handler wihch needs to come at the very end, after the unknown endpoints handler.

## Other Operations

Let's add some missing functionality to our app, including deleting and updating an individual note.

The easiest way to delete a note from the database is with the [findByIdAndRemove](https://mongoosejs.com/docs/api.html#model_Model.findByIdAndRemove) method:

```js
app.delete("/api/notes/:id", (req, res) => {
  Note.findByIdAndRemove(req.params.id)
    .then((result) => {
      res.status(204).end()
    })
    .catch((error) => next(error))
})
```

In both of the "successful" cases of deleting a resource, the backend responds with the status code **_204 no content_**. The two different cases are deleting a note that exists, and deleting a note that does not exist in the db. The **`result`** callback parameter could be used for checking if a resource actually was deleted, and we could use that info for returning different status codes for the two cases if we deemed it necessary. Any exception that occurs is passed onto the error handler.

The toggling of the importance of a note can be easily accomplished with the [findByIdAndUpdate](https://mongoosejs.com/docs/api.html#model_Model.findByIdAndUpdate) method.

```js
app.put("/api/notes/:id", (req, res, next) => {
  const body = req.body

  const note = {
    content: body.content,
    important: body.important,
  }

  Note.findByIdAndUpdate(req.params.id, note, { new: true })
    .then((updatedNote) => {
      res.json(updatedNote)
    })
    .catch((error) => next(error))
})
```

In the code above, we also allow the content of the note to be edited. However, we will not support changing the creation date for obvious reasons.

Notice that the **`findByIdAndUpdate`** method receives a regular JS object as its parameter, and not a new note object created with the **`Note`** constructor function.

There is one important details regarding the use of the **`findByIdAndUpdate`** method. By default, the **`updatedNote`** parameter of the event handler receives the original document [without the modifications](https://mongoosejs.com/docs/api.html#model_Model.findByIdAndUpdate). We added the optional **`{ new: true }`** parameter, which will cause our event handler to be called with the new modified document instead of the original.

After testing the backend directly with Post and the VS Code REST client, we can verify that it seems to work. The frontend also appears to work with the backend using the db.


