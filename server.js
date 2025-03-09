//dependencies and consts
const dotenv = require("dotenv");
const express = require("express");
const mongoose = require("mongoose");
const PORT = 3000;
const Song = require("./models/song.js");
const methodOverride = require("method-override");
const morgan = require("morgan");
const axios = require("axios");

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
  try {
    const { title, artist, album, rating } = req.body;
    const response = await axios.get(`https://itunes.apple.com/search`, {
      params: {
        term: `"${artist}" "${album}" "${title}"`,
        media: "music",
        entity: "musicTrack",
        limit: 5,
      },
    });
    const originalSong = response.data.results.find((song) => {
      return (
        !song.trackName.toLowerCase().includes("remix") &&
        !song.trackName.toLowerCase().includes("cover") &&
        !song.trackName.toLowerCase().includes("karaoke") &&
        !song.collectionName.toLowerCase().includes("remix") &&
        !song.collectionName.toLowerCase().includes("cover") &&
        !song.collectionName.toLowerCase().includes("karaoke")
      );
    });

    // Use the originalSong (or the first result if no match found)
    const songData = originalSong || response.data.results[0];
    let formattedDate;
    const date = new Date(songData?.releaseDate);
    if (date) {
      formattedDate = date.toLocaleString("en-US", {
        month: "2-digit",
        day: "2-digit",
        year: "numeric",
      });
    }

    const newSong = {
      title,
      artist: songData?.artistName || artist,
      album: songData?.collectionName || album || "Unknown",
      rating,
      albumArt: songData?.artworkUrl100 || "/images/default.png",
      genre: songData?.primaryGenreName || "Unknown",
      releaseDate: formattedDate || "Unknown",
      previewUrl: songData?.previewUrl || "No Preview",
    };

    console.log("song URL ", songData?.previewUrl);
    console.log("new song ", newSong);

    await Song.create(newSong);
    res.redirect("/songs");
  } catch (error) {
    console.error("Error fetching song data: ", error);
    res.redirect("/songs");
  }
});

app.get("/songs/new", async (req, res) => {
  res.render("songs/new.ejs");
});

app.get("/songs/:songId", async (req, res) => {
  console.log(req.params.songId);
  try {
    foundSong = await Song.findById(req.params.songId);
    res.render("songs/show.ejs", { song: foundSong });
  } catch (error) {
    res.redirect("/songs");
  }
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
  const foundSong = await Song.findById(req.params.songId);
  const updatedSong = {
    title: req.body.title || foundSong.title,
    artist: req.body.artist || foundSong.artist,
    album: req.body.album || foundSong.album,
    rating: req.body.rating || foundSong.rating,
    albumArt: foundSong.albumArt,
    genre: foundSong.genre,
    releaseDate: foundSong.releaseDate,
    previewUrl: foundSong.previewUrl,
  };

  await Song.findByIdAndUpdate(req.params.songId, updatedSong);
  res.redirect(`/songs/${req.params.songId}`);
});

// Start the server
app.listen(PORT, () => {
  console.log(`App listening at port ${PORT}`);
});
