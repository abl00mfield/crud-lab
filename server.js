//dependencies and consts
const dotenv = require("dotenv");
const express = require("express");
const mongoose = require("mongoose");
const PORT = 3000;
const Song = require("./models/song.js");

//initialize the express app
const app = express();

//config code
dotenv.config();

// Middleware
app.use(express.urlencoded({ extended: false }));

//initialize connection to database
mongoose.connect(process.env.MONGODB_URI);
mongoose.connection.on("connected", () => {
  console.log(`Connected to MongoDB ${mongoose.connection.name}`);
});

// Routes
app.get("/", (req, res) => {
  res.render("index.ejs");
});

app.get("/songs", async (req, res) => {
  res.send("All songs");
});

app.get("/songs/new", async (req, res) => {
  res.send("create a new song");
});
// Start the server
app.listen(PORT, () => {
  console.log(`App listening at port ${PORT}`);
});
