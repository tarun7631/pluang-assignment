angular.module('pluangControllers', ["ngCookies" ,"ngMaterial"])
		
.controller('mainController', function($scope,$sce,CONSTANTS,$cookies,$window,$timeout,$mdToast,QueryService,$mdDialog) {

	var init = function(){
		var token = $cookies.get('x-access-token') ;
		if(!token) return ;
		QueryService.query('GET',{'x-access-token' : token},CONSTANTS.userInfo,{},{})
		.then(function(res){
			$scope.userName = res.data.name ;
			$scope.userId = res.data._id ;
			console.log(res)
		})
		.catch(function(err){
			showErr(err.data.error)
		})
	}
	
	$scope.removeCookies = function(){
		$cookies.remove('x-access-token');
		$scope.userName = null ;
		$window.location.reload();

	}

	$scope.openLoginDialog = function(ev){
		$mdDialog.show({
	        controller: DialogController,
	        templateUrl: 'Add.Dialog.html',
	        targetEvent: ev,
	        clickOutsideToClose:true
	    })
	}
	var showErr = function(msg){
		$mdToast.show(
	        $mdToast.simple()
	        .textContent(msg)
	        .position('top right')
	        .hideDelay(3000)
	    )
	} 

	function DialogController($cookies , $scope, $mdDialog) {

		$scope.selectLoginForm = true ;
		$scope.selectSignupForm = false ;

		$scope.loginForm = function(){
			$scope.selectLoginForm = true ;
			$scope.selectSignupForm = false ;
		}

		$scope.signupForm = function(){
			$scope.selectLoginForm = false ;
			$scope.selectSignupForm = true ;
		}
	
		$scope.login = function() {
			QueryService.query('POST',{},CONSTANTS.login,{},{phone : $scope.pNo , password : $scope.pwd})
			.then(function(res){
				$cookies.put('x-access-token',res.data.token)
				$window.location.reload();
				$mdDialog.cancel();
			})
			.catch(function(err){
				showErr(err.data.error)
			})
		};
		$scope.signup = function() {
			QueryService.query('POST',{},CONSTANTS.signup,{},{phone : $scope.pNo , password : $scope.pwd , name : $scope.name})
			.then(function(res){
				$cookies.put('x-access-token',res.data.token)
				$window.location.reload();
				$mdDialog.cancel();
			})
			.catch(function(err){
				showErr(err.data.error)
			})
		}
	};

	init()

})

.controller('homeController', function($scope,$sce,CONSTANTS,$cookies,$window,$timeout,$mdToast,QueryService,$mdDialog,$state) {
	
	// var socket = io.connect('http://localhost:3000');

	var socket = io.connect("http://localhost:3000/",{
        query: {
            token  : $cookies.get('x-access-token')
        }
      }
    );
	var fileReader ;
	var sizeOfChunk = 1000000 ;
	$scope.selectedFile = null ;

	$scope.fileNameChanged = function(e){
		$scope.$apply(function() {
			$scope.selectedFile = e.target.files[0] ;
			$scope.enableResuming = false ;
			$scope.reconnectAttempts =0;
			$scope.determinateValue = 0 ;
		});
	}

	$scope.resumeUploading = function(){
	    $scope.enableResuming = false ;
	    socket.emit('resumeUploading', { 'fileName' : $scope.fileName, 'Size' : $scope.selectedFile.size });
	}


	socket.on('nextDataChunk', function (data){

	    var position = data['position'] * sizeOfChunk;

	    $scope.$apply(function() {
		    $scope.determinateValue = data['percent'];
		});

	    var newFile ; 
	    if($scope.selectedFile.slice) 
	        newFile = $scope.selectedFile.slice(position, position + Math.min(sizeOfChunk, ($scope.selectedFile.size-position)));
	    
	    fileReader.readAsBinaryString(newFile);
	});

	socket.on('error',function(err){
		console.log(err.message)
	})

	socket.on('reconnecting', (attemptNumber) => {
	  	$scope.$apply(function() {
	    	$scope.reconnectAttempts = attemptNumber ;
	    	$scope.enableResuming = false ;
		});
	});

	socket.on('reconnect', (attemptNumber) => {
	  	$scope.$apply(function() {
	  		$scope.reconnectAttempts = false ;
	    	$scope.enableResuming = true ;
		});
	});

	socket.on('connect_error', (error) => {
		console.log(error.message)
		if(error.message == "xhr poll error"){
			console.log('here')
		}
	});

	socket.on('completed', function (data){
		$scope.$apply(function() {
			$scope.msg = 'previous file completely uploaded';
		    $scope.determinateValue = 0;
		    $scope.selectedFile = null;		    
		});
	});


	$scope.uploadStart = function(){

		if(!$cookies.get('x-access-token')){
			$scope.openLoginDialog()
			return
		} 
		
		if($scope.selectedFile){
			fileReader = new FileReader();
			var now = new Date() ;
	        $scope.fileName = now.getTime() + $scope.selectedFile.name;

	        fileReader.onload = function(e){
	            socket.emit('startUploading', { 'fileName' : $scope.fileName , Data : e.target.result });
	        }

	        var csvFileInput = document.getElementById('FileBox');    
			var csvFile = csvFileInput.files[0];

	        socket.emit('createFile', { 'fileName' : $scope.fileName, 'Size' : $scope.selectedFile.size });
		} else {
			alert('Please select file')
		}

	}

});