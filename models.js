"use strict"

const mongoose = require("mongoose");

// Schema to represent Data models

// Schema for blogposts
const blogpostSchema = mongoose.Schema({
    title: { type: String, required: true },
    content: { type: String, required: true},
    author: {
        firstName: String, required: true,
        lastName: String, required: true,
    }

});

// Virtuals: create author name string out of 2 firstName and lastName keys

// instance methods: serialize to create blogpost object to return
blogpostSchema.methods.serialize = function() {
    return {
        id: this.id,
        title: this.title,
        firstName: this.firstName,
        lastName: this.lastName,
        author: this.authorString,

    }
}

// all instance methods and virtual properties on schema
// must be defined before make the call to `.model`

const Blogpost = mongoose.model("Blogpost", blogpostSchema);

module.exports = { Blogpost };