# Node.js and Express

- [Node.js and Express](#nodejs-and-express)
  - [Simple Web Server](#simple-web-server)
  - [Expess](#expess)

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

