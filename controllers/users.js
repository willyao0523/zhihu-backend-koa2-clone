const jwt = require('koa-jwt')
const User = require('../models/users')
const {CONF} = require('../conf/conf')

class UserController {

  async find(ctx) {    
    ctx.body = await User.find()
  }

  async findById(ctx) {
    const user = await User.findById(ctx.params.id)
    if(!user) { 
      ctx.throw(404, '该用户不存在')       
    }
    ctx.body = user
  }

  async create(ctx) {
    ctx.verifyParams({
      name: {type: 'string', required: true},
      password: {type: 'string', required: true}
    })
    const {name} = ctx.request.body;
    const repeatedUsername = await User.findOne({name})
    if(repeatedUsername) { ctx.throw(409, '用户名已经被占用') }
    const user = await new User(ctx.request.body).save()
    ctx.body = user
  }

  async update(ctx) {
    ctx.verifyParams({
      name: {type: 'string', required: false},
      password: {type: 'string', required: false}
    })
    const user = await User.findByIdAndUpdate(ctx.params.id, ctx.request.body)
    if(!user) {
      ctx.throw(404, "该用户不存在")      
    }
    ctx.body = user;
  }

  async delete(ctx) {
    const user =  await User.findByIdAndRemove(ctx.params.id)
    if(!user) {
      ctx.throw(404, "该用户不存在")
    }
    ctx.body = user
  }

  async login(ctx) {
    ctx.verifyParams({
      name: {type: 'string', required: true},
      password: {type: 'string', require: true}
    })
    const user = await User.findOne(ctx.request.body)
    if(!user) ctx.throw(401, "用户名或密码不正确")
    const {_id, name} = user
    const token = jwt.sign({_id, name}, CONF.jwtkey, {expiresIn: '1d'})
    ctx.body = { token }
  }

  // 鉴权
  async checkUser(ctx, next) {
    if(ctx.params.id !== ctx.state.user._id) {
      ctx.throw(403, "无权操作")
    }
    await next()
  }

}

module.exports = new UserController();