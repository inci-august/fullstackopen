# Structure of Backend Application, Introduction to Testing

- [Structure of Backend Application, Introduction to Testing](#structure-of-backend-application-introduction-to-testing)
  - [Project Structure](#project-structure)
  - [Testing Node Applications](#testing-node-applications)
  - [Testing the Backend](#testing-the-backend)
    - [Test Environment](#test-environment)
    - [**`supertest`**](#supertest)

## Project Structure

Before we move into the topic of testing, we will modify the structure of our project to adhere to Node.js best practices.

After making the changes to the directory structure of our project, we end up with the following structure:

```
├── index.js
├── app.js
├── build
│   └── ...
├── controllers
│   └── notes.js
├── models
│   └── note.js
├── package-lock.json
├── package.json
├── utils
│   ├── config.js
│   ├── logger.js
│   └── middleware.js
```

Let's separate all printing to the console to its own module **_utils/logger.js_**

```js
const info = (...params) => {
  console.log(...params)
}

const error = (...params) => {
  console.error(...params)
}

module.exports = {
  info,
  error,
}
```

Extracting logging into its own module is a good idea in more ways than one. If we wanted to start writing logs to a file or send them to an external logging service like [graylog](https://www.graylog.org/) or [papertrail](https://papertrailapp.com/) we would only have to make changes in one place.

The content of the **_index.js_** file used for starting the app gets simplified as follows:

```js
const app = require("./app")
const http = require("http")
const config = require("./utils/config")
const logger = require("./utils/logger")

const server = http.createServer(app)

server.listen(config.PORT, () => {
  logger.info(`Server running on port ${config.PORT}`)
})
```

The **_index.js_** file only imports the actual application from the **_app.js_** file and then starts the application. The function **`info`** of the logger-module is used for the console printout telling that the application is running.

The handling of environment variables is extracted into a separate **_utils/config.js_** file

```js
const info = (...params) => {
  console.log(...params)
}

const error = (...params) => {
  console.error(...params)
}

module.exports = {
  info,
  error,
}
```

The other parts of the application can access the environment variables by importing the configuration module:

```js
const config = require("./utils/config")

logger.info(`Server running on port ${config.PORT}`)
```

The route handlers have also been moved into a dedicated module. The event handlers of routes aree commonly referred to as **_controllers_**, and for this reason we have created a new **_controllers_** directory. All of the routes related to notes are now in the **_notes.js_** module under the **_controllers_** directory.

The contents of the **_notes.js_** module are the following:

```js
const notesRouter = require("express").Router()
const Note = require("../models/note")

notesRouter.get("/", (req, res) => {
  Note.find({}).then((notes) => {
    res.json(notes)
  })
})

notesRouter.get("/:id", (req, res, next) => {
  Note.findById(req.params.id)
    .then((note) => {
      if (note) {
        res.json(note)
      } else {
        res.status(404).end()
      }
    })
    .catch((error) => next(error))
})

notesRouter.post("/", (req, res, next) => {
  const body = req.body

  const note = new Note({
    content: body.content,
    important: body.important || false,
    date: new Date(),
  })

  note
    .save()
    .then((savedNote) => savedNote.toJSON())
    .then((savedAndFormattedNote) => res.json(savedAndFormattedNote))
    .catch((error) => next(error))
})

notesRouter.delete("/:id", (req, res, next) => {
  Note.findByIdAndRemove(req.params.id)
    .then(() => {
      res.status(204).end()
    })
    .catch((error) => next(error))
})

notesRouter.put("/:id", (req, res, next) => {
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

module.exports = notesRouter
```

At the beginning of the file we create a new router object:

```js
const notesRouter = require("express").Router()

// ...

module.exports = notesRouter
```

The module exports the router to be available for all consumers of the module.

All routes are now defined for the router object, in a similar fashion to what we had previouly done with the object representing the entire application.

It's worth noting that the paths in the route handlers have shortened. In the previous version, we had:

```js
app.delete("/api/notes/:id", (req, res) => {...})
```

And in the current version, we have:

```js
notesRouter.delete("/:id", (req, res) => {...})
```

So what are these router objects exactly? The Express manual provides the following explanation:

> A router object is an isolated instance of middleware and routes. You can think of it as a "mini-application", capable only of performing middleware and routing functions. Every Express application has a built-in app router.

The router is in face a **_middleware_**, that can be used for defining "related routes" in a single place, that is typically placed in its own module.

The **_app.js_** file that creates the actual application, takes the router into use as shown below:

```js
const notesRouter = require('./controllers/notes)
app.use("/api/notes", notesRouter)
```

After making these changes, our **_app.js_** file looks like this:

```js
const config = require("./utils/config")
const express = require("express")
const app = express()
const cors = require("cors")
const notesRouter = require("./controllers/notes")
const middleware = require("./utils/middleware")
const logger = require("./utils/logger")
const mongoose = require("mongoose")

logger.info("connecting to", config.MONGODB_URI)

mongoose
  .connect(config.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useFindAndModify: false,
    useCreateIndex: true,
  })
  .then(() => {
    logger.info("connected to MongoDB")
  })
  .catch((error) => {
    logger.error("error connecting to MongoDB: ", error.message)
  })

app.use(cors())
app.use(express.static("build"))
app.use(express.json())
app.use(middleware.requestLogger)

app.use("/api/notes", notesRouter)

app.use(middleware.unknownEndpoint)
app.use(middleware.errorHandler)

module.exports = app
```

The file takes different middleware into use, and one of these is the **_notesRouter_** that is attached to the **_/api/notes_** route.

Our custom middleware has been moved to a new **_utils/middleware.js_** module:

```js
const logger = require("./logger")

const requestLogger = (req, res, next) => {
  logger.info("Method: ", req.method)
  logger.info("Path: ", req.path)
  logger.info("Body: ", req.body)
  logger.info("---")
  next()
}

const unknownEndpoint = (req, res) => {
  res.status(404).send({ error: "unknown endpoint" })
}

const errorHandler = (error, req, res, next) => {
  logger.error(error.message)

  if (error.name === "CastError") {
    return res.status(400).send({ error: "malformatted id" })
  } else if (error.name === "ValidationError") {
    return res.status(400).json({ error: error.message })
  }

  next(error)
}

module.exports = {
  requestLogger,
  unknownEndpoint,
  errorHandler,
}
```

The responsibility of establishing the connection to the database has been given to the **_app.js_** module. The **_note.js_** file under the **_models_** directory only defines the Mongoose schema for notes.

```js
const mongoose = require("mongoose")

const noteSchema = new mongoose.Schema({
  content: {
    type: String,
    minLength: 5,
    required: true,
  },
  date: {
    type: Date,
    required: true,
  },
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

To recap, the directory structure loooks like this after the changes have been made:

```
├── index.js
├── app.js
├── build
│   └── ...
├── controllers
│   └── notes.js
├── models
│   └── note.js
├── package-lock.json
├── package.json
├── utils
│   ├── config.js
│   ├── logger.js
│   └── middleware.js
```

There is no strict directory structure or file naming convention that is required for Express applications. To contrast this, Ruby on Rails does require a specific structure. Our current structure simply follows some of the best practices you can come accross on the internet.

## Testing Node Applications

Let's start our testing journey by looking at unit tests. The logic of our app is so simple that there is not much that makes sense to test with unit tests. Let's create a new file **_utils/for_testing.js_** and write a couple of simple function that we can use for test writing practice:

```js
const palindrome = (string) => {
  return string.split("").reverse().join("")
}

const average = (array) => {
  const reducer = (sum, item) => {
    return sum + item
  }

  return array.reduce(reducer, 0) / array.length
}

module.exports = {
  palindrome,
  average,
}
```

The **`average`** function uses the array [reduce](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/Reduce) method.

There are many different libraries or **_test runners_** for JavaScript. In this course we will be using a testing library developed and used internally by Facebook called [jest](https://jestjs.io/), that resembles the previous king of JS testing libraries [Mocha](https://mochajs.org/). Other alternatives do exist, like [ava](https://github.com/avajs/ava) that has gained popularity in some circles.

Jest works well for testing backends, and it shiines when it comes to testing React applications.

> **Windows users:** Jest may not work if the path of the project directory contains a directory that has spaces in its name.

Since tests are only executed during the development of our app, we will install **_jest_** as a development dependency with the command:

```bash
npm install --save-dev jest
```

Let's define the npm script **`test`** to execute tests with Jest and to report about the test execution with the **_verbose_** style:

```json
{
  // ...
  "scripts": {
    "start": "node index.js",
    "dev": "nodemon index.js",
    "lint": "eslint .",
    "build:ui": "rm -rf build && cd ../notes && npm run build && cp -r build ../backend/",
    "deploy": "git push heroku master",
    "deploy:full": "npm run build:ui && git add . && git commit -m uibuild && npm run deploy",
    "logs:prod": "heroku logs --tail",
    "test": "jest --verbose"
  },
  // ...
}
```

Jest requires one to specify that the execution environment is Node. This can be done by adding the following to the end of **_package.json_**:

```json
{
  // ...
  "jest": {
    "testEnvironment": "node"
  }
}
```

Alternatively, Jest can loook for a configuration file with the default name **_jest.config.js_**, where we can define the execution environment like this:

```js
module.exports = {
  testEnvrironment: "node"
}
```

Let's create a separate directory for our tests called **_tests_** and create a new file called **_palindrome.test.js_** with the following contents:

```js
const palindrome = require("../utils/for_testing").palindrome

test("palindrome of a", () => {
  const result = palindrome("a")

  expect(result).toBe("a")
})

test("palindrome of react", () => {
  const result = palindrome("react")

  expect(result).toBe("tcaer")
})

test("palindrome of releveler", () => {
  const result = palindrome("releveleler")

  expect(result).toBe("releveler")
})
```

The ESLint configuration we added to the project in the previous complains about the **`test`** and **`expect`** commands in our test file, since the configuration does not allow **_globals_**. Let's get rid of the complaints by adding **`"jest": true`** to the **_env_** property in the **_.eslintrc.js_** file.

```js
module.exports = {
  "env": {
    "commonjs": true,
    "es6": true,
    "node": true,
    "jest": true,
  },
  "extends": "eslint:recommended",
  "rules": {
    // ...
  },
}
```

In the first row, the test file imports the function to be tested and assigns it to a variable called **`palindrome`**:

```js
const palindrome = require("../utils/for_testing").palindrome
```

Individual test cases are defined with the **`test`** function. The first parameter of the function is the test description as a string. The second parameter is a **_function_**, that defines the functionality for the test case. The functionality for the second test case looks like this:

```js
() => {
  const result = palindrome("react")

  expect(result).toBe("tcaer")
}
```

First we execute the code to be tested, meaning that we generate a plaindrome for the string **_react_**. Next we verify the results with the [expect](https://facebook.github.io/jest/docs/en/expect.html#content) function. Expect wraps the resulting value into an object that offers a collection of a **_matcher_** functions, that can be used for verifying the correctness of the result. Since in this test case we are comparing two strings, we can use the [toBe](https://facebook.github.io/jest/docs/en/expect.html#tobevalue) matcher.

As expected, all of the tests pass:

![jest test](../readme-imgs/jest-test.png)

Jest expects by default that the names of test files contain **_.test_**. In this course, we will follow the convention of naming our tests files with the extension **_.test.js_**.

Jest has excellent error messages, let's break the test to demonstrate this:

```js
test("palindrome of react", () => {
  const result = palindrome("react")

  expect(result).toBe("tkaer")
})
```

Running the tests above results in the following error message:

![jest test fail](../readme-imgs/jest-test-fail.png)

Let's add a few tests for the **`average`** function, into a new file **_tests/average.test.js_**.

```js
const average = require("../utils/for_testing").average

describe("average", () => {
  test("of one value is the value itself", () => {
    expect(average([1])).toBe(1)
  })

  test("of many is calculated right", () => {
    expect(average([1, 2, 3, 4, 5, 6])).toBe(3.5)
  })

  test("of empty array is zero", () => {
    expect(average([])).toBe(0)
  })
})
```

The test reveals that the function does not work correctly with an empty array (this is because in JavaScript dividing by zero results in **_NaN_**):

![jest test fail](../readme-imgs/jest-test-fail2.png)

Fixing the function is quite easy:

```js
const average = array => {
  const reducer = (sum, item) => {
    return sum + item
  }

  return array.length === 0 ? 0 : array.reduce(reducer, 0) / array.length
}
```

If the length of the array is **`0`** then we return **`0`**, and in all other cases we use the **`reduce`** method to calculate the average.

There are a few things to notice about the tests that we just wrote. We defined a **_describe_** block around the tests that was given the name **`average`**:

```js
describe("average", () => {
  // tests
})
```

Describe blocks can be used for grouping tests into logical collections. The test output of Jest also uses the name of the describe block:

![describe block](../readme-imgs/describe-block.png)

As we'll see later on **_describe_** blocks are necessary when we want to run some shared setup or teardown operations for a group tests.

Another thing to notice is that we wrote the tests in quite a compact way, without assigning the output of the function being tested to a variable:

```js
test("of empty array is zero", () => {
  expect(averate([])).toBe(0)
})
```

You can run a single test with the only method:

```js
test.only('it is raining', () => {
  expect(inchesOfRain()).toBeGreaterThan(0);
});

test('it is not snowing', () => {
  expect(inchesOfSnow()).toBe(0);
});
```

Only the **`"it is raining"`** test will run

Another way of running a single test (or describe block) is to specify the name of the test to be run with the **`-t`** flag:

```bash
npm test -- -t "when list has only one blog, equals the likes of that"
```

## Testing the Backend

Since the backend does not contain any complicated logic, ot doesn't make sense to write [unit tests](https://en.wikipedia.org/wiki/Unit_testing) for it. The only potential thing we could unit test is the **`toJSON`** method that is used for formatting notes.

In some situations, it can be beneficial to implement some of the backend tests by mocking the database instead of using a real database. One library that could be used for this is [mongo-mock](https://github.com/williamkapke/mongo-mock).

Since our app's backend is still relatively simple, we will make the decision to test the entire application through its REST API, so that the database is also included. **This kind of testing where multiple components of the system are being tested as a group, is called** [integration testing](https://en.wikipedia.org/wiki/Integration_testing).

### Test Environment

When your backend server is running in Heroku, it is in **_production_** mode.

The convention in Node is to define the execution mode of the application with the **_NODE_ENV_** environment variable. In our current app, we only load the environment variables defined in the **_.env_** file if the app is **_not_** in production mode.

It is common practice to define separate modes for development and testing.

Next, let's change the scripts in our **_package.json_** so that when tests are run, **_NODE\_ENV_** gets the value **_test_**:

```js
{
  // ...
  "scripts": {
    "start": "NODE_ENV=production node index.js",
    "dev": "NODE_ENV=development nodemon index.js",
    "lint": "eslint .",
    "build:ui": "rm -rf build && cd ../notes && npm run build && cp -r build ../backend/",
    "deploy": "git push heroku master",
    "deploy:full": "npm run build:ui && git add . && git commit -m uibuild && npm run deploy",
    "logs:prod": "heroku logs --tail",
    "test": "NODE_ENV=test jest --verbose --runInBand"
  },
  // ...
}
```

We also added the [runInBand](https://jestjs.io/docs/en/cli.html#--runinband) option to the npm script that executes the tests. This option will prevent Jest from running tests in parallel.

We specified he mode of the app to be **_development_** in the **`npm run dev`** script that uses **nodemon**. We also specified that the default **`npm start`** command will defined the mode as production.

This script will not work on Windows. We can correct this by installing the [cross-env](https://www.npmjs.com/package/cross-env) package as a development dependency with the command:

```js
npm install --save-dev cross-env
```

We can then achieve cross-platform compatibility by using the cross-env library in our npm scripts defined in `package.json`.

```js
{
  // ...
  "scripts": {
    "start": "cross-env NODE_ENV=production node index.js",
    "dev": "cross-env NODE_ENV=development nodemon index.js",
    // ...
    "test": "cross-env NODE_ENV=test jest --verbose --runInBand"
  },
  // ...
}
```

Now we can modify the way that our application runs in different modes. As an example of this, we could defined the application to use a separate test database when it is running tests.

We can create our separate test database in MongoDB Atlas. This is not an optimal solution in situations where there are many people developing the same application. Test execution in particular typically requires that a single database instance is not used by tests that are running concurrently.

It would be better to run our tests using a database that is installed and running in the developer's local machine. The optimal solution would be to have every test execution use its own separate database. This is relatively simple to achieve by [running Mongo in-memory](https://docs.mongodb.com/manual/core/inmemory/) or by using [Docker](https://www.docker.com/) containers. We will not complicate things and will instead continue to use the MongoDB Atlas database.

Let's make some changes to the module that defines the app's configuration:

```js
require("dotenv").config()

const PORT = process.env.PORT
let MONGODB_URI = process.env.MONGODB_URI

if (process.env.NODE_ENV === "test") {
  MONDODB_URI = process.env.TEST_MONGODB_URI
}

module.exports = {
  MONGODB_URI,
  PORT,
}
```

The **_.env_** file has **_separate variables_** for the database addresses of the development and test databases:

```js
MONGODB_URI=mongodb+srv://fullstack:secred@cluster0-ostce.mongodb.net/note-app?retryWrites=true
PORT=3001

TEST_MONGODB_URI=mongodb+srv://fullstack:secret@cluster0-ostce.mongodb.net/note-app-test?retryWrites=true
```

The **`config`** module that we have implemented slightly resembles the [node-config](https://github.com/lorenwest/node-config) package. Writing our own implementation is justified since our app is simple.

These are the only changes we need to make to our app's code.

### **`supertest`**

Let's use the supertest package to help us write our tests for testing the API.

```
npm install --save-dev supertest
```

Let's write our first test in the **_tests/note_api.test.js_** file:

```js
const mongoose = require("mongoose")
const supertest = require("supertest")
const app = require("../app")

const api = supertest(app)

test("notes are returned as json", async () => {
  await api
    .get("/api/notes")
    .expect(200)
    .expect("Content-Type", /application\/json/)
})

afterAll(() => {
  mongoose.connection.close()
})
```

The test imports the Express application from the **_app.js_** module and wraps it with the **_supertest_** function into a so-called [superagent](https://github.com/visionmedia/superagent) object. This object is assigned to the **_api_** variable and tests can use it for making HTTP requests to the backend.

Our test makes an HTTP GET request to the **_api/notes_** url and verifies that the request is responded to with the status code 200.

Once all the tests have finished running we have to close the database connection used by Mongoose. This can b acheived with the [afterAll](https://facebook.github.io/jest/docs/en/api.html#afterallfn-timeout) method:

```js
afterAll(() => {
  mongoose.connection.close()
})
```

When running your tests you may run across the following console warning:

![Jest async error](../readme-imgs/async-error.png)

If this occurs, let's follow the instructions and add a **_jest.config.js_** file at the root of the project with the following content:

```js
module.exports {
  testEnvironment: "node"
}
```

One tiny but important detail: at the beginning of this part we extracted the Express application into the **_app.js_** file, and the role of the **_index.js_** file was changed to launch the application at the specified port with Node's built-in **_http_** object:

```js
const app = require("./app") // the actual Express app
const http = require("http")
const config = require("./utils/config")
const logger = require("./utils/logger")

const server = http.createServer(app)

server.listen(config.PORT, () => {
  logger.info(`Server running on port ${config.PORT}`)
})
```

The tests only use the express application defined in the **_app.js_** file:

```js
const mongoose = require("mongoose")
const supertest = require("supertest")
const app = require("../app")

const api = supertest(app)

// ...
```

The documentation for supertest says the following:

> if the server is not already listening for connections then it is bound to an ephemeral port for you so there is no need to keep track of ports.

In other words, supertest takes care that the application being tested is started at the port that it uses internally.

Let's write a few more tests:

```js
test("there are two notes", async () => {
  const response = await api.get("/api/notes")

  expect(response.body).toHaveLength(2)
})

test("the first note is about HTTP methods", async () => {
  const response = await api.get("/api/notes")

  expect(response.body[0].content).toBe("HTML is easy")
})
```

Both tests store the resonse of the request to the **`response`** variable, and unlike the previous test that used the methods provided by **`supertest`** for verifying the status code and headers, this time we are inspecting the response data stored in **_response.body_** property. Our tests verify the format and content of the response data with the [expect](https://facebook.github.io/jest/docs/en/expect.html#content) method of Jest.

The benefit of using the async/await syntax is starting to become evident. Normally we would have to use callback functions to access the data returned by promises, but with the new syntax things are a lot more comfortable:

```js
const response = await api.get("api/notes")
```

The middleware that outputs information about the HTTP requests is obstructing the test execution output. Let us modify the logger so that it does not print to console in test mode:

```js
const info = (...params) => {
  if (process.env.NODE_ENV !== "test") {
    console.log(...params)
  }
}

const error = (...params) => {
  console.log(...params)
}

module.exports = {
  info, error
}
```
