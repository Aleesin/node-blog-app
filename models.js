"use strict"

const mongoose = require("mongoose");

// Schema to represent Data models

const blogpostSchema = mongoose.Schema({
    title: { type: String, required: true },
    content: { type: String, required: true},
    author: {
        firstName: String, required: true,
        lastName: String, required: true,
    }

})

