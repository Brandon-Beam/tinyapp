const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
const cookieParser = require('cookie-parser')
app.set("view engine", "ejs");

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

const generateRandomString = () => {
  return Math.random().toString(36).substring(2, 8);
}

app.use(cookieParser())

app.use(express.urlencoded({ extended: true }));


app.get("/urls", (req, res) => {
  const username = req.cookies.username
  const templateVars = { username, urls: urlDatabase };
  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  const username = req.cookies.username
  const templateVars = {
    username,
  };
  res.render("urls_new", templateVars);
});

app.get("/urls/:id", (req, res) => {
  const username = req.cookies.username
  const templateVars = { username, id: req.params.id, longURL: urlDatabase[req.params.id] };
  res.render("urls_show", templateVars);
});

app.get("/", (req, res) => {
  res.send("Hello!");
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});


app.get("/u/:id", (req, res) => {
  const longURL = urlDatabase[req.params.id]
  res.redirect(longURL);
});

app.post("/urls", (req, res) => {
  console.log(req.body);
  const newstring = generateRandomString()
  urlDatabase[newstring] = req.body.longURL
  console.log(urlDatabase)
  res.redirect(302, `/urls/${newstring}`)
});

app.post("/urls/:id/delete", (req, res) => {
  delete urlDatabase[req.params.id]
  res.redirect("/urls")
});

app.post("/urls/:id", (req, res) => {
  urlDatabase[req.params.id] = req.body.longURL
  res.redirect("/urls")
});

app.post("/login", (req, res) => {
  res.cookie("username", req.body.login, { path: '/' });
  res.redirect("/urls")
});

app.post("/logout", (req, res) => {
  res.clearCookie('username');
  res.redirect("/urls")
});


app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
