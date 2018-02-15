const code = 'vb5qlrcrj4';

const endpoint = process.env.API_ENDPOINT || `https://${code}.execute-api.eu-central-1.amazonaws.com/dev`;

module.exports = {
  users:
  {
    registerUser: `${endpoint}/users`,
    getUserById: `${endpoint}/users/{user_id}`,
    getUsersByEmail: `${endpoint}/users/email/{email}`,
    getUsersByPhoneNumber: `${endpoint}/users/phoneNumber/{phone_number}`,
    updateUser: `${endpoint}/users`,
    isValidCredential: `${endpoint}/users/validate`,
    authenticate: `${endpoint}/users/authenticate`
  },
  devices:
  {
    registerDevice: `${endpoint}/devices`,
    getDeviceById: `${endpoint}/devices/{device_id}`,
    assignDeviceToController: `${endpoint}/devices/{device_id}/controller/{controller_id}`,
    assignDeviceToUser: `${endpoint}/devices/{device_id}/user/{owner_id}`,
    getDevicesForController: `${endpoint}/devices/controller/{controller_id}`,
    getDevicesForUser: `${endpoint}/devices/user/{owner_id}`
  },
  controllers:
  {
    registerController: `${endpoint}/controllers`,
    getControllerById: `${endpoint}/controllers/{controller_id}`,
    updateController: `${endpoint}/controllers/{controller_id}`,
    listControllers: `${endpoint}/controllers`
  }
};
