require("dotenv").config();
const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const app = express();
const mongoose = require("mongoose");
const mongo_uri = process.env.MONGO_URI;
mongoose.connect(mongo_uri);
const connection = mongoose.connection;
connection.on("error", (err) => {
  console.log("Connection Error: " + err);
});
connection.once("open", () => console.log("Successfully connected to DB"));

const urlSchema = new mongoose.Schema({
  original_url: String,
  short_url: String,
});
const Url = mongoose.model("Url", urlSchema);
const getOriginalUrl = async (url) => {
  const findOne = await Url.findOne({ original_url: url });
  return findOne;
};
const getShortUrl = async (url) => await Url.findOne({ short_url: url });
const saveUrl = async (url) => {
  let getUrl = await getOriginalUrl(url);

  if (!getUrl) {
    const shortUrl = (await Url.countDocuments({}).exec()) + 1;
    getUrl = new Url({
      original_url: url,
      short_url: shortUrl,
    });
    await getUrl.save();
    return { original_url: getUrl.original_url, short_url: getUrl.short_url };
  } else {
    return { original_url: getUrl.original_url, short_url: getUrl.short_url };
  }
};
const isValidUrl = (string) => {
  let url;
  try {
    url = new URL(string);
  } catch (e) {
    return false;
  }
  return url.protocol === "http:" || url.protocol === "https:";
};

const urlencodedParser = bodyParser.urlencoded({ extended: false });

// Basic Configuration
const port = process.env.PORT || 3000;

app.use(cors());

app.use("/public", express.static(__dirname + "/public"));

app.get("/", function (req, res) {
  res.sendFile(__dirname + "/views/index.html");
});

// First API endpoint
app.get("/api/hello", function (req, res) {
  res.json({ response: "Hello World" });
});

app.post("/api/shorturl", urlencodedParser, async function (req, res) {
  const url = isValidUrl(req.body.url)
    ? await saveUrl(req.body.url)
    : { error: "invalid url" };
  res.json(url);
});

app.get("/api/shorturl/:short_url", async function (req, res) {
  try {
    const url = await getShortUrl(req.params.short_url);
    res.redirect(url.original_url);
  } catch (error) {
    res.json({ error: "No short URL found for the given input" });
  }
});

app.listen(port, function () {
  console.log(`Listening on port ${port}`);
});
