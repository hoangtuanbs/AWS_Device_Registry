'use strict'

const Device = require('./service/Device')
const User = require('./service/User')
const Controller = require('./service/Controller')
const Config = require('./service/Config')

const handleBadRequest = Config.Handler.BadRequest

const constraint = Config.Tables.DeviceTable.constraint
const user_constraint = Config.Tables.UserTable.constraint
const controller_constraint = Config.Tables.ControllerTable.constraint

module.exports.registerDevice = (event, context, callback) => {
  const request = JSON.parse(event.body)

  // validate
  const device_id = request.device_id
  if (!(device_id && constraint.device_id.test(device_id))) {
    return handleBadRequest(callback, 'Invalid device_id')
  }

  // make request
  const device = new Device(request, true)
  device.Persist()
    .then(() =>
      callback(null, {
        statusCode: 200,
        body: JSON.stringify({
          message: 'Successfully registered device',
          device: device.ToTransferJSON()
        })
      }))
    .catch(error =>
      callback(null, {
        statusCode: error.statusCode == 400 ? 409 : 500,
        body: JSON.stringify(error)
      }));
};

module.exports.getDevicesForController = (event, context, callback) => {
  if (!event.pathParameters) return handleBadRequest(callback, 'Invalid path')
  var controller_id = event.pathParameters.controller_id;

  // validate
  var valid_req = controller_id && controller_constraint.controller_id.test(controller_id)
  if (!valid_req) return handleBadRequest(callback, 'Invalid controller_id')

  // make request
  Device.GetDevicesForController(controller_id)
    .then(devices =>
      callback(null, {
        statusCode: 200,
        body: JSON.stringify(devices)
      }))
    .catch(error =>
      callback(null, {
        statusCode: 500,
        body: JSON.stringify(error)
      }));
};

module.exports.getDevicesForUser = (event, context, callback) => {
  if (!event.pathParameters) return handleBadRequest(callback, 'Invalid path')
  const owner_id = event.pathParameters.owner_id

  // validate
  const valid_req = owner_id && user_constraint.user_id.test(owner_id)
  if (!valid_req) {
    return callback(null, {
      statusCode: 400,
      body: JSON.stringify({
        error: 'Bad request',
        message: 'Invalid owner_id'
      })
    })
  }

  // made request
  Device.GetDevicesForUser(owner_id)
    .catch(error =>
      callback(null, {
        statusCode: 500,
        body: JSON.stringify(error)
      }))
    .then(devices =>
      callback(null, {
        statusCode: 200,
        body: JSON.stringify(devices)
      }));
};

module.exports.getDeviceById = (event, context, callback) => {
  if (!event.pathParameters) return handleBadRequest(callback, 'Invalid path')
  var device_id = event.pathParameters.device_id

  // validate
  const valid_req = device_id && constraint.device_id.test(device_id)
  if (!valid_req) return handleBadRequest(callback, 'Invalid device_id')

  Device.GetDeviceById(device_id)
    .catch(error =>
      callback(null, {
        statusCode: 500,
        body: JSON.stringify(error)
      }))
    .then(device => {
      if (!device) {
        callback(null, {
          statusCode: 404,
          body: JSON.stringify({
            message: `Device with id ${device_id} not found`
          })
        })
      } else {
        callback(null, {
          statusCode: 200,
          body: device.ToTransferJSON()
        })
      }
    });
};

module.exports.assignDeviceToController = (event, context, callback) => {
  if (!event.pathParameters) return handleBadRequest(callback, 'Invalid path')

  var device_id = event.pathParameters.device_id
  var controller_id = event.pathParameters.controller_id

  // validate input
  const valid_req = device_id && constraint.device_id.test(device_id)
    && controller_id && controller_constraint.controller_id.test(controller_id)
  if (!valid_req) return handleBadRequest(callback, 'Invalid device_id or controller_id')

  // make the request
  Controller.GetControllerById(controller_id)
    .then(controller => {
      if (!controller) {
        callback(null, {
          statusCode: 400,
          body: JSON.stringify({
            error: 'Bad request',
            message: `Invalid controller id: ${controller_id}`
          })
        })
      } else {
        // valid controller id
        // make the update
        Device.AssignDeviceToController(device_id, controller_id)
          .then((device) =>
            callback(null, {
              statusCode: 200,
              body: device.ToTransferJSON()
            }))
          .catch(error =>
            callback(null, {
              statusCode: 500,
              body: JSON.stringify(error)
            }));
      }
    })
    .catch(error =>
      callback(null, {
        statusCode: 500,
        body: JSON.stringify(error)
      }));
};

module.exports.assignDeviceToUser = (event, context, callback) => {
  if (!event.pathParameters) return handleBadRequest(callback, 'Invalid path')

  var device_id = event.pathParameters.device_id
  var owner_id = event.pathParameters.owner_id

  // validate input
  const valid_req = device_id && constraint.device_id.test(device_id)
    && owner_id && user_constraint.user_id.test(owner_id)
  if (!valid_req) return handleBadRequest(callback, 'Invalid device_id or owner_id')

  // make the request
  User.GetUserById(owner_id)
    .then(user => {
      if (!user) {
        return handleBadRequest(callback, `Invalid owner_id: ${owner_id}`)
      } else {
        // valid owner id
        // make the update
        Device.AssignDeviceToUser(device_id, owner_id)
          .then((device) =>
            callback(null, {
              statusCode: 200,
              body: device.ToTransferJSON()
            }))
          .catch(error =>
            callback(null, {
              statusCode: 500,
              body: JSON.stringify(error)
            }));
      }
    })
    .catch(error =>
      callback(null, {
        statusCode: 500,
        body: JSON.stringify(error)
      }));
};
