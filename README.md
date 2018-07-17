# koa-validator-joi

用 Joi 验证参数。这个所谓的中间件，其实就是给 ctx 下面加了几个验证参数的方法：

- validateQuery：验证 query 上的参数
- validateBody：验证 body 上的参数
- validate：验证所有参数，如果有同名参数，优先次序是：
1. 自定义对象(...otherObjects)
2. params(URL路径里带的参数)
3. body
4. query(URL search里带的参数)

- 验证不过就抛出错误，错误就是 Joi.validate 函数返回的对象中的 error。
- 验证通过则把参数挂在 ctx.args 上面。如果不想叫 args 也可以在初始化时通过 options.field 字段来自定义。

```js

'use strict'
const Joi = require('joi');
let field = 'args';

function validate(schema, ...otherObjects) {
  let {query, params} = this;
  let body = this.request.body;

  let target = Object.assign({}, query, body, params, ...otherObjects); // 后面的会覆盖前面的

  const {error, value} = Joi.validate(target, schema, {allowUnknown: true});

  if(error){
    throw error;
  }

  this[field] = value;
}

function validateBody(schema) {
  let body = this.request.body;

  const {error, value} = Joi.validate(body, schema, {allowUnknown: true});

  if(error){
    throw error;
  }

  this[field] = value;
}

function validateQuery(schema) {
  const {error, value} = Joi.validate(this.query, schema, {allowUnknown: true});

  if(error){
    throw error;
  }

  this[field] = value;
}

module.exports = (options) => {
  if (options) {
    if (!(options instanceof Object)) {
      throw new Error('options must be an Object');
    }
    if(options.field && typeof options.field === 'string'){
      field = options.field;
    }
  }

  return async (ctx, next) => {
    ctx.validate = validate;
    ctx.validateBody = validateBody;
    ctx.validateQuery = validateQuery;
    await next();
  }

}
```