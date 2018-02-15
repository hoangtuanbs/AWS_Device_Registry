'use strict'
// Static variables
const uuid = require('uuid')
const Config = require('./Config.js')

const docClient = Config.AWS.DocumentClient
const ControllerTable = Config.Tables.ControllerTable

var Controller = function (data, fresh) {
  var pub = {}

  if (fresh) {
    pub.Id = uuid.v4()
  } else {
    pub.Id = data.id
  }

  pub.Ipv4 = data.ipv4
  pub.DomainName = data.domain_name

  pub.ToDataItem = function () {
    return {
      id: pub.Id,
      ipv4: pub.Ipv4,
      domain_name: pub.DomainName
    }
  }

  pub.ToTransferJSON = function () {
    return JSON.stringify({
      id: pub.Id,
      ipv4: pub.Ipv4,
      domain_name: pub.DomainName
    })
  }

  pub.Persist = function () {
    if (!fresh) {
      throw new Error('Cannot persist already exists item');
    }

    const item = pub.ToDataItem()

    const putParam = {
      TableName: ControllerTable.name,
      Item: item,
      ReturnValues: 'NONE',
      ConditionExpression: 'attribute_not_exists(id)'
    };

    return docClient.put(putParam).promise();
  };

  return pub
};

Controller.GetControllerById = function (controller_id) {
  var params = {
    TableName: ControllerTable.name,
    Key: {
      'id': controller_id
    }
  };

  return docClient.get(params)
    .promise()
    .then(data =>
      !data.Item ? null : new Controller(data.Item, false)
    );
};

Controller.UpdateControllerById = function (controller_id, updater) {

  var updateParam = {
    TableName: ControllerTable.name,
    Key: {
      'id': controller_id
    },
    UpdateExpression: 'set ipv4 = :ipv4',
    ExpressionAttributeValues: {
      ':ipv4': updater.ipv4
    },
    ReturnValues: 'ALL_NEW'
  };

  return docClient.update(updateParam)
    .promise()
    .then(data => new Controller(data.Attributes, false))
};

Controller.GetAllControllers = function (callback) {
  var params = {
    TableName: ControllerTable.name,
    ProjectionExpression: 'id, ipv4',
  };

  docClient.scan(params, onScan)

  function onScan(err, data) {
    if (err) {
      callback(err)
    } else {
      // print all the movies
      callback(null, data.Items)

      // continue scanning if we have more movies, because
      // scan can retrieve a maximum of 1MB of data
      if (typeof data.LastEvaluatedKey != 'undefined') {
        params.ExclusiveStartKey = data.LastEvaluatedKey
        docClient.scan(params, onScan)
      }
    }
  }
};

module.exports = Controller;
