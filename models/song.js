const mongoose = require("mongoose");
const songSchema = new mongoose.Schema({
  title: String,
  artist: String,
  album: String,
  rating: Number,
  albumArt: String,
  genre: String,
  releaseDate: String,
  previewUrl: String,
});

const Song = mongoose.model("Song", songSchema);
module.exports = Song;
