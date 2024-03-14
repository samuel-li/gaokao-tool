"use strict";

const fastify = require("fastify");

const connectionString = process.env.DATABASE_URL || "mysql://root:123456@localhost:3306/gaokaodb";

const querySchoolsByYear = `select 
    distinct
    lpmsb.year,lpmsb.school_id, lpmsb.name, (lpmsb.f985*10+lpmsb.f211) as f985211,
    lpmsb.major_name, lpmsb.major_min_section,
    lpmsb.major_min_score,ep.num
    from ln_physical_majors_score_benke lpmsb 
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
      dataObj['schooldict'][row['school_id']]={name:row['name'],f985211:row['f985211']};
    }
  })
  return dataObj;
}

function build(opts = {}) {
  const app = fastify(opts);

  app.register(require("@fastify/cors"), {
    origin:"*",
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

  return app;
}

module.exports = build;
