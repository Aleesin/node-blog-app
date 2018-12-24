"use strict";

const express = require("express");
const mongoose = require("mongoose");
const morgan = require("morgan");

// Configure Mongoose to use ES6 promises
mongoose.Promise = global.Promise;

// config.js where we control constants for app
const { PORT, DATABASE_URL } = require("./config");
const { Blogpost } = require("./models");
mongoose.connect(DATABASE_URL); // from cheat sheet, not sure if this is needed

const app = express();
app.use(express.json());
app.use(morgan('common'));

// GET requests to /blogposts => returns blog posts
app.get("/posts", (req, res) => {
    Blogpost.find()
    // success callback; for each restaurant call the .serialize instance method
    .then(posts => {
        res.json({ posts: posts.map(post => post.serialize())
        });
      //  console.log(blogposts);
    })
    .catch(err => {
        console.log(err);
        res.status(500).json({ message: "Internal server error" });
    });
});



// GET requests by ID ; shows every post same id? weird!
app.get("/posts/:id"), (req, res) => {
    Blogpost
        .findById(req.params.id)
        .then(post => res.json(post.serialize()))
        
        .catch(err => {
            console.error(err);
            res.status(500).json({ message: "Internal server error"});
        });
        console.log(post);
};


// POST:  showing 404 error, can't find this endpoint
app.post('/posts'), (req, res) => {
    const requiredFields = ["title", "content", "author"]
    for (let i = 0; i < requiredFields.length; i++) {
        const field = requiredFields[i];
        if (!(field in req.body)){
            const message = `Missing ${field} in request body`;
            console.error(message);
            return res.status(400).send(message);
        }
    }

    Blogpost
        .create({
            title: req.body.title,
            content: req.body.content,
            author: req.body.author
        })
        .then(blogpost => res.status(201).json(blogpost.serialize()))
        .catch(err => {
            console.error(err);
            res.status(500).json({ message: "Internal server error" });
            });
};


// PUT
app.put('/posts/:id', (req, res) => {
    // Require id in request path matches id in request body
    if(!(req.params.id && req.body.id && req.params.id === req.body.id)){
        const message = 
            `Request path id (${req.params.id} and request body id` +
            `(${req.body.id} must match)`;
        console.error(message);
        return res.status(400).json({ message: message });
    }

    // update the following fields
    const toUpdate = {};
    const updatableFields = ["title", "content", "author"];

    updatableFields.forEach(field => {
        if (field in req.body) {
            toUpdate[field] = req.body[field];
        }
    });

    Blogpost
        // update key/value pairs
        .findByIdAndUpdate(req.params.id, {$set: toUpdate})
        .then(post => res.status(204).end())
        .catch(err => res.status(500).json({ message: "Internal server error" }));

});

// DELETE
app.delete('/posts/:id', (req, res) => {
    Blogpost.findByIdAndRemove(req.params.id)
        .then(post => res.status(204).end())
        .catch(err => res.status(500).json({ message: "Internal server error"}));
})

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
            databaseUrl, 
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

module.exports = { runServer, app, closeServer}