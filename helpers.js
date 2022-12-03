const emailFinder = (email, database) => {
  for (const user in database) {
    if (database[user].email === email) {
      return database[user]
    }
  } return null
}
//finds user object on email match
module.exports = { emailFinder }