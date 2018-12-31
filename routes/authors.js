let express = require('express');
let router = express.Router();
const { Blogpost, Author } = require("../models");

// Delegate data fetching to services
// one file per model -> authorServies.js and bolgpostservices.js
// they ll interact with the database
// add middlewares to avoid writing the same code and to refactor
module.exports = () => {

	router.get('/authors', (req, res) => {
	    Author
	      .find()
	      .then(authors => {
	        res.json(authors.map(author => {
	          return {
	            id: author._id,
	            name: `${author.firstName} ${author.lastName}`,
	            userName: author.userName
	          };
	        }));
	      })
	      .catch(err => {
	        console.error(err);
	        res.status(500).json({ error: 'something went terribly wrong' });
	      });
	  });


	// POST /authors
	router.post('/authors', (req, res) => {
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
	router.put('/authors/:id', (req, res) => {
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
	router.delete('/authors/:id', (req, res) => {
	    Blogpost
	        .remove({ author: req.params.id })
	        .then(() => {
	            return Author
	                .findByIdAndRemove(req.params.id)
	                .then(() => {
	                    console.log(`Deleted blog posts owned and author with id ${req.params.id}`);
	                    res.status(204).end();
	                });

	        })
	        .catch(err => {
	            console.log(err);
	            res.status(500).json({ message: "Internal server error"})
	        });

	});

	return router;
}