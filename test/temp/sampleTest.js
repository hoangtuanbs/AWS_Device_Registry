'use strict';

var mConfig = require('./APIConfig.js');

var cRequest = require('request');

var mUserId;

describe('User', function () {
  it('Register new user', function (done) {
    this.timeout(10000);
    cRequest(
      {
        url: mConfig.Route.Register,
        method: "POST",
        json: true,   // <--Very important!!!
        body:
        {
          "phone": "+358404822866",
          "lname": "vu",
          "gender": "1",
          "dob": "05-27-98",
          "fname": "tuan",
          "pw": "1111",
          "email": "tuan@tuan.com",
          "nationality": "FI",
          "ccode": "FI"
        }
      }, function (error, response, body) {
        done();
      });
  });


  it('Login using the created user', function (done) {
    this.timeout(10000);
    cRequest(
      {
        url: mConfig.Route.Login,
        method: "POST",
        json: true,   // <--Very important!!!
        body:
        {
          "pw": "1111",
          "email": "tuan@tuan.com",
        }
      }, function (error, response, body) {
        var user = body.response;
        mUserId = user.user_id;
        if (user.fname != "tuan") throw new Error("Invalid user retrieved");
        done();
      });
  });

});

describe('/Contacts', function () {
  it('Saving contacts', function (done) {
    this.timeout(10000);
    cRequest(
      {
        url: mConfig.Route.Contacts,
        method: "POST",
        json: true,   // <--Very important!!!
        body:
        {
          user_id: mUserId,
          contacts:
          [
            {
              "name": "Tuan Vu2",
              "email": "tuan3@gmail.com",
              "phone": "0404822866"
            }
          ]
        }
      }, function (error, response, body) {
        var ret = body.response;
        if (ret) done();
        else throw new Error("Failed to save contacts");
      });
  });

  it('Load contacts', function (done) {
    this.timeout(10000);
    cRequest(
      {
        url: mConfig.Route.Contacts,
        method: "POST",
        json: true,   // <--Very important!!!
        body:
        {
          user_id: mUserId,
        }
      }, function (error, response, body) {
        var ret = body;
        if (!ret.length) throw new Error("Failed to save contacts");
        var contact = ret[0];
        if (contact.email != "tuan3@gmail.com") throw new Error("Failed to save contacts");

        done();
      });
  });
});

describe('/Location', function () {
  it('Saving Location', function (done) {
    this.timeout(10000);
    cRequest(
      {
        url: mConfig.Route.Location,
        method: "POST",
        json: true,   // <--Very important!!!
        body:
        {
          user_id: mUserId,
          longitude: 65.40,
          latitude: 43.21,
          status_code: "S20"
        }
      }, function (error, response, body) {
        var ret = body.response;
        if (ret) done();
        else {
          console.log(error);
          throw new Error("Failed to save location");
        }
      });
  });

  it('Loading 1 nearby user', function (done) {
    this.timeout(10000);

    // Create 5 nearby users

    cRequest(
      {
        url: mConfig.Route.Location,
        method: "POST",
        json: true,   // <--Very important!!!
        body:
        {
          user_id: 341,
          longitude: 65.41,
          latitude: 43.20,
          status_code: "S20"
        }
      }, function (error, response, body) {
        var ret = body.response;
        if (ret) {
          cRequest(
            {
              url: mConfig.Route.Location,
              method: "POST",
              json: true,   // <--Very important!!!
              body:
              {
                user_id: 341,
              }
            }, function (error, response, body) {
              var ret = body;
              if (ret) {
                done();
              }
              else {
                console.log(error);
                throw new Error("Failed to load locations");
              }
            });
        }
        else {
          console.log(error);
          throw new Error("Failed to save location");
        }
      });
  });
});


describe('/Alarm', function () {
  for (var i = 0; i < 100; i++) {
    var email = "tester" + i + "@gmail.com";

    cRequest(
      {
        url: mConfig.Route.Register,
        method: "POST",
        json: true,   // <--Very important!!!
        body:
        {
          "phone": "+358404822866",
          "lname": "vu",
          "gender": "1",
          "dob": "05-27-90",
          "fname": "tuan",
          "pw": "1111",
          "email": email,
          "nationality": "FI",
          "ccode": "FI"
        }
      });
  }
  it('Initiating alarm', function (done) {
    this.timeout(10000);
    cRequest(
      {
        url: mConfig.Route.Alarm,
        method: "POST",
        json: true,   // <--Very important!!!
        body:
        {
          user_id: mUserId,
          command: "Alarm"
        }
      }, function (error, response, body) {
        var ret = body.response;
        if (ret) done();
        else {
          console.log(error);
          throw new Error("Failed to save location");
        }
      });
  });

  it('Loading 1 nearby user', function (done) {
    this.timeout(10000);

    // Create 5 nearby users

    cRequest(
      {
        url: mConfig.Route.Location,
        method: "POST",
        json: true,   // <--Very important!!!
        body:
        {
          user_id: 341,
          longitude: 65.41,
          latitude: 43.20,
          status_code: "S20"
        }
      }, function (error, response, body) {
        var ret = body.response;
        if (ret) {
          cRequest(
            {
              url: mConfig.Route.Location,
              method: "POST",
              json: true,   // <--Very important!!!
              body:
              {
                user_id: 341,
              }
            }, function (error, response, body) {
              var ret = body;
              if (ret) {
                done();
              }
              else {
                console.log(error);
                throw new Error("Failed to load locations");
              }
            });
        }
        else {
          console.log(error);
          throw new Error("Failed to save location");
        }
      });
  });


});