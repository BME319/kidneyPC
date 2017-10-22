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

