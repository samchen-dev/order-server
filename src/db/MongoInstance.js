import mongoose from 'mongoose'
import { UserSchema, RoleSchema } from './schemas/UserSchema'

let UserModel = null
let RoleModel = null

mongoose.Promise = global.Promise
function connectionFactory() {
  try {
    let db = mongoose.createConnection('mongodb://localhost:27017/sinabuddy', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      useCreateIndex: true,
      poolSize: 5,
    })

    RoleModel = db.model('role', RoleSchema)
    UserModel = db.model('user', UserSchema)
    

    //链接成功执行
    db.once('open', () => {
      console.log('数据库链接成功')
    })

    // 链接失败执行
    db.on('error', (err) => {
      console.log(`MongoDB connecting failed: ${err}`)
    })
    return db
  } catch (err) {
    console.log(`MongoDB connecting failed: ${err}`)
  }
}

const MongoInstance = connectionFactory()
export { MongoInstance, UserModel, RoleModel }
