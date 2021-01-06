- [Node.js and Express](#nodejs-and-express)
  - [Simple Web Server](#simple-web-server)
  - [Expess](#expess)
  - [Web and Express](#web-and-express)
  - [Nodemon](#nodemon)
  - [REST](#rest)
  - [Fetching a Single Resource](#fetching-a-single-resource)
  - [Deleting Resources](#deleting-resources)
  - [Postman](#postman)
  - [The Visual Studio Code REST Client](#the-visual-studio-code-rest-client)
  - [Receiving Data](#receiving-data)
  - [Middleware](#middleware)
- [Deploying App to Internet](#deploying-app-to-internet)
  - [Same Origin Policy and CORS](#same-origin-policy-and-cors)
  - [Application to the Internet](#application-to-the-internet)
  - [Frontend Production Build](#frontend-production-build)
  - [Serving Static Files from the Backend](#serving-static-files-from-the-backend)
  - [Streamlining Deploying of the Frontend](#streamlining-deploying-of-the-frontend)
  - [Proxy](#proxy)
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
- [Validation and ESLint](#validation-and-eslint)
  - [Promise Chaining](#promise-chaining)
  - [Deploying the Database Backend to Production](#deploying-the-database-backend-to-production)

# Node.js and Express

- Make a folder

```sh
mkdir backend && cd backend
npm init
```

- Create index.js file with below content:

```sh
echo "console.log('hello world')" > index.js
```

- Add script to package.json:

```json
"start": "node index.js"
```

- We can run the program directly:

```sh
node index.js
```

- Or we can run it as:

```sh
npm start
```

## Simple Web Server

Let's change the app into a web server:

```js
const http = require("http") // Node's built-in web server module

const app = http.createServer((req, res) => {
  res.writeHead(200, { "Content-Type": "text/plain" })
  res.end("Hello World")
})

const PORT = 3001
app.listen(PORT)
console.log(`Server running on port ${PORT}`)
```

- run **`npm start`** to start the server & visit http://localhost:3001
- The address http://localhost:3001/foo/bar will display the same content.

To serve raw data in the JSON format to the frontend we can do this:

```js
const http = require("http")

let notes = [
  {
    id: 1,
    content: "HTML is easy",
    date: "2019-05-30T17:30:31.098Z",
    important: false,
  },
  ...
]

const app = http.createServer((req, res) => {
  res.writeHead(200, { "Content-Type": "application/json" })
  res.end(JSON.stringify(notes))
})

const PORT = 3001
app.listen(PORT)
console.log(`Server running on port ${PORT}`)
```

## Expess

**Express** is an interface to work with built-in **http** module. It provides a better abstraction for general use cases we usually require to build a backend server.

```sh
npm install express
```

- To update the dependencies of our project we can:

```sh
npm update
```

## Web and Express

```js
const express = require('express')
const app = express()

let notes = [
  ...
]

app.get('/', (request, response) => {
  response.send('<h1>Hello World!</h1>')
})

app.get('/api/notes', (request, response) => {
  response.json(notes)
})

const PORT = 3001
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})
```

We define two _routes_ to the app. The event handler function accepts two parameters: **`request`** and **`response`**. **`request`** contains all of the info of the HTTP request, **`response`** parameters is used to define how the request is responded to.

The request to the app's root (**`/`**) is answered by using the **`send`** method of the **`response`** object. Server responds with the string **`<h1>Hello World!</h1>`**, that was passed to the **`send`** method. Since the parameter is a string, express automatically sets the value of the **`Content-Type`** header to be **`text/html`**. The status code of the response defaults to **`200`**.

![Express](readme-imgs/express.png)

The second route defines an event handler, that handles **HTTP GET** request made to the **_notes_** path of the application.

The request is responded to with the **`json`** method of the **`response`** object. **`Content-Type`** is automatically set to **`application/json`**.

In the earlier version where we were only using Node, we had to transform the data into the JSON format with the **`JSON.stringify`** method.

```js
response.end(JSON.stringify(notes))
```

With Express, this transformation happens automatically.

## Nodemon

> nodemon will watch the files in the directory in which nodemon was started, and if any files change, nodemon will autumatically restart your node application.

```sh
npm install --save-dev nodemon
```

We can start our application with **_nodemon_** like this:

```sh
node_modules/.bin/nodemon index.js
```

Even though the backend server restarts automatically, the browser still has to be manually refreshed.

Let's define a dedicated **_npm script_** for it in the **_package.json_** file:

```json
"scripts": {
  "start": "node index.js",
  "dev": "nodemon index.js",
}
```

Start the server in the dev mode:

```sh
npm run dev
```

## REST

Singular things, like notes, persons, tasks, are called **_resources_** in RESTful thinking. Every resource has an associated URL, which is the resource's unique address.

One convention is to create the unique address for the resources by combining the name of the resource type with the resource's unique identifier.

If the root URL of our service is **_www.example.com/api_** & we define the resource type of notes to be **_note_**, then the address of a note resource with the identifier 10, has the unique address **_www.example.com/api/notes/10_**.

The URL for the entire collection of note resources is **_www.example.com/api/notes_**.

We can execute different operations on resources. The operation to be executed is defined by the HTTP verb:

| URL            | Verb         | Functionality                                                    |
| -------------- | ------------ | ---------------------------------------------------------------- |
| **`notes/10`** | **`GET`**    | fetches a single resource                                        |
| **`notes`**    | **`GET`**    | fetches all resources in the collection                          |
| **`notes`**    | **`POST`**   | creates a new resource based on the request data                 |
| **`notes/10`** | **`DELETE`** | removes the identified resource                                  |
| **`notes/10`** | **`PUT`**    | replaces the entire identified resource with the request data    |
| **`notes/10`** | **`PATCH`**  | replaces a part of the identified resource with the request data |

## Fetching a Single Resource

- Let's create a route for fetching a single resource

```js
app.get("/api/notes/:id", (req, res) => {
  const id = req.params.id
  const note = notes.find((note) => note.id === id)
  res.json(note)
})
```

- Now **`app.get("api/notes/:id", ...)`** will handle all HTTP GET requests, that are of the form **_/api/notes/SOMETHING_**, where _SOMETHING_ is an arbitrary string.

- The **_id_** parameter in the route of a request, can be accessed through the **`req`** object:

```js
const id = request.params.id
```

- **`find`** method of arrays is used to find the note with an id that matches the parameter. The note is then returned to the sender of the request.

- When we test our app by visiting http://localhost:3001/api/notes/1, we notice that it does not appear to work, as the browser displays an empty page.

- Let's debug using **`console.log()`**:

```js
app.get("/api/notes/:id", (req, res) => {
  const id = req.params.id
  console.log(id)
  const note = notes.find((note) => note.id === id)
  console.log(note)
  res.json(note)
})
```

- When we revisit http://localhost:3001/api/notes/1, the console which is the terminal in this case, will display the following:

![REST undefined](readme-imgs/rest_undefined.png)

- The **`id`** parameter from the route is passed to our app but the **`find`** method does not find a matching note.

- To further our investigation, we can also add a **`console.log`** inside the comparison function passed to the **`find`** method.

```js
app.get("/api/notes/:id", (req, res) => {
  const id = req.params.id
  const note = notes.find((note) => {
    console.log(note.id, typeof note.id, id, typeof id, note.id === id)
    return note.id === id
  })
  console.log(note)
  res.json(note)
})
```

When we visit the URL again, each call to the comparison function prints a few different things to the console.

![REST typeof](readme-imgs/rest_typeof.png)

The **`id`** variable contains a string **`"1"`**, wheres the ids of notes are integers. In JS, the "triple equals" comparison **`===`** considers all values of different types to not be equal by default, meaning that **`1`** is not **`"1"`**.

- Let's fix the issue by changing id parameter from a string into a number:

```js
app.get("/api/notes/:id", (req, res) => {
  const id = Number(req.params.id)
  const note = notes.find((note) => note.id === id)
  res.json(note)
})
```

- Now fetching an individual resource works.

![REST fixed](readme-imgs/rest_fixed.png)

However, there's another problem. If we search for a note with an id that does not exist, the server responds with:

![Server error](readme-imgs/server_error.png)

HTTP status code **`200`** means that the response succeeded. But there's no data sent back.

The reason for this is that the **`note`** variable is set to **`undefined`** if no mathing note is found. The situation needs to be handled on the server. If no note is found, the server should respond with the status code **`404`** not found instead of **`200`**.

```js
app.get("/api/notes/:id", (req, res) => {
  const id = Number(req.params.id)
  const note = notes.find((note) => note.id === id)

  if (note) {
    res.json(note)
  } else {
    res.status(404).end()
  }
})
```

Since no data is attached to the response, we use the [status](http://expressjs.com/en/4x/api.html#res.status) method for setting the status, and the [end](http://expressjs.com/en/4x/api.html#res.end) method for responding to the request without sending any data.

```js
res.status(403).end()
res.status(400).send("Bad Request")
res.status(404).sendFile("/absolute/path/to/404.png")
```

We do not actually need to display anything in the browser because REST APIs are interfaces that are intended for programmatic use, and the error status code is all that is needed.

## Deleting Resources

Deletion happens by making an HTTP **`DELETE`** request to the url of the resource:

```js
app.delete("/api/notes/:id", (req, res) => {
  const id = Number(req.params.id)
  notes = notes.filter((note) => note.id !== id)

  res.status(204).end()
})
```

If deleting the resource is successful, meaning that the note exists and it is removed, we respond to the request with the status code **`204`** no content and return no data with the response. We can also respond with **`404`**.

## Postman

**`HTTP GET`** requests are easy to make from the browser. But how do we test the **`delete`** operations? We could write some JS for testing deletion, but this is not always the best solution.

One method is to use a command line program [curl](https://curl.haxx.se/). However it's easier to use Postman.

It's enough to define the url and then select the correct request type (**`DELETE`**).

![POSTMAN delete](readme-imgs/postman_delete.png)

## The Visual Studio Code REST Client

You can use VS Code [REST client](https://marketplace.visualstudio.com/items?itemName=humao.rest-client) plugin instead of Postman.

- Make a directory at the root of application named **_requests_**. Save all the **REST client** requests in the directory as files that end with the **_.rest_** extension.

- Let's create a new **get_all_notes.http** file and define the request that fetches all notes.

![REST client](readme-imgs/rest_client.png)

By clicking the **_Send Request_** text, the REST client will execute the HTTP request and response from the server is opened in the editor:

![REST client GET](readme-imgs/rest_client_get.png)

## Receiving Data

We add new notes to the server by making an **`HTTP POST`** request to the address http://localhost:3001/api/notes, and by sending all the info for the new note in the **request body** in the **JSON format**.

In order to access the data easily, we need the help of the express **`json-parser`**, that is taken to use with command **`app.use(express.json())`**.

```js
app.post("/api/notes", (req, res) => {
  const note = req.body
  console.log(note)

  res.json(note)
})
```

The event handler function can access the data from the **`body`** property of the **`req`** object.

Without the **json-parser**, the **`body`** property would be **`undefined`**. The **json-parser** functions so that it takes the JSON data of a request, transforms it into a JS object and then attaches it to the **`body`** property of the **`req`** object before the route handler is called.

For now, the app does not do anything with the received data besides printing it to the console and sending it back in the response.

Let's verify with REST client that the data is actually received by the server:

```json
POST http://localhost:3001/api/notes
content-type: application/json

{
    "content": "REST client is a good tool for testing REST apis",
    "important": true
}
```

We can verify using POSTMAN as well:

![POSTMAN post](readme-imgs/postman_post.png)

The app prints the data that we sent in the request to the console:

![REST post](readme-imgs/rest_post.png)

The server will not be able to parse the data correctly without the correct value in the header. It won't even try to guess the format of the data, since there's a massive amount of potential **_Content-Types_**.

So you need to set **`Content-Type`** correctly.

One benefit that the **REST client** has over **Postman** is that the requests are handily available at the root of the project repo, and they can be distributed to everyone in the dev team. You can also add multiple requests in the same file using **`###`** separators.

```sh
GET http://localhost:3001/api/notes/

###

POST http://localhost:3001/api/notes HTTP/1.1
content-type: application/json

{
  "name": "sample",
  "time": "Wed, 21 Oct 2015 18:27:50 GMT"
}
```

> **Important sidenote:**
> Sometimes when you're debugging, you ma want to find out what headers have been set in the HTTP request.
> One way is through the **`get`** method of the **`request`** object, that can be used for getting the value of a single header. The **`request`** object also has the **`headers`** property, that contains all of the headers of a specific request.
> Problems can occur with the VS REST client if you accidentally add an empty line between the top row and the row specifying the HTTP headers. In this situation, the REST client interprets this to mean that all headers are left empty, which leads to the backend server not knowing that the data it received is in the JSON format.

You'll be able to spot this missing **`Content-Type`** header if at some point in your code you print all of the request headers with the **`console.log(request.headers)`** command.

One we know that the app receives data correctly, it's time to finalize the handling of the request:

```js
app.post("/api/notes", (req, res) => {
  console.log(req.headers)
  const maxId = notes.length > 0 ? Math.max(...notes.map((n) => n.id)) : 0

  const note = req.body
  note.id = maxId + 1 // not recommended

  notes = notes.concat(note)

  res.json(note)
})
```

![REST client - post & save](readme-imgs/rest_post_save.png)

The current version still has the problem that the HTTP POST request can be used to add objects with arbitrary properties. Let's improve the app by defining that the **`content`** property may not be empty. The **`important`** and **`date`** properties will be given default values. All other properties are discarded:

```js
const generatedId = () => {
  const maxId = notes.length > 0 ? Math.max(...notes.map((note) => note.id)) : 0
  return maxId + 1
}

app.post("/api/notes", (req, res) => {
  const body = req.body

  if (!body.content) {
    return res.status(400).json({
      error: "content missing",
    })
  }

  const note = {
    content: body.content,
    important: body.important || false,
    date: new Date(),
    id: generatedId(),
  }

  notes = notes.concat(note)

  res.json(note)
})
```

If the received data is missing a value for the content property, the server will respond to the request with the status code **`400 bad request`**.

```js
if (!body.content) {
  return response.status(400).json({
    error: "content missing",
  })
}
```

Notice that calling **`return`** is crucial, because otherwise the code will execute to the very end and the malformed note gets saved to the app.

> It is better to generate timestamps on the server than in the browser, since we can't trust that host machine running the browser has its clock set correctly.

## Middleware

The express **_json-parser_** we took into use earlier is a so called middleware.

Middleware are functions that can be used for handling **`request`** and **`response`** objects.

The **json-parser** takes the raw data from the requests that's stored in the **`request`** object, parses it into a JavaScript object an assigns it to the request object as a new property _body_.

In practice, you can use several middleware at the same time. When you have more than one, they're executed one by one in the order that they were taken into use in express.

Let's implement our own middleware that prints info about every request that is sent to the server.

Middleware is a function that receives three parameters:

```js
const requestLogger = (req, res, next) => {
  console.log("Method: ", req.method)
  console.log("Path: ", req.path)
  console.log("Body: ", req.body)
  console.log("---")
  next()
}
```

At the end of the function body the **`next`** function that was passed as a parameter is called. The **`next`** function yields control to the next middleware.

Middleware are taken into use like this:

```js
app.use(requestLogger)
```

Middleware functions are called in the order that they're taken into use with the express server object's **`use`** method.

Use **json-parser** before **`requestLogger`** middleware, because otherwise **`req.body`** will not be initialized when the logger is executed.

Now let's make a request from the REST client:

```http
POST http://localhost:3001/api/notes
content-type: application/json

{
    "content": "REST client is a good tool for testing REST apis",
    "important": true
}
```

This is what it logs to the console:

![Custom middleware](readme-imgs/middleware.png)

Middleware functions have to be taken into use before routes if we want them to be executed before the route event handlers are called. There are also situations where we want to define middleware functions after routes. In practice, this means that we are defining middleware function that are only called if no route handles the HTTP request.

Let's add the following middleware after our routes, that is used for catching requests made to non-existent routes. For these requests, the middleware will return an error message in the JSON format.

```js
const unknownEndpoint = (req, res) => {
  res.status(404).send({ error: "unknown endpoint" })
}

app.use(unknownEndpoint)
```

# Deploying App to Internet

## Same Origin Policy and CORS

Certain "cross-domain" requests, notably Ajax requests, are forbidden by default by the same-origin security policy.

The JavaScript code of an application that runs in a browser can only communicate with a server in the same origin.

- We can allow requests from other origins by using Node's **cors** middleware.

```sh
npm install cors
```

- take the middleware to use and allow for requests from all origins

```js
const cors = require("cors")

app.use(cors())
```

## Application to the Internet

Add a file called **_Procfile_** to the project's root to the Heroku how to start the app:

```js
web: npm start
```

Change the definition of the port our app uses at the bottom of the index.js:

```js
const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})
```

Create a Heroku app with the command **`heroku create`**, commit your code to the repo and move it to Heroku with command **`git push heroku main`**

If everything went well, the app works.

If not, the issue can be found by reading heroku logs with command **`heroku logs`**.

> To keep an eye on the heroku logs at all times use **`heroku logs -t`** which prints the logs to console whenever something happens on the server.

> If you are deploying from a git repo where you code is not on the main branch you will need to run **`git push heroku HEAD:master`**. If you have already done a push to heroku, you may need to run **`git push heroku HEAD:main --force`**.

## Frontend Production Build

When a React app is deployed, we must create a **`production build`** or a version of the app which is optimized for production.

A production build of app created with **`create-react-app`** can be created with command **`npm run build`**.

This creates a directory called **`build`** (which contains the only HTML file of our app, index.html) which contains the directory **_static_**. Minified version of our app's JS code will be generated to the **_static_** directory. Even though the app code is in multiple files, all of the JS will be minified into one file. Actually all of the code from all of the app's dependencies will also be minified into this file.

## Serving Static Files from the Backend

One option for deploying the frontend is to copy the production build to the root of the backend repo and configure the backend to show the frontend's main page (the file build/index.html) as its main page.

We begin by copying the production build of the frontend to the root of the backend.

With Mac or Linux comps:

```sh
cp -r build ../../../fullstackopen-notes-backend
```

For Windows comp, you may use either **`copy`** or **`xcopy`** command instead.

To make express show _static_ content, the page **_index.html_** and the JS, etc., it fetches, we need a built-in middleware from express called **static**.

When we add the following amidst the declarations of middlewares

```js
app.use(express.static("build"))
```

whenever express gets an HTTP GET request it will first check if the **_build_** directory contains a file corresponding to the request's address. If a correct file is found, express will return it.

Now HTTP GET requests to the address **_www.serversaddress.com/index.html_** or **_www.serversaddress.com_** will show the React frontend. Get requests to the address **_www.serversaddress/api/notes_** will be handled by the backend's code.

If both the frontend and the backend are at the same address, we can declare **`baseUrl`** as a relative URL. The means we can leave out the part declaring the server

```js
// frontend_dir/services/services/notes.js
import axios from "axios"
const baseUrl = "api/notes"

const getAll = () => {
  const request = axios.get(baseUrl)
  return request.then((response) => response.data)
}

// ...
```

After the change, we have to create a new production build and copy it to the root of the backend repo.

The app can now be used from the backend address http://localhost:3001, the server returns the **_index.html_** file from the **_build_** repo.

Now that our app works, we can commit the production build of the frontend to the backend repo, and push the code to Heroku again and voila.

## Streamlining Deploying of the Frontend

To create a new production build of the frontend without extra manual work, let's add some npm-scripts to the **_package.json_** on the backend repository:

```js
  "scripts": {
    //...
    "build:ui": "rm -rf build && cd ../../osa2/materiaali/notes-new && npm run build --prod && cp -r build ../../../osa3/notes-backend/",
    "deploy": "git push heroku master",
    "deploy:full": "npm run build:ui && git add . && git commit -m uibuild && npm run deploy",
    "logs:prod": "heroku logs --tail"
  }
}
```

## Proxy

People often serve the front-end React app from the same host and port as their backend implementation.

For example, a production setup might look like this after the app is deployed:

```
/             - static server returns index.html with React app
/todos        - static server returns index.html with React app
/api/todos    - server handles any /api/* requests using the backend implementation
```

Such setup is **not** required. However, if you **do** have a setup like this, it is convenient to write requests like fetch('/api/todos') without worrying about redirecting them to another host or port during development.

To tell the development server to proxy any unknown requests to your API server in development, add a **`proxy`** field to your **_package.json_**, for example:

```
"proxy": "http://localhost:3001"
```

This way, when you **`fetch('/api/todos')`** in development, the development server will recognize that it’s not a static asset, and will proxy your request to http://localhost:3001/api/todos as a fallback. The development server will only attempt to send requests without **`text/html`** in its **`Accept`** header to the proxy.

Conveniently, this avoids **CORS** issues and error messages like this in development:

```
Fetch API cannot load http://localhost:4000/api/todos. No 'Access-Control-Allow-Origin' header is present on the requested resource. Origin 'http://localhost:3000' is therefore not allowed access. If an opaque response serves your needs, set the request's mode to 'no-cors' to fetch the resource with CORS disabled.
```

[Proxying API Requests in Development](https://create-react-app.dev/docs/proxying-api-requests-in-development/)

Changes on our frontend have caused it to no longer work in development mode (when started with command npm start) as the connection to the backend does not work.

![notes-frontend-break](readme-imgs/notes-break.png)

This is due to changing the backend address to a relative URL:

```js
const baseUrl = "/api/notes"
```

Because in development mode the frontend is at the address localhost:3000, the requests to the backend go to the wrong address _localhost:3000/api/notes_. The backend is at _localhost:3001_.

If the project was created with create-react-app, this problem is easy to solve. It is enough to add the following declaration to the **_package.json_** file on the frontend repo:

```js
// frontend/package.json
{
  "dependencies": {
  // ...
  },
  "scripts": {
  // ...
  },
  "proxy": "http://localhost:3001"
}
```

After a restart, the React development environment will work as a **proxy**. If the React code does an HTTP request to a server address at http://localhost:3000 not managed by the React application itself (i.e. when requests are not about fetching the CSS or JavaScript of the application), the request will be redirected to the server at http://localhost:3001.

Now the frontend is also fine, working with the server both in development- and production mode.

A negative aspect of our approach is how complicated it is to deploy the frontend. Deploying a new version requires generating new production build of the frontend and copying it to the backend repository. This makes creating an automated [deployment pipeline](https://martinfowler.com/bliki/DeploymentPipeline.html) more difficult. Deployment pipeline means an automated and controlled way to move the code from the computer of the developer through different tests and quality checks to the production environment.

There are multiple ways to achieve this (for example placing both backend and frontend code [to the same repository](https://github.com/mars/heroku-cra-node)) but we will not go into those now.

In some situations it may be sensible to deploy the frontend code as its own application. With apps created with create-react-app it is [straightforward](https://github.com/mars/create-react-app-buildpack).

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
  - ![mongodb connect](readme-imgs/mongodb-connect.png)
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

![MongoDB Collections](readme-imgs/mongodb-collections.png)

As the view states, the **_document_** matching the note has been added to the **_notes_** collection in the **_test_** database.

![MongoDB Notes](readme-imgs/mongodb-notes.png)

We should give a better name to the database. Like the documentation says, we can change the name of the database from the URI:

![MongoDB Change DB Name](readme-imgs/mongodb-renamedb.png)

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

![Mongoose Find](readme-imgs/mongoose-find.png)

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

![api/notes](readme-imgs/apinotes.png)

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

![REST test](readme-imgs/rest_test.png)

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

![Error logs](readme-imgs/error_logs.png)

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

![Validation Error](readme-imgs/validation_error.png)

Mongoose doesn't have a built-in validator for making sure that the value being added is unique. For this, we can use npm package [mongoose-unique-validator](https://github.com/blakehaswell/mongoose-unique-validator#readme)

## Promise Chaining

Many of the route handlers changed the response data into the right format by implicitly calling the **`toJSON`** method from **`response.json`**. For the sake of an example, we can also perform this operation explicitly by calling the **`toJSON`** method on the object passed as a parameter to **`then`**.

```js
app.post("/api/notes", (req, res, next) => {
  // ...

  note
    .save()
    .then((savedNote) => {
      res.json(savedNote.toJSON())
    })
    .catch((error) => next(error))
})
```

We can accomplish the same functionality in a much cleaner way with [promise chaining](https://javascript.info/promise-chaining):

```js
app.post("/api/notes", (req, res, next) => {
  // ...

  note
    .save()
    .then((savedNote) => {
      savedNote.toJSON()
    })
    .then((savedAndFormattedNote) => {
      res.json(savedAndFormattedNote)
    })
    .catch((error) => next(error))
})
```

In the first **`then`** we receive **`savedNote`** object returned by Mongoose and format it. The result of the operation is returned. Then [as we discussed earlier](#database-configuration-into-its-own-module), the **`then`** method of a promise also returns a promise and we can access the formatted note by registering a new callback function with the **`then`** method.

We can clean up our code even more by using the more compact wyntax for arrow functions:

```js
app.post("/api/notes", (req, res, next) => {
  // ...

  note
    .save()
    .then((savedNote) => savedNote.toJSON())
    .then((savedAndFormattedNote) => res.json(savedAndFormattedNote))
    .catch((error) => next(error))
})
```

In this example, Promise chaining does not provide much of a benefit. The situation would change if there were many asynchronous operations that had to be done in sequence. The **`async/await`** syntax in JS, taht we'll learn in the next part will make writing subsequent asynchronous operations a lot easier.

## Deploying the Database Backend to Production

The app should work almost as-is in Heroku. We do have to generate a new production build of the frontend due to the changes that we have made to our frontend.

The environment variables defined in dotenv will only be used when the backend is not in **_production mode_**, i.e. Heroku.

We defined the environment variables for development in file **_.env_**, but the environment variable that defines the database URL in production should be set to Heroku wih the **`heroku config:set`** command.

```bash
heroku config:set MONGODB_URI=mongodb+srv://fullstack:secretpasswordhere@cluster0-ostce.mongodb.net/note-app?retryWrites=true
```

**NB:** if the command causes an error, give the value of MONGODB_URI in apostrophes:

```bash
heroku config:set MONGODB_URI='mongodb+srv://fullstack:secretpasswordhere@cluster0-ostce.mongodb.net/note-app?retryWrites=true'
```

The application should now work. Sometimes things don't go according to plan. If there are problems, **_heroku logs_** will be there to help. My own app did not work after making the changes. The logs showed the following:

![heroku logs](readme-imgs/heroku_logs.png)

For some reason the URL of the db was undefined. The heroku config command revealed that I had accidentally defined the URL to **`MONGO_URI`** environment variable, when the code expected it to be **`MONGODB_URI`**
