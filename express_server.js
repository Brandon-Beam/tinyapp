const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
const cookieParser = require('cookie-parser')
const users = {}
const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

const emailFinder = (email) => {
  for (const user in users) {
    if (users[user].email === email) {
      return users[user]
    }
  } return null
}

const generateRandomString = () => {
  return Math.random().toString(36).substring(2, 8);
}

app.use(cookieParser());

app.set("view engine", "ejs");

app.use(express.urlencoded({ extended: true }));


app.get("/urls", (req, res) => {
  const user_id = req.cookies.user_id;
  const username = users[user_id]
  const templateVars = { username, urls: urlDatabase };
  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  const user_id = req.cookies.user_id;
  const username = users[user_id]
  const templateVars = {
    username,
  };
  res.render("urls_new", templateVars);
});

app.get("/urls/:id", (req, res) => {
  const user_id = req.cookies.user_id;
  const username = users[user_id]
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

app.get("/registration", (req, res) => {
  const user_id = req.cookies.user_id;
  const username = users[user_id]
  const templateVars = { username }
  res.render("registration", templateVars);
});

app.get("/login", (req, res) => {
  const user_id = req.cookies.user_id;
  const username = users[user_id]
  const templateVars = { username }
  res.render("login", templateVars);
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
  const email = req.body.email;
  const password = req.body.password;
  if (!emailFinder(email) || emailFinder(email).password !== password) {
    res.sendStatus(403)
  } else {
    res.cookie("user_id", emailFinder(email).id);
    res.redirect("/urls")
  }
});

app.post("/logout", (req, res) => {
  res.clearCookie('user_id');
  res.redirect("/login")
});

app.post("/register", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  const id = generateRandomString();
  if (email === '' || password === '' || emailFinder(email) !== null) {
    res.sendStatus(400);
  }
  else {
    users[id] = { id, email, password }
    res.cookie("user_id", id);
    res.redirect("/urls")
  }
});


app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
