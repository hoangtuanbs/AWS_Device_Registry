const request = require('request')
const ControllerEndpoint = require('./Endpoint').controllers
const should = require('should')

const iptoken = () => {
  return Math.floor((Math.random() * 256))
}

const registerController = function registerController(callback) {
  const controller = {
    ipv4: `${iptoken()}.${iptoken()}.${iptoken()}.${iptoken()}`
  }
  const options = {
    method: 'post',
    body: controller,
    json: true,
    url: ControllerEndpoint.registerController
  }
  request.post(options)
    .on('response', function (response) {
      response.statusCode.should.equal(200)
    })
    .on('data', function (data) {
      // decompressed data as it is received
      const body = JSON.parse(data)
      const retrievedcontroller = JSON.parse(body.controller)
      callback(retrievedcontroller)
    })
  return controller
}

describe('/devices', function () {
  this.timeout(10000)

  ///////////////////////
  // START TEST
  ///////////////////////

  let controller = undefined

  describe('/ POST: create new controller', function () {
    it('should work', function (done) {
      controller = registerController((received) => {
        received.ipv4.should.equal(controller.ipv4)
        should.exist(received.id)
        controller.id = received.id
        done()
      })
    })
  })

  describe('/ {controller_id}} GET', function () {
    it('should work', function (done) {
      request.get(ControllerEndpoint.getControllerById.replace('{controller_id}', controller.id))
        .on('response', function (response) {
          response.statusCode.should.equal(200)
        })
        .on('data', function (data) {
          const retrievedcontroller = JSON.parse(data)
          retrievedcontroller.ipv4.should.equal(controller.ipv4)
          retrievedcontroller.id.should.equal(controller.id)
          done()
        })
    })
  })

  describe('/ {controller_id}} PUT', function () {
    it('should work', function (done) {

      const updater = {
        ipv4: `${iptoken()}.${iptoken()}.${iptoken()}.${iptoken()}`
      }

      const options = {
        body: updater,
        json: true,
        url: ControllerEndpoint.updateController.replace('{controller_id}', controller.id)
      }
      request.put(options)
        .on('response', function (response) {
          response.statusCode.should.equal(200)
        })
        .on('data', function (data) {
          const retrievedcontroller = JSON.parse(data)
          controller.ipv4 = updater.ipv4
          retrievedcontroller.ipv4.should.equal(controller.ipv4)
          retrievedcontroller.id.should.equal(controller.id)
          done()
        })
    })
  })

  describe('/ GET list of controller', function () {
    it('should contained added controllers', function (done) {
      request.get(ControllerEndpoint.listControllers)
        .on('response', function (response) {
          response.statusCode.should.equal(200)
        })
        .on('data', function (data) {
          const retrievedcontrollers = JSON.parse(data)
          const retrievedcontroller = retrievedcontrollers.filter(c => c.id === controller.id)
          retrievedcontroller.length.should.equal(1)
          retrievedcontroller[0].ipv4.should.equal(controller.ipv4)
          done()
        })
    })
  })
})


module.exports = {
  RegisterController: registerController
}
