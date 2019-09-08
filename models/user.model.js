const mongoose 			= require('mongoose');
const bcrypt 			= require('bcrypt');
const bcrypt_p 			= require('bcrypt-promise');
const jwt           	= require('jsonwebtoken');
const validate          = require('mongoose-validator');
const {TE , to}          = require('../services/util.service');
const CONFIG            = require('../config/config');

let UserSchema = mongoose.Schema({
    name            :           { type : String , required : true } ,
    phone           :	        {type : String, lowercase:true,
        validate:[validate({
            validator: 'isNumeric',
            arguments: [7, 20],
            message: 'Not a valid phone number.',
        })]
    },
    email: {type:String, lowercase:true ,
            validate:[validate({
                validator: 'isEmail',
                message: 'Not a valid email.',
            })]
    },
    password        :           { type : String , required : true } ,
    act             :           { type : Boolean , required : true , default : true}

}, {timestamps: true});


UserSchema.methods.comparePassword = async function(pw){
    let err, pass;
    if(!this.password) console.log('password not set');

    [err, pass] = await to(bcrypt_p.compare(pw, this.password));
    if(err) console.log(err);

    if(!pass) console.log('invalid password');

    return pass;
}

UserSchema.pre('save', async function(next){

    if(this.isModified('password') || this.isNew){

        let err, salt, hash;
        [err, salt] = await to(bcrypt.genSalt(10));
        if(err) TE(err.message, true);

        [err, hash] = await to(bcrypt.hash(this.password, salt));
        if(err) TE(err.message, true);

        this.password = hash;

    } else{
        return next();
    }
});

UserSchema.methods.getJWT = function(){
    let expiration_time = parseInt(CONFIG.TOKEN_EXPIRE_TIME);
    return "Bearer " + jwt.sign({user_id:this._id}, CONFIG.SECRET, {expiresIn: expiration_time});
};


let User = module.exports = mongoose.model('User', UserSchema);