
function AppError(name, httpCode, isOperational) {
    Error.call(this);
    Error.captureStackTrace(this);
    this.name = name;
    this.status_code = httpCode ;
}

AppError.prototype.__proto__ = Error.prototype;


function parseError(err){
    let stack = err.stack ? err.stack : '';
    let stackObject = stack.split('\n');
    let splitMessage = err.message ? err.message.split('\n') : [''];
    let message = splitMessage[splitMessage.length - 1];
    let type = err.type ? err.type : err.name;
    let data = {
        stackObject : stackObject,
        message: message,
        type: type,
        stack: stack,
        arguments: err.arguments
    };
    return data;
}


module.exports.AppError = AppError ;
module.exports.parseError = parseError ;