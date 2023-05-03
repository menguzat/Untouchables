const express = require("express");
const path = require('path');
const port = process.env.port || 3008;

const app = express();
app.use(express.json());

let indexPath = "dist/";
let clientFile = "deneme.html";

// serve client
app.use(express.static(indexPath));
let indexFile = path.resolve(indexPath + clientFile);
app.get('/', function (req, res) {
  res.sendFile(indexFile);
});

// start the Express server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});