require("dotenv").config();
const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const app = express();
const fs = require("fs");
const urlFilePath = "./urls.json";

const urlencodedParser = bodyParser.urlencoded({ extended: false });

const fileExist = (filePath) => {
  const initialData = [
    { original_url: "https://github.com/shyakadev", short_url: 1 },
  ];
  if (!fs.existsSync(filePath)) writeFile(filePath, initialData);
};

const readFile = (filePath) => {
  fileExist(filePath);
  try {
    const urls = fs.readFileSync(filePath);
    return JSON.parse(urls);
  } catch (error) {
    console.log(error);
  }
};

const writeFile = (filePath, data) => {
  fs.writeFile(filePath, JSON.stringify(data, null, 4), (err) => {
    if (err) {
      console.log(`Error writing file: ${err}`);
    }
    console.log("New record added!");
  });
};

function getUrl(url) {
  if (!isValidUrl(url)) return { error: "Invalid URL" };
  return addUrl(url);
}

const getUrls = () => readFile(urlFilePath);

function addUrl(urlString) {
  fileExist(urlFilePath);

  let urlExist = originalUrlExist(urlString);
  if (!urlExist) {
    const urlsArray = getUrls();
    if (Array.isArray(urlsArray)) {
      const urlObject = {
        original_url: urlString,
        short_url: urlsArray.length + 1,
      };
      urlsArray.push(urlObject);

      writeFile(urlFilePath, urlsArray);
      return urlObject
    }
  } else {
    console.log("Provided url already exist");
    return urlExist;
  }
}

const originalUrlExist = (string) => {
  const urlsArray = getUrls();

  if (Array.isArray(urlsArray)) {
    const url = urlsArray.find(({ original_url }) => original_url === string);
     return url;
  }
};

const shortUrlExist = (string) => {
  const shortned_url = Number(string);
  const urlsArray = getUrls();
  if (Array.isArray(urlsArray)) {
    const url = urlsArray.find(({ short_url }) => short_url === shortned_url);
    return url;
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
  const url = getUrl(req.body.url);
  res.json(url);
});

app.get("/api/shorturl/:short_url", function (req, res) {
  const short_url = req.params.short_url;
  try {
    const url = shortUrlExist(short_url);
    res.redirect(url["original_url"]);
  } catch (error) {
    res.json({ error: "No short URL found for the given input" });
  }
});

app.listen(port, function () {
  console.log(`Listening on port ${port}`);
});
