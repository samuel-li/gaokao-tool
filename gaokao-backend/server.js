"use strict";

const fastify = require("fastify");

const connectionString = process.env.DATABASE_URL || "mysql://root:123456@localhost:3306/gaokaodb";

const querySchoolsByYear = `select 
    distinct
    lpmsb.year,lpmsb.school_id, lpmsb.name, ru.up as rankId, (lpmsb.f985*10+lpmsb.f211) as f985211,
    lpmsb.major_name, lpmsb.major_min_section,
    lpmsb.major_min_score,ep.num
    from ln_physical_majors_score_benke lpmsb 
    left join ranking_univ ru on lpmsb.name like concat(ru.nameCn, '%')
    left join enrollPlan ep on ep.school_id=lpmsb.school_id and ep.year=lpmsb.year
                            and (
                              case when locate('（', lpmsb.major_name)>0 
                              then (ep.spname like concat(lpmsb.major_name, '%') or lpmsb.major_name like concat(ep.spname, '%'))
                              else lpmsb.major_name=ep.spname end
                            ) `;

function log(msg, level=null) {
      let nowTime = new Date();
      if (level == null) {
        level = 'DEBUG';
      }
      msg = nowTime.toString() + " ["+level+"] " + msg;
      console.log(msg);
};


function createQuery(query, request, orderBy) {
  let maxNum = Math.max(Math.max(request.params.maxnum, request.params.minnum),0);
  let minNum = Math.min(Math.min(request.params.maxnum, request.params.minnum),1000000);
  let yearOfQuery = -1;
  let majors = null;
  let majorParam = [];
  let major_query = [];
  let size = 999;
  let school_id = -1;

  if (request.query.major && request.query.major.trim()!="") {
    majors = request.query.major.split(",");
  } 
  if (request.query.size) {
    size = parseInt(request.query.size);
  }
  if (request.query.year) {
    yearOfQuery = parseInt(request.query.year);
  }
  if (request.query.school_id) {
    school_id = parseInt(request.query.school_id);
  }

  let isCountQuery = query.toLowerCase().indexOf(" count(") >= 0;

  if (majors != null && majors.length > 0) {
    majors.forEach((element, idx) => {
      if(element.trim()!="") {
        major_query.push("major_name  like ?");
        majorParam.push("%" + element +"%");
      } 
    });
    if (major_query.length > 0) {
      query = query + "and (" + major_query.join(" or ") + " )";
    }
  }

  let sqlParams = [minNum, maxNum];
  if(major_query.length>0) {
    sqlParams = sqlParams.concat(majorParam);
  };

  if (yearOfQuery != -1) {
    query = query + " and `year`=? ";
    sqlParams.push(yearOfQuery);
  }

  if (school_id != -1) {
    query = query + " and `school_id`=? ";
    sqlParams.push(school_id);
  }


  if (!isCountQuery) {
    if (orderBy!=null) {
      query = query + " "+orderBy+" ";
    }
    query = query + " LIMIT ?";
    sqlParams.push(size);
  }
  log("Request："+JSON.stringify(request.params)+JSON.stringify(request.query));
  // log("Query : ");
  // log(query);
  // log(JSON.stringify(sqlParams));
  return {query: query, params: sqlParams};
}

/**
 * data structure: year > school_id > 
 * {
 *    '2023':{
 *        schools:[44,77,...]
 *        schooldict: {44:{name:xxxx, f985211:10},{44:{name:xxxx, f985211:1}},....],
 *        44 : [
 *          {
 *            major_name:xxxx,
 *            major_min_section,
 *            enroll_num : xx
 *          },
 *          {
 *             ......
 *          }
 *        ],
 *       77 : {
 *       }
 *    }
 *   '2022': {....}
 * }
 */
function buildList(rows) {
  let dataObj = {};
  rows.forEach((row,idx) => {

    if (dataObj['schools']==null) {
      dataObj['schools']=[];
    }
    if (dataObj['schooldict']==null) {
      dataObj['schooldict']={};
    }

    if (dataObj[row['school_id']]==null) {
      dataObj[row['school_id']] = {};
    }

    if (dataObj[row['school_id']][row['year']]==null) {
      dataObj[row['school_id']][row['year']] = [];
    }
    dataObj[row['school_id']][row['year']].push({
      major_name:row['major_name'],
      major_min_section:row['major_min_section'],
      major_min_score:row['major_min_score'],
      enroll_num:row['num']
    });
    if (!dataObj['schools'].includes(row['school_id'])){
      dataObj['schools'].push(row['school_id']);
      dataObj['schooldict'][row['school_id']]={name:row['name'],f985211:row['f985211'],rankId:row['rankId']};
    }
  })
  return dataObj;
}


/**
 * 
 * @param {Array<Integer>} yearsOfQuery [2023,2022,2021]
 * @param {String} local_batch_name "本科批"
 * @param {String} local_type_name "物理类"
 * @returns SQL for query enroll plan by school ids.
 */
function ceateQueryForEnrollPlan( yearsOfQuery, local_batch_name='本科批', local_type_name='物理类') {
  try{
    if (!yearsOfQuery instanceof Array || yearsOfQuery.length <= 0) {
      log('Need to given years for quering enroll plan.', 'WARNING')
      return "";
    }
  
    let selFields = [];
    let fromSet = [];
    let priTable = '';
    yearsOfQuery.forEach((year,idx)=>{
      let y = parseInt(year);
      if (selFields.length == 0) {
        selFields.push('Data'+y+'.school_id as school_id');
        priTable = 'Data'+y;
        fromSet.push(`(select school_id, sum(num) as enroll_num
        from enrollPlan ep 
        where local_batch_name ='`+local_batch_name+`' and local_type_name ='`+local_type_name+`' and ep.year=`+y+`
        group by school_id ) Data`+y);
      } else {
        fromSet.push(`(select school_id, sum(num) as enroll_num
        from enrollPlan ep 
        where local_batch_name ='`+local_batch_name+`' and local_type_name ='`+local_type_name+`' and ep.year=`+y+`
        group by school_id ) Data`+y + ' ON '+priTable+'.school_id=Data'+y+'.school_id '+"\n");
      }
      selFields.push('Data'+y+'.enroll_num as enroll_num_'+y);
    });
    return 'SELECT '+selFields.join(',') + ' FROM ' + fromSet.join(' INNER JOIN ') + ' WHERE '+priTable+'.school_id in (?)';

  } catch (error) {
    log(err, "ERROR");
    return "";
  }
}

function build(opts = {}) {
  const app = fastify(opts);

  app.register(require("@fastify/cors"), {
    origin:"http://101.37.252.181",
    allowedHeaders: ['Content-Type', 'Authorization'],
    methods: ['GET','POST','PUT']
  });
  app.register(require("@fastify/mysql"), { promise: true, connectionString: connectionString });
  
  app.get("/", async () => {
    return {api:[
      "/score/:minnum/:maxnum?major=majorA,majorB,majorC&year=2023&size=numberOfItems",
      "/section/:minnum/:maxnum?major=majorA,majorB,majorC&year=2023&&size=numberOfItems",
      "/school/score/:minnum/:maxnum?major=majorA,majorB,majorC&year=2023&size=numberOfItems",
      "/school/section/:minnum/:maxnum?major=majorA,majorB,majorC&year=2023&&size=numberOfItems",
      "/enrollplan/:school_id"
    ]};
  });

  app.get("/score/:minnum/:maxnum", async (request, reply) => {
    const connection = await app.mysql.getConnection();
    let queryObj = createQuery("select count(*) as cnt from ln_physical_majors_score_benke lpmsb where (major_min_score between ? and ?) ", request);
    const [cntRows, cntFields] = await connection.query(queryObj.query, queryObj.params);
    let cnt=cntRows[0]['cnt'];

    queryObj = createQuery("select * from ln_physical_majors_score_benke lpmsb where (major_min_score between ? and ?) ", request, "order by `year` desc, major_min_section");
    const [rows, fields] = await connection.query(queryObj.query, queryObj.params);
    connection.release();
    return {numFound: cnt, items: rows};
  });

  app.get("/section/:minnum/:maxnum", async (request, reply) => {
    const connection = await app.mysql.getConnection();
    let queryObj = createQuery("select count(distinct school_id) as cnt from ln_physical_majors_score_benke lpmsb where (major_min_section between ? and ?) ", request);
    const [cntRows, cntFields] = await connection.query(queryObj.query, queryObj.params);
    let cnt=cntRows[0]['cnt'];

    queryObj = createQuery("select * from ln_physical_majors_score_benke lpmsb where (major_min_section between ? and ?) ", request, "order by `year` desc, major_min_section");
    const [rows, fields] = await connection.query(queryObj.query, queryObj.params);
    connection.release();
    return {numFound: cnt, items: rows};
  });

  app.get("/schools/:scoreorsec/:minnum/:maxnum", async (request, reply) => {
    // log("Check:" + request.params.scoreorsec);
    if (request.params.scoreorsec == 'score') {
      const connection = await app.mysql.getConnection();
      let queryObj = createQuery(querySchoolsByYear + " where (major_min_score between ? and ?)", request, 'order by year,major_min_section,school_id');
      const [rows, fields] = await connection.query(queryObj.query, queryObj.params);
      connection.release();
      return buildList(rows);
    } else if (request.params.scoreorsec == 'section') {
      const connection = await app.mysql.getConnection();
      let queryObj = createQuery(querySchoolsByYear + " where (major_min_section between ? and ?)", request, 'order by year,major_min_section,school_id');
      const [rows, fields] = await connection.query(queryObj.query, queryObj.params);
      connection.release();
      return buildList(rows);
    } else {
      return {};
    }
  });

  app.get("/enrollplan/", async (request, reply) => {
    if (request.query.sids == null || request.query.sids.trim()=='') {
      log("No given school ids for query.", "ERROR");
      return {numFound: 0, items: []};
    }
    let sids = request.query.sids.split(',');
    let schoolIds = [];
    sids.forEach((_sid, _idx)=>{
      try{
        let __sid = parseInt(_sid);
        log("__sid:"+__sid, 'DEBUG');
        if (!isNaN(__sid)) {
          schoolIds.push(__sid);
        }
      } catch (err) {
        log("Invalid school id." + err, "ERROR");
      }
    });
    

    try {
      let querySql = ceateQueryForEnrollPlan([2023, 2022, 2021]);
      // log("School IDs:"+JSON.stringify(schoolIds), 'DEBUG');
      // log(querySql, 'DEBUG');
      const connection = await app.mysql.getConnection();
      const [rows, fields] = await connection.query(querySql, [schoolIds]);
      connection.release();
      if (rows != null) {
        return {numFound: rows.length, items: rows};
      } else {
        return {numFound: 0, items: []};
      }
    } catch (err) {
      log(err, "ERROR");
    }
    return {numFound: 0, items: []};
  });

  return app;
}

module.exports = build;
