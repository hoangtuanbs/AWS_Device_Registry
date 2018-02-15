'use strict'

const User = require('./service/User')
const Config = require('./service/Config')
const UserConstraint = Config.Tables.UserTable.constraint

const handleBadRequest = Config.Handler.BadRequest

module.exports.registerUser = (event, context, callback) => {
  var request
  try {
    request = JSON.parse(event.body)
  } catch (err) {
    return handleBadRequest(callback, 'Stupid json')
  }

  // validation
  const id = request.id || request.user_id
  const first_name = request.first_name
  const last_name = request.last_name
  const phone_number = request.phone_number
  const email = request.email
  const password = request.password

  const valid = id && UserConstraint.user_id.test(id)
    && first_name && UserConstraint.first_name.test(first_name)
    && last_name && UserConstraint.last_name.test(last_name)
    && password && UserConstraint.password.test(password)
    && (!phone_number || UserConstraint.phone_number.test(phone_number))
    && (!email || UserConstraint.email.test(email))

  if (!valid) {
    return handleBadRequest(callback, 'Required: id, first_name, last_name, password. Not required: phone_number, email')
  }

  // make request
  const user = new User(request, true)
  user.Persist()
    .then(() =>
      callback(null, {
        statusCode: 200,
        body: JSON.stringify({
          message: 'Successfully registered user',
          user: user.ToTransferJSON()
        })
      }))
    .catch(error =>
      callback(null, {
        statusCode: 409,  // Should be a conflict
        body: JSON.stringify(error)
      }));
};

const handle401 = function (callback, message) {
  callback(null, {
    statusCode: 401,
    body: JSON.stringify({
      valid: false,
      message
    })
  })
}

/**
 * Do basic authentication for given event.
 * If event is authorized, callback will be called with a valid user principal.
 * @param event having basic authentication about user principal
 * @param callback function used to response to invalid user principal
 * @param handleValidUser a function called on valid user principal
 */
function dobasicAuth(event, callback, handleValidUser) {
  // Validation
  if (!event.headers || !event.headers.Authorization)
    return handle401(callback, 'Authorization token needed')


  const basicAuth = Config.Utils.BasicAuth.parse(event.headers.Authorization)

  if (!basicAuth.valid)
    return handle401(callback, 'Authorization token is malformed')

  const user_id = basicAuth.username
  const password = basicAuth.password

  const valid_req = user_id && UserConstraint.user_id.test(user_id)
    && password && UserConstraint.password.test(password)

  const forbiddenMessage = {
    statusCode: 403,
    body: JSON.stringify({
      valid: false,
    })
  }

  if (!valid_req) return callback(null, forbiddenMessage)

  // make request
  User.GetUserById(user_id)
    .then(user => {
      if (!user || !user.IsValidPassword(password)) {
        callback(null, forbiddenMessage)
      } else {
        handleValidUser(user)
      }
    })
    .catch(error =>
      callback(null, {
        statusCode: 500,
        body: JSON.stringify(error)
      }));
}

module.exports.authenticate = (event, context, callback) => {
  dobasicAuth(event, callback, (user) => {
    callback(null, {
      statusCode: 200,
      body: JSON.stringify({
        valid: true,
        user: user.ToTransferJSON()
      })
    })
  })
}

module.exports.getUsersByEmail = (event, context, callback) => {
  if (!event.pathParameters) return handleBadRequest(callback, 'Invalid path')
  const email = event.pathParameters.email
  // validation
  const valid_req = email && UserConstraint.email.test(email)
  if (!valid_req) return handleBadRequest(callback, 'Email must be present and valid')


  // make request
  User.GetUsersByEmail(email)
    .then(users =>
      callback(null, {
        statusCode: 200,
        body: JSON.stringify(users)
      }))
    .catch(error =>
      callback(null, {
        statusCode: 500,
        body: JSON.stringify(error)
      })
    );
};

module.exports.getUsersByPhoneNumber = (event, context, callback) => {
  if (!event.pathParameters) return handleBadRequest(callback, 'Invalid path')
  var phone_number = event.pathParameters.phone_number

  // validation
  const valid_req = phone_number && UserConstraint.phone_number.test(phone_number)
  if (!valid_req) {
    return handleBadRequest(callback, 'Phone number must be present and valid: digit string of length 10-11 ')
  }

  User.GetUsersByPhoneNumber(phone_number)
    .then(users => callback(null, {
      statusCode: 200,
      body: JSON.stringify(users)
    }))
    .catch(error =>
      callback(null, {
        statusCode: 500,
        body: JSON.stringify(error)
      })
    );
};

module.exports.updateUser = (event, context, callback) => {
  dobasicAuth(event, callback, (user) => {
    var updater
    try {
      updater = JSON.parse(event.body)
    } catch (jsonParseError) {
      return handleBadRequest(callback, 'Invalid JSON')
    }
    // validate
    const first_name = updater.first_name
    const last_name = updater.last_name
    const phone_number = updater.phone_number
    const email = updater.email
    const newPassword = updater.password

    const valid_req = (!first_name || UserConstraint.first_name.test(first_name))
      && (!last_name || UserConstraint.last_name.test(last_name))
      && (!phone_number || UserConstraint.phone_number.test(phone_number))
      && (!email || UserConstraint.email.test(email))
      && (!newPassword || UserConstraint.password.test(newPassword))

    if (!valid_req)
      return handleBadRequest(callback, 'Some field contain invalid datas, Or invalid Authorization')

    user.Update(updater)
      .then(() =>
        callback(null, {
          statusCode: 200,
          body: user.ToTransferJSON()
        }))
      .catch(error =>
        callback(null, {
          statusCode: 500,
          body: JSON.stringify(error)
        }));
  });
};
