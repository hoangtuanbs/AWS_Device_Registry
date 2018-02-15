'use strict'

const Controller = require('./service/Controller')
const constraint = require('./service/Config').Tables.ControllerTable.constraint
const Config = require('./service/Config')
const handleBadRequest = Config.Handler.BadRequest

module.exports.register = (event, context, callback) => {
  var request
  try {
    request = JSON.parse(event.body)
  } catch (err) {
    return handleBadRequest(callback, 'Dump JSON')
  }

  // validate
  const ipv4 = request.ipv4
  const valid_req = ipv4 && constraint.ipv4.test(ipv4)
  if (!valid_req) return handleBadRequest(callback, 'Invalid ipv4')

  // make request
  const controller = new Controller(request, true);
  controller.Persist()
    .then(() =>
      callback(null, {
        statusCode: 200,
        body: JSON.stringify({
          message: 'Successfully registered device',
          controller: controller.ToTransferJSON()
        })
      }))
    .catch((error) =>
      callback(null, {
        statusCode: 500,
        body: JSON.stringify(error)
      }));
};

module.exports.getControllerById = (event, context, callback) => {
  if (!event.pathParameters) return handleBadRequest(callback, 'Invalid path')
  var controller_id = event.pathParameters.controller_id

  // validate
  const valid_req = controller_id
  if (!valid_req) return handleBadRequest(callback, 'Controller id must be present')

  // make request
  Controller.GetControllerById(controller_id)
    .then(controller => {
      if (!controller) {
        callback(null, {
          statusCode: 404,
          body: JSON.stringify({
            message: 'Resource not found'
          })
        })
      } else {
        callback(null, {
          statusCode: 200,
          body: controller.ToTransferJSON()
        })
      }
    })
    .catch((error) =>
      callback(null, {
        statusCode: 500,
        body: JSON.stringify(error)
      }));
};

module.exports.updateController = (event, context, callback) => {
  if (!event.pathParameters) return handleBadRequest(callback, 'Invalid path')
  const controller_id = event.pathParameters.controller_id
  var updater
  try {
    updater = JSON.parse(event.body)
  } catch (err) {
    return handleBadRequest(callback, 'Dump JSON')
  }
  // validate
  const ipv4 = updater.ipv4
  const valid_req = controller_id && ipv4 && constraint.ipv4.test(ipv4)
  if (!valid_req) return handleBadRequest(callback, 'Controller id must be present. Ipv4 must be valid')

  // make request
  Controller.UpdateControllerById(controller_id, updater)
    .catch(error =>
      callback(null, {
        statusCode: 500,
        body: JSON.stringify(error)
      }))
    .then(controller => {
      callback(null, {
        statusCode: 200,
        body: controller.ToTransferJSON()
      })
    })
};

module.exports.listControllers = (event, context, callback) => {
  Controller.GetAllControllers((err, controllers) => {
    if (err) {
      callback(null, {
        statusCode: 500,
        body: JSON.stringify(err)
      })
    } else {
      callback(null, {
        statusCode: 200,
        body: JSON.stringify(controllers)
      })
    }
  })
}
