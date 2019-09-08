const mongoose 			= require('mongoose');
const bcrypt_p 			= require('bcrypt-promise');
const jwt           	= require('jsonwebtoken');
const validate          = require('mongoose-validator');
const {TE , to}          = require('../services/util.service');
const CONFIG            = require('../config/config');

let UploadFilesSchema = mongoose.Schema({
    fileName            :           { type : String , required : true } ,
    downloaded          :           { type : Number , required  : true} ,
    handler             :           { type : Number , required : true} ,
    position            :           { type : Number , required : true} ,
    fileSize 			: 			{ type : Number , required : true },
    act             :           { type : Boolean , required : true , default : true}

}, {timestamps: true});



let UploadFiles = module.exports = mongoose.model('UploadFiles', UploadFilesSchema);