'use strict'
const Joi = require('joi');
let field = 'args';

function validate(schema, ...otherObjects) {
  let {query, params} = this;
  let body = this.request.body;

  let target = Object.assign({}, query, body, params, ...otherObjects);

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