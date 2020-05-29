import mongo from 'mongoose'
import bcryptjs from 'bcryptjs'

let Schema = mongo.Schema

let RoleSchema = new Schema({
  // 权限ID
  roleID: {
    type: Number,
    enum: [1, 2, 3, 4, 5, 6], //1代表业务员， 2代表单证， 3代表海运， 4代表货源， 5代表经理， 6代表管理员
    index: true,
    unique: true,
  },
  // 权限标题
  title: {
    type: String,
    required: true,
  },
})

// 权限集合初始化
RoleSchema.methods.initData = async function (Model) {
  this.clearData(Model)
  let roles = [
    { roleID: 1, title: '业务员' },
    { roleID: 2, title: '单证' },
    { roleID: 3, title: '海运' },
    { roleID: 4, title: '货源' },
    { roleID: 5, title: '经理' },
    { roleID: 6, title: '管理员' },
  ]
  let saveFlag = false
  const value = await Model.insertMany(roles)
  return value
}
// 清除权限集合数据
RoleSchema.methods.clearData = async function (Model) {
  console.log('clearData')
  await Model.deleteMany()
    .then((val) => console.log(val))
    .catch((err) => console.log(err))
}


let UserSchema = new Schema({
  // 登录名
  username: {
    type: String,
    required: true, // 必须有值
    trim: true, // 去掉前后空格
    unique: true, // 唯一性约束
  },

  // 登录密码
  password: {
    type: String,
    required: true, // 必须有值
    set(val) {
      // 给password 进行加密，密级10级
      return bcryptjs.hashSync(val, 10)
    },
  },

  // 显示名称
  name: {
    type: String,
    required: true, // 必须有值
    trim: true, // 去掉前后空格
  },

  // 电话
  phone: {
    type: String,
    required: true, // 必须有值
    trim: true, // 去掉前后空格
  },
  // 邮箱
  mail: {
    type: String,
    required: true, // 必须有值
    trim: true, // 去掉前后空格
  },

  // 是否禁用
  disableFlog: {
    type: Boolean,
    required: true, // 必须有值 false代表禁用，true代表正常
  },

  // 职务代表权限
  roles: [{
    type: mongo.SchemaTypes.ObjectId,
    ref: 'role',
  }]
})

export { UserSchema, RoleSchema }
