'use strict';


angular.module('Kidney_Web',['ui.router','ui.bootstrap','controllers','services','filters','directives','ngTable', 'ngMdIcons'])

.config(['$stateProvider','$urlRouterProvider',function ($stateProvider, $urlRouterProvider) {
  $urlRouterProvider.otherwise("/login");
  $stateProvider
  // 登陆
  .state('login', {
    url:"/login",
    templateUrl:"templates/login.html",
    controller:"LoginCtrl"
  })
  .state('main', {
    url:"/main",
    templateUrl:"templates/main.html",
    controller:"MainCtrl"
  })
  .state('main.checkornot', {
    abstract:true,
    url:"/checkornot",
    templateUrl:"templates/main/checkornot.html",
    controller:"CheckOrNotCtrl"
  })
  .state('main.checkornot.checked', {
    url:"/checked",
    templateUrl:"templates/main/checkornot/checked.html",
    controller:"CheckedCtrl"
  })
  .state('main.checkornot.unchecked', {
    url:"/unchecked",
    templateUrl:"templates/main/checkornot/unchecked.html",
    controller:"UncheckedCtrl"
  })
  .state('main.doctorlicense', {
    url:"/doctorlicense",
    templateUrl:"templates/main/doctorlicense.html",
    controller:"DoctorLicenseCtrl"
  })
  .state('main.usermanage', {
    abstract:true,
    url:"/usermanage",
    templateUrl:"templates/main/usermanage.html",
    controller:"UserManageCtrl"
  })
  .state('main.usermanage.allUsers', {
    // cache:'false', 
    url:"/allUsers",
    templateUrl:"templates/main/usermanage/allUsers.html",
    controller:"allUsersCtrl"
  })
  .state('main.usermanage.doctors', {
    url:"/doctors",
    templateUrl:"templates/main/usermanage/doctors.html",
    controller:"doctorsCtrl"
  })
  .state('main.usermanage.nurses', {
    url:"/nurses",
    templateUrl:"templates/main/usermanage/nurses.html",
    controller:"nursesCtrl"
  })
  .state('main.usermanage.patients', {
    url:"/patients",
    templateUrl:"templates/main/usermanage/patients.html",
    controller:"patientsCtrl"
  })
  .state('main.usermanage.insuranceOfficers', {
    url:"/insuranceOfficers",
    templateUrl:"templates/main/usermanage/insuranceOfficers.html",
    controller:"insuranceOfficersCtrl"
  })
  .state('main.usermanage.healthOfficers', {
    url:"/healthOfficers",
    templateUrl:"templates/main/usermanage/healthOfficers.html",
    controller:"healthOfficersCtrl"
  })
  .state('main.usermanage.administrators', {
    url:"/administrators",
    templateUrl:"templates/main/usermanage/administrators.html",
    controller:"administratorsCtrl"
  })
  .state('main.enterornot', {
    abstract:true,
    url:"/enterornot",
    templateUrl:"templates/main/enterornot.html",
    controller:"EnterOrNotCtrl"
  })
  .state('main.enterornot.entered', {
    url:"/entered",
    templateUrl:"templates/main/enterornot/entered.html",
    controller:"EnteredCtrl"
  })
  .state('main.enterornot.unentered', {
    url:"/unentered",
    templateUrl:"templates/main/enterornot/unentered.html",
    controller:"UnenteredCtrl"
  })
  .state('main.labinfo', {
    url:"/labinfo",
    templateUrl:"templates/main/labinfo.html",
    controller:"LabInfoCtrl"
  })
  .state('main.patientlabinfo', {
    url:"/patientlabinfo",
    templateUrl:"templates/main/patientlabinfo.html",
    controller:"PatientLabInfoCtrl"
  })
  .state('main.modifylabinfo', {
    url:"/modifylabinfo",
    templateUrl:"templates/main/modifylabinfo.html",
    controller:"ModifyLabInfoCtrl"
  })
}])