import express from 'express'
import bcryptjs from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { UserModel, RoleModel } from '../db/MongoInstance'

const router = express.Router()
const SECRET = '### ---SINABUDDY--- ###'

router.post('/login/v1', async (req, res) => {
  console.log(req.path)
  const user = await UserModel.findOne({ username: req.body.username })
  console.log(user)
  //  根据用户名查找user对象
  if (!user) {
    return res.send({
      meta: {
        status: 1001,
        msg: '用户名不存在！',
      },
    })
  }

  // 验证用户登陆密码
  const isPasswrod = bcryptjs.compareSync(req.body.password, user.password)
  if (!isPasswrod) {
    return res.send({
      meta: {
        status: 1002,
        msg: '用户的密码不正确！',
      },
    })
  }

  // 生成token
  const token = jwt.sign(
    {
      id: String(user._id),
    },
    SECRET
  )
  res.send({
    data: {
      user: user.username,
      token,
    },
    meta: {
      status: 200,
      msg: '用户登陆成功！',
    },
  })
})

// 修改用户状态
router.get('/updateDisableFlog/v1', async (req, res) => {
  console.log(req.path)

  try {
    const _id = req.param('_id')
    const disableFlog = req.param('disableFlog')
    if (!_id) {
      return res.send({
        meta: {
          status: 1001,
          msg: '用户ID不存在！',
        },
      })
    }

    const user = await UserModel.findById(_id)
    if (!user) {
      return res.send({
        meta: {
          status: 1002,
          msg: '查不到该用户！',
        },
      })
    }

    user.set('disableFlog', disableFlog)
    const value = await user.save()
    console.log(value)
    console.log(user)

    res.send({
      data: {
        user,
      },
      meta: {
        status: 200,
        msg: '用户状态更新成功！',
      },
    })
  } catch (err) {
    req.send({
      meta: {
        status: 1001,
        msg: '请求用户信息发生错误！',
      },
    })
  }
})

// 获取用户列表
router.get('/list/v1', async (req, res) => {
  console.log(req.path)
  try {
    const username = req.param("username")
    console.log("username:" + username)
    let query = null
    if(username && (username.length > 0)) {
      query = `{username:'${username}'}`
      console.log(query)
    }
    let userList = null 
    if(query) {
      userList = await UserModel.find(query).populate('roles')
    } else {
      userList = await UserModel.find().populate('roles')
    }
    
    if (!userList) {
      return res.send({
        meta: {
          status: 1001,
          msg: '暂无用户信息！',
        },
      })
    }
    res.send({
      data: {
        userList,
      },
      meta: {
        status: 200,
        msg: '获取用户信息成功！',
      },
    })
  } catch (err) {
    console.log(err)
    res.send({
      meta: {
        status: 1001,
        msg: '请求用户列表信息发生错误！',
      },
    })
  }
})

// 创建用户
router.post('/register/v1', async (req, res) => {
  console.log(req.path)

  try {
    const user = new UserModel()
    user.username = req.body.username
    user.password = req.body.password
    user.name = req.body.name
    user.phone = req.body.phone
    user.mail = req.body.mail
    user.roles = req.body.roles
    user.disableFlog = true
    const value = await user.save()
    
    if(!value) {
      return res.send({
        meta: {
          status: 1001,
          msg: '用户创建失败！',
        },
      })
    }

    res.send({
      data: {
        user,
      },
      meta: {
        status: 200,
        msg: '用户创建成功！',
      }
    })
  } catch (err) {
    console.log(err)
    res.send({
      meta: {
        status: 1002,
        msg: '用户创建过程出错！'
      }
    })
  }
})

// 返回权限列表信息
router.get('/allRoles/v1', async (req, res) => {
  console.log(req.path)
  try {
    const roles = await RoleModel.find().sort({roleID: 1})
    console.log(roles.length)
    if(!roles || roles.length === 0) {
      res.send({
        meta: {
          status: 1001,
          msg: '无法获取角色信息！',
        }
      })
    }
    res.send({
      data: {
        roles
      },
      meta: {
        status: 200,
        msg: '获取角色信息成功！',
      }
    })
  } catch(err) {
    console.log(err)
    res.send({
      meta: {
        status: 1002,
        msg: '获取角色信息报错！',
      }
    })
  }
})

// 初始化权限，用户信息
router.get('/initdata/v1', async (req, res) => {
  console.log(req.path)
  try {
    let initFlag = true
    await UserModel.deleteMany()
    const role = new RoleModel()
    const roles = await role.initData(RoleModel)
    console.log(roles)
    const role6 = await RoleModel.find({ roleID: 6 })
    console.log(role6)

    const samchen = new UserModel()
    samchen.set('username', 'samchen')
    samchen.set('password', '123456')
    samchen.set('name', '陈辉')
    samchen.set('phone', '13837147910')
    samchen.set('mail', 'samchen@sinabuddy.com')
    samchen.set('disableFlog', true)
    samchen.set('roles', role6)
    samchen.save()

    console.log(samchen)
    res.send('初始化成功！')
  } catch (err) {
    console.log(err)
  }
})

// 删除用户
router.get('/delete/v1', async (req, res) => {
  console.log(req.path)
  try {
    const _id = req.param('_id')
    const username = req.param('username')
    if(!_id) {
      return res.send({
        meta: {
          status: 1001,
          msg: '删除用户ID不存在！',
        },
      })
    }

    await UserModel.deleteOne({_id})    
    res.send({
      meta: {
        status: 200,
        msg: `成功删除${username}用户！`
      },
    })    
  } catch(err) {
    console.log(err)
    res.send({
      meta: {
        status: 200,
        msg: '删除用户过程中出错！'
      }
    })
  }
})

export default router
