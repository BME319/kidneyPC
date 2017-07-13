angular.module('filters',[])
.filter('gender', function() {
  return function(input) {
  	switch(input)
  	{
  		case 1:return '男';
  		break;
  		case 2:return '女';
  		break;
  		default:return '未知';
  	}
  };
})
.filter('bloodType', [function () {
  return function (type) {
    var name
    switch (type) {
      case 1:
        name = 'A型'
        break
      case 2:
        name = 'B型'
        break
      case 3:
        name = 'AB型'
        break
      case 4:
        name = 'O型'
        break
      case 5:
        name = '不确定'
        break
    }
    return name
  }
}])
.filter('hypertension', [function () {
  return function (type) {
    var name = '--'
    switch (type) {
      case '1':
        name = '是'
        break
      case '2':
        name = '否'
        break
    }
    return name
  }
}])
.filter('classname', [function () {
  return function (type) {
    var name
    switch (type) {
      case 'class_2':
        name = 'CKD1-2期'
        break
      case 'class_3':
        name = 'CKD3-4期'
        break
      case 'class_4':
        name = 'CDK5期未透析'
        break
      case 'class_6':
        name = '腹透'
        break
      case 'class_5':
        name = '血透'
        break
      case 'class_1':
        name = '肾移植'
        break
    }
    return name
  }
}])
.filter('progressname', [function () {
  return function (type) {
    var name
    switch (type) {
      case 'stage_5':
        name = '疾病活跃期'
        break
      case 'stage_6':
        name = '稳定期'
        break
      case 'stage_7':
        name = '>3年'
        break
    }
    return name
  }
}])
.filter('role', [function () {
  return function (type) {
    var name
    switch (type) {
      case 'Leader':
        name = '地区负责人'
        break
      case 'master':
        name = '科主任'
        break
      case 'doctor':
        name = '普通医生'
        break
      case 'patient':
        name = '患者'
        break
      case 'nurse':
        name = '护士'
        break
      case 'insuranceA':
        name = '沟通人员'
        break
      case 'insuranceC':
        name = '保险主管'
        break
      case 'insuranceR':
        name = '录入人员'
        break
      case 'health':
        name = '健康专员'
        break
      case 'admin':
        name = '管理员'
        break
    }
    return name
  }
}])
// .filter('role_insurance', [function () {
//   return function (type) {
//     var name
//     switch (type) {
//       case 'insuranceA':
//         name = '沟通人员'
//         break
//       case 'insuranceC':
//         name = '保险主管'
//         break
//       case 'insuranceR':
//         name = '录入人员'
//         break
//     }
//     return name
//   }
// }])

