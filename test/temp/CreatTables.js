const UserResource = require("../api/users");
const DeviceResource = require("../api/devices");
const should = require("should");
const Config = require("../api/service/Config");

var AWS = require("aws-sdk");

AWS.config.update({
	region: Config.Region,
	endpoint: Config.EndPoint
});

const tables = {
    UserTable: Config.UserTable,
    DeviceTable: Config.DeviceTable,
    ControllerTable: Config.ControllerTable
}

var dynamodb = new AWS.DynamoDB();

console.log("Creating table");
const createTable = (tableInfo) => {
    dynamodb.createTable(tableInfo, function (err, data) {
        if (err) {
            console.error("Unable to create table. Error JSON:", JSON.stringify(err, null, 2));
        } else {
            console.log("Created table. Table description JSON:", JSON.stringify(data, null, 2));
        }
    });
}

createTable({
    TableName: tables.UserTable,
    KeySchema: [
        { AttributeName: "id", KeyType: "HASH" }
    ],
    AttributeDefinitions: [
        { AttributeName: "id", AttributeType: "S" }
    ],
    ProvisionedThroughput: {
        ReadCapacityUnits: 10,
        WriteCapacityUnits: 10
    }
});

createTable({
    TableName: tables.DeviceTable,
    KeySchema: [
        { AttributeName: "id", KeyType: "HASH" }
    ],
    AttributeDefinitions: [
        { AttributeName: "id", AttributeType: "S" }
    ],
    ProvisionedThroughput: {
        ReadCapacityUnits: 10,
        WriteCapacityUnits: 10
    }
});