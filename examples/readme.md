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
- [Validation and ESLint](#validation-and-eslint)
- [Structure of Backend Application, Introduction to Testing](#structure-of-backend-application-introduction-to-testing)

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

- [Saving Data to MongoDB](readme-files/mongodb.md)

# Validation and ESLint

- [Validation and ESLint](readme-files/validation.md)

# Structure of Backend Application, Introduction to Testing

- [Structure of Backend Application, Introduction to Testing](readme-files/testing.md)
