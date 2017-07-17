angular.module('controllers', ['ngResource', 'services'])

// .controller('LoginCtrl', ['$scope', '$state', 'Storage', '$timeout', function($scope, $state, Storage, $timeout) {

//             $scope.LogIn = function(logOn) {
//                 if ((LogIn.phoneNo != '') && (LogIn.password != '')) {
//                     User.LogIn($scope)

//                     $state.go('main.usermanage.allUsers');
//                 }

//             }])

.controller('LoginCtrl', ['$scope', '$timeout', '$state', 'Storage', '$sce', 'Data', 'User', function($scope, $timeout, $state, Storage, $sce, Data, User) {

    if (Storage.get('USERNAME') != null && Storage.get('USERNAME') != undefined) {
        $scope.logOn = { username: Storage.get('USERNAME'), password: '' }
    } else {
        $scope.logOn = { username: '', password: '' }
    }

    $scope.LogIn = function(logOn) {
        switch (logOn.role) {
            // case 'doctor':
            //     userrole = '普通医生'
            //     break
            // case 'patient':
            //     userrole = '患者'
            //     break
            case 'health':
                userrole = '健康专员'
                break
            case 'admin':
                userrole = '管理员'
                break
        }
        $scope.logStatus = ''
        if ((logOn.username != '') && (logOn.password != '')) {
            var phoneReg = /^(13[0-9]|15[012356789]|17[678]|18[0-9]|14[57])[0-9]{8}$/
            if (!phoneReg.test(logOn.username)) {
                $scope.logStatus = '手机号验证失败！'
            } else {
                Storage.set('USERNAME', logOn.username)
                User.logIn({ username: logOn.username, password: logOn.password, role: logOn.role }).then(function(data) {
                    if (data.results == 1) {
                        $scope.logStatus = '请确认账号密码无误且角色选择正确！'
                    } else if (data.results.mesg == 'login success!') {
                        $scope.logStatus = '登录成功！'
                        $state.go('main.usermanage.allUsers')
                        Storage.set('PASSWORD', logOn.password)
                        Storage.set('TOKEN', data.results.token)
                        Storage.set('isSignIN', 'Yes')
                        var username = data.results.userName ? data.results.userName : data.results.userId
                        Storage.set('UName', username)
                        Storage.set('ROLE', userrole)
                    }
                }, function(err) {
                    if (err.results == null && err.status == 0) {
                        $scope.logStatus = '网络错误！'
                        return
                    }
                    if (err.status == 404) {
                        $scope.logStatus = '连接服务器失败！'
                    }
                })
            }
        } else {
            $scope.logStatus = '请输入完整信息！'
        }
    }

    $scope.toReset = function() {
        $state.go('phonevalid', { phonevalidType: 'reset' })
    }
}])

.controller('MainCtrl', ['$scope', '$state', 'Storage', '$timeout', function($scope, $state, Storage, $timeout) {
    $scope.UserName = Storage.get('UName')
    $scope.UserRole = Storage.get('ROLE')
    console.log($scope.UserRole)

    switch ($scope.UserRole) {
    case '健康专员' :
        $scope.flagdoctor = false
        $scope.flaguser = false
        $scope.flaghealth = true
        break
    case '管理员' :
        $scope.flagdoctor = true
        $scope.flaguser = true
        $scope.flaghealth = true
        break 
    // case '患者' :
    //     $scope.flagdoctor = true
    //     $scope.flaguser = true
    //     $scope.flaghealth = true
    //     break 
    // case '普通医生' :
    //     $scope.flagdoctor = true
    //     $scope.flaguser = false
    //     $scope.flaghealth = false
    //     break       
    }
    console.log($scope.flagdoctor)
    console.log($scope.flaguser)
    console.log($scope.flaghealth)

    $scope.tounchecked = function() {
        $state.go('main.checkornot.unchecked');
    }
    $scope.touser = function() {
        $state.go('main.usermanage.allUsers');
    }
    $scope.tounentered = function() {
        $state.go('main.enterornot.unentered');
    }
}])

.controller('CheckOrNotCtrl', ['$scope', '$state', 'Review', 'Storage', '$timeout', 'NgTableParams', function($scope, $state, Review, Storage, $timeout, NgTableParams) {
        $scope.flag = 0;
        $scope.tochecked = function() {
            $state.go('main.checkornot.checked');
            $scope.flag = 1;
        }
        $scope.tounchecked = function() {
            $state.go('main.checkornot.unchecked');
            $scope.flag = 0;
        }
    }])
    // 未审核
    .controller('UncheckedCtrl', ['$scope', '$state', 'Review', 'Storage', '$timeout', 'NgTableParams', '$uibModal', function($scope, $state, Review, Storage, $timeout, NgTableParams, $uibModal) {
        $scope.RejectReason = '';
        $scope.review = {
            "reviewStatus": 0,
            "itemsPerPage": 15,
            "skip": 0,
            "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI1OTEyZTllYmRjODNmNmE4YjdkY2JkZTgiLCJ1c2VySWQiOiJVMjAxNzAzMTQyMDE4Iiwicm9sZSI6InBhdGllbnQiLCJleHBpcmVBZnRlciI6MTQ5NzQwNzI2MzgzMywiaWF0IjoxNDk3NDA3MjYzfQ.5UITzg6NaHcIIEQESCLLB7mx_suISw9Bj6K1OBaiaDk"
        }
        $scope.doctorinfos = {};
        Review.GetReviewInfo($scope.review).then(
            function(data) {
                $scope.doctorinfos = data.results;
                console.log($scope.doctorinfos);
                $scope.tableParams = new NgTableParams({
                    count: 15
                }, {
                    counts: [],
                    dataset: $scope.doctorinfos
                });
            },
            function(e) {

            });
        $scope.getdocId = function(index) {
            Storage.set('docId', $scope.doctorinfos[index].userId);
            Storage.set('reviewstatus', 0);
        }
        $scope.accept = function(index) {
            var postreview = {
                "doctorId": $scope.doctorinfos[index].userId,
                "reviewStatus": 1,
                "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI1OTIyZWJlNWI5NGRlMTM5Mjg1NzQ5ZjciLCJ1c2VySWQiOiJVMjAxNzA1MTEwMDAxIiwicm9sZSI6ImFkbWluIiwiZXhwIjoxNDk5ODY0NDQ4Nzk3LCJpYXQiOjE0OTk4NjA4NDh9.PUG7L5RqBTuaLuZUc_vbrHd6KvDz6uIS07_lQLJWJkA"
            }
            Review.PostReviewInfo(postreview).then(
                function(data) {
                    console.log(data.results);
                },
                function(e) {

                })
        }
        $scope.reject = function() {
            var modalInstance = $uibModal.open({
                animation: true,
                ariaLabelledBy: 'modal-title',
                ariaDescribedBy: 'modal-body',
                templateUrl: 'templates/main/checkornot/reject.html',
                controller: 'ModalInstanceCtrl',
                // resolve:{
                //  RejectReason:function () {
                //    return $scope.RejectReason;
                //  }
                // }
            });
        }
        $scope.lastpage = function() {
            if ($scope.review.skip - $scope.review.itemsPerPage >= 0) {
                $scope.review.skip -= $scope.review.itemsPerPage;
                Review.GetReviewInfo($scope.review).then(
                    function(data) {
                        $scope.doctorinfos = data.results;
                        console.log($scope.doctorinfos);
                        console.log(data.nexturl);
                        $scope.tableParams = new NgTableParams({
                            count: 15
                        }, {
                            counts: [],
                            dataset: $scope.doctorinfos
                        });
                    },
                    function(e) {

                    });
            }
        }
        $scope.nextpage = function() {
            $scope.review.skip += $scope.review.itemsPerPage;
            Review.GetReviewInfo($scope.review).then(
                function(data) {
                    $scope.doctorinfos = data.results;
                    console.log($scope.doctorinfos);
                    console.log(data.nexturl);
                    $scope.tableParams = new NgTableParams({
                        count: 15
                    }, {
                        counts: [],
                        dataset: $scope.doctorinfos
                    });
                },
                function(e) {

                });
        }
        $scope.search = function() {
            $scope.review = {
                "reviewStatus": 0,
                "itemsPerPage": 15,
                "skip": 0,
                "name": $scope.doctorname,
                "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI1OTEyZTllYmRjODNmNmE4YjdkY2JkZTgiLCJ1c2VySWQiOiJVMjAxNzAzMTQyMDE4Iiwicm9sZSI6InBhdGllbnQiLCJleHBpcmVBZnRlciI6MTQ5NzQwNzI2MzgzMywiaWF0IjoxNDk3NDA3MjYzfQ.5UITzg6NaHcIIEQESCLLB7mx_suISw9Bj6K1OBaiaDk"
            }
            Review.GetReviewInfo($scope.review).then(
                function(data) {
                    $scope.doctorinfos = data.results;
                    console.log($scope.doctorname);
                    console.log($scope.review);
                    console.log($scope.doctorinfos);
                    $scope.tableParams = new NgTableParams({
                        count: 15
                    }, {
                        counts: [],
                        dataset: $scope.doctorinfos
                    });
                },
                function(e) {

                })
        }
    }])
    // 审核内容-拒绝原因
    .controller('ModalInstanceCtrl', ['$scope', '$uibModalInstance', function($scope, $uibModalInstance) {
        $scope.RejectReason = '';
        $scope.ok = function() {
            console.log($scope.RejectReason);
            $uibModalInstance.close();

        };
        $scope.cancel = function() {
            $uibModalInstance.dismiss();
        };

    }])
    // 查看医生资质证书
    .controller('DoctorLicenseCtrl', ['$scope', '$state', 'Review', 'Storage', '$timeout', function($scope, $state, Review, Storage, $timeout) {
        var id = Storage.get('docId');
        var status = Storage.get('reviewstatus');
        console.log(id);
        console.log(status);
        $scope.doctorinfos = {};
        $scope.review = {};
        var params = {
            "doctorId": id,

            "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI1OTEyZTllYmRjODNmNmE4YjdkY2JkZTgiLCJ1c2VySWQiOiJVMjAxNzAzMTQyMDE4Iiwicm9sZSI6InBhdGllbnQiLCJleHBpcmVBZnRlciI6MTQ5NzQwNzI2MzgzMywiaWF0IjoxNDk3NDA3MjYzfQ.5UITzg6NaHcIIEQESCLLB7mx_suISw9Bj6K1OBaiaDk"
        }
        Review.GetCertificate(params).then(
            function(data) {
                $scope.doctorinfos = data.results;
                if ($scope.doctorinfos.province == $scope.doctorinfos.city) $scope.doctorinfos.province = '';
                console.log($scope.doctorinfos);
                var review = {
                    "reviewStatus": status,
                    "itemsPerPage": 15,
                    "skip": 0,
                    "name": $scope.doctorinfos.name,
                    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI1OTEyZTllYmRjODNmNmE4YjdkY2JkZTgiLCJ1c2VySWQiOiJVMjAxNzAzMTQyMDE4Iiwicm9sZSI6InBhdGllbnQiLCJleHBpcmVBZnRlciI6MTQ5NzQwNzI2MzgzMywiaWF0IjoxNDk3NDA3MjYzfQ.5UITzg6NaHcIIEQESCLLB7mx_suISw9Bj6K1OBaiaDk"
                }
                Review.GetReviewInfo(review).then(
                    function(data) {
                        $scope.review.reviewStatus = data.results[0].reviewStatus;
                        $scope.review.adminId = data.results[0].adminId;
                        $scope.review.reviewDate = data.results[0].reviewDate;
                        if ($scope.review.reviewStatus == 0) $scope.review.reviewStatus = "未审核";
                        if ($scope.review.reviewStatus == 1) $scope.review.reviewStatus = "已通过";
                        if ($scope.review.reviewStatus == 2) $scope.review.reviewStatus = "已拒绝";
                        console.log($scope.review);
                    },
                    function(e) {

                    });
            },
            function(e) {

            });
    }])
    // 已审核
    .controller('CheckedCtrl', ['$scope', '$state', 'Review', 'Storage', 'NgTableParams', '$timeout', function($scope, $state, Review, Storage, NgTableParams, $timeout) {
        $scope.review = {
            "reviewStatus": 1,
            "itemsPerPage": 15,
            "skip": 0,
            "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI1OTEyZTllYmRjODNmNmE4YjdkY2JkZTgiLCJ1c2VySWQiOiJVMjAxNzAzMTQyMDE4Iiwicm9sZSI6InBhdGllbnQiLCJleHBpcmVBZnRlciI6MTQ5NzQwNzI2MzgzMywiaWF0IjoxNDk3NDA3MjYzfQ.5UITzg6NaHcIIEQESCLLB7mx_suISw9Bj6K1OBaiaDk"
        }
        $scope.doctorinfos = {};
        Review.GetReviewInfo($scope.review).then(
            function(data) {
                $scope.doctorinfos = data.results;
                for (var i = 0; i < $scope.doctorinfos.length; i++) {
                    if ($scope.doctorinfos[i].reviewStatus == 1) $scope.doctorinfos[i].reviewStatus = "已通过";
                    if ($scope.doctorinfos[i].reviewStatus == 2) $scope.doctorinfos[i].reviewStatus = "已拒绝";
                }
                console.log($scope.doctorinfos);
                console.log(data.nexturl);
                $scope.tableParams = new NgTableParams({
                    count: 15
                }, {
                    counts: [],
                    dataset: $scope.doctorinfos
                });
            },
            function(e) {

            });
        $scope.lastpage = function() {
            if ($scope.review.skip - $scope.review.itemsPerPage >= 0) {
                $scope.review.skip -= $scope.review.itemsPerPage;
                Review.GetReviewInfo($scope.review).then(
                    function(data) {
                        $scope.doctorinfos = data.results;
                        for (var i = 0; i < $scope.doctorinfos.length; i++) {
                            if ($scope.doctorinfos[i].reviewStatus == 1) $scope.doctorinfos[i].reviewStatus = "已通过";
                            if ($scope.doctorinfos[i].reviewStatus == 2) $scope.doctorinfos[i].reviewStatus = "已拒绝";
                        }
                        console.log($scope.doctorinfos);
                        console.log(data.nexturl);
                        $scope.tableParams = new NgTableParams({
                            count: 15
                        }, {
                            counts: [],
                            dataset: $scope.doctorinfos
                        });
                    },
                    function(e) {

                    });
            }
        }
        $scope.nextpage = function() {
            $scope.review.skip += $scope.review.itemsPerPage;
            Review.GetReviewInfo($scope.review).then(
                function(data) {
                    $scope.doctorinfos = data.results;
                    for (var i = 0; i < $scope.doctorinfos.length; i++) {
                        if ($scope.doctorinfos[i].reviewStatus == 1) $scope.doctorinfos[i].reviewStatus = "已通过";
                        if ($scope.doctorinfos[i].reviewStatus == 2) $scope.doctorinfos[i].reviewStatus = "已拒绝";
                    }
                    console.log($scope.doctorinfos);
                    console.log(data.nexturl);
                    $scope.tableParams = new NgTableParams({
                        count: 15
                    }, {
                        counts: [],
                        dataset: $scope.doctorinfos
                    });
                },
                function(e) {

                });
        }
        $scope.getdocId = function(index) {
            Storage.set('docId', $scope.doctorinfos[index].userId);
            Storage.set('reviewstatus', 1);
        }

        $scope.search = function() {
            $scope.review = {
                "reviewStatus": 1,
                "itemsPerPage": 15,
                "skip": 0,
                "name": $scope.doctorname,
                "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI1OTEyZTllYmRjODNmNmE4YjdkY2JkZTgiLCJ1c2VySWQiOiJVMjAxNzAzMTQyMDE4Iiwicm9sZSI6InBhdGllbnQiLCJleHBpcmVBZnRlciI6MTQ5NzQwNzI2MzgzMywiaWF0IjoxNDk3NDA3MjYzfQ.5UITzg6NaHcIIEQESCLLB7mx_suISw9Bj6K1OBaiaDk"
            }
            Review.GetReviewInfo($scope.review).then(
                function(data) {
                    $scope.doctorinfos = data.results;
                    for (var i = 0; i < $scope.doctorinfos.length; i++) {
                        if ($scope.doctorinfos[i].reviewStatus == 1) $scope.doctorinfos[i].reviewStatus = "已通过";
                        if ($scope.doctorinfos[i].reviewStatus == 2) $scope.doctorinfos[i].reviewStatus = "已拒绝";
                    }
                    console.log($scope.doctorname);
                    console.log($scope.review);
                    console.log($scope.doctorinfos);
                    $scope.tableParams = new NgTableParams({
                        count: 15
                    }, {
                        counts: [],
                        dataset: $scope.doctorinfos
                    });
                },
                function(e) {

                })
        }
    }])

.controller('EnterOrNotCtrl', ['$scope', '$state', 'Storage', '$timeout', function($scope, $state, Storage, $timeout) {
        $scope.toentered = function() {
            $state.go('main.enterornot.entered');
        }
        $scope.tounentered = function() {
            $state.go('main.enterornot.unentered');
        }
    }])
    // 未录入
    .controller('UnenteredCtrl', ['$scope', '$state', 'Storage', 'LabtestImport', 'NgTableParams', '$timeout', function($scope, $state, Storage, LabtestImport, NgTableParams, $timeout) {
        $scope.labtestinfos = {};
        $scope.lab = {
            "labtestImportStatus": 0,
            "itemsPerPage": 10,
            "skip": 0,
            "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI1OTEyZTllYmRjODNmNmE4YjdkY2JkZTgiLCJ1c2VySWQiOiJVMjAxNzAzMTQyMDE4Iiwicm9sZSI6InBhdGllbnQiLCJleHBpcmVBZnRlciI6MTQ5NzQwNzI2MzgzMywiaWF0IjoxNDk3NDA3MjYzfQ.5UITzg6NaHcIIEQESCLLB7mx_suISw9Bj6K1OBaiaDk"
        }
        LabtestImport.GetLabtestInfo($scope.lab).then(
            function(data) {
                $scope.labtestinfos = data.results;
                $scope.tableParams = new NgTableParams({
                    count: 15
                }, {
                    counts: [],
                    dataset: $scope.labtestinfos
                });
            },
            function(e) {

            })
        $scope.getpatId = function(index) {
            Storage.set('patId', $scope.labtestinfos[index].userId);
        }
        $scope.lastpage = function() {
            if ($scope.lab.skip - $scope.lab.itemsPerPage >= 0) {
                $scope.lab.skip -= $scope.lab.itemsPerPage;
                LabtestImport.GetLabtestInfo($scope.lab).then(
                    function(data) {
                        $scope.labtestinfos = data.results;
                        console.log($scope.labtestinfos);
                        console.log(data.nexturl);
                        $scope.tableParams = new NgTableParams({
                            count: 15
                        }, {
                            counts: [],
                            dataset: $scope.labtestinfos
                        });
                    },
                    function(e) {

                    });
            }
        }
        $scope.nextpage = function() {
            $scope.lab.skip += $scope.lab.itemsPerPage;
            LabtestImport.GetLabtestInfo($scope.lab).then(
                function(data) {
                    $scope.labtestinfos = data.results;
                    console.log($scope.labtestinfos);
                    console.log(data.nexturl);
                    $scope.tableParams = new NgTableParams({
                        count: 15
                    }, {
                        counts: [],
                        dataset: $scope.labtestinfos
                    });
                },
                function(e) {

                });
        }
        $scope.search = function() {
            $scope.lab = {
                "labtestImportStatus": 0,
                "itemsPerPage": 10,
                "skip": 0,
                "name": $scope.patientname,
                "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI1OTEyZTllYmRjODNmNmE4YjdkY2JkZTgiLCJ1c2VySWQiOiJVMjAxNzAzMTQyMDE4Iiwicm9sZSI6InBhdGllbnQiLCJleHBpcmVBZnRlciI6MTQ5NzQwNzI2MzgzMywiaWF0IjoxNDk3NDA3MjYzfQ.5UITzg6NaHcIIEQESCLLB7mx_suISw9Bj6K1OBaiaDk"
            }
            LabtestImport.GetLabtestInfo($scope.lab).then(
                function(data) {
                    $scope.labtestinfos = data.results;
                    console.log($scope.patientname);
                    console.log($scope.lab);
                    console.log($scope.labtestinfos);
                    $scope.tableParams = new NgTableParams({
                        count: 15
                    }, {
                        counts: [],
                        dataset: $scope.labtestinfos
                    });
                },
                function(e) {

                })
        }
    }])
    // 已录入
    .controller('EnteredCtrl', ['$scope', '$state', 'Storage', 'LabtestImport', 'NgTableParams', '$timeout', function($scope, $state, Storage, LabtestImport, NgTableParams, $timeout) {
        $scope.labtestinfos = {};
        $scope.lab = {
            "labtestImportStatus": 1,
            "itemsPerPage": 10,
            "skip": 0,
            "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI1OTEyZTllYmRjODNmNmE4YjdkY2JkZTgiLCJ1c2VySWQiOiJVMjAxNzAzMTQyMDE4Iiwicm9sZSI6InBhdGllbnQiLCJleHBpcmVBZnRlciI6MTQ5NzQwNzI2MzgzMywiaWF0IjoxNDk3NDA3MjYzfQ.5UITzg6NaHcIIEQESCLLB7mx_suISw9Bj6K1OBaiaDk"
        }
        LabtestImport.GetLabtestInfo($scope.lab).then(
            function(data) {
                $scope.labtestinfos = data.results;
                $scope.tableParams = new NgTableParams({
                    count: 15
                }, {
                    counts: [],
                    dataset: $scope.labtestinfos
                });
            },
            function(e) {

            })
        $scope.getpatId = function(index) {
            Storage.set('patId', $scope.labtestinfos[index].userId);
        }
        $scope.lastpage = function() {
            if ($scope.lab.skip - $scope.lab.itemsPerPage >= 0) {
                $scope.lab.skip -= $scope.lab.itemsPerPage;
                LabtestImport.GetLabtestInfo($scope.lab).then(
                    function(data) {
                        $scope.labtestinfos = data.results;
                        console.log($scope.labtestinfos);
                        console.log(data.nexturl);
                        $scope.tableParams = new NgTableParams({
                            count: 15
                        }, {
                            counts: [],
                            dataset: $scope.labtestinfos
                        });
                    },
                    function(e) {

                    });
            }
        }
        $scope.nextpage = function() {
            $scope.lab.skip += $scope.lab.itemsPerPage;
            LabtestImport.GetLabtestInfo($scope.lab).then(
                function(data) {
                    $scope.labtestinfos = data.results;
                    console.log($scope.labtestinfos);
                    console.log(data.nexturl);
                    $scope.tableParams = new NgTableParams({
                        count: 15
                    }, {
                        counts: [],
                        dataset: $scope.labtestinfos
                    });
                },
                function(e) {

                });
        }
        $scope.search = function() {
            $scope.lab = {
                "labtestImportStatus": 1,
                "itemsPerPage": 10,
                "skip": 0,
                "name": $scope.patientname,
                "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI1OTEyZTllYmRjODNmNmE4YjdkY2JkZTgiLCJ1c2VySWQiOiJVMjAxNzAzMTQyMDE4Iiwicm9sZSI6InBhdGllbnQiLCJleHBpcmVBZnRlciI6MTQ5NzQwNzI2MzgzMywiaWF0IjoxNDk3NDA3MjYzfQ.5UITzg6NaHcIIEQESCLLB7mx_suISw9Bj6K1OBaiaDk"
            }
            LabtestImport.GetLabtestInfo($scope.lab).then(
                function(data) {
                    $scope.labtestinfos = data.results;
                    console.log($scope.patientname);
                    console.log($scope.lab);
                    console.log($scope.labtestinfos);
                    $scope.tableParams = new NgTableParams({
                        count: 15
                    }, {
                        counts: [],
                        dataset: $scope.labtestinfos
                    });
                },
                function(e) {

                })
        }
    }])
    // 信息录入
    .controller('LabInfoCtrl', ['$scope', '$state', 'Storage', 'LabtestImport', 'NgTableParams', '$uibModal', '$timeout', function($scope, $state, Storage, LabtestImport, NgTableParams, $uibModal, $timeout) {
        $scope.Lab = '';
        $scope.Lab.LabType = {
            options: [
                '血肌酐',
                '尿蛋白',
                '血白蛋白',
                '肾小球滤过率'
            ],
            selected: '血肌酐'
        };
        $scope.today = function() {
            $scope.Lab.dt = new Date();
        };
        $scope.today();

        $scope.clear = function() {
            $scope.Lab.dt = null;
        };
        $scope.inlineOptions = {
            customClass: getDayClass,
            minDate: new Date(),
            showWeeks: true
        };

        $scope.dateOptions = {
            // dateDisabled: disabled,
            formatYear: 'yy',
            maxDate: new Date(2020, 5, 22),
            minDate: null,
            startingDay: 1
        };
        // function disabled(data) {
        //    var date = data.date,
        //      mode = data.mode;
        //    return mode === 'day' && (date.getDay() === 0 || date.getDay() === 6);
        // }
        $scope.open = function($index) {
            // console.log($index);
            $scope.popup[$index].opened = true;
        };
        $scope.setDate = function(year, month, day) {
            $scope.Lab.dt = new Date(year, month, day);
        };
        $scope.popup = [
            { opened: false },
            { opened: false },
            { opened: false },
            { opened: false }
        ]

        function getDayClass(data) {
            var date = data.date,
                mode = data.mode;
            if (mode === 'day') {
                var dayToCheck = new Date(date).setHours(0, 0, 0, 0);
                for (var i = 0; i < $scope.events.length; i++) {
                    var currentDay = new Date($scope.events[i].date).setHours(0, 0, 0, 0);
                    if (dayToCheck === currentDay) {
                        return $scope.events[i].status;
                    }
                }
            }
            return '';
        }
        $scope.postBack = [{
            LabType: {
                options: [
                    '血肌酐',
                    '尿蛋白',
                    '血白蛋白',
                    '肾小球滤过率'
                ],
                selected: '血肌酐'
            },
            LabValue: 100,
            dt: ""
        }];
        $scope.Add = function($index) {
            if ($scope.postBack.length < 4) {
                console.log($scope.postBack[$index].dt);
                $scope.postBack.splice($index + 1, 0, {
                    LabType: {
                        options: [
                            '血肌酐',
                            '尿蛋白',
                            '血白蛋白',
                            '肾小球滤过率'
                        ],
                        selected: '血肌酐'
                    },
                    LabValue: 100,
                    dt: ""
                });
            }
        }
        $scope.Remove = function($index) {
            if ($scope.postBack.length > 1)
                $scope.postBack.splice($index, 1);
        }
        $scope.slides = {};
        var patient = {
            'patientId': Storage.get('patId'),
            'token': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI1OTEyZTllYmRjODNmNmE4YjdkY2JkZTgiLCJ1c2VySWQiOiJVMjAxNzAzMTQyMDE4Iiwicm9sZSI6InBhdGllbnQiLCJleHBpcmVBZnRlciI6MTQ5NzQwNzI2MzgzMywiaWF0IjoxNDk3NDA3MjYzfQ.5UITzg6NaHcIIEQESCLLB7mx_suISw9Bj6K1OBaiaDk'
        }
        LabtestImport.GetPhotoList(patient).then(
            function(data) {
                $scope.slides = data.results;
                console.log(patient);
                console.log($scope.slides);
                // console.log($scope.slides[$index]);
                $scope.photoId = {};
                $scope.getphoto = function(index) {
                    $scope.photoId = $scope.slides[index].photoId;

                }
            },
            function(e) {

            })

        LabtestImport.GetPatientLabTest(patient).then(
            function(data) {
                $scope.patientlabtests = data.results;
                for (var i = 0; i < $scope.patientlabtests.length; i++) {
                    switch ($scope.patientlabtests[i].type) {
                        case 'Scr':
                            $scope.patientlabtests[i].type = "血肌酐";
                            break;
                        case 'PRO':
                            $scope.patientlabtests[i].type = "尿蛋白";
                            break;
                        case 'ALB':
                            $scope.patientlabtests[i].type = "血白蛋白";
                            break;
                        case 'GFR':
                            $scope.patientlabtests[i].type = "肾小球滤过率";
                            break;
                        default:
                            break;
                    }
                }
                console.log($scope.patientlabtests);
                $scope.tableParams = new NgTableParams({
                    count: 15
                }, {
                    counts: [],
                    dataset: $scope.patientlabtests
                });
            },
            function(e) {

            })
        $scope.getlabtestId = function(index) {
                Storage.set('labtestId', $scope.patientlabtests[index].labtestId);
                Storage.set('labtype', $scope.patientlabtests[index].type);
                Storage.set('labvalue', $scope.patientlabtests[index].value);
                Storage.set('labdt', $scope.patientlabtests[index].time);
            }
            // $scope.save = function () {
            // var modalInstance = $uibModal.open({
            // animation:true,
            // ariaLabelledBy:'modal-title',
            // ariaDescribedBy:'modal-body',
            // templateUrl:'templates/main/enterornot/save.html',
            // controller:'SaveImportCtrl',
            // // resolve:{
            // //  RejectReason:function () {
            // //    return $scope.RejectReason;
            // //  }
            // // }

        // });
        // }
        $scope.confirm = function() {
            console.log($scope.postBack);
            console.log($scope.photoId);
            for (var i = 0; i < $scope.postBack.length; i++) {
                var date = new Date();
                var insertTime = date.getFullYear() + '-' + (date.getMonth() + 1) + '-' + date.getDate();
                var unit = '';
                var type = '';
                var time = $scope.postBack[i].dt.getFullYear() + '-' + ($scope.postBack[i].dt.getMonth() + 1) + '-' + $scope.postBack[i].dt.getDate();
                switch ($scope.postBack[i].LabType.selected) {
                    case '血肌酐':
                        type = 'Scr';
                        unit = 'umol/L';
                        break;
                    case '尿蛋白':
                        type = 'PRO';
                        unit = 'mg/d';
                        break;
                    case '血白蛋白':
                        type = 'ALB';
                        unit = 'g/L';
                        break;
                    case '肾小球滤过率':
                        type = 'GFR';
                        unit = 'ml/min';
                        break;
                    default:
                        break;
                }
                var params = {
                    "patientId": Storage.get('patId'),
                    "photoId": $scope.photoId,
                    "insertTime": insertTime,
                    "time": time,
                    "type": type,
                    "value": $scope.postBack[i].LabValue,
                    "unit": unit,
                    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI1OTIyZWJlNWI5NGRlMTM5Mjg1NzQ5ZjciLCJ1c2VySWQiOiJVMjAxNzA1MTEwMDAxIiwicm9sZSI6ImhlYWx0aCIsImV4cCI6MTQ5OTY4Nzg2OTI5NSwiaWF0IjoxNDk5Njg0MjY5fQ.p87yOwwsumsi-G5uprWamdSH8_Ij1NgY3XAi1yFdv0U"
                }
                console.log(params);
                LabtestImport.PostLabTestInfo(params).then(
                    function(data) {
                        console.log(data.result);
                    },
                    function(e) {

                    })
            }
            var label = {
                "photoId": $scope.photoId,
                "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI1OTIyZWJlNWI5NGRlMTM5Mjg1NzQ5ZjciLCJ1c2VySWQiOiJVMjAxNzA1MTEwMDAxIiwicm9sZSI6ImhlYWx0aCIsImV4cCI6MTQ5OTY4Nzg2OTI5NSwiaWF0IjoxNDk5Njg0MjY5fQ.p87yOwwsumsi-G5uprWamdSH8_Ij1NgY3XAi1yFdv0U"
            }
            LabtestImport.LabelPhoto(label).then(
                function(data) {
                    console.log(data.results);
                    if (data.results == "图片录入状态修改成功") {
                        $('#myModal').modal('hide');
                    }
                },
                function(e) {

                })
        }
    }])
    // .controller('SaveImportCtrl',['$scope', '$uibModalInstance', function ($scope, $uibModalInstance) {

//   $scope.ok = function () {

//     $uibModalInstance.close();

//   };
//   $scope.cancel = function () {
//     $uibModalInstance.dismiss();
//   };

// }])
// 已录入患者的化验信息
.controller('PatientLabInfoCtrl', ['$scope', '$state', 'Storage', 'LabtestImport', 'NgTableParams', '$timeout', function($scope, $state, Storage, LabtestImport, NgTableParams, $timeout) {
        $scope.patientlabtests = {};
        var patient = {
            "patientId": Storage.get('patId'),
            "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI1OTEyZTllYmRjODNmNmE4YjdkY2JkZTgiLCJ1c2VySWQiOiJVMjAxNzAzMTQyMDE4Iiwicm9sZSI6InBhdGllbnQiLCJleHBpcmVBZnRlciI6MTQ5NzQwNzI2MzgzMywiaWF0IjoxNDk3NDA3MjYzfQ.5UITzg6NaHcIIEQESCLLB7mx_suISw9Bj6K1OBaiaDk"
        }
        LabtestImport.GetPatientLabTest(patient).then(
            function(data) {
                $scope.patientlabtests = data.results;
                for (var i = 0; i < $scope.patientlabtests.length; i++) {
                    switch ($scope.patientlabtests[i].type) {
                        case 'Scr':
                            $scope.patientlabtests[i].type = "血肌酐";
                            break;
                        case 'PRO':
                            $scope.patientlabtests[i].type = "尿蛋白";
                            break;
                        case 'ALB':
                            $scope.patientlabtests[i].type = "血白蛋白";
                            break;
                        case 'GFR':
                            $scope.patientlabtests[i].type = "肾小球滤过率";
                            break;
                        default:
                            break;
                    }
                }
                console.log($scope.patientlabtests);
                $scope.tableParams = new NgTableParams({
                    count: 15
                }, {
                    counts: [],
                    dataset: $scope.patientlabtests
                });
            },
            function(e) {

            })
        $scope.getlabtestId = function(index) {
            Storage.set('labtestId', $scope.patientlabtests[index].labtestId);
            Storage.set('labtype', $scope.patientlabtests[index].type);
            Storage.set('labvalue', $scope.patientlabtests[index].value);
            Storage.set('labdt', $scope.patientlabtests[index].time);
        }
    }])
    // 查看/编辑已录入信息
    .controller('ModifyLabInfoCtrl', ['$scope', '$state', 'Storage', 'LabtestImport', 'NgTableParams', '$timeout', function($scope, $state, Storage, LabtestImport, NgTableParams, $timeout) {
        var type = Storage.get('labtype');
        switch (Storage.get('labtype')) {
            case 'Scr':
                type = '血肌酐';
                break;
            case 'PRO':
                type = '尿蛋白';
                break;
            case 'GFR':
                type = '肾小球滤过率';
                break;
            case 'ALB':
                type = '血白蛋白';
                break;
            default:
                break;
        }
        console.log(Storage.get('labdt'));

        $scope.LabType = {
            options: [
                '血肌酐',
                '尿蛋白',
                '血白蛋白',
                '肾小球滤过率'
            ],
            selected: type
        };
        $scope.LabValue = parseInt(Storage.get('labvalue'));
        console.log($scope.LabValue);
        $scope.today = function() {
            $scope.dt = new Date();
        };
        $scope.today();
        // $scope.dt = Storage.get('labdt');
        console.log($scope.dt);
        $scope.clear = function() {
            $scope.dt = null;
        };
        $scope.inlineOptions = {
            customClass: getDayClass,
            minDate: new Date(),
            showWeeks: true
        };

        $scope.dateOptions = {
            // dateDisabled: disabled,
            formatYear: 'yy',
            maxDate: new Date(2020, 5, 22),
            minDate: null,
            startingDay: 1
        };
        // function disabled(data) {
        //    var date = data.date,
        //      mode = data.mode;
        //    return mode === 'day' && (date.getDay() === 0 || date.getDay() === 6);
        // }
        $scope.open = function() {
            // console.log($index);
            $scope.popup.opened = true;
        };
        $scope.setDate = function(year, month, day) {
            $scope.dt = new Date(year, month, day);
        };
        $scope.popup = {
            opened: false
        }

        function getDayClass(data) {
            var date = data.date,
                mode = data.mode;
            if (mode === 'day') {
                var dayToCheck = new Date(date).setHours(0, 0, 0, 0);
                for (var i = 0; i < $scope.events.length; i++) {
                    var currentDay = new Date($scope.events[i].date).setHours(0, 0, 0, 0);
                    if (dayToCheck === currentDay) {
                        return $scope.events[i].status;
                    }
                }
            }
            return '';
        }
        $scope.photolist = {};
        var labtest = {
            'labtestId': Storage.get('labtestId'),
            'token': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI1OTEyZTllYmRjODNmNmE4YjdkY2JkZTgiLCJ1c2VySWQiOiJVMjAxNzAzMTQyMDE4Iiwicm9sZSI6InBhdGllbnQiLCJleHBpcmVBZnRlciI6MTQ5NzQwNzI2MzgzMywiaWF0IjoxNDk3NDA3MjYzfQ.5UITzg6NaHcIIEQESCLLB7mx_suISw9Bj6K1OBaiaDk'
        }
        LabtestImport.GetPhotobyLabtest(labtest).then(
            function(data) {
                $scope.photolist = data.results;

            },
            function(e) {

            })
        $scope.status = '';
        $scope.modify = function() {
            var unit = '';
            var type = '';
            var time = $scope.dt.getFullYear() + '-' + ($scope.dt.getMonth() + 1) + '-' + $scope.dt.getDate();
            switch ($scope.LabType.selected) {
                case '血肌酐':
                    type = 'Scr';
                    unit = 'umol/L';
                    break;
                case '尿蛋白':
                    type = 'PRO';
                    unit = 'mg/d';
                    break;
                case '血白蛋白':
                    type = 'ALB';
                    unit = 'g/L';
                    break;
                case '肾小球滤过率':
                    type = 'GFR';
                    unit = 'ml/min';
                    break;
                default:
                    break;
            }
            var params = {
                "labtestId": Storage.get('labtestId'),
                "time": time,
                "type": type,
                "value": $scope.LabValue,
                "unit": unit,
                "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI1OTIyZWJlNWI5NGRlMTM5Mjg1NzQ5ZjciLCJ1c2VySWQiOiJVMjAxNzA1MTEwMDAxIiwicm9sZSI6ImhlYWx0aCIsImV4cCI6MTQ5OTY4Nzg2OTI5NSwiaWF0IjoxNDk5Njg0MjY5fQ.p87yOwwsumsi-G5uprWamdSH8_Ij1NgY3XAi1yFdv0U"
            }
            console.log(params);
            LabtestImport.EditResult(params).then(
                function(data) {
                    console.log(data.results);
                    if (data.results == "修改成功") $scope.status = '修改成功';
                },
                function(e) {

                })
        }

    }])




// 用户管理--张桠童
.controller('UserManageCtrl', ['$scope', '$state', 'Storage', '$timeout', function($scope, $state, Storage, $timeout) {
        $scope.toallUsers = function() {
            $state.go('main.usermanage.allUsers');
        }
        $scope.todoctors = function() {
            $state.go('main.usermanage.doctors');
        }
        $scope.tonurses = function() {
            $state.go('main.usermanage.nurses');
        }
        $scope.topatients = function() {
            $state.go('main.usermanage.patients');
        }
        $scope.toinsuranceOfficers = function() {
            $state.go('main.usermanage.insuranceOfficers');
        }
        $scope.tohealthOfficers = function() {
            $state.go('main.usermanage.healthOfficers');
        }
        $scope.toadministrators = function() {
            $state.go('main.usermanage.administrators');
        }
    }])
    // 所有用户--张桠童
    .controller('allUsersCtrl', ['$scope', '$state', 'Storage', 'NgTableParams', '$timeout', '$uibModal', 'Alluser', '$window',
        function($scope, $state, Storage, NgTableParams, $timeout, $uibModal, Alluser, $window) {
            var token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI1OTEyZTllYmRjODNmNmE4YjdkY2JkZTgiLCJ1c2VySWQiOiJVMjAxNzAzMTQyMDE4Iiwicm9sZSI6InBhdGllbnQiLCJleHBpcmVBZnRlciI6MTQ5NzQwNzI2MzgzMywiaWF0IjoxNDk3NDA3MjYzfQ.5UITzg6NaHcIIEQESCLLB7mx_suISw9Bj6K1OBaiaDk';
            // ---------------------------------------分页-------------------------------------------
            // 获取列表总条目
            var countInfo = {
                token: token,
                role: 0
            };
            var promise = Alluser.getCount(countInfo);
            promise.then(function(data) {
                $scope.totalItems = data.results;
            }, function() {});
            // 初始化所有用户列表
            $scope.currentPage = 1;
            $scope.itemsPerPage = 50;
            var userlist = {
                token: token,
                itemsPerPage: $scope.itemsPerPage,
                skip: 0
            };
            var promise = Alluser.getUserList(userlist);
            promise.then(function(data) {
                console.log(data.results);
                $scope.tableParams = new NgTableParams({
                    count: 1000
                }, {
                    counts: [],
                    dataset: data.results
                });
            }, function(err) {});
            // 页面改变
            $scope.pageChanged = function() {
                    console.log($scope.currentPage);
                    console.log($scope.itemsPerPage);
                    // 重新读数据
                    userlist.skip = ($scope.currentPage - 1) * $scope.itemsPerPage;
                    var promise = Alluser.getUserList(userlist);
                    promise.then(function(data) {
                        console.log(data.results);
                        $scope.tableParams = new NgTableParams({
                            count: 1000
                        }, {
                            counts: [],
                            dataset: data.results
                        });
                    }, function(err) {});
                }
                // 当前页面的总条目数改变
            $scope.changeLimit = function(num) {
                    $scope.itemsPerPage = num;
                    $scope.currentPage = 1;
                    // 重新读数据
                    userlist.itemsPerPage = $scope.itemsPerPage;
                    userlist.skip = 0;
                    var promise = Alluser.getUserList(userlist);
                    promise.then(function(data) {
                        console.log(data.results);
                        $scope.tableParams = new NgTableParams({
                            count: 1000
                        }, {
                            counts: [],
                            dataset: data.results
                        });
                    }, function(err) {});
                }
                // 筛选
            $scope.genders = [{ id: 1, title: "男" }, { id: 2, title: "女" }];
            // 注销modal
            $scope.confirm = function(userID) {
                var modalInstance = $uibModal.open({
                    animation: true,
                    ariaLabelledBy: 'modal-title',
                    ariaDescribedBy: 'modal-body',
                    templateUrl: 'confirm.html',
                    controller: 'confirmCtrl',
                    size: 'sm',
                    resolve: {
                        userID: function() {
                            return userID;
                        }
                    }
                });
                modalInstance.result.then(function() {
                    var cancelUserinfo = {
                        "userId": userID,
                        "token": token
                    };
                    var promise = Alluser.cancelUser(cancelUserinfo);
                    promise.then(function(data) {
                        // console.log(data);
                        if (data.msg == "success!") {
                            $('#confirmSuccess').modal('show');
                            $timeout(function() {
                                $('#confirmSuccess').modal('hide');
                                // 刷新所有用户列表
                                $scope.currentPage = 1;
                                userlist.skip = 0;
                                var promise = Alluser.getUserList(userlist);
                                promise.then(function(data) {
                                    console.log(data.results);
                                    $scope.tableParams = new NgTableParams({
                                        count: 1000
                                    }, {
                                        counts: [],
                                        dataset: data.results
                                    });
                                }, function(err) {});
                            }, 1000);
                        }
                    }, function(err) {});
                }, function() {});
            };
        }
    ])
    // 所有用户--注销modal--张桠童
    .controller('confirmCtrl', ['$scope', '$state', 'Storage', 'NgTableParams', '$timeout', '$uibModal', 'Alluser', '$uibModalInstance', 'userID',
        function($scope, $state, Storage, NgTableParams, $timeout, $uibModal, Alluser, $uibModalInstance, userID) {
            $scope.close = function() {
                $uibModalInstance.dismiss();
            };
            $scope.ok = function() {
                $uibModalInstance.close();
            };
        }
    ])
    // 医生--张桠童
    .controller('doctorsCtrl', ['$scope', '$state', 'Storage', 'NgTableParams', '$timeout', '$uibModal', 'Alluser', 'Roles',
        function($scope, $state, Storage, NgTableParams, $timeout, $uibModal, Alluser, Roles) {
            var token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI1OTEyZTllYmRjODNmNmE4YjdkY2JkZTgiLCJ1c2VySWQiOiJVMjAxNzAzMTQyMDE4Iiwicm9sZSI6InBhdGllbnQiLCJleHBpcmVBZnRlciI6MTQ5NzQwNzI2MzgzMywiaWF0IjoxNDk3NDA3MjYzfQ.5UITzg6NaHcIIEQESCLLB7mx_suISw9Bj6K1OBaiaDk';
            // // ---------------------------------------分页-------------------------------------------
            //    // 获取列表总条目
            //    var countInfo = {
            //      token:token,
            //      role:1
            //    };
            //    var promise = Alluser.getCount(countInfo);
            //    promise.then(function(data){
            //      console.log(data.results)
            //      $scope.totalItems = data.results;
            //    },function(){});
            //    // 初始化所有用户列表
            //    $scope.currentPage = 1;
            //    $scope.itemsPerPage = 50;
            //    var userlist = {
            //      token:token,
            //      itemsPerPage:$scope.itemsPerPage,
            //      skip:0
            //    };
            // var promise = Alluser.getDoctorList(userlist);
            //    promise.then(function(data){
            //        console.log(data.results);
            //        $scope.tableParams = new NgTableParams({
            //                        count:1000
            //                    },
            //                    {   counts:[],
            //                        dataset: data.results
            //                    });
            //    },function(err){});
            //    // 页面改变
            //    $scope.pageChanged = function(){
            //      console.log($scope.currentPage);
            //      console.log($scope.itemsPerPage);
            //      // 重新读数据
            //      userlist.skip = ($scope.currentPage-1)*$scope.itemsPerPage;
            //      var promise = Alluser.getUserList(userlist);
            //     promise.then(function(data){
            //         console.log(data.results);
            //         $scope.tableParams = new NgTableParams({
            //                          count:1000
            //                      },
            //                      {   counts:[],
            //                          dataset: data.results
            //                      });
            //     },function(err){});
            //    }
            //    // 当前页面的总条目数改变
            // $scope.changeLimit=function(num){
            //  $scope.itemsPerPage = num;
            //      $scope.currentPage = 1;
            //      // 重新读数据
            //      userlist.itemsPerPage = $scope.itemsPerPage;
            //      userlist.skip = 0;
            //      var promise = Alluser.getUserList(userlist);
            //     promise.then(function(data){
            //         console.log(data.results);
            //         $scope.tableParams = new NgTableParams({
            //                          count:1000
            //                      },
            //                      {   counts:[],
            //                          dataset: data.results
            //                      });
            //     },function(err){});
            // }
            // 读取医生列表
            var promise = Alluser.getDoctorList(token);
            promise.then(function(data) {
                // console.log(data.results);
                // 首先处理一下要显示的roles
                for (var i = 0; i < data.results.length; i++) {
                    var roles = data.results[i].role;
                    for (var j = 0; j < roles.length; j++) {
                        if (roles[j] == "Leader") {
                            data.results[i].role = "Leader";
                        }
                        if (roles[j] == "master") {
                            data.results[i].role = "master";
                        }
                        if (roles[j] == "doctor") {
                            data.results[i].role = "doctor";
                        }
                    }
                }
                $scope.tableParams = new NgTableParams({
                    count: 50
                }, {
                    counts: [10, 20, 50, 100],
                    dataset: data.results
                });
            }, function(err) {});
            // 性别筛选--对应前端ng-table功能
            $scope.genders = [{ id: 1, title: "男" }, { id: 2, title: "女" }];
            // 关闭modal控制
            $scope.modal_close = function(target) {
                $(target).modal('hide');
            };
            //详细信息modal
            $scope.openDetail = function(userdetail) {
                // console.log(userdetail);
                var modalInstance = $uibModal.open({
                    animation: true,
                    ariaLabelledBy: 'modal-title',
                    ariaDescribedBy: 'modal-body',
                    templateUrl: 'detail_doctor.html',
                    controller: 'detail_doctorCtrl',
                    // size: 'sm',
                    resolve: {
                        userdetail: function() {
                            return userdetail;
                        }
                    }
                });
                modalInstance.result.then(function(con) {
                    if (con == "注销用户") {
                        // 确认是否注销
                        $("#cancelOrNot").modal('show');
                        // 给modal传参
                        $scope.userdetail = userdetail;
                    } else if (con == "去除角色") {
                        // 确认是否去除角色
                        $("#removeOrNot").modal('show');
                        // 给modal传参
                        $scope.userdetail = userdetail;
                    }
                }, function() {});
            };
            // 注销用户
            $scope.cancel = function(userdetail) {
                // 关闭警告modal（是否注销）
                $("#cancelOrNot").modal('hide');
                // 注销用户输入
                var cancelUserinfo = {
                    "userId": userdetail.userId,
                    "token": token
                };
                // 注销该用户
                var promise = Alluser.cancelUser(cancelUserinfo);
                promise.then(function(data) {
                    // console.log(data);
                    if (data.msg == "success!") {
                        // 提示注销成功
                        $('#cancelSuccess').modal('show');
                        $timeout(function() {
                            // 关闭提示
                            $('#cancelSuccess').modal('hide');
                            // 刷新医生列表
                            var promise = Alluser.getDoctorList(token);
                            promise.then(function(data) {
                                // console.log(data.results);
                                // 首先处理一下要显示的roles
                                for (var i = 0; i < data.results.length; i++) {
                                    var roles = data.results[i].role;
                                    for (var j = 0; j < roles.length; j++) {
                                        if (roles[j] == "Leader") {
                                            data.results[i].role = "Leader";
                                        }
                                        if (roles[j] == "master") {
                                            data.results[i].role = "master";
                                        }
                                        if (roles[j] == "doctor") {
                                            data.results[i].role = "doctor";
                                        }
                                    }
                                }
                                $scope.tableParams = new NgTableParams({
                                    count: 50
                                }, {
                                    counts: [10, 20, 50, 100],
                                    dataset: data.results
                                });
                            }, function(err) {});
                        }, 1000);
                    }
                }, function(err) {});
            };
            // 去除角色
            $scope.remove = function(userdetail) {
                // 关闭警告（是否去除角色）
                $("#removeOrNot").modal('hide');
                // 去除角色方法输入
                var removeInfo = {
                    "userId": userdetail.userId,
                    "roles": userdetail.role,
                    "token": token
                };
                // 去除该角色
                var promise = Roles.removeRoles(removeInfo);
                promise.then(function(data) {
                    // console.log(data);
                    if (data.mesg == "User Register Success!") {
                        // 提示去除成功
                        $('#removeSuccess').modal('show');
                        $timeout(function() {
                            // 关闭提示
                            $('#removeSuccess').modal('hide');
                            // 刷新医生列表
                            var promise = Alluser.getDoctorList(token);
                            promise.then(function(data) {
                                // console.log(data.results);
                                // 首先处理一下要显示的roles
                                for (var i = 0; i < data.results.length; i++) {
                                    var roles = data.results[i].role;
                                    for (var j = 0; j < roles.length; j++) {
                                        if (roles[j] == "Leader") {
                                            data.results[i].role = "Leader";
                                        }
                                        if (roles[j] == "master") {
                                            data.results[i].role = "master";
                                        }
                                        if (roles[j] == "doctor") {
                                            data.results[i].role = "doctor";
                                        }
                                    }
                                }
                                $scope.tableParams = new NgTableParams({
                                    count: 50
                                }, {
                                    counts: [10, 20, 50, 100],
                                    dataset: data.results
                                });
                            }, function(err) {});
                        }, 1000);
                    };
                }, function(err) {});
            };
        }
    ])
    // 医生--详细信息modal--张桠童
    .controller('detail_doctorCtrl', ['$scope', '$state', 'Storage', 'NgTableParams', '$timeout', '$uibModal', 'Alluser', '$uibModalInstance', 'userdetail',
        function($scope, $state, Storage, NgTableParams, $timeout, $uibModal, Alluser, $uibModalInstance, userdetail) {
            // console.log(userdetail);
            $scope.doctorInfo = userdetail;
            // 关闭modal
            $scope.close = function() {
                $uibModalInstance.dismiss();
            };
            // 注销用户
            $scope.cancelUser = function() {
                $uibModalInstance.close("注销用户");
            };
            // 去除角色
            $scope.removeUserRoles = function() {
                $uibModalInstance.close("去除角色");
            };
        }
    ])
    // 护士--张桠童
    .controller('nursesCtrl', ['$scope', '$state', 'Storage', 'NgTableParams', '$timeout', '$uibModal', 'Alluser', 'Roles',
        function($scope, $state, Storage, NgTableParams, $timeout, $uibModal, Alluser, Roles) {
            var token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI1OTEyZTllYmRjODNmNmE4YjdkY2JkZTgiLCJ1c2VySWQiOiJVMjAxNzAzMTQyMDE4Iiwicm9sZSI6InBhdGllbnQiLCJleHBpcmVBZnRlciI6MTQ5NzQwNzI2MzgzMywiaWF0IjoxNDk3NDA3MjYzfQ.5UITzg6NaHcIIEQESCLLB7mx_suISw9Bj6K1OBaiaDk';
            // 读取护士列表
            var promise = Alluser.getNurseList(token);
            promise.then(function(data) {
                // console.log(data.results);
                $scope.tableParams = new NgTableParams({
                    count: 50
                }, {
                    counts: [10, 20, 50, 100],
                    dataset: data.results
                });
            }, function(err) {});
            // 前端筛选
            $scope.genders = [{ id: 1, title: "男" }, { id: 2, title: "女" }];
            // 关闭modal控制
            $scope.modal_close = function(target) {
                $(target).modal('hide');
            };
            //详细信息modal
            $scope.openDetail = function(userdetail) {
                var modalInstance = $uibModal.open({
                    animation: true,
                    ariaLabelledBy: 'modal-title',
                    ariaDescribedBy: 'modal-body',
                    templateUrl: 'detail_nurse.html',
                    controller: 'detail_nurseCtrl',
                    // size: 'sm',
                    resolve: {
                        userdetail: function() {
                            return userdetail;
                        }
                    }
                });
                modalInstance.result.then(function(con) {
                    if (con == "注销用户") {
                        // 确认是否注销
                        $("#cancelOrNot").modal('show');
                        // 给modal传参
                        $scope.userdetail = userdetail;
                    } else if (con == "去除角色") {
                        // 确认是否去除角色
                        $("#removeOrNot").modal('show');
                        // 给modal传参
                        $scope.userdetail = userdetail;
                    }
                }, function() {});
            };
            // 注销用户
            $scope.cancel = function(userdetail) {
                // 关闭警告modal（是否注销）
                $("#cancelOrNot").modal('hide');
                // 注销用户输入
                var cancelUserinfo = {
                    "userId": userdetail.userId,
                    "token": token
                };
                // 注销该用户
                var promise = Alluser.cancelUser(cancelUserinfo);
                promise.then(function(data) {
                    // console.log(data);
                    if (data.msg == "success!") {
                        // 提示注销成功
                        $('#cancelSuccess').modal('show');
                        $timeout(function() {
                            // 关闭提示
                            $('#cancelSuccess').modal('hide');
                            // 刷新护士列表
                            var promise = Alluser.getNurseList(token);
                            promise.then(function(data) {
                                // console.log(data.results);
                                $scope.tableParams = new NgTableParams({
                                    count: 50
                                }, {
                                    counts: [10, 20, 50, 100],
                                    dataset: data.results
                                });
                            }, function(err) {});
                        }, 1000);
                    }
                }, function(err) {});
            };
            // 去除角色
            $scope.remove = function(userdetail) {
                // 关闭警告（是否去除角色）
                $("#removeOrNot").modal('hide');
                // 去除角色方法输入
                var removeInfo = {
                    "userId": userdetail.userId,
                    "roles": "nurse",
                    "token": token
                };
                // 去除该角色
                var promise = Roles.removeRoles(removeInfo);
                promise.then(function(data) {
                    // console.log(data);
                    if (data.mesg == "User Register Success!") {
                        // 提示去除成功
                        $('#removeSuccess').modal('show');
                        $timeout(function() {
                            // 关闭提示
                            $('#removeSuccess').modal('hide');
                            // 刷新护士列表
                            var promise = Alluser.getNurseList(token);
                            promise.then(function(data) {
                                // console.log(data.results);
                                $scope.tableParams = new NgTableParams({
                                    count: 50
                                }, {
                                    counts: [10, 20, 50, 100],
                                    dataset: data.results
                                });
                            }, function(err) {});
                        }, 1000);
                    };
                }, function(err) {});
            };
        }
    ])
    // 护士--详细信息modal--张桠童
    .controller('detail_nurseCtrl', ['$scope', '$state', 'Storage', 'NgTableParams', '$timeout', '$uibModal', 'Alluser', '$uibModalInstance', 'userdetail',
        function($scope, $state, Storage, NgTableParams, $timeout, $uibModal, Alluser, $uibModalInstance, userdetail) {
            // console.log(userdetail);
            $scope.nurseInfo = userdetail;
            // 关闭modal
            $scope.close = function() {
                $uibModalInstance.dismiss();
            };
            // 注销用户
            $scope.cancelUser = function() {
                $uibModalInstance.close("注销用户");
            };
            // 去除角色
            $scope.removeUserRoles = function() {
                $uibModalInstance.close("去除角色");
            };
        }
    ])
    // 患者--张桠童
    .controller('patientsCtrl', ['$scope', '$state', 'Storage', 'NgTableParams', '$timeout', '$uibModal', 'Alluser', 'Roles',
        function($scope, $state, Storage, NgTableParams, $timeout, $uibModal, Alluser, Roles) {
            var token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI1OTEyZTllYmRjODNmNmE4YjdkY2JkZTgiLCJ1c2VySWQiOiJVMjAxNzAzMTQyMDE4Iiwicm9sZSI6InBhdGllbnQiLCJleHBpcmVBZnRlciI6MTQ5NzQwNzI2MzgzMywiaWF0IjoxNDk3NDA3MjYzfQ.5UITzg6NaHcIIEQESCLLB7mx_suISw9Bj6K1OBaiaDk';
            // 读取患者列表
            var promise = Alluser.getPatientList(token);
            promise.then(function(data) {
                // console.log(data.results);
                $scope.tableParams = new NgTableParams({
                    count: 50
                }, {
                    counts: [10, 20, 50, 100],
                    dataset: data.results
                });
            }, function(err) {});
            // 前端筛选
            $scope.genders = [{ id: 1, title: "男" }, { id: 2, title: "女" }];
            $scope.bloodTypes = [{ id: 1, title: "A型" },
                { id: 2, title: "B型" },
                { id: 3, title: "AB型" },
                { id: 4, title: "O型" },
                { id: 5, title: "不确定" }
            ];
            $scope.hypertensions = [{ id: 1, title: "是" }, { id: 2, title: "否" }];
            $scope.classnames = [{ id: "class_1", title: "肾移植" },
                { id: "class_2", title: "CKD1-2期" },
                { id: "class_3", title: "CKD3-4期" },
                { id: "class_4", title: "CDK5期未透析" },
                { id: "class_6", title: "腹透" },
                { id: "class_5", title: "血透" }
            ];
            // 关闭modal控制
            $scope.modal_close = function(target) {
                $(target).modal('hide');
            };
            //详细信息modal
            $scope.openDetail = function(userdetail) {
                var modalInstance = $uibModal.open({
                    animation: true,
                    ariaLabelledBy: 'modal-title',
                    ariaDescribedBy: 'modal-body',
                    templateUrl: 'detail_patient.html',
                    controller: 'detail_patientCtrl',
                    // size: 'sm',
                    resolve: {
                        userdetail: function() {
                            return userdetail;
                        }
                    }
                });
                modalInstance.result.then(function(con) {
                    if (con == "注销用户") {
                        // 确认是否注销
                        $("#cancelOrNot").modal('show');
                        // 给modal传参
                        $scope.userdetail = userdetail;
                    } else if (con == "去除角色") {
                        // 确认是否去除角色
                        $("#removeOrNot").modal('show');
                        // 给modal传参
                        $scope.userdetail = userdetail;
                    }
                }, function() {});
            };
            // 注销用户
            $scope.cancel = function(userdetail) {
                // 关闭警告modal（是否注销）
                $("#cancelOrNot").modal('hide');
                // 注销用户输入
                var cancelUserinfo = {
                    "userId": userdetail.userId,
                    "token": token
                };
                // 注销该用户
                var promise = Alluser.cancelUser(cancelUserinfo);
                promise.then(function(data) {
                    // console.log(data);
                    if (data.msg == "success!") {
                        // 提示注销成功
                        $('#cancelSuccess').modal('show');
                        $timeout(function() {
                            // 关闭提示
                            $('#cancelSuccess').modal('hide');
                            // 刷新患者列表
                            var promise = Alluser.getPatientList(token);
                            promise.then(function(data) {
                                // console.log(data.results);
                                $scope.tableParams = new NgTableParams({
                                    count: 50
                                }, {
                                    counts: [10, 20, 50, 100],
                                    dataset: data.results
                                });
                            }, function(err) {});
                        }, 1000);
                    }
                }, function(err) {});
            };
            // 去除角色
            $scope.remove = function(userdetail) {
                // 关闭警告（是否去除角色）
                $("#removeOrNot").modal('hide');
                // 去除角色方法输入
                var removeInfo = {
                    "userId": userdetail.userId,
                    "roles": "patient",
                    "token": token
                };
                // 去除该角色
                var promise = Roles.removeRoles(removeInfo);
                promise.then(function(data) {
                    // console.log(data);
                    if (data.mesg == "User Register Success!") {
                        // 提示去除成功
                        $('#removeSuccess').modal('show');
                        $timeout(function() {
                            // 关闭提示
                            $('#removeSuccess').modal('hide');
                            // 刷新患者列表
                            var promise = Alluser.getPatientList(token);
                            promise.then(function(data) {
                                // console.log(data.results);
                                $scope.tableParams = new NgTableParams({
                                    count: 50
                                }, {
                                    counts: [10, 20, 50, 100],
                                    dataset: data.results
                                });
                            }, function(err) {});
                        }, 1000);
                    };
                }, function(err) {});
            };
        }
    ])
    // 患者--详细信息modal--张桠童
    .controller('detail_patientCtrl', ['$scope', '$state', 'Storage', 'NgTableParams', '$timeout', '$uibModal', 'Alluser', '$uibModalInstance', 'userdetail',
        function($scope, $state, Storage, NgTableParams, $timeout, $uibModal, Alluser, $uibModalInstance, userdetail) {
            // console.log(userdetail);
            $scope.patientInfo = userdetail;
            // 关闭modal
            $scope.close = function() {
                $uibModalInstance.dismiss();
            };
            // 注销用户
            $scope.cancelUser = function() {
                $uibModalInstance.close("注销用户");
            };
            // 去除角色
            $scope.removeUserRoles = function() {
                $uibModalInstance.close("去除角色");
            };
        }
    ])
    // 保险人员--张桠童
    .controller('insuranceOfficersCtrl', ['$scope', '$state', 'Storage', 'NgTableParams', '$timeout', '$uibModal', 'Alluser', 'Roles',
        function($scope, $state, Storage, NgTableParams, $timeout, $uibModal, Alluser, Roles) {
            var token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI1OTEyZTllYmRjODNmNmE4YjdkY2JkZTgiLCJ1c2VySWQiOiJVMjAxNzAzMTQyMDE4Iiwicm9sZSI6InBhdGllbnQiLCJleHBpcmVBZnRlciI6MTQ5NzQwNzI2MzgzMywiaWF0IjoxNDk3NDA3MjYzfQ.5UITzg6NaHcIIEQESCLLB7mx_suISw9Bj6K1OBaiaDk';
            // 读取保险人员列表
            var promise = Alluser.getInsuranceList(token);
            promise.then(function(data) {
                // console.log(data.results);
                // 首先处理一下要显示的roles
                for (var i = 0; i < data.results.length; i++) {
                    var roles = data.results[i].role;
                    for (var j = 0; j < roles.length; j++) {
                        if (roles[j] == "insuranceA") {
                            data.results[i].role = "insuranceA";
                        }
                        if (roles[j] == "insuranceR") {
                            data.results[i].role = "insuranceR";
                        }
                        if (roles[j] == "insuranceC") {
                            data.results[i].role = "insuranceC";
                        }
                    }
                }
                $scope.tableParams = new NgTableParams({
                    count: 50
                }, {
                    counts: [10, 20, 50, 100],
                    dataset: data.results
                });
            }, function(err) {});
            // 筛选性别
            $scope.genders = [{ id: 1, title: "男" }, { id: 2, title: "女" }];
            // 监听事件(表单清空)
            $('#new_register').on('hidden.bs.modal', function() {
                $('#registerForm').formValidation('resetForm', true);
                $scope.registerInfo.phoneNo = undefined;
                $scope.registerInfo.password = undefined;
                $scope.registerInfo.role = undefined;
            })
            $('#new_perfect').on('hidden.bs.modal', function() {
                $('#perfectForm').formValidation('resetForm', true);
                $scope.newUserInfo.userId = undefined;
                $scope.newUserInfo.gender = undefined;
                $scope.newUserInfo.boardingTime = undefined;
                $scope.newUserInfo.workAmounts = undefined;
                $scope.newUserInfo.name = undefined;
            })
            $('#new_add').on('hidden.bs.modal', function() {
                $scope.userlist.name = undefined;
                $scope.addInfo.userId = undefined;
                $scope.addInfo.roles = undefined;
                $scope.userlist_search = undefined;
                $scope.flag = false;
            })
            $('#changeInfo').on('hidden.bs.modal', function() {
                    $('#changeForm').formValidation('resetForm', true);
                })
                // 关闭modal控制
            $scope.modal_close = function(target) {
                $(target).modal('hide');
                if (target == "#new_perfect" || target == "#changeInfo") {
                    var promise = Alluser.getInsuranceList(token);
                    promise.then(function(data) {
                        // console.log(data.results);
                        for (var i = 0; i < data.results.length; i++) {
                            var roles = data.results[i].role;
                            for (var j = 0; j < roles.length; j++) {
                                if (roles[j] == "insuranceA") {
                                    data.results[i].role = "insuranceA";
                                }
                                if (roles[j] == "insuranceR") {
                                    data.results[i].role = "insuranceR";
                                }
                                if (roles[j] == "insuranceC") {
                                    data.results[i].role = "insuranceC";
                                }
                            }
                        }
                        $scope.tableParams = new NgTableParams({
                            count: 50
                        }, {
                            counts: [10, 20, 50, 100],
                            dataset: data.results
                        });
                    }, function(err) {});
                };
                if (target == "#new_add") {
                    $scope.flag = false;
                };
            };
            //注册新用户
            $scope.registerInfo = {};
            $scope.newUserInfo = {};
            $scope.register = function() {
                // console.log($scope.registerInfo.phoneNo);
                if ($scope.registerInfo.phoneNo != undefined && $scope.registerInfo.password != undefined && $scope.registerInfo.role != undefined) {
                    var promise = Alluser.register($scope.registerInfo);
                    promise.then(function(data) {
                        // console.log(data);
                        // 注册成功
                        if (data.mesg == "Alluser Register Success!") {
                            // 获取userId
                            $scope.newUserInfo.userId = data.userNo;
                            // 关闭注册modal
                            $('#new_register').modal('hide');
                            // 提示注册成功
                            $('#registerSuccess').modal('show');
                            $timeout(function() {
                                // 提示完毕
                                $('#registerSuccess').modal('hide');
                                // 打开完善信息modal
                                $('#new_perfect').modal('show');
                            }, 1000);
                        }
                        // 注册失败(该用户已存在)
                        else {
                            // 提示注册失败
                            $('#registerFailed').modal('show');
                            $timeout(function() {
                                $('#registerFailed').modal('hide');
                            }, 1000);
                        }
                    }, function(err) {});
                }
            };
            // 完善新用户信息
            $scope.perfect = function() {
                $scope.newUserInfo.token = token;
                $scope.newUserInfo.gender = parseInt($scope.newUserInfo.gender);
                // console.log($scope.newUserInfo);
                if ($scope.newUserInfo.userId != undefined && $scope.newUserInfo.gender != undefined && $scope.newUserInfo.boardingTime != undefined && $scope.newUserInfo.workAmounts != undefined && $scope.newUserInfo.name != undefined && $scope.newUserInfo.token != undefined) {
                    // 关闭完善信息modal
                    $('#new_perfect').modal('hide');
                    var promise = Alluser.modify($scope.newUserInfo);
                    promise.then(function(data) {
                        // console.log(data);
                        if (data.msg == "success!") {
                            // 提示完善成功
                            $('#perfectSuccess').modal('show');
                            $timeout(function() {
                                $('#perfectSuccess').modal('hide');
                                // 提示完毕，刷新保险人员列表
                                var promise = Alluser.getInsuranceList(token);
                                promise.then(function(data) {
                                    // console.log(data.results);
                                    // 首先处理一下要显示的roles
                                    for (var i = 0; i < data.results.length; i++) {
                                        var roles = data.results[i].role;
                                        for (var j = 0; j < roles.length; j++) {
                                            if (roles[j] == "insuranceA") {
                                                data.results[i].role = "insuranceA";
                                            }
                                            if (roles[j] == "insuranceR") {
                                                data.results[i].role = "insuranceR";
                                            }
                                            if (roles[j] == "insuranceC") {
                                                data.results[i].role = "insuranceC";
                                            }
                                        }
                                    }
                                    $scope.tableParams = new NgTableParams({
                                        count: 50
                                    }, {
                                        counts: [10, 20, 50, 100],
                                        dataset: data.results
                                    });
                                }, function(err) {});
                            }, 1000);
                        }
                    }, function(err) {});
                }
            };
            // 搜索用户
            $scope.userlist = {};
            $scope.userlist.token = token;
            $scope.searchUser = function() {
                // console.log($scope.userlist.name);
                if ($scope.userlist.name == undefined) {
                    $('#nameUndefined').modal('show');
                    $timeout(function() {
                        $('#nameUndefined').modal('hide');
                    }, 1000);
                } else {
                    $scope.flag = true;
                    var promise = Alluser.getUserList($scope.userlist);
                    promise.then(function(data) {
                        // console.log(data.results);
                        $scope.userlist_search = data.results;
                        // $scope.userId = "";
                    }, function(err) {});
                }
            };
            // 添加角色
            $scope.addInfo = {};
            $scope.addRole = function() {
                // console.log($scope.addInfo.userId);
                // console.log($scope.addInfo.roles);
                if ($scope.addInfo.userId == undefined) {
                    $('#userIdUndefined').modal('show');
                    $timeout(function() {
                        $('#userIdUndefined').modal('hide');
                    }, 1000);
                } else if ($scope.addInfo.roles == undefined) {
                    $('#rolesUndefined').modal('show');
                    $timeout(function() {
                        $('#rolesUndefined').modal('hide');
                    }, 1000);
                } else {
                    // 关闭添加角色modal
                    $('#new_add').modal('hide');
                    // 增加角色
                    $scope.addInfo.token = token;
                    var promise = Roles.addRoles($scope.addInfo);
                    promise.then(function(data) {
                        console.log(data.mesg);
                        if (data.mesg == "User Register Success!") {
                            // 提示添加成功
                            $('#addSuccess').modal('show');
                            $timeout(function() {
                                // 提示完毕，刷新保险人员列表
                                $('#addSuccess').modal('hide');
                                var promise = Alluser.getInsuranceList(token);
                                promise.then(function(data) {
                                    // console.log(data.results);
                                    for (var i = 0; i < data.results.length; i++) {
                                        var roles = data.results[i].role;
                                        for (var j = 0; j < roles.length; j++) {
                                            if (roles[j] == "insuranceA") {
                                                data.results[i].role = "insuranceA";
                                            }
                                            if (roles[j] == "insuranceR") {
                                                data.results[i].role = "insuranceR";
                                            }
                                            if (roles[j] == "insuranceC") {
                                                data.results[i].role = "insuranceC";
                                            }
                                        }
                                    }
                                    $scope.tableParams = new NgTableParams({
                                        count: 50
                                    }, {
                                        counts: [10, 20, 50, 100],
                                        dataset: data.results
                                    });
                                }, function(err) {});
                            }, 1000);
                        } else {
                            // 提示添加失败
                            $('#addFailed').modal('show');
                            $timeout(function() {
                                $('#addFailed').modal('hide');
                            }, 1000);
                        }
                    }, function(err) {});
                }
            };
            //详细信息modal
            $scope.openDetail = function(userdetail) {
                var modalInstance = $uibModal.open({
                    animation: true,
                    ariaLabelledBy: 'modal-title',
                    ariaDescribedBy: 'modal-body',
                    templateUrl: 'detail_insurance.html',
                    controller: 'detail_insuranceCtrl',
                    // size: 'sm',
                    resolve: {
                        userdetail: function() {
                            return userdetail;
                        }
                    }
                });
                modalInstance.result.then(function(con) {
                    if (con == "删除用户") {
                        // 确认是否删除
                        $("#cancelOrNot").modal('show');
                        // 给modal传参
                        $scope.userdetail = userdetail;
                    } else if (con == "去除角色") {
                        // 确认是否去除角色
                        $("#removeOrNot").modal('show');
                        // 给modal传参
                        $scope.userdetail = userdetail;
                    } else if (con == "修改信息") {
                        // 修改用户信息方法的输入
                        $scope.changeInfo = userdetail;
                        $scope.changeInfo.token = token;
                        // 打开修改保险人员信息modal
                        $('#changeInfo').modal('show');

                    }
                }, function() {});
            };
            // 删除用户
            $scope.cancel = function(userdetail) {
                // 关闭警告modal（是否删除）
                $("#cancelOrNot").modal('hide');
                // 删除用户输入
                var cancelUserinfo = {
                    "userId": userdetail.userId,
                    "token": token
                };
                // 删除该用户
                var promise = Alluser.cancelUser(cancelUserinfo);
                promise.then(function(data) {
                    // console.log(data);
                    if (data.msg == "success!") {
                        // 提示删除成功
                        $('#cancelSuccess').modal('show');
                        $timeout(function() {
                            // 关闭提示
                            $('#cancelSuccess').modal('hide');
                            // 刷新保险人员列表
                            var promise = Alluser.getInsuranceList(token);
                            promise.then(function(data) {
                                // console.log(data.results);
                                // 首先处理一下要显示的roles
                                for (var i = 0; i < data.results.length; i++) {
                                    var roles = data.results[i].role;
                                    for (var j = 0; j < roles.length; j++) {
                                        if (roles[j] == "insuranceA") {
                                            data.results[i].role = "insuranceA";
                                        }
                                        if (roles[j] == "insuranceR") {
                                            data.results[i].role = "insuranceR";
                                        }
                                        if (roles[j] == "insuranceC") {
                                            data.results[i].role = "insuranceC";
                                        }
                                    }
                                };
                                $scope.tableParams = new NgTableParams({
                                    count: 50
                                }, {
                                    counts: [10, 20, 50, 100],
                                    dataset: data.results
                                });
                            }, function(err) {});
                        }, 1000);
                    }
                }, function(err) {});
            };
            // 去除角色
            $scope.remove = function(userdetail) {
                // 关闭警告（是否去除角色）
                $("#removeOrNot").modal('hide');
                // 去除角色方法输入
                var removeInfo = {
                    "userId": userdetail.userId,
                    "roles": userdetail.role,
                    "token": token
                };
                // 去除该角色
                var promise = Roles.removeRoles(removeInfo);
                promise.then(function(data) {
                    // console.log(data);
                    if (data.mesg == "User Register Success!") {
                        // 提示去除成功
                        $('#removeSuccess').modal('show');
                        $timeout(function() {
                            // 关闭提示
                            $('#removeSuccess').modal('hide');
                            // 刷新保险人员列表
                            var promise = Alluser.getInsuranceList(token);
                            promise.then(function(data) {
                                // console.log(data.results);
                                // 首先处理一下要显示的roles
                                for (var i = 0; i < data.results.length; i++) {
                                    var roles = data.results[i].role;
                                    for (var j = 0; j < roles.length; j++) {
                                        if (roles[j] == "insuranceA") {
                                            data.results[i].role = "insuranceA";
                                        }
                                        if (roles[j] == "insuranceR") {
                                            data.results[i].role = "insuranceR";
                                        }
                                        if (roles[j] == "insuranceC") {
                                            data.results[i].role = "insuranceC";
                                        }
                                    }
                                };
                                $scope.tableParams = new NgTableParams({
                                    count: 50
                                }, {
                                    counts: [10, 20, 50, 100],
                                    dataset: data.results
                                });
                            }, function(err) {});
                        }, 1000);
                    };
                }, function(err) {});
            };
            // 修改用户信息
            $scope.change = function() {
                if ($scope.changeInfo.userId != undefined && $scope.changeInfo.gender != undefined && $scope.changeInfo.boardingTime != undefined && $scope.changeInfo.workAmounts != undefined && $scope.changeInfo.name != undefined && $scope.changeInfo.phoneNo != undefined && $scope.changeInfo.role != undefined && $scope.changeInfo.token != undefined) {
                    // 类型转换
                    $scope.changeInfo.gender = parseInt($scope.changeInfo.gender);
                    // console.log($scope.changeInfo);
                    // 关闭修改信息modal
                    $('#changeInfo').modal('hide');
                    var promise = Alluser.modify($scope.changeInfo);
                    promise.then(function(data) {
                        // console.log(data.msg);
                        if (data.msg == "success!") {
                            // 显示成功提示
                            $('#changeSuccess').modal('show');
                            $timeout(function() {
                                $('#changeSuccess').modal('hide');
                                // 提示完毕，刷新保险人员列表
                                var promise = Alluser.getInsuranceList(token);
                                promise.then(function(data) {
                                    // console.log(data.results);
                                    // 首先处理一下要显示的roles 
                                    for (var i = 0; i < data.results.length; i++) {
                                        var roles = data.results[i].role;
                                        for (var j = 0; j < roles.length; j++) {
                                            if (roles[j] == "insuranceA") {
                                                data.results[i].role = "insuranceA";
                                            }
                                            if (roles[j] == "insuranceR") {
                                                data.results[i].role = "insuranceR";
                                            }
                                            if (roles[j] == "insuranceC") {
                                                data.results[i].role = "insuranceC";
                                            }
                                        }
                                    }
                                    $scope.tableParams = new NgTableParams({
                                        count: 50
                                    }, {
                                        counts: [10, 20, 50, 100],
                                        dataset: data.results
                                    });
                                }, function(err) {});
                            }, 1000);
                        }
                    }, function(err) {});
                }
            };
        }
    ])
    // 保险人员--详细信息modal--张桠童
    .controller('detail_insuranceCtrl', ['$scope', '$state', 'Storage', 'NgTableParams', '$timeout', '$uibModal', 'Alluser', '$uibModalInstance', 'userdetail',
        function($scope, $state, Storage, NgTableParams, $timeout, $uibModal, Alluser, $uibModalInstance, userdetail) {
            // console.log(userdetail);
            $scope.insuranceInfo = userdetail;
            // 关闭modal
            $scope.close = function() {
                $uibModalInstance.dismiss();
            };
            // 删除用户
            $scope.cancelUser = function() {
                $uibModalInstance.close("删除用户");
            };
            // 去除角色
            $scope.removeUserRoles = function() {
                $uibModalInstance.close("去除角色");
            };
            // 修改信息
            $scope.changeInfo = function() {
                $uibModalInstance.close("修改信息");
            };
        }
    ])
    // 健康专员--张桠童
    .controller('healthOfficersCtrl', ['$scope', '$state', 'Storage', 'NgTableParams', '$timeout', '$uibModal', 'Alluser', 'Roles',
        function($scope, $state, Storage, NgTableParams, $timeout, $uibModal, Alluser, Roles) {
            var token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI1OTEyZTllYmRjODNmNmE4YjdkY2JkZTgiLCJ1c2VySWQiOiJVMjAxNzAzMTQyMDE4Iiwicm9sZSI6InBhdGllbnQiLCJleHBpcmVBZnRlciI6MTQ5NzQwNzI2MzgzMywiaWF0IjoxNDk3NDA3MjYzfQ.5UITzg6NaHcIIEQESCLLB7mx_suISw9Bj6K1OBaiaDk';
            // 初始化健康专员列表
            var promise = Alluser.getHealthList(token);
            promise.then(function(data) {
                // console.log(data.results);
                $scope.tableParams = new NgTableParams({
                    count: 50
                }, {
                    counts: [10, 20, 50, 100],
                    dataset: data.results
                });
            }, function(err) {});
            $scope.genders = [{ id: 1, title: "男" }, { id: 2, title: "女" }];
            // 监听事件(表单清空)
            $('#new_register').on('hidden.bs.modal', function() {
                $('#registerForm').formValidation('resetForm', true);
                $scope.registerInfo.phoneNo = undefined;
                $scope.registerInfo.password = undefined;
            })
            $('#new_perfect').on('hidden.bs.modal', function() {
                $('#perfectForm').formValidation('resetForm', true);
                $scope.newUserInfo.userId = undefined;
                $scope.newUserInfo.gender = undefined;
                $scope.newUserInfo.boardingTime = undefined;
                $scope.newUserInfo.workAmounts = undefined;
                $scope.newUserInfo.name = undefined;
            })
            $('#new_add').on('hidden.bs.modal', function() {
                $scope.userlist.name = undefined;
                $scope.addInfo.userId = undefined;
                $scope.userlist_search = undefined;
                $scope.flag = false;
            })
            $('#changeInfo').on('hidden.bs.modal', function() {
                    $('#changeForm').formValidation('resetForm', true);
                })
                // 关闭modal控制
            $scope.modal_close = function(target) {
                $(target).modal('hide');
                if (target == "#new_perfect" || target == "#changeInfo") {
                    var promise = Alluser.getHealthList(token);
                    promise.then(function(data) {
                        // console.log(data.results);
                        $scope.tableParams = new NgTableParams({
                            count: 50
                        }, {
                            counts: [10, 20, 50, 100],
                            dataset: data.results
                        });
                    }, function(err) {});
                };
                if (target == "#new_add") {
                    $scope.flag = false;
                };
            };
            // 注册新用户
            $scope.registerInfo = {};
            $scope.registerInfo.role = 'health';
            $scope.newUserInfo = {};
            $scope.register = function() {
                console.log(1);
                console.log($scope.registerInfo.phoneNo);
                if ($scope.registerInfo.phoneNo != undefined && $scope.registerInfo.password != undefined) {
                    var promise = Alluser.register($scope.registerInfo);
                    promise.then(function(data) {
                        // console.log(data);
                        // 注册成功
                        if (data.mesg == "Alluser Register Success!") {
                            // 获取userId
                            $scope.newUserInfo.userId = data.userNo;
                            // 关闭注册modal
                            $('#new_register').modal('hide');
                            // 提示注册成功
                            $('#registerSuccess').modal('show');
                            $timeout(function() {
                                // 提示完毕
                                $('#registerSuccess').modal('hide');
                                // 打开完善信息modal
                                $('#new_perfect').modal('show');
                            }, 1000);
                        }
                        // 注册失败(该用户已存在)
                        else {
                            // 提示注册失败
                            $('#registerFailed').modal('show');
                            $timeout(function() {
                                $('#registerFailed').modal('hide');
                            }, 1000);
                        }
                    }, function(err) {});
                }
            };
            // 完善新用户信息
            $scope.perfect = function() {
                $scope.newUserInfo.token = token;
                $scope.newUserInfo.gender = parseInt($scope.newUserInfo.gender);
                // console.log($scope.newUserInfo);
                if ($scope.newUserInfo.userId != undefined && $scope.newUserInfo.gender != undefined && $scope.newUserInfo.boardingTime != undefined && $scope.newUserInfo.workAmounts != undefined && $scope.newUserInfo.name != undefined && $scope.newUserInfo.token != undefined) {
                    // 关闭完善信息modal
                    $('#new_perfect').modal('hide');
                    var promise = Alluser.modify($scope.newUserInfo);
                    promise.then(function(data) {
                        // console.log(data);
                        if (data.msg == "success!") {
                            // 提示完善成功
                            $('#perfectSuccess').modal('show');
                            $timeout(function() {
                                $('#perfectSuccess').modal('hide');
                                // 提示完毕，刷新健康专员列表
                                var promise = Alluser.getHealthList(token);
                                promise.then(function(data) {
                                    // console.log(data.results);
                                    $scope.tableParams = new NgTableParams({
                                        count: 50
                                    }, {
                                        counts: [10, 20, 50, 100],
                                        dataset: data.results
                                    });
                                }, function(err) {});
                            }, 1000);
                        }
                    }, function(err) {});
                }
            };
            // 搜索用户
            $scope.userlist = {};
            $scope.userlist.token = token;
            $scope.searchUser = function() {
                // console.log($scope.userlist.name);
                if ($scope.userlist.name == undefined) {
                    $('#nameUndefined').modal('show');
                    $timeout(function() {
                        $('#nameUndefined').modal('hide');
                    }, 1000);
                } else {
                    $scope.flag = true;
                    var promise = Alluser.getUserList($scope.userlist);
                    promise.then(function(data) {
                        // console.log(data.results);
                        $scope.userlist_search = data.results;
                        // $scope.userId = "";
                    }, function(err) {});
                }
            };
            // 添加角色
            $scope.addInfo = {};
            $scope.addInfo.roles = 'health';
            $scope.addRole = function() {
                // console.log($scope.addInfo.userId);
                // console.log($scope.addInfo.roles);
                if ($scope.addInfo.userId == undefined) {
                    $('#userIdUndefined').modal('show');
                    $timeout(function() {
                        $('#userIdUndefined').modal('hide');
                    }, 1000);
                } else {
                    // 关闭添加角色modal
                    $('#new_add').modal('hide');
                    // 增加角色
                    $scope.addInfo.token = token;
                    var promise = Roles.addRoles($scope.addInfo);
                    promise.then(function(data) {
                        console.log(data.mesg);
                        if (data.mesg == "User Register Success!") {
                            // 提示添加成功
                            $('#addSuccess').modal('show');
                            $timeout(function() {
                                // 提示完毕，刷新健康专员列表
                                $('#addSuccess').modal('hide');
                                var promise = Alluser.getHealthList(token);
                                promise.then(function(data) {
                                    // console.log(data.results);
                                    $scope.tableParams = new NgTableParams({
                                        count: 50
                                    }, {
                                        counts: [10, 20, 50, 100],
                                        dataset: data.results
                                    });
                                }, function(err) {});
                            }, 1000);
                        } else {
                            // 提示添加失败
                            $('#addFailed').modal('show');
                            $timeout(function() {
                                $('#addFailed').modal('hide');
                            }, 1000);
                        }
                    }, function(err) {});
                }
            };
            //详细信息modal
            $scope.openDetail = function(userdetail) {
                var modalInstance = $uibModal.open({
                    animation: true,
                    ariaLabelledBy: 'modal-title',
                    ariaDescribedBy: 'modal-body',
                    templateUrl: 'detail_health.html',
                    controller: 'detail_healthCtrl',
                    // size: 'sm',
                    resolve: {
                        userdetail: function() {
                            return userdetail;
                        }
                    }
                });
                modalInstance.result.then(function(con) {
                    if (con == "删除用户") {
                        // 确认是否删除
                        $("#cancelOrNot").modal('show');
                        // 给modal传参
                        $scope.userdetail = userdetail;
                    } else if (con == "去除角色") {
                        // 确认是否去除角色
                        $("#removeOrNot").modal('show');
                        // 给modal传参
                        $scope.userdetail = userdetail;
                    } else if (con == "修改信息") {
                        // 修改用户信息方法的输入
                        $scope.changeInfo = userdetail;
                        $scope.changeInfo.token = token;
                        // 打开修改保险人员信息modal
                        $('#changeInfo').modal('show');
                    }
                }, function() {});
            };
            // 删除用户
            $scope.cancel = function(userdetail) {
                // 关闭警告modal（是否删除）
                $("#cancelOrNot").modal('hide');
                // 删除用户输入
                var cancelUserinfo = {
                    "userId": userdetail.userId,
                    "token": token
                };
                // 删除该用户
                var promise = Alluser.cancelUser(cancelUserinfo);
                promise.then(function(data) {
                    // console.log(data);
                    if (data.msg == "success!") {
                        // 提示删除成功
                        $('#cancelSuccess').modal('show');
                        $timeout(function() {
                            // 关闭提示
                            $('#cancelSuccess').modal('hide');
                            // 刷新健康专员列表
                            var promise = Alluser.getHealthList(token);
                            promise.then(function(data) {
                                // console.log(data.results);
                                $scope.tableParams = new NgTableParams({
                                    count: 50
                                }, {
                                    counts: [10, 20, 50, 100],
                                    dataset: data.results
                                });
                            }, function(err) {});
                        }, 1000);
                    }
                }, function(err) {});
            };
            // 去除角色
            $scope.remove = function(userdetail) {
                // 关闭警告（是否去除角色）
                $("#removeOrNot").modal('hide');
                // 去除角色方法输入
                var removeInfo = {
                    "userId": userdetail.userId,
                    "roles": 'health',
                    "token": token
                };
                // 去除该角色
                var promise = Roles.removeRoles(removeInfo);
                promise.then(function(data) {
                    // console.log(data);
                    if (data.mesg == "User Register Success!") {
                        // 提示去除成功
                        $('#removeSuccess').modal('show');
                        $timeout(function() {
                            // 关闭提示
                            $('#removeSuccess').modal('hide');
                            // 刷新健康专员列表
                            var promise = Alluser.getHealthList(token);
                            promise.then(function(data) {
                                // console.log(data.results);
                                $scope.tableParams = new NgTableParams({
                                    count: 50
                                }, {
                                    counts: [10, 20, 50, 100],
                                    dataset: data.results
                                });
                            }, function(err) {});
                        }, 1000);
                    };
                }, function(err) {});
            };
            // 修改用户信息
            $scope.change = function() {
                if ($scope.changeInfo.userId != undefined && $scope.changeInfo.gender != undefined && $scope.changeInfo.boardingTime != undefined && $scope.changeInfo.workAmounts != undefined && $scope.changeInfo.name != undefined && $scope.changeInfo.phoneNo != undefined && $scope.changeInfo.token != undefined) {
                    // 类型转换
                    $scope.changeInfo.gender = parseInt($scope.changeInfo.gender);
                    // console.log($scope.changeInfo);
                    // 关闭修改信息modal
                    $('#changeInfo').modal('hide');
                    var promise = Alluser.modify($scope.changeInfo);
                    promise.then(function(data) {
                        // console.log(data.msg);
                        if (data.msg == "success!") {
                            // 显示成功提示
                            $('#changeSuccess').modal('show');
                            $timeout(function() {
                                $('#changeSuccess').modal('hide');
                                // 提示完毕，刷新健康专员列表
                                var promise = Alluser.getHealthList(token);
                                promise.then(function(data) {
                                    // console.log(data.results);
                                    $scope.tableParams = new NgTableParams({
                                        count: 50
                                    }, {
                                        counts: [10, 20, 50, 100],
                                        dataset: data.results
                                    });
                                }, function(err) {});
                            }, 1000);
                        }
                    }, function(err) {});
                }
            };
        }
    ])
    // 健康专员--详细信息modal--张桠童
    .controller('detail_healthCtrl', ['$scope', '$state', 'Storage', 'NgTableParams', '$timeout', '$uibModal', 'Alluser', '$uibModalInstance', 'userdetail',
        function($scope, $state, Storage, NgTableParams, $timeout, $uibModal, Alluser, $uibModalInstance, userdetail) {
            // console.log(userdetail);
            $scope.healthInfo = userdetail;
            // 关闭modal
            $scope.close = function() {
                $uibModalInstance.dismiss();
            };
            // 删除用户
            $scope.cancelUser = function() {
                $uibModalInstance.close("删除用户");
            };
            // 去除角色
            $scope.removeUserRoles = function() {
                $uibModalInstance.close("去除角色");
            };
            // 修改信息
            $scope.changeInfo = function() {
                $uibModalInstance.close("修改信息");
            };
        }
    ])
    // 管理员--张桠童
    .controller('administratorsCtrl', ['$scope', '$state', 'Storage', 'NgTableParams', '$timeout', '$uibModal', 'Alluser', 'Roles',
        function($scope, $state, Storage, NgTableParams, $timeout, $uibModal, Alluser, Roles) {
            var token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI1OTEyZTllYmRjODNmNmE4YjdkY2JkZTgiLCJ1c2VySWQiOiJVMjAxNzAzMTQyMDE4Iiwicm9sZSI6InBhdGllbnQiLCJleHBpcmVBZnRlciI6MTQ5NzQwNzI2MzgzMywiaWF0IjoxNDk3NDA3MjYzfQ.5UITzg6NaHcIIEQESCLLB7mx_suISw9Bj6K1OBaiaDk';
            // 初始化管理员列表
            var promise = Alluser.getAdminList(token);
            promise.then(function(data) {
                // console.log(data.results);
                $scope.tableParams = new NgTableParams({
                    count: 50
                }, {
                    counts: [10, 20, 50, 100],
                    dataset: data.results
                });
            }, function(err) {});
            $scope.genders = [{ id: 1, title: "男" }, { id: 2, title: "女" }];
            // 监听事件(表单清空)
            $('#new_register').on('hidden.bs.modal', function() {
                $('#registerForm').formValidation('resetForm', true);
                $scope.registerInfo.phoneNo = undefined;
                $scope.registerInfo.password = undefined;
            })
            $('#new_perfect').on('hidden.bs.modal', function() {
                $('#perfectForm').formValidation('resetForm', true);
                $scope.newUserInfo.userId = undefined;
                $scope.newUserInfo.gender = undefined;
                $scope.newUserInfo.creationTime = undefined;
                $scope.newUserInfo.workUnit = undefined;
                $scope.newUserInfo.name = undefined;
            })
            $('#new_add').on('hidden.bs.modal', function() {
                $scope.userlist.name = undefined;
                $scope.addInfo.userId = undefined;
                $scope.userlist_search = undefined;
                $scope.flag = false;
            })
            $('#changeInfo').on('hidden.bs.modal', function() {
                    $('#changeForm').formValidation('resetForm', true);
                })
                // 关闭modal控制
            $scope.modal_close = function(target) {
                $(target).modal('hide');
                if (target == "#new_perfect" || target == "#changeInfo") {
                    var promise = Alluser.getAdminList(token);
                    promise.then(function(data) {
                        // console.log(data.results);
                        $scope.tableParams = new NgTableParams({
                            count: 50
                        }, {
                            counts: [10, 20, 50, 100],
                            dataset: data.results
                        });
                    }, function(err) {});
                };
                if (target == "#new_add") {
                    $scope.flag = false;
                };
            };
            // 注册新用户
            $scope.registerInfo = {};
            $scope.registerInfo.role = 'admin';
            $scope.newUserInfo = {};
            $scope.register = function() {
                console.log(1);
                console.log($scope.registerInfo.phoneNo);
                if ($scope.registerInfo.phoneNo != undefined && $scope.registerInfo.password != undefined) {
                    var promise = Alluser.register($scope.registerInfo);
                    promise.then(function(data) {
                        // console.log(data);
                        // 注册成功
                        if (data.mesg == "Alluser Register Success!") {
                            // 获取userId
                            $scope.newUserInfo.userId = data.userNo;
                            // 关闭注册modal
                            $('#new_register').modal('hide');
                            // 提示注册成功
                            $('#registerSuccess').modal('show');
                            $timeout(function() {
                                // 提示完毕
                                $('#registerSuccess').modal('hide');
                                // 打开完善信息modal
                                $('#new_perfect').modal('show');
                            }, 1000);
                        }
                        // 注册失败(该用户已存在)
                        else {
                            // 提示注册失败
                            $('#registerFailed').modal('show');
                            $timeout(function() {
                                $('#registerFailed').modal('hide');
                            }, 1000);
                        }
                    }, function(err) {});
                }
            };
            // 完善新用户信息
            $scope.perfect = function() {
                $scope.newUserInfo.token = token;
                $scope.newUserInfo.gender = parseInt($scope.newUserInfo.gender);
                // console.log($scope.newUserInfo);
                if ($scope.newUserInfo.userId != undefined && $scope.newUserInfo.gender != undefined && $scope.newUserInfo.creationTime != undefined && $scope.newUserInfo.workUnit != undefined && $scope.newUserInfo.name != undefined && $scope.newUserInfo.token != undefined) {
                    // 关闭完善信息modal
                    $('#new_perfect').modal('hide');
                    var promise = Alluser.modify($scope.newUserInfo);
                    promise.then(function(data) {
                        // console.log(data);
                        if (data.msg == "success!") {
                            // 提示完善成功
                            $('#perfectSuccess').modal('show');
                            $timeout(function() {
                                $('#perfectSuccess').modal('hide');
                                // 提示完毕，刷新管理员列表
                                var promise = Alluser.getAdminList(token);
                                promise.then(function(data) {
                                    // console.log(data.results);
                                    $scope.tableParams = new NgTableParams({
                                        count: 50
                                    }, {
                                        counts: [10, 20, 50, 100],
                                        dataset: data.results
                                    });
                                }, function(err) {});
                            }, 1000);
                        }
                    }, function(err) {});
                }
            };
            // 搜索用户
            $scope.userlist = {};
            $scope.userlist.token = token;
            $scope.searchUser = function() {
                // console.log($scope.userlist.name);
                if ($scope.userlist.name == undefined) {
                    $('#nameUndefined').modal('show');
                    $timeout(function() {
                        $('#nameUndefined').modal('hide');
                    }, 1000);
                } else {
                    $scope.flag = true;
                    var promise = Alluser.getUserList($scope.userlist);
                    promise.then(function(data) {
                        // console.log(data.results);
                        $scope.userlist_search = data.results;
                        // $scope.userId = "";
                    }, function(err) {});
                }
            };
            // 添加角色
            $scope.addInfo = {};
            $scope.addInfo.roles = 'admin';
            $scope.addRole = function() {
                // console.log($scope.addInfo.userId);
                // console.log($scope.addInfo.roles);
                if ($scope.addInfo.userId == undefined) {
                    $('#userIdUndefined').modal('show');
                    $timeout(function() {
                        $('#userIdUndefined').modal('hide');
                    }, 1000);
                } else {
                    // 关闭添加角色modal
                    $('#new_add').modal('hide');
                    // 增加角色
                    $scope.addInfo.token = token;
                    var promise = Roles.addRoles($scope.addInfo);
                    promise.then(function(data) {
                        console.log(data.mesg);
                        if (data.mesg == "User Register Success!") {
                            // 提示添加成功
                            $('#addSuccess').modal('show');
                            $timeout(function() {
                                // 提示完毕，刷新健康专员列表
                                $('#addSuccess').modal('hide');
                                var promise = Alluser.getAdminList(token);
                                promise.then(function(data) {
                                    // console.log(data.results);
                                    $scope.tableParams = new NgTableParams({
                                        count: 50
                                    }, {
                                        counts: [10, 20, 50, 100],
                                        dataset: data.results
                                    });
                                }, function(err) {});
                            }, 1000);
                        } else {
                            // 提示添加失败
                            $('#addFailed').modal('show');
                            $timeout(function() {
                                $('#addFailed').modal('hide');
                            }, 1000);
                        }
                    }, function(err) {});
                }
            };
            //详细信息modal
            $scope.openDetail = function(userdetail) {
                var modalInstance = $uibModal.open({
                    animation: true,
                    ariaLabelledBy: 'modal-title',
                    ariaDescribedBy: 'modal-body',
                    templateUrl: 'detail_admin.html',
                    controller: 'detail_adminCtrl',
                    // size: 'sm',
                    resolve: {
                        userdetail: function() {
                            return userdetail;
                        }
                    }
                });
                modalInstance.result.then(function(con) {
                    if (con == "删除用户") {
                        // 确认是否删除
                        $("#cancelOrNot").modal('show');
                        // 给modal传参
                        $scope.userdetail = userdetail;
                    } else if (con == "去除角色") {
                        // 确认是否去除角色
                        $("#removeOrNot").modal('show');
                        // 给modal传参
                        $scope.userdetail = userdetail;
                    } else if (con == "修改信息") {
                        // 修改用户信息方法的输入
                        $scope.changeInfo = userdetail;
                        $scope.changeInfo.token = token;
                        // 打开修改保险人员信息modal
                        $('#changeInfo').modal('show');
                    }
                }, function() {});
            };
            // 删除用户
            $scope.cancel = function(userdetail) {
                // 关闭警告modal（是否删除）
                $("#cancelOrNot").modal('hide');
                // 删除用户输入
                var cancelUserinfo = {
                    "userId": userdetail.userId,
                    "token": token
                };
                // 删除该用户
                var promise = Alluser.cancelUser(cancelUserinfo);
                promise.then(function(data) {
                    // console.log(data);
                    if (data.msg == "success!") {
                        // 提示删除成功
                        $('#cancelSuccess').modal('show');
                        $timeout(function() {
                            // 关闭提示
                            $('#cancelSuccess').modal('hide');
                            // 刷新管理员列表
                            var promise = Alluser.getAdminList(token);
                            promise.then(function(data) {
                                // console.log(data.results);
                                $scope.tableParams = new NgTableParams({
                                    count: 50
                                }, {
                                    counts: [10, 20, 50, 100],
                                    dataset: data.results
                                });
                            }, function(err) {});
                        }, 1000);
                    }
                }, function(err) {});
            };
            // 去除角色
            $scope.remove = function(userdetail) {
                // 关闭警告（是否去除角色）
                $("#removeOrNot").modal('hide');
                // 去除角色方法输入
                var removeInfo = {
                    "userId": userdetail.userId,
                    "roles": 'admin',
                    "token": token
                };
                // 去除该角色
                var promise = Roles.removeRoles(removeInfo);
                promise.then(function(data) {
                    // console.log(data);
                    if (data.mesg == "User Register Success!") {
                        // 提示去除成功
                        $('#removeSuccess').modal('show');
                        $timeout(function() {
                            // 关闭提示
                            $('#removeSuccess').modal('hide');
                            // 刷新管理员列表
                            var promise = Alluser.getAdminList(token);
                            promise.then(function(data) {
                                // console.log(data.results);
                                $scope.tableParams = new NgTableParams({
                                    count: 50
                                }, {
                                    counts: [10, 20, 50, 100],
                                    dataset: data.results
                                });
                            }, function(err) {});
                        }, 1000);
                    };
                }, function(err) {});
            };
            // 修改用户信息
            $scope.change = function() {
                if ($scope.changeInfo.userId != undefined && $scope.changeInfo.gender != undefined && $scope.changeInfo.creationTime != undefined && $scope.changeInfo.workUnit != undefined && $scope.changeInfo.name != undefined && $scope.changeInfo.phoneNo != undefined && $scope.changeInfo.token != undefined) {
                    // 类型转换
                    $scope.changeInfo.gender = parseInt($scope.changeInfo.gender);
                    // console.log($scope.changeInfo);
                    // 关闭修改信息modal
                    $('#changeInfo').modal('hide');
                    var promise = Alluser.modify($scope.changeInfo);
                    promise.then(function(data) {
                        // console.log(data.msg);
                        if (data.msg == "success!") {
                            // 显示成功提示
                            $('#changeSuccess').modal('show');
                            $timeout(function() {
                                $('#changeSuccess').modal('hide');
                                // 提示完毕，刷新管理员列表
                                var promise = Alluser.getAdminList(token);
                                promise.then(function(data) {
                                    // console.log(data.results);
                                    $scope.tableParams = new NgTableParams({
                                        count: 50
                                    }, {
                                        counts: [10, 20, 50, 100],
                                        dataset: data.results
                                    });
                                }, function(err) {});
                            }, 1000);
                        }
                    }, function(err) {});
                }
            };
        }
    ])
    // 管理员--详细信息modal--张桠童
    .controller('detail_adminCtrl', ['$scope', '$state', 'Storage', 'NgTableParams', '$timeout', '$uibModal', 'Alluser', '$uibModalInstance', 'userdetail',
        function($scope, $state, Storage, NgTableParams, $timeout, $uibModal, Alluser, $uibModalInstance, userdetail) {
            // console.log(userdetail);
            $scope.adminInfo = userdetail;
            // 关闭modal
            $scope.close = function() {
                $uibModalInstance.dismiss();
            };
            // 删除用户
            $scope.cancelUser = function() {
                $uibModalInstance.close("删除用户");
            };
            // 去除角色
            $scope.removeUserRoles = function() {
                $uibModalInstance.close("去除角色");
            };
            // 修改信息
            $scope.changeInfo = function() {
                $uibModalInstance.close("修改信息");
            };
        }
    ])
