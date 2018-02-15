const bcrypt = require('bcryptjs');

const salt = bcrypt.genSaltSync(10);

var x = {
    salt: salt,
    pass: bcrypt.hashSync("tuanvu", salt)
};

console.log(JSON.stringify(x));
console.log("decypting result: " + bcrypt.hashSync("tuanvu", x.salt));
