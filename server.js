"use strict";

var express = require("express");
var mongo = require("mongodb");
var mongoose = require("mongoose");

var cors = require("cors");

const dns = require("dns");
const bodyparser = require("body-parser");

var app = express();

// Basic Configuration
var port = process.env.PORT || 3000;

/** this project needs a db !! **/

var mongoose = require("mongoose");
mongoose.connect(process.env.MONGO, {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

var Schema = mongoose.Schema;

const linkSchema = new Schema({
  _id: {
    type: String
  },
  original_url: {
    type: String,
    required: true
  }
});

const Link = mongoose.model("Link", linkSchema);

app.use(cors());

/** this project needs to parse POST bodies **/
// you should mount the body-parser here

app.use("/public", express.static(process.cwd() + "/public"));

app.get("/", function(req, res) {
  res.sendFile(process.cwd() + "/views/index.html");
});

app.use(bodyparser.urlencoded({ extended: false }));

app.post("/api/shorturl/new", function(req, res) {
  const { url } = req.body;
  const prefix = url.replace(/^https?:\/\/(.*)/, "");
  const id = generateID();

  dns.lookup(prefix, function(err) {
    if (err) {
      return res.json({ error: "invalid URL" });
    } else {
      Link.findOne({ original_url: url }, (err, doc) => {
        if (doc) {
          return res.json({ original_url: doc.original_url, short_url: doc._id });
        } else {
          const link = new Link({ _id: id, original_url: url });
          link.save(function(err, data) {
            if (err) return console.error(err);
            return res.json({ original_url: url, short_url: link._id });
          });
        }
      });
    }
  });
});

app.get("/api/shorturl/:id", (req, res) => {
  let id = req.params.id;
  Link.findOne({ _id: id }, (err, doc) => {
    if (doc) {
      res.redirect(doc.original_url);
    } else {
      res.redirect("/");
    }
  });
});

function generateID() {
  let id = "";
  let values = "abcdefghijklmnopqrstuvwxyz0123456789";

  for (let i = 0; i < 3; i++) {
    id += values.charAt(Math.floor(Math.random() * values.length));
  }
  return id;
}


// your first API endpoint...
app.get("/api/hello", function(req, res) {
  res.json({ greeting: "hello API" });
});

app.listen(port, function() {
  console.log("Node.js listening ...");
});
