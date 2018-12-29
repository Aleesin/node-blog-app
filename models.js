'use strict';

const mongoose = require("mongoose");


// Schema for authors
const authorSchema = mongoose.Schema({
    firstName: String,
    lastName: String,
    userName: {
        type: String,
        unique: true
    }
});

// Schema for comments 
const commentSchema = mongoose.Schema({ content: String })


// Schema for blogposts
const blogpostSchema = mongoose.Schema({
    title: { type: String, required: true },
    content: { type: String, required: true},
    author: { type: mongoose.Schema.Types.ObjectId, ref: 'Author'},
    created: { type: Date, default: Date.now }, // dont know if this is required
    comments: [commentSchema]
});




// Virtuals: create author name string out of 2 firstName and lastName keys
// use a prehook to let blog post schemas serialize method access authorName
blogpostSchema.pre('findOne', function(next) {
    this.populate('author');
    next();
})

// Virtual to create prehook to retrieve author of multiple blog posts
blogpostSchema.pre('find', function(next) {
    this.populate('author');
    next();
})



// Still needed when adding separate Schema for authors in separate DB,
// otherwise returns full object
blogpostSchema.virtual("authorString").get(function() {
    return `${this.author.firstName} ${this.author.lastName}`.trim();
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
        created: this.created // use Date.now!

    }
}

// all instance methods and virtual properties on schema
// must be defined before make the call to `.model`

const Blogpost = mongoose.model("blogpost", blogpostSchema);
const Author = mongoose.model('Author', authorSchema);


module.exports = { Blogpost, Author };