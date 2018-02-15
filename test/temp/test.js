const UserResource = require("../api/users");
const DeviceResource = require("../api/devices");
const should = require("should");
const mConfig = require("../../api/service/Config");

var AWS = require("aws-sdk");

AWS.config.update({
    region: mConfig.Region,
    endpoint: mConfig.EndPoint
});

function testUser() {
    var request = {};
    request.body = JSON.stringify({
        "id": "nguyenhaidang",
        "first_name": "dang",
        "last_name": "nuygne",
        "password": "asdjaskhqwe",
        "email": "129379fkjjh@gmail.com",
        "phone_number": "0465672648",
    });

    // create user should success
    UserResource.registerUser(request, null, (err, data) => {
        should.not.exists(err);
        should.exist(data);
        console.log("Registering user succeeded: ", JSON.stringify(data, null, 2));

        // UserResource.getUserById({
        //     pathParameters: {
        //         user_id: "nguyenhaidang"
        //     }
        // }, null, (err, data) => {
        //     console.log(data);
        // });

        testDevice();

        // var updateRequest = {};
        // updateRequest.body = JSON.stringify({
        //     "first_name": "DangNguyen",
        //     "last_name": "perkele",
        //     "email": "newEmail@gmail.com",
        //     "phone_number": "24958628756",
        // });

        // updateRequest.pathParameters = {};
        // updateRequest.pathParameters.user_id = "nguyenhaidang";
        // UserResource.updateUser(updateRequest, null, (err, data) => {
        //     should.not.exists(err);
        //     console.log("Updated user result: " + JSON.stringify(data))
        // });
    });
}


