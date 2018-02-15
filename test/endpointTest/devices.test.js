const request = require('request')
const UserEndpoint = require('./Endpoint').users
const DeviceEndpoint = require('./Endpoint').devices
const ControllerTest = require('./controllers.test')
const should = require('should')
const uuid = require('uuid')

describe('/devices', function () {
  this.timeout(10000)

  const user = {
    id: uuid.v4(),
    first_name: 'dang',
    last_name: 'nuygne',
    password: 'asdjaskhqwe',
    email: '129379fkjjh@gmail.com',
    phone_number: '0465672648'
  }

  const checkUser = function (retrievedUser) {
    retrievedUser.id.should.equal(user.id)
    retrievedUser.first_name.should.equal(user.first_name)
    retrievedUser.last_name.should.equal(user.last_name)
    retrievedUser.email.should.equal(user.email)
    retrievedUser.phone_number.should.equal(user.phone_number)
    should.not.exist(retrievedUser.password)
  }

  describe('Presiquisite: user must be created', function () {
    it('Should be created', function (done) {
      const options = {
        body: user,
        json: true,
        url: UserEndpoint.registerUser
      }
      request.post(options)
        .on('response', function (response) {
          response.statusCode.should.equal(200)
        })
        .on('data', function (data) {
          // decompressed data as it is received
          const body = JSON.parse(data)
          checkUser(JSON.parse(body.user))
          done()
        })
    })
  })

  ///////////////////////
  // START TEST
  ///////////////////////
  const device = {
    device_id: uuid.v4()
  }

  describe('/ POST: create new device', function () {
    it('should work', function (done) {
      const options = {
        body: device,
        json: true,
        url: DeviceEndpoint.registerDevice
      }
      request.post(options)
        .on('response', function (response) {
          response.statusCode.should.equal(200)
        })
        .on('data', function (data) {
          // decompressed data as it is received
          const body = JSON.parse(data)
          const receivedDevice = JSON.parse(body.device)
          receivedDevice.id.should.equal(device.device_id)
          done()
        })
    })
  })

  describe('/{device_id}} GET', function () {
    it('should work', function (done) {
      request.get(DeviceEndpoint.getDeviceById.replace('{device_id}', device.device_id))
        .on('response', function (response) {
          response.statusCode.should.equal(200)
        })
        .on('data', function (data) {
          const retrievedDevice = JSON.parse(data)
          // console.log(JSON.stringify(retrievedDevice, null, 2));
          retrievedDevice.id.should.equal(device.device_id)
          done()
        })
    })
  })

  let myController

  describe('/{device_id}/controller/{controller_id} PUT', function () {
    it('should work', function (done) {
      ControllerTest.RegisterController((controller) => {
        myController = controller
        const options = {
          url: DeviceEndpoint.assignDeviceToController
            .replace('{device_id}', device.device_id)
            .replace('{controller_id}', controller.id)
        }
        request.put(options)
          .on('response', function (response) {
            response.statusCode.should.equal(200)
          })
          .on('data', function (data) {
            const retrievedDevice = JSON.parse(data)
            retrievedDevice.id.should.equal(device.device_id)
            retrievedDevice.controller_id.should.equal(controller.id)
            done()
          })
      })
    })
  })

  describe('/{device_id}/user/{owner_id} PUT', function () {
    it('should work', function (done) {

      const owner_id = user.id

      const options = {
        url: DeviceEndpoint.assignDeviceToUser
          .replace('{device_id}', device.device_id)
          .replace('{owner_id}', owner_id)
      }
      request.put(options)
        .on('response', function (response) {
          response.statusCode.should.equal(200)
        })
        .on('data', function (data) {
          const retrievedDevice = JSON.parse(data)
          retrievedDevice.id.should.equal(device.device_id)
          retrievedDevice.controller_id.should.equal(myController.id)
          retrievedDevice.owner_id.should.equal(owner_id)
          done()
        })
    })
  })

  describe('/controller/{controller_id} GET', function () {
    it('should work', function (done) {
      request.get(DeviceEndpoint.getDevicesForController.replace('{controller_id}', myController.id))
        .on('response', function (response) {
          response.statusCode.should.equal(200)
        })
        .on('data', function (data) {
          const retrievedDevices = JSON.parse(data)
          // console.log(JSON.stringify(retrievedDevices, null, 2));
          const filteredDevices = retrievedDevices.filter(d => d.id === device.device_id)
          filteredDevices.length.should.equal(1)
          const foundDevice = filteredDevices[0]
          // foundDevice.owner_id.should.equal(user.id)
          foundDevice.id.should.equal(device.device_id)
          foundDevice.controller_id.should.equal(myController.id)
          done();
        })
    })
  });

  describe('/user/{owner_id} GET', function () {
    it('should work', function (done) {
      request.get(DeviceEndpoint.getDevicesForUser.replace('{owner_id}', user.id))
        .on('response', function (response) {
          response.statusCode.should.equal(200)
        })
        .on('data', function (data) {
          const retrievedDevices = JSON.parse(data)
          // console.log(JSON.stringify(retrievedDevice, null, 2));
          const filteredDevices = retrievedDevices.filter(d => d.id === device.device_id)
          filteredDevices.length.should.equal(1)
          const foundDevice = filteredDevices[0]
          foundDevice.owner_id.should.equal(user.id)
          foundDevice.id.should.equal(device.device_id)
          foundDevice.controller_id.should.equal(myController.id)
          done()
        })
    })
  })

})
