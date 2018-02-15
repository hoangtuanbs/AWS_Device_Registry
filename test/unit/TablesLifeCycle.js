
const Config = require("../../api/service/Config");
const Promise = require("bluebird");
const tables = {
    UserTable: Config.Tables.UserTable.name,
    DeviceTable: Config.Tables.DeviceTable.name
    // ControllerTable: Config.Tables.ControllerTable.name
}

const dynamodb = Config.AWS.DynamoDB;
const docClient = Config.AWS.DocumentClient;

const createTables = function createTables() {
    const createTable = (tableInfo) => {
        return dynamodb.createTable(tableInfo).promise();
    }

    const firstPro = createTable({
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

    const secondPro = createTable({
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

    return Promise.all([firstPro, secondPro]);
};

const deleteTables = function deleteTables() {
    const deleteTable = function deleteTable(tableName) {
        const params = {
            TableName: tableName
        };
        return dynamodb.deleteTable(params).promise();
    }

    var deletions = [];
    for (const property in tables) {
        deletions.push(deleteTable(tables[property]))
    };
    return Promise.all(deletions);
}

module.exports = {
    createTables: createTables,
    deleteTables: deleteTables
    // cleanTables: cleanTables
}