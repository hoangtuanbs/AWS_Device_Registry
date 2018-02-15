'use strict'
// Static variables
const bcrypt = require('bcryptjs')
const Config = require('./Config.js')

const UserTable = Config.Tables.UserTable
const docClient = Config.AWS.DocumentClient

var User = function (data, fresh) {
  var pub = {}
  pub.Id = data.id || data.user_id
  pub.FirstName = data.first_name
  pub.LastName = data.last_name
  pub.PhoneNumber = data.phone_number
  pub.Email = data.email

  if (fresh) {
    pub.Salt = bcrypt.genSaltSync(10)
    pub.Password = bcrypt.hashSync(data.password, pub.Salt)
  } else {
    pub.Salt = data.salt
    pub.Password = data.password
  }

  pub.ToDataItem = function () {
    return {
      id: pub.Id,
      password: pub.Password,
      salt: pub.Salt,
      first_name: pub.FirstName,
      last_name: pub.LastName,
      email: pub.Email,
      phone_number: pub.PhoneNumber,
    }
  }

  pub.ToTransferJSON = function () {
    return JSON.stringify({
      id: pub.Id,
      first_name: pub.FirstName,
      last_name: pub.LastName,
      email: pub.Email,
      phone_number: pub.PhoneNumber,
    })
  }

  /** Save a fresh object for the first time*/
  pub.Persist = function () {
    const item = pub.ToDataItem()
    const saveParam = {
      TableName: UserTable.name,
      Item: item,
      ConditionExpression: 'attribute_not_exists(id)'
    }

    return docClient.put(saveParam)
      .promise()
  };

  pub.IsValidPassword = function (password) {
    return pub.Password === bcrypt.hashSync(password, pub.Salt)
  }

  pub.Update = function (userUpdater) {

    const first_name = userUpdater.first_name || pub.FirstName
    const last_name = userUpdater.last_name || pub.LastName
    const email = userUpdater.email || pub.Email
    const phone_number = userUpdater.phone_number || pub.PhoneNumber
    const password = userUpdater.password ?
      bcrypt.hashSync(userUpdater.password, pub.Salt) :
      pub.Password

    var updateParam = {
      TableName: UserTable.name,
      Key: {
        'id': pub.Id
      },
      UpdateExpression: 'set first_name = :fn, last_name = :ln, email = :e, phone_number = :pn, password = :pw',
      ExpressionAttributeValues: {
        ':fn': first_name,
        ':ln': last_name,
        ':e': email,
        ':pn': phone_number,
        ':pw': password
      },
      ReturnValues: 'NONE'
    };

    return docClient.update(updateParam)
      .promise()
      .then(() => {
        // successful
        pub.FirstName = first_name
        pub.LastName = last_name
        pub.Email = email
        pub.PhoneNumber = phone_number
        pub.Password = password
        return null;
      })
  };

  return pub
}

User.GetUserById = function (user_id) {
  var getParams = {
    TableName: UserTable.name,
    Key: {
      'id': user_id
    }
  };

  return docClient.get(getParams)
    .promise()
    .then(data => !data.Item ? null : new User(data.Item, false))
};

User.Validate = function (user_id, password, callback) {
  User.GetUserById(user_id, (err, user) => {
    if (err) {
      callback(err)
    } else if (!user) {
      callback(null, false)
    } else {
      callback(null, user.IsValidPassword(password))
    }
  })
}

User.GetUsersByEmail = function (email) {
  const params = {
    TableName: UserTable.name,
    KeyConditionExpression: 'email = :email',
    IndexName: 'email-index',
    ExpressionAttributeValues: {
      ':email': email
    },
    ProjectionExpression: 'id, first_name, last_name, email, phone_number'
  };

  return docClient.query(params)
    .promise()
    .then(data => data.Items)
};

User.GetUsersByPhoneNumber = function (phone_number) {
  const params = {
    TableName: UserTable.name,
    KeyConditionExpression: 'phone_number = :phone',
    IndexName: 'phone-number-index',
    ExpressionAttributeValues: {
      ':phone': phone_number
    },
    ProjectionExpression: 'id, first_name, last_name, email, phone_number'
  };

  return docClient.query(params)
    .promise()
    .then(data => data.Items)
}

module.exports = User;
