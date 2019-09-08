const { User }      = require('../models');
const { to, sendError , sendSuccess }  = require('../services/util.service');
const { check, validationResult } = require('express-validator/check');

const create = async function(req, res){
    res.setHeader('Content-Type', 'application/json');
    const body = req.body;

    // req.checkBody('email', 400).notEmpty() ;
    req.checkBody('name',400).notEmpty();
    req.checkBody('password',400).notEmpty();
    req.checkBody('phone',400).notEmpty();

    if(req.validationErrors()){
        return sendError(res, req.validationErrors() , 400)
    }    

    let err, user;

    [err, user] = await to(User.create(body));
    if(err) return sendError(res, err, 422);
    
    return sendSuccess(res, {message:'Successfully created new user.', token:user.getJWT()});

}
module.exports.create = create;

const login = async function(req, res){
    const body = req.body;
    console.log(body) ;
    req.checkBody('password',400).notEmpty();
    req.checkBody('phone',400).notEmpty();

    if(req.validationErrors()){
        return sendError(res, req.validationErrors() , 400)
    }    
        
    let err, user, pass;

    [err, user] = await to(User.findOne({phone : body.phone})) ;
    if(err) return sendError(res, err, 422);
    if(!user) return sendError(res , {message : "User not found"}  , 404) ;

    [err, pass] = await to(user.comparePassword(body.password));
    if(err) return sendError(res, err, 422);

    if(!pass) return sendError(res , {message : "Invalid password"} , 401)
    return sendSuccess(res, {token:user.getJWT()});
} 
module.exports.login = login;


const userInfo = async function(req,res){
    res.setHeader('Content-Type', 'application/json');

    const id = req.decoded.user_id ; 
    let err,user ;
    [err,user] = await to(User.findOne({_id : id , act :true},{name : 1 , phone:  1}));

    if(err) return sendError(res,err,422);
    if(user == null) return sendError(res,{message : "User Not Found"},404);

    return sendSuccess(res,user);
}
module.exports.userInfo = userInfo ;
