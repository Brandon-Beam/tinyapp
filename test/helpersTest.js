const { assert } = require('chai');

const { emailFinder } = require('../helpers.js');

const testUsers = {
  "userRandomID": {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur"
  },
  "user2RandomID": {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk"
  }
};

describe('getUserByEmail', function () {
  it('should return a user with valid email', function () {
    const user = emailFinder("user@example.com", testUsers).id
    const expectedUserID = "userRandomID";
    assert.equal(user, expectedUserID)
  });
  it('should return null for no email', function () {
    const user = emailFinder("user@examle.com", testUsers)
    const expectedUserID = "userRandomID";
    assert.equal(user, null)
  });
});