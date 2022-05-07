const express = require('express');

const userRouter = express.Router();

const { addJob } = require('../controllers/user');

userRouter.post('/addJob', addJob);

module.exports = userRouter;