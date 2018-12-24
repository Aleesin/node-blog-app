"use strict"

const mongoose = require("mongoose");

// Schema for blogposts
const blogpostSchema = mongoose.Schema({
    title: { type: String, required: true },
    content: { type: String, required: true},
    author: [
        {
            firstName: String,
            lastName: String,
        }

    ]

});

// Virtuals: create author name string out of 2 firstName and lastName keys
// how to test this?
blogpostSchema.virtual("authorString").get(function() {
    return `${this.author.firstName} ${this.author.lastName}`;
});

// instance methods: serialize to create blogpost object to return
// how do I test this?
blogpostSchema.methods.serialize = function() {
    return {
        id: this.id,
        title: this.title,
        content: this.content,
     //   firstName: this.firstName, // may not need this, is experiment
      //  lastName: this.lastName, // this line too
        author: this.authorString,

    }
}

// all instance methods and virtual properties on schema
// must be defined before make the call to `.model`

const Blogpost = mongoose.model("blogpost", blogpostSchema);

module.exports = { Blogpost };