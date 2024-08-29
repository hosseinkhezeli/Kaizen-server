const fs = require('fs');
const jwt = require("jsonwebtoken");
const generateUniqueId = () => {
  return 'id_' + Math.random().toString(36).substr(2, 9); // Simple unique ID generator
};
const JWT_SECRET = 'your_jwt_secret'; // Use an environment variable in production

const generateOTP = () => Math.floor(100000 + Math.random() * 900000).toString();

const fileWriter = ({value,path})=>{
  fs.writeFileSync(path, JSON.stringify({ value }, null, 2));
}

const generateToken = (userId) => {
  return jwt.sign({ userId }, JWT_SECRET, { expiresIn: '1d' }); // Token expires in 1 day
};

module.exports = {generateUniqueId,generateOTP,fileWriter,generateToken}
