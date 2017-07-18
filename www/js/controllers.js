angular.module('controllers',['ngResource','services'])

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

.controller('CheckOrNotCtrl', ['$scope', '$state', 'Review', 'Storage', '$timeout', 'NgTableParams', function ($scope, $state, Review, Storage, $timeout, NgTableParams) {
  $scope.flag = 0;
  $scope.tochecked = function () {
    $state.go('main.checkornot.checked');
    $scope.flag = 1;
  }
  $scope.tounchecked = function () {
    $state.go('main.checkornot.unchecked');
    $scope.flag = 0;
  }
}])
// 未审核-LZN
.controller('UncheckedCtrl', ['$scope', '$state', 'Review', 'Alluser', 'Storage', '$timeout', 'NgTableParams', '$uibModal', function ($scope, $state, Review, Alluser, Storage, $timeout, NgTableParams, $uibModal) {
  
  $scope.review = {
    "reviewStatus":0,
    "limit":15,
    "skip":0,
    "token":"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI1OTIyZWJlNWI5NGRlMTM5Mjg1NzQ5ZjciLCJ1c2VySWQiOiJVMjAxNzA1MTEwMDAxIiwicm9sZSI6ImFkbWluIiwiZXhwIjoxNDk5ODY0NDQ4Nzk3LCJpYXQiOjE0OTk4NjA4NDh9.PUG7L5RqBTuaLuZUc_vbrHd6KvDz6uIS07_lQLJWJkA"
  }
  $scope.doctorinfos={};
  Review.GetReviewInfo($scope.review).then(
    function (data) {
      $scope.doctorinfos = data.results;
      console.log($scope.doctorinfos);
      for(var i = 0;i < $scope.doctorinfos.length;i++) {
        if($scope.doctorinfos[i].creationTime != null) {
          var tmp = Date.parse($scope.doctorinfos[i].creationTime);
          var stdate = new Date(tmp);
          $scope.doctorinfos[i].creationTime = stdate.getFullYear() + '-' + (stdate.getMonth() + 1) + '-' + stdate.getDate();
        }   
      }
      
      $scope.tableParams = new NgTableParams({
                count:15
            },
            {   counts:[],
                dataset:$scope.doctorinfos
            });
    }, function (e) {

    });
  $scope.count = '';
  var count = {
    "reviewStatus":0,
    "token":"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI1OTIyZWJlNWI5NGRlMTM5Mjg1NzQ5ZjciLCJ1c2VySWQiOiJVMjAxNzA1MTEwMDAxIiwicm9sZSI6ImFkbWluIiwiZXhwIjoxNDk5ODY0NDQ4Nzk3LCJpYXQiOjE0OTk4NjA4NDh9.PUG7L5RqBTuaLuZUc_vbrHd6KvDz6uIS07_lQLJWJkA"
  }
  Review.GetCount(count).then(
    function (data) {
      $scope.count = data.results;
    }, function (e) {

    }); 
  $scope.getdocId = function (index) {
    Storage.set('docId',$scope.doctorinfos[index].userId);
    Storage.set('reviewstatus',0);
  }
  $scope.accept = function (index) {
    var postreview = {
      "doctorId":$scope.doctorinfos[index].userId,
      "reviewStatus":1,
      "token":"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI1OTIyZWJlNWI5NGRlMTM5Mjg1NzQ5ZjciLCJ1c2VySWQiOiJVMjAxNzA1MTEwMDAxIiwicm9sZSI6ImFkbWluIiwiZXhwIjoxNDk5ODY0NDQ4Nzk3LCJpYXQiOjE0OTk4NjA4NDh9.PUG7L5RqBTuaLuZUc_vbrHd6KvDz6uIS07_lQLJWJkA"
    }
    Review.PostReviewInfo(postreview).then(
      function (data) {
        console.log(data.results);
        if(data.results == "审核信息保存成功") {
            $('#accepted').modal('show');
            $timeout(function() {
              $('#accepted').modal('hide');
            },1000);
            $('#accepted').on('hidden.bs.modal', function () {
              var sms = {
                  "mobile":"18626860001",
                  "smsType":3,
                  "token":"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI1OTEyZTllYmRjODNmNmE4YjdkY2JkZTgiLCJ1c2VySWQiOiJVMjAxNzAzMTQyMDE4Iiwicm9sZSI6InBhdGllbnQiLCJleHBpcmVBZnRlciI6MTQ5NzQwNzI2MzgzMywiaWF0IjoxNDk3NDA3MjYzfQ.5UITzg6NaHcIIEQESCLLB7mx_suISw9Bj6K1OBaiaDk",
              }
              Alluser.sms(sms).then(
                function (data) {
                  Review.GetReviewInfo($scope.review).then(
                  function (data) {
                    $scope.doctorinfos = data.results;
                    console.log($scope.doctorinfos);
                    $scope.tableParams = new NgTableParams({
                        count:15
                    },
                    {   counts:[],
                        dataset:$scope.doctorinfos
                    });
                  }, function (e) {

                  }); 
                }, function (e) {

                })
            })
        } 
      }, function (e) {

      })
  }
  $scope.docId = '';
  $scope.getId = function (index) {
    $scope.docId = $scope.doctorinfos[index].userId
  }
  $scope.RejectReason={};
  $scope.reject = function () {
    console.log($scope.RejectReason.reason);
     var postreview = {
      "doctorId":$scope.docId,
      "reviewStatus":2,
      "reviewContent":$scope.RejectReason.reason,
      "token":"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI1OTIyZWJlNWI5NGRlMTM5Mjg1NzQ5ZjciLCJ1c2VySWQiOiJVMjAxNzA1MTEwMDAxIiwicm9sZSI6ImFkbWluIiwiZXhwIjoxNDk5ODY0NDQ4Nzk3LCJpYXQiOjE0OTk4NjA4NDh9.PUG7L5RqBTuaLuZUc_vbrHd6KvDz6uIS07_lQLJWJkA"
    }
    console.log(postreview);
    Review.PostReviewInfo(postreview).then(
      function (data) {

        console.log(data.results);
        if(data.results == "审核信息保存成功") {
          $('#reject').modal('hide');
          $('#reject').on('hidden.bs.modal', function () {
            $('#rejected').modal('show');
            $timeout(function() {
              $('#rejected').modal('hide');
            },1000);
            $('#rejected').on('hidden.bs.modal', function () {
              var sms = {
                  "mobile":"18626860001",
                  "smsType":4,
                  "token":"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI1OTEyZTllYmRjODNmNmE4YjdkY2JkZTgiLCJ1c2VySWQiOiJVMjAxNzAzMTQyMDE4Iiwicm9sZSI6InBhdGllbnQiLCJleHBpcmVBZnRlciI6MTQ5NzQwNzI2MzgzMywiaWF0IjoxNDk3NDA3MjYzfQ.5UITzg6NaHcIIEQESCLLB7mx_suISw9Bj6K1OBaiaDk",
                  "reason":$scope.RejectReason.reason
              }
                Alluser.sms(sms).then(
                  function (data) {
                    console.log(data.results);
                    $scope.RejectReason={};
                    Review.GetReviewInfo($scope.review).then(
                    function (data) {
                      $scope.doctorinfos = data.results;
                      console.log($scope.doctorinfos);
                      $scope.tableParams = new NgTableParams({
                          count:15
                      },
                      {   counts:[],
                          dataset:$scope.doctorinfos
                      });
                    }, function (e) {

                    }); 
                  }, function (e) {

                  })
              
              })
              
          })  
        } 
      }, function (e) {

      })
  }
  // $scope.reject = function () {
  //  var modalInstance = $uibModal.open({
  //    animation:true,
  //    ariaLabelledBy:'modal-title',
  //    ariaDescribedBy:'modal-body',
  //    templateUrl:'templates/main/checkornot/reject.html',
  //    controller:'ModalInstanceCtrl',
  //    resolve:{
  //      RejectReason:function () {
  //        return $scope.RejectReason;
  //      }
  //    }
  //  });
  // }
   $scope.lastpage = function () {
    if($scope.review.skip - $scope.review.limit >= 0) {
      $scope.review.skip -= $scope.review.limit;
      Review.GetReviewInfo($scope.review).then(
      function (data) {
        $scope.doctorinfos = data.results;
        console.log($scope.doctorinfos);
        console.log(data.nexturl);
        $scope.tableParams = new NgTableParams({
                  count:15
              },
              {   counts:[],
                  dataset:$scope.doctorinfos
              });
      }, function (e) {

      });
    }     
  }
  $scope.nextpage = function () {
    $scope.review.skip += $scope.review.limit;
    Review.GetReviewInfo($scope.review).then(
    function (data) {
      $scope.doctorinfos = data.results;
      console.log($scope.doctorinfos);
      console.log(data.nexturl);
      $scope.tableParams = new NgTableParams({
                count:15
            },
            {   counts:[],
                dataset:$scope.doctorinfos
            });
    }, function (e) {

    });
  }
  $scope.search = function () {
    $scope.review = {
      "reviewStatus":0,
      "limit":15,
      "skip":0,
      "name":$scope.doctorname,
      "token":"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI1OTIyZWJlNWI5NGRlMTM5Mjg1NzQ5ZjciLCJ1c2VySWQiOiJVMjAxNzA1MTEwMDAxIiwicm9sZSI6ImFkbWluIiwiZXhwIjoxNDk5ODY0NDQ4Nzk3LCJpYXQiOjE0OTk4NjA4NDh9.PUG7L5RqBTuaLuZUc_vbrHd6KvDz6uIS07_lQLJWJkA"
    }
    Review.GetReviewInfo($scope.review).then(
      function (data) {
        $scope.doctorinfos = data.results;
        // console.log($scope.doctorname);
        // console.log($scope.review);
        // console.log($scope.doctorinfos);
        for(var i = 0;i < $scope.doctorinfos.length;i++) {
        if($scope.doctorinfos[i].creationTime != null) {
          var tmp = Date.parse($scope.doctorinfos[i].creationTime);
          var stdate = new Date(tmp);
          $scope.doctorinfos[i].creationTime = stdate.getFullYear() + '-' + (stdate.getMonth() + 1) + '-' + stdate.getDate();
        }   
      }
        $scope.tableParams = new NgTableParams({
                count:15
            },
            {   counts:[],
                dataset:$scope.doctorinfos
            });
      }, function (e) {

      })
  }
}])
// 审核内容-拒绝原因
// .controller('ModalInstanceCtrl',['$scope', '$uibModalInstance', function ($scope, $uibModalInstance) {
//  $scope.RejectReason = '';
//  $scope.ok = function () {
//    console.log($scope.RejectReason);
//    $uibModalInstance.close();
    
//  };
//  $scope.cancel = function () {
//    $uibModalInstance.dismiss();
//  };

// }])
// 查看医生资质证书-LZN
.controller('DoctorLicenseCtrl',['$scope', '$state', 'Review', 'Alluser', 'Storage', '$timeout', function ($scope, $state, Review, Alluser, Storage, $timeout) {
  var id = Storage.get('docId');
  $scope.status = Storage.get('reviewstatus');
  console.log(id);
  console.log($scope.status);
  $scope.doctorinfos = {};
  $scope.review = {};
  var params = {
    "doctorId":id,
    
    "token":"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI1OTIyZWJlNWI5NGRlMTM5Mjg1NzQ5ZjciLCJ1c2VySWQiOiJVMjAxNzA1MTEwMDAxIiwicm9sZSI6ImFkbWluIiwiZXhwIjoxNDk5ODY0NDQ4Nzk3LCJpYXQiOjE0OTk4NjA4NDh9.PUG7L5RqBTuaLuZUc_vbrHd6KvDz6uIS07_lQLJWJkA"
  }
  Review.GetCertificate(params).then(
    function (data) {
      $scope.doctorinfos = data.results;
      if($scope.doctorinfos.province == $scope.doctorinfos.city) $scope.doctorinfos.province = '';
      console.log($scope.doctorinfos);
      var review = {
        "reviewStatus":$scope.status,
        "limit":15,
        "skip":0,
        "name":$scope.doctorinfos.name,
        "token":"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI1OTIyZWJlNWI5NGRlMTM5Mjg1NzQ5ZjciLCJ1c2VySWQiOiJVMjAxNzA1MTEwMDAxIiwicm9sZSI6ImFkbWluIiwiZXhwIjoxNDk5ODY0NDQ4Nzk3LCJpYXQiOjE0OTk4NjA4NDh9.PUG7L5RqBTuaLuZUc_vbrHd6KvDz6uIS07_lQLJWJkA"
      }
      Review.GetReviewInfo(review).then(
        function (data) {
          $scope.review.reviewStatus = data.results[0].reviewStatus;
          $scope.review.adminId = data.results[0].adminId;
          $scope.review.reviewDate = data.results[0].reviewDate;
          $scope.review.reviewContent = data.results[0].reviewContent;
          if($scope.review.reviewStatus == 0) $scope.review.reviewStatus = "未审核";
          if($scope.review.reviewStatus == 1) $scope.review.reviewStatus = "已通过";
          if($scope.review.reviewStatus == 2) $scope.review.reviewStatus = "已拒绝";
          if($scope.review.reviewDate != null) {
          var tmp = Date.parse($scope.review.reviewDate);
          var stdate = new Date(tmp);
          $scope.review.reviewDate = stdate.getFullYear() + '-' + (stdate.getMonth() + 1) + '-' + stdate.getDate();
        }   
          console.log($scope.review);
        }, function (e) {

        });
    }, function (e) {

    });
  $scope.accept = function () {
    var postreview = {
      "doctorId":Storage.get('docId'),
      "reviewStatus":1,
      "token":"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI1OTIyZWJlNWI5NGRlMTM5Mjg1NzQ5ZjciLCJ1c2VySWQiOiJVMjAxNzA1MTEwMDAxIiwicm9sZSI6ImFkbWluIiwiZXhwIjoxNDk5ODY0NDQ4Nzk3LCJpYXQiOjE0OTk4NjA4NDh9.PUG7L5RqBTuaLuZUc_vbrHd6KvDz6uIS07_lQLJWJkA"
    }
    Review.PostReviewInfo(postreview).then(
      function (data) {
        console.log(data.results);
        if(data.results == "审核信息保存成功") {
          $('#accepted').modal('show');
          $timeout(function() {
            $('#accepted').modal('hide');
          },1000);
          $('#accepted').on('hidden.bs.modal', function () {
            var sms = {
              "mobile":"18626860001",
              "smsType":3,
              "token":"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI1OTEyZTllYmRjODNmNmE4YjdkY2JkZTgiLCJ1c2VySWQiOiJVMjAxNzAzMTQyMDE4Iiwicm9sZSI6InBhdGllbnQiLCJleHBpcmVBZnRlciI6MTQ5NzQwNzI2MzgzMywiaWF0IjoxNDk3NDA3MjYzfQ.5UITzg6NaHcIIEQESCLLB7mx_suISw9Bj6K1OBaiaDk",
            }
            Alluser.sms(sms).then(
              function (data) {
                $state.go('main.checkornot.unchecked');
              }, function (e) {
                
              })
            
          })
        }
      }, function (e) {

      })
  }
  $scope.RejectReason = {};
  $scope.reject = function () {
    console.log($scope.RejectReason.reason);
     var postreview = {
      "doctorId":Storage.get('docId'),
      "reviewStatus":2,
      "reviewContent":$scope.RejectReason.reason,
      "token":"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI1OTIyZWJlNWI5NGRlMTM5Mjg1NzQ5ZjciLCJ1c2VySWQiOiJVMjAxNzA1MTEwMDAxIiwicm9sZSI6ImFkbWluIiwiZXhwIjoxNDk5ODY0NDQ4Nzk3LCJpYXQiOjE0OTk4NjA4NDh9.PUG7L5RqBTuaLuZUc_vbrHd6KvDz6uIS07_lQLJWJkA"
    }
    console.log(postreview);
    Review.PostReviewInfo(postreview).then(
      function (data) {

        console.log(data.results);
        if(data.results == "审核信息保存成功") {
          $('#reject').modal('hide');
          $('#reject').on('hidden.bs.modal', function () {
            $('#rejected').modal('show');
            $timeout(function() {
              $('#rejected').modal('hide');
            },1000);
          })
          $('#rejected').on('hidden.bs.modal', function () {
            var sms = {
                  "mobile":"18626860001",
                  "smsType":4,
                  "token":"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI1OTEyZTllYmRjODNmNmE4YjdkY2JkZTgiLCJ1c2VySWQiOiJVMjAxNzAzMTQyMDE4Iiwicm9sZSI6InBhdGllbnQiLCJleHBpcmVBZnRlciI6MTQ5NzQwNzI2MzgzMywiaWF0IjoxNDk3NDA3MjYzfQ.5UITzg6NaHcIIEQESCLLB7mx_suISw9Bj6K1OBaiaDk",
                  "reason":$scope.RejectReason.reason
            }
            Alluser.sms(sms).then(
              function (data) {
                console.log(data.results);
                $scope.RejectReason={};
                $state.go('main.checkornot.unchecked');
              }, function (e) {
              })
            
          })
          // 拒绝提示
        } 
      }, function (e) {

      })
  }
}])
// 已审核-LZN
.controller('CheckedCtrl', ['$scope', '$state', 'Review', 'Storage', 'NgTableParams', '$timeout', function ($scope, $state, Review, Storage, NgTableParams, $timeout) {
  $scope.review = {
    "reviewStatus":1,
    "limit":15,
    "skip":0,
    "token":"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI1OTIyZWJlNWI5NGRlMTM5Mjg1NzQ5ZjciLCJ1c2VySWQiOiJVMjAxNzA1MTEwMDAxIiwicm9sZSI6ImFkbWluIiwiZXhwIjoxNDk5ODY0NDQ4Nzk3LCJpYXQiOjE0OTk4NjA4NDh9.PUG7L5RqBTuaLuZUc_vbrHd6KvDz6uIS07_lQLJWJkA"
  }
  $scope.doctorinfos={};
  Review.GetReviewInfo($scope.review).then(
    function (data) {
      $scope.doctorinfos = data.results;
      for(var i = 0;i < $scope.doctorinfos.length;i++) {
        if($scope.doctorinfos[i].reviewStatus == 1) $scope.doctorinfos[i].reviewStatus = "已通过";
        if($scope.doctorinfos[i].reviewStatus == 2) $scope.doctorinfos[i].reviewStatus = "已拒绝";
        if($scope.doctorinfos[i].reviewDate != null) {
          var tmp = Date.parse($scope.doctorinfos[i].reviewDate);
          var stdate = new Date(tmp);
          $scope.doctorinfos[i].reviewDate = stdate.getFullYear() + '-' + (stdate.getMonth() + 1) + '-' + stdate.getDate();
        }
        if($scope.doctorinfos[i].creationTime != null) {
            var tmp = Date.parse($scope.doctorinfos[i].creationTime);
            var stdate = new Date(tmp);
            $scope.doctorinfos[i].creationTime = stdate.getFullYear() + '-' + (stdate.getMonth() + 1) + '-' + stdate.getDate();
        }      
      }
      console.log($scope.doctorinfos);
      console.log(data.nexturl);
      $scope.tableParams = new NgTableParams({
                count:15
            },
            {   counts:[],
                dataset:$scope.doctorinfos
            });
    }, function (e) {
    });
  $scope.count = '';
  var count = {
    "reviewStatus":1,
    "token":"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI1OTIyZWJlNWI5NGRlMTM5Mjg1NzQ5ZjciLCJ1c2VySWQiOiJVMjAxNzA1MTEwMDAxIiwicm9sZSI6ImFkbWluIiwiZXhwIjoxNDk5ODY0NDQ4Nzk3LCJpYXQiOjE0OTk4NjA4NDh9.PUG7L5RqBTuaLuZUc_vbrHd6KvDz6uIS07_lQLJWJkA"
  }
  Review.GetCount(count).then(
    function (data) {
      $scope.count = data.results;
    }, function (e) {
    }); 
  $scope.lastpage = function () {
    if($scope.review.skip - $scope.review.limit >= 0) {
      $scope.review.skip -= $scope.review.limit;
      Review.GetReviewInfo($scope.review).then(
      function (data) {
        $scope.doctorinfos = data.results;
        for(var i = 0;i < $scope.doctorinfos.length;i++) {
          if($scope.doctorinfos[i].reviewStatus == 1) $scope.doctorinfos[i].reviewStatus = "已通过";
          if($scope.doctorinfos[i].reviewStatus == 2) $scope.doctorinfos[i].reviewStatus = "已拒绝";
        }
        console.log($scope.doctorinfos);
        console.log(data.nexturl);
        $scope.tableParams = new NgTableParams({
                  count:15
              },
              {   counts:[],
                  dataset:$scope.doctorinfos
              });
      }, function (e) {

      });
    }     
  }
  $scope.nextpage = function () {
    $scope.review.skip += $scope.review.limit;
    Review.GetReviewInfo($scope.review).then(
    function (data) {
      $scope.doctorinfos = data.results;
      for(var i = 0;i < $scope.doctorinfos.length;i++) {
        if($scope.doctorinfos[i].reviewStatus == 1) $scope.doctorinfos[i].reviewStatus = "已通过";
        if($scope.doctorinfos[i].reviewStatus == 2) $scope.doctorinfos[i].reviewStatus = "已拒绝";
      }
      console.log($scope.doctorinfos);
      console.log(data.nexturl);
      $scope.tableParams = new NgTableParams({
                count:15
            },
            {   counts:[],
                dataset:$scope.doctorinfos
            });
    }, function (e) {

    });
  }
  $scope.getdocId = function (index) {
    Storage.set('docId',$scope.doctorinfos[index].userId);
    Storage.set('reviewstatus',1);
  }
  
  $scope.search = function () {
    $scope.review = {
      "reviewStatus":1,
      "limit":15,
      "skip":0,
      "name":$scope.doctorname,
      "token":"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI1OTIyZWJlNWI5NGRlMTM5Mjg1NzQ5ZjciLCJ1c2VySWQiOiJVMjAxNzA1MTEwMDAxIiwicm9sZSI6ImFkbWluIiwiZXhwIjoxNDk5ODY0NDQ4Nzk3LCJpYXQiOjE0OTk4NjA4NDh9.PUG7L5RqBTuaLuZUc_vbrHd6KvDz6uIS07_lQLJWJkA"
    }
    Review.GetReviewInfo($scope.review).then(
      function (data) {
        $scope.doctorinfos = data.results;
        for(var i = 0;i < $scope.doctorinfos.length;i++) {
          if($scope.doctorinfos[i].reviewStatus == 1) $scope.doctorinfos[i].reviewStatus = "已通过";
          if($scope.doctorinfos[i].reviewStatus == 2) $scope.doctorinfos[i].reviewStatus = "已拒绝";
          if($scope.doctorinfos[i].reviewDate != null) {
            var tmp = Date.parse($scope.doctorinfos[i].reviewDate);
            var stdate = new Date(tmp);
            $scope.doctorinfos[i].reviewDate = stdate.getFullYear() + '-' + (stdate.getMonth() + 1) + '-' + stdate.getDate();
          }
          if($scope.doctorinfos[i].creationTime != null) {
            var tmp = Date.parse($scope.doctorinfos[i].creationTime);
            var stdate = new Date(tmp);
            $scope.doctorinfos[i].creationTime = stdate.getFullYear() + '-' + (stdate.getMonth() + 1) + '-' + stdate.getDate();
          }   
        }
        console.log($scope.doctorname);
        console.log($scope.review);
        console.log($scope.doctorinfos);
        $scope.tableParams = new NgTableParams({
                count:15
            },
            {   counts:[],
                dataset:$scope.doctorinfos
            });
      }, function (e) {

      })
  }
}])

.controller('EnterOrNotCtrl', ['$scope', '$state', 'Storage', '$timeout', function ($scope, $state, Storage, $timeout) {
  $scope.toentered = function () {
    $state.go('main.enterornot.entered');
  }
  $scope.tounentered = function () {
    $state.go('main.enterornot.unentered');
  }
}])
// 未录入-LZN
.controller('UnenteredCtrl', ['$scope', '$state', 'Storage', 'LabtestImport', 'NgTableParams', '$timeout', function ($scope, $state, Storage, LabtestImport, NgTableParams, $timeout) {
  $scope.labtestinfos={};
  $scope.lab = {
    "labtestImportStatus":0,
    "limit":10,
    "skip":0,
    "token":"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI1OTIyZWJlNWI5NGRlMTM5Mjg1NzQ5ZjciLCJ1c2VySWQiOiJVMjAxNzA1MTEwMDAxIiwicm9sZSI6ImhlYWx0aCIsImV4cCI6MTQ5OTY4Nzg2OTI5NSwiaWF0IjoxNDk5Njg0MjY5fQ.p87yOwwsumsi-G5uprWamdSH8_Ij1NgY3XAi1yFdv0U"
  }
  LabtestImport.GetLabtestInfo($scope.lab).then(
    function (data) {
      $scope.labtestinfos = data.results;
      for(var i = 0;i < $scope.labtestinfos.length;i++) {
        if($scope.labtestinfos[i].latestUploadTime != null) {
            var tmp = Date.parse($scope.labtestinfos[i].latestUploadTime);
            var stdate = new Date(tmp);
            $scope.labtestinfos[i].latestUploadTime = stdate.getFullYear() + '-' + (stdate.getMonth() + 1) + '-' + stdate.getDate();
        }      
      }
       $scope.tableParams = new NgTableParams({
                count:15
            },
            {   counts:[],
                dataset:$scope.labtestinfos
            });
  }, function (e) {

  })
  $scope.count = '';
  var count = {
    "labtestImportStatus":0,
    "token":"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI1OTIyZWJlNWI5NGRlMTM5Mjg1NzQ5ZjciLCJ1c2VySWQiOiJVMjAxNzA1MTEwMDAxIiwicm9sZSI6ImhlYWx0aCIsImV4cCI6MTQ5OTY4Nzg2OTI5NSwiaWF0IjoxNDk5Njg0MjY5fQ.p87yOwwsumsi-G5uprWamdSH8_Ij1NgY3XAi1yFdv0U"
  }
  LabtestImport.GetCount(count).then(
    function (data) {
      $scope.count = data.results;
    }, function (e) {

    })
  $scope.getpatId = function (index) {
    Storage.set('patId',$scope.labtestinfos[index].userId);
    Storage.set('patName',$scope.labtestinfos[index].name);
  }
  $scope.lastpage = function () {
    if($scope.lab.skip - $scope.lab.limit >= 0) {
      $scope.lab.skip -= $scope.lab.limit;
      LabtestImport.GetLabtestInfo($scope.lab).then(
      function (data) {
        $scope.labtestinfos = data.results;
        console.log($scope.labtestinfos);
        console.log(data.nexturl);
        $scope.tableParams = new NgTableParams({
                  count:15
              },
              {   counts:[],
                  dataset:$scope.labtestinfos
              });
      }, function (e) {

      });
    }     
  }
  $scope.nextpage = function () {
    $scope.lab.skip += $scope.lab.limit;
    LabtestImport.GetLabtestInfo($scope.lab).then(
    function (data) {
      $scope.labtestinfos = data.results;
      console.log($scope.labtestinfos);
      console.log(data.nexturl);
      $scope.tableParams = new NgTableParams({
                count:15
            },
            {   counts:[],
                dataset:$scope.labtestinfos
            });
    }, function (e) {

    });
  }
  $scope.search = function () {
    $scope.lab = {
     "labtestImportStatus":0,
      "limit":10,
      "skip":0,
      "name":$scope.patientname,
      "token":"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI1OTIyZWJlNWI5NGRlMTM5Mjg1NzQ5ZjciLCJ1c2VySWQiOiJVMjAxNzA1MTEwMDAxIiwicm9sZSI6ImhlYWx0aCIsImV4cCI6MTQ5OTY4Nzg2OTI5NSwiaWF0IjoxNDk5Njg0MjY5fQ.p87yOwwsumsi-G5uprWamdSH8_Ij1NgY3XAi1yFdv0U"  
    }
    LabtestImport.GetLabtestInfo($scope.lab).then(
      function (data) {
        $scope.labtestinfos = data.results;
        if($scope.labtestinfos[0].latestUploadTime != null) {
          var tmp = Date.parse($scope.labtestinfos[0].latestUploadTime);
          var stdate = new Date(tmp);
          $scope.labtestinfos[0].latestUploadTime = stdate.getFullYear() + '-' + (stdate.getMonth() + 1) + '-' + stdate.getDate();
        }
        console.log($scope.patientname);
        console.log($scope.lab);
        console.log($scope.labtestinfos);
        $scope.tableParams = new NgTableParams({
                count:15
            },
            {   counts:[],
                dataset:$scope.labtestinfos
            });
      }, function (e) {

      })
  }
}])
// 已录入-LZN
.controller('EnteredCtrl', ['$scope', '$state', 'Storage', 'LabtestImport', 'NgTableParams', '$timeout', function ($scope, $state, Storage, LabtestImport, NgTableParams, $timeout) {
  $scope.labtestinfos={};
  $scope.lab = {
    "labtestImportStatus":1,
    "limit":10,
    "skip":0,
    "token":"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI1OTIyZWJlNWI5NGRlMTM5Mjg1NzQ5ZjciLCJ1c2VySWQiOiJVMjAxNzA1MTEwMDAxIiwicm9sZSI6ImhlYWx0aCIsImV4cCI6MTQ5OTY4Nzg2OTI5NSwiaWF0IjoxNDk5Njg0MjY5fQ.p87yOwwsumsi-G5uprWamdSH8_Ij1NgY3XAi1yFdv0U"
  }
  LabtestImport.GetLabtestInfo($scope.lab).then(
    function (data) {
      $scope.labtestinfos = data.results;
       for(var i = 0;i < $scope.labtestinfos.length;i++) {
        if($scope.labtestinfos[i].latestImportDate != null) {
          var tmp = Date.parse($scope.labtestinfos[i].latestImportDate);
          var stdate = new Date(tmp);
          $scope.labtestinfos[i].latestImportDate = stdate.getFullYear() + '-' + (stdate.getMonth() + 1) + '-' + stdate.getDate();
        }
        if($scope.labtestinfos[i].latestUploadTime != null) {
            var tmp = Date.parse($scope.labtestinfos[i].latestUploadTime);
            var stdate = new Date(tmp);
            $scope.labtestinfos[i].latestUploadTime = stdate.getFullYear() + '-' + (stdate.getMonth() + 1) + '-' + stdate.getDate();
        }      
      }
       $scope.tableParams = new NgTableParams({
                count:15
            },
            {   counts:[],
                dataset:$scope.labtestinfos
            });
  }, function (e) {

  })
  $scope.count = '';
  var count = {
    "labtestImportStatus":1,
    "token":"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI1OTIyZWJlNWI5NGRlMTM5Mjg1NzQ5ZjciLCJ1c2VySWQiOiJVMjAxNzA1MTEwMDAxIiwicm9sZSI6ImhlYWx0aCIsImV4cCI6MTQ5OTY4Nzg2OTI5NSwiaWF0IjoxNDk5Njg0MjY5fQ.p87yOwwsumsi-G5uprWamdSH8_Ij1NgY3XAi1yFdv0U"
  }
  LabtestImport.GetCount(count).then(
    function (data) {
      $scope.count = data.results;
    }, function (e) {

    })
  $scope.getpatId = function (index) {
    Storage.set('patId',$scope.labtestinfos[index].userId);
    Storage.set('patName',$scope.labtestinfos[index].name);
  }
  $scope.lastpage = function () {
    if($scope.lab.skip - $scope.lab.limit >= 0) {
      $scope.lab.skip -= $scope.lab.limit;
      LabtestImport.GetLabtestInfo($scope.lab).then(
      function (data) {
        $scope.labtestinfos = data.results;
        console.log($scope.labtestinfos);
        console.log(data.nexturl);
        $scope.tableParams = new NgTableParams({
                  count:15
              },
              {   counts:[],
                  dataset:$scope.labtestinfos
              });
      }, function (e) {

      });
    }     
  }
  $scope.nextpage = function () {
    $scope.lab.skip += $scope.lab.limit;
    LabtestImport.GetLabtestInfo($scope.lab).then(
    function (data) {
      $scope.labtestinfos = data.results;
      console.log($scope.labtestinfos);
      console.log(data.nexturl);
      $scope.tableParams = new NgTableParams({
                count:15
            },
            {   counts:[],
                dataset:$scope.labtestinfos
            });
    }, function (e) {

    });
  }
  $scope.search = function () {
    $scope.lab = {
   "labtestImportStatus":1,
    "limit":10,
    "skip":0,
    "name":$scope.patientname,
    "token":"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI1OTIyZWJlNWI5NGRlMTM5Mjg1NzQ5ZjciLCJ1c2VySWQiOiJVMjAxNzA1MTEwMDAxIiwicm9sZSI6ImhlYWx0aCIsImV4cCI6MTQ5OTY4Nzg2OTI5NSwiaWF0IjoxNDk5Njg0MjY5fQ.p87yOwwsumsi-G5uprWamdSH8_Ij1NgY3XAi1yFdv0U"  
  }
    LabtestImport.GetLabtestInfo($scope.lab).then(
      function (data) {
        $scope.labtestinfos = data.results;
        console.log($scope.patientname);
        console.log($scope.lab);
        if($scope.labtestinfos[0].latestImportDate != null) {
          var tmp = Date.parse($scope.labtestinfos[0].latestImportDate);
          var stdate = new Date(tmp);
          $scope.labtestinfos[0].latestImportDate = stdate.getFullYear() + '-' + (stdate.getMonth() + 1) + '-' + stdate.getDate();
        }
        if($scope.labtestinfos[0].latestUploadTime != null) {
          var tmp = Date.parse($scope.labtestinfos[0].latestUploadTime);
          var stdate = new Date(tmp);
          $scope.labtestinfos[0].latestUploadTime = stdate.getFullYear() + '-' + (stdate.getMonth() + 1) + '-' + stdate.getDate();
        }
        $scope.tableParams = new NgTableParams({
                count:15
            },
            {   counts:[],
                dataset:$scope.labtestinfos
            });
      }, function (e) {

      })
  }
}])
// 信息录入-LZN
.controller('LabInfoCtrl',['$scope', '$state', 'Storage', 'LabtestImport', 'NgTableParams', '$uibModal', '$timeout', function ($scope, $state, Storage, LabtestImport, NgTableParams, $uibModal, $timeout) {
  $scope.Lab='';
  $scope.patname = Storage.get('patName');
  $scope.Lab.LabType = {
    options:[
      '血肌酐',
      '尿蛋白',
      '血白蛋白',
      '肾小球滤过率'
    ],
    selected:'血肌酐'
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
  $scope.select={};
  $scope.selecttype = {'options':
  [
    {'option':'血常规', 'disable':true},
    {'option':'血生化', 'disable':true},
    {'option':'单次血糖', 'disable':true},
    {'option':'药物浓度', 'disable':true},
    {'option':'甲状旁腺激素', 'disable':true},
    {'option':'血培养', 'disable':true},
    {'option':'*其他血液检查', 'disable':false},
    {'option':'腹透液常规', 'disable':true},
    {'option':'腹透液生化', 'disable':true},
    {'option':'腹透液培养', 'disable':true},
    {'option':'尿常规', 'disable':true},
    {'option':'尿蛋白定量', 'disable':true},
    {'option':'尿培养', 'disable':true},
    {'option':'*其他尿液检查', 'disable':false},
    {'option':'大便常规', 'disable':true},
    {'option':'*其他化验', 'disable':false}
  ],
  'selected':''
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
      {opened:false},
      {opened:false},
      {opened:false},
      {opened:false}
      ]
    
    function getDayClass(data) {
      var date = data.date,
        mode = data.mode;
      if (mode === 'day') {
          var dayToCheck = new Date(date).setHours(0,0,0,0);
          for (var i = 0; i < $scope.events.length; i++) {
            var currentDay = new Date($scope.events[i].date).setHours(0,0,0,0);
            if (dayToCheck === currentDay) {
                return $scope.events[i].status;
            }
          }
      }
      return '';
    }
    $scope.postBack = [{LabType:{
    options:[
      '血肌酐',
      '尿蛋白',
      '血白蛋白',
      '肾小球滤过率'
    ],
    selected:'血肌酐'
  },LabValue:100,dt:new Date()}];
    $scope.Add = function ($index) {  
      if($scope.postBack.length<4){
        console.log($scope.postBack[$index].dt);
        $scope.postBack.splice($index+1,0,{LabType:{
      options:[
        '血肌酐',
        '尿蛋白',
        '血白蛋白',
        '肾小球滤过率'
      ],
      selected:'血肌酐'
      },LabValue:100,dt:new Date()});
      }     
    }
    $scope.Remove = function ($index) {
      if($scope.postBack.length>1)
      $scope.postBack.splice($index,1);
    }
    //  $scope.myInterval = 5000;
    // $scope.noWrapSlides = false;
    $scope.active = 0;
    $scope.slides = [];
  
    var patient = {
      'patientId':Storage.get('patId'),
      'token':'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI1OTIyZWJlNWI5NGRlMTM5Mjg1NzQ5ZjciLCJ1c2VySWQiOiJVMjAxNzA1MTEwMDAxIiwicm9sZSI6ImhlYWx0aCIsImV4cCI6MTQ5OTY4Nzg2OTI5NSwiaWF0IjoxNDk5Njg0MjY5fQ.p87yOwwsumsi-G5uprWamdSH8_Ij1NgY3XAi1yFdv0U'
    }
    LabtestImport.GetPhotoList(patient).then(
      function (data) {
        $scope.slides=data.results;
        // var test=data.results;
        // $scope.slides = test;
        console.log(patient);
        console.log($scope.slides);
        // console.log($scope.slides[$index]);
        $scope.photoId = '';
        $scope.getphoto = function (index) {
          $scope.photoId = $scope.slides[index].photoId;
          console.log($scope.photoId);
          console.log($scope.phototype);
          $('#selecttype').modal('show');
         
        }
        $scope.skipphoto = function (index) {
          $scope.photoId = $scope.slides[index].photoId;
            console.log($scope.photoId);
            $('#skip').modal('show');
        }
        $scope.gettype = function () {
          if($scope.custype == '') 
            {
              if(typeof($scope.select.selected) != 'undefined') $scope.phototype = $scope.select.selected.option;
              else $scope.phototype = '';
            }
          else $scope.phototype = $scope.custype;
          console.log($scope.select.selected);
          $('#selecttype').modal('hide');
          $('#selecttype').on('hidden.bs.modal', function () {
            $scope.select = {};
            $scope.custype = '';
            console.log($scope.phototype);
          })
        }
      }, function (e) {

      })
    
    LabtestImport.GetPatientLabTest(patient).then(
    function (data) {
      $scope.patientlabtests = data.results;
      for(var i = 0;i < $scope.patientlabtests.length;i++) {
        switch($scope.patientlabtests[i].type) {
          case 'SCr': $scope.patientlabtests[i].type = "血肌酐";break;
          case 'PRO': $scope.patientlabtests[i].type = "尿蛋白";break;
          case 'ALB': $scope.patientlabtests[i].type = "血白蛋白";break;
          case 'GFR': $scope.patientlabtests[i].type = "肾小球滤过率";break;
          default: break;
        }
        if($scope.patientlabtests[i].time != null) {
          var tmp = Date.parse($scope.patientlabtests[i].time);
          var stdate = new Date(tmp);
          $scope.patientlabtests[i].time = stdate.getFullYear() + '-' + (stdate.getMonth() + 1) + '-' + stdate.getDate();
        }
        if($scope.patientlabtests[i].importTime != null) {
            var tmp = Date.parse($scope.patientlabtests[i].importTime);
            var stdate = new Date(tmp);
            $scope.patientlabtests[i].importTime = stdate.getFullYear() + '-' + (stdate.getMonth() + 1) + '-' + stdate.getDate();
        }      
      }
      console.log($scope.patientlabtests);
      $scope.tableParams = new NgTableParams({
                count:15
            },
            {   counts:[],
                dataset:$scope.patientlabtests
            });
    }, function (e) {

    })
    $scope.getlabtestId = function (index) {
      Storage.set('labtestId',$scope.patientlabtests[index].labtestId);
      Storage.set('labtype',$scope.patientlabtests[index].type);
      Storage.set('labvalue',$scope.patientlabtests[index].value);
      Storage.set('labdt',$scope.patientlabtests[index].time);
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
    $scope.checkphoto = function () {
      console.log($scope.photoId);
      console.log($scope.phototype);
      if($scope.photoId != '' && $scope.phototype != '') {
        $('#save').modal('show');
        $('#save').on('hidden.bs.modal', function () {
        $scope.photoId = '';
        $scope.phototype = '';
        })
      }
      else if($scope.photoId == '') $('#selectphoto').modal('show');
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
    $scope.save = function () {
      console.log($scope.postBack);
      console.log($scope.photoId);
      for(var i = 0;i < $scope.postBack.length;i++) {
        var date = new Date();
        var insertTime = date.getFullYear() + '-' + (date.getMonth() + 1) + '-' + date.getDate();
        var unit = '';
        var type = '';
        var time = $scope.postBack[i].dt.getFullYear() + '-' + ($scope.postBack[i].dt.getMonth() + 1) + '-' + $scope.postBack[i].dt.getDate();
        switch($scope.postBack[i].LabType.selected) {
            case '血肌酐':type = 'SCr';unit = 'umol/L';break;
            case '尿蛋白':type = 'PRO';unit = 'mg/d';break;
            case '血白蛋白':type = 'ALB';unit = 'g/L';break;
            case '肾小球滤过率':type = 'GFR';unit = 'ml/min';break;
            default:break;
            }
        var params = {
          "patientId":Storage.get('patId'),
          "photoId":$scope.photoId,
          "insertTime":insertTime,
          "time":time,
          "type":type,
          "value":$scope.postBack[i].LabValue,
          "unit":unit,
          "token":"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI1OTIyZWJlNWI5NGRlMTM5Mjg1NzQ5ZjciLCJ1c2VySWQiOiJVMjAxNzA1MTEwMDAxIiwicm9sZSI6ImhlYWx0aCIsImV4cCI6MTQ5OTY4Nzg2OTI5NSwiaWF0IjoxNDk5Njg0MjY5fQ.p87yOwwsumsi-G5uprWamdSH8_Ij1NgY3XAi1yFdv0U"
        }
        console.log(params);
        LabtestImport.PostLabTestInfo(params).then(
          function (data) {
            console.log(data.result);
          }, function (e) {

          })
      }
      var label = {
        "photoType":$scope.phototype,
        "photoId":$scope.photoId,
        "token":"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI1OTIyZWJlNWI5NGRlMTM5Mjg1NzQ5ZjciLCJ1c2VySWQiOiJVMjAxNzA1MTEwMDAxIiwicm9sZSI6ImhlYWx0aCIsImV4cCI6MTQ5OTY4Nzg2OTI5NSwiaWF0IjoxNDk5Njg0MjY5fQ.p87yOwwsumsi-G5uprWamdSH8_Ij1NgY3XAi1yFdv0U"
      }
      LabtestImport.LabelPhoto(label).then(
        function (data) {
          console.log(data.results);
          if(data.results == "图片录入状态修改成功") {
            $('#save').modal('hide');
            $('#save').on('hidden.bs.modal', function () {
              $('#saved').modal('show');
              $timeout(function() {
                $('#saved').modal('hide');
              },1000);
              $('#saved').on('hidden.bs.modal', function () {
                $scope.photoId = '';
                $scope.phototype = '';
                var patient = {
                    'patientId':Storage.get('patId'),
                    'token':'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI1OTIyZWJlNWI5NGRlMTM5Mjg1NzQ5ZjciLCJ1c2VySWQiOiJVMjAxNzA1MTEwMDAxIiwicm9sZSI6ImhlYWx0aCIsImV4cCI6MTQ5OTY4Nzg2OTI5NSwiaWF0IjoxNDk5Njg0MjY5fQ.p87yOwwsumsi-G5uprWamdSH8_Ij1NgY3XAi1yFdv0U'
                }
                LabtestImport.GetPatientLabTest(patient).then(
                  function (data) {
                    $scope.patientlabtests = data.results;
                    for(var i = 0;i < $scope.patientlabtests.length;i++) {
                      switch($scope.patientlabtests[i].type) {
                        case 'SCr': $scope.patientlabtests[i].type = "血肌酐";break;
                        case 'PRO': $scope.patientlabtests[i].type = "尿蛋白";break;
                        case 'ALB': $scope.patientlabtests[i].type = "血白蛋白";break;
                        case 'GFR': $scope.patientlabtests[i].type = "肾小球滤过率";break;
                        default: break;
                      }
                      if($scope.patientlabtests[i].time != null) {
                        var tmp = Date.parse($scope.patientlabtests[i].time);
                        var stdate = new Date(tmp);
                        $scope.patientlabtests[i].time = stdate.getFullYear() + '-' + (stdate.getMonth() + 1) + '-' + stdate.getDate();
                      }
                      if($scope.patientlabtests[i].importTime != null) {
                          var tmp = Date.parse($scope.patientlabtests[i].importTime);
                          var stdate = new Date(tmp);
                          $scope.patientlabtests[i].importTime = stdate.getFullYear() + '-' + (stdate.getMonth() + 1) + '-' + stdate.getDate();
                      }      
                    }
                    console.log($scope.patientlabtests);
                    $scope.tableParams = new NgTableParams({
                              count:15
                          },
                          {   counts:[],
                              dataset:$scope.patientlabtests
                          });
                  }, function (e) {

                  })
              LabtestImport.GetPhotoList(patient).then(
                function (data) {
                  $scope.slides=data.results;
                  // var test=data.results;
                  // $scope.slides = test;
                  console.log(patient);
                  console.log($scope.slides);
                  // console.log($scope.slides[$index]);
                  $scope.photoId = '';
                  $scope.phototype = '';
                  $scope.getphoto = function (index) {
                    $scope.photoId = $scope.slides[index].photoId;
                    console.log($scope.photoId);
                    $('#selecttype').modal('show');
                  }
                  $scope.skipphoto = function (index) {
                    $scope.photoId = $scope.slides[index].photoId;
                    console.log($scope.photoId);
                    $('#skip').modal('show');
                  }
                  $scope.gettype = function () {
                    if($scope.custype == '') 
                    {
                      if(typeof($scope.select.selected) != 'undefined') $scope.phototype = $scope.select.selected.option;
                      else $scope.phototype = '';
                    }
                    else $scope.phototype = $scope.custype;
                    $('#selecttype').modal('hide');
                    $('#selecttype').on('hidden.bs.modal', function () {
                      $scope.select = {};
                      $scope.custype = '';
                      console.log($scope.phototype);
                    })
                  }
                }, function (e) {

                })
              })
            })
          }
        }, function (e) {

        })
    }
    $scope.skip = function () {
      var label = {
        "photoId":$scope.photoId,
        "token":"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI1OTIyZWJlNWI5NGRlMTM5Mjg1NzQ5ZjciLCJ1c2VySWQiOiJVMjAxNzA1MTEwMDAxIiwicm9sZSI6ImhlYWx0aCIsImV4cCI6MTQ5OTY4Nzg2OTI5NSwiaWF0IjoxNDk5Njg0MjY5fQ.p87yOwwsumsi-G5uprWamdSH8_Ij1NgY3XAi1yFdv0U"
      }
      LabtestImport.LabelPhoto(label).then(
        function (data) {
          console.log(data.results);
          if(data.results == "图片录入状态修改成功") {
            $('#skip').modal('hide');
            $('#skip').on('hidden.bs.modal', function () {
              $('#skiped').modal('show');
              $timeout(function() {
                $('#skiped').modal('hide');
              },1000);
              $('#skiped').on('hidden.bs.modal', function () {
                $scope.photoId = '';
                var patient = {
                  'patientId':Storage.get('patId'),
                  'token':'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI1OTIyZWJlNWI5NGRlMTM5Mjg1NzQ5ZjciLCJ1c2VySWQiOiJVMjAxNzA1MTEwMDAxIiwicm9sZSI6ImhlYWx0aCIsImV4cCI6MTQ5OTY4Nzg2OTI5NSwiaWF0IjoxNDk5Njg0MjY5fQ.p87yOwwsumsi-G5uprWamdSH8_Ij1NgY3XAi1yFdv0U'
                }
                LabtestImport.GetPhotoList(patient).then(
                  function (data) {
                    $scope.slides=data.results;
                    // var test=data.results;
                    // $scope.slides = test;
                    console.log(patient);
                    console.log($scope.slides);
                    // console.log($scope.slides[$index]);
                    $scope.photoId = '';
                    $scope.phototype = '';
                    $scope.getphoto = function (index) {
                      $scope.photoId = $scope.slides[index].photoId;
                      console.log($scope.photoId);
                      $('#selecttype').modal('show');
                    }
                    $scope.skipphoto = function (index) {
                      $scope.photoId = $scope.slides[index].photoId;
                      console.log($scope.photoId);
                      $('#skip').modal('show');
                    }
                    $scope.gettype = function () {
                      if($scope.custype == '') $scope.phototype = $scope.select.selected.option;
                      else $scope.phototype = $scope.custype;
                      $('#selecttype').modal('hide');
                      $('#selecttype').on('hidden.bs.modal', function () {
                        $scope.select = {};
                        $scope.custype = '';
                        console.log($scope.phototype);
                      })
                    }
                  }, function (e) {

                  })
              })
            })
          }
        }, function (e) {

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
.controller('PatientLabInfoCtrl', ['$scope', '$state', 'Storage', 'LabtestImport', 'NgTableParams', '$timeout', function ($scope, $state, Storage, LabtestImport, NgTableParams, $timeout) {
  $scope.patname = Storage.get('patName')
  $scope.patientlabtests = {};
  var patient = {
    "patientId":Storage.get('patId'),
    "token":"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI1OTIyZWJlNWI5NGRlMTM5Mjg1NzQ5ZjciLCJ1c2VySWQiOiJVMjAxNzA1MTEwMDAxIiwicm9sZSI6ImhlYWx0aCIsImV4cCI6MTQ5OTY4Nzg2OTI5NSwiaWF0IjoxNDk5Njg0MjY5fQ.p87yOwwsumsi-G5uprWamdSH8_Ij1NgY3XAi1yFdv0U"
  }
  LabtestImport.GetPatientLabTest(patient).then(
    function (data) {
      $scope.patientlabtests = data.results;
      for(var i = 0;i < $scope.patientlabtests.length;i++) {
        switch($scope.patientlabtests[i].type) {
          case 'SCr': $scope.patientlabtests[i].type = "血肌酐";break;
          case 'PRO': $scope.patientlabtests[i].type = "尿蛋白";break;
          case 'ALB': $scope.patientlabtests[i].type = "血白蛋白";break;
          case 'GFR': $scope.patientlabtests[i].type = "肾小球滤过率";break;
          default: break;
        }
        if($scope.patientlabtests[i].time != null) {
          var tmp = Date.parse($scope.patientlabtests[i].time);
          var stdate = new Date(tmp);
          $scope.patientlabtests[i].time = stdate.getFullYear() + '-' + (stdate.getMonth() + 1) + '-' + stdate.getDate();
        }
        if($scope.patientlabtests[i].importTime != null) {
            var tmp = Date.parse($scope.patientlabtests[i].importTime);
            var stdate = new Date(tmp);
            $scope.patientlabtests[i].importTime = stdate.getFullYear() + '-' + (stdate.getMonth() + 1) + '-' + stdate.getDate();
        }      
      }
      console.log($scope.patientlabtests);
      $scope.tableParams = new NgTableParams({
                count:15
            },
            {   counts:[],
                dataset:$scope.patientlabtests
            });
    }, function (e) {

    })
  $scope.getlabtestId = function (index) {
    Storage.set('labtestId',$scope.patientlabtests[index].labtestId);
    Storage.set('labtype',$scope.patientlabtests[index].type);
    Storage.set('labvalue',$scope.patientlabtests[index].value);
    Storage.set('labdt',$scope.patientlabtests[index].time);
  }
}])
// 查看/编辑已录入信息-LZN
.controller('ModifyLabInfoCtrl', ['$scope', '$state', 'Storage', 'LabtestImport', 'NgTableParams', '$timeout', function ($scope, $state, Storage, LabtestImport, NgTableParams, $timeout) {
  $scope.patname = Storage.get('patName');
  var type =Storage.get('labtype');
  switch(Storage.get('labtype')) {
    case 'SCr':type = '血肌酐';break;
    case 'PRO':type = '尿蛋白';break;
    case 'GFR':type = '肾小球滤过率';break;
    case 'ALB':type = '血白蛋白';break;
    default:break;
  }
  
  var tmp = Date.parse(Storage.get('labdt'));
  var dt = new Date(tmp);
  console.log(dt);
  $scope.LabType={
    options:[
      '血肌酐',
      '尿蛋白',
      '血白蛋白',
      '肾小球滤过率'
    ],
    selected:type
  };
  $scope.LabValue=parseFloat(Storage.get('labvalue'));
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
      opened:false
    }
    
    function getDayClass(data) {
      var date = data.date,
        mode = data.mode;
      if (mode === 'day') {
          var dayToCheck = new Date(date).setHours(0,0,0,0);
          for (var i = 0; i < $scope.events.length; i++) {
            var currentDay = new Date($scope.events[i].date).setHours(0,0,0,0);
            if (dayToCheck === currentDay) {
                return $scope.events[i].status;
            }
          }
      }
      return '';
    }
    $scope.photolist = {};
    var labtest = {
      'labtestId':Storage.get('labtestId'),
      'token':'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI1OTIyZWJlNWI5NGRlMTM5Mjg1NzQ5ZjciLCJ1c2VySWQiOiJVMjAxNzA1MTEwMDAxIiwicm9sZSI6ImhlYWx0aCIsImV4cCI6MTQ5OTY4Nzg2OTI5NSwiaWF0IjoxNDk5Njg0MjY5fQ.p87yOwwsumsi-G5uprWamdSH8_Ij1NgY3XAi1yFdv0U'
    }
    LabtestImport.GetPhotobyLabtest(labtest).then(
      function (data) {
        $scope.photolist = data.results;
        
      }, function (e) {

      })
    
    $scope.modify = function () {
      var unit = '';
      var type = '';
      var time = $scope.dt.getFullYear() + '-' + ($scope.dt.getMonth() + 1) + '-' + $scope.dt.getDate();
      switch($scope.LabType.selected) {
          case '血肌酐':type = 'SCr';unit = 'umol/L';break;
          case '尿蛋白':type = 'PRO';unit = 'mg/d';break;
          case '血白蛋白':type = 'ALB';unit = 'g/L';break;
          case '肾小球滤过率':type = 'GFR';unit = 'ml/min';break;
          default:break;
          }
      var params = {
        "labtestId":Storage.get('labtestId'),
        "time":time,
        "type":type,
        "value":$scope.LabValue,
        "unit":unit,
        "token":"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI1OTIyZWJlNWI5NGRlMTM5Mjg1NzQ5ZjciLCJ1c2VySWQiOiJVMjAxNzA1MTEwMDAxIiwicm9sZSI6ImhlYWx0aCIsImV4cCI6MTQ5OTY4Nzg2OTI5NSwiaWF0IjoxNDk5Njg0MjY5fQ.p87yOwwsumsi-G5uprWamdSH8_Ij1NgY3XAi1yFdv0U"
      }
      console.log(params);
      LabtestImport.EditResult(params).then(
        function (data) {
          console.log(data.results);
          if(data.results == "修改成功") {
            $('#modify').modal('show');
            $timeout(function() {
                $('#modify').modal('hide');
            },1000);
            $('#modify').on('hidden.bs.modal', function () {
              $state.go('main.patientlabinfo');
            })
          }
        }, function (e) {

        })
    }
    
}])




// 用户管理--张桠童
.controller('UserManageCtrl', ['$scope', '$state', 'Storage', '$timeout', function ($scope, $state, Storage, $timeout) {
  $scope.toallUsers = function () {
    $state.go('main.usermanage.allUsers');
  }
  $scope.todoctors = function () {
    $state.go('main.usermanage.doctors');
  }
  $scope.tonurses = function () {
    $state.go('main.usermanage.nurses');
  }
  $scope.topatients = function () {
    $state.go('main.usermanage.patients');
  }
  $scope.toinsuranceOfficers = function () {
    $state.go('main.usermanage.insuranceOfficers');
  }
  $scope.tohealthOfficers = function () {
    $state.go('main.usermanage.healthOfficers');
  }
  $scope.toadministrators = function () {
    $state.go('main.usermanage.administrators');
  }
}])
// 所有用户--张桠童
.controller('allUsersCtrl', ['$scope', '$state', 'Storage', 'NgTableParams', '$timeout', '$uibModal', 'Alluser', 'Roles', '$window', 
  function ($scope, $state, Storage, NgTableParams, $timeout, $uibModal, Alluser, Roles, $window) {
    var token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI1OTEyZTllYmRjODNmNmE4YjdkY2JkZTgiLCJ1c2VySWQiOiJVMjAxNzAzMTQyMDE4Iiwicm9sZSI6InBhdGllbnQiLCJleHBpcmVBZnRlciI6MTQ5NzQwNzI2MzgzMywiaWF0IjoxNDk3NDA3MjYzfQ.5UITzg6NaHcIIEQESCLLB7mx_suISw9Bj6K1OBaiaDk';
    // -----------获取列表总条数------------------
    var getTotalNums = function (role1) {
      var countInfo = {
        token:token,
        role1:role1
      };
      console.log(countInfo)
      var promise = Alluser.getCount(countInfo);
      promise.then(function(data){
        console.log(data.results)
        $scope.totalNums = data.results;
      },function(){});
    }
    // ------------------------------------------- 

    // ---------------获取搜索(或未搜索)列表及列表数------------------------
    var getLists = function (currentPage,itemsPerPage,_userlist,role_count) {
      // 完善userlist
      var userlist = _userlist;
      userlist.token = token;
      userlist.limit = itemsPerPage;
      userlist.skip = (currentPage-1)*itemsPerPage;
      // 完善countInfo
      var countInfo = userlist;
      countInfo.role1 = role_count;
      if (userlist.role!=undefined) countInfo.role2 = userlist.role;
      // 获取总条目数
      console.log(countInfo)
      var promise = Alluser.getCount(countInfo);
      promise.then(function(data){
        console.log(data.results)
        $scope.totalItems = data.results;
      },function(){});
      // 获取搜索列表
      console.log(userlist)
      var promise = Alluser.getUserList(userlist);
      promise.then(function(data){
        console.log(data.results);
        $scope.tableParams = new NgTableParams({
                          count:10000
                      },
                      {   counts:[],
                          dataset: data.results
                      });
      },function(err){});
    }
    // ---------------------------------------------------------------------
    
    // -------判断某角色在角色数组中是否存在-------
    var existRole = function (role,roles) {
      for (var i=0; i<roles.length; ++i) {
        if (roles[i]==role) {return true;}
      }
    }
    // --------------------------------------------

    // 初始化列表
    getTotalNums(0);
    $scope.currentPage = 1;
    $scope.itemsPerPage = 50;
    $scope.userlist = {};
    getLists($scope.currentPage,$scope.itemsPerPage,$scope.userlist,0);
    
    // 页面改变
    $scope.pageChanged = function(){
      console.log($scope.currentPage);
      getLists($scope.currentPage,$scope.itemsPerPage,$scope.userlist,0);
    }
    // 当前页面的总条目数改变
    $scope.changeLimit=function(num){
      $scope.itemsPerPage = num;
      $scope.currentPage = 1;
      getLists($scope.currentPage,$scope.itemsPerPage,$scope.userlist,0);
    }
    // 搜索
    $scope.search_roles = [
      {id:'Leader',name:'地区负责人'},
      {id:'master',name:'科主任'},
      {id:'doctor',name:'普通医生'},
      {id:'patient',name:'患者'},
      {id:'nurse',name:'护士'},
      {id:'insuranceA',name:'沟通人员'},
      {id:'insuranceC',name:'保险主管'},
      {id:'insuranceR',name:'录入人员'},
      {id:'health',name:'健康专员'},
      {id:'admin',name:'管理员'}
    ];
    $scope.search_genders = [
      {id:1,name:"男"},
      {id:2,name:"女"}
    ];
    $scope.searchList = function () {
      console.log($scope.userlist)
      getLists($scope.currentPage,$scope.itemsPerPage,$scope.userlist,0);
    }
    // 清空搜索
    $scope.searchClear = function () {
      $scope.userlist = {};
      getLists($scope.currentPage,$scope.itemsPerPage,$scope.userlist,0);
    }
    // 注销modal
    $scope.confirm = function(userID){
      var modalInstance = $uibModal.open({
        animation: true,
        ariaLabelledBy: 'modal-title',
        ariaDescribedBy: 'modal-body',
        templateUrl: 'confirm.html',
        controller: 'confirmCtrl',
        size: 'sm',
        resolve: {
          userID: function () {
            return userID;
          }
        }
      });
      modalInstance.result.then(function(){
        var cancelUserinfo = {
          "userId":userID,
          "token":token
        };
        var promise = Alluser.cancelUser(cancelUserinfo);
        promise.then(function(data){
          // console.log(data);
          if (data.msg=="success!") {
            $('#confirmSuccess').modal('show');
            $timeout(function(){
              $('#confirmSuccess').modal('hide');
              // 刷新所有用户列表
              $scope.currentPage = 1;
              getTotalNums(0);
              getLists($scope.currentPage,$scope.itemsPerPage,$scope.userlist,0);
            },1000);
          }
        },function(err){});
      },function(){});
    };
    // 监听事件(表单清空)
    $('#changeRoles').on('hidden.bs.modal',function(){
      $('#changeRolesForm').formValidation('resetForm', true);
    })
    // 关闭modal控制
    $scope.modal_close = function(target){
      $(target).modal('hide');
    };
    // 为获取多选框初始状态所设变量
    var userdetail_temp = [];
    $scope.openChangeRoles = function (userdetail) {
      console.log(userdetail.role)
      userdetail_temp = userdetail;
      var role_temp = {
        Leader:false,
        master:false,
        doctor:false,
        patient:false,
        nurse:false,
        insuranceA:false,
        insuranceC:false,
        insuranceR:false,
        health:false,
        admin:false
      }
      for (var i=0; i<userdetail.role.length; ++i) {
        role_temp[userdetail.role[i]] = true;
      }
      console.log(role_temp)
      // 初始化
      $scope.role_end = role_temp;
      // 是否无效 true为无效
      $scope.ifDisabled = {
        Leader:false,
        master:false,
        doctor:false,
        patient:false,
        nurse:false,
        insuranceA:false,
        insuranceC:false,
        insuranceR:false,
        health:false,
        admin:false
      }
      if (existRole('doctor',userdetail.role)) {
        $scope.ifDisabled.doctor=true;
        $scope.ifDisabled.patient=true;
      }
      else if (existRole('nurse',userdetail.role)) {
        $scope.ifDisabled.patient=true;
      }
      else if (existRole('patient',userdetail.role)) {
        $scope.ifDisabled.patient=true;
        $scope.ifDisabled.doctor=true;
        $scope.ifDisabled.Leader=true;
        $scope.ifDisabled.master=true;
        $scope.ifDisabled.nurse=true;
      }
      else if (existRole('admin',userdetail.role)) {
        $scope.ifDisabled.patient=true;
        $scope.ifDisabled.doctor=true;
        $scope.ifDisabled.Leader=true;
        $scope.ifDisabled.master=true;
        $scope.ifDisabled.nurse=true;
      }
      else {
        $scope.ifDisabled.patient=true;
        $scope.ifDisabled.doctor=true;
        $scope.ifDisabled.Leader=true;
        $scope.ifDisabled.master=true;
        $scope.ifDisabled.nurse=true;
        $scope.ifDisabled.admin=true;
      }

    }
    // 确定是否更改
    $scope.toChangeOrNot = function () {
      $('#changeRoles').modal('hide');
      $('#changeRolesOrNot').modal('show');
    }
    // 更改角色
    $scope.roles_change = function () {
      $('#changeRolesOrNot').modal('hide');
      console.log($scope.role_end)
      // 角色变化前的状态
      var role_before = {
        Leader:false,
        master:false,
        doctor:false,
        patient:false,
        nurse:false,
        insuranceA:false,
        insuranceC:false,
        insuranceR:false,
        health:false,
        admin:false
      }
      for (var i=0; i<userdetail_temp.role.length; ++i) {
        role_before[userdetail_temp.role[i]] = true;
      }
      console.log(role_before)
      // 获取增删角色数组
      var role_add = [];
      var role_remove = [];
      if(role_before.Leader==false&&$scope.role_end.Leader==true) role_add.push('Leader');
      if(role_before.Leader==true&&$scope.role_end.Leader==false) role_remove.push('Leader');
      if(role_before.master==false&&$scope.role_end.master==true) role_add.push('master');
      if(role_before.master==true&&$scope.role_end.master==false) role_remove.push('master');
      if(role_before.doctor==false&&$scope.role_end.doctor==true) role_add.push('doctor');
      if(role_before.doctor==true&&$scope.role_end.doctor==false) role_remove.push('doctor');
      if(role_before.patient==false&&$scope.role_end.patient==true) role_add.push('patient');
      if(role_before.patient==true&&$scope.role_end.patient==false) role_remove.push('patient');
      if(role_before.nurse==false&&$scope.role_end.nurse==true) role_add.push('nurse');
      if(role_before.nurse==true&&$scope.role_end.nurse==false) role_remove.push('nurse');
      if(role_before.insuranceA==false&&$scope.role_end.insuranceA==true) role_add.push('insuranceA');
      if(role_before.insuranceA==true&&$scope.role_end.insuranceA==false) role_remove.push('insuranceA');
      if(role_before.insuranceC==false&&$scope.role_end.insuranceC==true) role_add.push('insuranceC');
      if(role_before.insuranceC==true&&$scope.role_end.insuranceC==false) role_remove.push('insuranceC');
      if(role_before.insuranceR==false&&$scope.role_end.insuranceR==true) role_add.push('insuranceR');
      if(role_before.insuranceR==true&&$scope.role_end.insuranceR==false) role_remove.push('insuranceR');
      if(role_before.health==false&&$scope.role_end.health==true) role_add.push('health');
      if(role_before.health==true&&$scope.role_end.health==false) role_remove.push('health');
      if(role_before.admin==false&&$scope.role_end.admin==true) role_add.push('admin');
      if(role_before.admin==true&&$scope.role_end.admin==false) role_remove.push('admin');
      console.log(role_add)
      console.log(role_remove)
      // 添加角色
      for (var i=0; i<role_add.length; ++i){
        var addInfo = {
          userId : userdetail_temp.userId,
          roles : role_add[i],
          token : token
        }
        var promise = Roles.addRoles(addInfo);
        promise.then(function(data){
          console.log(data)
          // if (data.mesg=="User Register Success!") continue
        })
      }
      // 去除角色
      for (var i=0; i<role_remove.length; ++i){
        var removeInfo = {
          userId : userdetail_temp.userId,
          roles : role_remove[i],
          token : token
        }
        var promise = Roles.removeRoles(removeInfo);
        promise.then(function(data){
          console.log(data)
          // if (data.mesg=="User Register Success!") continue
        })
      }
      // 提示修改成功
      $('#changeRolesSuccess').modal('show');
      $timeout(function(){
        $('#changeRolesSuccess').modal('hide');
      },1000);
      $timeout(function(){
        // 刷新列表
        $scope.currentPage = 1;
        getTotalNums(0);
        getLists($scope.currentPage,$scope.itemsPerPage,$scope.userlist,0);
      },1000);
    }

}])
// 所有用户--注销modal--张桠童
.controller('confirmCtrl', ['$scope', '$state', 'Storage', 'NgTableParams', '$timeout', '$uibModal', 'Alluser', '$uibModalInstance', 'userID', 
  function ($scope, $state, Storage, NgTableParams, $timeout, $uibModal, Alluser, $uibModalInstance, userID) {
    $scope.close = function(){
      $uibModalInstance.dismiss();
    };
    $scope.ok = function(){
      $uibModalInstance.close();
    };   
}])
// 医生--张桠童
.controller('doctorsCtrl', ['$scope', '$state', 'Storage', 'NgTableParams', '$timeout', '$uibModal', 'Alluser', 'Roles',
  function ($scope, $state, Storage, NgTableParams, $timeout, $uibModal, Alluser, Roles) {
    var token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI1OTEyZTllYmRjODNmNmE4YjdkY2JkZTgiLCJ1c2VySWQiOiJVMjAxNzAzMTQyMDE4Iiwicm9sZSI6InBhdGllbnQiLCJleHBpcmVBZnRlciI6MTQ5NzQwNzI2MzgzMywiaWF0IjoxNDk3NDA3MjYzfQ.5UITzg6NaHcIIEQESCLLB7mx_suISw9Bj6K1OBaiaDk';
    
    // -----------获取列表总条数------------------
    var getTotalNums = function (role1) {
      var countInfo = {
        token:token,
        role1:role1
      };
      console.log(countInfo)
      var promise = Alluser.getCount(countInfo);
      promise.then(function(data){
        console.log(data.results)
        $scope.totalNums = data.results;
      },function(){});
    }
    // ------------------------------------------- 

    // ---------------获取搜索(或未搜索)列表及列表数------------------------
    var getLists = function (currentPage,itemsPerPage,_userlist,role_count) {
      // 完善userlist
      var userlist = _userlist;
      userlist.token = token;
      userlist.limit = itemsPerPage;
      userlist.skip = (currentPage-1)*itemsPerPage;
      // 完善countInfo
      var countInfo = userlist;
      countInfo.role1 = role_count;
      if (userlist.role!=undefined) countInfo.role2 = userlist.role;
      // 获取总条目数
      console.log(countInfo)
      var promise = Alluser.getCount(countInfo);
      promise.then(function(data){
        console.log(data.results)
        $scope.totalItems = data.results;
      },function(){});
      // 获取搜索列表
      console.log(userlist)
      var promise = Alluser.getDoctorList(userlist);
      promise.then(function(data){
        console.log(data.results);
        // 首先处理一下要显示的roles
        for (var i = 0; i<data.results.length; i++) {
          var roles = data.results[i].role;
          for(var j=0; j<roles.length; j++){
            if(roles[j]=="Leader"){
              data.results[i].role = "Leader";
            }
            if(roles[j]=="master"){
              data.results[i].role = "master";
            }
            if(roles[j]=="doctor"){
              data.results[i].role = "doctor";
            }
          }
        }
        $scope.tableParams = new NgTableParams({
                          count:10000
                      },
                      {   counts:[],
                          dataset: data.results
                      });
      },function(err){});
    }
    // ---------------------------------------------------------------------
    
    // 初始化列表
    getTotalNums(1);
    $scope.currentPage = 1;
    $scope.itemsPerPage = 50;
    $scope.userlist = {};
    getLists($scope.currentPage,$scope.itemsPerPage,$scope.userlist,1);
    // 页面改变
    $scope.pageChanged = function(){
      console.log($scope.currentPage);
      getLists($scope.currentPage,$scope.itemsPerPage,$scope.userlist,1);
    }
    // 当前页面的总条目数改变
    $scope.changeLimit=function(num){
      $scope.itemsPerPage = num;
      $scope.currentPage = 1;
      getLists($scope.currentPage,$scope.itemsPerPage,$scope.userlist,1);
    }
    // 搜索
    $scope.search_roles = [
      {id:'Leader',name:'地区负责人'},
      {id:'master',name:'科主任'},
      {id:'doctor',name:'普通医生'}
    ];
    $scope.search_genders = [
      {id:1,name:"男"},
      {id:2,name:"女"}
    ];
    $scope.searchList = function () {
      console.log($scope.userlist)
      getLists($scope.currentPage,$scope.itemsPerPage,$scope.userlist,1);
    }
    // 清空搜索
    $scope.searchClear = function () {
      $scope.userlist = {};
      getLists($scope.currentPage,$scope.itemsPerPage,$scope.userlist,1);
    }
    // 关闭modal控制
    $scope.modal_close = function(target){
      $(target).modal('hide');
    };
    //详细信息modal
    $scope.openDetail = function(userdetail){
      // console.log(userdetail);
      var modalInstance = $uibModal.open({
        animation: true,
        ariaLabelledBy: 'modal-title',
        ariaDescribedBy: 'modal-body',
        templateUrl: 'detail_doctor.html',
        controller: 'detail_doctorCtrl',
        // size: 'sm',
        resolve: {
          userdetail: function () {
            return userdetail;
          }
        }
      });
      modalInstance.result.then(function(con){
        if (con=="注销用户") {
          // 确认是否注销
          $("#cancelOrNot").modal('show');
          // 给modal传参
          $scope.userdetail = userdetail;
        } 
        else if (con=="去除角色") {
          // 确认是否去除角色
          $("#removeOrNot").modal('show');
          // 给modal传参
          $scope.userdetail = userdetail;
        }
      },function(){});
    };
    // 注销用户
    $scope.cancel = function(userdetail){
      // 关闭警告modal（是否注销）
      $("#cancelOrNot").modal('hide');
      // 注销用户输入
      var cancelUserinfo = {
        "userId":userdetail.userId,
        "token":token
      };
      // 注销该用户
      var promise = Alluser.cancelUser(cancelUserinfo);
      promise.then(function(data){
        // console.log(data);
        if (data.msg=="success!") {
          // 提示注销成功
          $('#cancelSuccess').modal('show');
          $timeout(function(){
            // 关闭提示
            $('#cancelSuccess').modal('hide');
            // 刷新医生列表
            $scope.currentPage = 1;
            getTotalNums(1);
            getLists($scope.currentPage,$scope.itemsPerPage,$scope.userlist,1);
          },1000);
        }
      },function(err){});
    };
    // 去除角色
    $scope.remove = function(userdetail){
      // 关闭警告（是否去除角色）
      $("#removeOrNot").modal('hide');
      // 去除角色方法输入
      var removeInfo = {
        "userId":userdetail.userId,
        "roles":userdetail.role,
        "token":token
      };
      // 去除该角色
      var promise = Roles.removeRoles(removeInfo);
      promise.then(function(data){
        // console.log(data);
        if (data.mesg=="User Register Success!") {
          // 提示去除成功
          $('#removeSuccess').modal('show');
          $timeout(function(){
            // 关闭提示
            $('#removeSuccess').modal('hide');
            // 刷新医生列表
            $scope.currentPage = 1;
            getTotalNums(1);
            getLists($scope.currentPage,$scope.itemsPerPage,$scope.userlist,1);
          },1000);
        };
      },function(err){});
    };
}])
// 医生--详细信息modal--张桠童
.controller('detail_doctorCtrl', ['$scope', '$state', 'Storage', 'NgTableParams', '$timeout', '$uibModal', 'Alluser', '$uibModalInstance', 'userdetail', 
  function ($scope, $state, Storage, NgTableParams, $timeout, $uibModal, Alluser, $uibModalInstance, userdetail) {
    // console.log(userdetail);
    $scope.doctorInfo = userdetail;
    // 关闭modal
    $scope.close = function(){
      $uibModalInstance.dismiss();
    };
    // 注销用户
    $scope.cancelUser = function(){
      $uibModalInstance.close("注销用户");
    }; 
    // 去除角色
    $scope.removeUserRoles = function(){
      $uibModalInstance.close("去除角色");
    };   
}])
// 护士--张桠童
.controller('nursesCtrl', ['$scope', '$state', 'Storage', 'NgTableParams', '$timeout', '$uibModal', 'Alluser', 'Roles',
  function ($scope, $state, Storage, NgTableParams, $timeout, $uibModal, Alluser, Roles) {
    var token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI1OTEyZTllYmRjODNmNmE4YjdkY2JkZTgiLCJ1c2VySWQiOiJVMjAxNzAzMTQyMDE4Iiwicm9sZSI6InBhdGllbnQiLCJleHBpcmVBZnRlciI6MTQ5NzQwNzI2MzgzMywiaWF0IjoxNDk3NDA3MjYzfQ.5UITzg6NaHcIIEQESCLLB7mx_suISw9Bj6K1OBaiaDk';
    
    // -----------获取列表总条数------------------
    var getTotalNums = function (role1) {
      var countInfo = {
        token:token,
        role1:role1
      };
      console.log(countInfo)
      var promise = Alluser.getCount(countInfo);
      promise.then(function(data){
        console.log(data.results)
        $scope.totalNums = data.results;
      },function(){});
    }
    // ------------------------------------------- 

    // ---------------获取搜索(或未搜索)列表及列表数------------------------
    var getLists = function (currentPage,itemsPerPage,_userlist,role_count) {
      // 完善userlist
      var userlist = _userlist;
      userlist.token = token;
      userlist.limit = itemsPerPage;
      userlist.skip = (currentPage-1)*itemsPerPage;
      // 完善countInfo
      var countInfo = userlist;
      countInfo.role1 = role_count;
      if (userlist.role!=undefined) countInfo.role2 = userlist.role;
      // 获取总条目数
      console.log(countInfo)
      var promise = Alluser.getCount(countInfo);
      promise.then(function(data){
        console.log(data.results)
        $scope.totalItems = data.results;
      },function(){});
      // 获取搜索列表
      console.log(userlist)
      var promise = Alluser.getNurseList(userlist);
      promise.then(function(data){
        console.log(data.results);
        $scope.tableParams = new NgTableParams({
                          count:10000
                      },
                      {   counts:[],
                          dataset: data.results
                      });
      },function(err){});
    }
    // ---------------------------------------------------------------------
    
    // 初始化列表
    getTotalNums(3);
    $scope.currentPage = 1;
    $scope.itemsPerPage = 50;
    $scope.userlist = {};
    getLists($scope.currentPage,$scope.itemsPerPage,$scope.userlist,3);
    // 页面改变
    $scope.pageChanged = function(){
      console.log($scope.currentPage);
      getLists($scope.currentPage,$scope.itemsPerPage,$scope.userlist,3);
    }
    // 当前页面的总条目数改变
    $scope.changeLimit=function(num){
      $scope.itemsPerPage = num;
      $scope.currentPage = 1;
      getLists($scope.currentPage,$scope.itemsPerPage,$scope.userlist,3);
    }
    // 搜索
    $scope.search_genders = [
      {id:1,name:"男"},
      {id:2,name:"女"}
    ];
    $scope.searchList = function () {
      console.log($scope.userlist)
      getLists($scope.currentPage,$scope.itemsPerPage,$scope.userlist,3);
    }
    // 清空搜索
    $scope.searchClear = function () {
      $scope.userlist = {};
      getLists($scope.currentPage,$scope.itemsPerPage,$scope.userlist,3);
    }
    // 关闭modal控制
    $scope.modal_close = function(target){
      $(target).modal('hide');
    };
    //详细信息modal
    $scope.openDetail = function(userdetail){
      var modalInstance = $uibModal.open({
        animation: true,
        ariaLabelledBy: 'modal-title',
        ariaDescribedBy: 'modal-body',
        templateUrl: 'detail_nurse.html',
        controller: 'detail_nurseCtrl',
        // size: 'sm',
        resolve: {
          userdetail: function () {
            return userdetail;
          }
        }
      });
      modalInstance.result.then(function(con){
        if (con=="注销用户") {
          // 确认是否注销
          $("#cancelOrNot").modal('show');
          // 给modal传参
          $scope.userdetail = userdetail;
        } 
        else if (con=="去除角色") {
          // 确认是否去除角色
          $("#removeOrNot").modal('show');
          // 给modal传参
          $scope.userdetail = userdetail;
        }
      },function(){});
    };
    // 注销用户
    $scope.cancel = function(userdetail){
      // 关闭警告modal（是否注销）
      $("#cancelOrNot").modal('hide');
      // 注销用户输入
      var cancelUserinfo = {
        "userId":userdetail.userId,
        "token":token
      };
      // 注销该用户
      var promise = Alluser.cancelUser(cancelUserinfo);
      promise.then(function(data){
        // console.log(data);
        if (data.msg=="success!") {
          // 提示注销成功
          $('#cancelSuccess').modal('show');
          $timeout(function(){
            // 关闭提示
            $('#cancelSuccess').modal('hide');
            // 刷新护士列表
            $scope.currentPage = 1;
            getTotalNums(3);
            getLists($scope.currentPage,$scope.itemsPerPage,$scope.userlist,3);
          },1000);
        }
      },function(err){});
    };
    // 去除角色
    $scope.remove = function(userdetail){
      // 关闭警告（是否去除角色）
      $("#removeOrNot").modal('hide');
      // 去除角色方法输入
      var removeInfo = {
        "userId":userdetail.userId,
        "roles":"nurse",
        "token":token
      };
      // 去除该角色
      var promise = Roles.removeRoles(removeInfo);
      promise.then(function(data){
        // console.log(data);
        if (data.mesg=="User Register Success!") {
          // 提示去除成功
          $('#removeSuccess').modal('show');
          $timeout(function(){
            // 关闭提示
            $('#removeSuccess').modal('hide');
            // 刷新护士列表
            $scope.currentPage = 1;
            getTotalNums(3);
            getLists($scope.currentPage,$scope.itemsPerPage,$scope.userlist,3);
          },1000);
        };
      },function(err){});
    };
}])
// 护士--详细信息modal--张桠童
.controller('detail_nurseCtrl', ['$scope', '$state', 'Storage', 'NgTableParams', '$timeout', '$uibModal', 'Alluser', '$uibModalInstance', 'userdetail', 
  function ($scope, $state, Storage, NgTableParams, $timeout, $uibModal, Alluser, $uibModalInstance, userdetail) {
    // console.log(userdetail);
    $scope.nurseInfo = userdetail;
    // 关闭modal
    $scope.close = function(){
      $uibModalInstance.dismiss();
    };
    // 注销用户
    $scope.cancelUser = function(){
      $uibModalInstance.close("注销用户");
    }; 
    // 去除角色
    $scope.removeUserRoles = function(){
      $uibModalInstance.close("去除角色");
    };   
}])
// 患者--张桠童
.controller('patientsCtrl', ['$scope', '$state', 'Storage', 'NgTableParams', '$timeout', '$uibModal', 'Alluser', 'Roles',
  function ($scope, $state, Storage, NgTableParams, $timeout,$uibModal, Alluser, Roles) {
    var token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI1OTEyZTllYmRjODNmNmE4YjdkY2JkZTgiLCJ1c2VySWQiOiJVMjAxNzAzMTQyMDE4Iiwicm9sZSI6InBhdGllbnQiLCJleHBpcmVBZnRlciI6MTQ5NzQwNzI2MzgzMywiaWF0IjoxNDk3NDA3MjYzfQ.5UITzg6NaHcIIEQESCLLB7mx_suISw9Bj6K1OBaiaDk';
    
    // -----------获取列表总条数------------------
    var getTotalNums = function (role1) {
      var countInfo = {
        token:token,
        role1:role1
      };
      console.log(countInfo)
      var promise = Alluser.getCount(countInfo);
      promise.then(function(data){
        console.log(data.results)
        $scope.totalNums = data.results;
      },function(){});
    }
    // ------------------------------------------- 

    // ---------------获取搜索(或未搜索)列表及列表数------------------------
    var getLists = function (currentPage,itemsPerPage,_userlist,role_count) {
      // 完善userlist
      var userlist = _userlist;
      userlist.token = token;
      userlist.limit = itemsPerPage;
      userlist.skip = (currentPage-1)*itemsPerPage;
      // 完善countInfo
      var countInfo = userlist;
      countInfo.role1 = role_count;
      if (userlist.role!=undefined) countInfo.role2 = userlist.role;
      // 获取总条目数
      console.log(countInfo)
      var promise = Alluser.getCount(countInfo);
      promise.then(function(data){
        console.log(data.results)
        $scope.totalItems = data.results;
      },function(){});
      // 获取搜索列表
      console.log(userlist)
      var promise = Alluser.getPatientList(userlist);
      promise.then(function(data){
        console.log(data.results);
        $scope.tableParams = new NgTableParams({
                          count:10000
                      },
                      {   counts:[],
                          dataset: data.results
                      });
      },function(err){});
    }
    // ---------------------------------------------------------------------
    
    // 初始化列表
    getTotalNums(2);
    $scope.currentPage = 1;
    $scope.itemsPerPage = 50;
    $scope.userlist = {};
    getLists($scope.currentPage,$scope.itemsPerPage,$scope.userlist,2);
    // 页面改变
    $scope.pageChanged = function(){
      console.log($scope.currentPage);
      getLists($scope.currentPage,$scope.itemsPerPage,$scope.userlist,2);
    }
    // 当前页面的总条目数改变
    $scope.changeLimit=function(num){
      $scope.itemsPerPage = num;
      $scope.currentPage = 1;
      getLists($scope.currentPage,$scope.itemsPerPage,$scope.userlist,2);
    }
    // 搜索
    $scope.search_genders = [
      {id:1,name:"男"},
      {id:2,name:"女"}
    ];
    $scope.search_class = [
      {id:'class_1',name:"肾移植"},
      {id:'class_2',name:"CKD1-2期"},
      {id:'class_3',name:"CKD3-4期"},
      {id:'class_4',name:"CDK5期未透析"},
      {id:'class_5',name:"血透"},
      {id:'class_6',name:"腹透"}      
    ];
    $scope.searchList = function () {
      console.log($scope.userlist)
      getLists($scope.currentPage,$scope.itemsPerPage,$scope.userlist,2);
    }
    // 清空搜索
    $scope.searchClear = function () {
      $scope.userlist = {};
      getLists($scope.currentPage,$scope.itemsPerPage,$scope.userlist,2);
    }
    // 关闭modal控制
    $scope.modal_close = function(target){
      $(target).modal('hide');
    };
    //详细信息modal
    $scope.openDetail = function(userdetail){
      var modalInstance = $uibModal.open({
        animation: true,
        ariaLabelledBy: 'modal-title',
        ariaDescribedBy: 'modal-body',
        templateUrl: 'detail_patient.html',
        controller: 'detail_patientCtrl',
        // size: 'sm',
        resolve: {
          userdetail: function () {
            return userdetail;
          }
        }
      });
      modalInstance.result.then(function(con){
        if (con=="注销用户") {
          // 确认是否注销
          $("#cancelOrNot").modal('show');
          // 给modal传参
          $scope.userdetail = userdetail;
        } 
        else if (con=="去除角色") {
          // 确认是否去除角色
          $("#removeOrNot").modal('show');
          // 给modal传参
          $scope.userdetail = userdetail;
        }
      },function(){});
    };
    // 注销用户
    $scope.cancel = function(userdetail){
      // 关闭警告modal（是否注销）
      $("#cancelOrNot").modal('hide');
      // 注销用户输入
      var cancelUserinfo = {
        "userId":userdetail.userId,
        "token":token
      };
      // 注销该用户
      var promise = Alluser.cancelUser(cancelUserinfo);
      promise.then(function(data){
        // console.log(data);
        if (data.msg=="success!") {
          // 提示注销成功
          $('#cancelSuccess').modal('show');
          $timeout(function(){
            // 关闭提示
            $('#cancelSuccess').modal('hide');
            // 刷新患者列表
            $scope.currentPage = 1;
            getTotalNums(2);
            getLists($scope.currentPage,$scope.itemsPerPage,$scope.userlist,2);
          },1000);
        }
      },function(err){});
    };
    // 去除角色
    $scope.remove = function(userdetail){
      // 关闭警告（是否去除角色）
      $("#removeOrNot").modal('hide');
      // 去除角色方法输入
      var removeInfo = {
        "userId":userdetail.userId,
        "roles":"patient",
        "token":token
      };
      // 去除该角色
      var promise = Roles.removeRoles(removeInfo);
      promise.then(function(data){
        // console.log(data);
        if (data.mesg=="User Register Success!") {
          // 提示去除成功
          $('#removeSuccess').modal('show');
          $timeout(function(){
            // 关闭提示
            $('#removeSuccess').modal('hide');
            // 刷新患者列表
            $scope.currentPage = 1;
            getTotalNums(2);
            getLists($scope.currentPage,$scope.itemsPerPage,$scope.userlist,2);
          },1000);
        };
      },function(err){});
    };
}])
// 患者--详细信息modal--张桠童
.controller('detail_patientCtrl', ['$scope', '$state', 'Storage', 'NgTableParams', '$timeout', '$uibModal', 'Alluser', '$uibModalInstance', 'userdetail', 
  function ($scope, $state, Storage, NgTableParams, $timeout, $uibModal, Alluser, $uibModalInstance, userdetail) {
    // console.log(userdetail);
    $scope.patientInfo = userdetail;
    // 关闭modal
    $scope.close = function(){
      $uibModalInstance.dismiss();
    };
    // 注销用户
    $scope.cancelUser = function(){
      $uibModalInstance.close("注销用户");
    }; 
    // 去除角色
    $scope.removeUserRoles = function(){
      $uibModalInstance.close("去除角色");
    };   
}])
// 保险人员--张桠童
.controller('insuranceOfficersCtrl', ['$scope', '$state', 'Storage', 'NgTableParams', '$timeout', '$uibModal', 'Alluser', 'Roles',
  function ($scope, $state, Storage, NgTableParams, $timeout, $uibModal, Alluser, Roles) {
    var token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI1OTEyZTllYmRjODNmNmE4YjdkY2JkZTgiLCJ1c2VySWQiOiJVMjAxNzAzMTQyMDE4Iiwicm9sZSI6InBhdGllbnQiLCJleHBpcmVBZnRlciI6MTQ5NzQwNzI2MzgzMywiaWF0IjoxNDk3NDA3MjYzfQ.5UITzg6NaHcIIEQESCLLB7mx_suISw9Bj6K1OBaiaDk';
    
    // -----------获取列表总条数------------------
    var getTotalNums = function (role1) {
      var countInfo = {
        token:token,
        role1:role1
      };
      console.log(countInfo)
      var promise = Alluser.getCount(countInfo);
      promise.then(function(data){
        console.log(data.results)
        $scope.totalNums = data.results;
      },function(){});
    }
    // ------------------------------------------- 

    // ---------------获取搜索(或未搜索)列表及列表数------------------------
    var getLists = function (currentPage,itemsPerPage,_userlist,role_count) {
      // 完善userlist
      var userlist = _userlist;
      userlist.token = token;
      userlist.limit = itemsPerPage;
      userlist.skip = (currentPage-1)*itemsPerPage;
      // 完善countInfo
      var countInfo = userlist;
      countInfo.role1 = role_count;
      if (userlist.role!=undefined) countInfo.role2 = userlist.role;
      // 获取总条目数
      console.log(countInfo)
      var promise = Alluser.getCount(countInfo);
      promise.then(function(data){
        console.log(data.results)
        $scope.totalItems = data.results;
      },function(){});
      // 获取搜索列表
      console.log(userlist)
      var promise = Alluser.getInsuranceList(userlist);
      promise.then(function(data){
        console.log(data.results);
        // 首先处理一下要显示的roles
        for (var i = 0; i<data.results.length; i++) {
          var roles = data.results[i].role;
          for(var j=0; j<roles.length; j++){
            if(roles[j]=="insuranceA"){
              data.results[i].role = "insuranceA";
            }
            if(roles[j]=="insuranceR"){
              data.results[i].role = "insuranceR";
            }
            if(roles[j]=="insuranceC"){
              data.results[i].role = "insuranceC";
            }
          }
        }
        $scope.tableParams = new NgTableParams({
                          count:10000
                      },
                      {   counts:[],
                          dataset: data.results
                      });
      },function(err){});
    }
    // ---------------------------------------------------------------------
    
    // 初始化列表
    getTotalNums(4);
    $scope.currentPage = 1;
    $scope.itemsPerPage = 50;
    $scope.userlist = {};
    getLists($scope.currentPage,$scope.itemsPerPage,$scope.userlist,4);
    
    // 页面改变
    $scope.pageChanged = function(){
      console.log($scope.currentPage);
      getLists($scope.currentPage,$scope.itemsPerPage,$scope.userlist,4);
    }
    // 当前页面的总条目数改变
    $scope.changeLimit=function(num){
      $scope.itemsPerPage = num;
      $scope.currentPage = 1;
      getLists($scope.currentPage,$scope.itemsPerPage,$scope.userlist,4);
    }
    // 搜索
    $scope.search_roles = [
      {id:'insuranceA',name:'沟通人员'},
      {id:'insuranceC',name:'保险主管'},
      {id:'insuranceR',name:'录入人员'}
    ];
    $scope.search_genders = [
      {id:1,name:"男"},
      {id:2,name:"女"}
    ];
    $scope.searchList = function () {
      console.log($scope.userlist)
      getLists($scope.currentPage,$scope.itemsPerPage,$scope.userlist,4);
    }
    // 清空搜索
    $scope.searchClear = function () {
      $scope.userlist = {};
      getLists($scope.currentPage,$scope.itemsPerPage,$scope.userlist,4);
    }
    // 监听事件(表单清空)
    $('#new_register').on('hidden.bs.modal',function(){
      $('#registerForm').formValidation('resetForm', true);
      $scope.registerInfo.phoneNo=undefined;
      $scope.registerInfo.password=undefined;
      $scope.registerInfo.role=undefined;
    })
    $('#new_perfect').on('hidden.bs.modal',function(){
      $('#perfectForm').formValidation('resetForm', true);
      $scope.newUserInfo.userId=undefined;
      $scope.newUserInfo.gender=undefined;
      $scope.newUserInfo.boardingTime=undefined;
      $scope.newUserInfo.workAmounts=undefined;
      $scope.newUserInfo.name=undefined;
    })
    $('#new_add').on('hidden.bs.modal',function(){
      $scope.userlist.name=undefined;
      $scope.addInfo.userId=undefined;
      $scope.addInfo.roles=undefined;
      $scope.userlist_search=undefined;
      $scope.flag = false;
    })
    $('#changeInfo').on('hidden.bs.modal',function(){
      $('#changeForm').formValidation('resetForm', true);
    })
    // 关闭modal控制
    $scope.modal_close = function(target){
      $(target).modal('hide');
      if(target=="#new_perfect"||target=="#changeInfo"){
        $scope.currentPage = 1;
        getTotalNums(4);
        getLists($scope.currentPage,$scope.itemsPerPage,$scope.userlist,4);
      };
      if(target=="#new_add"){
        $scope.flag = false;
      };
    };
    //注册新用户
    $scope.registerInfo = {};
    $scope.newUserInfo = {};
    $scope.register = function(){
      // console.log($scope.registerInfo.phoneNo);
      if ($scope.registerInfo.phoneNo!=undefined&&$scope.registerInfo.password!=undefined&&$scope.registerInfo.role!=undefined) {
        var promise = Alluser.register($scope.registerInfo);
        promise.then(function(data){
          // console.log(data);
          // 注册成功
          if(data.mesg=="Alluser Register Success!"){
            // 获取userId
            $scope.newUserInfo.userId = data.userNo;
            // 关闭注册modal
            $('#new_register').modal('hide');
            // 提示注册成功
            $('#registerSuccess').modal('show');
            $timeout(function(){
              // 提示完毕
              $('#registerSuccess').modal('hide');
              // 打开完善信息modal
              $('#new_perfect').modal('show');
            },1000);
          }
          // 注册失败(该用户已存在)
          else{
            // 提示注册失败
            $('#registerFailed').modal('show');
            $timeout(function(){
              $('#registerFailed').modal('hide');
            },1000);
          }
        },function(err){});
      } 
    };
    // 完善新用户信息
    $scope.perfect = function(){
      $scope.newUserInfo.token = token;
      $scope.newUserInfo.gender = parseInt($scope.newUserInfo.gender);
      // console.log($scope.newUserInfo);
      if ($scope.newUserInfo.userId!=undefined&&$scope.newUserInfo.gender!=undefined&&$scope.newUserInfo.boardingTime!=undefined&&$scope.newUserInfo.workAmounts!=undefined&&$scope.newUserInfo.name!=undefined&&$scope.newUserInfo.token!=undefined) {
        // 关闭完善信息modal
        $('#new_perfect').modal('hide');
        var promise = Alluser.modify($scope.newUserInfo);
        promise.then(function(data){
          // console.log(data);
          if(data.msg=="success!"){
            // 提示完善成功
            $('#perfectSuccess').modal('show');
            $timeout(function(){
              $('#perfectSuccess').modal('hide');
              // 提示完毕，刷新保险人员列表
              $scope.currentPage = 1;
              getTotalNums(4);
              getLists($scope.currentPage,$scope.itemsPerPage,$scope.userlist,4);
            },1000);
          }
        },function(err){});
      }
    };
    // 搜索用户
    $scope.userlist = {};
    $scope.userlist.token = token;
    $scope.searchUser = function(){
      // console.log($scope.userlist.name);
      if ($scope.userlist.name==undefined){
        $('#nameUndefined').modal('show');
          $timeout(function(){
            $('#nameUndefined').modal('hide');
          },1000);
      }
      else{
        $scope.flag = true;
        var promise = Alluser.getUserList($scope.userlist);
        promise.then(function(data){
          // console.log(data.results);
          $scope.userlist_search = data.results;
          // $scope.userId = "";
        },function(err){});
      }
    };
    // 添加角色
    $scope.addInfo = {};
    $scope.addRole = function(){
      // console.log($scope.addInfo.userId);
      // console.log($scope.addInfo.roles);
      if ($scope.addInfo.userId==undefined){
        $('#userIdUndefined').modal('show');
        $timeout(function(){
          $('#userIdUndefined').modal('hide');
        },1000);
      }
      else if ($scope.addInfo.roles==undefined){
        $('#rolesUndefined').modal('show');
        $timeout(function(){
          $('#rolesUndefined').modal('hide');
        },1000);
      }
      else {
        // 关闭添加角色modal
        $('#new_add').modal('hide');
        // 增加角色
        $scope.addInfo.token = token;
        var promise = Roles.addRoles($scope.addInfo);
        promise.then(function(data){
          console.log(data.mesg);
          if (data.mesg=="User Register Success!") {
            // 提示添加成功
            $('#addSuccess').modal('show');
            $timeout(function(){
              // 提示完毕，刷新保险人员列表
              $('#addSuccess').modal('hide');
              $scope.currentPage = 1;
              getTotalNums(4);
              getLists($scope.currentPage,$scope.itemsPerPage,$scope.userlist,4);
            },1000);
          } 
          else {
            // 提示添加失败
            $('#addFailed').modal('show');
            $timeout(function(){
              $('#addFailed').modal('hide');
            },1000);
          }
        },function(err){});
      }
    };
    //详细信息modal
    $scope.openDetail = function(userdetail){
      var modalInstance = $uibModal.open({
        animation: true,
        ariaLabelledBy: 'modal-title',
        ariaDescribedBy: 'modal-body',
        templateUrl: 'detail_insurance.html',
        controller: 'detail_insuranceCtrl',
        // size: 'sm',
        resolve: {
          userdetail: function () {
            return userdetail;
          }
        }
      });
      modalInstance.result.then(function(con){
        if (con=="删除用户") {
          // 确认是否删除
          $("#cancelOrNot").modal('show');
          // 给modal传参
          $scope.userdetail = userdetail;
        } 
        else if (con=="去除角色") {
          // 确认是否去除角色
          $("#removeOrNot").modal('show');
          // 给modal传参
          $scope.userdetail = userdetail;
        }
        else if (con=="修改信息") {
          // 修改用户信息方法的输入
          $scope.changeInfo = userdetail;
          $scope.changeInfo.token = token;
          // 打开修改保险人员信息modal
          $('#changeInfo').modal('show');
        }
      },function(){});
    };
    // 删除用户
    $scope.cancel = function(userdetail){
      // 关闭警告modal（是否删除）
      $("#cancelOrNot").modal('hide');
      // 删除用户输入
      var cancelUserinfo = {
        "userId":userdetail.userId,
        "token":token
      };
      // 删除该用户
      var promise = Alluser.cancelUser(cancelUserinfo);
      promise.then(function(data){
        // console.log(data);
        if (data.msg=="success!") {
          // 提示删除成功
          $('#cancelSuccess').modal('show');
          $timeout(function(){
            // 关闭提示
            $('#cancelSuccess').modal('hide');
            // 刷新保险人员列表
            $scope.currentPage = 1;
            getTotalNums(4);
            getLists($scope.currentPage,$scope.itemsPerPage,$scope.userlist,4);
          },1000);
        }
      },function(err){});
    };
    // 去除角色
    $scope.remove = function(userdetail){
      // 关闭警告（是否去除角色）
      $("#removeOrNot").modal('hide');
      // 去除角色方法输入
      var removeInfo = {
        "userId":userdetail.userId,
        "roles":userdetail.role,
        "token":token
      };
      // 去除该角色
      var promise = Roles.removeRoles(removeInfo);
      promise.then(function(data){
        // console.log(data);
        if (data.mesg=="User Register Success!") {
          // 提示去除成功
          $('#removeSuccess').modal('show');
          $timeout(function(){
            // 关闭提示
            $('#removeSuccess').modal('hide');
            // 刷新保险人员列表
            $scope.currentPage = 1;
            getTotalNums(4);
            getLists($scope.currentPage,$scope.itemsPerPage,$scope.userlist,4);
          },1000);
        };
      },function(err){});
    };
    // 修改用户信息
    $scope.change = function(){
      if ($scope.changeInfo.userId!=undefined&&$scope.changeInfo.gender!=undefined&&$scope.changeInfo.boardingTime!=undefined&&$scope.changeInfo.workAmounts!=undefined&&$scope.changeInfo.name!=undefined&&$scope.changeInfo.phoneNo!=undefined&&$scope.changeInfo.role!=undefined&&$scope.changeInfo.token!=undefined) {
        // 类型转换
        $scope.changeInfo.gender = parseInt($scope.changeInfo.gender);
        // console.log($scope.changeInfo);
        // 关闭修改信息modal
        $('#changeInfo').modal('hide');
        var promise = Alluser.modify($scope.changeInfo);
        promise.then(function(data){
          // console.log(data.msg);
          if (data.msg=="success!") {
            // 显示成功提示
            $('#changeSuccess').modal('show');
            $timeout(function(){
              $('#changeSuccess').modal('hide');
              // 提示完毕，刷新保险人员列表
              $scope.currentPage = 1;
              getTotalNums(4);
              getLists($scope.currentPage,$scope.itemsPerPage,$scope.userlist,4);
            },1000);
          }
        },function(err){});
      }
    };
}])
// 保险人员--详细信息modal--张桠童
.controller('detail_insuranceCtrl', ['$scope', '$state', 'Storage', 'NgTableParams', '$timeout', '$uibModal', 'Alluser', '$uibModalInstance', 'userdetail', 
  function ($scope, $state, Storage, NgTableParams, $timeout, $uibModal, Alluser, $uibModalInstance, userdetail) {
    // console.log(userdetail);
    $scope.insuranceInfo = userdetail;
    // 关闭modal
    $scope.close = function(){
      $uibModalInstance.dismiss();
    };
    // 删除用户
    $scope.cancelUser = function(){
      $uibModalInstance.close("删除用户");
    }; 
    // 去除角色
    $scope.removeUserRoles = function(){
      $uibModalInstance.close("去除角色");
    };  
    // 修改信息
    $scope.changeInfo = function(){
      $uibModalInstance.close("修改信息");
    };  
}])
// 健康专员--张桠童
.controller('healthOfficersCtrl', ['$scope', '$state', 'Storage', 'NgTableParams', '$timeout', '$uibModal', 'Alluser', 'Roles',
  function ($scope, $state, Storage, NgTableParams, $timeout, $uibModal, Alluser, Roles) {
    var token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI1OTEyZTllYmRjODNmNmE4YjdkY2JkZTgiLCJ1c2VySWQiOiJVMjAxNzAzMTQyMDE4Iiwicm9sZSI6InBhdGllbnQiLCJleHBpcmVBZnRlciI6MTQ5NzQwNzI2MzgzMywiaWF0IjoxNDk3NDA3MjYzfQ.5UITzg6NaHcIIEQESCLLB7mx_suISw9Bj6K1OBaiaDk';
    
    // -----------获取列表总条数------------------
    var getTotalNums = function (role1) {
      var countInfo = {
        token:token,
        role1:role1
      };
      console.log(countInfo)
      var promise = Alluser.getCount(countInfo);
      promise.then(function(data){
        console.log(data.results)
        $scope.totalNums = data.results;
      },function(){});
    }
    // ------------------------------------------- 

    // ---------------获取搜索(或未搜索)列表及列表数------------------------
    var getLists = function (currentPage,itemsPerPage,_userlist,role_count) {
      // 完善userlist
      var userlist = _userlist;
      userlist.token = token;
      userlist.limit = itemsPerPage;
      userlist.skip = (currentPage-1)*itemsPerPage;
      // 完善countInfo
      var countInfo = userlist;
      countInfo.role1 = role_count;
      if (userlist.role!=undefined) countInfo.role2 = userlist.role;
      // 获取总条目数
      console.log(countInfo)
      var promise = Alluser.getCount(countInfo);
      promise.then(function(data){
        console.log(data.results)
        $scope.totalItems = data.results;
      },function(){});
      // 获取搜索列表
      console.log(userlist)
      var promise = Alluser.getHealthList(userlist);
      promise.then(function(data){
        console.log(data.results);
        $scope.tableParams = new NgTableParams({
                          count:10000
                      },
                      {   counts:[],
                          dataset: data.results
                      });
      },function(err){});
    }
    // ---------------------------------------------------------------------
    
    // 初始化列表
    getTotalNums(5);
    $scope.currentPage = 1;
    $scope.itemsPerPage = 50;
    $scope.userlist = {};
    getLists($scope.currentPage,$scope.itemsPerPage,$scope.userlist,5);
    
    // 页面改变
    $scope.pageChanged = function(){
      console.log($scope.currentPage);
      getLists($scope.currentPage,$scope.itemsPerPage,$scope.userlist,5);
    }
    // 当前页面的总条目数改变
    $scope.changeLimit=function(num){
      $scope.itemsPerPage = num;
      $scope.currentPage = 1;
      getLists($scope.currentPage,$scope.itemsPerPage,$scope.userlist,5);
    }
    // 搜索
    $scope.search_genders = [
      {id:1,name:"男"},
      {id:2,name:"女"}
    ];
    $scope.searchList = function () {
      console.log($scope.userlist)
      getLists($scope.currentPage,$scope.itemsPerPage,$scope.userlist,5);
    }
    // 清空搜索
    $scope.searchClear = function () {
      $scope.userlist = {};
      getLists($scope.currentPage,$scope.itemsPerPage,$scope.userlist,5);
    }
    // 监听事件(表单清空)
    $('#new_register').on('hidden.bs.modal',function(){
      $('#registerForm').formValidation('resetForm', true);
      $scope.registerInfo.phoneNo=undefined;
      $scope.registerInfo.password=undefined;
    })
    $('#new_perfect').on('hidden.bs.modal',function(){
      $('#perfectForm').formValidation('resetForm', true);
      $scope.newUserInfo.userId=undefined;
      $scope.newUserInfo.gender=undefined;
      $scope.newUserInfo.boardingTime=undefined;
      $scope.newUserInfo.workAmounts=undefined;
      $scope.newUserInfo.name=undefined;
    })
    $('#new_add').on('hidden.bs.modal',function(){
      $scope.userlist.name=undefined;
      $scope.addInfo.userId=undefined;
      $scope.userlist_search=undefined;
      $scope.flag = false;
    })
    $('#changeInfo').on('hidden.bs.modal',function(){
      $('#changeForm').formValidation('resetForm', true);
    })
    // 关闭modal控制
    $scope.modal_close = function(target){
      $(target).modal('hide');
      if(target=="#new_perfect"||target=="#changeInfo"){
        $scope.currentPage = 1;
        getTotalNums(5);
        getLists($scope.currentPage,$scope.itemsPerPage,$scope.userlist,5);
      };
      if(target=="#new_add"){
        $scope.flag = false;
      };
    };
    // 注册新用户
    $scope.registerInfo = {};
    $scope.registerInfo.role = 'health';
    $scope.newUserInfo = {};
    $scope.register = function(){
      console.log(1);
      console.log($scope.registerInfo.phoneNo);
      if ($scope.registerInfo.phoneNo!=undefined&&$scope.registerInfo.password!=undefined) {
        var promise = Alluser.register($scope.registerInfo);
        promise.then(function(data){
          // console.log(data);
          // 注册成功
          if(data.mesg=="Alluser Register Success!"){
            // 获取userId
            $scope.newUserInfo.userId = data.userNo;
            // 关闭注册modal
            $('#new_register').modal('hide');
            // 提示注册成功
            $('#registerSuccess').modal('show');
            $timeout(function(){
              // 提示完毕
              $('#registerSuccess').modal('hide');
              // 打开完善信息modal
              $('#new_perfect').modal('show');
            },1000);
          }
          // 注册失败(该用户已存在)
          else{
            // 提示注册失败
            $('#registerFailed').modal('show');
            $timeout(function(){
              $('#registerFailed').modal('hide');
            },1000);
          }
        },function(err){});
      } 
    };
    // 完善新用户信息
    $scope.perfect = function(){
      $scope.newUserInfo.token = token;
      $scope.newUserInfo.gender = parseInt($scope.newUserInfo.gender);
      // console.log($scope.newUserInfo);
      if ($scope.newUserInfo.userId!=undefined&&$scope.newUserInfo.gender!=undefined&&$scope.newUserInfo.boardingTime!=undefined&&$scope.newUserInfo.workAmounts!=undefined&&$scope.newUserInfo.name!=undefined&&$scope.newUserInfo.token!=undefined) {
        // 关闭完善信息modal
        $('#new_perfect').modal('hide');
        var promise = Alluser.modify($scope.newUserInfo);
        promise.then(function(data){
          // console.log(data);
          if(data.msg=="success!"){
            // 提示完善成功
            $('#perfectSuccess').modal('show');
            $timeout(function(){
              $('#perfectSuccess').modal('hide');
              // 提示完毕，刷新健康专员列表
              $scope.currentPage = 1;
              getTotalNums(5);
              getLists($scope.currentPage,$scope.itemsPerPage,$scope.userlist,5);
            },1000);
          }
        },function(err){});
      }
    };
    // 搜索用户
    $scope.userlist = {};
    $scope.userlist.token = token;
    $scope.searchUser = function(){
      // console.log($scope.userlist.name);
      if ($scope.userlist.name==undefined){
        $('#nameUndefined').modal('show');
        $timeout(function(){
          $('#nameUndefined').modal('hide');
        },1000);
      }
      else{
        $scope.flag = true;
        var promise = Alluser.getUserList($scope.userlist);
        promise.then(function(data){
          // console.log(data.results);
          $scope.userlist_search = data.results;
          // $scope.userId = "";
        },function(err){});
      }
    };
    // 添加角色
    $scope.addInfo = {};
    $scope.addInfo.roles = 'health';
    $scope.addRole = function(){
      // console.log($scope.addInfo.userId);
      // console.log($scope.addInfo.roles);
      if ($scope.addInfo.userId==undefined){
        $('#userIdUndefined').modal('show');
        $timeout(function(){
          $('#userIdUndefined').modal('hide');
        },1000);
      }
      else {
        // 关闭添加角色modal
        $('#new_add').modal('hide');
        // 增加角色
        $scope.addInfo.token = token;
        var promise = Roles.addRoles($scope.addInfo);
        promise.then(function(data){
          console.log(data.mesg);
          if (data.mesg=="User Register Success!") {
            // 提示添加成功
            $('#addSuccess').modal('show');
            $timeout(function(){
              // 提示完毕，刷新健康专员列表
              $('#addSuccess').modal('hide');
              $scope.currentPage = 1;
              getTotalNums(5);
              getLists($scope.currentPage,$scope.itemsPerPage,$scope.userlist,5);
            },1000);
          } 
          else {
            // 提示添加失败
            $('#addFailed').modal('show');
            $timeout(function(){
              $('#addFailed').modal('hide');
            },1000);
          }
        },function(err){});
      }
    };
    //详细信息modal
    $scope.openDetail = function(userdetail){
      var modalInstance = $uibModal.open({
        animation: true,
        ariaLabelledBy: 'modal-title',
        ariaDescribedBy: 'modal-body',
        templateUrl: 'detail_health.html',
        controller: 'detail_healthCtrl',
        // size: 'sm',
        resolve: {
          userdetail: function () {
            return userdetail;
          }
        }
      });
      modalInstance.result.then(function(con){
        if (con=="删除用户") {
          // 确认是否删除
          $("#cancelOrNot").modal('show');
          // 给modal传参
          $scope.userdetail = userdetail;
        } 
        else if (con=="去除角色") {
          // 确认是否去除角色
          $("#removeOrNot").modal('show');
          // 给modal传参
          $scope.userdetail = userdetail;
        }
        else if (con=="修改信息") {
          // 修改用户信息方法的输入
          $scope.changeInfo = userdetail;
          $scope.changeInfo.token = token;
          // 打开修改保险人员信息modal
          $('#changeInfo').modal('show');
        }
      },function(){});
    };
    // 删除用户
    $scope.cancel = function(userdetail){
      // 关闭警告modal（是否删除）
      $("#cancelOrNot").modal('hide');
      // 删除用户输入
      var cancelUserinfo = {
        "userId":userdetail.userId,
        "token":token
      };
      // 删除该用户
      var promise = Alluser.cancelUser(cancelUserinfo);
      promise.then(function(data){
        // console.log(data);
        if (data.msg=="success!") {
          // 提示删除成功
          $('#cancelSuccess').modal('show');
          $timeout(function(){
            // 关闭提示
            $('#cancelSuccess').modal('hide');
            // 刷新健康专员列表
            $scope.currentPage = 1;
            getTotalNums(5);
            getLists($scope.currentPage,$scope.itemsPerPage,$scope.userlist,5);
          },1000);
        }
      },function(err){});
    };
    // 去除角色
    $scope.remove = function(userdetail){
      // 关闭警告（是否去除角色）
      $("#removeOrNot").modal('hide');
      // 去除角色方法输入
      var removeInfo = {
        "userId":userdetail.userId,
        "roles":'health',
        "token":token
      };
      // 去除该角色
      var promise = Roles.removeRoles(removeInfo);
      promise.then(function(data){
        // console.log(data);
        if (data.mesg=="User Register Success!") {
          // 提示去除成功
          $('#removeSuccess').modal('show');
          $timeout(function(){
            // 关闭提示
            $('#removeSuccess').modal('hide');
            // 刷新健康专员列表
            $scope.currentPage = 1;
            getTotalNums(5);
            getLists($scope.currentPage,$scope.itemsPerPage,$scope.userlist,5);
          },1000);
        };
      },function(err){});
    };
    // 修改用户信息
    $scope.change = function(){
      if ($scope.changeInfo.userId!=undefined&&$scope.changeInfo.gender!=undefined&&$scope.changeInfo.boardingTime!=undefined&&$scope.changeInfo.workAmounts!=undefined&&$scope.changeInfo.name!=undefined&&$scope.changeInfo.phoneNo!=undefined&&$scope.changeInfo.token!=undefined) {
        // 类型转换
        $scope.changeInfo.gender = parseInt($scope.changeInfo.gender);
        // console.log($scope.changeInfo);
        // 关闭修改信息modal
        $('#changeInfo').modal('hide');
        var promise = Alluser.modify($scope.changeInfo);
        promise.then(function(data){
          // console.log(data.msg);
          if (data.msg=="success!") {
            // 显示成功提示
            $('#changeSuccess').modal('show');
            $timeout(function(){
              $('#changeSuccess').modal('hide');
              // 提示完毕，刷新健康专员列表
              $scope.currentPage = 1;
              getTotalNums(5);
              getLists($scope.currentPage,$scope.itemsPerPage,$scope.userlist,5);
            },1000);
          }
        },function(err){});
      }
    };
}])
// 健康专员--详细信息modal--张桠童
.controller('detail_healthCtrl', ['$scope', '$state', 'Storage', 'NgTableParams', '$timeout', '$uibModal', 'Alluser', '$uibModalInstance', 'userdetail', 
  function ($scope, $state, Storage, NgTableParams, $timeout, $uibModal, Alluser, $uibModalInstance, userdetail) {
    // console.log(userdetail);
    $scope.healthInfo = userdetail;
    // 关闭modal
    $scope.close = function(){
      $uibModalInstance.dismiss();
    };
    // 删除用户
    $scope.cancelUser = function(){
      $uibModalInstance.close("删除用户");
    }; 
    // 去除角色
    $scope.removeUserRoles = function(){
      $uibModalInstance.close("去除角色");
    };  
    // 修改信息
    $scope.changeInfo = function(){
      $uibModalInstance.close("修改信息");
    };  
}])
// 管理员--张桠童
.controller('administratorsCtrl', ['$scope', '$state', 'Storage', 'NgTableParams', '$timeout', '$uibModal', 'Alluser', 'Roles',
  function ($scope, $state, Storage, NgTableParams, $timeout, $uibModal, Alluser, Roles) {
    var token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI1OTEyZTllYmRjODNmNmE4YjdkY2JkZTgiLCJ1c2VySWQiOiJVMjAxNzAzMTQyMDE4Iiwicm9sZSI6InBhdGllbnQiLCJleHBpcmVBZnRlciI6MTQ5NzQwNzI2MzgzMywiaWF0IjoxNDk3NDA3MjYzfQ.5UITzg6NaHcIIEQESCLLB7mx_suISw9Bj6K1OBaiaDk';
    
    // -----------获取列表总条数------------------
    var getTotalNums = function (role1) {
      var countInfo = {
        token:token,
        role1:role1
      };
      console.log(countInfo)
      var promise = Alluser.getCount(countInfo);
      promise.then(function(data){
        console.log(data.results)
        $scope.totalNums = data.results;
      },function(){});
    }
    // ------------------------------------------- 

    // ---------------获取搜索(或未搜索)列表及列表数------------------------
    var getLists = function (currentPage,itemsPerPage,_userlist,role_count) {
      // 完善userlist
      var userlist = _userlist;
      userlist.token = token;
      userlist.limit = itemsPerPage;
      userlist.skip = (currentPage-1)*itemsPerPage;
      // 完善countInfo
      var countInfo = userlist;
      countInfo.role1 = role_count;
      if (userlist.role!=undefined) countInfo.role2 = userlist.role;
      // 获取总条目数
      console.log(countInfo)
      var promise = Alluser.getCount(countInfo);
      promise.then(function(data){
        console.log(data.results)
        $scope.totalItems = data.results;
      },function(){});
      // 获取搜索列表
      console.log(userlist)
      var promise = Alluser.getAdminList(userlist);
      promise.then(function(data){
        console.log(data.results);
        $scope.tableParams = new NgTableParams({
                          count:10000
                      },
                      {   counts:[],
                          dataset: data.results
                      });
      },function(err){});
    }
    // ---------------------------------------------------------------------
    
    // 初始化列表
    getTotalNums(6);
    $scope.currentPage = 1;
    $scope.itemsPerPage = 50;
    $scope.userlist = {};
    getLists($scope.currentPage,$scope.itemsPerPage,$scope.userlist,6);
    
    // 页面改变
    $scope.pageChanged = function(){
      console.log($scope.currentPage);
      getLists($scope.currentPage,$scope.itemsPerPage,$scope.userlist,6);
    }
    // 当前页面的总条目数改变
    $scope.changeLimit=function(num){
      $scope.itemsPerPage = num;
      $scope.currentPage = 1;
      getLists($scope.currentPage,$scope.itemsPerPage,$scope.userlist,6);
    }
    // 搜索
    $scope.search_genders = [
      {id:1,name:"男"},
      {id:2,name:"女"}
    ];
    $scope.searchList = function () {
      console.log($scope.userlist)
      getLists($scope.currentPage,$scope.itemsPerPage,$scope.userlist,6);
    }
    // 清空搜索
    $scope.searchClear = function () {
      $scope.userlist = {};
      getLists($scope.currentPage,$scope.itemsPerPage,$scope.userlist,6);
    }
    // 监听事件(表单清空)
    $('#new_register').on('hidden.bs.modal',function(){
      $('#registerForm').formValidation('resetForm', true);
      $scope.registerInfo.phoneNo=undefined;
      $scope.registerInfo.password=undefined;
    })
    $('#new_perfect').on('hidden.bs.modal',function(){
      $('#perfectForm').formValidation('resetForm', true);
      $scope.newUserInfo.userId=undefined;
      $scope.newUserInfo.gender=undefined;
      $scope.newUserInfo.creationTime=undefined;
      $scope.newUserInfo.workUnit=undefined;
      $scope.newUserInfo.name=undefined;
    })
    $('#new_add').on('hidden.bs.modal',function(){
      $scope.userlist.name=undefined;
      $scope.addInfo.userId=undefined;
      $scope.userlist_search=undefined;
      $scope.flag = false;
    })
    $('#changeInfo').on('hidden.bs.modal',function(){
      $('#changeForm').formValidation('resetForm', true);
    })
    // 关闭modal控制
    $scope.modal_close = function(target){
      $(target).modal('hide');
      if(target=="#new_perfect"||target=="#changeInfo"){
        $scope.currentPage = 1;
        getTotalNums(6);
        getLists($scope.currentPage,$scope.itemsPerPage,$scope.userlist,6);
      };
      if(target=="#new_add"){
        $scope.flag = false;
      };
    };
    // 注册新用户
    $scope.registerInfo = {};
    $scope.registerInfo.role = 'admin';
    $scope.newUserInfo = {};
    $scope.register = function(){
      console.log(1);
      console.log($scope.registerInfo.phoneNo);
      if ($scope.registerInfo.phoneNo!=undefined&&$scope.registerInfo.password!=undefined) {
        var promise = Alluser.register($scope.registerInfo);
        promise.then(function(data){
          // console.log(data);
          // 注册成功
          if(data.mesg=="Alluser Register Success!"){
            // 获取userId
            $scope.newUserInfo.userId = data.userNo;
            // 关闭注册modal
            $('#new_register').modal('hide');
            // 提示注册成功
            $('#registerSuccess').modal('show');
            $timeout(function(){
              // 提示完毕
              $('#registerSuccess').modal('hide');
              // 打开完善信息modal
              $('#new_perfect').modal('show');
            },1000);
          }
          // 注册失败(该用户已存在)
          else{
            // 提示注册失败
            $('#registerFailed').modal('show');
            $timeout(function(){
              $('#registerFailed').modal('hide');
            },1000);
          }
        },function(err){});
      } 
    };
    // 完善新用户信息
    $scope.perfect = function(){
      $scope.newUserInfo.token = token;
      $scope.newUserInfo.gender = parseInt($scope.newUserInfo.gender);
      // console.log($scope.newUserInfo);
      if ($scope.newUserInfo.userId!=undefined&&$scope.newUserInfo.gender!=undefined&&$scope.newUserInfo.creationTime!=undefined&&$scope.newUserInfo.workUnit!=undefined&&$scope.newUserInfo.name!=undefined&&$scope.newUserInfo.token!=undefined) {
        // 关闭完善信息modal
        $('#new_perfect').modal('hide');
        var promise = Alluser.modify($scope.newUserInfo);
        promise.then(function(data){
          // console.log(data);
          if(data.msg=="success!"){
            // 提示完善成功
            $('#perfectSuccess').modal('show');
            $timeout(function(){
              $('#perfectSuccess').modal('hide');
              // 提示完毕，刷新管理员列表
              $scope.currentPage = 1;
              getTotalNums(6);
              getLists($scope.currentPage,$scope.itemsPerPage,$scope.userlist,6);
            },1000);
          }
        },function(err){});
      }
    };
    // 搜索用户
    $scope.userlist = {};
    $scope.userlist.token = token;
    $scope.searchUser = function(){
      // console.log($scope.userlist.name);
      if ($scope.userlist.name==undefined){
        $('#nameUndefined').modal('show');
        $timeout(function(){
          $('#nameUndefined').modal('hide');
        },1000);
      }
      else{
        $scope.flag = true;
        var promise = Alluser.getUserList($scope.userlist);
        promise.then(function(data){
          // console.log(data.results);
          $scope.userlist_search = data.results;
          // $scope.userId = "";
        },function(err){});
      }
    };
    // 添加角色
    $scope.addInfo = {};
    $scope.addInfo.roles = 'admin';
    $scope.addRole = function(){
      // console.log($scope.addInfo.userId);
      // console.log($scope.addInfo.roles);
      if ($scope.addInfo.userId==undefined){
        $('#userIdUndefined').modal('show');
        $timeout(function(){
          $('#userIdUndefined').modal('hide');
        },1000);
      }
      else {
        // 关闭添加角色modal
        $('#new_add').modal('hide');
        // 增加角色
        $scope.addInfo.token = token;
        var promise = Roles.addRoles($scope.addInfo);
        promise.then(function(data){
          console.log(data.mesg);
          if (data.mesg=="User Register Success!") {
            // 提示添加成功
            $('#addSuccess').modal('show');
            $timeout(function(){
              // 提示完毕，刷新管理员列表
              $('#addSuccess').modal('hide');
              $scope.currentPage = 1;
              getTotalNums(6);
              getLists($scope.currentPage,$scope.itemsPerPage,$scope.userlist,6);
            },1000);
          } 
          else {
            // 提示添加失败
            $('#addFailed').modal('show');
            $timeout(function(){
              $('#addFailed').modal('hide');
            },1000);
          }
        },function(err){});
      }
    };
    // 详细信息modal
    $scope.openDetail = function(userdetail){
      var modalInstance = $uibModal.open({
        animation: true,
        ariaLabelledBy: 'modal-title',
        ariaDescribedBy: 'modal-body',
        templateUrl: 'detail_admin.html',
        controller: 'detail_adminCtrl',
        // size: 'sm',
        resolve: {
          userdetail: function () {
            return userdetail;
          }
        }
      });
      modalInstance.result.then(function(con){
        if (con=="删除用户") {
          // 确认是否删除
          $("#cancelOrNot").modal('show');
          // 给modal传参
          $scope.userdetail = userdetail;
        } 
        else if (con=="去除角色") {
          // 确认是否去除角色
          $("#removeOrNot").modal('show');
          // 给modal传参
          $scope.userdetail = userdetail;
        }
        else if (con=="修改信息") {
          // 修改用户信息方法的输入
          $scope.changeInfo = userdetail;
          $scope.changeInfo.token = token;
          // 打开修改保险人员信息modal
          $('#changeInfo').modal('show');
        }
      },function(){});
    };
    // 删除用户
    $scope.cancel = function(userdetail){
      // 关闭警告modal（是否删除）
      $("#cancelOrNot").modal('hide');
      // 删除用户输入
      var cancelUserinfo = {
        "userId":userdetail.userId,
        "token":token
      };
      // 删除该用户
      var promise = Alluser.cancelUser(cancelUserinfo);
      promise.then(function(data){
        // console.log(data);
        if (data.msg=="success!") {
          // 提示删除成功
          $('#cancelSuccess').modal('show');
          $timeout(function(){
            // 关闭提示
            $('#cancelSuccess').modal('hide');
            // 刷新管理员列表
            $scope.currentPage = 1;
            getTotalNums(6);
            getLists($scope.currentPage,$scope.itemsPerPage,$scope.userlist,6);
          },1000);
        }
      },function(err){});
    };
    // 去除角色
    $scope.remove = function(userdetail){
      // 关闭警告（是否去除角色）
      $("#removeOrNot").modal('hide');
      // 去除角色方法输入
      var removeInfo = {
        "userId":userdetail.userId,
        "roles":'admin',
        "token":token
      };
      // 去除该角色
      var promise = Roles.removeRoles(removeInfo);
      promise.then(function(data){
        // console.log(data);
        if (data.mesg=="User Register Success!") {
          // 提示去除成功
          $('#removeSuccess').modal('show');
          $timeout(function(){
            // 关闭提示
            $('#removeSuccess').modal('hide');
            // 刷新管理员列表
            $scope.currentPage = 1;
            getTotalNums(6);
            getLists($scope.currentPage,$scope.itemsPerPage,$scope.userlist,6);
          },1000);
        };
      },function(err){});
    };
    // 修改用户信息
    $scope.change = function(){
      if ($scope.changeInfo.userId!=undefined&&$scope.changeInfo.gender!=undefined&&$scope.changeInfo.creationTime!=undefined&&$scope.changeInfo.workUnit!=undefined&&$scope.changeInfo.name!=undefined&&$scope.changeInfo.phoneNo!=undefined&&$scope.changeInfo.token!=undefined) {
        // 类型转换
        $scope.changeInfo.gender = parseInt($scope.changeInfo.gender);
        // console.log($scope.changeInfo);
        // 关闭修改信息modal
        $('#changeInfo').modal('hide');
        var promise = Alluser.modify($scope.changeInfo);
        promise.then(function(data){
          // console.log(data.msg);
          if (data.msg=="success!") {
            // 显示成功提示
            $('#changeSuccess').modal('show');
            $timeout(function(){
              $('#changeSuccess').modal('hide');
              // 提示完毕，刷新管理员列表
              $scope.currentPage = 1;
              getTotalNums(6);
              getLists($scope.currentPage,$scope.itemsPerPage,$scope.userlist,6);
            },1000);
          }
        },function(err){});
      }
    };
}])
// 管理员--详细信息modal--张桠童
.controller('detail_adminCtrl', ['$scope', '$state', 'Storage', 'NgTableParams', '$timeout', '$uibModal', 'Alluser', '$uibModalInstance', 'userdetail', 
  function ($scope, $state, Storage, NgTableParams, $timeout, $uibModal, Alluser, $uibModalInstance, userdetail) {
    // console.log(userdetail);
    $scope.adminInfo = userdetail;
    // 关闭modal
    $scope.close = function(){
      $uibModalInstance.dismiss();
    };
    // 删除用户
    $scope.cancelUser = function(){
      $uibModalInstance.close("删除用户");
    }; 
    // 去除角色
    $scope.removeUserRoles = function(){
      $uibModalInstance.close("去除角色");
    };  
    // 修改信息
    $scope.changeInfo = function(){
      $uibModalInstance.close("修改信息");
    };  
}])