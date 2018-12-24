"use strict"

const mongoose = require("mongoose");

// Schema for blogposts
const blogpostSchema = mongoose.Schema({
    title: { type: String, required: true },
    content: { type: String, required: true},
    author: {
                firstName: String,
                lastName: String
            },
    created: { type: Date }
});

// Virtuals: create author name string out of 2 firstName and lastName keys
blogpostSchema.virtual("authorString").get(function() {
    return `${this.author.firstName} ${this.author.lastName}`;
});

// blogpostSchema.virtual("created").get(function() {
//     return `${this.title}`
// })
// instance methods: serialize to create blogpost object to return
// how do I test this?
blogpostSchema.methods.serialize = function() {
    return {
        id: this.id,
        title: this.title,
        content: this.content,
        author: this.authorString,
       // created: this.created // not sure how to show date when its not in db

    }
}

// all instance methods and virtual properties on schema
// must be defined before make the call to `.model`

const Blogpost = mongoose.model("blogpost", blogpostSchema);

module.exports = { Blogpost };