'use strict'
// Static variables
var Config = require('./Config.js')

const docClient = Config.AWS.DocumentClient
const DeviceTable = Config.Tables.DeviceTable

var Device = function (data, fresh) {
  var pub = {};

  pub.Id = data.id ? data.id : data.device_id

  if (!fresh) {
    pub.ControllerId = data.controller_id
    pub.OwnerId = data.owner_id
  }

  pub.ToDataItem = function () {
    return {
      id: pub.Id,
      controller_id: pub.ControllerId,
      owner_id: pub.OwnerId
    }
  }

  pub.ToTransferJSON = function () {
    return JSON.stringify({
      id: pub.Id,
      controller_id: pub.ControllerId,
      owner_id: pub.OwnerId
    })
  }

  pub.Persist = function () {
    if (!fresh) {
      throw new Error('Cannot persist already exists item')
    }

    const item = pub.ToDataItem()

    const putParams = {
      TableName: DeviceTable.name,
      Item: item,
      ReturnValues: 'NONE',
      ConditionExpression: 'attribute_not_exists(id)'
    };

    return docClient.put(putParams).promise();
  };

  return pub
};

Device.GetDeviceById = function (device_id) {
  var params = {
    TableName: DeviceTable.name,
    Key: {
      'id': device_id
    }
  };

  return docClient.get(params)
    .promise()
    .then((data) => !data.Item ? null : new Device(data.Item, false))
};

/** Update device with given id, returning updated device */
Device.AssignDeviceToController = function (device_id, controller_id) {
  var updateParam = {
    TableName: DeviceTable.name,
    Key: {
      'id': device_id
    },
    UpdateExpression: 'set controller_id = :cid',
    ExpressionAttributeValues: {
      ':cid': controller_id
    },
    ReturnValues: 'ALL_NEW',
    ConditionExpression: 'attribute_exists(id)'
  };

  return docClient.update(updateParam)
    .promise()
    .then(data => new Device(data.Attributes, false))
}

/** Update device with given id, returning updated device */
Device.AssignDeviceToUser = function (device_id, owner_id) {
  var updateParam = {
    TableName: DeviceTable.name,
    Key: {
      'id': device_id
    },
    UpdateExpression: 'set owner_id = :oid',
    ExpressionAttributeValues: {
      ':oid': owner_id
    },
    ReturnValues: 'ALL_NEW',
    ConditionExpression: 'attribute_exists(id)'
  }

  return docClient.update(updateParam)
    .promise()
    .then(data => new Device(data.Attributes, false))
};

Device.GetDevicesForController = function (controller_id) {

  const params = {
    TableName: DeviceTable.name,
    KeyConditionExpression: 'controller_id = :cid',
    IndexName: 'controller-id-index',
    ExpressionAttributeValues: {
      ':cid': controller_id
    }
  };

  return docClient.query(params)
    .promise()
    .then(data => data.Items)
};

Device.GetDevicesForUser = function (owner_id) {

  const params = {
    TableName: DeviceTable.name,
    KeyConditionExpression: 'owner_id = :uid',
    IndexName: 'user-id-index',
    ExpressionAttributeValues: {
      ':uid': owner_id
    }
  };

  return docClient.query(params)
    .promise()
    .then((data) => data.Items)
};

module.exports = Device
