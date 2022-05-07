const express = require("express");
const bodyParser = require('body-parser');
// var indexRouter = require("../routes/index");
var userRouter = require("../routes/user");
// var router2Router = require("../routes/router2");

module.exports = function(app) {
  app.use(express.json());
//   app.use(bodyParser.json())

//   app.use("/", indexRouter);
  app.use("/user", userRouter);
//   app.use("/router2", router2Router);
};