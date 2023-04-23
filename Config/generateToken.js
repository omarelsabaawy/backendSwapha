const jwt = require('jsonwebtoken')

const generateToken = (id) => {
    return jwt.sign({ id }, "jwtSecret", {
        expiresIn: "30d"
    });
}

module.exports = {
    generateToken
};