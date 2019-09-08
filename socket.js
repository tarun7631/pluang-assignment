const socketio  = require('socket.io');
const jwt                   = require('jsonwebtoken');
const config                = require('./config/config.js');
const fs        = require('fs');
const {Uploadfiles}  = require('./models');
const { to }  = require('./services/util.service');

module.exports.listen = function(app) {

    io = socketio(app);



    // token auth 
    io.use(function(socket, next) {
        var token = socket.handshake.query.token ;

        if (!token){
            socket.error("Token not found");
            socket.disconnect();
            return next(new Error("Token not found"));
        }

        if (token.startsWith('Bearer ')) {
            // Remove Bearer from string
            token = token.slice(7, token.length);
        }

        jwt.verify(token, config.SECRET, function(err, decoded) {
            if (err){
                socket.error("Invalid token");
                socket.disconnect();
                return next(new Error("Invalid Token"));
            }
            next();
        });
    });

    io.on('connection', function(socket){


        // for creating file and entry in db plus requesting for file chunks
        socket.on('createFile', async function (data) { 
         
           var fileName = data['fileName'];
                file = {
                    fileName : fileName ,  
                    fileSize : data['Size'],
                    downloaded : 0 ,
                    position : 0 
                }

                fs.open(config.FILE_UPLOAD_DIR + fileName, "a", 0755, async function(err, fd){
                  
                  if(err) console.log(err);
                  
                  else
                  {
                      file.handler = fd ; 
                      
                      let err , fileUpload ;
                      [err , fileUpload] = await to(Uploadfiles.create(file));

                      if(err) console.log(err)
                      else socket.emit('nextDataChunk', { 'position' : file.position, percent : 0 });
                    
                  }
              });


        });


        // appending chunks
        socket.on('startUploading', async function (data){

          let err , fileUploadInfo ;

          [err , fileUploadInfo] = await to(Uploadfiles.findOne({act : 1 , fileName : data['fileName']})) ;

          if(err) console.log(err)
          

          var fileInfo = JSON.parse(JSON.stringify(fileUploadInfo));

          var fileName = data['fileName'];
          fileInfo['downloaded'] += data['Data'].length;


          if(fileInfo['downloaded'] == fileInfo['fileSize']) 
              fs.appendFile(config.FILE_UPLOAD_DIR + fileName , data['Data'] , 'Binary', async function(err, Writen){
                  var position = fileInfo['downloaded'] / config.FILE_UPLOAD_CHUNKSIZE;
                  await to(Uploadfiles.updateOne({act : true , fileName},{$set : {position : position , downloaded : fileInfo.downloaded }}))
                  socket.emit('completed');
              });
            
          else 
              fs.appendFile(config.FILE_UPLOAD_DIR + fileName , data['Data'] , 'Binary', async function(err, Writen){
                  var position = fileInfo['downloaded'] / config.FILE_UPLOAD_CHUNKSIZE;
                  var percent = (fileInfo['downloaded'] / fileInfo['fileSize']) * 100;

                  await to(Uploadfiles.updateOne({act : true , fileName},{$set : {position : position , downloaded : fileInfo.downloaded }}))
                  socket.emit('nextDataChunk', { 'position' : position, 'percent' :  percent});
              });

        });


        // resume uploading
        socket.on('resumeUploading', async function (data){

            let err , fileUploadInfo ;

            [err , fileUploadInfo] = await to(Uploadfiles.findOne({act : 1 , fileName : data['fileName']})) ;

            if(err) console.log(err)
            
            var position = fileUploadInfo['downloaded'] / config.FILE_UPLOAD_CHUNKSIZE;
            var percent = (fileUploadInfo['downloaded'] / fileUploadInfo['fileSize']) * 100;

            socket.emit('nextDataChunk', { 'position' : position, 'percent' :  percent});
        })

    })
}
