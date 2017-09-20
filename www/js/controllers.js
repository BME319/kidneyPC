angular.module('controllers', ['ngResource', 'services'])

    .controller('LoginCtrl', ['$scope', '$timeout', '$state', 'Storage', '$sce', 'Data', 'User', 'Alluser', function($scope, $timeout, $state, Storage, $sce, Data, User, Alluser) {

        if (Storage.get('USERNAME') != null && Storage.get('USERNAME') != undefined) {
            $scope.logOn = { username: Storage.get('USERNAME'), password: '' }
        } else {
            $scope.logOn = { username: '', password: '' }
        }

        $scope.LogIn = function(logOn) {
            // switch (logOn.role) {
            //     // case 'doctor':
            //     //     userrole = '普通医生'
            //     //     break
            //     // case 'patient':
            //     //     userrole = '患者'
            //     //     break
            //     case 'health':
            //         userrole = '健康专员'
            //         break
            //     case 'admin':
            //         userrole = '管理员'
            //         break
            // }
            userrole = 'PC'
            $scope.logStatus = ''
            if ((logOn.username != '') && (logOn.password != '')) {
                var phoneReg = /^(13[0-9]|15[012356789]|17[678]|18[0-9]|14[57])[0-9]{8}$/
                if (!phoneReg.test(logOn.username)) {
                    $scope.logStatus = '手机号验证失败！'
                } else {
                    Storage.set('USERNAME', logOn.username)
                    User.logIn({ username: logOn.username, password: logOn.password, role: userrole }).then(function(data) {
                        if (data.results == 1) {
                            $scope.logStatus = '请确认账号密码无误且角色选择正确！'
                        } else if (data.results.mesg == 'login success!') {
                            // $scope.logStatus = '登录成功！'
                            Storage.set('PASSWORD', logOn.password)
                            Storage.set('LASTLOGIN', data.results.lastlogin)
                            Storage.set('TOKEN', data.results.token)
                            Storage.set('isSignIN', 'Yes')
                            Storage.set('USERID', data.results.userId)
                            var username = data.results.userName ? data.results.userName : data.results.userId
                            Storage.set('UName', username)
                            var promise = Alluser.getUserList({ token: Storage.get('TOKEN') })
                            promise.then(function(data) {
                                for (var i = 0; i <= data.results.length; i++) {
                                    if (data.results[i].userId == Storage.get('USERID')) {
                                        Storage.set('ROLE', data.results[i].role)
                                        break;
                                    }
                                }
                            })

                            // Storage.set('ROLE', userrole)
                            $state.go('homepage')
                            // if (userrole=='管理员'){                           
                            //     $state.go('homepage')
                            // } else if (userrole=='健康专员'){
                            //     $state.go('main.enterornot.unentered')
                            // }
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
        var tempuserrole = Storage.get('ROLE')
        var roles = new Array(); //定义一数组 
        roles = tempuserrole.split(","); //字符分割 
        console.log(roles)
        // 角色字符串处理
        for (var i = 0; i <= roles.length; i++) {
            type = roles[i]
            switch (type) {
                case 'Leader':
                    roles[i] = '地区负责人'
                    break
                case 'master':
                    roles[i] = '科主任'
                    break
                case 'doctor':
                    roles[i] = '普通医生'
                    break
                case 'patient':
                    roles[i] = '患者'
                    break
                case 'nurse':
                    roles[i] = '护士'
                    break
                case 'insuranceA':
                    roles[i] = '沟通人员'
                    break
                case 'insuranceC':
                    roles[i] = '保险主管'
                    break
                case 'insuranceR':
                    roles[i] = '录入人员'
                    break
                case 'health':
                    roles[i] = '健康专员'
                    break
                case 'admin':
                    roles[i] = '管理员'
                    break
            }
        }
        $scope.UserRole = roles


        $scope.LastLoginTime = Storage.get('LASTLOGIN')
        $scope.myIndex = Storage.get('Tab')

        if (tempuserrole.indexOf("admin") != -1) {
            $scope.flagdoctor = true
            $scope.flaguser = true
            $scope.flagdistrdp = true
            $scope.flaghealth = true
            $scope.flagdata = true
            $scope.flaginsu = true
        } else if (tempuserrole.indexOf("health") != -1) {
            $scope.flagdoctor = false
            $scope.flaguser = false
            $scope.flagdistrdp = false
            $scope.flaghealth = true
            $scope.flagdata = false
            $scope.flaginsu = false
        }

        $scope.tounchecked = function() {
            $state.go('main.checkornot.unchecked')
        }
        $scope.touser = function() {
            $state.go('main.usermanage.allUsers')
        }
        $scope.todistrdep = function() {
            $state.go('main.distrdepmanage.districts')
        }
        $scope.tounentered = function() {
            $state.go('main.enterornot.unentered')
        }
        $scope.todata = function() {
            $state.go('main.datamanage.region')
        }
        $scope.toinsurance = function() {
            $state.go('main.insumanage')
        }
        //注销
        $scope.ifOut = function() {
            $state.go('login', null, {
                reload: true
            });
        }
    }])

    .controller('CheckOrNotCtrl', ['$scope', '$state', 'Review', 'Storage', '$timeout', 'NgTableParams', function($scope, $state, Review, Storage, $timeout, NgTableParams) {
        $scope.tochecked = function() {
            $state.go('main.checkornot.checked')
        }
        $scope.tounchecked = function() {
            $state.go('main.checkornot.unchecked')
        }
        $scope.torejected = function() {
            $state.go('main.checkornot.rejected')
            $scope.flag = 0
        }
    }])

    // 未审核-LZN
    .controller('UncheckedCtrl', ['$scope', '$state', 'Review', 'Alluser', 'Storage', '$timeout', 'NgTableParams', '$uibModal', function($scope, $state, Review, Alluser, Storage, $timeout, NgTableParams, $uibModal) {
        var token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI1OTI2ZWNmZTkzYmNkNjM3ZTA2ODM5NDAiLCJ1c2VySWQiOiJVMjAxNzA1MjUwMDA5IiwibmFtZSI6IuiMueeUuyIsInJvbGUiOiJhZG1pbiIsImV4cCI6MTUwNTE4NTk2MjAwNCwiaWF0IjoxNTA1MDk5NTYyfQ.N0LeWbA6We2hCkYJNTM5wXfcx8a6KVDvayfFCjnq7lU"

        // 获取列表
        var getLists = function(currentPage, itemsPerPage) {
            $scope.review = {
                "reviewStatus": 0,
                "limit": itemsPerPage,
                "skip": (currentPage - 1) * itemsPerPage,
                "token": Storage.get('TOKEN')
            }
            Review.GetReviewInfo($scope.review).then(
                function(data) {
                    $scope.doctorinfos = data.results;
                    console.log($scope.doctorinfos);
                    for (var i = 0; i < $scope.doctorinfos.length; i++) {
                        if ($scope.doctorinfos[i].creationTime != null) {
                            var tmp = Date.parse($scope.doctorinfos[i].creationTime);
                            var stdate = new Date(tmp);
                            $scope.doctorinfos[i].creationTime = stdate.getFullYear() + '-' + (stdate.getMonth() + 1) + '-' + stdate.getDate();
                        }
                    }
                    $scope.tableParams = new NgTableParams({
                        count: itemsPerPage
                    }, {
                        counts: [],
                        dataset: $scope.doctorinfos
                    });
                },
                function(e) {});
        }
        // 初始化
        $scope.currentPage = 1;
        $scope.itemsPerPage = 20;
        getLists($scope.currentPage, $scope.itemsPerPage);
        // 页面改变
        $scope.pageChanged = function() {
            console.log($scope.currentPage);
            getLists($scope.currentPage, $scope.itemsPerPage);
        }
        // 当前页面的总条目数改变
        $scope.changeLimit = function(num) {
            $scope.itemsPerPage = num;
            $scope.currentPage = 1;
            getLists($scope.currentPage, $scope.itemsPerPage);
        }
        // 获取未审核总人数
        $scope.count = '';
        var count = {
            "reviewStatus": 0,
            "token": Storage.get('TOKEN')
        }
        Review.GetCount(count).then(
            function(data) {
                $scope.count = data.results;
            },
            function(e) {

            });
        // 传Id和审核状态到LocalStorage
        $scope.getdocId = function(index) {
            Storage.set('docId', $scope.doctorinfos[index].userId);
            Storage.set('reviewstatus', 0);
        }
        // 通过
        $scope.accept = function(index) {
            var postreview = {
                "doctorId": $scope.doctorinfos[index].userId,
                "reviewStatus": 1,
                "token": Storage.get('TOKEN')
            }
            console.log($scope.doctorinfos[index].phoneNo)
            Review.PostReviewInfo(postreview).then(
                function(data) {
                    console.log(data.results);
                    if (data.results == "审核信息保存成功") {
                        $('#accepted').modal('show');
                        $timeout(function() {
                            $('#accepted').modal('hide');
                        }, 1000);
                        $('#accepted').on('hidden.bs.modal', function() {
                            var sms = {
                                "mobile": $scope.doctorinfos[index].phoneNo,
                                "smsType": 3,
                                "token": Storage.get('TOKEN')
                            }
                            Alluser.sms(sms).then(
                                function(data) {
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
                                },
                                function(e) {

                                })
                        })
                    }
                },
                function(e) {

                })
        }
        $scope.docId = '';
        // 获取拒绝原因
        $scope.getId = function(index) {
            $scope.docId = $scope.doctorinfos[index].userId
        }
        $scope.RejectReason = {};
        // 拒绝
        $scope.reject = function(index) {
            console.log($scope.RejectReason.reason);
            if ($scope.RejectReason.reason == undefined) {
                $('#reasonerror').modal('show')
                $timeout(function() {
                    $('#reasonerror').modal('hide')
                }, 1000)
            } else {
                var postreview = {
                    "doctorId": $scope.docId,
                    "reviewStatus": 2,
                    "reviewContent": $scope.RejectReason.reason,
                    "token": Storage.get('TOKEN')
                }
                console.log(postreview);
                Review.PostReviewInfo(postreview).then(
                    function(data) {

                        console.log(data.results);
                        if (data.results == "审核信息保存成功") {
                            $('#reject').modal('hide');
                            $('#reject').on('hidden.bs.modal', function() {
                                $('#rejected').modal('show');
                                $timeout(function() {
                                    $('#rejected').modal('hide');
                                }, 1000);
                                $('#rejected').on('hidden.bs.modal', function() {
                                    var sms = {
                                        "mobile": $scope.doctorinfos[index].phoneNo,
                                        "smsType": 4,
                                        "token": Storage.get('TOKEN'),
                                        "reason": $scope.RejectReason.reason
                                    }
                                    Alluser.sms(sms).then(
                                        function(data) {
                                            console.log(data.results);
                                            $scope.RejectReason = {};
                                            getLists($scope.currentPage, $scope.itemsPerPage);
                                        },
                                        function(e) {

                                        })

                                })

                            })
                        }
                    },
                    function(e) {

                    })
            }
        }
        // 搜索
        $scope.search = function() {
            $scope.review = {
                "reviewStatus": 0,
                "limit": $scope.itemsPerPage,
                "skip": ($scope.currentPage - 1) * $scope.itemsPerPage,
                "name": $scope.doctorname,
                "token": Storage.get('TOKEN')
            }
            Review.GetReviewInfo($scope.review).then(
                function(data) {
                    $scope.doctorinfos = data.results;
                    // console.log($scope.doctorname);
                    // console.log($scope.review);
                    // console.log($scope.doctorinfos);
                    for (var i = 0; i < $scope.doctorinfos.length; i++) {
                        if ($scope.doctorinfos[i].creationTime != null) {
                            var tmp = Date.parse($scope.doctorinfos[i].creationTime);
                            var stdate = new Date(tmp);
                            $scope.doctorinfos[i].creationTime = stdate.getFullYear() + '-' + (stdate.getMonth() + 1) + '-' + stdate.getDate();
                        }
                    }
                    $scope.tableParams = new NgTableParams({
                        count: $scope.itemsPerPage
                    }, {
                        counts: [],
                        dataset: $scope.doctorinfos
                    });
                },
                function(e) {

                })
        }
        $scope.modal_close = function(target) {
            $(target).modal('hide')
        }
    }])
    // 查看医生资质证书-LZN
    .controller('DoctorLicenseCtrl', ['$scope', '$state', 'Review', 'Alluser', 'Storage', '$timeout', function($scope, $state, Review, Alluser, Storage, $timeout) {
        var token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI1OTI2ZWNmZTkzYmNkNjM3ZTA2ODM5NDAiLCJ1c2VySWQiOiJVMjAxNzA1MjUwMDA5IiwibmFtZSI6IuiMueeUuyIsInJvbGUiOiJhZG1pbiIsImV4cCI6MTUwNTE4NTk2MjAwNCwiaWF0IjoxNTA1MDk5NTYyfQ.N0LeWbA6We2hCkYJNTM5wXfcx8a6KVDvayfFCjnq7lU"
        var id = Storage.get('docId');

        // 循环轮播到某个特定的帧 
        $(".slide-one").click(function() {
            $("#myCarousel").carousel(0);
        });
        $(".slide-two").click(function() {
            $("#myCarousel").carousel(1);
        });

        // 轮播到前后帧 
        $("#prev").click(function() {
            $('#myCarousel').carousel('prev')
        });
        $("#next").click(function() {
            $('#myCarousel').carousel('next')
        });

        $scope.status = Storage.get('reviewstatus');
        console.log($scope.status)
        switch ($scope.status) {
            case 0:
                $scope.ifcheck = false;
                break;
            case 1:
                $scope.ifcheck = false;
                break;
            case 2:
                $scope.ifcheck = true;
                break;
        }

        $scope.doctorinfos = {};
        $scope.review = {};
        var params = {
            "doctorId": id,
            "token": Storage.get('TOKEN')
        }
        Review.GetCertificate(params).then(
            function(data) {
                console.log(data)
                $scope.doctorinfos = data.results;
                $scope.certificatephoto = data.results.certificatePhotoUrl.replace("resized", "");
                $scope.practisingphoto = data.results.practisingPhotoUrl.replace("resized", "");
                if ($scope.doctorinfos.province == $scope.doctorinfos.city) $scope.doctorinfos.province = '';
                var review = {
                    "reviewStatus": $scope.status,
                    "limit": 15,
                    "skip": 0,
                    "name": $scope.doctorinfos.name,
                    "token": Storage.get('TOKEN')
                }
                Review.GetReviewInfo(review).then(
                    function(data) {
                        console.log(data)
                        $scope.review.reviewStatus = data.results[0].reviewStatus;
                        $scope.review.adminId = data.results[0].adminId;
                        $scope.review.reviewDate = data.results[0].reviewDate;
                        $scope.review.reviewContent = data.results[0].reviewContent;
                        if ($scope.review.reviewDate != null) {
                            var tmp = Date.parse($scope.review.reviewDate);
                            var stdate = new Date(tmp);
                            $scope.review.reviewDate = stdate.getFullYear() + '-' + (stdate.getMonth() + 1) + '-' + stdate.getDate();
                        }
                        console.log($scope.review);
                        console.log($scope.doctorinfos.phoneNo)
                    },
                    function(e) {

                    });
            },
            function(e) {

            });
        // 通过
        $scope.accept = function() {
            var postreview = {
                "doctorId": Storage.get('docId'),
                "reviewStatus": 1,
                "token": Storage.get('TOKEN')
            }
            Review.PostReviewInfo(postreview).then(
                function(data) {
                    console.log(data.results);
                    if (data.results == "审核信息保存成功") {
                        $('#accepted').modal('show');
                        $timeout(function() {
                            $('#accepted').modal('hide');
                        }, 1000);
                        $('#accepted').on('hidden.bs.modal', function() {
                            var sms = {
                                "mobile": $scope.doctorinfos.phoneNo,
                                "smsType": 3,
                                "token": Storage.get('TOKEN')
                            }
                            Alluser.sms(sms).then(
                                function(data) {
                                    $state.go('main.checkornot.unchecked');
                                },
                                function(e) {

                                })

                        })
                    }
                },
                function(e) {

                })
        }
        $scope.RejectReason = {};
        // 拒绝
        $scope.reject = function(docphoneNo) {
            console.log($scope.RejectReason.reason);
            if ($scope.RejectReason.reason == undefined) {
                $('#reasonerror').modal('show')
                $timeout(function() {
                    $('#reasonerror').modal('hide')
                }, 1000)
            } else {
                var postreview = {
                    "doctorId": Storage.get('docId'),
                    "reviewStatus": 2,
                    "reviewContent": $scope.RejectReason.reason,
                    "token": Storage.get('TOKEN')
                }
                console.log(postreview);
                Review.PostReviewInfo(postreview).then(
                    function(data) {

                        console.log(data.results);
                        if (data.results == "审核信息保存成功") {
                            $('#reject').modal('hide');
                            $('#reject').on('hidden.bs.modal', function() {
                                $('#rejected').modal('show');
                                $timeout(function() {
                                    $('#rejected').modal('hide');
                                }, 1000);
                            })
                            $('#rejected').on('hidden.bs.modal', function() {
                                var sms = {
                                    "mobile": $scope.doctorinfos.phoneNo,
                                    "smsType": 4,
                                    "token": Storage.get('TOKEN'),
                                    "reason": $scope.RejectReason.reason
                                }
                                Alluser.sms(sms).then(
                                    function(data) {
                                        console.log(data.results);
                                        $scope.RejectReason = {};
                                        $state.go('main.checkornot.unchecked');
                                    },
                                    function(e) {})

                            })
                        }
                    },
                    function(e) {

                    })
            }
        }
        $scope.modal_close = function(target) {
            $(target).modal('hide')
        }
    }])
    // 已审核-LZN
    .controller('CheckedCtrl', ['$scope', '$state', 'Review', 'Storage', 'NgTableParams', '$timeout', function($scope, $state, Review, Storage, NgTableParams, $timeout) {
        var token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI1OTI2ZWNmZTkzYmNkNjM3ZTA2ODM5NDAiLCJ1c2VySWQiOiJVMjAxNzA1MjUwMDA5IiwibmFtZSI6IuiMueeUuyIsInJvbGUiOiJhZG1pbiIsImV4cCI6MTUwNTE4NTk2MjAwNCwiaWF0IjoxNTA1MDk5NTYyfQ.N0LeWbA6We2hCkYJNTM5wXfcx8a6KVDvayfFCjnq7lU"
        // 获取列表
        var getLists = function(currentPage, itemsPerPage) {
            $scope.review = {
                "reviewStatus": 1,
                "limit": itemsPerPage,
                "skip": (currentPage - 1) * itemsPerPage,
                "token": Storage.get('TOKEN')
            }
            Review.GetReviewInfo($scope.review).then(
                function(data) {
                    $scope.doctorinfos = data.results;
                    for (var i = 0; i < $scope.doctorinfos.length; i++) {
                        if ($scope.doctorinfos[i].reviewDate != null) {
                            var tmp = Date.parse($scope.doctorinfos[i].reviewDate);
                            var stdate = new Date(tmp);
                            $scope.doctorinfos[i].reviewDate = stdate.getFullYear() + '-' + (stdate.getMonth() + 1) + '-' + stdate.getDate();
                        }
                        if ($scope.doctorinfos[i].creationTime != null) {
                            var tmp = Date.parse($scope.doctorinfos[i].creationTime);
                            var stdate = new Date(tmp);
                            $scope.doctorinfos[i].creationTime = stdate.getFullYear() + '-' + (stdate.getMonth() + 1) + '-' + stdate.getDate();
                        }
                    }
                    console.log($scope.doctorinfos);
                    console.log(data.nexturl);
                    $scope.tableParams = new NgTableParams({
                        count: itemsPerPage
                    }, {
                        counts: [],
                        dataset: $scope.doctorinfos
                    });
                },
                function(e) {

                });
        }
        // 初始化
        $scope.currentPage = 1;
        $scope.itemsPerPage = 20;
        getLists($scope.currentPage, $scope.itemsPerPage);
        // 页面改变
        $scope.pageChanged = function() {
            console.log($scope.currentPage);
            getLists($scope.currentPage, $scope.itemsPerPage);
        }
        // 当前页面的总条目数改变
        $scope.changeLimit = function(num) {
            $scope.itemsPerPage = num;
            $scope.currentPage = 1;
            getLists($scope.currentPage, $scope.itemsPerPage);
        }
        // 获取已审核总人数
        $scope.count = '';
        var count = {
            "reviewStatus": 1,
            "token": Storage.get('TOKEN')
        }
        Review.GetCount(count).then(
            function(data) {
                $scope.count = data.results;
            },
            function(e) {});
        // 传Id和审核状态到LocalStorage
        $scope.getdocId = function(index) {
            Storage.set('docId', $scope.doctorinfos[index].userId);
            Storage.set('reviewstatus', 1);
        }
        // 搜索
        $scope.search = function() {
            $scope.review = {
                "reviewStatus": 1,
                "limit": $scope.itemsPerPage,
                "skip": ($scope.currentPage - 1) * $scope.itemsPerPage,
                "name": $scope.doctorname,
                "token": Storage.get('TOKEN')

            }
            Review.GetReviewInfo($scope.review).then(
                function(data) {
                    $scope.doctorinfos = data.results;
                    for (var i = 0; i < $scope.doctorinfos.length; i++) {
                        if ($scope.doctorinfos[i].reviewDate != null) {
                            var tmp = Date.parse($scope.doctorinfos[i].reviewDate);
                            var stdate = new Date(tmp);
                            $scope.doctorinfos[i].reviewDate = stdate.getFullYear() + '-' + (stdate.getMonth() + 1) + '-' + stdate.getDate();
                        }
                        if ($scope.doctorinfos[i].creationTime != null) {
                            var tmp = Date.parse($scope.doctorinfos[i].creationTime);
                            var stdate = new Date(tmp);
                            $scope.doctorinfos[i].creationTime = stdate.getFullYear() + '-' + (stdate.getMonth() + 1) + '-' + stdate.getDate();
                        }
                    }
                    console.log($scope.doctorname);
                    console.log($scope.review);
                    console.log($scope.doctorinfos);
                    $scope.tableParams = new NgTableParams({
                        count: $scope.itemsPerPage
                    }, {
                        counts: [],
                        dataset: $scope.doctorinfos
                    });
                },
                function(e) {

                })
        }
    }])
    // 已拒绝-RH
    .controller('RejectedCtrl', ['$scope', '$state', 'Review', 'Storage', 'NgTableParams', '$timeout', function($scope, $state, Review, Storage, NgTableParams, $timeout) {
        var token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI1OTI2ZWNmZTkzYmNkNjM3ZTA2ODM5NDAiLCJ1c2VySWQiOiJVMjAxNzA1MjUwMDA5IiwibmFtZSI6IuiMueeUuyIsInJvbGUiOiJhZG1pbiIsImV4cCI6MTUwNTE4NTk2MjAwNCwiaWF0IjoxNTA1MDk5NTYyfQ.N0LeWbA6We2hCkYJNTM5wXfcx8a6KVDvayfFCjnq7lU"
        // 获取列表
        var getLists = function(currentPage, itemsPerPage) {
            $scope.review = {
                "reviewStatus": 2,
                "limit": itemsPerPage,
                "skip": (currentPage - 1) * itemsPerPage,
                "token": Storage.get('TOKEN')
            }
            Review.GetReviewInfo($scope.review).then(
                function(data) {
                    $scope.doctorinfos = data.results;
                    for (var i = 0; i < $scope.doctorinfos.length; i++) {
                        if ($scope.doctorinfos[i].reviewDate != null) {
                            var tmp = Date.parse($scope.doctorinfos[i].reviewDate);
                            var stdate = new Date(tmp);
                            $scope.doctorinfos[i].reviewDate = stdate.getFullYear() + '-' + (stdate.getMonth() + 1) + '-' + stdate.getDate();
                        }
                        if ($scope.doctorinfos[i].creationTime != null) {
                            var tmp = Date.parse($scope.doctorinfos[i].creationTime);
                            var stdate = new Date(tmp);
                            $scope.doctorinfos[i].creationTime = stdate.getFullYear() + '-' + (stdate.getMonth() + 1) + '-' + stdate.getDate();
                        }
                    }
                    console.log($scope.doctorinfos);
                    console.log(data.nexturl);
                    $scope.tableParams = new NgTableParams({
                        count: itemsPerPage
                    }, {
                        counts: [],
                        dataset: $scope.doctorinfos
                    });
                },
                function(e) {

                });
        }
        // 初始化
        $scope.currentPage = 1;
        $scope.itemsPerPage = 20;
        getLists($scope.currentPage, $scope.itemsPerPage);
        // 页面改变
        $scope.pageChanged = function() {
            console.log($scope.currentPage);
            getLists($scope.currentPage, $scope.itemsPerPage);
        }
        // 当前页面的总条目数改变
        $scope.changeLimit = function(num) {
            $scope.itemsPerPage = num;
            $scope.currentPage = 1;
            getLists($scope.currentPage, $scope.itemsPerPage);
        }
        // 获取已拒绝总人数
        $scope.count = '';
        var count = {
            "reviewStatus": 2,
            "token": Storage.get('TOKEN')
        }
        Review.GetCount(count).then(
            function(data) {
                $scope.count = data.results;
            },
            function(e) {});
        // 传Id和审核状态到LocalStorage
        $scope.getdocId = function(index) {
            Storage.set('docId', $scope.doctorinfos[index].userId);
            Storage.set('reviewstatus', 2);
        }
        // 搜索
        $scope.search = function() {
            $scope.review = {
                "reviewStatus": 2,
                "limit": $scope.itemsPerPage,
                "skip": ($scope.currentPage - 1) * $scope.itemsPerPage,
                "name": $scope.doctorname,
                "token": Storage.get('TOKEN')

            }
            Review.GetReviewInfo($scope.review).then(
                function(data) {
                    $scope.doctorinfos = data.results;
                    for (var i = 0; i < $scope.doctorinfos.length; i++) {
                        if ($scope.doctorinfos[i].reviewDate != null) {
                            var tmp = Date.parse($scope.doctorinfos[i].reviewDate);
                            var stdate = new Date(tmp);
                            $scope.doctorinfos[i].reviewDate = stdate.getFullYear() + '-' + (stdate.getMonth() + 1) + '-' + stdate.getDate();
                        }
                        if ($scope.doctorinfos[i].creationTime != null) {
                            var tmp = Date.parse($scope.doctorinfos[i].creationTime);
                            var stdate = new Date(tmp);
                            $scope.doctorinfos[i].creationTime = stdate.getFullYear() + '-' + (stdate.getMonth() + 1) + '-' + stdate.getDate();
                        }
                    }
                    console.log($scope.doctorname);
                    console.log($scope.review);
                    console.log($scope.doctorinfos);
                    $scope.tableParams = new NgTableParams({
                        count: $scope.itemsPerPage
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
    // 未录入-LZN
    .controller('UnenteredCtrl', ['$scope', '$state', 'Storage', 'LabtestImport', 'NgTableParams', '$timeout', function($scope, $state, Storage, LabtestImport, NgTableParams, $timeout) {
        var token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI1OTI2ZWNmZTkzYmNkNjM3ZTA2ODM5NDAiLCJ1c2VySWQiOiJVMjAxNzA1MjUwMDA5IiwibmFtZSI6IuiMueeUuyIsInJvbGUiOiJhZG1pbiIsImV4cCI6MTUwNTE4NTk2MjAwNCwiaWF0IjoxNTA1MDk5NTYyfQ.N0LeWbA6We2hCkYJNTM5wXfcx8a6KVDvayfFCjnq7lU"


        // 获取列表
        var getLists = function(currentPage, itemsPerPage) {
            $scope.lab = {
                "labtestImportStatus": 0,
                "limit": itemsPerPage,
                "skip": (currentPage - 1) * itemsPerPage,
                "token": Storage.get('TOKEN')
            }
            LabtestImport.GetLabtestInfo($scope.lab).then(
                function(data) {
                    $scope.labtestinfos = data.results;
                    for (var i = 0; i < $scope.labtestinfos.length; i++) {
                        if ($scope.labtestinfos[i].latestUploadTime != null) {
                            var tmp = Date.parse($scope.labtestinfos[i].latestUploadTime);
                            var stdate = new Date(tmp);
                            $scope.labtestinfos[i].latestUploadTime = stdate.getFullYear() + '-' + (stdate.getMonth() + 1) + '-' + stdate.getDate();
                        }
                    }
                    $scope.tableParams = new NgTableParams({
                        count: itemsPerPage
                    }, {
                        counts: [],
                        dataset: $scope.labtestinfos
                    });
                },
                function(e) {

                });
        }
        // 初始化
        $scope.currentPage = 1;
        $scope.itemsPerPage = 20;
        getLists($scope.currentPage, $scope.itemsPerPage);
        // 页面改变
        $scope.pageChanged = function() {
            console.log($scope.currentPage);
            getLists($scope.currentPage, $scope.itemsPerPage);
        }
        // 当前页面的总条目数改变
        $scope.changeLimit = function(num) {
            $scope.itemsPerPage = num;
            $scope.currentPage = 1;
            getLists($scope.currentPage, $scope.itemsPerPage);
        }
        // $scope.labtestinfos={};
        // $scope.lab = {
        //   "labtestImportStatus":0,
        //   "limit":10,
        //   "skip":0,
        //   "token":"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI1OTk1NWRkZGFiOGIwZDRlZDVlYjRjODIiLCJ1c2VySWQiOiJVMjAxNzA4MTcwMDAzIiwibmFtZSI6IuiMueeUuyIsInJvbGUiOiJoZWFsdGgiLCJleHAiOjE1MDQ3OTc0MTY1NTUsImlhdCI6MTUwNDc5MzgxNn0.nwvH3C_f3HwzD8ZCGgaBrr2lwokQo9be5UMK3p3QlTc"
        // }
        // LabtestImport.GetLabtestInfo($scope.lab).then(
        //   function (data) {
        //     $scope.labtestinfos = data.results;
        //     for(var i = 0;i < $scope.labtestinfos.length;i++) {
        //       if($scope.labtestinfos[i].latestUploadTime != null) {
        //           var tmp = Date.parse($scope.labtestinfos[i].latestUploadTime);
        //           var stdate = new Date(tmp);
        //           $scope.labtestinfos[i].latestUploadTime = stdate.getFullYear() + '-' + (stdate.getMonth() + 1) + '-' + stdate.getDate();
        //       }      
        //     }
        //      $scope.tableParams = new NgTableParams({
        //               count:15
        //           },
        //           {   counts:[],
        //               dataset:$scope.labtestinfos
        //           });
        // }, function (e) {

        // })
        // 获取未录入总人数
        $scope.count = '';
        var count = {
            "labtestImportStatus": 0,
            "token": Storage.get('TOKEN')
        }
        LabtestImport.GetCount(count).then(
            function(data) {
                $scope.count = data.results;
            },
            function(e) {

            })
        // 传Id和Name到LocalStorage
        $scope.getpatId = function(index) {
            Storage.set('patId', $scope.labtestinfos[index].userId);
            Storage.set('patName', $scope.labtestinfos[index].name);
        }
        // $scope.lastpage = function () {
        //   if($scope.lab.skip - $scope.lab.limit >= 0) {
        //     $scope.lab.skip -= $scope.lab.limit;
        //     LabtestImport.GetLabtestInfo($scope.lab).then(
        //     function (data) {
        //       $scope.labtestinfos = data.results;
        //       console.log($scope.labtestinfos);
        //       console.log(data.nexturl);
        //       $scope.tableParams = new NgTableParams({
        //                 count:15
        //             },
        //             {   counts:[],
        //                 dataset:$scope.labtestinfos
        //             });
        //     }, function (e) {

        //     });
        //   }     
        // }
        // $scope.nextpage = function () {
        //   $scope.lab.skip += $scope.lab.limit;
        //   LabtestImport.GetLabtestInfo($scope.lab).then(
        //   function (data) {
        //     $scope.labtestinfos = data.results;
        //     console.log($scope.labtestinfos);
        //     console.log(data.nexturl);
        //     $scope.tableParams = new NgTableParams({
        //               count:15
        //           },
        //           {   counts:[],
        //               dataset:$scope.labtestinfos
        //           });
        //   }, function (e) {

        //   });
        // }
        // 搜索
        $scope.search = function() {
            $scope.lab = {
                "labtestImportStatus": 0,
                "limit": $scope.itemsPerPage,
                "skip": ($scope.currentPage - 1) * $scope.itemsPerPage,
                "name": $scope.patientname,
                "token": Storage.get('TOKEN')
            }
            LabtestImport.GetLabtestInfo($scope.lab).then(
                function(data) {
                    $scope.labtestinfos = data.results;
                    if ($scope.labtestinfos[0].latestUploadTime != null) {
                        var tmp = Date.parse($scope.labtestinfos[0].latestUploadTime);
                        var stdate = new Date(tmp);
                        $scope.labtestinfos[0].latestUploadTime = stdate.getFullYear() + '-' + (stdate.getMonth() + 1) + '-' + stdate.getDate();
                    }
                    console.log($scope.patientname);
                    console.log($scope.lab);
                    console.log($scope.labtestinfos);
                    $scope.tableParams = new NgTableParams({
                        count: $scope.itemsPerPage
                    }, {
                        counts: [],
                        dataset: $scope.labtestinfos
                    });
                },
                function(e) {

                })
        }
    }])
    // 已录入-LZN
    .controller('EnteredCtrl', ['$scope', '$state', 'Storage', 'LabtestImport', 'NgTableParams', '$timeout', function($scope, $state, Storage, LabtestImport, NgTableParams, $timeout) {
        var token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI1OTI2ZWNmZTkzYmNkNjM3ZTA2ODM5NDAiLCJ1c2VySWQiOiJVMjAxNzA1MjUwMDA5IiwibmFtZSI6IuiMueeUuyIsInJvbGUiOiJhZG1pbiIsImV4cCI6MTUwNTE4NTk2MjAwNCwiaWF0IjoxNTA1MDk5NTYyfQ.N0LeWbA6We2hCkYJNTM5wXfcx8a6KVDvayfFCjnq7lU"

        var getLists = function(currentPage, itemsPerPage) {
            $scope.lab = {
                "labtestImportStatus": 1,
                "limit": itemsPerPage,
                "skip": (currentPage - 1) * itemsPerPage,
                "token": Storage.get('TOKEN')
            }
            LabtestImport.GetLabtestInfo($scope.lab).then(
                function(data) {
                    $scope.labtestinfos = data.results;
                    for (var i = 0; i < $scope.labtestinfos.length; i++) {
                        if ($scope.labtestinfos[i].latestImportDate != null) {
                            var tmp = Date.parse($scope.labtestinfos[i].latestImportDate);
                            var stdate = new Date(tmp);
                            $scope.labtestinfos[i].latestImportDate = stdate.getFullYear() + '-' + (stdate.getMonth() + 1) + '-' + stdate.getDate();
                        }
                        if ($scope.labtestinfos[i].latestUploadTime != null) {
                            var tmp = Date.parse($scope.labtestinfos[i].latestUploadTime);
                            var stdate = new Date(tmp);
                            $scope.labtestinfos[i].latestUploadTime = stdate.getFullYear() + '-' + (stdate.getMonth() + 1) + '-' + stdate.getDate();
                        }
                    }
                    $scope.tableParams = new NgTableParams({
                        count: itemsPerPage
                    }, {
                        counts: [],
                        dataset: $scope.labtestinfos
                    });
                },
                function(e) {

                });
        }
        // 初始化
        $scope.currentPage = 1;
        $scope.itemsPerPage = 20;
        getLists($scope.currentPage, $scope.itemsPerPage);
        // 页面改变
        $scope.pageChanged = function() {
            console.log($scope.currentPage);
            getLists($scope.currentPage, $scope.itemsPerPage);
        }
        // 当前页面的总条目数改变
        $scope.changeLimit = function(num) {
            $scope.itemsPerPage = num;
            $scope.currentPage = 1;
            getLists($scope.currentPage, $scope.itemsPerPage);
        }
        // $scope.labtestinfos={};
        // $scope.lab = {
        //   "labtestImportStatus":1,
        //   "limit":10,
        //   "skip":0,
        //   "token":"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI1OTk1NWRkZGFiOGIwZDRlZDVlYjRjODIiLCJ1c2VySWQiOiJVMjAxNzA4MTcwMDAzIiwibmFtZSI6IuiMueeUuyIsInJvbGUiOiJoZWFsdGgiLCJleHAiOjE1MDQ3OTc0MTY1NTUsImlhdCI6MTUwNDc5MzgxNn0.nwvH3C_f3HwzD8ZCGgaBrr2lwokQo9be5UMK3p3QlTc"
        // }
        // LabtestImport.GetLabtestInfo($scope.lab).then(
        //   function (data) {
        //     $scope.labtestinfos = data.results;
        //      for(var i = 0;i < $scope.labtestinfos.length;i++) {
        //       if($scope.labtestinfos[i].latestImportDate != null) {
        //         var tmp = Date.parse($scope.labtestinfos[i].latestImportDate);
        //         var stdate = new Date(tmp);
        //         $scope.labtestinfos[i].latestImportDate = stdate.getFullYear() + '-' + (stdate.getMonth() + 1) + '-' + stdate.getDate();
        //       }
        //       if($scope.labtestinfos[i].latestUploadTime != null) {
        //           var tmp = Date.parse($scope.labtestinfos[i].latestUploadTime);
        //           var stdate = new Date(tmp);
        //           $scope.labtestinfos[i].latestUploadTime = stdate.getFullYear() + '-' + (stdate.getMonth() + 1) + '-' + stdate.getDate();
        //       }      
        //     }
        //      $scope.tableParams = new NgTableParams({
        //               count:15
        //           },
        //           {   counts:[],
        //               dataset:$scope.labtestinfos
        //           });
        // }, function (e) {

        // })
        // 获取已录入总人数
        $scope.count = '';
        var count = {
            "labtestImportStatus": 1,
            "token": Storage.get('TOKEN')
        }
        LabtestImport.GetCount(count).then(
            function(data) {
                $scope.count = data.results;
            },
            function(e) {

            })
        // 传Id和Name到LocalStorage
        $scope.getpatId = function(index) {
            Storage.set('patId', $scope.labtestinfos[index].userId);
            Storage.set('patName', $scope.labtestinfos[index].name);
        }
        // $scope.lastpage = function () {
        //   if($scope.lab.skip - $scope.lab.limit >= 0) {
        //     $scope.lab.skip -= $scope.lab.limit;
        //     LabtestImport.GetLabtestInfo($scope.lab).then(
        //     function (data) {
        //       $scope.labtestinfos = data.results;
        //       console.log($scope.labtestinfos);
        //       console.log(data.nexturl);
        //       $scope.tableParams = new NgTableParams({
        //                 count:15
        //             },
        //             {   counts:[],
        //                 dataset:$scope.labtestinfos
        //             });
        //     }, function (e) {

        //     });
        //   }     
        // }
        // $scope.nextpage = function () {
        //   $scope.lab.skip += $scope.lab.limit;
        //   LabtestImport.GetLabtestInfo($scope.lab).then(
        //   function (data) {
        //     $scope.labtestinfos = data.results;
        //     console.log($scope.labtestinfos);
        //     console.log(data.nexturl);
        //     $scope.tableParams = new NgTableParams({
        //               count:15
        //           },
        //           {   counts:[],
        //               dataset:$scope.labtestinfos
        //           });
        //   }, function (e) {

        //   });
        // }
        // 搜索
        $scope.search = function() {
            $scope.lab = {
                "labtestImportStatus": 1,
                "limit": $scope.itemsPerPage,
                "skip": ($scope.currentPage - 1) * $scope.itemsPerPage,
                "name": $scope.patientname,
                "token": Storage.get('TOKEN')
            }
            LabtestImport.GetLabtestInfo($scope.lab).then(
                function(data) {
                    $scope.labtestinfos = data.results;
                    console.log($scope.patientname);
                    console.log($scope.lab);
                    if ($scope.labtestinfos[0].latestImportDate != null) {
                        var tmp = Date.parse($scope.labtestinfos[0].latestImportDate);
                        var stdate = new Date(tmp);
                        $scope.labtestinfos[0].latestImportDate = stdate.getFullYear() + '-' + (stdate.getMonth() + 1) + '-' + stdate.getDate();
                    }
                    if ($scope.labtestinfos[0].latestUploadTime != null) {
                        var tmp = Date.parse($scope.labtestinfos[0].latestUploadTime);
                        var stdate = new Date(tmp);
                        $scope.labtestinfos[0].latestUploadTime = stdate.getFullYear() + '-' + (stdate.getMonth() + 1) + '-' + stdate.getDate();
                    }
                    $scope.tableParams = new NgTableParams({
                        count: $scope.itemsPerPage
                    }, {
                        counts: [],
                        dataset: $scope.labtestinfos
                    });
                },
                function(e) {

                })
        }
    }])
    .controller('LabInfoCtrl', ['$scope', '$state', 'Storage', 'LabtestImport', 'NgTableParams', '$uibModal', '$timeout', function($scope, $state, Storage, LabtestImport, NgTableParams, $uibModal, $timeout) {
        var token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI1OTI2ZWNmZTkzYmNkNjM3ZTA2ODM5NDAiLCJ1c2VySWQiOiJVMjAxNzA1MjUwMDA5IiwibmFtZSI6IuiMueeUuyIsInJvbGUiOiJhZG1pbiIsImV4cCI6MTUwNTE4NTk2MjAwNCwiaWF0IjoxNTA1MDk5NTYyfQ.N0LeWbA6We2hCkYJNTM5wXfcx8a6KVDvayfFCjnq7lU"


        $scope.Lab = '';
        $scope.patname = Storage.get('patName');
        $scope.Lab.LabType = {
            options: [
                '血肌酐',
                '尿蛋白',
                '血白蛋白',
                '血红蛋白',
                '肾小球滤过率'
            ],
            selected: '血肌酐'
        };
        // $scope.selecttype = {
        //   options:[
        //     '血常规',
        //     '血生化',
        //     '单次血糖',
        //     '药物浓度',
        //     '甲状旁腺激素',
        //     '血培养',
        //     '其他血液检查',
        //     '腹透液常规',
        //     '腹透液生化',
        //     '腹透液培养',
        //     '尿常规',
        //     '尿蛋白定量',
        //     '尿培养',
        //     '其他尿液检查',
        //     '大便常规',
        //     '其他化验'
        //   ],
        //   selected:''
        // };
        $scope.select = {};
        $scope.selecttype = {
            'options': [
                { 'option': '血常规', 'disable': true },
                { 'option': '血生化', 'disable': true },
                { 'option': '单次血糖', 'disable': true },
                { 'option': '药物浓度', 'disable': true },
                { 'option': '甲状旁腺激素', 'disable': true },
                { 'option': '血培养', 'disable': true },
                { 'option': '*其他血液检查', 'disable': false },
                { 'option': '腹透液常规', 'disable': true },
                { 'option': '腹透液生化', 'disable': true },
                { 'option': '腹透液培养', 'disable': true },
                { 'option': '尿常规', 'disable': true },
                { 'option': '尿蛋白定量', 'disable': true },
                { 'option': '尿培养', 'disable': true },
                { 'option': '*其他尿液检查', 'disable': false },
                { 'option': '大便常规', 'disable': true },
                { 'option': '*其他化验', 'disable': false }
            ],
            'selected': ''
        }
        console.log($scope.select.selected);
        $scope.custype = '';
        //   options:[
        //     '血常规',
        //     '血生化',
        //     '单次血糖',
        //     '药物浓度',
        //     '甲状旁腺激素',
        //     '血培养',
        //     '其他血液检查',
        //     '腹透液常规',
        //     '腹透液生化',
        //     '腹透液培养',
        //     '尿常规',
        //     '尿蛋白定量',
        //     '尿培养',
        //     '其他尿液检查',
        //     '大便常规',
        //     '其他化验'
        //   ],
        //   selected:''
        // };
        // 其他化验类型
        // if($scope.selecttype.selected == '其他血液检查' || $scope.selecttype.selected == '其他尿液检查' || $scope.selecttype.selected == '其他化验')

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
        //   var date = data.date,
        //     mode = data.mode;
        //   return mode === 'day' && (date.getDay() === 0 || date.getDay() === 6);
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
                    '血红蛋白',
                    '肾小球滤过率'
                ],
                selected: '血肌酐'
            },
            LabValue: 100,
            dt: new Date()
        }];
        $scope.Add = function($index) {
            // $scope.postBack.length<5
            if ($scope.postBack.length < 4) {
                console.log($scope.postBack[$index].dt);
                $scope.postBack.splice($index + 1, 0, {
                    LabType: {
                        options: [
                            '血肌酐',
                            '尿蛋白',
                            '血白蛋白',
                            '血红蛋白',
                            '肾小球滤过率'
                        ],
                        selected: '血肌酐'
                    },
                    LabValue: 100,
                    dt: new Date()
                });
            }
        }
        $scope.Remove = function($index) {
            if ($scope.postBack.length > 1)
                $scope.postBack.splice($index, 1);
        }
        //  $scope.myInterval = 5000;
        // $scope.noWrapSlides = false;
        $scope.active = 0;
        $scope.slides = [];

        var patient = {
            'patientId': Storage.get('patId'),
            "token": Storage.get('TOKEN')
        }
        LabtestImport.GetPhotoList(patient).then(
            function(data) {
                // 对结果的去“resized”处理
                for (var i = 0; i < data.results.length; i++) {
                    data.results[i].photo = data.results[i].photo.replace("resized", "");
                }

                $scope.slides = data.results;
                // var test=data.results;
                // $scope.slides = test;
                console.log(patient);
                console.log($scope.slides);
                // console.log($scope.slides[$index]);
                $scope.photoId = '';
                $scope.phototype = '';
                $scope.getphoto = function(index) {
                    $scope.photoId = $scope.slides[index].photoId;
                    console.log($scope.photoId);
                    console.log($scope.phototype);
                    $('#selecttype').modal('show');

                }
                $scope.skipphoto = function(index) {
                    $scope.photoId = $scope.slides[index].photoId;
                    console.log($scope.photoId);
                    $('#skip').modal('show');
                }
                $scope.gettype = function() {
                    if ($scope.custype == '') {
                        if (typeof($scope.select.selected) != 'undefined') $scope.phototype = $scope.select.selected.option;
                        else $scope.phototype = '';
                    } else $scope.phototype = $scope.custype;
                    console.log($scope.select.selected);
                    $('#selecttype').modal('hide');
                    $('#selecttype').on('hidden.bs.modal', function() {
                        $scope.select = {};
                        $scope.custype = '';
                        console.log($scope.phototype);
                    })
                }
            },
            function(e) {

            })

        LabtestImport.GetPatientLabTest(patient).then(
            function(data) {
                $scope.patientlabtests = data.results;
                for (var i = 0; i < $scope.patientlabtests.length; i++) {
                    switch ($scope.patientlabtests[i].type) {
                        case 'SCr':
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
                        case 'HB':
                            $scope.patientlabtests[i].type = "血红蛋白";
                            break;
                        default:
                            break;
                    }
                    if ($scope.patientlabtests[i].time != null) {
                        var tmp = Date.parse($scope.patientlabtests[i].time);
                        var stdate = new Date(tmp);
                        $scope.patientlabtests[i].time = stdate.getFullYear() + '-' + (stdate.getMonth() + 1) + '-' + stdate.getDate();
                    }
                    if ($scope.patientlabtests[i].importTime != null) {
                        var tmp = Date.parse($scope.patientlabtests[i].importTime);
                        var stdate = new Date(tmp);
                        $scope.patientlabtests[i].importTime = stdate.getFullYear() + '-' + (stdate.getMonth() + 1) + '-' + stdate.getDate();
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
        $scope.checkphoto = function() {
            console.log($scope.photoId);
            console.log($scope.phototype);
            if ($scope.photoId != '' && $scope.phototype != '') {
                $('#save').modal('show');
                $('#save').on('hidden.bs.modal', function() {
                    $scope.photoId = '';
                    $scope.phototype = '';
                })
            } else if ($scope.photoId == '') $('#selectphoto').modal('show');
            else $('#inputtype').modal('show');
        }
        // $scope.checkskip = function (index) {
        //   console.log($scope.photoId);
        //   if($scope.photoId != '' && $scope.phototype != '') {
        //     $('#skip').modal('show');
        //     $('#skip').on('hidden.bs.modal', function () {
        //     $scope.photoId = '';
        //     $scope.phototype = '';
        //     })
        //   }
        //   else if($scope.photoId == '') $('#selectphoto').modal('show');
        //   else $('#inputtype').modal('show');
        // }
        $scope.save = function() {
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
                        type = 'SCr';
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
                    case '血红蛋白':
                        type = 'HB';
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
                    "token": Storage.get('TOKEN')
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
                "photoType": $scope.phototype,
                "photoId": $scope.photoId,
                "token": Storage.get('TOKEN')
            }
            LabtestImport.LabelPhoto(label).then(
                function(data) {
                    console.log(data.results);
                    if (data.results == "图片录入状态修改成功") {
                        $('#save').modal('hide');
                        $('#save').on('hidden.bs.modal', function() {
                            $('#saved').modal('show');
                            $timeout(function() {
                                $('#saved').modal('hide');
                            }, 1000);
                            $('#saved').on('hidden.bs.modal', function() {
                                $scope.photoId = '';
                                $scope.phototype = '';
                                var patient = {
                                    'patientId': Storage.get('patId'),
                                    "token": Storage.get('TOKEN')
                                }
                                LabtestImport.GetPatientLabTest(patient).then(
                                    function(data) {
                                        console.log(data)
                                        $scope.patientlabtests = data.results;
                                        for (var i = 0; i < $scope.patientlabtests.length; i++) {
                                            switch ($scope.patientlabtests[i].type) {
                                                case 'SCr':
                                                    $scope.patientlabtests[i].type = "血肌酐";
                                                    break;
                                                case 'PRO':
                                                    $scope.patientlabtests[i].type = "尿蛋白";
                                                    break;
                                                case 'ALB':
                                                    $scope.patientlabtests[i].type = "血白蛋白";
                                                    break;
                                                case 'HB':
                                                    $scope.patientlabtests[i].type = "血红蛋白";
                                                    break;
                                                case 'GFR':
                                                    $scope.patientlabtests[i].type = "肾小球滤过率";
                                                    break;
                                                default:
                                                    break;
                                            }
                                            if ($scope.patientlabtests[i].time != null) {
                                                var tmp = Date.parse($scope.patientlabtests[i].time);
                                                var stdate = new Date(tmp);
                                                $scope.patientlabtests[i].time = stdate.getFullYear() + '-' + (stdate.getMonth() + 1) + '-' + stdate.getDate();
                                            }
                                            if ($scope.patientlabtests[i].importTime != null) {
                                                var tmp = Date.parse($scope.patientlabtests[i].importTime);
                                                var stdate = new Date(tmp);
                                                $scope.patientlabtests[i].importTime = stdate.getFullYear() + '-' + (stdate.getMonth() + 1) + '-' + stdate.getDate();
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
                                LabtestImport.GetPhotoList(patient).then(
                                    function(data) {
                                        $scope.slides = data.results;
                                        // var test=data.results;
                                        // $scope.slides = test;
                                        console.log(patient);
                                        console.log($scope.slides);
                                        // console.log($scope.slides[$index]);
                                        $scope.photoId = '';
                                        $scope.phototype = '';
                                        $scope.getphoto = function(index) {
                                            $scope.photoId = $scope.slides[index].photoId;
                                            console.log($scope.photoId);
                                            $('#selecttype').modal('show');
                                        }
                                        $scope.skipphoto = function(index) {
                                            $scope.photoId = $scope.slides[index].photoId;
                                            console.log($scope.photoId);
                                            $('#skip').modal('show');
                                        }
                                        $scope.gettype = function() {
                                            if ($scope.custype == '') {
                                                if (typeof($scope.select.selected) != 'undefined') $scope.phototype = $scope.select.selected.option;
                                                else $scope.phototype = '';
                                            } else $scope.phototype = $scope.custype;
                                            $('#selecttype').modal('hide');
                                            $('#selecttype').on('hidden.bs.modal', function() {
                                                $scope.select = {};
                                                $scope.custype = '';
                                                console.log($scope.phototype);
                                            })
                                        }
                                    },
                                    function(e) {

                                    })
                            })
                        })
                    }
                },
                function(e) {

                })
        }
        $scope.skip = function() {
            var label = {
                "photoId": $scope.photoId,
                "token": Storage.get('TOKEN')
            }
            LabtestImport.LabelPhoto(label).then(
                function(data) {
                    console.log(data.results);
                    if (data.results == "图片录入状态修改成功") {
                        $('#skip').modal('hide');
                        $('#skip').on('hidden.bs.modal', function() {
                            $('#skiped').modal('show');
                            $timeout(function() {
                                $('#skiped').modal('hide');
                            }, 1000);
                            $('#skiped').on('hidden.bs.modal', function() {
                                $scope.photoId = '';
                                $scope.phototype = '';
                                var patient = {
                                    'patientId': Storage.get('patId'),
                                    "token": Storage.get('TOKEN')
                                }
                                LabtestImport.GetPhotoList(patient).then(
                                    function(data) {
                                        $scope.slides = data.results;
                                        // var test=data.results;
                                        // $scope.slides = test;
                                        console.log(patient);
                                        console.log($scope.slides);
                                        // console.log($scope.slides[$index]);
                                        $scope.photoId = '';
                                        $scope.phototype = '';
                                        $scope.getphoto = function(index) {
                                            $scope.photoId = $scope.slides[index].photoId;
                                            console.log($scope.photoId);
                                            $('#selecttype').modal('show');
                                        }
                                        $scope.skipphoto = function(index) {
                                            $scope.photoId = $scope.slides[index].photoId;
                                            console.log($scope.photoId);
                                            $('#skip').modal('show');
                                        }
                                        $scope.gettype = function() {
                                            if ($scope.custype == '') $scope.phototype = $scope.select.selected.option;
                                            else $scope.phototype = $scope.custype;
                                            $('#selecttype').modal('hide');
                                            $('#selecttype').on('hidden.bs.modal', function() {
                                                $scope.select = {};
                                                $scope.custype = '';
                                                console.log($scope.phototype);
                                            })
                                        }
                                    },
                                    function(e) {

                                    })
                            })
                        })
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
    // 已录入患者的化验信息-LZN
    .controller('PatientLabInfoCtrl', ['$scope', '$state', 'Storage', 'LabtestImport', 'NgTableParams', '$timeout', function($scope, $state, Storage, LabtestImport, NgTableParams, $timeout) {
        var token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI1OTI2ZWNmZTkzYmNkNjM3ZTA2ODM5NDAiLCJ1c2VySWQiOiJVMjAxNzA1MjUwMDA5IiwibmFtZSI6IuiMueeUuyIsInJvbGUiOiJhZG1pbiIsImV4cCI6MTUwNTE4NTk2MjAwNCwiaWF0IjoxNTA1MDk5NTYyfQ.N0LeWbA6We2hCkYJNTM5wXfcx8a6KVDvayfFCjnq7lU"

        $scope.patname = Storage.get('patName')
        $scope.patientlabtests = {};
        var patient = {
            "patientId": Storage.get('patId'),
            "token": Storage.get('TOKEN')
        }
        LabtestImport.GetPatientLabTest(patient).then(
            function(data) {
                $scope.patientlabtests = data.results;
                for (var i = 0; i < $scope.patientlabtests.length; i++) {
                    switch ($scope.patientlabtests[i].type) {
                        case 'SCr':
                            $scope.patientlabtests[i].type = "血肌酐";
                            break;
                        case 'PRO':
                            $scope.patientlabtests[i].type = "尿蛋白";
                            break;
                        case 'ALB':
                            $scope.patientlabtests[i].type = "血白蛋白";
                            break;
                        case 'HB':
                            $scope.patientlabtests[i].type = "血红蛋白";
                            break;
                        case 'GFR':
                            $scope.patientlabtests[i].type = "肾小球滤过率";
                            break;
                        default:
                            break;
                    }
                    if ($scope.patientlabtests[i].time != null) {
                        var tmp = Date.parse($scope.patientlabtests[i].time);
                        var stdate = new Date(tmp);
                        $scope.patientlabtests[i].time = stdate.getFullYear() + '-' + (stdate.getMonth() + 1) + '-' + stdate.getDate();
                    }
                    if ($scope.patientlabtests[i].importTime != null) {
                        var tmp = Date.parse($scope.patientlabtests[i].importTime);
                        var stdate = new Date(tmp);
                        $scope.patientlabtests[i].importTime = stdate.getFullYear() + '-' + (stdate.getMonth() + 1) + '-' + stdate.getDate();
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
    // 查看/编辑已录入信息-LZN
    .controller('ModifyLabInfoCtrl', ['$scope', '$state', 'Storage', 'LabtestImport', 'NgTableParams', '$timeout', function($scope, $state, Storage, LabtestImport, NgTableParams, $timeout) {
        var token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI1OTI2ZWNmZTkzYmNkNjM3ZTA2ODM5NDAiLCJ1c2VySWQiOiJVMjAxNzA1MjUwMDA5IiwibmFtZSI6IuiMueeUuyIsInJvbGUiOiJhZG1pbiIsImV4cCI6MTUwNTE4NTk2MjAwNCwiaWF0IjoxNTA1MDk5NTYyfQ.N0LeWbA6We2hCkYJNTM5wXfcx8a6KVDvayfFCjnq7lU"

        $scope.patname = Storage.get('patName');
        var type = Storage.get('labtype');
        switch (Storage.get('labtype')) {
            case 'SCr':
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
            case 'HB':
                type = "血红蛋白";
                break;
            default:
                break;
        }

        var tmp = Date.parse(Storage.get('labdt'));
        var dt = new Date(tmp);
        console.log(dt);
        $scope.LabType = {
            options: [
                '血肌酐',
                '尿蛋白',
                '血白蛋白',
                '血红蛋白',
                '肾小球滤过率'
            ],
            selected: type
        };
        $scope.LabValue = parseFloat(Storage.get('labvalue'));
        console.log($scope.LabValue);
        $scope.today = function() {
            $scope.dt = new Date();
        };
        // $scope.today();
        $scope.dt = dt;
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
        //   var date = data.date,
        //     mode = data.mode;
        //   return mode === 'day' && (date.getDay() === 0 || date.getDay() === 6);
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
            "token": Storage.get('TOKEN')
        }
        LabtestImport.GetPhotobyLabtest(labtest).then(
            function(data) {
                $scope.photolist = data.results;

            },
            function(e) {

            })

        $scope.modify = function() {
            var unit = '';
            var type = '';
            var time = $scope.dt.getFullYear() + '-' + ($scope.dt.getMonth() + 1) + '-' + $scope.dt.getDate();
            switch ($scope.LabType.selected) {
                case '血肌酐':
                    type = 'SCr';
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
                case '血红蛋白':
                    type = 'HB';
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
                "token": Storage.get('TOKEN')
            }
            console.log(params);
            LabtestImport.EditResult(params).then(
                function(data) {
                    console.log(data.results);
                    if (data.results == "修改成功") {
                        $('#modify').modal('show');
                        $timeout(function() {
                            $('#modify').modal('hide');
                        }, 1000);
                        $('#modify').on('hidden.bs.modal', function() {
                            $state.go('main.patientlabinfo');
                        })
                    }
                },
                function(e) {

                })
        }

    }])
    // 已录入患者的化验信息-LZN
    .controller('PatientLabInfoCtrl', ['$scope', '$state', 'Storage', 'LabtestImport', 'NgTableParams', '$timeout', function($scope, $state, Storage, LabtestImport, NgTableParams, $timeout) {
        var token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI1OTI2ZWNmZTkzYmNkNjM3ZTA2ODM5NDAiLCJ1c2VySWQiOiJVMjAxNzA1MjUwMDA5IiwibmFtZSI6IuiMueeUuyIsInJvbGUiOiJhZG1pbiIsImV4cCI6MTUwNTE4NTk2MjAwNCwiaWF0IjoxNTA1MDk5NTYyfQ.N0LeWbA6We2hCkYJNTM5wXfcx8a6KVDvayfFCjnq7lU"

        $scope.patname = Storage.get('patName')
        $scope.patientlabtests = {}
        var patient = {
            'patientId': Storage.get('patId'),
            "token": Storage.get('TOKEN')
        }
        LabtestImport.GetPatientLabTest(patient).then(
            function(data) {
                $scope.patientlabtests = data.results
                for (var i = 0; i < $scope.patientlabtests.length; i++) {
                    switch ($scope.patientlabtests[i].type) {
                        case 'SCr':
                            $scope.patientlabtests[i].type = '血肌酐'
                            break
                        case 'PRO':
                            $scope.patientlabtests[i].type = '尿蛋白'
                            break
                        case 'ALB':
                            $scope.patientlabtests[i].type = '血白蛋白'
                            break
                        case 'GFR':
                            $scope.patientlabtests[i].type = '肾小球滤过率'
                            break
                        default:
                            break
                    }
                    if ($scope.patientlabtests[i].time != null) {
                        var tmp = Date.parse($scope.patientlabtests[i].time)
                        var stdate = new Date(tmp)
                        $scope.patientlabtests[i].time = stdate.getFullYear() + '-' + (stdate.getMonth() + 1) + '-' + stdate.getDate()
                    }
                    if ($scope.patientlabtests[i].importTime != null) {
                        var tmp = Date.parse($scope.patientlabtests[i].importTime)
                        var stdate = new Date(tmp)
                        $scope.patientlabtests[i].importTime = stdate.getFullYear() + '-' + (stdate.getMonth() + 1) + '-' + stdate.getDate()
                    }
                }
                console.log($scope.patientlabtests)
                $scope.tableParams = new NgTableParams({
                    count: 15
                }, {
                    counts: [],
                    dataset: $scope.patientlabtests
                })
            },
            function(e) {

            })
        $scope.getlabtestId = function(index) {
            Storage.set('labtestId', $scope.patientlabtests[index].labtestId)
            Storage.set('labtype', $scope.patientlabtests[index].type)
            Storage.set('labvalue', $scope.patientlabtests[index].value)
            Storage.set('labdt', $scope.patientlabtests[index].time)
        }
    }])
    // 查看/编辑已录入信息-LZN
    .controller('ModifyLabInfoCtrl', ['$scope', '$state', 'Storage', 'LabtestImport', 'NgTableParams', '$timeout', function($scope, $state, Storage, LabtestImport, NgTableParams, $timeout) {
        $scope.patname = Storage.get('patName')
        var type = Storage.get('labtype')
        switch (Storage.get('labtype')) {
            case 'SCr':
                type = '血肌酐'
                break
            case 'PRO':
                type = '尿蛋白'
                break
            case 'GFR':
                type = '肾小球滤过率'
                break
            case 'ALB':
                type = '血白蛋白'
                break
            default:
                break
        }

        var tmp = Date.parse(Storage.get('labdt'))
        var dt = new Date(tmp)
        console.log(dt)
        $scope.LabType = {
            options: [
                '血肌酐',
                '尿蛋白',
                '血白蛋白',
                '肾小球滤过率'
            ],
            selected: type
        }
        $scope.LabValue = parseFloat(Storage.get('labvalue'))
        console.log($scope.LabValue)
        $scope.today = function() {
            $scope.dt = new Date()
        }
        // $scope.today();
        $scope.dt = dt
        console.log($scope.dt)
        $scope.clear = function() {
            $scope.dt = null
        }
        $scope.inlineOptions = {
            customClass: getDayClass,
            minDate: new Date(),
            showWeeks: true
        }

        $scope.dateOptions = {
            // dateDisabled: disabled,
            formatYear: 'yy',
            maxDate: new Date(2020, 5, 22),
            minDate: null,
            startingDay: 1
        }
        // function disabled(data) {
        //   var date = data.date,
        //     mode = data.mode;
        //   return mode === 'day' && (date.getDay() === 0 || date.getDay() === 6);
        // }
        $scope.open = function() {
            // console.log($index);
            $scope.popup.opened = true
        }
        $scope.setDate = function(year, month, day) {
            $scope.dt = new Date(year, month, day)
        }
        $scope.popup = {
            opened: false
        }

        function getDayClass(data) {
            var date = data.date,
                mode = data.mode
            if (mode === 'day') {
                var dayToCheck = new Date(date).setHours(0, 0, 0, 0)
                for (var i = 0; i < $scope.events.length; i++) {
                    var currentDay = new Date($scope.events[i].date).setHours(0, 0, 0, 0)
                    if (dayToCheck === currentDay) {
                        return $scope.events[i].status
                    }
                }
            }
            return ''
        }
        $scope.photolist = {}
        var labtest = {
            'labtestId': Storage.get('labtestId'),
            "token": Storage.get('TOKEN')
        }
        LabtestImport.GetPhotobyLabtest(labtest).then(
            function(data) {
                console.log(data.results)
                data.results.photo = data.results.photo.replace("resized", "");
                $scope.photolist = data.results
            },
            function(e) {

            })

        $scope.modify = function() {
            var unit = ''
            var type = ''
            var time = $scope.dt.getFullYear() + '-' + ($scope.dt.getMonth() + 1) + '-' + $scope.dt.getDate()
            switch ($scope.LabType.selected) {
                case '血肌酐':
                    type = 'SCr'
                    unit = 'umol/L'
                    break
                case '尿蛋白':
                    type = 'PRO'
                    unit = 'mg/d'
                    break
                case '血白蛋白':
                    type = 'ALB'
                    unit = 'g/L'
                    break
                case '肾小球滤过率':
                    type = 'GFR'
                    unit = 'ml/min'
                    break
                default:
                    break
            }
            var params = {
                'labtestId': Storage.get('labtestId'),
                'time': time,
                'type': type,
                'value': $scope.LabValue,
                'unit': unit,
                "token": Storage.get('TOKEN')
            }
            console.log(params)
            LabtestImport.EditResult(params).then(
                function(data) {
                    console.log(data.results)
                    if (data.results == '修改成功') {
                        $('#modify').modal('show')
                        $timeout(function() {
                            $('#modify').modal('hide')
                        }, 1000)
                        // $('#modify').on('hidden.bs.modal', function() {
                        //     $state.go('main.patientlabinfo')
                        // })
                    }
                },
                function(e) {

                })
        }
    }])

    // 用户管理--张桠童
    .controller('UserManageCtrl', ['$scope', '$state', 'Storage', '$timeout', function($scope, $state, Storage, $timeout) {
        Storage.set('Tab', 1)
        $scope.toallUsers = function() {
            $state.go('main.usermanage.allUsers')
        }
        $scope.todoctors = function() {
            $state.go('main.usermanage.doctors')
        }
        $scope.tonurses = function() {
            $state.go('main.usermanage.nurses')
        }
        $scope.topatients = function() {
            $state.go('main.usermanage.patients')
        }
        $scope.toinsuranceOfficers = function() {
            $state.go('main.usermanage.insuranceOfficers')
        }
        $scope.tohealthOfficers = function() {
            $state.go('main.usermanage.healthOfficers')
        }
        $scope.toadministrators = function() {
            $state.go('main.usermanage.administrators')
        }
    }])
    // 所有用户--张桠童
    .controller('allUsersCtrl', ['$scope', '$state', 'Storage', 'NgTableParams', '$timeout', '$uibModal', 'Alluser', 'Roles', '$window',
        function($scope, $state, Storage, NgTableParams, $timeout, $uibModal, Alluser, Roles, $window) {
            var token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI1OTI2ZWNmZTkzYmNkNjM3ZTA2ODM5NDAiLCJ1c2VySWQiOiJVMjAxNzA1MjUwMDA5IiwibmFtZSI6IuiMueeUuyIsInJvbGUiOiJhZG1pbiIsImV4cCI6MTUwNTE4NTk2MjAwNCwiaWF0IjoxNTA1MDk5NTYyfQ.N0LeWbA6We2hCkYJNTM5wXfcx8a6KVDvayfFCjnq7lU"

            Storage.set('Tab', 1)
            // -----------获取列表总条数------------------
            var getTotalNums = function(role1) {
                var countInfo = {
                    token: Storage.get('TOKEN'),
                    role1: role1
                }
                console.log(countInfo)
                var promise = Alluser.getCount(countInfo)
                promise.then(function(data) {
                    console.log(data.results)
                    $scope.totalNums = data.results
                }, function() {})
            }
            // -------------------------------------------

            // ---------------获取搜索(或未搜索)列表及列表数------------------------
            var getLists = function(currentPage, itemsPerPage, _userlist, role_count) {
                // 完善userlist
                var userlist = _userlist
                userlist.token = Storage.get('TOKEN')
                userlist.limit = itemsPerPage
                userlist.skip = (currentPage - 1) * itemsPerPage
                // 完善countInfo
                var countInfo = userlist
                countInfo.role1 = role_count
                if (userlist.role != undefined) countInfo.role2 = userlist.role
                // 获取总条目数
                console.log(countInfo)
                var promise = Alluser.getCount(countInfo)
                promise.then(function(data) {
                    console.log(data.results)
                    $scope.totalItems = data.results
                }, function() {})
                // 获取搜索列表
                console.log(userlist)
                var promise = Alluser.getUserList(userlist)
                promise.then(function(data) {
                    console.log(data.results)
                    $scope.tableParams = new NgTableParams({
                        count: 10000
                    }, {
                        counts: [],
                        dataset: data.results
                    })
                }, function(err) {})
            }
            // ---------------------------------------------------------------------

            // -------判断某角色在角色数组中是否存在-------
            var existRole = function(role, roles) {
                for (var i = 0; i < roles.length; ++i) {
                    if (roles[i] == role) {
                        return true
                    }
                }
            }
            // --------------------------------------------

            // 初始化列表
            getTotalNums(0)
            $scope.currentPage = 1
            $scope.itemsPerPage = 50
            $scope.userlist = {}
            getLists($scope.currentPage, $scope.itemsPerPage, $scope.userlist, 0)

            // 页面改变
            $scope.pageChanged = function() {
                console.log($scope.currentPage)
                getLists($scope.currentPage, $scope.itemsPerPage, $scope.userlist, 0)
            }
            // 当前页面的总条目数改变
            $scope.changeLimit = function(num) {
                $scope.itemsPerPage = num
                $scope.currentPage = 1
                getLists($scope.currentPage, $scope.itemsPerPage, $scope.userlist, 0)
            }
            // 搜索
            $scope.search_roles = [
                { id: 'Leader', name: '地区负责人' },
                { id: 'master', name: '科主任' },
                { id: 'doctor', name: '普通医生' },
                { id: 'patient', name: '患者' },
                { id: 'nurse', name: '护士' },
                { id: 'insuranceA', name: '沟通人员' },
                { id: 'insuranceC', name: '保险主管' },
                { id: 'insuranceR', name: '录入人员' },
                { id: 'health', name: '健康专员' },
                { id: 'admin', name: '管理员' }
            ]
            $scope.search_genders = [
                { id: 1, name: '男' },
                { id: 2, name: '女' }
            ]
            $scope.searchList = function() {
                console.log($scope.userlist)
                getLists($scope.currentPage, $scope.itemsPerPage, $scope.userlist, 0)
            }
            // 清空搜索
            $scope.searchClear = function() {
                $scope.userlist = {}
                getLists($scope.currentPage, $scope.itemsPerPage, $scope.userlist, 0)
            }
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
                            return userID
                        }
                    }
                })
                modalInstance.result.then(function() {
                    var cancelUserinfo = {
                        'userId': userID,
                        'token': token
                    }
                    var promise = Alluser.cancelUser(cancelUserinfo)
                    promise.then(function(data) {
                        // console.log(data);
                        if (data.msg == 'success!') {
                            $('#confirmSuccess').modal('show')
                            $timeout(function() {
                                $('#confirmSuccess').modal('hide')
                                // 刷新所有用户列表
                                $scope.currentPage = 1
                                getTotalNums(0)
                                getLists($scope.currentPage, $scope.itemsPerPage, $scope.userlist, 0)
                            }, 1000)
                        }
                    }, function(err) {})
                }, function() {})
            }
            // 监听事件(表单清空)
            $('#changeRoles').on('hidden.bs.modal', function() {
                $('#changeRolesForm').formValidation('resetForm', true)
            })
            // 关闭modal控制
            $scope.modal_close = function(target) {
                $(target).modal('hide')
            }
            // 为获取多选框初始状态所设变量
            var userdetail_temp = []
            $scope.openChangeRoles = function(userdetail) {
                console.log(userdetail.role)
                userdetail_temp = userdetail
                var role_temp = {
                    Leader: false,
                    master: false,
                    doctor: false,
                    patient: false,
                    nurse: false,
                    insuranceA: false,
                    insuranceC: false,
                    insuranceR: false,
                    health: false,
                    admin: false
                }
                for (var i = 0; i < userdetail.role.length; ++i) {
                    role_temp[userdetail.role[i]] = true
                }
                console.log(role_temp)
                // 初始化
                $scope.role_end = role_temp
                // 是否无效，true为无效，默认设置地区负责人和科主任无效
                $scope.ifDisabled = {
                    Leader: true,
                    master: true,
                    doctor: false,
                    patient: false,
                    nurse: false,
                    insuranceA: false,
                    insuranceC: false,
                    insuranceR: false,
                    health: false,
                    admin: false
                }
                if (existRole('doctor', userdetail.role)) {
                    $scope.ifDisabled.doctor = true
                    $scope.ifDisabled.patient = true
                } else if (existRole('nurse', userdetail.role)) {
                    $scope.ifDisabled.patient = true
                } else if (existRole('patient', userdetail.role)) {
                    $scope.ifDisabled.patient = true
                    $scope.ifDisabled.doctor = true
                    $scope.ifDisabled.Leader = true
                    $scope.ifDisabled.master = true
                    $scope.ifDisabled.nurse = true
                } else if (existRole('admin', userdetail.role)) {
                    $scope.ifDisabled.patient = true
                    $scope.ifDisabled.doctor = true
                    $scope.ifDisabled.Leader = true
                    $scope.ifDisabled.master = true
                    $scope.ifDisabled.nurse = true
                } else {
                    $scope.ifDisabled.patient = true
                    $scope.ifDisabled.doctor = true
                    $scope.ifDisabled.Leader = true
                    $scope.ifDisabled.master = true
                    $scope.ifDisabled.nurse = true
                    $scope.ifDisabled.admin = true
                }
            }
            // 确定是否更改
            $scope.toChangeOrNot = function() {
                $('#changeRoles').modal('hide')
                $('#changeRolesOrNot').modal('show')
            }
            // 更改角色
            $scope.roles_change = function() {
                $('#changeRolesOrNot').modal('hide')
                console.log($scope.role_end)
                // 角色变化前的状态
                var role_before = {
                    Leader: false,
                    master: false,
                    doctor: false,
                    patient: false,
                    nurse: false,
                    insuranceA: false,
                    insuranceC: false,
                    insuranceR: false,
                    health: false,
                    admin: false
                }
                for (var i = 0; i < userdetail_temp.role.length; ++i) {
                    role_before[userdetail_temp.role[i]] = true
                }
                console.log(role_before)
                // 获取增删角色数组
                var role_add = []
                var role_remove = []
                if (role_before.Leader == false && $scope.role_end.Leader == true) role_add.push('Leader')
                if (role_before.Leader == true && $scope.role_end.Leader == false) role_remove.push('Leader')
                if (role_before.master == false && $scope.role_end.master == true) role_add.push('master')
                if (role_before.master == true && $scope.role_end.master == false) role_remove.push('master')
                if (role_before.doctor == false && $scope.role_end.doctor == true) role_add.push('doctor')
                if (role_before.doctor == true && $scope.role_end.doctor == false) role_remove.push('doctor')
                if (role_before.patient == false && $scope.role_end.patient == true) role_add.push('patient')
                if (role_before.patient == true && $scope.role_end.patient == false) role_remove.push('patient')
                if (role_before.nurse == false && $scope.role_end.nurse == true) role_add.push('nurse')
                if (role_before.nurse == true && $scope.role_end.nurse == false) role_remove.push('nurse')
                if (role_before.insuranceA == false && $scope.role_end.insuranceA == true) role_add.push('insuranceA')
                if (role_before.insuranceA == true && $scope.role_end.insuranceA == false) role_remove.push('insuranceA')
                if (role_before.insuranceC == false && $scope.role_end.insuranceC == true) role_add.push('insuranceC')
                if (role_before.insuranceC == true && $scope.role_end.insuranceC == false) role_remove.push('insuranceC')
                if (role_before.insuranceR == false && $scope.role_end.insuranceR == true) role_add.push('insuranceR')
                if (role_before.insuranceR == true && $scope.role_end.insuranceR == false) role_remove.push('insuranceR')
                if (role_before.health == false && $scope.role_end.health == true) role_add.push('health')
                if (role_before.health == true && $scope.role_end.health == false) role_remove.push('health')
                if (role_before.admin == false && $scope.role_end.admin == true) role_add.push('admin')
                if (role_before.admin == true && $scope.role_end.admin == false) role_remove.push('admin')
                console.log(role_add)
                console.log(role_remove)
                // 添加角色
                for (var i = 0; i < role_add.length; ++i) {
                    var addInfo = {
                        userId: userdetail_temp.userId,
                        roles: role_add[i],
                        token: Storage.get('TOKEN')
                    }
                    var promise = Roles.addRoles(addInfo)
                    promise.then(function(data) {
                        console.log(data)
                        // if (data.mesg=="User Register Success!") continue
                    })
                }
                // 去除角色
                for (var i = 0; i < role_remove.length; ++i) {
                    var removeInfo = {
                        userId: userdetail_temp.userId,
                        roles: role_remove[i],
                        token: Storage.get('TOKEN')
                    }
                    var promise = Roles.removeRoles(removeInfo)
                    promise.then(function(data) {
                        console.log(data)
                        // if (data.mesg=="User Register Success!") continue
                    })
                }
                // 提示修改成功
                $('#changeRolesSuccess').modal('show')
                $timeout(function() {
                    $('#changeRolesSuccess').modal('hide')
                }, 1000)
                $timeout(function() {
                    // 刷新列表
                    $scope.currentPage = 1
                    getTotalNums(0)
                    getLists($scope.currentPage, $scope.itemsPerPage, $scope.userlist, 0)
                }, 1000)
            }
        }
    ])
    // 所有用户--注销modal--张桠童
    .controller('confirmCtrl', ['$scope', '$state', 'Storage', 'NgTableParams', '$timeout', '$uibModal', 'Alluser', '$uibModalInstance', 'userID',
        function($scope, $state, Storage, NgTableParams, $timeout, $uibModal, Alluser, $uibModalInstance, userID) {
            $scope.close = function() {
                $uibModalInstance.dismiss()
            }
            $scope.ok = function() {
                $uibModalInstance.close()
            }
        }
    ])
    // 医生--张桠童
    .controller('doctorsCtrl', ['$scope', '$state', 'Storage', 'NgTableParams', '$timeout', '$uibModal', 'Alluser', 'Roles', 'Doctor', 'Mywechat',
        function($scope, $state, Storage, NgTableParams, $timeout, $uibModal, Alluser, Roles, Doctor, Mywechat) {
            var token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI1OTI2ZWNmZTkzYmNkNjM3ZTA2ODM5NDAiLCJ1c2VySWQiOiJVMjAxNzA1MjUwMDA5IiwibmFtZSI6IuiMueeUuyIsInJvbGUiOiJhZG1pbiIsImV4cCI6MTUwNTE4NTk2MjAwNCwiaWF0IjoxNTA1MDk5NTYyfQ.N0LeWbA6We2hCkYJNTM5wXfcx8a6KVDvayfFCjnq7lU"

            Storage.set('Tab', 1)

            // -----------获取列表总条数------------------
            var getTotalNums = function(role1) {
                var countInfo = {
                    token: Storage.get('TOKEN'),
                    role1: role1
                }
                console.log(countInfo)
                var promise = Alluser.getCount(countInfo)
                promise.then(function(data) {
                    console.log(data.results)
                    $scope.totalNums = data.results
                }, function() {})
            }
            // -------------------------------------------

            // ---------------获取搜索(或未搜索)列表及列表数------------------------
            var getLists = function(currentPage, itemsPerPage, _userlist, role_count) {
                // 完善userlist
                var userlist = _userlist
                userlist.token = Storage.get('TOKEN')
                userlist.limit = itemsPerPage
                userlist.skip = (currentPage - 1) * itemsPerPage
                // 完善countInfo
                var countInfo = userlist
                countInfo.role1 = role_count
                if (userlist.role != undefined) countInfo.role2 = userlist.role
                // 获取总条目数
                console.log(countInfo)
                var promise = Alluser.getCount(countInfo)
                promise.then(function(data) {
                    console.log(data.results)
                    $scope.totalItems = data.results
                }, function() {})
                // 获取搜索列表
                console.log(userlist)
                var promise = Alluser.getDoctorList(userlist)
                promise.then(function(data) {
                    console.log(data.results)
                    // 首先处理一下要显示的roles
                    for (var i = 0; i < data.results.length; i++) {
                        var roles = data.results[i].role
                        for (var j = 0; j < roles.length; j++) {
                            if (roles[j] == 'Leader') {
                                data.results[i].role = 'Leader'
                            }
                            if (roles[j] == 'master') {
                                data.results[i].role = 'master'
                            }
                            if (roles[j] == 'doctor') {
                                data.results[i].role = 'doctor'
                            }
                        }
                    }
                    $scope.tableParams = new NgTableParams({
                        count: 10000
                    }, {
                        counts: [],
                        dataset: data.results
                    })
                }, function(err) {})
            }
            // ---------------------------------------------------------------------

            // 初始化列表
            getTotalNums(1)
            $scope.currentPage = 1
            $scope.itemsPerPage = 50
            $scope.userlist = {}
            getLists($scope.currentPage, $scope.itemsPerPage, $scope.userlist, 1)
            // 页面改变
            $scope.pageChanged = function() {
                console.log($scope.currentPage)
                getLists($scope.currentPage, $scope.itemsPerPage, $scope.userlist, 1)
            }
            // 当前页面的总条目数改变
            $scope.changeLimit = function(num) {
                $scope.itemsPerPage = num
                $scope.currentPage = 1
                getLists($scope.currentPage, $scope.itemsPerPage, $scope.userlist, 1)
            }
            // 搜索
            $scope.search_roles = [
                { id: 'Leader', name: '地区负责人' },
                { id: 'master', name: '科主任' },
                { id: 'doctor', name: '普通医生' }
            ]
            $scope.search_genders = [
                { id: 1, name: '男' },
                { id: 2, name: '女' }
            ]
            $scope.searchList = function() {
                console.log($scope.userlist)
                getLists($scope.currentPage, $scope.itemsPerPage, $scope.userlist, 1)
            }
            // 清空搜索
            $scope.searchClear = function() {
                $scope.userlist = {}
                getLists($scope.currentPage, $scope.itemsPerPage, $scope.userlist, 1)
            }
            // 关闭modal控制
            $scope.modal_close = function(target) {
                $(target).modal('hide')
            }

            $scope.openQR = function(userdetail) {
                $scope.TDCticket = undefined
                var promise = Doctor.getDoctorInfo({ userId: userdetail.userId })
                promise.then(function(data) {
                    console.log(data)
                    if (angular.isDefined($scope.TDCticket) != true) {
                        var params = {
                            'role': 'doctor',
                            'userId': userdetail.userId,
                            'postdata': {
                                'action_name': 'QR_LIMIT_STR_SCENE',
                                'action_info': {
                                    'scene': {
                                        'scene_str': userdetail.userId
                                    }
                                },
                                'token': token
                            }
                        }
                        Mywechat.createTDCticket(params).then(function(data) {
                            $scope.TDCticket = 'https://mp.weixin.qq.com/cgi-bin/showqrcode?ticket=' + data.results.TDCticket
                        }, function(err) {
                            console.log(err)
                        })
                    } else {
                        $scope.TDCticket = 'https://mp.weixin.qq.com/cgi-bin/showqrcode?ticket=' + $scope.TDCticket
                    }
                }, function(err) {})
                $('#doctorQR').modal('show')

            }

            // 详细信息modal
            $scope.openDetail = function(userdetail) {
                var modalInstance = $uibModal.open({
                    animation: true,
                    ariaLabelledBy: 'modal-title',
                    ariaDescribedBy: 'modal-body',
                    templateUrl: 'detail_doctor.html',
                    controller: 'detail_doctorCtrl',
                    // size: 'sm',
                    resolve: {
                        userdetail: function() {
                            return userdetail
                        }
                    }
                })
                modalInstance.result.then(function(con) {
                    if (con == '注销用户') {
                        // 确认是否注销
                        $('#cancelOrNot').modal('show')
                        // 给modal传参
                        $scope.userdetail = userdetail
                    } else if (con == '去除角色') {
                        // 确认是否去除角色
                        $('#removeOrNot').modal('show')
                        // 给modal传参
                        $scope.userdetail = userdetail
                    }
                }, function() {})
            }
            // 注销用户
            $scope.cancel = function(userdetail) {
                // 关闭警告modal（是否注销）
                $('#cancelOrNot').modal('hide')
                // 注销用户输入
                var cancelUserinfo = {
                    'userId': userdetail.userId,
                    'token': token
                }
                // 注销该用户
                var promise = Alluser.cancelUser(cancelUserinfo)
                promise.then(function(data) {
                    // console.log(data);
                    if (data.msg == 'success!') {
                        // 提示注销成功
                        $('#cancelSuccess').modal('show')
                        $timeout(function() {
                            // 关闭提示
                            $('#cancelSuccess').modal('hide')
                            // 刷新医生列表
                            $scope.currentPage = 1
                            getTotalNums(1)
                            getLists($scope.currentPage, $scope.itemsPerPage, $scope.userlist, 1)
                        }, 1000)
                    }
                }, function(err) {})
            }
            // 去除角色
            $scope.remove = function(userdetail) {
                // 关闭警告（是否去除角色）
                $('#removeOrNot').modal('hide')
                // 去除角色方法输入
                var removeInfo = {
                    'userId': userdetail.userId,
                    'roles': userdetail.role,
                    'token': token
                }
                // 去除该角色
                var promise = Roles.removeRoles(removeInfo)
                promise.then(function(data) {
                    // console.log(data);
                    if (data.mesg == 'User Register Success!') {
                        // 提示去除成功
                        $('#removeSuccess').modal('show')
                        $timeout(function() {
                            // 关闭提示
                            $('#removeSuccess').modal('hide')
                            // 刷新医生列表
                            $scope.currentPage = 1
                            getTotalNums(1)
                            getLists($scope.currentPage, $scope.itemsPerPage, $scope.userlist, 1)
                        }, 1000)
                    };
                }, function(err) {})
            }
        }
    ])
    // 医生--详细信息modal--张桠童
    .controller('detail_doctorCtrl', ['$scope', '$state', 'Storage', 'NgTableParams', '$timeout', '$uibModal', 'Alluser', '$uibModalInstance', 'userdetail',
        function($scope, $state, Storage, NgTableParams, $timeout, $uibModal, Alluser, $uibModalInstance, userdetail) {
            // console.log(userdetail);
            $scope.doctorInfo = userdetail
            // 关闭modal
            $scope.close = function() {
                $uibModalInstance.dismiss()
            }
            // 注销用户
            $scope.cancelUser = function() {
                $uibModalInstance.close('注销用户')
            }
            // 去除角色
            $scope.removeUserRoles = function() {
                $uibModalInstance.close('去除角色')
            }
        }
    ])
    // 护士--张桠童
    .controller('nursesCtrl', ['$scope', '$state', 'Storage', 'NgTableParams', '$timeout', '$uibModal', 'Alluser', 'Roles',
        function($scope, $state, Storage, NgTableParams, $timeout, $uibModal, Alluser, Roles) {
            var token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI1OTI2ZWNmZTkzYmNkNjM3ZTA2ODM5NDAiLCJ1c2VySWQiOiJVMjAxNzA1MjUwMDA5IiwibmFtZSI6IuiMueeUuyIsInJvbGUiOiJhZG1pbiIsImV4cCI6MTUwNTE4NTk2MjAwNCwiaWF0IjoxNTA1MDk5NTYyfQ.N0LeWbA6We2hCkYJNTM5wXfcx8a6KVDvayfFCjnq7lU"

            // -----------获取列表总条数------------------
            var getTotalNums = function(role1) {
                var countInfo = {
                    token: Storage.get('TOKEN'),
                    role1: role1
                }
                console.log(countInfo)
                var promise = Alluser.getCount(countInfo)
                promise.then(function(data) {
                    console.log(data.results)
                    $scope.totalNums = data.results
                }, function() {})
            }
            // -------------------------------------------

            // ---------------获取搜索(或未搜索)列表及列表数------------------------
            var getLists = function(currentPage, itemsPerPage, _userlist, role_count) {
                // 完善userlist
                var userlist = _userlist
                userlist.token = Storage.get('TOKEN')
                userlist.limit = itemsPerPage
                userlist.skip = (currentPage - 1) * itemsPerPage
                // 完善countInfo
                var countInfo = userlist
                countInfo.role1 = role_count
                if (userlist.role != undefined) countInfo.role2 = userlist.role
                // 获取总条目数
                console.log(countInfo)
                var promise = Alluser.getCount(countInfo)
                promise.then(function(data) {
                    console.log(data.results)
                    $scope.totalItems = data.results
                }, function() {})
                // 获取搜索列表
                console.log(userlist)
                var promise = Alluser.getNurseList(userlist)
                promise.then(function(data) {
                    console.log(data.results)
                    $scope.tableParams = new NgTableParams({
                        count: 10000
                    }, {
                        counts: [],
                        dataset: data.results
                    })
                }, function(err) {})
            }
            // ---------------------------------------------------------------------

            // 初始化列表
            getTotalNums(3)
            $scope.currentPage = 1
            $scope.itemsPerPage = 50
            $scope.userlist = {}
            getLists($scope.currentPage, $scope.itemsPerPage, $scope.userlist, 3)
            // 页面改变
            $scope.pageChanged = function() {
                console.log($scope.currentPage)
                getLists($scope.currentPage, $scope.itemsPerPage, $scope.userlist, 3)
            }
            // 当前页面的总条目数改变
            $scope.changeLimit = function(num) {
                $scope.itemsPerPage = num
                $scope.currentPage = 1
                getLists($scope.currentPage, $scope.itemsPerPage, $scope.userlist, 3)
            }
            // 搜索
            $scope.search_genders = [
                { id: 1, name: '男' },
                { id: 2, name: '女' }
            ]
            $scope.searchList = function() {
                console.log($scope.userlist)
                getLists($scope.currentPage, $scope.itemsPerPage, $scope.userlist, 3)
            }
            // 清空搜索
            $scope.searchClear = function() {
                $scope.userlist = {}
                getLists($scope.currentPage, $scope.itemsPerPage, $scope.userlist, 3)
            }
            // 关闭modal控制
            $scope.modal_close = function(target) {
                $(target).modal('hide')
            }
            // 详细信息modal
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
                            return userdetail
                        }
                    }
                })
                modalInstance.result.then(function(con) {
                    if (con == '注销用户') {
                        // 确认是否注销
                        $('#cancelOrNot').modal('show')
                        // 给modal传参
                        $scope.userdetail = userdetail
                    } else if (con == '去除角色') {
                        // 确认是否去除角色
                        $('#removeOrNot').modal('show')
                        // 给modal传参
                        $scope.userdetail = userdetail
                    }
                }, function() {})
            }
            // 注销用户
            $scope.cancel = function(userdetail) {
                // 关闭警告modal（是否注销）
                $('#cancelOrNot').modal('hide')
                // 注销用户输入
                var cancelUserinfo = {
                    'userId': userdetail.userId,
                    'token': token
                }
                // 注销该用户
                var promise = Alluser.cancelUser(cancelUserinfo)
                promise.then(function(data) {
                    // console.log(data);
                    if (data.msg == 'success!') {
                        // 提示注销成功
                        $('#cancelSuccess').modal('show')
                        $timeout(function() {
                            // 关闭提示
                            $('#cancelSuccess').modal('hide')
                            // 刷新护士列表
                            $scope.currentPage = 1
                            getTotalNums(3)
                            getLists($scope.currentPage, $scope.itemsPerPage, $scope.userlist, 3)
                        }, 1000)
                    }
                }, function(err) {})
            }
            // 去除角色
            $scope.remove = function(userdetail) {
                // 关闭警告（是否去除角色）
                $('#removeOrNot').modal('hide')
                // 去除角色方法输入
                var removeInfo = {
                    'userId': userdetail.userId,
                    'roles': 'nurse',
                    'token': token
                }
                // 去除该角色
                var promise = Roles.removeRoles(removeInfo)
                promise.then(function(data) {
                    // console.log(data);
                    if (data.mesg == 'User Register Success!') {
                        // 提示去除成功
                        $('#removeSuccess').modal('show')
                        $timeout(function() {
                            // 关闭提示
                            $('#removeSuccess').modal('hide')
                            // 刷新护士列表
                            $scope.currentPage = 1
                            getTotalNums(3)
                            getLists($scope.currentPage, $scope.itemsPerPage, $scope.userlist, 3)
                        }, 1000)
                    };
                }, function(err) {})
            }
        }
    ])
    // 护士--详细信息modal--张桠童
    .controller('detail_nurseCtrl', ['$scope', '$state', 'Storage', 'NgTableParams', '$timeout', '$uibModal', 'Alluser', '$uibModalInstance', 'userdetail',
        function($scope, $state, Storage, NgTableParams, $timeout, $uibModal, Alluser, $uibModalInstance, userdetail) {
            // console.log(userdetail);
            $scope.nurseInfo = userdetail
            // 关闭modal
            $scope.close = function() {
                $uibModalInstance.dismiss()
            }
            // 注销用户
            $scope.cancelUser = function() {
                $uibModalInstance.close('注销用户')
            }
            // 去除角色
            $scope.removeUserRoles = function() {
                $uibModalInstance.close('去除角色')
            }
        }
    ])
    // 患者--张桠童
    .controller('patientsCtrl', ['$scope', '$state', 'Storage', 'NgTableParams', '$timeout', '$uibModal', 'Alluser', 'Roles',
        function($scope, $state, Storage, NgTableParams, $timeout, $uibModal, Alluser, Roles) {
            var token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI1OTI2ZWNmZTkzYmNkNjM3ZTA2ODM5NDAiLCJ1c2VySWQiOiJVMjAxNzA1MjUwMDA5IiwibmFtZSI6IuiMueeUuyIsInJvbGUiOiJhZG1pbiIsImV4cCI6MTUwNTE4NTk2MjAwNCwiaWF0IjoxNTA1MDk5NTYyfQ.N0LeWbA6We2hCkYJNTM5wXfcx8a6KVDvayfFCjnq7lU"

            // -----------获取列表总条数------------------
            var getTotalNums = function(role1) {
                var countInfo = {
                    token: Storage.get('TOKEN'),
                    role1: role1
                }
                console.log(countInfo)
                var promise = Alluser.getCount(countInfo)
                promise.then(function(data) {
                    console.log(data.results)
                    $scope.totalNums = data.results
                }, function() {})
            }
            // -------------------------------------------

            // ---------------获取搜索(或未搜索)列表及列表数------------------------
            var getLists = function(currentPage, itemsPerPage, _userlist, role_count) {
                // 完善userlist
                var userlist = _userlist
                userlist.token = Storage.get('TOKEN')
                userlist.limit = itemsPerPage
                userlist.skip = (currentPage - 1) * itemsPerPage
                // 完善countInfo
                var countInfo = userlist
                countInfo.role1 = role_count
                if (userlist.role != undefined) countInfo.role2 = userlist.role
                // 获取总条目数
                console.log(countInfo)
                var promise = Alluser.getCount(countInfo)
                promise.then(function(data) {
                    console.log(data.results)
                    $scope.totalItems = data.results
                }, function() {})
                // 获取搜索列表
                console.log(userlist)
                var promise = Alluser.getPatientList(userlist)
                promise.then(function(data) {
                    console.log(data.results)
                    $scope.tableParams = new NgTableParams({
                        count: 10000
                    }, {
                        counts: [],
                        dataset: data.results
                    })
                }, function(err) {})
            }
            // ---------------------------------------------------------------------

            // 初始化列表
            getTotalNums(2)
            $scope.currentPage = 1
            $scope.itemsPerPage = 50
            $scope.userlist = {}
            getLists($scope.currentPage, $scope.itemsPerPage, $scope.userlist, 2)
            // 页面改变
            $scope.pageChanged = function() {
                console.log($scope.currentPage)
                getLists($scope.currentPage, $scope.itemsPerPage, $scope.userlist, 2)
            }
            // 当前页面的总条目数改变
            $scope.changeLimit = function(num) {
                $scope.itemsPerPage = num
                $scope.currentPage = 1
                getLists($scope.currentPage, $scope.itemsPerPage, $scope.userlist, 2)
            }
            // 搜索
            $scope.search_genders = [
                { id: 1, name: '男' },
                { id: 2, name: '女' }
            ]
            $scope.search_class = [
                { id: 'class_1', name: '肾移植' },
                { id: 'class_2', name: 'CKD1-2期' },
                { id: 'class_3', name: 'CKD3-4期' },
                { id: 'class_4', name: 'CDK5期未透析' },
                { id: 'class_5', name: '血透' },
                { id: 'class_6', name: '腹透' }
            ]
            $scope.searchList = function() {
                console.log($scope.userlist)
                getLists($scope.currentPage, $scope.itemsPerPage, $scope.userlist, 2)
            }
            // 清空搜索
            $scope.searchClear = function() {
                $scope.userlist = {}
                getLists($scope.currentPage, $scope.itemsPerPage, $scope.userlist, 2)
            }
            // 关闭modal控制
            $scope.modal_close = function(target) {
                $(target).modal('hide')
            }
            // 详细信息modal
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
                            return userdetail
                        }
                    }
                })
                modalInstance.result.then(function(con) {
                    if (con == '注销用户') {
                        // 确认是否注销
                        $('#cancelOrNot').modal('show')
                        // 给modal传参
                        $scope.userdetail = userdetail
                    } else if (con == '去除角色') {
                        // 确认是否去除角色
                        $('#removeOrNot').modal('show')
                        // 给modal传参
                        $scope.userdetail = userdetail
                    }
                }, function() {})
            }
            // 注销用户
            $scope.cancel = function(userdetail) {
                // 关闭警告modal（是否注销）
                $('#cancelOrNot').modal('hide')
                // 注销用户输入
                var cancelUserinfo = {
                    'userId': userdetail.userId,
                    'token': token
                }
                // 注销该用户
                var promise = Alluser.cancelUser(cancelUserinfo)
                promise.then(function(data) {
                    // console.log(data);
                    if (data.msg == 'success!') {
                        // 提示注销成功
                        $('#cancelSuccess').modal('show')
                        $timeout(function() {
                            // 关闭提示
                            $('#cancelSuccess').modal('hide')
                            // 刷新患者列表
                            $scope.currentPage = 1
                            getTotalNums(2)
                            getLists($scope.currentPage, $scope.itemsPerPage, $scope.userlist, 2)
                        }, 1000)
                    }
                }, function(err) {})
            }
            // 去除角色
            $scope.remove = function(userdetail) {
                // 关闭警告（是否去除角色）
                $('#removeOrNot').modal('hide')
                // 去除角色方法输入
                var removeInfo = {
                    'userId': userdetail.userId,
                    'roles': 'patient',
                    'token': token
                }
                // 去除该角色
                var promise = Roles.removeRoles(removeInfo)
                promise.then(function(data) {
                    // console.log(data);
                    if (data.mesg == 'User Register Success!') {
                        // 提示去除成功
                        $('#removeSuccess').modal('show')
                        $timeout(function() {
                            // 关闭提示
                            $('#removeSuccess').modal('hide')
                            // 刷新患者列表
                            $scope.currentPage = 1
                            getTotalNums(2)
                            getLists($scope.currentPage, $scope.itemsPerPage, $scope.userlist, 2)
                        }, 1000)
                    };
                }, function(err) {})
            }
        }
    ])
    // 患者--详细信息modal--张桠童
    .controller('detail_patientCtrl', ['$scope', '$state', 'Storage', 'NgTableParams', '$timeout', '$uibModal', 'Alluser', '$uibModalInstance', 'userdetail',
        function($scope, $state, Storage, NgTableParams, $timeout, $uibModal, Alluser, $uibModalInstance, userdetail) {
            // console.log(userdetail);
            $scope.patientInfo = userdetail
            // 关闭modal
            $scope.close = function() {
                $uibModalInstance.dismiss()
            }
            // 注销用户
            $scope.cancelUser = function() {
                $uibModalInstance.close('注销用户')
            }
            // 去除角色
            $scope.removeUserRoles = function() {
                $uibModalInstance.close('去除角色')
            }
        }
    ])
    // 保险人员--张桠童
    .controller('insuranceOfficersCtrl', ['$scope', '$state', 'Storage', 'NgTableParams', '$timeout', '$uibModal', 'Alluser', 'Roles',
        function($scope, $state, Storage, NgTableParams, $timeout, $uibModal, Alluser, Roles) {
            var token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI1OTI2ZWNmZTkzYmNkNjM3ZTA2ODM5NDAiLCJ1c2VySWQiOiJVMjAxNzA1MjUwMDA5IiwibmFtZSI6IuiMueeUuyIsInJvbGUiOiJhZG1pbiIsImV4cCI6MTUwNTE4NTk2MjAwNCwiaWF0IjoxNTA1MDk5NTYyfQ.N0LeWbA6We2hCkYJNTM5wXfcx8a6KVDvayfFCjnq7lU"

            // -----------获取列表总条数------------------
            var getTotalNums = function(role1) {
                var countInfo = {
                    token: Storage.get('TOKEN'),
                    role1: role1
                }
                console.log(countInfo)
                var promise = Alluser.getCount(countInfo)
                promise.then(function(data) {
                    console.log(data.results)
                    $scope.totalNums = data.results
                }, function() {})
            }
            // -------------------------------------------

            // ---------------获取搜索(或未搜索)列表及列表数------------------------
            var getLists = function(currentPage, itemsPerPage, _userlist, role_count) {
                // 完善userlist
                var userlist = _userlist
                userlist.token = Storage.get('TOKEN')
                userlist.limit = itemsPerPage
                userlist.skip = (currentPage - 1) * itemsPerPage
                // 完善countInfo
                var countInfo = userlist
                countInfo.role1 = role_count
                if (userlist.role != undefined) countInfo.role2 = userlist.role
                // 获取总条目数
                console.log(countInfo)
                var promise = Alluser.getCount(countInfo)
                promise.then(function(data) {
                    console.log(data.results)
                    $scope.totalItems = data.results
                }, function() {})
                // 获取搜索列表
                console.log(userlist)
                var promise = Alluser.getInsuranceList(userlist)
                promise.then(function(data) {
                    console.log(data.results)
                    // 首先处理一下要显示的roles
                    for (var i = 0; i < data.results.length; i++) {
                        var temproles = new Array()
                        for (var j = 0; j < data.results[i].role.length; j++) {
                            if ((data.results[i].role[j] == 'insuranceA') || (data.results[i].role[j] == 'insuranceR') || (data.results[i].role[j] == 'insuranceC')) {
                                temproles.push(data.results[i].role[j])
                            }
                        }
                        data.results[i].role = temproles

                    }
                    console.log(data.results)
                    $scope.tableParams = new NgTableParams({
                        count: 10000
                    }, {
                        counts: [],
                        dataset: data.results
                    })
                }, function(err) {})
            }
            // ---------------------------------------------------------------------

            // 初始化列表
            getTotalNums(4)
            $scope.currentPage = 1
            $scope.itemsPerPage = 50
            $scope.userlist = {}
            getLists($scope.currentPage, $scope.itemsPerPage, $scope.userlist, 4)

            // 页面改变
            $scope.pageChanged = function() {
                console.log($scope.currentPage)
                getLists($scope.currentPage, $scope.itemsPerPage, $scope.userlist, 4)
            }
            // 当前页面的总条目数改变
            $scope.changeLimit = function(num) {
                $scope.itemsPerPage = num
                $scope.currentPage = 1
                getLists($scope.currentPage, $scope.itemsPerPage, $scope.userlist, 4)
            }
            // 搜索
            $scope.search_roles = [
                { id: 'insuranceA', name: '沟通人员' },
                { id: 'insuranceC', name: '保险主管' },
                { id: 'insuranceR', name: '录入人员' }
            ]
            $scope.search_genders = [
                { id: 1, name: '男' },
                { id: 2, name: '女' }
            ]
            $scope.searchList = function() {
                console.log($scope.userlist)
                getLists($scope.currentPage, $scope.itemsPerPage, $scope.userlist, 4)
            }
            // 清空搜索
            $scope.searchClear = function() {
                $scope.userlist = {}
                getLists($scope.currentPage, $scope.itemsPerPage, $scope.userlist, 4)
            }
            // 监听事件(表单清空)
            $('#new_register').on('hidden.bs.modal', function() {
                $('#registerForm').formValidation('resetForm', true)
                $scope.registerInfo.phoneNo = undefined
                $scope.registerInfo.password = undefined
                $scope.registerInfo.role = undefined
            })
            $('#new_perfect').on('hidden.bs.modal', function() {
                $('#perfectForm').formValidation('resetForm', true)
                $scope.newUserInfo.userId = undefined
                $scope.newUserInfo.gender = undefined
                $scope.newUserInfo.boardingTime = undefined
                $scope.newUserInfo.workAmounts = undefined
                $scope.newUserInfo.name = undefined
            })
            $('#new_add').on('hidden.bs.modal', function() {
                $scope.userlist.name = undefined
                $scope.addInfo.userId = undefined
                $scope.addInfo.roles = undefined
                $scope.userlist_search = undefined
                $scope.flag = false
            })
            $('#changeInfo').on('hidden.bs.modal', function() {
                $('#changeForm').formValidation('destroy')
            })
            // 关闭modal控制
            $scope.modal_close = function(target) {
                $(target).modal('hide')
                if (target == '#new_perfect' || target == '#changeInfo') {
                    $scope.currentPage = 1
                    getTotalNums(4)
                    getLists($scope.currentPage, $scope.itemsPerPage, $scope.userlist, 4)
                };
                if (target == '#new_add') {
                    $scope.flag = false
                };
            }
            // 注册新用户
            $scope.registerInfo = {}
            $scope.newUserInfo = {}
            $scope.register = function() {
                // console.log($scope.registerInfo.phoneNo);
                if ($scope.registerInfo.phoneNo != undefined && $scope.registerInfo.password != undefined && $scope.registerInfo.role != undefined) {
                    var promise = Alluser.register($scope.registerInfo)
                    promise.then(function(data) {
                        // console.log(data);
                        // 注册成功
                        if (data.mesg == 'Alluser Register Success!') {
                            // 获取userId
                            $scope.newUserInfo.userId = data.userNo
                            // 关闭注册modal
                            $('#new_register').modal('hide')
                            // 提示注册成功
                            $('#registerSuccess').modal('show')
                            $timeout(function() {
                                // 提示完毕
                                $('#registerSuccess').modal('hide')
                                // 打开完善信息modal
                                $('#new_perfect').modal('show')
                            }, 1000)
                        }
                        // 注册失败(该用户已存在)
                        else {
                            // 提示注册失败
                            $('#registerFailed').modal('show')
                            $timeout(function() {
                                $('#registerFailed').modal('hide')
                            }, 1000)
                        }
                    }, function(err) {})
                }
            }
            // 完善新用户信息
            $scope.perfect = function() {
                $scope.newUserInfo.token = Storage.get('TOKEN')
                $scope.newUserInfo.gender = parseInt($scope.newUserInfo.gender)
                // console.log($scope.newUserInfo);
                if ($scope.newUserInfo.userId != undefined && $scope.newUserInfo.gender != undefined && $scope.newUserInfo.boardingTime != undefined && $scope.newUserInfo.workAmounts != undefined && $scope.newUserInfo.name != undefined && $scope.newUserInfo.token != undefined) {
                    // 关闭完善信息modal
                    $('#new_perfect').modal('hide')
                    var promise = Alluser.modify($scope.newUserInfo)
                    promise.then(function(data) {
                        // console.log(data);
                        if (data.msg == 'success!') {
                            // 提示完善成功
                            $('#perfectSuccess').modal('show')
                            $timeout(function() {
                                $('#perfectSuccess').modal('hide')
                                // 提示完毕，刷新保险人员列表
                                $scope.currentPage = 1
                                getTotalNums(4)
                                getLists($scope.currentPage, $scope.itemsPerPage, $scope.userlist, 4)
                            }, 1000)
                        }
                    }, function(err) {})
                }
            }
            // 搜索用户
            $scope.userlist = {}
            $scope.userlist.token = Storage.get('TOKEN')
            $scope.searchUser = function() {
                // console.log($scope.userlist.name);
                if ($scope.userlist.name == undefined) {
                    $('#nameUndefined').modal('show')
                    $timeout(function() {
                        $('#nameUndefined').modal('hide')
                    }, 1000)
                } else {
                    $scope.flag = true
                    var promise = Alluser.getUserList($scope.userlist)
                    promise.then(function(data) {
                        // console.log(data.results);
                        $scope.userlist_search = data.results
                        // $scope.userId = "";
                    }, function(err) {})
                }
            }
            // 添加角色
            $scope.addInfo = {}
            $scope.addRole = function() {
                console.log($scope.addInfo);
                if ($scope.addInfo.userId == undefined) {
                    $('#userIdUndefined').modal('show')
                    $timeout(function() {
                        $('#userIdUndefined').modal('hide')
                    }, 1000)
                } else if ($scope.addInfo.roles == undefined) {
                    $('#rolesUndefined').modal('show')
                    $timeout(function() {
                        $('#rolesUndefined').modal('hide')
                    }, 1000)
                } else {
                    // 关闭添加角色modal
                    $('#new_add').modal('hide')
                    // 增加角色
                    $scope.addInfo.token = Storage.get('TOKEN')
                    console.log($scope.addInfo)
                    var promise = Roles.addRoles($scope.addInfo)
                    promise.then(function(data) {
                        console.log(data.mesg)
                        if (data.mesg == 'User Register Success!') {
                            // 提示添加成功
                            $('#addSuccess').modal('show')
                            $timeout(function() {
                                // 提示完毕，刷新保险人员列表
                                $('#addSuccess').modal('hide')
                                $scope.currentPage = 1
                                getTotalNums(4)
                                getLists($scope.currentPage, $scope.itemsPerPage, $scope.userlist, 4)
                            }, 1000)
                        } else {
                            // 提示添加失败
                            $('#addFailed').modal('show')
                            $timeout(function() {
                                $('#addFailed').modal('hide')
                            }, 1000)
                        }
                    }, function(err) {})
                }
            }
            // 详细信息modal
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
                            return userdetail
                        }
                    }
                })
                modalInstance.result.then(function(con) {
                    if (con == '删除用户') {
                        // 确认是否删除
                        $('#cancelOrNot').modal('show')
                        // 给modal传参
                        $scope.userdetail = userdetail
                    } else if (con == '去除角色') {
                        // 确认是否去除角色
                        $('#removeOrNot').modal('show')
                        // 给modal传参
                        $scope.userdetail = userdetail
                    } else if (con == '修改信息') {
                        // 重新新建表单验证插件
                        $(document).ready(function() {
                            $('#changeForm').formValidation({
                                    framework: 'bootstrap',
                                    excluded: ':disabled',
                                    icon: {
                                        valid: 'glyphicon glyphicon-ok',
                                        invalid: 'glyphicon glyphicon-remove',
                                        validating: 'glyphicon glyphicon-refresh'
                                    }
                                })
                                .on('success.form.fv', function(e) {
                                    // Prevent form submission
                                    e.preventDefault();
                                });
                        });
                        $(document).ready(function() {
                            $('#datetimePicker2')
                                .datetimepicker({
                                    format: 'yyyy-mm-dd',
                                    // format: 'yyyy-mm-dd hh:ii',
                                    language: 'zh-CN',
                                    pickerPosition: "bottom-left",
                                    minView: 3,
                                    todayBtn: true,
                                    autoclose: true,
                                    todayHighlight: true,
                                    forceParse: 0,
                                    // minuteStep:1,
                                    initialDate: new Date()
                                })
                                .on('changeDate', function(e) {
                                    // Revalidate the date field
                                    $('#changeForm').formValidation('revalidateField', 'SamplingTime');
                                });
                        });
                        // 修改用户信息方法的输入
                        $scope.changeInfo = {}
                        angular.copy(userdetail, $scope.changeInfo);

                        $scope.changeInfo.token = Storage.get('TOKEN')
                        console.log($scope.changeInfo)
                        // 打开修改保险人员信息modal
                        $('#changeInfo').modal('show')
                    }
                }, function() {})
            }
            // 删除用户
            $scope.cancel = function(userdetail) {
                // 关闭警告modal（是否删除）
                $('#cancelOrNot').modal('hide')
                // 删除用户输入
                var cancelUserinfo = {
                    'userId': userdetail.userId,
                    'token': token
                }
                // 删除该用户
                var promise = Alluser.cancelUser(cancelUserinfo)
                promise.then(function(data) {
                    // console.log(data);
                    if (data.msg == 'success!') {
                        // 提示删除成功
                        $('#cancelSuccess').modal('show')
                        $timeout(function() {
                            // 关闭提示
                            $('#cancelSuccess').modal('hide')
                            // 刷新保险人员列表
                            $scope.currentPage = 1
                            getTotalNums(4)
                            getLists($scope.currentPage, $scope.itemsPerPage, $scope.userlist, 4)
                        }, 1000)
                    }
                }, function(err) {})
            }
            // 去除角色
            $scope.remove = function(userdetail) {
                // 关闭警告（是否去除角色）
                $('#removeOrNot').modal('hide')
                // 去除角色方法输入
                var removeInfo = {
                    'userId': userdetail.userId,
                    'roles': userdetail.role,
                    'token': token
                }
                // 去除该角色
                var promise = Roles.removeRoles(removeInfo)
                promise.then(function(data) {
                    // console.log(data);
                    if (data.mesg == 'User Register Success!') {
                        // 提示去除成功
                        $('#removeSuccess').modal('show')
                        $timeout(function() {
                            // 关闭提示
                            $('#removeSuccess').modal('hide')
                            // 刷新保险人员列表
                            $scope.currentPage = 1
                            getTotalNums(4)
                            getLists($scope.currentPage, $scope.itemsPerPage, $scope.userlist, 4)
                        }, 1000)
                    };
                }, function(err) {})
            }
            // 修改用户信息
            $scope.change = function() {
                if ($scope.changeInfo.userId != undefined && $scope.changeInfo.gender != undefined && $scope.changeInfo.boardingTime != undefined && $scope.changeInfo.workAmounts != undefined && $scope.changeInfo.name != undefined && $scope.changeInfo.phoneNo != undefined && $scope.changeInfo.role != undefined && $scope.changeInfo.token != undefined) {
                    // 类型转换
                    $scope.changeInfo.gender = parseInt($scope.changeInfo.gender)
                    // console.log($scope.changeInfo);
                    // 关闭修改信息modal
                    $('#changeInfo').modal('hide')
                    var promise = Alluser.modify($scope.changeInfo)
                    promise.then(function(data) {
                        // console.log(data.msg);
                        if (data.msg == 'success!') {
                            // 显示成功提示
                            $('#changeSuccess').modal('show')
                            $('#changeInfo').modal('hide')

                            $timeout(function() {
                                $('#changeSuccess').modal('hide')
                                // 提示完毕，刷新保险人员列表
                                $scope.currentPage = 1
                                getTotalNums(4)
                                getLists($scope.currentPage, $scope.itemsPerPage, $scope.userlist, 4)
                            }, 1000)
                        }
                    }, function(err) {})
                }
            }
        }
    ])
    // 保险人员--详细信息modal--张桠童
    .controller('detail_insuranceCtrl', ['$scope', '$state', 'Storage', 'NgTableParams', '$timeout', '$uibModal', 'Alluser', '$uibModalInstance', 'userdetail',
        function($scope, $state, Storage, NgTableParams, $timeout, $uibModal, Alluser, $uibModalInstance, userdetail) {
            // console.log(userdetail);
            $scope.insuranceInfo = userdetail
            // 关闭modal
            $scope.close = function() {
                $uibModalInstance.dismiss()
            }
            // 删除用户
            $scope.cancelUser = function() {
                $uibModalInstance.close('删除用户')
            }
            // 去除角色
            $scope.removeUserRoles = function() {
                $uibModalInstance.close('去除角色')
            }
            // 修改信息
            $scope.changeInfo = function() {
                $uibModalInstance.close('修改信息')
            }
        }
    ])
    // 健康专员--张桠童
    .controller('healthOfficersCtrl', ['$scope', '$state', 'Storage', 'NgTableParams', '$timeout', '$uibModal', 'Alluser', 'Roles',
        function($scope, $state, Storage, NgTableParams, $timeout, $uibModal, Alluser, Roles) {
            var token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI1OTI2ZWNmZTkzYmNkNjM3ZTA2ODM5NDAiLCJ1c2VySWQiOiJVMjAxNzA1MjUwMDA5IiwibmFtZSI6IuiMueeUuyIsInJvbGUiOiJhZG1pbiIsImV4cCI6MTUwNTE4NTk2MjAwNCwiaWF0IjoxNTA1MDk5NTYyfQ.N0LeWbA6We2hCkYJNTM5wXfcx8a6KVDvayfFCjnq7lU"

            // -----------获取列表总条数------------------
            var getTotalNums = function(role1) {
                var countInfo = {
                    token: Storage.get('TOKEN'),
                    role1: role1
                }
                console.log(countInfo)
                var promise = Alluser.getCount(countInfo)
                promise.then(function(data) {
                    console.log(data.results)
                    $scope.totalNums = data.results
                }, function() {})
            }
            // -------------------------------------------

            // ---------------获取搜索(或未搜索)列表及列表数------------------------
            var getLists = function(currentPage, itemsPerPage, _userlist, role_count) {
                // 完善userlist
                var userlist = _userlist
                userlist.token = Storage.get('TOKEN')
                userlist.limit = itemsPerPage
                userlist.skip = (currentPage - 1) * itemsPerPage
                // 完善countInfo
                var countInfo = userlist
                countInfo.role1 = role_count
                if (userlist.role != undefined) countInfo.role2 = userlist.role
                // 获取总条目数
                console.log(countInfo)
                var promise = Alluser.getCount(countInfo)
                promise.then(function(data) {
                    console.log(data.results)
                    $scope.totalItems = data.results
                }, function() {})
                // 获取搜索列表
                console.log(userlist)
                var promise = Alluser.getHealthList(userlist)
                promise.then(function(data) {
                    console.log(data.results)
                    $scope.tableParams = new NgTableParams({
                        count: 10000
                    }, {
                        counts: [],
                        dataset: data.results
                    })
                }, function(err) {})
            }
            // ---------------------------------------------------------------------

            // 初始化列表
            getTotalNums(5)
            $scope.currentPage = 1
            $scope.itemsPerPage = 50
            $scope.userlist = {}
            getLists($scope.currentPage, $scope.itemsPerPage, $scope.userlist, 5)

            // 页面改变
            $scope.pageChanged = function() {
                console.log($scope.currentPage)
                getLists($scope.currentPage, $scope.itemsPerPage, $scope.userlist, 5)
            }
            // 当前页面的总条目数改变
            $scope.changeLimit = function(num) {
                $scope.itemsPerPage = num
                $scope.currentPage = 1
                getLists($scope.currentPage, $scope.itemsPerPage, $scope.userlist, 5)
            }
            // 搜索
            $scope.search_genders = [
                { id: 1, name: '男' },
                { id: 2, name: '女' }
            ]
            $scope.searchList = function() {
                console.log($scope.userlist)
                getLists($scope.currentPage, $scope.itemsPerPage, $scope.userlist, 5)
            }
            // 清空搜索
            $scope.searchClear = function() {
                $scope.userlist = {}
                getLists($scope.currentPage, $scope.itemsPerPage, $scope.userlist, 5)
            }
            // 监听事件(表单清空)
            $('#new_register').on('hidden.bs.modal', function() {
                $('#registerForm').formValidation('resetForm', true)
                $scope.registerInfo.phoneNo = undefined
                $scope.registerInfo.password = undefined
            })
            $('#new_perfect').on('hidden.bs.modal', function() {
                $('#perfectForm').formValidation('resetForm', true)
                $scope.newUserInfo.userId = undefined
                $scope.newUserInfo.gender = undefined
                $scope.newUserInfo.boardingTime = undefined
                $scope.newUserInfo.workAmounts = undefined
                $scope.newUserInfo.name = undefined
            })
            $('#new_add').on('hidden.bs.modal', function() {
                $scope.userlist.name = undefined
                $scope.addInfo.userId = undefined
                $scope.userlist_search = undefined
                $scope.flag = false
            })
            $('#changeInfo').on('hidden.bs.modal', function() {
                $('#changeForm').formValidation('destroy')
                // $('#changeForm').formValidation('updateStatus',  ,)
                // 
                console.log($scope.changeInfo)
            })
            // 关闭modal控制
            $scope.modal_close = function(target) {
                $(target).modal('hide')
                if (target == '#new_perfect' || target == '#changeInfo') {
                    $scope.currentPage = 1
                    getTotalNums(5)
                    getLists($scope.currentPage, $scope.itemsPerPage, $scope.userlist, 5)
                };
                if (target == '#new_add') {
                    $scope.flag = false
                };
            }
            // 注册新用户
            $scope.registerInfo = {}
            $scope.registerInfo.role = 'health'
            $scope.newUserInfo = {}
            $scope.register = function() {
                console.log(1)
                console.log($scope.registerInfo.phoneNo)
                if ($scope.registerInfo.phoneNo != undefined && $scope.registerInfo.password != undefined) {
                    var promise = Alluser.register($scope.registerInfo)
                    promise.then(function(data) {
                        // console.log(data);
                        // 注册成功
                        if (data.mesg == 'Alluser Register Success!') {
                            // 获取userId
                            $scope.newUserInfo.userId = data.userNo
                            // 关闭注册modal
                            $('#new_register').modal('hide')
                            // 提示注册成功
                            $('#registerSuccess').modal('show')
                            $timeout(function() {
                                // 提示完毕
                                $('#registerSuccess').modal('hide')
                                // 打开完善信息modal
                                $('#new_perfect').modal('show')
                            }, 1000)
                        }
                        // 注册失败(该用户已存在)
                        else {
                            // 提示注册失败
                            $('#registerFailed').modal('show')
                            $timeout(function() {
                                $('#registerFailed').modal('hide')
                            }, 1000)
                        }
                    }, function(err) {})
                }
            }
            // 完善新用户信息
            $scope.perfect = function() {
                $scope.newUserInfo.token = Storage.get('TOKEN')
                $scope.newUserInfo.gender = parseInt($scope.newUserInfo.gender)
                // console.log($scope.newUserInfo);
                if ($scope.newUserInfo.userId != undefined && $scope.newUserInfo.gender != undefined && $scope.newUserInfo.boardingTime != undefined && $scope.newUserInfo.workAmounts != undefined && $scope.newUserInfo.name != undefined && $scope.newUserInfo.token != undefined) {
                    // 关闭完善信息modal
                    $('#new_perfect').modal('hide')
                    var promise = Alluser.modify($scope.newUserInfo)
                    promise.then(function(data) {
                        // console.log(data);
                        if (data.msg == 'success!') {
                            // 提示完善成功
                            $('#perfectSuccess').modal('show')
                            $timeout(function() {
                                $('#perfectSuccess').modal('hide')
                                // 提示完毕，刷新健康专员列表
                                $scope.currentPage = 1
                                getTotalNums(5)
                                getLists($scope.currentPage, $scope.itemsPerPage, $scope.userlist, 5)
                            }, 1000)
                        }
                    }, function(err) {})
                }
            }
            // 搜索用户
            $scope.userlist = {}
            $scope.userlist.token = Storage.get('TOKEN')
            $scope.searchUser = function() {
                // console.log($scope.userlist.name);
                if ($scope.userlist.name == undefined) {
                    $('#nameUndefined').modal('show')
                    $timeout(function() {
                        $('#nameUndefined').modal('hide')
                    }, 1000)
                } else {
                    $scope.flag = true
                    var promise = Alluser.getUserList($scope.userlist)
                    promise.then(function(data) {
                        // console.log(data.results);
                        $scope.userlist_search = data.results
                        // $scope.userId = "";
                    }, function(err) {})
                }
            }
            // 添加角色
            $scope.addInfo = {}
            $scope.addInfo.roles = 'health'
            $scope.addRole = function() {
                // console.log($scope.addInfo.userId);
                // console.log($scope.addInfo.roles);
                if ($scope.addInfo.userId == undefined) {
                    $('#userIdUndefined').modal('show')
                    $timeout(function() {
                        $('#userIdUndefined').modal('hide')
                    }, 1000)
                } else {
                    // 关闭添加角色modal
                    $('#new_add').modal('hide')
                    // 增加角色
                    $scope.addInfo.token = Storage.get('TOKEN')
                    var promise = Roles.addRoles($scope.addInfo)
                    promise.then(function(data) {
                        console.log(data.mesg)
                        if (data.mesg == 'User Register Success!') {
                            // 提示添加成功
                            $('#addSuccess').modal('show')
                            $timeout(function() {
                                // 提示完毕，刷新健康专员列表
                                $('#addSuccess').modal('hide')
                                $scope.currentPage = 1
                                getTotalNums(5)
                                getLists($scope.currentPage, $scope.itemsPerPage, $scope.userlist, 5)
                            }, 1000)
                        } else {
                            // 提示添加失败
                            $('#addFailed').modal('show')
                            $timeout(function() {
                                $('#addFailed').modal('hide')
                            }, 1000)
                        }
                    }, function(err) {})
                }
            }
            // 详细信息modal
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
                            return userdetail
                        }
                    }
                })
                modalInstance.result.then(function(con) {
                    if (con == '删除用户') {
                        // 确认是否删除
                        $('#cancelOrNot').modal('show')
                        // 给modal传参
                        $scope.userdetail = userdetail
                    } else if (con == '去除角色') {
                        // 确认是否去除角色
                        $('#removeOrNot').modal('show')
                        // 给modal传参
                        $scope.userdetail = userdetail
                    } else if (con == '修改信息') {
                        console.log(userdetail);
                        // 修改用户信息方法的输入
                        $('#changeForm').formValidation({
                                framework: 'bootstrap',
                                excluded: ':disabled',
                                icon: {
                                    valid: 'glyphicon glyphicon-ok',
                                    invalid: 'glyphicon glyphicon-remove',
                                    validating: 'glyphicon glyphicon-refresh'
                                }
                            })
                            .on('success.form.fv', function(e) {
                                // Prevent form submission
                                e.preventDefault();
                            });
                        $('#datetimePicker2')
                            .datetimepicker({
                                format: 'yyyy-mm-dd',
                                // format: 'yyyy-mm-dd hh:ii',
                                language: 'zh-CN',
                                pickerPosition: "bottom-left",
                                minView: 3,
                                todayBtn: true,
                                autoclose: true,
                                todayHighlight: true,
                                forceParse: 0,
                                // minuteStep:1,
                                initialDate: new Date()
                            })
                            .on('changeDate', function(e) {
                                // Revalidate the date field
                                $('#changeForm').formValidation('revalidateField', 'SamplingTime');
                            });
                        $scope.changeInfo = {}
                        angular.copy(userdetail, $scope.changeInfo);

                        $scope.changeInfo.token = Storage.get('TOKEN')
                        console.log($scope.changeInfo)

                        // 打开修改保险人员信息modal
                        $('#changeInfo').modal('show')
                    }
                }, function() {})
            }
            // 删除用户
            $scope.cancel = function(userdetail) {
                // 关闭警告modal（是否删除）
                $('#cancelOrNot').modal('hide')
                // 删除用户输入
                var cancelUserinfo = {
                    'userId': userdetail.userId,
                    'token': token
                }
                // 删除该用户
                var promise = Alluser.cancelUser(cancelUserinfo)
                promise.then(function(data) {
                    // console.log(data);
                    if (data.msg == 'success!') {
                        // 提示删除成功
                        $('#cancelSuccess').modal('show')
                        $timeout(function() {
                            // 关闭提示
                            $('#cancelSuccess').modal('hide')
                            // 刷新健康专员列表
                            $scope.currentPage = 1
                            getTotalNums(5)
                            getLists($scope.currentPage, $scope.itemsPerPage, $scope.userlist, 5)
                        }, 1000)
                    }
                }, function(err) {})
            }
            // 去除角色
            $scope.remove = function(userdetail) {
                // 关闭警告（是否去除角色）
                $('#removeOrNot').modal('hide')
                // 去除角色方法输入
                var removeInfo = {
                    'userId': userdetail.userId,
                    'roles': 'health',
                    'token': token
                }
                // 去除该角色
                var promise = Roles.removeRoles(removeInfo)
                promise.then(function(data) {
                    // console.log(data);
                    if (data.mesg == 'User Register Success!') {
                        // 提示去除成功
                        $('#removeSuccess').modal('show')
                        $timeout(function() {
                            // 关闭提示
                            $('#removeSuccess').modal('hide')
                            // 刷新健康专员列表
                            $scope.currentPage = 1
                            getTotalNums(5)
                            getLists($scope.currentPage, $scope.itemsPerPage, $scope.userlist, 5)
                        }, 1000)
                    };
                }, function(err) {})
            }
            // 修改用户信息
            $scope.change = function() {
                if ($scope.changeInfo.userId != undefined && $scope.changeInfo.gender != undefined && $scope.changeInfo.boardingTime != undefined && $scope.changeInfo.workAmounts != undefined && $scope.changeInfo.name != undefined && $scope.changeInfo.phoneNo != undefined && $scope.changeInfo.token != undefined) {
                    // 类型转换
                    $scope.changeInfo.gender = parseInt($scope.changeInfo.gender)
                    // console.log($scope.changeInfo);
                    // 关闭修改信息modal
                    $('#changeInfo').modal('hide')
                    var promise = Alluser.modify($scope.changeInfo)
                    promise.then(function(data) {
                        // console.log(data.msg);
                        if (data.msg == 'success!') {
                            // 显示成功提示
                            $('#changeSuccess').modal('show')
                            $('#changeInfo').modal('hide')

                            $timeout(function() {
                                $('#changeSuccess').modal('hide')
                                // 提示完毕，刷新健康专员列表
                                $scope.currentPage = 1
                                getTotalNums(5)
                                getLists($scope.currentPage, $scope.itemsPerPage, $scope.userlist, 5)
                            }, 1000)
                        }
                    }, function(err) {})
                }
            }
        }
    ])
    // 健康专员--详细信息modal--张桠童
    .controller('detail_healthCtrl', ['$scope', '$state', 'Storage', 'NgTableParams', '$timeout', '$uibModal', 'Alluser', '$uibModalInstance', 'userdetail',
        function($scope, $state, Storage, NgTableParams, $timeout, $uibModal, Alluser, $uibModalInstance, userdetail) {
            // console.log(userdetail);
            $scope.healthInfo = userdetail
            // 关闭modal
            $scope.close = function() {
                $uibModalInstance.dismiss()
            }
            // 删除用户
            $scope.cancelUser = function() {
                $uibModalInstance.close('删除用户')
            }
            // 去除角色
            $scope.removeUserRoles = function() {
                $uibModalInstance.close('去除角色')
            }
            // 修改信息
            $scope.changeInfo = function() {
                $uibModalInstance.close('修改信息')
            }
        }
    ])
    // 管理员--张桠童
    .controller('administratorsCtrl', ['$scope', '$state', 'Storage', 'NgTableParams', '$timeout', '$uibModal', 'Alluser', 'Roles',
        function($scope, $state, Storage, NgTableParams, $timeout, $uibModal, Alluser, Roles) {
            var token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI1OTI2ZWNmZTkzYmNkNjM3ZTA2ODM5NDAiLCJ1c2VySWQiOiJVMjAxNzA1MjUwMDA5IiwibmFtZSI6IuiMueeUuyIsInJvbGUiOiJhZG1pbiIsImV4cCI6MTUwNTE4NTk2MjAwNCwiaWF0IjoxNTA1MDk5NTYyfQ.N0LeWbA6We2hCkYJNTM5wXfcx8a6KVDvayfFCjnq7lU"

            // -----------获取列表总条数------------------
            var getTotalNums = function(role1) {
                var countInfo = {
                    token: Storage.get('TOKEN'),
                    role1: role1
                }
                console.log(countInfo)
                var promise = Alluser.getCount(countInfo)
                promise.then(function(data) {
                    console.log(data.results)
                    $scope.totalNums = data.results
                }, function() {})
            }
            // -------------------------------------------

            // ---------------获取搜索(或未搜索)列表及列表数------------------------
            var getLists = function(currentPage, itemsPerPage, _userlist, role_count) {
                // 完善userlist
                var userlist = _userlist
                userlist.token = Storage.get('TOKEN')
                userlist.limit = itemsPerPage
                userlist.skip = (currentPage - 1) * itemsPerPage
                // 完善countInfo
                var countInfo = userlist
                countInfo.role1 = role_count
                if (userlist.role != undefined) countInfo.role2 = userlist.role
                // 获取总条目数
                console.log(countInfo)
                var promise = Alluser.getCount(countInfo)
                promise.then(function(data) {
                    console.log(data.results)
                    $scope.totalItems = data.results
                }, function() {})
                // 获取搜索列表
                console.log(userlist)
                var promise = Alluser.getAdminList(userlist)
                promise.then(function(data) {
                    console.log(data.results)
                    $scope.tableParams = new NgTableParams({
                        count: 10000
                    }, {
                        counts: [],
                        dataset: data.results
                    })
                }, function(err) {})
            }
            // ---------------------------------------------------------------------

            // 初始化列表
            getTotalNums(6)
            $scope.currentPage = 1
            $scope.itemsPerPage = 50
            $scope.userlist = {}
            getLists($scope.currentPage, $scope.itemsPerPage, $scope.userlist, 6)

            // 页面改变
            $scope.pageChanged = function() {
                console.log($scope.currentPage)
                getLists($scope.currentPage, $scope.itemsPerPage, $scope.userlist, 6)
            }
            // 当前页面的总条目数改变
            $scope.changeLimit = function(num) {
                $scope.itemsPerPage = num
                $scope.currentPage = 1
                getLists($scope.currentPage, $scope.itemsPerPage, $scope.userlist, 6)
            }
            // 搜索
            $scope.search_genders = [
                { id: 1, name: '男' },
                { id: 2, name: '女' }
            ]
            $scope.searchList = function() {
                console.log($scope.userlist)
                getLists($scope.currentPage, $scope.itemsPerPage, $scope.userlist, 6)
            }
            // 清空搜索
            $scope.searchClear = function() {
                $scope.userlist = {}
                getLists($scope.currentPage, $scope.itemsPerPage, $scope.userlist, 6)
            }
            // 监听事件(表单清空)
            $('#new_register').on('hidden.bs.modal', function() {
                $('#registerForm').formValidation('resetForm', true)
                $scope.registerInfo.phoneNo = undefined
                $scope.registerInfo.password = undefined
            })
            $('#new_perfect').on('hidden.bs.modal', function() {
                $('#perfectForm').formValidation('resetForm', true)
                $scope.newUserInfo.userId = undefined
                $scope.newUserInfo.gender = undefined
                $scope.newUserInfo.creationTime = undefined
                $scope.newUserInfo.workUnit = undefined
                $scope.newUserInfo.name = undefined
            })
            $('#new_add').on('hidden.bs.modal', function() {
                $scope.userlist.name = undefined
                $scope.addInfo.userId = undefined
                $scope.userlist_search = undefined
                $scope.flag = false
            })
            $('#changeInfo').on('hidden.bs.modal', function() {
                $('#changeForm').formValidation('destroy')
            })
            // 关闭modal控制
            $scope.modal_close = function(target) {
                $(target).modal('hide')
                if (target == '#new_perfect' || target == '#changeInfo') {
                    $scope.currentPage = 1
                    getTotalNums(6)
                    getLists($scope.currentPage, $scope.itemsPerPage, $scope.userlist, 6)
                };
                if (target == '#new_add') {
                    $scope.flag = false
                };
            }
            // 注册新用户
            $scope.registerInfo = {}
            $scope.registerInfo.role = 'admin'
            $scope.newUserInfo = {}
            $scope.register = function() {
                console.log(1)
                console.log($scope.registerInfo.phoneNo)
                if ($scope.registerInfo.phoneNo != undefined && $scope.registerInfo.password != undefined) {
                    var promise = Alluser.register($scope.registerInfo)
                    promise.then(function(data) {
                        // console.log(data);
                        // 注册成功
                        if (data.mesg == 'Alluser Register Success!') {
                            // 获取userId
                            $scope.newUserInfo.userId = data.userNo
                            // 关闭注册modal
                            $('#new_register').modal('hide')
                            // 提示注册成功
                            $('#registerSuccess').modal('show')
                            $timeout(function() {
                                // 提示完毕
                                $('#registerSuccess').modal('hide')
                                // 打开完善信息modal
                                $('#new_perfect').modal('show')
                            }, 1000)
                        }
                        // 注册失败(该用户已存在)
                        else {
                            // 提示注册失败
                            $('#registerFailed').modal('show')
                            $timeout(function() {
                                $('#registerFailed').modal('hide')
                            }, 1000)
                        }
                    }, function(err) {})
                }
            }
            // 完善新用户信息
            $scope.perfect = function() {
                $scope.newUserInfo.token = Storage.get('TOKEN')
                $scope.newUserInfo.gender = parseInt($scope.newUserInfo.gender)
                // console.log($scope.newUserInfo);
                if ($scope.newUserInfo.userId != undefined && $scope.newUserInfo.gender != undefined && $scope.newUserInfo.creationTime != undefined && $scope.newUserInfo.workUnit != undefined && $scope.newUserInfo.name != undefined && $scope.newUserInfo.token != undefined) {
                    // 关闭完善信息modal
                    $('#new_perfect').modal('hide')
                    var promise = Alluser.modify($scope.newUserInfo)
                    promise.then(function(data) {
                        // console.log(data);
                        if (data.msg == 'success!') {
                            // 提示完善成功
                            $('#perfectSuccess').modal('show')
                            $timeout(function() {
                                $('#perfectSuccess').modal('hide')
                                // 提示完毕，刷新管理员列表
                                $scope.currentPage = 1
                                getTotalNums(6)
                                getLists($scope.currentPage, $scope.itemsPerPage, $scope.userlist, 6)
                            }, 1000)
                        }
                    }, function(err) {})
                }
            }
            // 搜索用户
            $scope.userlist = {}
            $scope.userlist.token = Storage.get('TOKEN')
            $scope.searchUser = function() {
                // console.log($scope.userlist.name);
                if ($scope.userlist.name == undefined) {
                    $('#nameUndefined').modal('show')
                    $timeout(function() {
                        $('#nameUndefined').modal('hide')
                    }, 1000)
                } else {
                    $scope.flag = true
                    var promise = Alluser.getUserList($scope.userlist)
                    promise.then(function(data) {
                        // console.log(data.results);
                        $scope.userlist_search = data.results
                        // $scope.userId = "";
                    }, function(err) {})
                }
            }
            // 添加角色
            $scope.addInfo = {}
            $scope.addInfo.roles = 'admin'
            $scope.addRole = function() {
                // console.log($scope.addInfo.userId);
                // console.log($scope.addInfo.roles);
                if ($scope.addInfo.userId == undefined) {
                    $('#userIdUndefined').modal('show')
                    $timeout(function() {
                        $('#userIdUndefined').modal('hide')
                    }, 1000)
                } else {
                    // 关闭添加角色modal
                    $('#new_add').modal('hide')
                    // 增加角色
                    $scope.addInfo.token = Storage.get('TOKEN')
                    var promise = Roles.addRoles($scope.addInfo)
                    promise.then(function(data) {
                        console.log(data.mesg)
                        if (data.mesg == 'User Register Success!') {
                            // 提示添加成功
                            $('#addSuccess').modal('show')
                            $timeout(function() {
                                // 提示完毕，刷新管理员列表
                                $('#addSuccess').modal('hide')
                                $scope.currentPage = 1
                                getTotalNums(6)
                                getLists($scope.currentPage, $scope.itemsPerPage, $scope.userlist, 6)
                            }, 1000)
                        } else {
                            // 提示添加失败
                            $('#addFailed').modal('show')
                            $timeout(function() {
                                $('#addFailed').modal('hide')
                            }, 1000)
                        }
                    }, function(err) {})
                }
            }
            // 详细信息modal
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
                            return userdetail
                        }
                    }
                })
                modalInstance.result.then(function(con) {
                    if (con == '删除用户') {
                        // 确认是否删除
                        $('#cancelOrNot').modal('show')
                        // 给modal传参
                        $scope.userdetail = userdetail
                    } else if (con == '去除角色') {
                        // 确认是否去除角色
                        $('#removeOrNot').modal('show')
                        // 给modal传参
                        $scope.userdetail = userdetail
                    } else if (con == '修改信息') {
                        $(document).ready(function() {
                            $('#changeForm').formValidation({
                                    framework: 'bootstrap',
                                    excluded: ':disabled',
                                    icon: {
                                        valid: 'glyphicon glyphicon-ok',
                                        invalid: 'glyphicon glyphicon-remove',
                                        validating: 'glyphicon glyphicon-refresh'
                                    }
                                })
                                .on('success.form.fv', function(e) {
                                    // Prevent form submission
                                    e.preventDefault();
                                });
                        });
                        $(document).ready(function() {
                            $('#datetimePicker2')
                                .datetimepicker({
                                    format: 'yyyy-mm-dd',
                                    // format: 'yyyy-mm-dd hh:ii',
                                    language: 'zh-CN',
                                    pickerPosition: "bottom-left",
                                    minView: 3,
                                    todayBtn: true,
                                    autoclose: true,
                                    todayHighlight: true,
                                    forceParse: 0,
                                    // minuteStep:1,
                                    initialDate: new Date()
                                })
                                .on('changeDate', function(e) {
                                    // Revalidate the date field
                                    $('#changeForm').formValidation('revalidateField', 'SamplingTime');
                                });
                        });
                        // 修改用户信息方法的输入
                        $scope.changeInfo = {}
                        angular.copy(userdetail, $scope.changeInfo);

                        $scope.changeInfo.token = Storage.get('TOKEN')
                        console.log($scope.changeInfo)
                        // 打开修改保险人员信息modal
                        $('#changeInfo').modal('show')
                    }
                }, function() {})
            }
            // 删除用户
            $scope.cancel = function(userdetail) {
                // 关闭警告modal（是否删除）
                $('#cancelOrNot').modal('hide')
                // 删除用户输入
                var cancelUserinfo = {
                    'userId': userdetail.userId,
                    'token': token
                }
                // 删除该用户
                var promise = Alluser.cancelUser(cancelUserinfo)
                promise.then(function(data) {
                    // console.log(data);
                    if (data.msg == 'success!') {
                        // 提示删除成功
                        $('#cancelSuccess').modal('show')
                        $timeout(function() {
                            // 关闭提示
                            $('#cancelSuccess').modal('hide')
                            // 刷新管理员列表
                            $scope.currentPage = 1
                            getTotalNums(6)
                            getLists($scope.currentPage, $scope.itemsPerPage, $scope.userlist, 6)
                        }, 1000)
                    }
                }, function(err) {})
            }
            // 去除角色
            $scope.remove = function(userdetail) {
                // 关闭警告（是否去除角色）
                $('#removeOrNot').modal('hide')
                // 去除角色方法输入
                var removeInfo = {
                    'userId': userdetail.userId,
                    'roles': 'admin',
                    'token': token
                }
                // 去除该角色
                var promise = Roles.removeRoles(removeInfo)
                promise.then(function(data) {
                    // console.log(data);
                    if (data.mesg == 'User Register Success!') {
                        // 提示去除成功
                        $('#removeSuccess').modal('show')
                        $timeout(function() {
                            // 关闭提示
                            $('#removeSuccess').modal('hide')
                            // 刷新管理员列表
                            $scope.currentPage = 1
                            getTotalNums(6)
                            getLists($scope.currentPage, $scope.itemsPerPage, $scope.userlist, 6)
                        }, 1000)
                    };
                }, function(err) {})
            }

            // 修改用户信息
            $scope.change = function() {
                if ($scope.changeInfo.userId != undefined && $scope.changeInfo.gender != undefined && $scope.changeInfo.creationTime != undefined && $scope.changeInfo.workUnit != undefined && $scope.changeInfo.name != undefined && $scope.changeInfo.phoneNo != undefined && $scope.changeInfo.token != undefined) {
                    // 类型转换
                    $scope.changeInfo.gender = parseInt($scope.changeInfo.gender)
                    // console.log($scope.changeInfo);
                    // 关闭修改信息modal
                    var promise = Alluser.modify($scope.changeInfo)
                    promise.then(function(data) {
                        // console.log(data.msg);
                        if (data.msg == 'success!') {
                            // 显示成功提示
                            $('#changeSuccess').modal('show')
                            $('#changeInfo').modal('hide')

                            $timeout(function() {
                                // 提示完毕，刷新管理员列表
                                $('#changeSuccess').modal('hide')

                                $scope.currentPage = 1
                                getTotalNums(6)
                                getLists($scope.currentPage, $scope.itemsPerPage, $scope.userlist, 6)
                            }, 1000)
                        }
                    }, function(err) {})
                }
            }
        }
    ])
    // 管理员--详细信息modal--张桠童
    .controller('detail_adminCtrl', ['$scope', '$state', 'Storage', 'NgTableParams', '$timeout', '$uibModal', 'Alluser', '$uibModalInstance', 'userdetail',
        function($scope, $state, Storage, NgTableParams, $timeout, $uibModal, Alluser, $uibModalInstance, userdetail) {
            // console.log(userdetail);
            $scope.adminInfo = userdetail
            // 关闭modal
            $scope.close = function() {
                $uibModalInstance.dismiss()
            }
            // 删除用户
            $scope.cancelUser = function() {
                $uibModalInstance.close('删除用户')
            }
            // 去除角色
            $scope.removeUserRoles = function() {
                $uibModalInstance.close('去除角色')
            }
            // 修改信息
            $scope.changeInfo = function() {
                $uibModalInstance.close('修改信息')
            }
        }
    ])

    // 地区/科室管理
    .controller('distrdepmanageCtrl', ['$scope', '$state', 'Review', 'Storage', '$timeout', 'NgTableParams', function($scope, $state, Review, Storage, $timeout, NgTableParams) {
        $scope.todistricts = function() {
            $state.go('main.distrdepmanage.districts')
        }
        $scope.todepartments = function() {
            $state.go('main.distrdepmanage.departments')
        }
    }])

    // 地区
    .controller('districtsCtrl', ['$scope', '$state', 'Review', '$uibModal', 'Storage', '$timeout', 'Alluser', 'NgTableParams', 'Department', 'Roles', function($scope, $state, Review, $uibModal, Storage, $timeout, Alluser, NgTableParams, Department, Roles) {
        var token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI1OTI2ZWNmZTkzYmNkNjM3ZTA2ODM5NDAiLCJ1c2VySWQiOiJVMjAxNzA1MjUwMDA5IiwibmFtZSI6IuiMueeUuyIsInJvbGUiOiJhZG1pbiIsImV4cCI6MTUwNTE4NTk2MjAwNCwiaWF0IjoxNTA1MDk5NTYyfQ.N0LeWbA6We2hCkYJNTM5wXfcx8a6KVDvayfFCjnq7lU"

        var ifcontain = function(arrayname, item) {
            if ((arrayname == undefined) || (arrayname == [])) { return false }
            for (i = 0; i < arrayname.length; i++) {
                if (arrayname[i] === item) { return true } else { return false }
            }
        }

        // ---------------获取搜索(或未搜索)列表------------------------
        var getLists = function(_districtlist) {
            // 完善districtlist
            var districtlist = _districtlist
            districtlist.token = Storage.get('TOKEN')
            // districtlist.district = ''
            // 获取列表
            console.log(districtlist)
            var promise = Department.GetDistrictInfo(districtlist)
            promise.then(function(data) {
                console.log(data.results)
                Storage.set('district.totalItems', data.results.length)
                $scope.totalItems = Storage.get('district.totalItems')
                $scope.tableParams = new NgTableParams({
                    count: 10
                }, {
                    counts: [],
                    dataset: data.results
                })
            }, function(err) {})
        }

        // 初始化列表
        $scope.districtlist = {}
        getLists($scope.districtlist)

        // 筛选
        $scope.searchList = function() {
            console.log($scope.districtlist)
            getLists($scope.districtlist)
        }
        // 清空搜索
        $scope.searchClear = function() {
            $scope.districtlist = {}
            getLists($scope.districtlist)
        }

        $scope.createdistrict = function() {
            $scope.newflag = false;

            $('#new_district').modal('show')
        }

        // 搜索用户
        $scope.searchUser = function(searchname) {

            console.log(searchname)
            if (searchname == undefined) {
                $('#nameUndefined').modal('show')
                $timeout(function() {
                    $('#nameUndefined').modal('hide')
                }, 1000)
            } else {
                var searchlist = {}
                searchlist.token = Storage.get('TOKEN')
                searchlist.name = searchname
                // console.log(searchlist)
                $scope.newflag = true
                $scope.editflag = true
                var promise = Alluser.getUserList(searchlist)
                promise.then(function(data) {
                    console.log(data.results);
                    $scope.userlist.userlist_search = data.results
                    // $scope.userId = "";
                }, function(err) {})
            }
        }

        // 新建地区，增加确认标签
        $scope.addnewlabel = function(inputlabel) {
            if (inputlabel == undefined) {
                $('#districtUndefined').modal('show')
                $timeout(function() {
                    $('#districtUndefined').modal('hide')
                }, 1000)
            } else {
                if ($scope.registerInfo.newdistrict == inputlabel) {
                    var mylabel = document.getElementById("newdistrict")
                    mylabel.innerHTML = inputlabel
                    console.log($scope.registerInfo)
                    districtInfo.district = $scope.registerInfo.newdistrict
                } else {
                    if ($scope.registerInfo._id == inputlabel) {
                        var ifnewportleaderexist = false;
                        for (i = 0; i < $scope.userlist.userlist_search.length; i++) {
                            if ($scope.userlist.userlist_search[i]._id == inputlabel) {
                                $scope.addInfo.userId = $scope.userlist.userlist_search[i].userId
                                $scope.registerInfo.name = $scope.userlist.userlist_search[i].name
                                break;
                            }
                        }
                        for (i = 0; i < $scope.registerInfo.newportleader.length; i++) {
                            if ($scope.registerInfo.newportleader[i] == $scope.registerInfo._id) {
                                ifnewportleaderexist = true;
                            }
                        }
                        if (ifnewportleaderexist == false) {
                            $scope.registerInfo.newportleader.push($scope.registerInfo._id)
                            var mylabel = document.getElementById("newportleader");
                            mylabel.innerHTML = mylabel.innerHTML + " " + $scope.registerInfo.name;
                        } else {
                            $('#addFailed').modal('show')
                            $timeout(function() {
                                $('#addFailed').modal('hide')
                            }, 1000)
                        }
                    }
                }
            }
        }


        // 添加角色
        $scope.addInfo = {}
        $scope.addInfo.roles = 'Leader'
        $scope.addRole = function() {
            console.log($scope.registerInfo._id)
            if (($scope.registerInfo._id == undefined) && ($scope.changeInfo._id == undefined)) {
                $('#userIdUndefined').modal('show')
                $timeout(function() {
                    $('#userIdUndefined').modal('hide')
                }, 1000)
            } else {
                console.log($scope.registerInfo.newportleader)
                // 增加角色
                $scope.addInfo.token = Storage.get('TOKEN')
                var promise = Roles.addRoles($scope.addInfo)
                promise.then(function(data) {
                    console.log($scope.addInfo)
                    console.log(data.mesg)
                    $scope.newflag = false
                    $scope.userlist.name = ""
                    $('#addSuccess').modal('show')
                    $timeout(function() {
                        // 提示完毕，刷新列表
                        $('#addSuccess').modal('hide')
                    }, 1000)
                }, function(err) {})
            }
        }

        // 新建地区
        var districtInfo = {} //新建方法输入参数
        $scope.registerInfo = {} //新地区包含信息（temp）
        $scope.registerInfo.newportleader = []
        $scope.register = function() {
            if ($scope.registerInfo.newdistrict == undefined) {
                $('#NoDistrict').modal('show')
                $timeout(function() {
                    $('#NoDistrict').modal('hide')
                }, 1000)
            } else {
                districtInfo.new = {}
                districtInfo.new.newdistrict = $scope.registerInfo.newdistrict
                districtInfo.new.newportleader = $scope.registerInfo.newportleader
                districtInfo.token = Storage.get('TOKEN')
                console.log(districtInfo)
                if ($scope.registerInfo.newportleader != undefined && $scope.registerInfo.newdistrict != undefined) {
                    var promise = Department.UpdateDistrict(districtInfo)
                    promise.then(function(data) {
                        console.log(data[0]);
                        // 注册成功
                        if (data[0] == "更") {
                            // 关闭新建modal
                            $('#new_district').modal('hide')
                            // 提示注册成功
                            $('#registerSuccess').modal('show')
                            $timeout(function() {
                                // 提示完毕
                                $('#registerSuccess').modal('hide')
                            }, 1000)
                            getLists($scope.districtlist)
                        } else {
                            // 地区名为空
                            if (data == '请输入地区') {
                                // 提示注册失败
                                $('#registerFailed').modal('show')
                                $timeout(function() {
                                    $('#registerFailed').modal('hide')
                                }, 1000)
                            }
                        }
                    }, function(err) {})
                }
            }
        }
        // 监听事件(表单清空)
        $('#new_district').on('hidden.bs.modal', function() {
            // $('#registerForm').formValidation('resetForm', true)
            var mylabel = document.getElementById("newdistrict")
            mylabel.innerHTML = ""
            var mylabel = document.getElementById("newportleader")
            mylabel.innerHTML = ""
            if (!($scope.registerInfo.newdistrict == undefined)) {
                $scope.registerInfo.newdistrict = undefined
            } else if (!($scope.userlist.name == undefined)) {
                $scope.userlist.name = undefined
            }
        })
        $('#changeInfo').on('hidden.bs.modal', function() {
            // $('#changeForm').formValidation('destroy')
            if (!($scope.changeInfo.newdistrict == undefined)) {
                $scope.changeInfo.newdistrict = undefined
            } else if (!($scope.userlist.name == undefined)) {
                $scope.userlist.name = undefined
            }
        })

        var _changeInfo = {}
        $scope.editdistrict = function(district) {
            _changeInfo.new = {}
            _changeInfo.new.newportleader = []
            $scope.editflag = false;
            console.log(district)
            _changeInfo.district = district.district;
            // 显示修改信息modal
            $('#changeInfo').modal('show')
            // 显示已有信息
            var mylabel = document.getElementById("editportleader")
            mylabel.innerHTML = ""
            for (i = 0; i < district.portleader.length; i++) {
                mylabel.innerHTML = mylabel.innerHTML + " " + district.portleader[i].name;
            }
            var mylabel = document.getElementById("editdistrict")
            mylabel.innerHTML = district.district
        }

        // 修改地区，增加确认标签
        $scope.addeditlabel = function(inputlabel) {
            if (inputlabel == undefined) {
                $('#districtUndefined').modal('show')
                $timeout(function() {
                    $('#districtUndefined').modal('hide')
                }, 1000)
            } else {
                console.log(inputlabel)
                console.log($scope.changeInfo)
                if ($scope.changeInfo.newdistrict == inputlabel) {
                    var mylabel = document.getElementById("editdistrict");
                    mylabel.innerHTML = inputlabel;
                    _changeInfo.new.newdistrict = inputlabel;
                } else {
                    if ($scope.changeInfo._id == inputlabel) {
                        console.log(_changeInfo.new.newportleader.length)
                        for (i = 0; i < $scope.userlist.userlist_search.length; i++) {
                            if ($scope.userlist.userlist_search[i]._id == inputlabel) {
                                $scope.addInfo.userId = $scope.userlist.userlist_search[i].userId
                                var thisname = $scope.userlist.userlist_search[i].name
                                var thisID = $scope.userlist.userlist_search[i]._id
                                break;
                            }
                        }
                        var ifnewportleaderexist = false;
                        if (_changeInfo.new.newportleader.length == 0) {
                            var mylabel = document.getElementById("editportleader");
                            mylabel.innerHTML = thisname;
                            _changeInfo.new.newportleader.push($scope.changeInfo._id);
                        } else {
                            for (i = 0; i < _changeInfo.new.newportleader.length; i++) {
                                if (_changeInfo.new.newportleader[i] == thisID) {
                                    ifnewportleaderexist = true;
                                }
                            }
                            if (ifnewportleaderexist == false) {
                                var mylabel = document.getElementById("editportleader");
                                mylabel.innerHTML = mylabel.innerHTML + " " + thisname;
                                _changeInfo.new.newportleader.push($scope.changeInfo._id);
                            } else {
                                $('#addFailed').modal('show')
                                $timeout(function() {
                                    $('#addFailed').modal('hide')
                                }, 1000)
                            }
                        }
                    }
                }
            }
        }

        $scope.change = function() {
            console.log(_changeInfo);
            console.log(_changeInfo.new.newportleader);
            _changeInfo.token = Storage.get('TOKEN');
            if (_changeInfo.new.newportleader == []) {
                for (i = 0; i < district.portleader.length; i++) {
                    _changeInfo.new.newportleader[i] = district.portleader[i]._id
                }
            }
            var promise = Department.UpdateDistrict(_changeInfo)
            promise.then(function(data) {
                // console.log(data.msg);
                if (data[0] == "更") {
                    // 显示成功提示
                    $('#changeSuccess').modal('show')
                    $timeout(function() {
                        $('#changeSuccess').modal('hide')
                        $('#changeInfo').modal('hide')
                        // 提示完毕，刷新列表
                        var newlist = {}
                        getLists(newlist)
                    }, 1000)
                }
            }, function(err) {})
        }

        // 关闭modal控制
        $scope.modal_close = function(target) {
            $(target).modal('hide')
        }

        // 删除地区
        $scope.deletedistrict = function(district) {
            var modalInstance = $uibModal.open({
                animation: true,
                ariaLabelledBy: 'modal-title',
                ariaDescribedBy: 'modal-body',
                templateUrl: 'districtdelete.html',
                controller: 'districtdeleteCtrl',
                size: 'sm',
                resolve: {
                    district: function() {
                        return district
                    }
                }
            })
            modalInstance.result.then(function() {
                var deletedistrictinfo = {
                    'district': district,
                    'token': token
                }
                var promise = Department.DeleteRecord(deletedistrictinfo)
                promise.then(function(data) {
                    // console.log(data);
                    if (data[0] == '删') {
                        $('#deleteSuccess').modal('show')
                        $timeout(function() {
                            $('#deleteSuccess').modal('hide')
                            // 刷新列表
                            getLists($scope.districtlist)
                        }, 1000)
                    }
                }, function(err) {})
            }, function() {})
        }

        // 显示下属科室数据
        var showdepartmentflag = true;
        $scope.showdepartment = function(districtname) {
            // 获得按钮行数
            var e = e || window.event;
            var target = e.target || e.srcElement;
            if (target.parentNode.tagName.toLowerCase() == "td") {
                var rowIndex = target.parentNode.parentNode.rowIndex;
            }
            // 获得该地区下属科室数据
            var districtInfo = {}
            districtInfo.district = districtname
            districtInfo.token = Storage.get('TOKEN')
            var promise = Department.GetDepartmentInfo(districtInfo)
            var thisdepartmentlist = []
            if (showdepartmentflag == true) {
                console.log(showdepartmentflag)
                promise.then(function(data) {
                    console.log(data.results[0].department)
                    if (!(data.results[0].department == undefined)) {
                        thisdepartmentlist = data.results
                        Storage.set('thisdepartmentlist.length', thisdepartmentlist.length)
                        for (i = 0; i < thisdepartmentlist.length; i++) {
                            var x = document.getElementById('districtlist').insertRow(rowIndex + 1);
                            for (j = 0; j < 4; j++) {
                                var y = x.insertCell(j);
                                if (j == 2) {
                                    y.innerHTML = thisdepartmentlist[i].department;
                                } else { y.innerHTML = '' };
                            }
                        }
                        showdepartmentflag = false;
                    }
                }, function(err) {})

            } else {
                console.log(Storage.get('thisdepartmentlist.length'))
                for (i = 0; i < Storage.get('thisdepartmentlist.length'); i++) {
                    console.log(thisdepartmentlist.length)
                    var x = document.getElementById('districtlist')
                    x.deleteRow(rowIndex + 1);
                }
                showdepartmentflag = true;
            }
        }
    }])

    // 地区--删除地区modal
    .controller('districtdeleteCtrl', ['$scope', '$state', 'Storage', 'NgTableParams', '$timeout', '$uibModal', 'Alluser', '$uibModalInstance', 'district',
        function($scope, $state, Storage, NgTableParams, $timeout, $uibModal, Alluser, $uibModalInstance, district) {
            $scope.close = function() {
                $uibModalInstance.dismiss()
            }
            $scope.ok = function() {
                $uibModalInstance.close()
            }
        }
    ])

    // 科室
    .controller('departmentsCtrl', ['$scope', '$state', 'Review', '$uibModal', 'Storage', '$timeout', 'Alluser', 'NgTableParams', 'Department', 'Roles', function($scope, $state, Review, $uibModal, Storage, $timeout, Alluser, NgTableParams, Department, Roles) {
        var token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI1OTI2ZWNmZTkzYmNkNjM3ZTA2ODM5NDAiLCJ1c2VySWQiOiJVMjAxNzA1MjUwMDA5IiwibmFtZSI6IuiMueeUuyIsInJvbGUiOiJhZG1pbiIsImV4cCI6MTUwNTE4NTk2MjAwNCwiaWF0IjoxNTA1MDk5NTYyfQ.N0LeWbA6We2hCkYJNTM5wXfcx8a6KVDvayfFCjnq7lU"

        // 科室列表
        var district = {}
        district.token = Storage.get('TOKEN');
        var promise = Department.GetDistrictInfo(district)
        promise.then(function(data) {
            $scope.districtlist = data.results
        }, function(err) {})

        // ---------------获取列表-----------------------
        var getLists = function(_departmentlist) {
            // 完善departmentlist
            var departmentlist = _departmentlist
            departmentlist.token = Storage.get('TOKEN')
            // 获取列表
            var promise = Department.GetDepartmentInfo(departmentlist)
            promise.then(function(data) {
                console.log(departmentlist)
                console.log(data.results)
                $scope.totalItems = data.results.length;
                $scope.tableParams = new NgTableParams({
                    count: 10000
                }, {
                    counts: [],
                    dataset: data.results
                })
            }, function(err) {})
        }

        // 初始化列表
        $scope.departmentlist = {}
        getLists($scope.departmentlist)

        // 筛选
        $scope.searchList = function() {
            console.log($scope.departmentlist)
            getLists($scope.departmentlist)
        }
        // 清空搜索
        $scope.searchClear = function() {
            $scope.departmentlist = {}
            getLists($scope.departmentlist)
        }
        // 新建科室按钮，打开新建科室modal
        $scope.createdepartment = function() {
            $scope.newflagleader = false;
            $scope.newflagdoctor = false;
            $('#new_department').modal('show')
        }

        // 搜索用户
        $scope.searchUser = function(searchname) {
            if ($scope.userlist.departleader == searchname) {
                $scope.newflagleader = true;
                $scope.newflagdoctor = false;
            } else if ($scope.userlist.doctor == searchname) {
                $scope.newflagdoctor = true;
                $scope.newflagleader = false;
            }
            if (searchname == undefined) {
                $('#nameUndefined').modal('show')
                $timeout(function() {
                    $('#nameUndefined').modal('hide')
                }, 1000)
            } else {
                var searchlist = {}
                searchlist.token = Storage.get('TOKEN')
                searchlist.name = searchname
                // console.log(searchlist)
                $scope.newflag = true
                $scope.editflag = true
                var promise = Alluser.getUserList(searchlist)
                promise.then(function(data) {
                    $scope.userlist.userlist_search = data.results
                    // $scope.userId = "";
                }, function(err) {})
            }
        }

        // 新建科室，增加确认标签
        $scope.addnewlabel = function(inputlabel, type) {

            if (type == "department") {
                var mylabel = document.getElementById("newdepartment");
                mylabel.innerHTML = inputlabel;
            } else if (type == "master") {
                var ifnewdepartleaderexist = false;
                for (i = 0; i < $scope.userlist.userlist_search.length; i++) {
                    if ($scope.userlist.userlist_search[i]._id == inputlabel) {
                        newuserID.newdepartleader = $scope.userlist.userlist_search[i].userId
                        $scope.newdepartleader.name = $scope.userlist.userlist_search[i].name
                        break;
                    }
                }
                for (i = 0; i < departmentInfo.new.newdepartLeader.length; i++) {
                    if (departmentInfo.new.newdepartLeader[i] == $scope.newdepartleader._id) {
                        ifnewdepartleaderexist = true;
                    }
                }
                if (ifnewdepartleaderexist == false) {
                    departmentInfo.new.newdepartLeader.push($scope.newdepartleader._id)
                    var mylabel = document.getElementById("newdepartleader");
                    mylabel.innerHTML = mylabel.innerHTML + " " + $scope.newdepartleader.name;
                } else {
                    $('#addFailed').modal('show')
                    $timeout(function() {
                        $('#addFailed').modal('hide')
                    }, 1000)
                }
                $scope.newflagleader = false
                $scope.userlist.departleader = ""
            } else if (type == "doctor") {
                var ifnewdoctorexist = false;
                for (i = 0; i < $scope.userlist.userlist_search.length; i++) {
                    if ($scope.userlist.userlist_search[i]._id == inputlabel) {
                        newuserID.newdoctor = $scope.userlist.userlist_search[i].userId
                        $scope.newdoctor.name = $scope.userlist.userlist_search[i].name
                        break;
                    }
                }
                for (i = 0; i < departmentInfo.new.newdoctors.length; i++) {
                    if (departmentInfo.new.newdoctors[i] == $scope.newdoctor._id) {
                        ifnewdoctorexist = true;
                    }
                }
                if (ifnewdoctorexist == false) {
                    departmentInfo.new.newdoctors.push($scope.newdoctor._id)
                    var mylabel = document.getElementById("newdoctor");
                    mylabel.innerHTML = mylabel.innerHTML + " " + $scope.newdoctor.name;
                } else {
                    $('#addFailed').modal('show')
                    $timeout(function() {
                        $('#addFailed').modal('hide')
                    }, 1000)
                }
                $scope.newflagdoctor = false
                $scope.userlist.doctor = ""
            }
        }

        // 添加角色
        $scope.addInfo = {}
        var newuserID = {}
        $scope.addRole = function(addRole, rolenow) {

            if (addRole == undefined) {
                $('#userIdUndefined').modal('show')
                $timeout(function() {
                    $('#userIdUndefined').modal('hide')
                }, 1000)
            } else {
                if (rolenow == "master") {
                    if ((!($scope.newdepartleader == undefined)) && ($scope.newdepartleader._id == addRole)) {
                        $scope.addInfo.userId = newuserID.newdepartleader
                    } else if ((!($scope.editdepartleader == undefined)) && ($scope.editdepartleader._id == addRole)) {
                        $scope.addInfo.userId = newuserID.newdepartleader
                    }
                } else if (rolenow == "doctor") {
                    if ((!($scope.newdoctor == undefined)) && ($scope.newdoctor._id == addRole)) {
                        $scope.addInfo.userId = newuserID.newdoctor
                    } else if ((!($scope.editdoctor == undefined)) && ($scope.editdoctor._id == addRole)) {
                        $scope.addInfo.userId = newuserID.newdoctor
                    }
                }
                $scope.addInfo.token = Storage.get('TOKEN')
                $scope.addInfo.roles = rolenow
                $scope.newflagdoctor = false
                $scope.newflagleader = false
                $scope.userlist.departleader = ""
                $scope.userlist.doctor = ""

                console.log($scope.addInfo)

                var promise = Roles.addRoles($scope.addInfo)
                promise.then(function(data) {
                    // console.log(data)
                    // $scope.newflagdoctor = false
                    // $scope.newflagleader = false
                    // $scope.userlist.departleader=""
                    // $scope.userlist.doctor = ""
                    // $('#addSuccess').modal('show')
                    // $timeout(function() {
                    //     // 提示完毕，刷新列表
                    //     $('#addSuccess').modal('hide')
                    // }, 1000)
                }, function(err) {})
            }
        }


        // 新建科室
        var departmentInfo = {} //新建方法输入参数
        $scope.registerInfo = {} //新地区包含信息（temp）
        $scope.registerInfo.newdepartleader = []
        $scope.registerInfo.newdoctor = []
        departmentInfo.new = {}
        departmentInfo.new.newdepartLeader = []
        departmentInfo.new.newdoctors = []
        // 新建科室
        $scope.register = function() {
            departmentInfo.district = $scope.registerInfo.district
            departmentInfo.hospital = $scope.registerInfo.department
            departmentInfo.department = $scope.registerInfo.department
            departmentInfo.new.newdepartment = $scope.registerInfo.department
            console.log(departmentInfo);
            // $scope.registerInfo.newdepartleader.push($scope.registerInfo._id)
            // $scope.registerInfo.newdoctor.push($scope.registerInfo._id)
            departmentInfo.token = Storage.get('TOKEN')
            console.log(departmentInfo)
            if ($scope.registerInfo.department == undefined) {
                $('#NoDepartment').modal('show')
                $timeout(function() {
                    $('#NoDepartment').modal('hide')
                }, 1000)
            } else {
                // if ($scope.registerInfo.newportleader != undefined && $scope.registerInfo.newdistrict != undefined) {
                var promise = Department.UpdateDepartment(departmentInfo)
                promise.then(function(data) {
                    console.log(data[0]);
                    // 注册成功
                    if (data[0] == "更") {
                        // 关闭新建modal
                        $('#new_department').modal('hide')
                        // 提示注册成功
                        $('#registerSuccess').modal('show')
                        $timeout(function() {
                            // 提示完毕
                            $('#registerSuccess').modal('hide')
                        }, 1000)
                        getLists($scope.departmentlist)
                    }
                }, function(err) {})
                // }
            }
        }

        // 监听事件(表单清空)
        $('#new_department').on('hidden.bs.modal', function() {
            // $('#registerForm').formValidation('resetForm', true)
            $scope.registerInfo.department = ""
            $scope.userlist.name = ""
            var mylabel = document.getElementById("newdepartleader")
            mylabel.innerHTML = ""
            var mylabel = document.getElementById("newdoctor")
            mylabel.innerHTML = ""
        })
        $('#changeInfo').on('hidden.bs.modal', function() {
            // $('#changeInfo').formValidation('destroy')
            // $('#newdepartLeader').tagEditor('destroy');
            if (!($scope.changeInfo.newdepartment == undefined)) {
                $scope.changeInfo.newdepartment = undefined
            } else if (!($scope.userlist.departleader == undefined)) {
                $scope.userlist.departleader = undefined
            } else if (!($scope.userlist.doctor == undefined)) {
                $scope.userlist.doctor = undefined
            }
        })


        $scope.openDetail = function(userdetail) {
            var modalInstance = $uibModal.open({
                animation: true,
                ariaLabelledBy: 'modal-title',
                ariaDescribedBy: 'modal-body',
                templateUrl: 'detail_department.html',
                controller: 'detail_departmentCtrl',
                resolve: {
                    userdetail: function() {
                        return userdetail
                    }
                }
            })
            modalInstance.result.then(function(con) {
                if (con == '修改信息') {
                    console.log(userdetail);
                    // 修改用户信息方法的输入
                    // $('#changeInfo').formValidation({
                    //         framework: 'bootstrap',
                    //         excluded: ':disabled',
                    //         icon: {
                    //             valid: 'glyphicon glyphicon-ok',
                    //             invalid: 'glyphicon glyphicon-remove',
                    //             validating: 'glyphicon glyphicon-refresh'
                    //         }
                    //     })
                    //     .on('success.form.fv', function(e) {
                    //         // Prevent form submission
                    //         e.preventDefault();
                    //     });
                    //     $scope.changeInfo={}
                    // $scope.changeInfo.newdepartment=userdetail.department

                    // $('#newdepartLeader').tagEditor({
                    //     autocomplete: { delay: 0, position: { collision: 'flip' }, source: ['ActionScript', 'AppleScript', 'Asp', 'BASIC', 'C', 'C++', 'CSS', 'Clojure', 'COBOL', 'ColdFusion', 'Erlang', 'Fortran', 'Groovy', 'Haskell', 'HTML', 'Java', 'JavaScript', 'Lisp', 'Perl', 'PHP', 'Python', 'Ruby', 'Scala', 'Scheme', "我是书", ] },
                    //     forceLowercase: false,
                    //     placeholder: '请输入新的科室负责人'
                    // });

                    // $scope.changeInfo.token = token
                    // console.log($scope.changeInfo)
                    var mylabel = document.getElementById("editdepartment")
                    mylabel.innerHTML = userdetail.department
                    var mylabel = document.getElementById("editdepartleader")
                    mylabel.innerHTML = ""
                    for (i = 0; i < userdetail.departLeader.length; i++) {
                        mylabel.innerHTML = mylabel.innerHTML + userdetail.departLeader[i].name + ' ';
                    }
                    var mylabel = document.getElementById("editdoctor")
                    mylabel.innerHTML = ""
                    for (i = 0; i < userdetail.doctor.length; i++) {
                        mylabel.innerHTML = mylabel.innerHTML + userdetail.doctor[i].name + ' ';
                    }

                    _changeInfo.new = {}
                    _changeInfo.new.newdepartLeader = []
                    _changeInfo.new.newdoctors = []
                    // 打开修改科室信息modal
                    $scope.changeInfo = {}
                    angular.copy(userdetail, $scope.changeInfo);
                    $('#changeInfo').modal('show')
                }
            }, function() {})
        }

        // 修改科室，增加确认标签
        $scope.addeditlabel = function(inputlabel, type) {

            console.log(inputlabel)
            console.log(type)
            console.log($scope.changeInfo)
            // console.log($scope.editdepartleader._id)
            // console.log($scope.editdoctor._id)

            if (type == "department") {
                var mylabel = document.getElementById("editdepartment");
                mylabel.innerHTML = inputlabel;
            } else if (type == "master") {
                for (i = 0; i < $scope.userlist.userlist_search.length; i++) {
                    if ($scope.userlist.userlist_search[i]._id == inputlabel) {
                        newuserID.newdepartleader = $scope.userlist.userlist_search[i].userId
                        var thisname = $scope.userlist.userlist_search[i].name
                        var thisID = $scope.userlist.userlist_search[i]._id
                        break;
                    }
                }
                var ifnewdepartleaderexist = false;
                if (_changeInfo.new.newdepartLeader.length == 0) {
                    var mylabel = document.getElementById("editdepartleader");
                    mylabel.innerHTML = thisname;
                    _changeInfo.new.newdepartLeader.push(thisID);
                } else {
                    console.log(_changeInfo.new.newdepartLeader)
                    console.log(thisID)
                    for (i = 0; i < _changeInfo.new.newdepartLeader.length; i++) {
                        if (_changeInfo.new.newdepartLeader[i] == thisID) {
                            ifnewdepartleaderexist = true;
                        }
                    }
                    console.log(ifnewdepartleaderexist)
                    if (ifnewdepartleaderexist == false) {
                        _changeInfo.new.newdepartLeader.push(thisID)
                        var mylabel = document.getElementById("editdepartleader");
                        mylabel.innerHTML = mylabel.innerHTML + " " + thisname;
                    } else {
                        $('#addFailed').modal('show')
                        $timeout(function() {
                            $('#addFailed').modal('hide')
                        }, 1000)
                    }
                    $scope.newflagleader = false
                    $scope.userlist.departleader = ""
                }
            } else if (type == "doctor") {
                for (i = 0; i < $scope.userlist.userlist_search.length; i++) {
                    if ($scope.userlist.userlist_search[i]._id == inputlabel) {
                        newuserID.newdoctor = $scope.userlist.userlist_search[i].userId
                        var thisname = $scope.userlist.userlist_search[i].name
                        var thisID = $scope.userlist.userlist_search[i]._id
                        break;
                    }
                }
                var ifnewdoctorexist = false;
                if (_changeInfo.new.newdoctors.length == 0) {
                    var mylabel = document.getElementById("editdoctor");
                    mylabel.innerHTML = thisname;
                    _changeInfo.new.newdoctors.push(thisID);
                } else {
                    for (i = 0; i < _changeInfo.new.newdoctors.length; i++) {
                        if (_changeInfo.new.newdoctors[i] == thisID) {
                            ifnewdoctorexist = true;
                        }
                    }
                    if (ifnewdoctorexist == false) {
                        _changeInfo.new.newdoctors.push($scope.thisID)
                        var mylabel = document.getElementById("editdoctor");
                        mylabel.innerHTML = mylabel.innerHTML + " " + thisname;
                    } else {
                        $('#addFailed').modal('show')
                        $timeout(function() {
                            $('#addFailed').modal('hide')
                        }, 1000)
                    }
                    $scope.newflagdoctor = false
                    $scope.userlist.doctor = ""
                }
            }
        }

        var _changeInfo = {}
        $scope.change = function() {
            _changeInfo.new.newdepartment = $scope.changeInfo.newdepartment
            _changeInfo.district = $scope.changeInfo.district
            _changeInfo.department = $scope.changeInfo.department
            _changeInfo.hospital = $scope.changeInfo.hospital
            _changeInfo.token = Storage.get('TOKEN');
            var promise = Department.UpdateDepartment(_changeInfo)
            promise.then(function(data) {
                // console.log(data.msg);
                if (data[0] == "更") {
                    // 显示成功提示
                    $('#changeSuccess').modal('show')
                    $timeout(function() {
                        $('#changeSuccess').modal('hide')
                        $('#changeInfo').modal('hide')
                        // 提示完毕，刷新列表
                        var newlist = {}
                        getLists(newlist)
                    }, 1000)
                }
            }, function(err) {})
        }


        // 关闭modal控制
        $scope.modal_close = function(target) {
            $(target).modal('hide')
        }

        // 删除科室
        $scope.deletedepartment = function(department) {
            var modalInstance = $uibModal.open({
                animation: true,
                ariaLabelledBy: 'modal-title',
                ariaDescribedBy: 'modal-body',
                templateUrl: 'departmentdelete.html',
                controller: 'departmentdeleteCtrl',
                size: 'sm',
                resolve: {
                    department: function() {
                        return department
                    }
                }
            })
            modalInstance.result.then(function() {
                var deletedepartmentinfo = {
                    'district': department.district,
                    'hospital': department.hospital,
                    'department': department.department,
                    'token': token
                }
                var promise = Department.DeleteRecord(deletedepartmentinfo)
                promise.then(function(data) {
                    // console.log(data);
                    if (data[0] == '删') {
                        $('#deleteSuccess').modal('show')
                        $timeout(function() {
                            $('#deleteSuccess').modal('hide')
                            // 刷新列表
                            getLists($scope.departmentlist)
                        }, 1000)
                    }
                }, function(err) {})
            }, function() {})
        }

        // 科室下属医生信息
        var showdoctorflag = true;
        $scope.showdoctor = function(department) {
            // 获得按钮行数
            var e = e || window.event;
            var target = e.target || e.srcElement;
            if (target.parentNode.tagName.toLowerCase() == "td") {
                var rowIndex = target.parentNode.parentNode.rowIndex;
            }

            // 获得该科室下设医生数据
            department.token = Storage.get('TOKEN')
            var promise = Department.GetDoctorList(department)
            var thisdoctorlist = []

            if (showdoctorflag == true) {
                promise.then(function(data) {
                    thisdoctorlist = data.results
                    Storage.set('thisdoctorlist.length', thisdoctorlist.length)
                    for (i = 0; i < data.results.length; i++) {
                        var x = document.getElementById('departmentlist').insertRow(rowIndex + 1);
                        for (j = 0; j < 7; j++) {
                            var y = x.insertCell(j);
                            if (j == 5) {
                                y.innerHTML = thisdoctorlist[i].name;
                            } else { y.innerHTML = '' };
                        }
                    }
                    showdoctorflag = false
                }, function(err) {})
            } else {
                console.log(Storage.get('thisdoctorlist.length'))
                for (i = 0; i < Storage.get('thisdoctorlist.length'); i++) {
                    console.log(thisdoctorlist.length)
                    var x = document.getElementById('departmentlist')
                    x.deleteRow(rowIndex + 1);
                }
                showdoctorflag = true;
            }
        }
    }])

    // 科室--详细信息modal
    .controller('detail_departmentCtrl', ['$scope', '$state', 'Storage', 'NgTableParams', '$timeout', '$uibModal', 'Alluser', '$uibModalInstance', 'userdetail', 'Department',
        function($scope, $state, Storage, NgTableParams, $timeout, $uibModal, Alluser, $uibModalInstance, userdetail, Department) {
            var token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI1OTI2ZWNmZTkzYmNkNjM3ZTA2ODM5NDAiLCJ1c2VySWQiOiJVMjAxNzA1MjUwMDA5IiwibmFtZSI6IuiMueeUuyIsInJvbGUiOiJhZG1pbiIsImV4cCI6MTUwNTE4NTk2MjAwNCwiaWF0IjoxNTA1MDk5NTYyfQ.N0LeWbA6We2hCkYJNTM5wXfcx8a6KVDvayfFCjnq7lU"

            $scope.departmentInfo = userdetail
            Department.GetDoctorList({
                district: userdetail.district,
                hospital: userdetail.hospital,
                department: userdetail.department,
                token: Storage.get('TOKEN')
            }).then(
                function(data) {
                    console.log(data);
                    $scope.departmentInfo.doctor = data.results
                },
                function(err) {
                    console.log(err)
                }
            )

            // 关闭modal
            $scope.close = function() {
                $uibModalInstance.dismiss()
            }
            // 修改信息
            $scope.changeInfo = function() {
                $uibModalInstance.close('修改信息')
            }
        }
    ])

    // 科室--删除科室modal
    .controller('departmentdeleteCtrl', ['$scope', '$state', 'Storage', 'NgTableParams', '$timeout', '$uibModal', 'Alluser', '$uibModalInstance', 'department',
        function($scope, $state, Storage, NgTableParams, $timeout, $uibModal, Alluser, $uibModalInstance, department) {
            $scope.close = function() {
                $uibModalInstance.dismiss()
            }
            $scope.ok = function() {
                $uibModalInstance.close()
            }
        }
    ])

    // 数据监控
    .controller('datamanageCtrl', ['$scope', '$state', 'Review', 'Storage', '$timeout', 'NgTableParams', function($scope, $state, Review, Storage, $timeout, NgTableParams) {
        $scope.tocharge = function() {
            $state.go('main.datamanage.charge')
        }
        $scope.toevaluation = function() {
            $state.go('main.datamanage.evaluation')
        }
        $scope.toovertime = function() {
            $state.go('main.datamanage.overtime')
        }
        $scope.toPatgroup = function() {
            $state.go('main.datamanage.Patgroup')
        }
        $scope.toPatinsurance = function() {
            $state.go('main.datamanage.Patinsurance')
        }
        $scope.toPatregion = function() {
            $state.go('main.datamanage.Patregion')
        }
        $scope.toPattrend = function() {
            $state.go('main.datamanage.Pattrend')
        }
        $scope.toregion = function() {
            $state.go('main.datamanage.region')
        }
        $scope.totrend = function() {
            $state.go('main.datamanage.trend')
        }
        $scope.toworkload = function() {
            $state.go('main.datamanage.workload')
        }
    }])

    // 数据监控——医生地区分布
    .controller('regionCtrl', ['Dict', 'Monitor1', 'Monitor2', '$scope', '$state', 'Review', 'Storage', '$timeout', 'NgTableParams', function(Dict, Monitor1, Monitor2, $scope, $state, Review, Storage, $timeout, NgTableParams) {
        var token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI1OTI2ZWNmZTkzYmNkNjM3ZTA2ODM5NDAiLCJ1c2VySWQiOiJVMjAxNzA1MjUwMDA5IiwibmFtZSI6IuiMueeUuyIsInJvbGUiOiJhZG1pbiIsImV4cCI6MTUwNTE4NTk2MjAwNCwiaWF0IjoxNTA1MDk5NTYyfQ.N0LeWbA6We2hCkYJNTM5wXfcx8a6KVDvayfFCjnq7lU"

        // datetimepicker插件属性设置
        $('.datetimepicker').datetimepicker({
            language: 'zh-CN',
            format: 'yyyy-mm-dd',
            weekStart: 1,
            todayBtn: 1,
            autoclose: 1,
            todayHighlight: 1,
            startView: 2,
            minView: 2,
            forceParse: 0
            // value:'2017-07-01'
        })

        // 关闭modal控制
        $scope.modal_close = function(target) {
            $(target).modal('hide')
        }
        //获取省市
        $scope.Provinces = {}
        $scope.Cities = {}
        Dict.getDistrict({
            level: 1
        }).then(
            function(data) {
                $scope.Provinces = data.results
            },
            function(err) {
                console.log(err)
            }
        )
        $scope.getCity = function(province) {
            if (province != null) {
                Dict.getDistrict({
                    level: '2',
                    province: province.province,
                    city: ''

                }).then(
                    function(data) {
                        $scope.Cities = data.results
                        // console.log($scope.Cities);
                    },
                    function(err) {
                        console.log(err)
                    }
                )
            } else {
                $scope.Cities = {}
                // $scope.Districts ={};
            }
            $scope.City = ''
        }

        $scope.$on('$viewContentLoaded', function() {
            showpie()
        });

        // 获取当前日期
        var myDate = new Date();
        var now = myDate.toLocaleDateString();

        var isClick = false
        var RegionInfo = {}
        var textInfo = ''
        $scope.Province = {}
        $scope.viewRegion = function() {
            console.log($scope.Province.province)
            if (($scope.Province.province == undefined) || ($scope.starttime == undefined) || ($scope.endtime == undefined) || ($scope.starttime.match(/^(\d{1,4})(-|\/)(\d{1,2})\2(\d{1,2})$/) == null) || ($scope.endtime.match(/^(\d{1,4})(-|\/)(\d{1,2})\2(\d{1,2})$/) == null)) {
                $('#inputerror').modal('show')
                $timeout(function() {
                    $('#inputerror').modal('hide')
                }, 1000)
            } else {
                var selectprovince = $scope.Province.province.name
                var selectcity = $scope.City.city
                var starttime = $scope.starttime + ' 00:00:00'
                var endtime = $scope.endtime + ' 00:00:00'
            }
            // console.log($scope.selectprovince)
            // console.log($scope.selectcity)
            // console.log($scope.starttime + ' 00:00:00')
            // console.log($scope.endtime + ' 00:00:00')
            // console.log(selectprovince)
            // console.log(selectcity)
            // console.log(starttime)
            // console.log(endtime)
            if (selectcity == undefined) {
                RegionInfo = {
                    province: selectprovince,
                    startTime: starttime,
                    endTime: endtime,
                    token: Storage.get('TOKEN')
                }
                textInfo = selectprovince + '医生地区分布'
            } else {
                RegionInfo = {
                    province: selectprovince,
                    city: selectcity.name,
                    startTime: starttime,
                    endTime: endtime,
                    token: Storage.get('TOKEN')

                }
                textInfo = selectprovince + selectcity.name + '医生地区分布'
            }
            isClick = true
            showpie()
        }

        var showpie = function() {
            if (isClick == false) {
                RegionInfo = {
                    province: '浙江省',
                    city: '',
                    startTime: '2017-01-01 00:00:00',
                    endTime: now,
                    token: Storage.get('TOKEN')
                }
                textInfo = '浙江省医生地区分布'
            }
            Monitor1.GetRegion(RegionInfo).then(function(data) {
                    if (data.results.length == 0) {
                        $('#nodata').modal('show')
                        $timeout(function() {
                            $('#nodata').modal('hide')
                        }, 1000)
                    }

                    var array = data.results
                    var arr = new Array()
                    var sum = 0
                    for (var i = 0; i < array.length; i++) {
                        arr[i] = {
                            name: array[i]._id,
                            value: array[i].count
                        }
                        sum += array[i].count
                    }

                    var myChart = echarts.init(document.getElementById('region'))
                    var option = {
                        title: {
                            text: textInfo,
                            subtext: '医生总人数:' + sum + '人',
                            x: 'center'
                        },
                        tooltip: {
                            trigger: 'item',
                            formatter: '{a} <br/>{b} : {c} ({d}%)'
                        },
                        series: [{
                            name: '医生人数',
                            type: 'pie',
                            radius: '55%',
                            center: ['50%', '60%'],
                            data: arr,
                            itemStyle: {
                                emphasis: {
                                    shadowBlur: 10,
                                    shadowOffsetX: 0,
                                    shadowColor: 'rgba(0, 0, 0, 0.5)'
                                }
                            }
                        }]
                    }
                    myChart.setOption(option)
                }),
                function(err) {
                    console.log(err)
                }
        }
    }])

    // 数据监控——医生变化趋势
    .controller('trendCtrl', ['Dict', 'Monitor1', 'Monitor2', '$scope', '$state', 'Review', 'Storage', '$timeout', 'NgTableParams', function(Dict, Monitor1, Monitor2, $scope, $state, Review, Storage, $timeout, NgTableParams) {
        var token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI1OTI2ZWNmZTkzYmNkNjM3ZTA2ODM5NDAiLCJ1c2VySWQiOiJVMjAxNzA1MjUwMDA5IiwibmFtZSI6IuiMueeUuyIsInJvbGUiOiJhZG1pbiIsImV4cCI6MTUwNTE4NTk2MjAwNCwiaWF0IjoxNTA1MDk5NTYyfQ.N0LeWbA6We2hCkYJNTM5wXfcx8a6KVDvayfFCjnq7lU"

        // 医生变化趋势--折线图
        $('.datetimepicker').datetimepicker({
            language: 'zh-CN',
            format: 'yyyy-mm-dd',
            weekStart: 1,
            todayBtn: 1,
            autoclose: 1,
            todayHighlight: 1,
            startView: 2,
            minView: 2,
            forceParse: 0
        })

        // 关闭modal控制
        $scope.modal_close = function(target) {
            $(target).modal('hide')
        }
        //获取省市
        $scope.Provinces = {}
        $scope.Cities = {}
        Dict.getDistrict({
            level: 1
        }).then(
            function(data) {
                $scope.Provinces = data.results
            },
            function(err) {
                console.log(err)
            }
        )
        $scope.getCity = function(province) {
            if (province != null) {
                Dict.getDistrict({
                    level: '2',
                    province: province.province,
                    city: ''

                }).then(
                    function(data) {
                        $scope.Cities = data.results
                        // console.log($scope.Cities);
                    },
                    function(err) {
                        console.log(err)
                    }
                )
            } else {
                $scope.Cities = {}
                // $scope.Districts ={};
            }
            $scope.City = ''
        }

        $scope.$on('$viewContentLoaded', function() {
            showlinegraph()
        });

        // 获取当前日期
        var myDate = new Date();
        var now = myDate.toLocaleDateString();

        var isClick = false
        var TrendInfo = {}
        var textInfo = ''
        $scope.Province = {}
        $scope.viewTrend = function() {
            if (($scope.Province.province == undefined) || ($scope.starttime == undefined) || ($scope.endtime == undefined) || ($scope.starttime.match(/^(\d{1,4})(-|\/)(\d{1,2})\2(\d{1,2})$/) == null) || ($scope.endtime.match(/^(\d{1,4})(-|\/)(\d{1,2})\2(\d{1,2})$/) == null)) {
                $('#inputerror').modal('show')
                $timeout(function() {
                    $('#inputerror').modal('hide')
                }, 1000)
            } else {
                var selectprovince = $scope.Province.province.name
                var selectcity = $scope.City.city
                var starttime = $scope.starttime + ' 00:00:00'
                var endtime = $scope.endtime + ' 00:00:00'
            }
            if (selectcity == undefined) {
                TrendInfo = {
                    province: selectprovince,
                    startTime: starttime,
                    endTime: endtime,
                    token: Storage.get('TOKEN')
                }
                textInfo = selectprovince + '医生注册变化趋势折线图'
            } else {
                TrendInfo = {
                    province: selectprovince,
                    city: selectcity.name,
                    startTime: starttime,
                    endTime: endtime,
                    token: Storage.get('TOKEN')
                }
                textInfo = selectprovince + selectcity.name + '医生注册变化趋势折线图'
            }
            isClick = true
            showlinegraph()
        }

        var showlinegraph = function() {
            if (isClick == false) {
                TrendInfo = {
                    province: '浙江省',
                    city: '',
                    startTime: '2017-01-01 00:00:00',
                    endTime: now,
                    token: Storage.get('TOKEN')
                }
                textInfo = '浙江省医生注册变化趋势折线图'
            }
            Monitor1.GetTrend(TrendInfo).then(function(data) {
                    if (data.results.length == 0) {
                        $('#nodata').modal('show')
                        $timeout(function() {
                            $('#nodata').modal('hide')
                        }, 1000)
                    }
                    var count = new Array()
                    var time = new Array()
                    var sum = 0
                    var array = data.results
                    var timecount = new Array()
                    for (var i = 0; i < array.length; i++) {
                        count[i] = array[i].count
                        time[i] = array[i]._id
                        timecount[i] = {
                            t: time[i],
                            c: count[i]
                        }
                        sum += count[i]
                    }
                    timecount.sort(function(a, b) {
                        return Date.parse(a.t) - Date.parse(b.t) // 时间正序
                    })
                    var _count = new Array()
                    var _time = new Array()
                    for (var i = 0; i < array.length; i++) {
                        _count[i] = timecount[i].c
                        _time[i] = timecount[i].t
                    }
                    var myTrend = echarts.init(document.getElementById('trend'))
                    var option = {
                        title: {
                            text: textInfo,
                            subtext: '新增注册医生' + sum + '人',
                            x: 'center'
                        },
                        tooltip: {
                            trigger: 'axis'
                        },
                        xAxis: {
                            axisLabel: {
                                interval: 'auto'
                            },
                            type: 'category',
                            boundaryGap: false,
                            data: _time
                        },
                        yAxis: {
                            type: 'value',
                            axisLabel: {
                                formatter: '{value} 人'
                            }
                        },
                        series: [{
                            name: '注册人数',
                            type: 'line',
                            data: _count,
                            markPoint: {
                                data: []
                                // markLine: {
                                //   data: [
                                //               { type: 'average', name: '平均值' }
                                //   ]
                                // }
                            }
                        }]
                    }
                    myTrend.setOption(option)
                }),
                function(err) {
                    console.log(err)
                }
        }
    }])

    // 数据监控——医生超时咨询统计
    .controller('overtimeCtrl', ['Dict', 'Monitor1', 'Monitor2', '$scope', '$state', 'Review', 'Storage', '$timeout', 'NgTableParams', function(Dict, Monitor1, Monitor2, $scope, $state, Review, Storage, $timeout, NgTableParams) {
        var token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI1OTI2ZWNmZTkzYmNkNjM3ZTA2ODM5NDAiLCJ1c2VySWQiOiJVMjAxNzA1MjUwMDA5IiwibmFtZSI6IuiMueeUuyIsInJvbGUiOiJhZG1pbiIsImV4cCI6MTUwNTE4NTk2MjAwNCwiaWF0IjoxNTA1MDk5NTYyfQ.N0LeWbA6We2hCkYJNTM5wXfcx8a6KVDvayfFCjnq7lU"

        $('.datetimepicker').datetimepicker({
            language: 'zh-CN',
            format: 'yyyy-mm-dd',
            weekStart: 1,
            todayBtn: 1,
            autoclose: 1,
            todayHighlight: 1,
            startView: 2,
            minView: 2,
            forceParse: 0
        })

        //获取省市
        $scope.Provinces = {}
        $scope.Cities = {}
        Dict.getDistrict({
            level: 1
        }).then(
            function(data) {
                $scope.Provinces = data.results
            },
            function(err) {
                console.log(err)
            }
        )
        $scope.getCity = function(province) {
            if (province != null) {
                Dict.getDistrict({
                    level: '2',
                    province: province.province,
                    city: ''

                }).then(
                    function(data) {
                        $scope.Cities = data.results
                        // console.log($scope.Cities);
                    },
                    function(err) {
                        console.log(err)
                    }
                )
            } else {
                $scope.Cities = {}
                // $scope.Districts ={};
            }
            $scope.City = ''
        }

        // 获取当前日期
        var myDate = new Date();
        var now = myDate.toLocaleDateString();
        var isClick = false
        var countInfo = {}
        var Info = {}
        Storage.set('Tab', 1)

        // ---------------获取搜索(或未搜索)列表及列表数------------------------
        var getLists = function(currentPage, itemsPerPage, countInfo) {
            countInfo.token = Storage.get('TOKEN'),
                Info = Object.assign({}, countInfo)
            Info.limit = itemsPerPage,
                Info.skip = (currentPage - 1) * itemsPerPage
            if (isClick == false) {
                countInfo = {
                    // province: '浙江省',
                    // city: '',
                    startTime: '2017-01-01',
                    endTime: now,
                    token: Storage.get('TOKEN')
                }
                Info = Object.assign({}, countInfo),
                    Info.limit = itemsPerPage,
                    Info.skip = (currentPage - 1) * itemsPerPage
            }
            console.log(Info);
            //获取搜索列表
            var promise = Monitor1.GetOvertime(Info)
            promise.then(function(data) {
                $scope.overtimetableParams = new NgTableParams({
                    count: 20
                }, {
                    counts: [],
                    dataset: data.results
                })
                if (data.results.length == 0) {
                    $('#nodata').modal('show')
                    $timeout(function() {
                        $('#nodata').modal('hide')
                    }, 1000)
                }
            }, function(err) {})
            // 获取总条目数
            var promise = Monitor1.GetOvertime(countInfo)
            promise.then(function(data) {
                $scope.totalItems = data.results.length
                console.log($scope.totalItems)
            }, function() {})
        }
        // ---------------------------------------------------------------------
        //初始化列表
        $scope.currentPage = 1
        $scope.itemsPerPage = 100
        getLists($scope.currentPage, $scope.itemsPerPage, countInfo)
        // 页面改变
        $scope.pageChanged = function() {
            console.log($scope.currentPage)
            getLists($scope.currentPage, $scope.itemsPerPage, countInfo)
        }
        // 当前页面的总条目数改变
        $scope.changeLimit = function(num) {
            $scope.itemsPerPage = num
            $scope.currentPage = 1
            getLists($scope.currentPage, $scope.itemsPerPage, countInfo)
        }

        $scope.searchList = function() {
            if (($scope.Province.province == undefined) || ($scope.starttime == undefined) || ($scope.endtime == undefined) || ($scope.starttime.match(/^(\d{1,4})(-|\/)(\d{1,2})\2(\d{1,2})$/) == null) || ($scope.endtime.match(/^(\d{1,4})(-|\/)(\d{1,2})\2(\d{1,2})$/) == null)) {
                $('#inputerror').modal('show')
                $timeout(function() {
                    $('#inputerror').modal('hide')
                }, 1000)
            } else {
                isClick = true
                countInfo.province = $scope.Province.province.name
                countInfo.startTime = $scope.starttime
                countInfo.endTime = $scope.endtime
                if ($scope.City.city == undefined) {
                    countInfo.city = ''
                } else {
                    countInfo.city = $scope.City.city.name
                }
            }
            $scope.currentPage = 1
            getLists($scope.currentPage, $scope.itemsPerPage, countInfo)
        }
    }])

    // 数据监控——医生评分统计
    .controller('evaluationCtrl', ['Dict', 'Monitor1', 'Monitor2', '$scope', '$state', 'Review', 'Storage', '$timeout', 'NgTableParams', function(Dict, Monitor1, Monitor2, $scope, $state, Review, Storage, $timeout, NgTableParams) {
        var token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI1OTI2ZWNmZTkzYmNkNjM3ZTA2ODM5NDAiLCJ1c2VySWQiOiJVMjAxNzA1MjUwMDA5IiwibmFtZSI6IuiMueeUuyIsInJvbGUiOiJhZG1pbiIsImV4cCI6MTUwNTE4NTk2MjAwNCwiaWF0IjoxNTA1MDk5NTYyfQ.N0LeWbA6We2hCkYJNTM5wXfcx8a6KVDvayfFCjnq7lU"

        // 关闭modal控制
        $scope.modal_close = function(target) {
            $(target).modal('hide')
        }

        $('.datetimepicker').datetimepicker({
            language: 'zh-CN',
            format: 'yyyy-mm-dd',
            weekStart: 1,
            todayBtn: 1,
            autoclose: 1,
            todayHighlight: 1,
            startView: 2,
            minView: 2,
            forceParse: 0
        })

        //获取省市
        $scope.Provinces = {}
        $scope.Cities = {}
        Dict.getDistrict({
            level: 1
        }).then(
            function(data) {
                $scope.Provinces = data.results
            },
            function(err) {
                console.log(err)
            }
        )
        $scope.getCity = function(province) {
            if (province != null) {
                Dict.getDistrict({
                    level: '2',
                    province: province.province,
                    city: ''

                }).then(
                    function(data) {
                        $scope.Cities = data.results
                        // console.log($scope.Cities);
                    },
                    function(err) {
                        console.log(err)
                    }
                )
            } else {
                $scope.Cities = {}
                // $scope.Districts ={};
            }
            $scope.City = ''
        }

        // 获取当前日期
        var myDate = new Date();
        var now = myDate.toLocaleDateString();
        var isClick = false
        var countInfo = {}
        var Info = {}
        Storage.set('Tab', 1)

        // ---------------获取搜索(或未搜索)列表及列表数------------------------
        var getLists = function(currentPage, itemsPerPage, countInfo) {
            countInfo.token = Storage.get('TOKEN'),
                Info = Object.assign({}, countInfo)
            Info.limit = itemsPerPage,
                Info.skip = (currentPage - 1) * itemsPerPage
            if (isClick == false) {
                countInfo = {
                    province: '浙江省',
                    city: '',
                    startTime: '2017-01-01',
                    endTime: now,
                    token: Storage.get('TOKEN')
                }
                Info = Object.assign({}, countInfo),
                    Info.limit = itemsPerPage,
                    Info.skip = (currentPage - 1) * itemsPerPage
            }
            console.log(Info);
            //获取搜索列表
            var promise = Monitor1.GetEvaluation(Info)
            promise.then(function(data) {
                $scope.scoretableParams = new NgTableParams({
                    count: 20
                }, {
                    counts: [],
                    dataset: data.results
                })
                if (data.results.length == 0) {
                    $('#nodata').modal('show')
                    $timeout(function() {
                        $('#nodata').modal('hide')
                    }, 1000)
                }
            }, function(err) {})
            // 获取总条目数
            var promise = Monitor1.GetEvaluation(countInfo)
            promise.then(function(data) {
                $scope.totalItems = data.results.length
                console.log($scope.totalItems)
            }, function() {})
        }
        // ---------------------------------------------------------------------
        //初始化列表
        $scope.currentPage = 1
        $scope.itemsPerPage = 100
        getLists($scope.currentPage, $scope.itemsPerPage, countInfo)
        // 页面改变
        $scope.pageChanged = function() {
            console.log($scope.currentPage)
            getLists($scope.currentPage, $scope.itemsPerPage, countInfo)
        }
        // 当前页面的总条目数改变
        $scope.changeLimit = function(num) {
            $scope.itemsPerPage = num
            $scope.currentPage = 1
            getLists($scope.currentPage, $scope.itemsPerPage, countInfo)
        }

        $scope.searchList = function() {
            if (($scope.Province.province == undefined) || ($scope.starttime == undefined) || ($scope.endtime == undefined) || ($scope.starttime.match(/^(\d{1,4})(-|\/)(\d{1,2})\2(\d{1,2})$/) == null) || ($scope.endtime.match(/^(\d{1,4})(-|\/)(\d{1,2})\2(\d{1,2})$/) == null)) {
                $('#inputerror').modal('show')
                $timeout(function() {
                    $('#inputerror').modal('hide')
                }, 1000)
            } else {
                isClick = true
                countInfo.province = $scope.Province.province.name
                countInfo.startTime = $scope.starttime
                countInfo.endTime = $scope.endtime
                if ($scope.City.city == undefined) {
                    countInfo.city = ''
                } else {
                    countInfo.city = $scope.City.city.name
                }
            }
            $scope.currentPage = 1
            getLists($scope.currentPage, $scope.itemsPerPage, countInfo)
        }
        $scope.toscoredetail = function(Id, starttime, endtime) {
            if (isClick == false) {
                DetailInfo = {
                    doctoruserId: Id,
                    startTime: '2017-01-01',
                    endTime: now,
                    token: Storage.get('TOKEN')
                }
            } else {
                DetailInfo = {
                    doctoruserId: Id,
                    startTime: starttime,
                    endTime: endtime,
                    token: Storage.get('TOKEN')
                }
            }
            Monitor1.GetEvaDetail(DetailInfo).then(function(data) {
                $scope.comments = data.results
                if (data.results.length == 0) {
                    $('#nodata').modal('show')
                    $timeout(function() {
                        $('#nodata').modal('hide')
                    }, 1000)
                } else {
                    $('#score_detail').modal('show')
                }
            })

        }
    }])

    // 数据监控——医生收费统计
    .controller('chargeCtrl', ['Dict', 'Monitor1', 'Monitor2', '$scope', '$state', 'Review', 'Storage', '$timeout', 'NgTableParams', function(Dict, Monitor1, Monitor2, $scope, $state, Review, Storage, $timeout, NgTableParams) {
        var token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI1OTI2ZWNmZTkzYmNkNjM3ZTA2ODM5NDAiLCJ1c2VySWQiOiJVMjAxNzA1MjUwMDA5IiwibmFtZSI6IuiMueeUuyIsInJvbGUiOiJhZG1pbiIsImV4cCI6MTUwNTE4NTk2MjAwNCwiaWF0IjoxNTA1MDk5NTYyfQ.N0LeWbA6We2hCkYJNTM5wXfcx8a6KVDvayfFCjnq7lU"

        // 关闭modal控制
        $scope.modal_close = function(target) {
            $(target).modal('hide')
        }

        $('.datetimepicker').datetimepicker({
            language: 'zh-CN',
            format: 'yyyy-mm-dd',
            weekStart: 1,
            todayBtn: 1,
            autoclose: 1,
            todayHighlight: 1,
            startView: 2,
            minView: 2,
            forceParse: 0
        })

        //获取省市
        $scope.Provinces = {}
        $scope.Cities = {}
        Dict.getDistrict({
            level: 1
        }).then(
            function(data) {
                $scope.Provinces = data.results
            },
            function(err) {
                console.log(err)
            }
        )
        $scope.getCity = function(province) {
            if (province != null) {
                Dict.getDistrict({
                    level: '2',
                    province: province.province,
                    city: ''

                }).then(
                    function(data) {
                        $scope.Cities = data.results
                        // console.log($scope.Cities);
                    },
                    function(err) {
                        console.log(err)
                    }
                )
            } else {
                $scope.Cities = {}
                // $scope.Districts ={};
            }
            $scope.City = ''
        }
        // 获取当前日期
        var myDate = new Date();
        var now = myDate.toLocaleDateString();
        var isClick = false
        var countInfo = {}
        var Info = {}
        Storage.set('Tab', 1)

        // ---------------获取搜索(或未搜索)列表及列表数------------------------
        var getLists = function(currentPage, itemsPerPage, countInfo) {
            countInfo.token = Storage.get('TOKEN'),
                Info = Object.assign({}, countInfo)
            Info.limit = itemsPerPage,
                Info.skip = (currentPage - 1) * itemsPerPage
            if (isClick == false) {
                countInfo = {
                    province: '浙江省',
                    city: '',
                    startTime: '2017-01-01',
                    endTime: now,
                    token: Storage.get('TOKEN')
                }
                Info = Object.assign({}, countInfo),
                    Info.limit = itemsPerPage,
                    Info.skip = (currentPage - 1) * itemsPerPage
            }
            console.log(Info);
            //获取搜索列表
            var promise = Monitor1.GetCharge(Info)
            promise.then(function(data) {
                $scope.chargetableParams = new NgTableParams({
                    count: 20
                }, {
                    counts: [],
                    dataset: data.results
                })
                if (data.results.length == 0) {
                    $('#nodata').modal('show')
                    $timeout(function() {
                        $('#nodata').modal('hide')
                    }, 1000)
                }
            }, function(err) {})
            // 获取总条目数
            var promise = Monitor1.GetCharge(countInfo)
            promise.then(function(data) {
                $scope.totalItems = data.results.length
                console.log($scope.totalItems)
            }, function() {})
        }
        // ---------------------------------------------------------------------
        //初始化列表
        $scope.currentPage = 1
        $scope.itemsPerPage = 100
        getLists($scope.currentPage, $scope.itemsPerPage, countInfo)
        // 页面改变
        $scope.pageChanged = function() {
            console.log($scope.currentPage)
            getLists($scope.currentPage, $scope.itemsPerPage, countInfo)
        }
        // 当前页面的总条目数改变
        $scope.changeLimit = function(num) {
            $scope.itemsPerPage = num
            $scope.currentPage = 1
            getLists($scope.currentPage, $scope.itemsPerPage, countInfo)
        }

        $scope.searchList = function() {
            if (($scope.Province.province == undefined) || ($scope.starttime == undefined) || ($scope.endtime == undefined) || ($scope.starttime.match(/^(\d{1,4})(-|\/)(\d{1,2})\2(\d{1,2})$/) == null) || ($scope.endtime.match(/^(\d{1,4})(-|\/)(\d{1,2})\2(\d{1,2})$/) == null)) {
                $('#inputerror').modal('show')
                $timeout(function() {
                    $('#inputerror').modal('hide')
                }, 1000)
            } else {
                isClick = true
                countInfo.province = $scope.Province.province.name
                countInfo.startTime = $scope.starttime
                countInfo.endTime = $scope.endtime
                if ($scope.City.city == undefined) {
                    countInfo.city = ''
                } else {
                    countInfo.city = $scope.City.city.name
                }
            }
            $scope.currentPage = 1
            getLists($scope.currentPage, $scope.itemsPerPage, countInfo)
        }

        $scope.tochargedetail = function(detail) {
            $scope.info = detail
            $('#charge_detail').modal('show')
        }
    }])

    // 数据监控——医生工作量统计
    .controller('workloadCtrl', ['Dict', 'Monitor1', 'Monitor2', '$scope', '$state', 'Review', 'Storage', '$timeout', 'NgTableParams', function(Dict, Monitor1, Monitor2, $scope, $state, Review, Storage, $timeout, NgTableParams) {
        var token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI1OTI2ZWNmZTkzYmNkNjM3ZTA2ODM5NDAiLCJ1c2VySWQiOiJVMjAxNzA1MjUwMDA5IiwibmFtZSI6IuiMueeUuyIsInJvbGUiOiJhZG1pbiIsImV4cCI6MTUwNTE4NTk2MjAwNCwiaWF0IjoxNTA1MDk5NTYyfQ.N0LeWbA6We2hCkYJNTM5wXfcx8a6KVDvayfFCjnq7lU"

        $('.datetimepicker').datetimepicker({
            language: 'zh-CN',
            format: 'yyyy-mm-dd',
            weekStart: 1,
            todayBtn: 1,
            autoclose: 1,
            todayHighlight: 1,
            startView: 2,
            minView: 2,
            forceParse: 0
        })

        //获取省市
        $scope.Provinces = {}
        $scope.Cities = {}
        Dict.getDistrict({
            level: 1
        }).then(
            function(data) {
                $scope.Provinces = data.results
            },
            function(err) {
                console.log(err)
            }
        )
        $scope.getCity = function(province) {
            if (province != null) {
                Dict.getDistrict({
                    level: '2',
                    province: province.province,
                    city: ''

                }).then(
                    function(data) {
                        $scope.Cities = data.results
                        // console.log($scope.Cities);
                    },
                    function(err) {
                        console.log(err)
                    }
                )
            } else {
                $scope.Cities = {}
                // $scope.Districts ={};
            }
            $scope.City = ''
        }

        // 获取当前日期
        var myDate = new Date();
        var now = myDate.toLocaleDateString();
        var isClick = false
        var countInfo = {}
        var Info = {}
        Storage.set('Tab', 1)

        // ---------------获取搜索(或未搜索)列表及列表数------------------------
        var getLists = function(currentPage, itemsPerPage, countInfo) {
            countInfo.token = Storage.get('TOKEN'),
                Info = Object.assign({}, countInfo)
            Info.limit = itemsPerPage,
                Info.skip = (currentPage - 1) * itemsPerPage
            if (isClick == false) {
                countInfo = {
                    province: '浙江省',
                    city: '',
                    startTime: now,
                    endTime: now,
                    token: Storage.get('TOKEN')
                }
                Info = Object.assign({}, countInfo),
                    Info.limit = itemsPerPage,
                    Info.skip = (currentPage - 1) * itemsPerPage
            }
            console.log(Info);
            //获取搜索列表
            var promise = Monitor1.GetWorkload(Info)
            promise.then(function(data) {
                $scope.workloadtableParams = new NgTableParams({
                    count: 20
                }, {
                    counts: [],
                    dataset: data.results
                })
                if (data.results.length == 0) {
                    $('#nodata').modal('show')
                    $timeout(function() {
                        $('#nodata').modal('hide')
                    }, 1000)
                }
            }, function(err) {})
            // 获取总条目数
            var promise = Monitor1.GetWorkload(countInfo)
            promise.then(function(data) {
                $scope.totalItems = data.results.length
                console.log($scope.totalItems)
            }, function() {})
        }
        // ---------------------------------------------------------------------
        //初始化列表
        $scope.currentPage = 1
        $scope.itemsPerPage = 100
        getLists($scope.currentPage, $scope.itemsPerPage, countInfo)
        // 页面改变
        $scope.pageChanged = function() {
            console.log($scope.currentPage)
            getLists($scope.currentPage, $scope.itemsPerPage, countInfo)
        }
        // 当前页面的总条目数改变
        $scope.changeLimit = function(num) {
            $scope.itemsPerPage = num
            $scope.currentPage = 1
            getLists($scope.currentPage, $scope.itemsPerPage, countInfo)
        }

        $scope.searchList = function() {
            if (($scope.Province.province == undefined) || ($scope.starttime == undefined) || ($scope.endtime == undefined) || ($scope.starttime.match(/^(\d{1,4})(-|\/)(\d{1,2})\2(\d{1,2})$/) == null) || ($scope.endtime.match(/^(\d{1,4})(-|\/)(\d{1,2})\2(\d{1,2})$/) == null)) {
                $('#inputerror').modal('show')
                $timeout(function() {
                    $('#inputerror').modal('hide')
                }, 1000)
            } else {
                isClick = true
                countInfo.province = $scope.Province.province.name
                countInfo.startTime = $scope.starttime
                countInfo.endTime = $scope.endtime
                if ($scope.City.city == undefined) {
                    countInfo.city = ''
                } else {
                    countInfo.city = $scope.City.city.name
                }
            }
            $scope.currentPage = 1
            getLists($scope.currentPage, $scope.itemsPerPage, countInfo)
        }
    }])

    // 数据监控——患者地区分布
    .controller('PatregionCtrl', ['Dict', 'Monitor2', '$scope', '$state', 'Review', 'Storage', '$timeout', 'NgTableParams', function(Dict, Monitor2, $scope, $state, Review, Storage, $timeout, NgTableParams) {
        var token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI1OTI2ZWNmZTkzYmNkNjM3ZTA2ODM5NDAiLCJ1c2VySWQiOiJVMjAxNzA1MjUwMDA5IiwibmFtZSI6IuiMueeUuyIsInJvbGUiOiJhZG1pbiIsImV4cCI6MTUwNTE4NTk2MjAwNCwiaWF0IjoxNTA1MDk5NTYyfQ.N0LeWbA6We2hCkYJNTM5wXfcx8a6KVDvayfFCjnq7lU"

        $('.datetimepicker').datetimepicker({
            language: 'zh-CN',
            format: 'yyyy-mm-dd',
            weekStart: 1,
            todayBtn: 1,
            autoclose: 1,
            todayHighlight: 1,
            startView: 2,
            minView: 2,
            forceParse: 0
        })
        // 关闭modal控制
        $scope.modal_close = function(target) {
            $(target).modal('hide')
        }
        //获取省市
        $scope.Provinces = {}
        $scope.Cities = {}
        Dict.getDistrict({
            level: 1
        }).then(
            function(data) {
                $scope.Provinces = data.results
            },
            function(err) {
                console.log(err)
            }
        )
        $scope.getCity = function(province) {
            if (province != null) {
                Dict.getDistrict({
                    level: '2',
                    province: province.province,
                    city: ''

                }).then(
                    function(data) {
                        $scope.Cities = data.results
                        // console.log($scope.Cities);
                    },
                    function(err) {
                        console.log(err)
                    }
                )
            } else {
                $scope.Cities = {}
                // $scope.Districts ={};
            }
            $scope.City = ''
        }

        $scope.$on('$viewContentLoaded', function() {
            showpie()
        });

        // 获取当前日期
        var myDate = new Date();
        var now = myDate.toLocaleDateString();

        var isClick = false
        var RegionInfo = {}
        var textInfo = ''
        $scope.Province = {}
        $scope.viewPatRegion = function() {
            if (($scope.Province.province == undefined) || ($scope.starttime == undefined) || ($scope.endtime == undefined) || ($scope.starttime.match(/^(\d{1,4})(-|\/)(\d{1,2})\2(\d{1,2})$/) == null) || ($scope.endtime.match(/^(\d{1,4})(-|\/)(\d{1,2})\2(\d{1,2})$/) == null)) {
                $('#inputerror').modal('show')
                $timeout(function() {
                    $('#inputerror').modal('hide')
                }, 1000)
            } else {
                var selectprovince = $scope.Province.province.name
                var selectcity = $scope.City.city
                var starttime = $scope.starttime + ' 00:00:00'
                var endtime = $scope.endtime + ' 00:00:00'
                isClick = true
            }
            if (selectcity == undefined) {
                RegionInfo = {
                    province: selectprovince,
                    startTime: starttime,
                    endTime: endtime,
                    token: Storage.get('TOKEN')
                }
                textInfo = selectprovince + '患者地区分布'
            } else {
                RegionInfo = {
                    province: selectprovince,
                    city: selectcity.name,
                    startTime: starttime,
                    endTime: endtime,
                    token: Storage.get('TOKEN')
                }
                textInfo = selectprovince + selectcity.name + '患者地区分布'
            }
            showpie()
        }

        var showpie = function() {
            if (isClick == false) {
                RegionInfo = {
                    province: '浙江省',
                    city: '',
                    startTime: '2017-01-01 00:00:00',
                    endTime: now,
                    token: Storage.get('TOKEN')
                }
                textInfo = '浙江省患者地区分布'
            }
            Monitor2.GetPatRegion(RegionInfo).then(function(data) {
                    if (data.results.length == 0) {
                        $('#nodata').modal('show')
                        $timeout(function() {
                            $('#nodata').modal('hide')
                        }, 1000)
                    }
                    var array = data.results
                    var arr = new Array()
                    var sum = 0
                    for (var i = 0; i < array.length; i++) {
                        arr[i] = {
                            name: array[i]._id,
                            value: array[i].count
                        }
                        sum += array[i].count
                    }

                    var Patregion = echarts.init(document.getElementById('Patregion'))
                    var option = {
                        title: {
                            text: textInfo,
                            subtext: '患者总人数:' + sum + '人',
                            x: 'center'
                        },
                        tooltip: {
                            trigger: 'item',
                            formatter: '{a} <br/>{b} : {c} ({d}%)'
                        },
                        series: [{
                            name: '患者人数',
                            type: 'pie',
                            radius: '55%',
                            center: ['50%', '60%'],
                            data: arr,
                            itemStyle: {
                                emphasis: {
                                    shadowBlur: 10,
                                    shadowOffsetX: 0,
                                    shadowColor: 'rgba(0, 0, 0, 0.5)'
                                }
                            }
                        }]
                    }
                    Patregion.setOption(option)
                }),
                function(err) {
                    console.log(err)
                }
        }
    }])

    // 数据监控——患者变化趋势
    .controller('PattrendCtrl', ['Dict', 'Monitor2', '$scope', '$state', 'Review', 'Storage', '$timeout', 'NgTableParams', function(Dict, Monitor2, $scope, $state, Review, Storage, $timeout, NgTableParams) {
        var token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI1OTI2ZWNmZTkzYmNkNjM3ZTA2ODM5NDAiLCJ1c2VySWQiOiJVMjAxNzA1MjUwMDA5IiwibmFtZSI6IuiMueeUuyIsInJvbGUiOiJhZG1pbiIsImV4cCI6MTUwNTE4NTk2MjAwNCwiaWF0IjoxNTA1MDk5NTYyfQ.N0LeWbA6We2hCkYJNTM5wXfcx8a6KVDvayfFCjnq7lU"

        $('.datetimepicker').datetimepicker({
            language: 'zh-CN',
            format: 'yyyy-mm-dd',
            weekStart: 1,
            todayBtn: 1,
            autoclose: 1,
            todayHighlight: 1,
            startView: 2,
            minView: 2,
            forceParse: 0
        })

        // 关闭modal控制
        $scope.modal_close = function(target) {
            $(target).modal('hide')
        }
        //获取省市
        $scope.Provinces = {}
        $scope.Cities = {}
        Dict.getDistrict({
            level: 1
        }).then(
            function(data) {
                $scope.Provinces = data.results
            },
            function(err) {
                console.log(err)
            }
        )
        $scope.getCity = function(province) {
            if (province != null) {
                Dict.getDistrict({
                    level: '2',
                    province: province.province,
                    city: ''

                }).then(
                    function(data) {
                        $scope.Cities = data.results
                        // console.log($scope.Cities);
                    },
                    function(err) {
                        console.log(err)
                    }
                )
            } else {
                $scope.Cities = {}
                // $scope.Districts ={};
            }
            $scope.City = ''
        }

        $scope.$on('$viewContentLoaded', function() {
            showlinegraph()
        });

        // 获取当前日期
        var myDate = new Date();
        var now = myDate.toLocaleDateString();

        var isClick = false
        var Info = {}
        var textInfo = ''
        $scope.Province = {}
        $scope.viewPatTrend = function() {
            if (($scope.Province.province == undefined) || ($scope.starttime == undefined) || ($scope.endtime == undefined) || ($scope.starttime.match(/^(\d{1,4})(-|\/)(\d{1,2})\2(\d{1,2})$/) == null) || ($scope.endtime.match(/^(\d{1,4})(-|\/)(\d{1,2})\2(\d{1,2})$/) == null)) {
                $('#inputerror').modal('show')
                $timeout(function() {
                    $('#inputerror').modal('hide')
                }, 1000)
            } else {
                var selectprovince = $scope.Province.province.name
                var selectcity = $scope.City.city
                var starttime = $scope.starttime + ' 00:00:00'
                var endtime = $scope.endtime + ' 00:00:00'
                isClick = true
            }
            if (selectcity == undefined) {
                Info = {
                    province: selectprovince,
                    startTime: starttime,
                    endTime: endtime,
                    token: Storage.get('TOKEN')
                }
                textInfo = selectprovince + '患者注册变化趋势折线图'
            } else {
                Info = {
                    province: selectprovince,
                    city: selectcity.name,
                    startTime: starttime,
                    endTime: endtime,
                    token: Storage.get('TOKEN')
                }
                textInfo = selectprovince + selectcity.name + '患者注册变化趋势折线图'
            }
            showlinegraph()
        }

        var showlinegraph = function() {
            if (isClick == false) {
                Info = {
                    province: '浙江省',
                    city: '',
                    startTime: '2017-01-01 00:00:00',
                    endTime: now,
                    token: Storage.get('TOKEN')
                }
                textInfo = '浙江省患者注册变化趋势折线图'
            }
            Monitor2.GetPatTrend(Info).then(function(data) {
                    if (data.results.length == 0) {
                        $('#nodata').modal('show')
                        $timeout(function() {
                            $('#nodata').modal('hide')
                        }, 1000)
                    }
                    var count = new Array()
                    var time = new Array()
                    var sum = 0
                    var array = data.results
                    var timecount = new Array()
                    for (var i = 0; i < array.length; i++) {
                        count[i] = array[i].count
                        time[i] = array[i]._id
                        timecount[i] = {
                            t: time[i],
                            c: count[i]
                        }
                        sum += count[i]
                    }
                    timecount.sort(function(a, b) {
                        return Date.parse(a.t) - Date.parse(b.t) // 时间正序
                    })
                    var _count = new Array()
                    var _time = new Array()
                    for (var i = 0; i < array.length; i++) {
                        _count[i] = timecount[i].c
                        _time[i] = timecount[i].t
                    }
                    var PatTrend = echarts.init(document.getElementById('Pattrend'))
                    var option = {
                        title: {
                            text: textInfo,
                            subtext: '新增注册患者' + sum + '人',
                            x: 'center'
                        },
                        tooltip: {
                            trigger: 'axis'
                        },
                        xAxis: {
                            type: 'category',
                            boundaryGap: false,
                            data: _time
                        },
                        yAxis: {
                            type: 'value',
                            axisLabel: {
                                formatter: '{value} 人'
                            }
                        },
                        series: [{
                            name: '注册人数',
                            type: 'line',
                            data: _count,
                            markPoint: {
                                data: []
                                // markLine: {
                                //   data: [
                                //               { type: 'average', name: '平均值' }
                                //   ]
                                // }
                            }
                        }]
                    }
                    PatTrend.setOption(option)
                }),
                function(err) {
                    console.log(err)
                }
        }
    }])

    // 数据监控——患者保险统计
    .controller('PatinsuranceCtrl', ['Dict', 'Monitor2', '$scope', '$state', 'Review', 'Storage', '$timeout', 'NgTableParams', function(Dict, Monitor2, $scope, $state, Review, Storage, $timeout, NgTableParams) {
        var token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI1OTI2ZWNmZTkzYmNkNjM3ZTA2ODM5NDAiLCJ1c2VySWQiOiJVMjAxNzA1MjUwMDA5IiwibmFtZSI6IuiMueeUuyIsInJvbGUiOiJhZG1pbiIsImV4cCI6MTUwNTE4NTk2MjAwNCwiaWF0IjoxNTA1MDk5NTYyfQ.N0LeWbA6We2hCkYJNTM5wXfcx8a6KVDvayfFCjnq7lU"

        $('.datetimepicker').datetimepicker({
            language: 'zh-CN',
            format: 'yyyy-mm-dd',
            weekStart: 1,
            todayBtn: 1,
            autoclose: 1,
            todayHighlight: 1,
            startView: 2,
            minView: 2,
            forceParse: 0
        })

        //获取省市
        $scope.Provinces = {}
        $scope.Cities = {}
        Dict.getDistrict({
            level: 1
        }).then(
            function(data) {
                $scope.Provinces = data.results
            },
            function(err) {
                console.log(err)
            }
        )
        $scope.getCity = function(province) {
            if (province != null) {
                Dict.getDistrict({
                    level: '2',
                    province: province.province,
                    city: ''

                }).then(
                    function(data) {
                        $scope.Cities = data.results
                        // console.log($scope.Cities);
                    },
                    function(err) {
                        console.log(err)
                    }
                )
            } else {
                $scope.Cities = {}
                // $scope.Districts ={};
            }
            $scope.City = ''
        }
        // 获取当前日期
        var myDate = new Date();
        var now = myDate.toLocaleDateString();
        var isClick = false
        var countInfo = {}
        var Info = {}
        Storage.set('Tab', 1)

        // ---------------获取搜索(或未搜索)列表及列表数------------------------
        var getLists = function(currentPage, itemsPerPage, countInfo) {
            countInfo.token = Storage.get('TOKEN'),
                Info = Object.assign({}, countInfo)
            Info.limit = itemsPerPage,
                Info.skip = (currentPage - 1) * itemsPerPage
            if (isClick == false) {
                countInfo = {
                    province: '浙江省',
                    city: '',
                    startTime: '2017-01-01',
                    endTime: now,
                    token: Storage.get('TOKEN')
                }
                Info = Object.assign({}, countInfo),
                    Info.limit = itemsPerPage,
                    Info.skip = (currentPage - 1) * itemsPerPage
            }
            console.log(Info);
            //获取搜索列表
            var promise = Monitor2.GetPatInsurance(Info)
            promise.then(function(data) {
                $scope.insurancetableParams = new NgTableParams({
                    count: 20
                }, {
                    counts: [],
                    dataset: data.results
                })
                if (data.results.length == 0) {
                    $('#nodata').modal('show')
                    $timeout(function() {
                        $('#nodata').modal('hide')
                    }, 1000)
                }
            }, function(err) {})
            // 获取总条目数
            var promise = Monitor2.GetPatInsurance(countInfo)
            promise.then(function(data) {
                $scope.totalItems = data.results.length
                console.log($scope.totalItems)
            }, function() {})
        }
        // ---------------------------------------------------------------------
        //初始化列表
        $scope.currentPage = 1
        $scope.itemsPerPage = 100
        getLists($scope.currentPage, $scope.itemsPerPage, countInfo)
        // 页面改变
        $scope.pageChanged = function() {
            console.log($scope.currentPage)
            getLists($scope.currentPage, $scope.itemsPerPage, countInfo)
        }
        // 当前页面的总条目数改变
        $scope.changeLimit = function(num) {
            $scope.itemsPerPage = num
            $scope.currentPage = 1
            getLists($scope.currentPage, $scope.itemsPerPage, countInfo)
        }

        $scope.searchList = function() {
            if (($scope.Province.province == undefined) || ($scope.starttime == undefined) || ($scope.endtime == undefined) || ($scope.starttime.match(/^(\d{1,4})(-|\/)(\d{1,2})\2(\d{1,2})$/) == null) || ($scope.endtime.match(/^(\d{1,4})(-|\/)(\d{1,2})\2(\d{1,2})$/) == null)) {
                $('#inputerror').modal('show')
                $timeout(function() {
                    $('#inputerror').modal('hide')
                }, 1000)
            } else {
                isClick = true
                countInfo.province = $scope.Province.province.name
                countInfo.startTime = $scope.starttime
                countInfo.endTime = $scope.endtime
                if ($scope.City.city == undefined) {
                    countInfo.city = ''
                } else {
                    countInfo.city = $scope.City.city.name
                }
            }
        }
    }])

    // 数据监控——患者分组统计
    .controller('PatgroupCtrl', ['Monitor2', '$scope', '$state', 'Review', 'Storage', '$timeout', 'NgTableParams', function(Monitor2, $scope, $state, Review, Storage, $timeout, NgTableParams) {
        var token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI1OTI2ZWNmZTkzYmNkNjM3ZTA2ODM5NDAiLCJ1c2VySWQiOiJVMjAxNzA1MjUwMDA5IiwibmFtZSI6IuiMueeUuyIsInJvbGUiOiJhZG1pbiIsImV4cCI6MTUwNTE4NTk2MjAwNCwiaWF0IjoxNTA1MDk5NTYyfQ.N0LeWbA6We2hCkYJNTM5wXfcx8a6KVDvayfFCjnq7lU"

        // 患者分组显示--图表
        // var isClick = false
        var type = ''
        var tempinfo = {
            classNo: 'class_1',
            token: Storage.get('TOKEN')
        }
        var countInfo = {}

        // $scope.$on('$viewContentLoaded', function() {
        //     showlist()
        // });

        // if (isClick == false) {
        //     // statemen{
        //     Info = {
        //         classNo: 'class_1',
        //         token: Storage.get('TOKEN')
        //     }
        // } else {
        //     Info = {
        //         classNo: type,
        //         token: Storage.get('TOKEN')
        //     }
        // }

        // ---------------获取列表------------------------
        var getLists = function(currentPage, itemsPerPage, countInfo) {
            countInfo.token = Storage.get('TOKEN'),
                tempinfo = Object.assign({}, countInfo)
            tempinfo.limit = itemsPerPage,
                tempinfo.skip = (currentPage - 1) * itemsPerPage
            // if (isClick == false) {
            //     countInfo = {
            //         province: '浙江省',
            //         city: '',
            //         startTime: '2017-01-01',
            //         endTime: now,
            //         token: Storage.get('TOKEN')
            //     }
            //     tempinfo = Object.assign({}, countInfo),
            //         tempinfo.limit = itemsPerPage,
            //         Info.skip = (currentPage - 1) * itemsPerPage
            // }
            console.log(tempinfo);
            //获取列表
            var promise = Monitor2.GetPatGroup(tempinfo)
            promise.then(function(data) {
                console.log(data.results.length)
                if (data.results.length == 0) {
                    $('#nodata').modal('show')
                    $timeout(function() {
                        $('#nodata').modal('hide')
                    }, 1000)
                }
                $scope.grouptableParams = new NgTableParams({
                    count: 20
                }, {
                    counts: [],
                    dataset: data.results
                })
            })
        }

        //初始化列表
        $scope.currentPage = 1
        $scope.itemsPerPage = 100
        getLists($scope.currentPage, $scope.itemsPerPage, tempinfo)

        // 页面改变
        // $scope.pageChanged = function() {
        //     getLists($scope.currentPage, $scope.itemsPerPage, countInfo)
        // }

        // 当前页面的总条目数改变
        // $scope.changeLimit = function(num) {
        //     $scope.itemsPerPage = num
        //     $scope.currentPage = 1
        //     getLists($scope.currentPage, $scope.itemsPerPage, countInfo)
        // }

        $scope.viewclass = function() {
            // isClick = true
            var value = $scope.value
            type = 'class_' + value
            tempinfo = {
                classNo: type,
                token: Storage.get('TOKEN')
            }
            getLists($scope.currentPage, $scope.itemsPerPage, tempinfo)

        }

    }])

    // 保险管理
    .controller('insumanageCtrl', ['Policy', '$scope', '$state', 'Review', 'Storage', '$timeout', 'NgTableParams', function(insurance, $scope, $state, Review, Storage, $timeout, NgTableParams) {
        $scope.toinsupats = function() {
            $state.go('main.insumanage.insupatmanage')
        }
        $scope.toinsuAs = function() {
            $state.go('main.insumanage.insuAmanage')
        }
    }])

    // 保险管理——查看专员
    .controller('insuAmanageCtrl', ['Roles', 'NgTableParams', 'Policy', '$scope', '$state', 'Storage', '$timeout', function(Roles, NgTableParams, Policy, $scope, $state, Storage, $timeout) {
        var token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI1OTI2ZWNmZTkzYmNkNjM3ZTA2ODM5NDAiLCJ1c2VySWQiOiJVMjAxNzA1MjUwMDA5IiwibmFtZSI6IuiMueeUuyIsInJvbGUiOiJpbnN1cmFuY2VDIiwiZXhwIjoxNTA1NTU5MjY4Mjk3LCJpYXQiOjE1MDU0NzI4Njh9.lLW5NuIFFSi2YdlzuHUAZMm2Gqq_nec6zA_5jfgiqn0'
        var getLists = function() {
            AgentInfo = {
                token: Storage.get('TOKEN'),
            }
            var promise = Policy.getAgentList(AgentInfo)
            promise.then(function(data) {
                $scope.insuAtableParams = new NgTableParams({
                    count: 10000
                }, {
                    // counts: [],
                    dataset: data.data
                })
                $scope.totalNums = data.data.length
            }, function(err) {})
        }
        getLists()
        //注销专员
        $scope.agentoff = function(Id) {
            OffInfo = {
                userId: Id,
                token: Storage.get('TOKEN'),
                roles: 'insuranceA'
            }
            console.log(OffInfo)
            Policy.removeAgent({
                insuranceAId: Id,
                token: Storage.get('TOKEN')
            }).then(function(data) {}, function(err) {
                console.log(err)
            })
            Roles.removeRoles(OffInfo).then(function(data) {
                getLists()
            }, function(err) {
                console.log(err)
            })
        }
        $scope.searchList = function() {
            Info = {
                token: Storage.get('TOKEN'),
                name: $scope.agentname
            }
            var promise = Policy.getAgentList(Info)
            promise.then(function(data) {
                $scope.insuAtableParams = new NgTableParams({
                    count: 10000
                }, {
                    // counts: [],
                    dataset: data.data
                })
                // if (data.data.length == 0) {
                //     $('#nodata').modal('show')
                //     $timeout(function() {
                //         $('#nodata').modal('hide')
                //     }, 1000)
                // }
            }, function(err) {})
        }
        $scope.searchClear = function() {
            $scope.agentname = ""
            getLists()
        }
        $scope.modal_close = function(target) {
            $(target).modal('hide')
        }
    }])

    // 保险管理——查看患者
    .controller('insupatmanageCtrl', ['NgTableParams', 'Policy', '$scope', '$state', 'Storage', '$timeout', 'Upload', function(NgTableParams, Policy, $scope, $state, Storage, $timeout, Upload) {
        var token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI1OTI2ZWNmZTkzYmNkNjM3ZTA2ODM5NDAiLCJ1c2VySWQiOiJVMjAxNzA1MjUwMDA5IiwibmFtZSI6IuiMueeUuyIsInJvbGUiOiJpbnN1cmFuY2VDIiwiZXhwIjoxNTA1NTU5MjY4Mjk3LCJpYXQiOjE1MDU0NzI4Njh9.lLW5NuIFFSi2YdlzuHUAZMm2Gqq_nec6zA_5jfgiqn0'
        // var token ='eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI1OTk1NWUwZGFiOGIwZDRlZDVlYjRjODMiLCJ1c2VySWQiOiJVMjAxNzA4MTcwMDA0IiwibmFtZSI6IumYruWNk-asoyIsInJvbGUiOiJpbnN1cmFuY2VBIiwiZXhwIjoxNTAyOTgwNDc2MTI4LCJpYXQiOjE1MDI5NzY4NzZ9.S12aq6jzDQE4CMW2FSdcQk8ArcG3pCyEky00X4YGmr0'


        // 患者列表显示
        var getLists = function(_userlist) {
            userlist = _userlist
            userlist.token = Storage.get('TOKEN')
            var promise = Policy.getPatientList(userlist)
            promise.then(function(data) {
                $scope.insupattableParams = new NgTableParams({
                    count: 10000
                }, {
                    // counts: [],
                    dataset: data.data
                })
                $scope.totalItems = data.data.length
            }, function(err) {})
        }

        $scope.search_status = [
            { id: 0, name: '有意向，未安排专员' },
            { id: 1, name: '有意向，已安排专员' },
            { id: 2, name: '保单待审核' },
            { id: 3, name: '保单审核已通过' },
            { id: 4, name: '保单审核未通过' },
            { id: 5, name: '保单过期' },
            { id: 9, name: '全部患者' }
        ]

        //初始化
        $scope.userlist = {}
        $scope.userlist.status = 9
        getLists($scope.userlist)

        //搜索
        $scope.searchList = function() {
            getLists($scope.userlist)
        }

        //清空搜索
        $scope.searchClear = function() {
            $scope.userlist = {}
            $scope.userlist.status = 9
            getLists($scope.userlist)
        }

        // 跟踪记录
        $scope.postfu = function(userdetail) {
            console.log(userdetail)
            tempuserID = userdetail.patientId.userId
            $scope.history = {}
            $scope.history.name = userdetail.patientId.name
            var PatInfo = {
                patientId: userdetail.patientId.userId,
                token: Storage.get('TOKEN'),
                skip: 0,
                limit: 10000
            }
            var promise = Policy.getFollowupHis(PatInfo)
            promise.then(function(data) {
                $scope.followuphistableParams = new NgTableParams({
                    count: 5
                }, {
                    counts: [],
                    dataset: data.data
                })
            }, function(err) {})

            // $('#Followuppost').modal('show')


            $('#Followuppost').modal('show').css({
                height: 'auto',
                // 'margin-left': function () {  
                //     return -($(this).width() / 2);  
                // }  
            });

            // function initFileInput(ctrlName, uploadUrl) {
            //     var control = $('#' + ctrlName);
            //     control.fileinput({
            //         language: 'zh', //设置语言
            //         uploadUrl: uploadUrl, //上传的地址
            //         allowedFileExtensions: ['jpg', 'png', 'gif', 'jpeg'], //接收的文件后缀
            //         showUpload: false, //是否显示上传按钮
            //         showCaption: false, //是否显示标题
            //         browseClass: "btn btn-primary", //按钮样式             
            //         previewFileIcon: "<i class='glyphicon glyphicon-king'></i>",
            //         uploadAsync: false,
            //         uploadExtraData: {
            //             token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI1OTk1NWRkZGFiOGIwZDRlZDVlYjRjODIiLCJ1c2VySWQiOiJVMjAxNzA4MTcwMDAzIiwibmFtZSI6IuiMueeUuyIsInJvbGUiOiJhZG1pbiIsImV4cCI6MTUwMzQ3OTg1NjczMiwiaWF0IjoxNTAzNDc2MjU2fQ.e5OhZEOc8Rfe8vr4gaPCcbO-2LD-ij8e9znerHjgHhs",
            //         },
            //     });
            // }

            // //初始化fileinput控件（第一次初始化）
            // initFileInput("imageupload", "http://docker2.haihonghospitalmanagement.com/uploads/photos/");


            var control = $("#fuimageupload");
            control.fileinput({
                language: 'zh', //设置语言
                uploadUrl: "http://docker2.haihonghospitalmanagement.com/api/v2/upload?token=" + Storage.get('TOKEN') + "&type=followup", //上传的地址
                allowedFileExtensions: ['jpg', 'png', 'gif', 'jpeg'], //接收的文件后缀
                // showUpload: false, //是否显示上传按钮
                showCaption: false, //是否显示标题
                showClose: false,
                browseClass: "btn btn-primary", //按钮样式             
                previewFileIcon: "<i class='glyphicon glyphicon-king'></i>",
                uploadAsync: false,
                maxFileCount: 1,
            });

            var results = ''
            //提交完成后的回调函数    
            control.on("fileuploaded", function(event, data, previewId, index) {
                console.log(data);
                $scope.followupInfo.photoUrls[0] = "http://df2.haihonghospitalmanagement.com/" + data.response
                    .path_resized
            });

        }

        // $("#fuimageupload").change(function() {
        //     var $file = $(this);
        //     var fileObj = $file[0];
        //     var windowURL = window.URL || window.webkitURL;
        //     var dataURL;
        //     var $img = $("#preview");

        //     if (fileObj && fileObj.files && fileObj.files[0]) {
        //         dataURL = windowURL.createObjectURL(fileObj.files[0]);
        //         $img.attr('src', dataURL);
        //     } else {
        //         dataURL = $file.val();
        //         var imgObj = document.getElementById("preview");
        //         imgObj.style.filter = "progid:DXImageTransform.Microsoft.AlphaImageLoader(sizingMethod=scale)";
        //         imgObj.filters.item("DXImageTransform.Microsoft.AlphaImageLoader").src = dataURL;
        //         console.log($("#preview")[0].src)
        //     }
        // })

        var tempuserID = ''
        $scope.followupInfo = {}
        $scope.followupInfo.photoUrls = []

        $scope.followup = function(_followupinfo) {
            _followupinfo.token = Storage.get('TOKEN')
            _followupinfo.patientId = tempuserID
            console.log(_followupinfo)
            var promise = Policy.postFollowUp(_followupinfo)
            promise.then(function(data) {
                if (data.msg == "跟踪录入成功") {
                    $('#fupostsuccess').modal('show')
                    $timeout(function() {
                        $('#fupostsuccess').modal('hide')
                    }, 1000)

                    $('#fuimageupload').fileinput('destroy');

                    $('#Followuppost').modal('hide')
                    var tempuserlist = {}
                    tempuserlist.status = 9
                    getLists(tempuserlist);
                } else {
                    $('#fupostfailed').modal('show')
                    $timeout(function() {
                        $('#fupostfailed').modal('hide')
                    }, 1000)
                }
            }, function(err) {})
        }

        $('#Followuppost').on('hidden.bs.modal', function() {
            // modal关闭后清空
            $scope.followupInfo.content = ""
            $('#fuimageupload').fileinput('destroy');

        })

        $('#followuppic').on('hidden.bs.modal', function() {
            $scope.followuppic = ""

            // 解决多层modal关闭后的滚动问题
            $(document.body).addClass("modal-open");
        })


        // 打开跟踪记录图片modal
        $scope.showfollowuppic = function(_photos) {
            // 判断该条记录是否包含记录图片
            if (_photos.length == 0) {
                $('#nopic').modal('show')
                $timeout(function() {
                    $('#nopic').modal('hide')
                }, 1000)
            } else {
                $scope.followuppic = _photos[0]
                $('#followuppic').modal('show')
            }
        }

        // 保单录入
        $scope.postp = function(userdetail) {
            console.log(userdetail)
            $scope.policy = {}
            $scope.policy.name = userdetail.patientId.name
            $('#Policypost').modal('show')
            tempuserID = userdetail.patientId.userId

            var control = $("#poimageupload");
            control.fileinput({
                language: 'zh', //设置语言
                uploadUrl: "http://docker2.haihonghospitalmanagement.com/api/v2/upload?token=" + Storage.get('TOKEN') + "&type=policy", //上传的地址
                allowedFileExtensions: ['jpg', 'png', 'gif', 'jpeg'], //接收的文件后缀
                // showUpload: false, //是否显示上传按钮
                showCaption: false, //是否显示标题
                browseClass: "btn btn-primary", //按钮样式             
                previewFileIcon: "<i class='glyphicon glyphicon-king'></i>",
                uploadAsync: false,
            });

            var results = ''
            //提交完成后的回调函数    
            control.on("fileuploaded", function(event, data, previewId, index) {
                console.log(data);
                $scope.policyInfo.photoUrls[0] = "http://df2.haihonghospitalmanagement.com/" + data.response
                    .path_resized
            });
        }

        $scope.policyInfo = {}
        $scope.policyInfo.photoUrls = []

        $scope.postpolicy = function(_policyinfo) {
            _policyinfo.token = Storage.get('TOKEN')
            _policyinfo.patientId = tempuserID
            console.log(_policyinfo)
            var promise = Policy.postPolicy(_policyinfo)
            promise.then(function(data) {
                console.log(data)
                if (data.msg == "保单录入成功") {
                    $('#popostsuccess').modal('show')
                    $timeout(function() {
                        $('#popostsuccess').modal('hide')
                    }, 1000)

                    $('#poimageupload').fileinput('destroy');

                    $('#Policypost').modal('hide')
                    var tempuserlist = {}
                    tempuserlist.status = 9
                    getLists(tempuserlist);
                } else {
                    $('#popostfailed').modal('show')
                    $timeout(function() {
                        $('#popostfailed').modal('hide')
                    }, 1000)
                }
            }, function(err) {})
        }

        $('#Policypost').on('hidden.bs.modal', function() {
            $scope.policyInfo.content = ""
            $('#poimageupload').fileinput('destroy');

        })


        var changeid = ""
        var reviewid = ""

        //更换专员
        $scope.changeAgent = function(patId) {
            changeid = patId
            Policy.getAgentList({
                token: Storage.get('TOKEN')
            }).then(function(data) {
                console.log(data)
                $scope.tableagent = new NgTableParams({
                    count: 10000
                }, {
                    // counts: [],
                    dataset: data.data
                })

            }, function(err) {})
            $('#change_agent').modal('show')
        }
        $scope.confirmagent = function(Id, name) {
            $scope.newflag = true
            agentid = Id
            $scope.name = name
        }
        $scope.confirmreason = function() {
            console.log($scope.reason)
            if ($scope.reason == "") {
                $('#noreason').modal('show')
                $timeout(function() {
                    $('#noreason').modal('hide')
                }, 1000)
            } else {
                changeInfo = {
                    patientId: changeid,
                    insuranceAId: agentid,
                    reason: $scope.reason,
                    token: Storage.get('TOKEN')
                }
                console.log(changeInfo)
                Policy.setinsuranceA(changeInfo).then(function(data) {
                    if (data.code == 0) {
                        console.log(data)
                        $('#changeSuccess').modal('show')
                        $timeout(function() {
                            $('#changeSuccess').modal('hide')
                            $('#change_agent').modal('hide')

                        }, 1000)
                        var tempuserlist = {}
                        tempuserlist.status = 9
                        getLists(tempuserlist);
                    } else {
                        $('#changeFail').modal('show')
                        $timeout(function() {
                            $('#changeFail').modal('hide')
                        }, 1000)
                    }
                }, function(err) {})
            }
        }

        //保单审核
        $('.datetimepicker').datetimepicker({
            language: 'zh-CN',
            format: 'yyyy-mm-dd',
            weekStart: 1,
            todayBtn: 1,
            autoclose: 1,
            todayHighlight: 1,
            startView: 2,
            minView: 2,
            forceParse: 0
        })

        $scope.review = function(rid) {
            $('#review_policy').modal('show')
            reviewid = rid
            getpolicyInfo = {
                patientId: rid,
                token: Storage.get('TOKEN')
            }
            Policy.getPolicy(getpolicyInfo).then(function(data) {
                $scope.review.content = data.data.content
                if (data.data.photos.length == 0) {
                    $scope.review.ifpicexist = false
                    $scope.review.picreview = "该保单暂无图片"
                } else {
                    for (i = 0; i < data.data.photos.length; i++) {
                        $scope.review.ifpicexist = true
                        $scope.review.picreview = "保单图片:"
                        $scope.review.pic = data.data.photos[i]
                    }
                }
            }, function(err) {})
        }
        $scope.passreview = function() {
            $scope.pass = true
            $scope.reject = false
        }
        $scope.passpat = function() {
            var starttime = $scope.starttime
            var endtime = $scope.endtime
            console.log(starttime)
            console.log(endtime)
            if (($scope.starttime == undefined) || ($scope.endtime == undefined) || ($scope.starttime.match(/^(\d{1,4})(-|\/)(\d{1,2})\2(\d{1,2})$/) == null) || ($scope.endtime.match(/^(\d{1,4})(-|\/)(\d{1,2})\2(\d{1,2})$/) == null)) {
                $('#inputerror').modal('show')
                $timeout(function() {
                    $('#inputerror').modal('hide')
                }, 1000)
            } else {
                var passInfo = {
                    patientId: reviewid,
                    reviewResult: "consent",
                    startTime: starttime,
                    endTime: endtime,
                    token: Storage.get('TOKEN')
                }
                Policy.reviewPolicy(passInfo).then(function(data) {
                    if (data.code == 0) {
                        $('#reviewend').modal('show')
                        $timeout(function() {
                            $('#reviewend').modal('hide')
                            $('#review_policy').modal('hide')
                        }, 1000)
                        var tempuserlist = {}
                        tempuserlist.status = 9
                        getLists(tempuserlist);
                    } else {
                        $('#reviewFail').modal('show')
                        $timeout(function() {
                            $('#reviewFail').modal('hide')
                        }, 1000)
                    }
                }, function(err) {})
            }
        }
        $scope.rejectreview = function() {
            $scope.reject = true
            $scope.pass = false
        }
        $scope.rejectpat = function() {
            var rejectreason = $scope.rejectreason
            var rejectInfo = {
                patientId: reviewid,
                reviewResult: "reject",
                rejectReason: rejectreason,
                token: Storage.get('TOKEN')
            }
            Policy.reviewPolicy(rejectInfo).then(function(data) {
                if (data.code == 0) {

                    $('#reviewend').modal('show')
                    $timeout(function() {
                        $('#reviewend').modal('hide')
                        $('#review_policy').modal('hide')
                    }, 1000)
                    var tempuserlist = {}
                    tempuserlist.status = 9
                    getLists(tempuserlist);
                } else {
                    $('#reviewFail').modal('show')
                    $timeout(function() {
                        $('#reviewFail').modal('hide')
                    }, 1000)
                }
            }, function(err) {})
        }
        $scope.modal_close = function(target) {
            $(target).modal('hide')
        }

        $('#change_agent').on('hidden.bs.modal', function() {
            $scope.reason = ""
            $scope.newflag = false
        })

        $('#review_policy').on('hidden.bs.modal', function() {
            $scope.rejectreason = ""
            $scope.pass = false
            $scope.reject = false
        })

        $(document.body).addClass("modal-open");

    }])

    // 主页
    .controller('homepageCtrl', ['$scope', '$state', 'Storage', '$timeout', function($scope, $state, Storage, $timeout) {
        $scope.UserName = Storage.get('UName')
        $scope.myIndex = Storage.get('Tab')
        console.log($scope.myIndex)
        var tempuserrole = Storage.get('ROLE')
        var roles = new Array(); //定义一数组 
        roles = tempuserrole.split(","); //字符分割 
        console.log(roles)
        // 角色字符串处理
        for (var i = 0; i <= roles.length; i++) {
            type = roles[i]
            switch (type) {
                case 'Leader':
                    roles[i] = '地区负责人'
                    break
                case 'master':
                    roles[i] = '科主任'
                    break
                case 'doctor':
                    roles[i] = '普通医生'
                    break
                case 'patient':
                    roles[i] = '患者'
                    break
                case 'nurse':
                    roles[i] = '护士'
                    break
                case 'insuranceA':
                    roles[i] = '沟通人员'
                    break
                case 'insuranceC':
                    roles[i] = '保险主管'
                    break
                case 'insuranceR':
                    roles[i] = '录入人员'
                    break
                case 'health':
                    roles[i] = '健康专员'
                    break
                case 'admin':
                    roles[i] = '管理员'
                    break
            }
        }
        $scope.UserRole = roles
        $scope.LastLoginTime = Storage.get('LASTLOGIN')

        if (tempuserrole.indexOf("admin") != -1) {
            $scope.flagdoctor = true
            $scope.flaguser = true
            $scope.flagdistrdp = true
            $scope.flaghealth = true
            $scope.flagdata = true
            $scope.flaginsu = true
        } else if (tempuserrole.indexOf("health") != -1) {
            $scope.flagdoctor = false
            $scope.flaguser = false
            $scope.flagdistrdp = false
            $scope.flaghealth = true
            $scope.flagdata = false
            $scope.flaginsu = false
        }


        $scope.tounchecked = function() {
            $state.go('main.checkornot.unchecked')
        }
        $scope.touser = function() {
            $state.go('main.usermanage.allUsers')
        }
        $scope.todistrdep = function() {
            $state.go('main.distrdepmanage.districts')
        }
        $scope.tounentered = function() {
            $state.go('main.enterornot.unentered')
        }
        $scope.todata = function() {
            $state.go('main.datamanage.region')
        }
        $scope.toinsurance = function() {
            $state.go('main.insumanage')
        }
        //注销
        $scope.ifOut = function() {
            $state.go('login')
        }
    }])