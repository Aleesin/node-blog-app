let express = require('express');
let router = express.Router();
const { Blogpost, Author } = require("../models");


module.exports = () => {

	router.get('/', (req, res) => {
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

	router.post('/', (req, res) => {
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
	                return Blogpost 
	                    .create({
	                        title: req.body.title,
	                        content: req.body.content,
	                        author: req.body.author_id
	                    })
	                    .then(blogpost => res.status(201).json(blogpost.serialize()))

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
	router.put('/blogposts/:id', (req, res) => {
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
	router.delete('/blogposts/:id', (req, res) => {
	    Blogpost.findByIdAndRemove(req.params.id)
	        .then(post => res.status(204).end())
	        .catch(err => res.status(500).json({ message: "Internal server error"}));
	});
	
	return router;
}