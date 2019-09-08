const { User }      = require('../models');
const { to, sendError , sendSuccess }  = require('../services/util.service');
const { check, validationResult } = require('express-validator/check');
const path = require('path');


const fileupload = async function(req, res){
    console.log('here');
    return sendSuccess(res,{message : 'files upload successfully'})

}
module.exports.fileupload = fileupload;
