'use strict';
const assert = require('assert');
const User = require("../../api/service/User");
const should = require("should");
const TableManagement = require("./TablesLifeCycle");

describe('User', function () {

  this.timeout(2000);
  beforeEach(function (done) {
    TableManagement.createTables()
      .then(() => done())
      .catch(err => {
        throw new Error("StupidityOverflowException");
      });
  });
  afterEach(function (done) {
    TableManagement.deleteTables()
      .then(() => done())
      .catch(err => {
        console.log(err);
        throw new Error("StupidityOverflowException");
      });
  });

  const data = {
    user_id: "Nguyen Hai Dang",
    password: "uncrackable",
    first_name: "Dang",
    last_name: "Nguyen",
    email: "nguye.dang@gfarming.com",
    phone_number: "0465672648"
  };

  describe('object returned by new User()', function () {
    it('should have proper field populated', function (done) {
      const user = new User(data, true);
      should.exists(user);
      should.exists(user.Salt);
      should.exists(user.Password);
      done();
    });

    it('should persist user properly', function (done) {
      const user = new User(data, true);
      user.Save(function errorHandler(error) {
        if (error) {
          throw new Error("StupidityOverflowException");
        } else {
          done();
        }
      });
    });

    it('should not have password field in when being transferred', function (done) {
      const user = new User(data, true);
      const transferable = JSON.parse(user.ToTransferJSON());
      should.not.exist(transferable.password);
      transferable.first_name.should.equal(data.first_name);
      done();
    });
  });

  describe("User.GetUserById", function () {
    it('should do it properly', function (done) {
      const user = new User(data, true);
      user.Save((error) => {
        should.not.exist(error);
        User.GetUserById(data.user_id, (err, user) => {
          should.not.exist(err);
          user.Id.should.equal(data.user_id);
          user.Password.should.not.equal(data.user_id);
          user.Email.should.equal(data.email);
          user.PhoneNumber.should.equal(data.phone_number);
          user.FirstName.should.equal(data.first_name);
          user.LastName.should.equal(data.last_name);
          should.exist(user.Salt);
          done();
        });
      });
    });
  });
});