const express = require("express");
const bcrypt = require("bcryptjs");
const cookieSession = require('cookie-session');
const find = require("./helpers");
const app = express();
const PORT = 8080;
const salt = bcrypt.genSaltSync(10);
//above is definitions and requirements below are various functions for functionality
//cookie security
app.use(cookieSession({
  name: 'session',
  keys: ['super', 'secret'],
}));
// global fields for user and url storage
const users = {};
const urlDatabase = {
  "b2xVn2": {
    longURL: "http://www.lighthouselabs.ca", userId: 'fy7dh7'
  },
  "9sm5xK": { longURL: "http://www.google.com", userId: 'fdsgh7' }
};


const generateRandomString = () => {
  return Math.random().toString(36).substring(2, 8);
};

app.set("view engine", "ejs");

app.use(express.urlencoded({ extended: true }));
//start of gets for web pages
//shows urls if logged in
app.get("/urls", (req, res) => {
  if (req.session.user_id) {
    const userId = req.session.user_id;
    const username = users[userId];
    const yourUrls = () => {
      let personalURLS = {};
      for (const item in urlDatabase) {
        if (urlDatabase[item].userId === userId)
          personalURLS[item] = urlDatabase[item];
      } return personalURLS;
    };
    let urls = yourUrls(userId);
    const templateVars = { username, urls };
    res.render("urls_index", templateVars);
  } else {
    res.status(404).send('not logged in');
  }
});
//shows page that lets you make new urls
app.get("/urls/new", (req, res) => {
  if (req.session.user_id) {
    const userId = req.session.user_id;
    const username = users[userId];
    const templateVars = {
      username,
    };
    res.render("urls_new", templateVars);
  } else {
    res.redirect("/login");
  }
});
//goes to page with long url
app.get("/urls/:id", (req, res) => {
  const longURL = urlDatabase[req.params.id].longURL;
  if (longURL && req.session.user_id === urlDatabase[req.params.id].userId) {
    const userId = req.session.user_id;
    const username = users[userId];
    const templateVars = { username, id: req.params.id, longURL };
    res.render("urls_show", templateVars);
  } if (req.session.user_id !== urlDatabase[req.params.id].userId) {
    res.status(404).send('you shouldnt be here');
  } else {
    res.sendStatus(404);
  }
});

app.get("/u/:id", (req, res) => {
  const longURL = urlDatabase[req.params.id].longURL;
  if (longURL) {
    res.redirect(longURL);
  } else {
    res.sendStatus(404);
  }
});
//registers users
app.get("/registration", (req, res) => {
  if (!req.session.user_id) {
    const userId = req.session.user_id;
    const username = users[userId];
    const templateVars = { username };
    res.render("registration", templateVars);
  } else {
    res.redirect("/urls");
  }
});
//logs users in
app.get("/login", (req, res) => {
  if (!req.session.user_id) {
    const userId = req.session.user_id;
    const username = users[userId];
    const templateVars = { username };
    res.render("login", templateVars);
  } else {
    res.redirect("/urls");
  }
});
// start of posts
app.post("/urls", (req, res) => {
  if (req.session.user_id) {
    const newstring = generateRandomString();
    const longURL = req.body.longURL;
    const userId = req.session.user_id;
    urlDatabase[newstring] = { longURL, userId };
    res.redirect(302, `/urls/${newstring}`);
  } else {
    res.status(403).send('nice try');
  }
});
//deletes if logged in
app.post("/urls/:id/delete", (req, res) => {
  const user = req.session.user_id;
  const id = req.params.id;
  if (!user) {
    res.status(404).send('account does not exist or is not logged in');
  } else if (!urlDatabase[id]) {
    res.status(404).send('link not found');
  } else if (user !== urlDatabase[id].userId) {
    res.status(404).send('no access allowed');
  } else {
    delete urlDatabase[req.params.id];
    res.redirect("/urls");
  }
});
//post new urls if logged in
app.post("/urls/:id", (req, res) => {
  const user = req.session.user_id;
  const id = req.params.id;
  if (!user) {
    res.status(404).send('account does not exist or is not logged in');
  } else if (!urlDatabase[id]) {
    res.status(404).send('link not found');
  } else if (user !== urlDatabase[id].userId) {
    res.status(404).send('no access allowed');
  } else {
    urlDatabase[req.params.id].longURL = req.body.longURL;
    res.redirect("/urls");
  }
});
// logs in if hashed passwords match
app.post("/login", (req, res) => {
  const email = req.body.email;
  const password2 = req.body.password;
  const hashedPassword = find.emailFinder(email, users).password;
  const match = bcrypt.compareSync(password2, hashedPassword);
  if (!find.emailFinder(email, users) || !match) {
    res.sendStatus(403);
  } else {
    req.session.user_id = find.emailFinder(email, users).id;
    res.redirect("/urls");
  }
});
//deletes cookies on logout
app.post("/logout", (req, res) => {
  req.session.user_id = null;
  res.redirect("/login");
});
//posts registration to users
app.post("/register", (req, res) => {
  const email = req.body.email;
  const password = bcrypt.hashSync(req.body.password, salt);
  const id = generateRandomString();
  if (email === '' || req.body.password === '' || find.emailFinder(email, users) !== null) {
    res.sendStatus(400);
  } else {
    users[id] = { id, email, password };
    req.session.user_id = id;
    res.redirect("/urls");
  }
});

// logs port on server wakeup
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
