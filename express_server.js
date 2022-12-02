const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
const cookieParser = require('cookie-parser')
const users = { fy7dh7: { id: 'fy7dh7', email: 'bbeam1@gmail.com', password: 's' } }
const urlDatabase = {
  "b2xVn2": {
    longURL: "http://www.lighthouselabs.ca", userId: 'fy7dh7'
  },
  "9sm5xK": { longURL: "http://www.google.com", userId: 'fdsgh7' }
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
  if (req.cookies.user_id) {
    const user_id = req.cookies.user_id;
    const username = users[user_id]
    const yourUrls = () => {
      let personalURLS = {}
      for (const item in urlDatabase) {
        if (urlDatabase[item].userId === user_id)
          personalURLS[item] = urlDatabase[item]
        console.log(personalURLS)
      } return personalURLS
    }
    let urls = yourUrls(user_id)
    console.log(urls)
    const templateVars = { username, urls };
    res.render("urls_index", templateVars);
  } else {
    res.status(404).send('not logged in')
  }
});

app.get("/urls/new", (req, res) => {
  if (req.cookies.user_id) {
    const user_id = req.cookies.user_id;
    const username = users[user_id]
    const templateVars = {
      username,
    };
    res.render("urls_new", templateVars);
  } else {
    res.redirect("/login")
  }
});

app.get("/urls/:id", (req, res) => {
  const longURL = urlDatabase[req.params.id].longURL
  if (longURL && req.cookies.user_id === urlDatabase[req.params.id].userId) {
    const user_id = req.cookies.user_id;
    const username = users[user_id]
    const templateVars = { username, id: req.params.id, longURL };
    res.render("urls_show", templateVars);
  } if (req.cookies.user_id !== urlDatabase[req.params.id].userId) { //wanted a different error message for this. technically couldve gone to else
    res.status(404).send('you shouldnt be here')
  }
  else {
    res.sendStatus(404)
  }
});

app.get("/u/:id", (req, res) => {
  const longURL = urlDatabase[req.params.id].longURL
  if (longURL) {
    res.redirect(longURL);
  } else {
    res.sendStatus(404)
  }
});

app.get("/registration", (req, res) => {
  if (!req.cookies.user_id) {
    const user_id = req.cookies.user_id;
    const username = users[user_id]
    const templateVars = { username }
    res.render("registration", templateVars);
  } else {
    res.redirect("/urls")
  }
});

app.get("/login", (req, res) => {
  if (!req.cookies.user_id) {
    const user_id = req.cookies.user_id;
    const username = users[user_id]
    const templateVars = { username }
    res.render("login", templateVars);
  } else {
    res.redirect("/urls")
  }
});

app.post("/urls", (req, res) => {
  if (req.cookies.user_id) {
    const newstring = generateRandomString()
    const longURL = req.body.longURL
    userId = req.cookies.user_id
    urlDatabase[newstring] = { longURL, userId }
    res.redirect(302, `/urls/${newstring}`)
  } else {
    res.status(403).send('nice try')
  }
});

app.post("/urls/:id/delete", (req, res) => {
  const user = req.cookies.user_id
  const id = req.params.id
  if (!user) {
    res.status(404).send('account does not exist or is not logged in')
  } else if (!urlDatabase[id]) {
    res.status(404).send('link not found')
  } else if (user !== urlDatabase[id].userId) {
    res.status(404).send('no access allowed')
  } else {
    delete urlDatabase[req.params.id]
    res.redirect("/urls")
  }
});

app.post("/urls/:id", (req, res) => {
  const user = req.cookies.user_id
  const id = req.params.id
  if (!user) {
    res.status(404).send('account does not exist or is not logged in')
  } else if (!urlDatabase[id]) {
    res.status(404).send('link not found')
  } else if (user !== urlDatabase[id].userId) {
    res.status(404).send('no access allowed')
  } else {
    urlDatabase[req.params.id].longURL = req.body.longURL
    res.redirect("/urls")
  }
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
