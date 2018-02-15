

const AWS = require('aws-sdk')

const parseBasicAuthToken = (auth) => {
  try {
    const result = {}
    const parts = auth.split(' ')

    if(parts.length !== 2 || parts[0] !== 'Basic') return { valid: false }

    result.scheme = parts[0]

    const decoded = new Buffer(parts[1], 'base64').toString('utf8')
    const colonIdx = decoded.indexOf(':')

    if(colonIdx < 0 ) return { valid: false }

    result.valid = true
    result.username = decoded.substr(0, colonIdx)
    result.password = decoded.substr(colonIdx + 1)

    return result
  } catch (err) {
    return { valid: false }
  }
}

///////////////////////////////////
// Note:
// 1. string || "default-value" is safe operation because string must not be empty, null, or undefined
// Default value will be local test environment
//////////////////////////////////////

function dynamodbEndpointOption() {
  if (process.env.IS_OFFLINE) {
    // connect to local DB if running offline
    return {
      region: 'localhost',
      endpoint: 'http://localhost:9876',
    }
  } else {
    return {
      region: process.env.REGION || 'localhost',
      endpoint: process.env.DYNAMODB_ENDPOINT || 'http://localhost:9876'
    }
  }
}

AWS.config.setPromisesDependency(require('bluebird'))
AWS.config.update(dynamodbEndpointOption())

module.exports = {
  AWS: {
    AWS_CONFIGURATION: dynamodbEndpointOption(),
    AWS: AWS,
    DynamoDB: new AWS.DynamoDB(),
    DocumentClient: new AWS.DynamoDB.DocumentClient()
  },
  Tables: {
    UserTable: {
      name: process.env.USER_TABLE || 'user-table',
      constraint: {
        user_id: /^[a-zA-Z0-9.\-_]{3,40}$/,
        first_name: /^[A-Za-z0-9 ]{1,20}$/,
        last_name: /^[A-Za-z0-]{1,20}$/,
        password: /^[A-Za-z0-9!@#$%^&*()_]{6,20}$/,
        email: /^([\w-]+(?:\.[\w-]+)*)@((?:[\w-]+\.)*\w[\w-]{0,66})\.([a-z]{2,6}(?:\.[a-z]{2})?)$/i,
        phone_number: /^[0-9]{10,11}$/
      }
    },
    DeviceTable: {
      name: process.env.DEVICE_TABLE || 'device-table',
      constraint: {
        device_id: /^[a-zA-Z0-9-]{1,90}$/, // TODO: update device id constrant
      }
    },
    ControllerTable: {
      name: process.env.CONTROLLER_TABLE || 'controller-table',
      constraint: {
        controller_id: /^[a-f0-9-]{36}$/, // UUID length
        ipv4: /^(([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])\.){3}([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])$|^(([a-zA-Z]|[a-zA-Z][a-zA-Z0-9-]*[a-zA-Z0-9])\.)*([A-Za-z]|[A-Za-z][A-Za-z0-9-]*[A-Za-z0-9])$|^\s*((([0-9A-Fa-f]{1,4}:){7}([0-9A-Fa-f]{1,4}|:))|(([0-9A-Fa-f]{1,4}:){6}(:[0-9A-Fa-f]{1,4}|((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3})|:))|(([0-9A-Fa-f]{1,4}:){5}(((:[0-9A-Fa-f]{1,4}){1,2})|:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3})|:))|(([0-9A-Fa-f]{1,4}:){4}(((:[0-9A-Fa-f]{1,4}){1,3})|((:[0-9A-Fa-f]{1,4})?:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(([0-9A-Fa-f]{1,4}:){3}(((:[0-9A-Fa-f]{1,4}){1,4})|((:[0-9A-Fa-f]{1,4}){0,2}:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(([0-9A-Fa-f]{1,4}:){2}(((:[0-9A-Fa-f]{1,4}){1,5})|((:[0-9A-Fa-f]{1,4}){0,3}:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(([0-9A-Fa-f]{1,4}:){1}(((:[0-9A-Fa-f]{1,4}){1,6})|((:[0-9A-Fa-f]{1,4}){0,4}:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(:(((:[0-9A-Fa-f]{1,4}){1,7})|((:[0-9A-Fa-f]{1,4}){0,5}:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:)))(%.+)?\s*$/,
      }
    }
  },
  Handler: {
    BadRequest: function (callback, message) {
      callback(null, {
        statusCode: 400,
        body: JSON.stringify({
          error: 'Bad request',
          message: message
        })
      })
    }
  },
  Utils: {
    BasicAuth: {
      parse: parseBasicAuthToken
    }
  }
}
