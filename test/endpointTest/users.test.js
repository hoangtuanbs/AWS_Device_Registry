const request = require('request')
const UserEndpoint = require('./Endpoint').users
const should = require('should')
const uuid = require('uuid')

describe('/users', function () {
  this.timeout(10000)
  const user = {
    'id': uuid.v4(),
    'first_name': 'dang',
    'last_name': 'nuygne',
    'password': '123456',
    'email': '129379fkjjh@gmail.com',
    'phone_number': '0465672648'
  }

  const checkUser = function (retrievedUser) {
    retrievedUser.id.should.equal(user.id)
    retrievedUser.first_name.should.equal(user.first_name)
    retrievedUser.last_name.should.equal(user.last_name)
    retrievedUser.email.should.equal(user.email)
    retrievedUser.phone_number.should.equal(user.phone_number)
    should.not.exist(retrievedUser.password)
  }

  describe('/ POST: create new user', function () {
    it('should work', function (done) {
      const options = {
        method: 'post',
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

  const getAuthenticateOptionSimple = (authorizationToken) => {
    return {
      method: 'get',
      headers: {
        Authorization: authorizationToken
      },
      url: UserEndpoint.authenticate
    }
  }

  const getAuthenticateOption = (userName, password) => {
    return getAuthenticateOptionSimple('Basic ' + new Buffer(`${userName}:${password}`, 'utf8').toString('base64'))
  }

  describe('/authenticate POST', function () {


    it('should return 401 for request without authentication token', function (done) {
      request.get(UserEndpoint.authenticate)
        .on('response', function (response) {
          response.statusCode.should.equal(401)
        })
        .on('data', function (data) {
          const result = JSON.parse(data)
          result.valid.should.equal(false)
          done()
        })
    })

    it('should return 401 for malformed authentication token: BASIC superman', function (done) {
      request(getAuthenticateOptionSimple('BASIC superman'))
        .on('response', function (response) {
          response.statusCode.should.equal(401)
        })
        .on('data', function (data) {
          const result = JSON.parse(data)
          result.valid.should.equal(false)
          done()
        })
    })

    it('should return 401 for malformed authentication token: asdjaslkdjlasd', function (done) {
      request(getAuthenticateOptionSimple('asdjaslkdjlasd'))
        .on('response', function (response) {
          response.statusCode.should.equal(401)
        })
        .on('data', function (data) {
          const result = JSON.parse(data)
          result.valid.should.equal(false)
          done()
        })
    })

    it('should return 401 for malformed authentication token: without semicolon', function (done) {
      request(getAuthenticateOptionSimple('Basic ' + new Buffer('withoutsemicolon', 'utf8').toString('base64')))
        .on('response', function (response) {
          response.statusCode.should.equal(401)
        })
        .on('data', function (data) {
          const result = JSON.parse(data)
          result.valid.should.equal(false)
          done()
        })
    })

    it('should return 401 for malformed authentication token: without space', function (done) {
      request(getAuthenticateOptionSimple('Basic' + new Buffer('dump:request', 'utf8').toString('base64')))
        .on('response', function (response) {
          response.statusCode.should.equal(401)
        })
        .on('data', function (data) {
          const result = JSON.parse(data)
          result.valid.should.equal(false)
          done()
        })
    })

    it('should return 200 for valid user', function (done) {
      request(getAuthenticateOption(user.id, user.password))
        .on('response', function (response) {
          response.statusCode.should.equal(200)
        })
        .on('data', function (data) {
          const result = JSON.parse(data)
          result.valid.should.equal(true)
          checkUser(JSON.parse(result.user))
          done()
        })
    })

    it('should return 403 for invalid credential', function (done) {
      request(getAuthenticateOption(uuid.v4(), user.password))
        .on('response', function (response) {
          response.statusCode.should.equal(403)
        })
        .on('data', function (data) {
          const result = JSON.parse(data)
          result.valid.should.equal(false)
          done()
        })
    })

    it('should return 403 for invalid credential', function (done) {
      request(getAuthenticateOption('s', 'x'))
        .on('response', function (response) {
          response.statusCode.should.equal(403)
        })
        .on('data', function (data) {
          const result = JSON.parse(data)
          result.valid.should.equal(false)
          done()
        })
    })

    it('should return 403 for invalid credential', function (done) {
      request(getAuthenticateOption(user.id, `${user.password}sad`))
        .on('response', function (response) {
          response.statusCode.should.equal(403)
        })
        .on('data', function (data) {
          const result = JSON.parse(data)
          result.valid.should.equal(false)
          done()
        })
    })

  })

  describe('/email/{user_id} GET: get user by email', function () {
    it('should works', function (done) {
      request.get(UserEndpoint.getUsersByEmail.replace('{email}', user.email))
        .on('response', function (response) {
          response.statusCode.should.equal(200)
        })
        .on('data', function (data) {
          // decompressed data as it is received
          const users = JSON.parse(data)
          const filtered = users.filter(u => u.id === user.id)
          filtered.length.should.equal(1)
          const retrievedUser = filtered[0]
          checkUser(retrievedUser)
          done()
        })
    })
  })

  describe('/phoneNumber/{phone_number} GET: get user by phone num', function () {
    it('should works', function (done) {
      request.get(UserEndpoint.getUsersByPhoneNumber.replace('{phone_number}', user.phone_number))
        .on('response', function (response) {
          response.statusCode.should.equal(200)
        })
        .on('data', function (data) {
          // decompressed data as it is received
          const users = JSON.parse(data)
          const filtered = users.filter(u => u.id === user.id)
          filtered.length.should.equal(1)
          const retrievedUser = filtered[0]
          checkUser(retrievedUser)
          done()
        })
    })
  })

  describe('/ PUT: update user', function () {

    const createUpdateRequestObject = function (updater) {
      return {
        body: updater,
        headers: {
          Authorization: 'Basic ' + new Buffer(`${user.id}:${user.password}`, 'utf8').toString('base64')
        },
        json: true,
        url: UserEndpoint.updateUser
      }
    };

    it('should works for last_name and first_name', function (done) {
      const updater = {
        last_name: 'VO',
        first_name: 'DUY NGOC'
      }
      request.put(createUpdateRequestObject(updater))
        .on('response', function (response) {
          response.statusCode.should.equal(200)
        })
        .on('data', function (data) {
          // decompressed data as it is received
          const res = JSON.parse(data)
          user.first_name = updater.first_name
          user.last_name = updater.last_name
          checkUser(res)
          done()
        })
    })

    it('should works for email', function (done) {
      const updater = {
        email: 'duyngocvo@gmail.com'
      }
      request.put(createUpdateRequestObject(updater))
        .on('response', function (response) {
          response.statusCode.should.equal(200)
        })
        .on('data', function (data) {
          // decompressed data as it is received
          const res = JSON.parse(data)
          user.email = updater.email
          checkUser(res)
          done()
        })
    })

    it('should works for phone_number', function (done) {
      const updater = {
        phone_number: '1234567890'
      }
      request.put(createUpdateRequestObject(updater))
        .on('response', function (response) {
          response.statusCode.should.equal(200)
        })
        .on('data', function (data) {
          // decompressed data as it is received
          const res = JSON.parse(data)
          user.phone_number = updater.phone_number
          checkUser(res)
          done()
        })
    })

    it('should works for password', function (done) {
      const updater = {
        password: 'newpassword'
      }
      request.put(createUpdateRequestObject(updater))
        .on('response', function (response) {
          response.statusCode.should.equal(200)
        })
        .on('data', function (data) {

          user.password = updater.password

          const res = JSON.parse(data)
          checkUser(res)
          request(getAuthenticateOption(user.id, updater.password))
            .on('response', function (response) {
              response.statusCode.should.equal(200)
            })
            .on('data', function (data) {
              const result = JSON.parse(data)
              result.valid.should.equal(true)
              checkUser(JSON.parse(result.user))
              done()
            })
        })
    })

    it('should works for combination', function (done) {
      const updater = {
        first_name: 'new name',
        last_name: 'new',
        email: 'whatthefuck@edu.com',
        phone_number: '0465672345',
        password: 'anewspassword'
      }
      request.put(createUpdateRequestObject(updater))
        .on('response', function (response) {
          response.statusCode.should.equal(200)
        })
        .on('data', function (data) {
          // decompressed data as it is received
          const res = JSON.parse(data)
          user.first_name = updater.first_name
          user.last_name = updater.last_name
          user.email = updater.email
          user.phone_number = updater.phone_number
          checkUser(res)
          request(getAuthenticateOption(user.id, updater.password))
            .on('response', function (response) {
              response.statusCode.should.equal(200)
            })
            .on('data', function (data) {
              const result = JSON.parse(data)
              result.valid.should.equal(true)
              checkUser(JSON.parse(result.user))
              done()
            })
        })
    })
  })
})
