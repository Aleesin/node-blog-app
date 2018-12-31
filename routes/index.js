let express = require('express');
let router = express.Router();
let path = require('path');
let blogpostServices = require('./blogpostServices');
let authorServices = require('./authorServices')
module.exports = (app) => {
	router.use('/blogposts', blogpostServices);
	router.use('/authors', authorServices);
	app.use(router);
}