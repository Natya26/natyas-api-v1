const knex = require('knex');
const { Model } = require('objection');
const knexfile = require('./knexfile');
const env = process.env.NODE_ENV || 'development';
const configOptions = knexfile[env];
const knexDB = knex(configOptions);
const dbUtils = require('../db/utils');

Model.knex(knexDB);

async function insertDoc(tableName, doc) {
    const dbResponse = await knexDB(tableName)
        .insert(doc)
        .returning('*');
    return dbUtils.parseWriteResponse(dbResponse);
}

async function updateDoc(tableName, id, doc) {
    const dbResponse = await knexDB(tableName)
        .where({ id })
        .update(doc)
        .returning('*');
    return dbUtils.parseWriteResponse(dbResponse);
}

async function updateWithCondition(tableName, whereCondition, doc) {
    const dbResponse = await knexDB(tableName)
        .where(whereCondition)
        .update(doc)
        .returning('*');
    return dbUtils.parseWriteResponse(dbResponse);
}

function getQueryBuilder(tableName) {
    return knexDB(tableName);
}
function createRaw(data) {
    return knexDB.raw(data)
}
async function executeQuery(queryBuilder) {
    const results = await queryBuilder;
    return results;
}

async function deleteDoc(tableName, condition) {
    const deleteResponse = await knexDB(tableName)
        .where(condition)
        .del();
    return deleteResponse;
}

async function getCount(queryBuilder) {
    const count = await queryBuilder.count().first();
    return parseInt(count.count, 10)
}
async function getLength(queryBuilder) {
    const count = await queryBuilder
    return count.length
}
async function executeRawQuery(query) {
    const { rows } = await knexDB.raw(query)
    return dbUtils.parseWriteResponse(rows)
}
function arrayQuery(t1, table, table_name, fkey = 'userId', id = 'userId', andWhere = '', select = '*', join = '', t = 't') {
    return `(
        select COALESCE(array_to_json(array_agg(row_to_json(${t1}))),'[]')
        from (
          select ${select}
          from "${table}"
          where ${t}."${fkey}" = "${id}" ${andWhere}        
          ) ${t1} 
          ${join}
          ) as ${table_name}`
}

function jsonQuery(t1, table, table_name, fkey = 'userId', id = 'userId', andWhere = '', select = '*', t = 't') {
    return `(
        select row_to_json(${t1})
        from (
          select ${select}
          from "${table}"
          where ${t}."${fkey}" = "${id}" ${andWhere}        
        ) ${t1}
      ) as ${table_name}`
}

function objectQuery(query, name) {
    return `(
        select row_to_json(t1)
        from (   
            ${query}
        ) t1
      ) as ${name}`
}

function singleQuery(query, name) {
    return `(  
            ${query}
      ) as ${name}`
}

function coalesceArray(table_name, query, t1 = 't1', join = '') {
    return `(
        select COALESCE(array_to_json(array_agg(row_to_json(${t1}))),'[]')
        from (
          ${query}
          ) ${t1} 
          ${join}
          ) as ${table_name}`
}
module.exports = {
    insertDoc,
    updateDoc,
    getQueryBuilder,
    executeQuery,
    deleteDoc,
    getCount,
    executeRawQuery,
    createRaw,
    updateWithCondition,
    arrayQuery,
    jsonQuery,
    objectQuery,
    coalesceArray,
    getLength,
    singleQuery,
    knexDB,
    Model,
};
