"use strict";
// make sure to use the name of the database from in the url, does test need to point to different db?
exports.DATABASE_URL = process.env.DATABASE_URL || "mongodb://localhost/blogPostDb";
//exports.TEST_DATABASE_URL = process.env.TEST_DATABASE_URL || "mongodb://localhost/blogPostDbtest";
exports.PORT = process.env.PORT || 8080;