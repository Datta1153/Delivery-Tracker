import jwt from 'jsonwebtoken';

const generateToken = (id, role) => {
  // include role so client can easily display UI based on permissions
  return jwt.sign({ id, role }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || '7d',
  });
};

export default generateToken;
