'use strict'

angular.module('Kidney_Web', ['ui.router', 'ui.bootstrap', 'controllers', 'services', 'filters', 'directives', 'ngTable', 'ngMdIcons', 'checklist-model'])

    .config(['$stateProvider', '$urlRouterProvider', function($stateProvider, $urlRouterProvider) {
        $urlRouterProvider.otherwise('/login')
        $stateProvider
            // 登陆, 'checklist-model'
            .state('login', {
                url: '/login',
                templateUrl: 'templates/login.html',
                controller: 'LoginCtrl'
                // cache:false,
            })
            .state('main', {
                url: '/main',
                templateUrl: 'templates/main.html',
                controller: 'MainCtrl'
            })
            .state('main.checkornot', {
                abstract: true,
                url: '/checkornot',
                templateUrl: 'templates/main/checkornot.html',
                controller: 'CheckOrNotCtrl'
            })
            .state('main.checkornot.checked', {
                url: '/checked',
                templateUrl: 'templates/main/checkornot/checked.html',
                controller: 'CheckedCtrl'
            })
            .state('main.checkornot.unchecked', {
                url: '/unchecked',
                templateUrl: 'templates/main/checkornot/unchecked.html',
                controller: 'UncheckedCtrl'
            })
            .state('main.checkornot.rejected', {
                url: '/rejected',
                templateUrl: 'templates/main/checkornot/rejected.html',
                controller: 'RejectedCtrl'
            })

            // 患者退款页面
            .state('main.patrefund', {
                abstract: true,
                url: '/patrefund',
                templateUrl: 'templates/main/patrefund.html',
                controller: 'PatrefundCtrl'
            })
            .state('main.patrefund.refundprocessed', {
                url: '/refundprocessed',
                templateUrl: 'templates/main/patrefund/refundprocessed.html',
                controller: 'RefundprocessedCtrl'
            })
            .state('main.patrefund.refundtoprocess', {
                url: '/refundtoprocess',
                templateUrl: 'templates/main/patrefund/refundtoprocess.html',
                controller: 'RefundtoprocessCtrl'
            })
            .state('main.patrefund.refundtonotice', {
                url: '/refundtonotice',
                templateUrl: 'templates/main/patrefund/refundtonotice.html',
                controller: 'RefundtonoticeCtrl'
            })

            // 用户建议页面
            .state('main.adviceindex', {
                url: '/adviceindex',
                templateUrl: 'templates/main/adviceindex.html',
                controller: 'AdviceindexCtrl'

            })
            .state('main.adviceindex.advice', {
                url: '/advice',
                templateUrl: 'templates/main/advice/advice.html',
                controller: 'AdviceCtrl'
            })

            //主页
            .state('homepage', {
                url: '/homepage',
                templateUrl: 'templates/homepage.html',
                controller: 'homepageCtrl'
            })


            // 保险人员页面
            .state('main.insumanage', {
                url: '/insumanage',
                templateUrl: 'templates/main/insumanage.html',
                controller: 'insumanageCtrl'
            })
            .state('main.insumanage.insuAmanage', {
                url: '/insuAmanage',
                templateUrl: 'templates/main/insumanage/insuAmanage.html',
                controller: 'insuAmanageCtrl'
            })
            .state('main.insumanage.insupatmanage', {
                url: '/insupatmanage',
                templateUrl: 'templates/main/insumanage/insupatmanage.html',
                controller: 'insupatmanageCtrl'
            })

            // 地区/科室管理
            .state('main.distrdepmanage', {
                url: '/distrdepmanage',
                templateUrl: 'templates/main/distrdepmanage.html',
                controller: 'distrdepmanageCtrl'
            })
            .state('main.distrdepmanage.districts', {
                url: '/districts',
                templateUrl: 'templates/main/distrdepmanage/districts.html',
                controller: 'districtsCtrl'
            })
            .state('main.distrdepmanage.departments', {
                url: '/departments',
                templateUrl: 'templates/main/distrdepmanage/departments.html',
                controller: 'departmentsCtrl'
            })

            // 数据监控
            .state('main.datamanage', {
                url: '/datamanage',
                templateUrl: 'templates/main/datamanage.html',
                controller: 'datamanageCtrl'
            })
            .state('main.datamanage.evaluation', {
                url: '/evaluation',
                templateUrl: 'templates/main/datamanage/evaluation.html',
                controller: 'evaluationCtrl'
            })
            .state('main.datamanage.trend', {
                url: '/trend',
                templateUrl: 'templates/main/datamanage/trend.html',
                controller: 'trendCtrl'
            })
            .state('main.datamanage.charge', {
                url: '/charge',
                templateUrl: 'templates/main/datamanage/charge.html',
                controller: 'chargeCtrl'
            })
            .state('main.datamanage.workload', {
                url: '/workload',
                templateUrl: 'templates/main/datamanage/workload.html',
                controller: 'workloadCtrl'
            })
            .state('main.datamanage.overtime', {
                url: '/overtime',
                templateUrl: 'templates/main/datamanage/overtime.html',
                controller: 'overtimeCtrl'
            })
            .state('main.datamanage.region', {
                url: '/region',
                templateUrl: 'templates/main/datamanage/region.html',
                controller: 'regionCtrl'
            })

            .state('main.datamanage.Pattrend', {
                url: '/Pattrend',
                templateUrl: 'templates/main/datamanage/Pattrend.html',
                controller: 'PattrendCtrl'
            })
            .state('main.datamanage.Patgroup', {
                url: '/Patgroup',
                templateUrl: 'templates/main/datamanage/Patgroup.html',
                controller: 'PatgroupCtrl'
            })
            .state('main.datamanage.Patregion', {
                url: '/Patregion',
                templateUrl: 'templates/main/datamanage/Patregion.html',
                controller: 'PatregionCtrl'
            })
            .state('main.datamanage.Patinsurance', {
                url: '/Patinsurance',
                templateUrl: 'templates/main/datamanage/Patinsurance.html',
                controller: 'PatinsuranceCtrl'
            })
            .state('main.doctorlicense', {
                url: '/doctorlicense',
                templateUrl: 'templates/main/doctorlicense.html',
                controller: 'DoctorLicenseCtrl'
            })
            .state('main.usermanage', {
                abstract: true,
                url: '/usermanage',
                templateUrl: 'templates/main/usermanage.html',
                controller: 'UserManageCtrl'
            })
            .state('main.usermanage.allUsers', {
                // cache:'false',
                url: '/allUsers',
                templateUrl: 'templates/main/usermanage/allUsers.html',
                controller: 'allUsersCtrl'
            })
            .state('main.usermanage.doctors', {
                url: '/doctors',
                templateUrl: 'templates/main/usermanage/doctors.html',
                controller: 'doctorsCtrl'
            })
            .state('main.usermanage.nurses', {
                url: '/nurses',
                templateUrl: 'templates/main/usermanage/nurses.html',
                controller: 'nursesCtrl'
            })
            .state('main.usermanage.patients', {
                url: '/patients',
                templateUrl: 'templates/main/usermanage/patients.html',
                controller: 'patientsCtrl'
            })
            .state('main.usermanage.insuranceOfficers', {
                url: '/insuranceOfficers',
                templateUrl: 'templates/main/usermanage/insuranceOfficers.html',
                controller: 'insuranceOfficersCtrl'
            })
            .state('main.usermanage.healthOfficers', {
                url: '/healthOfficers',
                templateUrl: 'templates/main/usermanage/healthOfficers.html',
                controller: 'healthOfficersCtrl'
            })
            .state('main.usermanage.administrators', {
                url: '/administrators',
                templateUrl: 'templates/main/usermanage/administrators.html',
                controller: 'administratorsCtrl'
            })
            .state('main.enterornot', {
                abstract: true,
                url: '/enterornot',
                templateUrl: 'templates/main/enterornot.html',
                controller: 'EnterOrNotCtrl'
            })
            .state('main.enterornot.entered', {
                url: '/entered',
                templateUrl: 'templates/main/enterornot/entered.html',
                controller: 'EnteredCtrl'
            })
            .state('main.enterornot.unentered', {
                url: '/unentered',
                templateUrl: 'templates/main/enterornot/unentered.html',
                controller: 'UnenteredCtrl'
            })
            .state('main.enterornot.all', {
                url: '/all',
                templateUrl: 'templates/main/enterornot/all.html',
                controller: 'AllCtrl'
            })
            .state('main.labinfo', {
                url: '/labinfo',
                templateUrl: 'templates/main/labinfo.html',
                controller: 'LabInfoCtrl'
            })
            .state('main.patientlabinfo', {
                url: '/patientlabinfo',
                templateUrl: 'templates/main/patientlabinfo.html',
                controller: 'PatientLabInfoCtrl'
            })
            .state('main.modifylabinfo', {
                url: '/modifylabinfo',
                templateUrl: 'templates/main/modifylabinfo.html',
                controller: 'ModifyLabInfoCtrl'
            })

    }])

    // $httpProvider.interceptors提供http request及response的预处理
    .config(['$httpProvider', 'jwtOptionsProvider', function($httpProvider, jwtOptionsProvider) {
        // 下面的getter可以注入各种服务, service, factory, value, constant, provider等, constant, provider可以直接在.config中注入, 但是前3者不行
        jwtOptionsProvider.config({
            whiteListedDomains: ['application.haihonghospitalmanagement.com', 'media.haihonghospitalmanagement.com', '121.43.107.106', 'testpatient.haihonghospitalmanagement.com', 'patient.haihonghospitalmanagement.com', 'localhost'],
            tokenGetter: ['options', 'jwtHelper', '$http', 'CONFIG', 'Storage', '$state', '$ionicPopup', function(options, jwtHelper, $http, CONFIG, Storage, $state, $ionicPopup) {
                // console.log(config);
                // console.log(CONFIG.baseUrl);

                // var token = sessionStorage.getItem('token');
                var token = Storage.get('TOKEN')
                // var refreshToken = sessionStorage.getItem('refreshToken');
                var refreshToken = Storage.get('refreshToken')
                if (!token && !refreshToken) {
                    return null
                }

                var isExpired = true
                // debugger
                try {
                    /*
                     * 由于jwt自带的过期判断方法与服务器端使用的加密方法不匹配，使用jwthelper解码的方法对token进行解码后自行判断token是否过期
                     */
                    // isExpired = jwtHelper.isTokenExpired(token);
                    var temp = jwtHelper.decodeToken(token)
                    if (temp.exp === 'undefined') {
                        isExpired = false
                    } else {
                        // var d = new Date(0); // The 0 here is the key, which sets the date to the epoch
                        // d.setUTCSeconds(temp.expireAfter);
                        isExpired = !(temp.exp > new Date().valueOf()) // (new Date().valueOf() - 8*3600*1000));
                        // console.log(temp)
                    }

                    // console.log(isExpired);
                } catch (e) {
                    console.log(e)
                    isExpired = true
                }
                // 这里如果同时http.get两个模板, 会产生两个$http请求, 插入两次jwtInterceptor, 执行两次getrefreshtoken的刷新token操作, 会导致同时查询redis的操作, ×××估计由于数据库锁的关系×××(由于token_manager.js中的exports.refreshToken中直接删除了redis数据库里前一个refreshToken, 导致同时发起的附带有这个refreshToken的getrefreshtoken请求查询返回reply为null, 导致返回"凭证不存在!"错误), 其中一次会查询失败, 导致返回"凭证不存在!"错误, 使程序流程出现异常(但是为什么会出现模板不能加载的情况? 是什么地方阻止了模板的下载?)
                if (options.url.substr(options.url.length - 5) === '.html' || options.url.substr(options.url.length - 3) === '.js' || options.url.substr(options.url.length - 4) === '.css' || options.url.substr(options.url.length - 4) === '.jpg' || options.url.substr(options.url.length - 4) === '.png' || options.url.substr(options.url.length - 4) === '.ico' || options.url.substr(options.url.length - 5) === '.woff') { // 应该把这个放到最前面, 否则.html模板载入前会要求refreshToken, 如果封装成APP后, 这个就没用了, 因为都在本地, 不需要从服务器上获取, 也就不存在http get请求, 也就不会interceptors
                    // console.log(config.url);
                    return null
                } else if (isExpired) { // 需要加上refreshToken条件, 否则会出现网页循环跳转
                    // This is a promise of a JWT token
                    // console.log(token);
                    if (refreshToken && refreshToken.length >= 16) { // refreshToken字符串长度应该大于16, 小于即为非法
                        /**
                         * [刷新token]
                         * @Author   TongDanyang
                         * @DateTime 2017-07-05
                         * @param    {[string]}  refreshToken [description]
                         * @return   {[object]}  data.results  [新的token信息]
                         */
                        return $http({
                            url: CONFIG.baseUrl + 'token/refresh?refresh_token=' + refreshToken,
                            // This makes it so that this request doesn't send the JWT
                            skipAuthorization: true,
                            method: 'GET',
                            timeout: 2000
                        }).then(function(res) { // $http返回的值不同于$resource, 包含config等对象, 其中数据在res.data中
                            // console.log(res);
                            // sessionStorage.setItem('token', res.data.token);
                            // sessionStorage.setItem('refreshToken', res.data.refreshToken);
                            Storage.set('TOKEN', res.data.results.token)
                            Storage.set('refreshToken', res.data.results.refreshToken)
                            return res.data.results.token
                        }, function(err) {
                            console.log(err)
                            if (refreshToken == Storage.get('refreshToken')) {
                                // console.log("凭证不存在!")
                                console.log(options)
                                $ionicPopup.show({
                                    title: '您离开太久了，请重新登录',
                                    buttons: [{
                                            text: '取消',
                                            type: 'button'
                                        },
                                        {
                                            text: '确定',
                                            type: 'button-positive',
                                            onTap: function(e) {
                                                $state.go('login')
                                            }
                                        }
                                    ]
                                })
                            }
                            // sessionStorage.removeItem('token');
                            // sessionStorage.removeItem('refreshToken');
                            // Storage.rm('token');
                            // Storage.rm('refreshToken');
                            return null
                        })
                    } else {
                        Storage.rm('refreshToken') // 如果是非法refreshToken, 删除之
                        return null
                    }
                } else {
                    // console.log(token);
                    return token
                }
            }]
        })

        $httpProvider.interceptors.push('jwtInterceptor')
    }])