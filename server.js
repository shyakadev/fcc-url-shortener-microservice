require("dotenv").config();
const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const app = express();

const urlencodedParser = bodyParser.urlencoded({ extended: false });

let shortUrlsDb = [];

const isValidUrl = (string) => {
  let url;
  try {
    url = new URL(string);
  } catch (e) {
    return false;
  }

  return url.protocol === "http:" || url.protocol === "http:";
};

const getUrls = (string) => {
  let url;
  if (isValidUrl(string)) {
    !doesExist(string) ? saveUrl(string) : "";
    url = doesExist(string);
  } else {
    url = { error: "Invalid URL" };
  }

  return url;
};

const doesExist = (string) =>
  shortUrlsDb.find(({ original_url }) => original_url === string);

const shortUrlDoesExist = (number) => {
  const url = shortUrlsDb.find(({ short_url }) => short_url == number);
  return url["original_url"];
};

const saveUrl = (string) =>
  shortUrlsDb.push({ original_url: string, short_url: shortUrlsDb.length + 1 });

// Basic Configuration
const port = process.env.PORT || 3000;

app.use(cors());

app.use("/public", express.static(__dirname + "/public"));

app.get("/", function (req, res) {
  res.sendFile(__dirname + "/views/index.html");
});

// First API endpoint
app.get("/api/hello", function (req, res) {
  res.json({ greeting: "hello API" });
});

app.post("/api/shorturl", urlencodedParser, function (req, res) {
  res.json(getUrls(req.body.url)), console.log(shortUrlsDb);
});

app.get("/api/shorturl/:short_url", function (req, res) {
  try {
    const url = shortUrlDoesExist(req.params.short_url);
    res.redirect(url);
  } catch (error) {
    res.json({ error: "No short URL found for the given input" });
  }
});

app.listen(port, function () {
  console.log(`Listening on port ${port}`);
});
