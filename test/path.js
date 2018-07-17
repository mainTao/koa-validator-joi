const validator = require('../index')
const assert = require('assert')
const supertest = require('supertest')
const bodyParser = require('koa-bodyparser')
const Koa = require('koa')
const Router = require('koa-router')
const router = new Router()
const Joi = require('joi')

const app = new Koa()
app.proxy = true
app.use(bodyParser())
app.use(validator({field: 'value'}))
app.use(router.routes())

const server = app.listen()

function request() {
  return supertest(app.listen());
}

router.get('/:id', async ctx => {
  let schema = Joi.object({
    name: Joi.string().alphanum().min(3).max(30).required(),
    email: Joi.string().email()
  });
  ctx.validate(schema, {name: 'name', email: 'x@x.com'})
  ctx.body = ''
})

router.post('/', async ctx => {
  let schema = Joi.object({
    name: Joi.string().alphanum().min(3).max(30).required(),
    email: Joi.string().email()
  });
  ctx.validateBody(schema)
  ctx.body = {}
})

describe('GET', function () {
  it('1st', async function () {
    let {body} = await request(server)
      .get('/1')
      .expect(200)
  })
})

describe('POST', function () {
  it('1st', async function () {
    let {body} = await request(server)
      .post('/')
      .send({name: 'name'})
      .expect(200)
  })
})
