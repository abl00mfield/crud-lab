const mongoose = require("mongoose");
const songSchema = new mongoose.Schema({
  title: String,
  artist: String,
  album: String,
  rating: Number,
});

const Song = mongoose.model("Song", songSchema);
mongoose.model.exports = Song;
