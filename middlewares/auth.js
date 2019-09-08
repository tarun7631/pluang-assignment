const jwt = require('jsonwebtoken');
const config = require('../config/config.js');
const { OK ,ACCEPTED ,UNPROCESSABLE_ENTITY,UNAUTHORIZED,FORBIDDEN} = require('../utility/statuscodes');
const { to, sendError , sendSuccess }  = require('../services/util.service');
const { PostComments }      = require('../models');


let checkToken = (req, res, next) => {
  let token = req.headers['x-access-token'] || req.headers['authorization']; // Express headers are auto converted to lowercase
  
  if (token) {
    if (token.startsWith('Bearer ')) {
      // Remove Bearer from string
      token = token.slice(7, token.length);
    }

    jwt.verify(token, config.SECRET, (err, decoded) => {
      if (err) {
        return sendError(res,{message : 'Token is not valid'},UNAUTHORIZED)
      } else {
        req.decoded = decoded;
        next();
      }
    });
  } else return sendError(res,{message : 'Auth token is not supplied'},UNAUTHORIZED)

};

module.exports = {
  checkToken: checkToken 
}