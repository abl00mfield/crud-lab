//dependencies and consts
const dotenv = require("dotenv");
const express = require("express");
const mongoose = require("mongoose");
const PORT = 3000;
const Song = require("./models/song.js");
const methodOverride = require("method-override");
const morgan = require("morgan");

//initialize the express app
const app = express();

//config code
dotenv.config();

// Middleware
//parse the request body
app.use(express.urlencoded({ extended: false }));
//override the method param for DELETE and PUT
app.use(methodOverride("_method"));
//morgan
app.use(morgan("dev"));
//static asset middleware
app.use(express.static("public"));

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
  const allSongs = await Song.find({});
  res.render("songs/index.ejs", { songs: allSongs });
});

app.post("/songs", async (req, res) => {
  await Song.create(req.body);
  res.redirect("/songs");
});

app.get("/songs/new", async (req, res) => {
  res.render("songs/new.ejs");
});

app.get("/songs/:songId", async (req, res) => {
  const foundSong = await Song.findById(req.params.songId);
  res.render("songs/show.ejs", { song: foundSong });
});

app.delete("/songs/:songId", async (req, res) => {
  const songToDelete = req.params.songId;
  await Song.findByIdAndDelete(songToDelete);
  res.redirect("/songs");
});

app.get("/songs/:songId/edit", async (req, res) => {
  const foundSong = await Song.findById(req.params.songId);
  res.render("songs/edit.ejs", { song: foundSong });
});

app.put("/songs/:songId", async (req, res) => {
  await Song.findByIdAndUpdate(req.params.songId, req.body);
  res.redirect(`/songs/${req.params.songId}`);
});

// Start the server
app.listen(PORT, () => {
  console.log(`App listening at port ${PORT}`);
});
