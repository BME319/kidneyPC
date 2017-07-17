angular.module('services',['ngResource'])
.factory('Storage', ['$window', function ($window) { 
	return {
    set: function(key, value) {
    	$window.localStorage.setItem(key, value);
    },
    get: function(key) {
    	return $window.localStorage.getItem(key);
    },
    rm: function(key) {
    	$window.localStorage.removeItem(key);
    },
    clear: function() {
    	$window.localStorage.clear();
    }
	};
}])
.constant('CONFIG', {
  baseUrl: 'http://121.43.107.106:4060/Api/v2/',  
  logInbaseUrl: 'http://121.43.107.106:4060/Api/v1/',  
})
.factory('Data', ['$resource', '$q', '$interval', 'CONFIG', 'Storage', function($resource,$q,$interval ,CONFIG,Storage){ 
	var serve={};
	var abort = $q.defer;

  var User = function () {
    return $resource(CONFIG.logInbaseUrl + ':path/:route', {path:'user'}, {
      logIn:{method:'POST', params:{route: 'login'}, timeout: 100000}
    })
  }

  var Review = function () {
    return $resource(CONFIG.baseUrl + ':path/:route', {path:'review'}, {
      GetReviewInfo:{method:'GET', params:{route:'reviewInfo', reviewStatus:'@reviewInfo', limit:'@limit', skip:'@skip', name:'@name', token:'@token'}, timeout:100000},
      GetCertificate:{method:'GET', params:{route:'certificate', doctorId:'@doctorId', token:'@token'}, timeout:100000},
      PostReviewInfo:{method:'POST',params:{route:'reviewInfo'}, timeout: 100000},
    })
  }

  var LabtestImport = function () {
    return $resource(CONFIG.baseUrl + ':path/:route', {path:'labtestImport'}, {
      GetLabtestInfo:{method:'GET', params:{route:'listByStatus', labtestImportStatus:'@labtestImportStatus', limit:'@limit', skip:'@skip', name:'@name', token:'@token'}, timeout:100000},
      GetPhotoList:{method:'GET', params:{route:'photoList', patientId:'@patientId', token:'@token'}, timeout:100000},
      GetPatientLabTest:{method:'GET', params:{route:'', patientId:'@patientId', type:'@type', time:'@time', token:'@token'}, timeout:100000},
      GetPhotobyLabtest:{method:'GET', params:{route:'photoByLabtest', labtestId:'@labtestId', token:'@token'}, timeout:100000},
      PostLabTestInfo:{method:'POST', params:{route:''}, timeout:100000},
      LabelPhoto:{method:'POST', params:{route:'labelphoto'}, timeout:100000},
      EditResult:{method:'POST', params:{route:'edit'}, timeout:100000}
    })
  }

  var Alluser = function () {
    return $resource(CONFIG.baseUrl + ':path/:route',{path:'alluser'},{
      getUserList:{method:'GET', params:{route:'userList',token:'@token',limit:'@limit',skip:'@skip'}, timeout: 10000},
      getDoctorList:{method:'GET', params:{route:'doctorList',token:'@token'}, timeout: 10000},
      getPatientList:{method:'GET', params:{route:'patientList',token:'@token'}, timeout: 10000},
      getNurseList:{method:'GET', params:{route:'nurseList',token:'@token'}, timeout: 10000},
      getInsuranceList:{method:'GET', params:{route:'insuranceList',token:'@token'}, timeout: 10000},
      getHealthList:{method:'GET', params:{route:'healthList',token:'@token'}, timeout: 10000},
      getAdminList:{method:'GET', params:{route:'adminList',token:'@token'}, timeout: 10000},
      cancelUser:{method:'POST', params:{route:'cancelUser'}, timeout: 10000},
      // register:{method:'POST', params:{route:'register',phoneNo:'@phoneNo',password:'@password',role:'@role'}, timeout: 10000},
      modify:{method:'POST', params:{route:'alluser'}, timeout: 10000},
      getCount:{method:'GET', params:{route:'count',token:'@token',role:'@role'}, timeout: 10000},
    })
  };

  var Roles = function () {
    return $resource(CONFIG.baseUrl + ':path/:route',{path:'acl'},{
      addRoles:{method:'POST', params:{route:'userRoles'}, timeout: 10000},
      removeRoles:{method:'POST', params:{route:'removeUserRoles'}, timeout: 10000},
    })
  };

	serve.abort = function ($scope) {
			abort.resolve();
	        $interval(function () {
	        abort = $q.defer();
          serve.User = User();
          serve.Review = Review();
          serve.LabtestImport = LabtestImport();
          serve.Alluser = Alluser();
          serve.Roles = Roles();
	    },0,1);
	}
  serve.User = User();
  serve.Review = Review();
  serve.LabtestImport = LabtestImport();
  serve.Alluser = Alluser();
  serve.Roles = Roles();
	return serve;
}])

.factory('User', ['$q', '$http', 'Data', function( $q, $http, Data ){
  var self = this;
  self.logIn = function (params) {
    var deferred = $q.defer();
    Data.User.logIn(params, function (data, headers) {
      deferred.resolve(data);
    }, function(err){
      deferred.reject(err);
    });
    return deferred.promise;
  };
  return self;
}])

.factory('Review', ['$q', '$http', 'Data', function($q, $http, Data) {
  var self = this;
  self.GetReviewInfo = function (params) {
    var deferred = $q.defer();
    Data.Review.GetReviewInfo(params, function (data, headers) {
      deferred.resolve(data);
    }, function (err) {
      deferred.reject(err);
    });
    return deferred.promise;
  };
  self.GetCertificate = function (params) {
    var deferred = $q.defer();
    Data.Review.GetCertificate(params, function (data, headers) {
      deferred.resolve(data);
    }, function (err) {
      deferred.reject(err);
    });
    return deferred.promise;
  };
  self.PostReviewInfo = function (params) {
    var deferred = $q.defer();
    Data.Review.PostReviewInfo(params, function (data, headers) {
      deferred.resolve(data);
    }, function (err) {
      deferred.reject(err);
    });
    return deferred.promise;
  }
  return self;
}])

.factory('LabtestImport', ['$q', '$http', 'Data', function($q, $http, Data) {
  var self = this;
  self.GetLabtestInfo = function (params) {
    var deferred = $q.defer();
    Data.LabtestImport.GetLabtestInfo(params, function (data, headers) {
      deferred.resolve(data);
    }, function (err) {
      deferred.reject(err);
    });
    return deferred.promise;
  }
  self.GetPhotoList = function (params) {
    var deferred = $q.defer();
    Data.LabtestImport.GetPhotoList(params, function (data, headers) {
      deferred.resolve(data);
    }, function (err) {
      deferred.reject(err);
    });
    return deferred.promise;
  }
  self.GetPatientLabTest = function (params) {
    var deferred = $q.defer();
    Data.LabtestImport.GetPatientLabTest(params, function (data, headers) {
      deferred.resolve(data);
    }, function (err) {
      deferred.reject(err);
    });
    return deferred.promise;
  }
  self.GetPhotobyLabtest = function (params) {
    var deferred = $q.defer();
    Data.LabtestImport.GetPhotobyLabtest(params, function (data, headers) {
      deferred.resolve(data);
    }, function (err) {
      deferred.reject(err);
    });
    return deferred.promise;
  }
  self.PostLabTestInfo = function (params) {
    var deferred = $q.defer();
    Data.LabtestImport.PostLabTestInfo(params, function (data, headers) {
      deferred.resolve(data);
    }, function (err) {
      deferred.reject(err);
    });
    return deferred.promise;
  }
  self.LabelPhoto = function (params) {
    var deferred = $q.defer();
    Data.LabtestImport.LabelPhoto(params, function (data, headers) {
      deferred.resolve(data);
    }, function (err) {
      deferred.reject(err);
    });
    return deferred.promise;
  }
  self.EditResult = function (params) {
    var deferred = $q.defer();
    Data.LabtestImport.EditResult(params, function (data, headers) {
      deferred.resolve(data);
    }, function (err) {
      deferred.reject(err);
    });
    return deferred.promise;
  }
  return self;
}])

.factory('Alluser', ['$q', '$http', 'Data', function( $q, $http, Data ){
  var self = this;
  self.getUserList = function (obj) {
    var deferred = $q.defer();
    Data.Alluser.getUserList(obj,function (data, headers) {
      deferred.resolve(data);
    }, function(err){
      deferred.reject(err);
    });
    return deferred.promise;
  };
  self.getDoctorList = function (_token) {
    var deferred = $q.defer();
    Data.Alluser.getDoctorList({token:_token},function (data, headers) {
      deferred.resolve(data);
    }, function(err){
      deferred.reject(err);
    });
    return deferred.promise;
  };
  self.getPatientList = function (_token) {
    var deferred = $q.defer();
    Data.Alluser.getPatientList({token:_token},function (data, headers) {
      deferred.resolve(data);
    }, function(err){
      deferred.reject(err);
    });
    return deferred.promise;
  };
  self.getNurseList = function (_token) {
    var deferred = $q.defer();
    Data.Alluser.getNurseList({token:_token},function (data, headers) {
      deferred.resolve(data);
    }, function(err){
      deferred.reject(err);
    });
    return deferred.promise;
  };
  self.getInsuranceList = function (_token) {
    var deferred = $q.defer();
    Data.Alluser.getInsuranceList({token:_token},function (data, headers) {
      deferred.resolve(data);
    }, function(err){
      deferred.reject(err);
    });
    return deferred.promise;
  };
  self.getHealthList = function (_token) {
    var deferred = $q.defer();
    Data.Alluser.getHealthList({token:_token},function (data, headers) {
      deferred.resolve(data);
    }, function(err){
      deferred.reject(err);
    });
    return deferred.promise;
  };
  self.getAdminList = function (_token) {
    var deferred = $q.defer();
    Data.Alluser.getAdminList({token:_token},function (data, headers) {
      deferred.resolve(data);
    }, function(err){
      deferred.reject(err);
    });
    return deferred.promise;
  };
  self.cancelUser = function (obj) {
    var deferred = $q.defer();
    Data.Alluser.cancelUser(obj,function (data, headers) {
      deferred.resolve(data);
    }, function(err){
      deferred.reject(err);
    });
    return deferred.promise;
  };
  self.register = function (obj) {
    var deferred = $q.defer();
    Data.Alluser.register(obj,function (data, headers) {
      deferred.resolve(data);
    }, function(err){
      deferred.reject(err);
    });
    return deferred.promise;
  };
  self.modify = function (obj) {
    var deferred = $q.defer();
    Data.Alluser.modify(obj,function (data, headers) {
      deferred.resolve(data);
    }, function(err){
      deferred.reject(err);
    });
    return deferred.promise;
  };
  self.getCount = function (obj) {
    var deferred = $q.defer();
    Data.Alluser.getCount(obj,function (data, headers) {
      deferred.resolve(data);
    }, function(err){
      deferred.reject(err);
    });
    return deferred.promise;
  };

  return self;
}])

.factory('Roles', ['$q', '$http', 'Data', function( $q, $http, Data ){
  var self = this;
  self.addRoles = function (obj) {
    var deferred = $q.defer();
    Data.Roles.addRoles(obj, function (data, headers) {
      deferred.resolve(data);
    }, function(err){
      deferred.reject(err);
    });
    return deferred.promise;
  };
  self.removeRoles = function (obj) {
    var deferred = $q.defer();
    Data.Roles.removeRoles(obj, function (data, headers) {
      deferred.resolve(data);
    }, function(err){
      deferred.reject(err);
    });
    return deferred.promise;
  };
  return self;
}])
