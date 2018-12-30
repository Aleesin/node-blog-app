"use strict";

const express = require("express");
const mongoose = require("mongoose");
const morgan = require("morgan");

// Configure Mongoose to use ES6 promises
mongoose.Promise = global.Promise;

// config.js where we control constants for app
const { PORT, DATABASE_URL } = require("./config");
const { Blogpost, Author } = require("./models");
//mongoose.connect(DATABASE_URL); // from cheat sheet, not sure if this is needed

const app = express();
app.use(express.json());
app.use(morgan('common'));

// Blogpost api endpoints
// GET requests to /blogposts => returns blog posts
app.get("/blogposts", (req, res) => {

    // Previous endpoint code before author db added
    Blogpost.find()
    // success callback; for each blogpost call the .serialize instance method
    .then(blogposts => {
        res.json({ blogposts: blogposts.map(post => post.serialize())
        });
    })
    .catch(err => {
        console.log(err);
        res.status(500).json({ message: "Internal server error" });
    });
});


// GET requests by ID
app.get("/blogposts/:id", (req, res) => {
    Blogpost
        .findById(req.params.id)
        .then(blogpost => res.json(blogpost.serialize()))
        .catch(err => {
            console.error(err);
            res.status(500).json({ message: "Internal server error"});
        });
        
        
});


// POST: 
app.post('/blogposts', (req, res) => {
    const requiredFields = ["title", "content", "author_id"]
    for (let i = 0; i < requiredFields.length; i++) {
        const field = requiredFields[i];
        if (!(field in req.body)){
            const message = `Missing ${field} in request body`;
            console.error(message);
            return res.status(400).send(message);
        }
    }
    // need to compare the author_id sent in request and validate 
    // if it is in the author database.  If not return 400 status
    // If author_id value === an Id in the author collection, 
    // create the blogpost.  Otherwise, send 400 error.
    Author
        .findById(req.body.author_id)
        .then(author => {
            if (author) {
                Blogpost 
                    .create({
                        title: req.body.title,
                        content: req.body.content,
                        author: req.body.id
                    })
                    .then(blogpost => res.status(201).json(blogpost.serialize()))
                    .catch(err => {
                        console.error(err);
                        res.status(500).json({ message: "Internal server error" });
                    });
            }
            else {
                const message = `Author not found`;
                console.error(message);
                return res.status(400).send(message);
            }
        })
        .catch(err => {
            console.error(err);
            res.status(500).json({ error: `Internal server error`});
        });
        
        
});


// PUT
app.put('/blogposts/:id', (req, res) => {
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
    const updatableFields = ["title", "content"];
    //const updatableFields = ["title", "content", "author"];

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
app.delete('/blogposts/:id', (req, res) => {
    Blogpost.findByIdAndRemove(req.params.id)
        .then(post => res.status(204).end())
        .catch(err => res.status(500).json({ message: "Internal server error"}));
})

// Authors Api Endpoints

// POST /authors
app.post('/authors', (req, res) => {
    const requiredFields = ["firstName", "lastName", "userName"]
    for (let i = 0; i < requiredFields.length; i++) {
        const field = requiredFields[i];
        if (!(field in req.body)) {
            const message = `Missing ${field} in request body`;
            console.error(message);
            return res.status(400).send(message);
        }
    }

    Author
        .findOne({ userName: req.body.userName })
        .then(author => {
            if (author) {
                const message = `Username already taken`;
                console.error(message);
                return res.status(400).send(message);
            } 
            else {
                Author
                .create({
                    firstName: req.body.firstName,
                    lastName: req.body.lastName,
                    userName: req.body.userName
                })
                .then(author => res.status(201).json(author.serialize()))
                .catch(err => {
                    console.error(err);
                    res.status(500).json({ message: "Internal server error"});
                })

            }
        })
        .catch(err => {
            console.error(err);
            res.status(500).json({ error: "Internal server error"});
        });

        
});

// PUT /authors/:id
app.put('/authors/:id', (req, res) => {
    // Require ID matches in request path and request body
    if(!(req.params.id && req.body.id && req.params.id === req.body.id)){
        const message =
            `Request path id (${req.params.id} and request body id)` +
            `(${req.body.id} must match)`;
            console.log(message);
            return res.status(400).json({ message: message });
    }

    // Update the following fields
    const toUpdate = {};
    const updateableFields = ["firstName", "lastName", "userName"];

    updateableFields.forEach(field => {
        if (field in req.body) {
            toUpdate[field] = req.body[field];
        }
    });

    Author
        // update key/value pairs
        .findByIdAndUpdate(req.params.id, {$set: toUpdate})
        .then(post => res.status(204).end())
        .catch(err => res.status(500).json({ message: "Internal server error" }));
});

// DELETE /authors/:id 
// Also delete any associated blog posts
app.delete('authors/:id', (req, res) => {
    Blogpost
        .remove({ author: req.params.id })
        .then(() => {
            Author
                .findByIdAndRemove(req.params.id)
                .then(() => {
                    console.log(`Deleted blog posts owned and author with id ${req.params.id}`);
                    res.status(204).json({ message: 'success' });
                });

        })
        .catch(err => res.status(500).json({ message: "Internal server error"}));
});

// Catch-All endpoint if client requests non-existent endpoint
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