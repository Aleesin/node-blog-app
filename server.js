"use strict";

const express = require("express");
const mongoose = require("mongoose");

// Configure Mongoose to use ES6 promises
mongoose.Promise = global.Promise;

// config.js where we control constants for app
const { PORT, DATABASE_URL } = require("./config");
const { Blogpost } = require("./models");

const app = express();
app.use(express.json());

// GET requests 


// GET requests by ID


// POST


// PUT

// DELETE

// Catch all endpoint if client requests non-existent endpoing
app.use("*", function(req, res) {
    res.status(404).json({ message: "Not Found"});
});

// Declare server value
let server;

// connect to database and starts the server
function runServer(databaseUrl, port = PORT) {
    return new Promise((resolve, reject) => {
        mongoose.connect(
            databaseURl, 
            err => {
                if (err) {
                    return reject(err);
                }
                server = app
                    .listen(port, () => {
                        console.log(`Your app is listening on port ${port}`);
                        resolve();
                    })
                .on("error", err => {
                    mongoose.disconnect();
                    reject(err);
                });
            }
        );
    });
}

// This function closes the server and returns a promise
function closeServer() {
    return mongoose.disconnect().then(() => {
        return new Promise((resolve, reject) => {
            console.log("Closing server");
            server.close(err => {
                if (err) {
                    return reject(err);
                }
                resolve();
            });
        });
    });
}

// if server.js is called directly (aka `node server.js`), this block
// runs, also export runServer command so (test code) can start server
if (require.main === module) {
    runServer(DATABASE_URL).catch(err => console.error(err));
}

module.exports = { app, runServer, closeServer}