angular.module('services', ['ngResource'])
    .factory('Storage', ['$window', function($window) {
        return {
            set: function(key, value) {
                $window.localStorage.setItem(key, value)
            },
            get: function(key) {
                return $window.localStorage.getItem(key)
            },
            rm: function(key) {
                $window.localStorage.removeItem(key)
            },
            clear: function() {
                $window.localStorage.clear()
            }
        }
    }])
    .constant('CONFIG', {
        baseUrl: 'http://docker2.haihonghospitalmanagement.com/api/v2/',
        dictbaseUrl: 'http://docker2.haihonghospitalmanagement.com/api/v2/',
        imgThumbUrl: 'http://df2.haihonghospitalmanagement.com/api/v2/uploads/photos/resize',
        imgLargeUrl: 'http://df2.haihonghospitalmanagement.com/api/v2/uploads/photos/',
    })

    .factory('Data', ['$resource', '$q', '$interval', 'CONFIG', 'Storage', function($resource, $q, $interval, CONFIG, Storage) {
        var serve = {}
        var abort = $q.defer

        var Dict = function() {
            return $resource(CONFIG.dictbaseUrl + ':path/:route', {
                path: 'dict'
            }, {
                getDistrict: {
                    method: 'GET',
                    params: {
                        route: 'district'
                    },
                    timeout: 100000
                }
            })
        }
        var Mywechat = function() {
            return $resource(CONFIG.dictbaseUrl + ':path/:route', { path: 'wechat' }, {
                createTDCticket: { method: 'POST', params: { route: 'createTDCticket' }, timeout: 100000 }
            })
        }

        var Doctor = function() {
            return $resource(CONFIG.dictbaseUrl + ':path/:route', { path: 'doctor' }, {
                getDoctorInfo: { method: 'GET', params: { route: 'detail'}, timeout: 100000 },
            })
        }

        var Upload = function() {
            return $resource(CONFIG.baseUrl + ':path', { path: 'upload' }, {
                uploadImg: { method: 'POST', params: { token:'@token' }, timeout: 100000 },
            })
        }

        var Policy = function() {
            return $resource(CONFIG.dictbaseUrl + ':path/:route', { path: 'policy' }, {
                getPatientList: { method: 'GET', params: { route: 'patients',token:'@token'}, timeout: 100000 },
                getAgentList: { method: 'GET', params: { route: 'agents',token:'@token' }, timeout: 100000 },
                getFollowupHis: { method: 'GET', params: { route: 'history',patientId:'@patientId',token:'@token' }, timeout: 100000 },
                setinsuranceA: { method: 'POST', params: { route: 'agent',patientId:'@patientId',insuranceAId:'@insuranceAId',reason:'@reason',token:'@token'  }, timeout: 100000 },
                postFollowUp: { method: 'POST', params: { route: 'followUp',patientId:'@patientId',content:'@content',photoUrls:'@photoUrls',token:'@token' }, timeout: 100000 },
                postPolicy: { method: 'POST', params: { route: 'policy',patientId:'@patientId',content:'@content',photoUrls:'@photoUrls',token:'@token' }, timeout: 100000 },
                getPolicy: { method: 'GET', params: { route: 'policy',patientId:'@patientId',token:'@token' }, timeout: 100000 },
                reviewPolicy: { method: 'POST', params: { route: 'policyReview',patientId:'@patientId',reviewResult:'@reviewResult',rejectReason:'@rejectReason',startTime:'@startTime',endTime:'@endTime',token:'@token' }, timeout: 100000 },
                removeAgent: { method: 'POST', params: { route: 'agentOff',insuranceAId:'@insuranceAId',token:'@token' }, timeout: 100000 }
            })
        }

        var User = function() {
            return $resource(CONFIG.baseUrl + ':path/:route', {
                path: 'alluser'
            }, {
                logIn: {
                    method: 'POST',
                    params: {
                        route: 'login'
                    },
                    timeout: 100000
                },
                logOut: {
                    method: 'POST',
                    params: {
                        route: 'logout'
                    },
                    timeout: 100000
                }                
            })
        }

        var Review = function() {
            return $resource(CONFIG.baseUrl + ':path/:route', {
                path: 'review'
            }, {
                GetReviewInfo: {
                    method: 'GET',
                    params: {
                        route: 'reviewInfo',
                        reviewStatus: '@reviewInfo',
                        limit: '@limit',
                        skip: '@skip',
                        name: '@name',
                        token: '@token'
                    },
                    timeout: 100000
                },
                GetCertificate: {
                    method: 'GET',
                    params: {
                        route: 'certificate',
                        doctorId: '@doctorId',
                        token: '@token'
                    },
                    timeout: 100000
                },
                PostReviewInfo: {
                    method: 'POST',
                    params: {
                        route: 'reviewInfo'
                    },
                    timeout: 100000
                },
                GetCount: {
                    method: 'GET',
                    params: {
                        route: 'countByStatus',
                        reviewStatus: '@reviewStatus',
                        token: '@token'
                    },
                    timeout: 100000
                }
            })
        }

        var Dict = function() {
            return $resource(CONFIG.dictbaseUrl + ':path/:route', {
                path: 'dict'
            }, {
                getDistrict: {
                    method: 'GET',
                    params: {
                        route: 'district'
                    },
                    timeout: 100000
                }
            })
        }

        var LabtestImport = function() {
            return $resource(CONFIG.baseUrl + ':path/:route', {
                path: 'labtestImport'
            }, {
                GetLabtestInfo: {
                    method: 'GET',
                    params: {
                        route: 'listByStatus',
                        labtestImportStatus: '@labtestImportStatus',
                        limit: '@limit',
                        skip: '@skip',
                        name: '@name',
                        token: '@token'
                    },
                    timeout: 100000
                },
                GetPhotoList: {
                    method: 'GET',
                    params: {
                        route: 'photoList',
                        patientId: '@patientId',
                        token: '@token'
                    },
                    timeout: 100000
                },
                GetPatientLabTest: {
                    method: 'GET',
                    params: {
                        route: '',
                        patientId: '@patientId',
                        type: '@type',
                        time: '@time',
                        token: '@token'
                    },
                    timeout: 100000
                },
                GetPhotobyLabtest: {
                    method: 'GET',
                    params: {
                        route: 'photoByLabtest',
                        labtestId: '@labtestId',
                        token: '@token'
                    },
                    timeout: 100000
                },
                PostLabTestInfo: {
                    method: 'POST',
                    params: {
                        route: ''
                    },
                    timeout: 100000
                },
                LabelPhoto: {
                    method: 'POST',
                    params: {
                        route: 'labelphoto'
                    },
                    timeout: 100000
                },
                EditResult: {
                    method: 'POST',
                    params: {
                        route: 'edit'
                    },
                    timeout: 100000
                },
                GetCount: {
                    method: 'GET',
                    params: {
                        route: 'countByStatus',
                        labtestImportStatus: '@labtestImportStatus',
                        token: '@token'
                    },
                    timeout: 100000
                }
            })
        }

        var Alluser = function() {
            return $resource(CONFIG.baseUrl + ':path/:route', {
                path: 'alluser'
            }, {
                getUserList: {
                    method: 'GET',
                    params: {
                        route: 'userList',
                        token: '@token',
                        limit: '@limit',
                        skip: '@skip'
                    },
                    timeout: 10000
                },
                getDoctorList: {
                    method: 'GET',
                    params: {
                        route: 'doctorList',
                        token: '@token',
                        limit: '@limit',
                        skip: '@skip'
                    },
                    timeout: 10000
                },
                getPatientList: {
                    method: 'GET',
                    params: {
                        route: 'patientList',
                        token: '@token',
                        limit: '@limit',
                        skip: '@skip'
                    },
                    timeout: 10000
                },
                getNurseList: {
                    method: 'GET',
                    params: {
                        route: 'nurseList',
                        token: '@token',
                        limit: '@limit',
                        skip: '@skip'
                    },
                    timeout: 10000
                },
                getInsuranceList: {
                    method: 'GET',
                    params: {
                        route: 'insuranceList',
                        token: '@token',
                        limit: '@limit',
                        skip: '@skip'
                    },
                    timeout: 10000
                },
                getHealthList: {
                    method: 'GET',
                    params: {
                        route: 'healthList',
                        token: '@token',
                        limit: '@limit',
                        skip: '@skip'
                    },
                    timeout: 10000
                },
                getAdminList: {
                    method: 'GET',
                    params: {
                        route: 'adminList',
                        token: '@token',
                        limit: '@limit',
                        skip: '@skip'
                    },
                    timeout: 10000
                },
                cancelUser: {
                    method: 'POST',
                    params: {
                        route: 'cancelUser'
                    },
                    timeout: 10000
                },
                register: {
                    method: 'POST',
                    params: {
                        route: 'register',
                        phoneNo: '@phoneNo',
                        password: '@password',
                        role: '@role'
                    },
                    timeout: 10000
                },
                modify: {
                    method: 'POST',
                    params: {
                        route: 'alluser'
                    },
                    timeout: 10000
                },
                getCount: {
                    method: 'GET',
                    params: {
                        route: 'count',
                        token: '@token',
                        role: '@role'
                    },
                    timeout: 10000
                },
                sms: {
                    method: 'POST',
                    params: {
                        route: 'sms'
                    },
                    timeout: 10000
                }
            })
        }

        var Roles = function() {
            return $resource(CONFIG.baseUrl + ':path/:route', {
                path: 'acl'
            }, {
                addRoles: {
                    method: 'POST',
                    params: {
                        route: 'userRoles'
                    },
                    timeout: 10000
                },
                removeRoles: {
                    method: 'POST',
                    params: {
                        route: 'removeUserRoles'
                    },
                    timeout: 10000
                }
            })
        }

        var Monitor1 = function() {
            return $resource(CONFIG.baseUrl + ':path/:route', {
                path: 'doctormonitor'
            }, {
                GetRegion: {
                    method: 'GET',
                    params: {
                        route: 'distribution'
                    },
                    timeout: 100000
                },
                GetTrend: {
                    method: 'GET',
                    params: {
                        route: 'linegraph'
                    },
                    timeout: 100000
                },
                GetWorkload: {
                    method: 'GET',
                    params: {
                        route: 'workload'
                    },
                    timeout: 100000
                },
                GetOvertime: {
                    method: 'GET',
                    params: {
                        route: 'counseltimeout'
                    },
                    timeout: 100000
                },
                GetEvaluation: {
                    method: 'GET',
                    params: {
                        route: 'score'
                    },
                    timeout: 100000
                },
                GetCharge: {
                    method: 'GET',
                    params: {
                        route: 'order'
                    },
                    timeout: 100000
                },
                GetEvaDetail: {
                    method: 'GET',
                    params: {
                        route: 'comment'
                    },
                    timeout: 100000
                }
            })
        }
        var Monitor2 = function() {
            return $resource(CONFIG.baseUrl + ':path/:route', {
                path: 'patientmonitor'
            }, {
                GetPatRegion: {
                    method: 'GET',
                    params: {
                        route: 'distribution'
                    },
                    timeout: 100000
                },
                GetPatTrend: {
                    method: 'GET',
                    params: {
                        route: 'linegraph'
                    },
                    timeout: 100000
                },
                GetPatInsurance: {
                    method: 'GET',
                    params: {
                        route: 'insurance'
                    },
                    timeout: 100000
                },
                GetPatGroup: {
                    method: 'GET',
                    params: {
                        route: 'patientsbyclass'
                    },
                    timeout: 100000
                }
            })
        }

        var Department = function() {
            return $resource(CONFIG.baseUrl + ':path/:route', {
                path: 'department'
            }, {
                GetDistrictInfo: {
                    method: 'GET',
                    params: {
                        route: 'district',
                        district: '@district',
                        token: '@token',
                        limit: '@limit',
                        skip: '@skip'
                    },
                    timeout: 100000
                },
                GetDepartmentInfo: {
                    method: 'GET',
                    params: {
                        route: 'department',
                        district: '@district',
                        token: '@token',
                        limit: '@limit',
                        skip: '@skip'
                    },
                    timeout: 100000
                },
                GetDoctorList: {
                    method: 'GET',
                    params: {
                        route: 'doctorlist',
                        district: '@district',
                        hospital: '@hospital',
                        department: '@department',
                        token: '@token'
                    },
                    timeout: 100000
                },
                DeleteRecord: {
                    method: 'POST',
                    params: {
                        route: 'delete',
                        district: '@district',
                        hospital: '@hospital',
                        department: '@department',
                        token: '@token'
                    },
                    timeout: 100000
                },
                UpdateDistrict: {
                    method: 'POST',
                    params: {
                        route: 'updatedistrict',
                        district: '@district',
                        new: '@new',
                        token: '@token'
                    },
                    timeout: 100000
                },
                UpdateDepartment: {
                    method: 'POST',
                    params: {
                        route: 'updatedepartment',
                        department: '@department',
                        hospital: '@hospital',
                        district: '@district',
                        portleader: '@portleader',
                        new: '@new',
                        token: '@token'
                    },
                    timeout: 100000
                },
            })
        }

        serve.abort = function($scope) {
            abort.resolve()
            $interval(function() {
                abort = $q.defer()
                serve.Dict = Dict()
                serve.Doctor = Doctor()
                serve.User = User()
                serve.Review = Review()
                serve.LabtestImport = LabtestImport()
                serve.Alluser = Alluser()
                serve.Roles = Roles()
                serve.Monitor1 = Monitor1()
                serve.Monitor2 = Monitor2()
                serve.Department = Department()
                serve.Mywechat = Mywechat()
                serve.Policy = Policy()
                serve.Upload = Upload()
            }, 0, 1)
        }
        serve.Dict = Dict()
        serve.Doctor = Doctor()
        serve.User = User()
        serve.Review = Review()
        serve.LabtestImport = LabtestImport()
        serve.Alluser = Alluser()
        serve.Roles = Roles()
        serve.Monitor1 = Monitor1()
        serve.Monitor2 = Monitor2()
        serve.Department = Department()
        serve.Mywechat = Mywechat()
        serve.Policy = Policy()
        serve.Upload = Upload()
        return serve
    }])

    .factory('Dict', ['$q', 'Data', function($q, Data) {
        var self = this
        // params->{
        //  level:'3',//1获取省份，2获取城市，3获取区县
        //  province:"33", //定位到某个具体省份时需要输入
        //  city:'01',  //定位到某个具体城市时需要输入
        //  district:'02' //定位到某个具体区县时需要输入
        // }
        self.getDistrict = function(params) {
            var deferred = $q.defer()
            Data.Dict.getDistrict(
                params,
                function(data, headers) {
                    deferred.resolve(data)
                },
                function(err) {
                    deferred.reject(err)
                })
            return deferred.promise
        }
        return self
    }])

    .factory('Mywechat', ['$q', 'Data', function ($q, Data) {
          var self = this

          self.createTDCticket = function (params) {
            var deferred = $q.defer()
            Data.Mywechat.createTDCticket(
                    params,
                    function (data, headers) {
                      deferred.resolve(data)
                    },
                    function (err) {
                      deferred.reject(err)
                    })
            return deferred.promise
          }
          return self
    }])

    .factory('Upload', ['$q', 'Data', function ($q, Data) {
          var self = this

          self.uploadImg = function (params) {
            var deferred = $q.defer()
            Data.Upload.uploadImg(
                    params,
                    function (data, headers) {
                      deferred.resolve(data)
                    },
                    function (err) {
                      deferred.reject(err)
                    })
            return deferred.promise
          }
          return self
    }])

    .factory('Doctor', ['$q', 'Data', function($q, Data) {
        var self = this
        self.getPatientList = function(params) {
            var deferred = $q.defer()
            Data.Doctor.getPatientList(
                params,
                function(data, headers) {
                    deferred.resolve(data)
                },
                function(err) {
                    deferred.reject(err)
                })
            return deferred.promise
        }
        return self
    }])

    .factory('Policy', ['$q', 'Data', function($q, Data) {
        var self = this
        self.getAgentList = function(params) {
            var deferred = $q.defer()
            Data.Policy.getAgentList(
                params,
                function(data, headers) {
                    deferred.resolve(data)
                },
                function(err) {
                    deferred.reject(err)
                })
            return deferred.promise
        }
        self.getFollowupHis = function(params) {
            var deferred = $q.defer()
            Data.Policy.getFollowupHis(
                params,
                function(data, headers) {
                    deferred.resolve(data)
                },
                function(err) {
                    deferred.reject(err)
                })
            return deferred.promise
        }        
        self.setinsuranceA = function(params) {
            var deferred = $q.defer()
            Data.Policy.setinsuranceA(
                params,
                function(data, headers) {
                    deferred.resolve(data)
                },
                function(err) {
                    deferred.reject(err)
                })
            return deferred.promise
        }
        self.postFollowUp = function(params) {
            var deferred = $q.defer()
            Data.Policy.postFollowUp(
                params,
                function(data, headers) {
                    deferred.resolve(data)
                },
                function(err) {
                    deferred.reject(err)
                })
            return deferred.promise
        }
        self.postPolicy = function(params) {
            var deferred = $q.defer()
            Data.Policy.postPolicy(
                params,
                function(data, headers) {
                    deferred.resolve(data)
                },
                function(err) {
                    deferred.reject(err)
                })
            return deferred.promise
        }
        self.getPolicy = function(params) {
            var deferred = $q.defer()
            Data.Policy.getPolicy(
                params,
                function(data, headers) {
                    deferred.resolve(data)
                },
                function(err) {
                    deferred.reject(err)
                })
            return deferred.promise
        }
        self.reviewPolicy = function(params) {
            var deferred = $q.defer()
            Data.Policy.reviewPolicy(
                params,
                function(data, headers) {
                    deferred.resolve(data)
                },
                function(err) {
                    deferred.reject(err)
                })
            return deferred.promise
        }
        self.removeAgent = function(params) {
            var deferred = $q.defer()
            Data.Policy.removeAgent(
                params,
                function(data, headers) {
                    deferred.resolve(data)
                },
                function(err) {
                    deferred.reject(err)
                })
            return deferred.promise
        }
        self.getPatientList = function(params) {
            var deferred = $q.defer()
            Data.Policy.getPatientList(
                params,
                function(data, headers) {
                    deferred.resolve(data)
                },
                function(err) {
                    deferred.reject(err)
                })
            return deferred.promise
        }
        return self
    }])

    .factory('User', ['$q', '$http', 'Data', function($q, $http, Data) {
        var self = this
        self.logIn = function(params) {
            var deferred = $q.defer()
            Data.User.logIn(params, function(data, headers) {
                deferred.resolve(data)
            }, function(err) {
                deferred.reject(err)
            })
            return deferred.promise
        }
        self.logOut = function(params) {
            var deferred = $q.defer()
            Data.User.logOut(params, function(data, headers) {
                deferred.resolve(data)
            }, function(err) {
                deferred.reject(err)
            })
            return deferred.promise
        }
        return self
    }])

    .factory('Review', ['$q', '$http', 'Data', function($q, $http, Data) {
        var self = this
        self.GetReviewInfo = function(params) {
            var deferred = $q.defer()
            Data.Review.GetReviewInfo(params, function(data, headers) {
                deferred.resolve(data)
            }, function(err) {
                deferred.reject(err)
            })
            return deferred.promise
        }
        self.GetCertificate = function(params) {
            var deferred = $q.defer()
            Data.Review.GetCertificate(params, function(data, headers) {
                deferred.resolve(data)
            }, function(err) {
                deferred.reject(err)
            })
            return deferred.promise
        }
        self.PostReviewInfo = function(params) {
            var deferred = $q.defer()
            Data.Review.PostReviewInfo(params, function(data, headers) {
                deferred.resolve(data)
            }, function(err) {
                deferred.reject(err)
            })
            return deferred.promise
        }
        self.GetCount = function(params) {
            var deferred = $q.defer()
            Data.Review.GetCount(params, function(data, headers) {
                deferred.resolve(data)
            }, function(err) {
                deferred.reject(err)
            })
            return deferred.promise
        }
        return self
    }])

    .factory('LabtestImport', ['$q', '$http', 'Data', function($q, $http, Data) {
        var self = this
        self.GetLabtestInfo = function(params) {
            var deferred = $q.defer()
            Data.LabtestImport.GetLabtestInfo(params, function(data, headers) {
                deferred.resolve(data)
            }, function(err) {
                deferred.reject(err)
            })
            return deferred.promise
        }
        self.GetPhotoList = function(params) {
            var deferred = $q.defer()
            Data.LabtestImport.GetPhotoList(params, function(data, headers) {
                deferred.resolve(data)
            }, function(err) {
                deferred.reject(err)
            })
            return deferred.promise
        }
        self.GetPatientLabTest = function(params) {
            var deferred = $q.defer()
            Data.LabtestImport.GetPatientLabTest(params, function(data, headers) {
                deferred.resolve(data)
            }, function(err) {
                deferred.reject(err)
            })
            return deferred.promise
        }
        self.GetPhotobyLabtest = function(params) {
            var deferred = $q.defer()
            Data.LabtestImport.GetPhotobyLabtest(params, function(data, headers) {
                deferred.resolve(data)
            }, function(err) {
                deferred.reject(err)
            })
            return deferred.promise
        }
        self.PostLabTestInfo = function(params) {
            var deferred = $q.defer()
            Data.LabtestImport.PostLabTestInfo(params, function(data, headers) {
                deferred.resolve(data)
            }, function(err) {
                deferred.reject(err)
            })
            return deferred.promise
        }
        self.LabelPhoto = function(params) {
            var deferred = $q.defer()
            Data.LabtestImport.LabelPhoto(params, function(data, headers) {
                deferred.resolve(data)
            }, function(err) {
                deferred.reject(err)
            })
            return deferred.promise
        }
        self.EditResult = function(params) {
            var deferred = $q.defer()
            Data.LabtestImport.EditResult(params, function(data, headers) {
                deferred.resolve(data)
            }, function(err) {
                deferred.reject(err)
            })
            return deferred.promise
        }
        self.GetCount = function(params) {
            var deferred = $q.defer()
            Data.LabtestImport.GetCount(params, function(data, headers) {
                deferred.resolve(data)
            }, function(err) {
                deferred.reject(err)
            })
            return deferred.promise
        }
        return self
    }])

    .factory('Alluser', ['$q', '$http', 'Data', function($q, $http, Data) {
        var self = this
        self.getUserList = function(obj) {
            var deferred = $q.defer()
            Data.Alluser.getUserList(obj, function(data, headers) {
                deferred.resolve(data)
            }, function(err) {
                deferred.reject(err)
            })
            return deferred.promise
        }
        self.getDoctorList = function(obj) {
            var deferred = $q.defer()
            Data.Alluser.getDoctorList(obj, function(data, headers) {
                deferred.resolve(data)
            }, function(err) {
                deferred.reject(err)
            })
            return deferred.promise
        }
        self.getPatientList = function(obj) {
            var deferred = $q.defer()
            Data.Alluser.getPatientList(obj, function(data, headers) {
                deferred.resolve(data)
            }, function(err) {
                deferred.reject(err)
            })
            return deferred.promise
        }
        self.getNurseList = function(obj) {
            var deferred = $q.defer()
            Data.Alluser.getNurseList(obj, function(data, headers) {
                deferred.resolve(data)
            }, function(err) {
                deferred.reject(err)
            })
            return deferred.promise
        }
        self.getInsuranceList = function(obj) {
            var deferred = $q.defer()
            Data.Alluser.getInsuranceList(obj, function(data, headers) {
                deferred.resolve(data)
            }, function(err) {
                deferred.reject(err)
            })
            return deferred.promise
        }
        self.getHealthList = function(obj) {
            var deferred = $q.defer()
            Data.Alluser.getHealthList(obj, function(data, headers) {
                deferred.resolve(data)
            }, function(err) {
                deferred.reject(err)
            })
            return deferred.promise
        }
        self.getAdminList = function(obj) {
            var deferred = $q.defer()
            Data.Alluser.getAdminList(obj, function(data, headers) {
                deferred.resolve(data)
            }, function(err) {
                deferred.reject(err)
            })
            return deferred.promise
        }
        self.cancelUser = function(obj) {
            var deferred = $q.defer()
            Data.Alluser.cancelUser(obj, function(data, headers) {
                deferred.resolve(data)
            }, function(err) {
                deferred.reject(err)
            })
            return deferred.promise
        }
        self.register = function(obj) {
            var deferred = $q.defer()
            Data.Alluser.register(obj, function(data, headers) {
                deferred.resolve(data)
            }, function(err) {
                deferred.reject(err)
            })
            return deferred.promise
        }
        self.modify = function(obj) {
            var deferred = $q.defer()
            Data.Alluser.modify(obj, function(data, headers) {
                deferred.resolve(data)
            }, function(err) {
                deferred.reject(err)
            })
            return deferred.promise
        }
        self.getCount = function(obj) {
            var deferred = $q.defer()
            Data.Alluser.getCount(obj, function(data, headers) {
                deferred.resolve(data)
            }, function(err) {
                deferred.reject(err)
            })
            return deferred.promise
        }
        self.sms = function(obj) {
            var deferred = $q.defer()
            Data.Alluser.sms(obj, function(data, headers) {
                deferred.resolve(data)
            }, function(err) {
                deferred.reject(err)
            })
            return deferred.promise
        }
        return self
    }])

    .factory('Roles', ['$q', '$http', 'Data', function($q, $http, Data) {
        var self = this
        self.addRoles = function(obj) {
            var deferred = $q.defer()
            Data.Roles.addRoles(obj, function(data, headers) {
                deferred.resolve(data)
            }, function(err) {
                deferred.reject(err)
            })
            return deferred.promise
        }
        self.removeRoles = function(obj) {
            var deferred = $q.defer()
            Data.Roles.removeRoles(obj, function(data, headers) {
                deferred.resolve(data)
            }, function(err) {
                deferred.reject(err)
            })
            return deferred.promise
        }
        return self
    }])

    .factory('Monitor1', ['$q', '$http', 'Data', function($q, $http, Data) {
        var self = this
        self.GetRegion = function(params) {
            var deferred = $q.defer()
            Data.Monitor1.GetRegion(params, function(data, headers) {
                deferred.resolve(data)
            }, function(err) {
                deferred.reject(err)
            })
            return deferred.promise
        }
        self.GetTrend = function(params) {
            var deferred = $q.defer()
            Data.Monitor1.GetTrend(params, function(data, headers) {
                deferred.resolve(data)
            }, function(err) {
                deferred.reject(err)
            })
            return deferred.promise
        }
        self.GetWorkload = function(params) {
            var deferred = $q.defer()
            Data.Monitor1.GetWorkload(params, function(data, headers) {
                deferred.resolve(data)
            }, function(err) {
                deferred.reject(err)
            })
            return deferred.promise
        }
        self.GetOvertime = function(params) {
            var deferred = $q.defer()
            Data.Monitor1.GetOvertime(params, function(data, headers) {
                deferred.resolve(data)
            }, function(err) {
                deferred.reject(err)
            })
            return deferred.promise
        }
        self.GetEvaluation = function(params) {
            var deferred = $q.defer()
            Data.Monitor1.GetEvaluation(params, function(data, headers) {
                deferred.resolve(data)
            }, function(err) {
                deferred.reject(err)
            })
            return deferred.promise
        }
        self.GetCharge = function(params) {
            var deferred = $q.defer()
            Data.Monitor1.GetCharge(params, function(data, headers) {
                deferred.resolve(data)
            }, function(err) {
                deferred.reject(err)
            })
            return deferred.promise
        }
        self.GetEvaDetail = function(params) {
            var deferred = $q.defer()
            Data.Monitor1.GetEvaDetail(params, function(data, headers) {
                deferred.resolve(data)
            }, function(err) {
                deferred.reject(err)
            })
            return deferred.promise
        }
        return self
    }])

    .factory('Monitor2', ['$q', '$http', 'Data', function($q, $http, Data) {
        var self = this
        self.GetPatRegion = function(params) {
            var deferred = $q.defer()
            Data.Monitor2.GetPatRegion(params, function(data, headers) {
                deferred.resolve(data)
            }, function(err) {
                deferred.reject(err)
            })
            return deferred.promise
        }
        self.GetPatTrend = function(params) {
            var deferred = $q.defer()
            Data.Monitor2.GetPatTrend(params, function(data, headers) {
                deferred.resolve(data)
            }, function(err) {
                deferred.reject(err)
            })
            return deferred.promise
        }
        self.GetPatInsurance = function(params) {
            var deferred = $q.defer()
            Data.Monitor2.GetPatInsurance(params, function(data, headers) {
                deferred.resolve(data)
            }, function(err) {
                deferred.reject(err)
            })
            return deferred.promise
        }
        self.GetPatGroup = function(params) {
            var deferred = $q.defer()
            Data.Monitor2.GetPatGroup(params, function(data, headers) {
                deferred.resolve(data)
            }, function(err) {
                deferred.reject(err)
            })
            return deferred.promise
        }

        return self
    }])

    .factory('Department', ['$q', '$http', 'Data', function($q, $http, Data) {
        var self = this
        self.GetDistrictInfo = function(params) {
            var deferred = $q.defer()
            Data.Department.GetDistrictInfo(params, function(data, headers) {
                deferred.resolve(data)
            }, function(err) {
                deferred.reject(err)
            })
            return deferred.promise
        }
        self.GetDepartmentInfo = function(params) {
            var deferred = $q.defer()
            Data.Department.GetDepartmentInfo(params, function(data, headers) {
                deferred.resolve(data)
            }, function(err) {
                deferred.reject(err)
            })
            return deferred.promise
        }
        self.GetDoctorList = function(params) {
            var deferred = $q.defer()
            Data.Department.GetDoctorList(params, function(data, headers) {
                deferred.resolve(data)
            }, function(err) {
                deferred.reject(err)
            })
            return deferred.promise
        }
        self.DeleteRecord = function(params) {
            var deferred = $q.defer()
            Data.Department.DeleteRecord(params, function(data, headers) {
                deferred.resolve(data)
            }, function(err) {
                deferred.reject(err)
            })
            return deferred.promise
        }
        self.UpdateDistrict = function(params) {
            var deferred = $q.defer()
            Data.Department.UpdateDistrict(params, function(data, headers) {
                deferred.resolve(data)
            }, function(err) {
                deferred.reject(err)
            })
            return deferred.promise
        }
        self.UpdateDepartment = function(params) {
            var deferred = $q.defer()
            Data.Department.UpdateDepartment(params, function(data, headers) {
                deferred.resolve(data)
            }, function(err) {
                deferred.reject(err)
            })
            return deferred.promise
        }
        return self
    }])