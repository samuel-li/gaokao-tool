const syncFetch = require('sync-request');
const fs = require('fs');
const crypto = require("crypto");

// 抓取数据范围配置
let paramDict = {
  "local_province_id": [21],
  "local_type_id": [2073, 2074],
  "local_batch_id": [14],
  "year": [2021, 2022, 2023]
}

// 接口配置
const dataURL = {
  'base': 'https://api.zjzw.cn/web/api/',
  'access_level': ["schoolData", "minScoreOfSchool", "enrollPlanOfSchool", "majorScoreOfSchool","majorInfo"],
  'param': {
    // 所有学校基本信息：the size need to get from numFound value in result. default : 2886 here
    'schoolData': "?keyword=&page={page}&province_id=&ranktype=&request_type=1&size={pagesize}&type=&uri=apidata/api/gkv3/school/lists",
    // 各学校某省的录取最低分数 : local_province_id:省code(21-辽宁)  local_type_id:类别 (2073-物理类)  school_id:学校id(134-东北大学)
    'minScoreOfSchool': "?e_sort=zslx_rank,min&e_sorttype=desc,desc&local_province_id={local_province_id}&local_type_id={local_type_id}&page={page}&school_id={school_id}&size={pagesize}&uri=apidata/api/gk/score/province&year={year}",
    // 各学校招生计划 :  local_batch_id 批次 (14-本科批)  
    'enrollPlanOfSchool': "?local_batch_id={local_batch_id}&local_province_id={local_province_id}&local_type_id={local_type_id}&page={page}&school_id={school_id}&size={pagesize}&special_group=&uri=apidata/api/gkv3/plan/school&year={year}",
    // 各学校在某省的各专业的最低分数 :  local_batch_id 批次 (14-本科批)  
    'majorScoreOfSchool': "?local_batch_id={local_batch_id}&local_province_id={local_province_id}&local_type_id={local_type_id}&page={page}&school_id={school_id}&size={pagesize}&special_group=&uri=apidata/api/gk/score/special&year={year}",
    // 所有专业的基本信息
    'majorInfo': "?keyword=&level1=&level2=&level3=&page={page}&size=30&sort=&uri=apidata/api/gkv3/special/lists"
  }
};

// fields指定了从接口中取哪些字段
const dataSchema = {
  "schoolData": {
    'dataset': "data.item",
    'totalnum': "data.numFound",
    'priKey': "school_id",
    "fields": ["school_id", "admissions", "answerurl", "belong", "central", "city_id", "city_name", "code_enroll", "colleges_level", "county_id", "county_name", "department", "doublehigh", "dual_class", "dual_class_name", "f211", "f985", "hightitle", "inner_rate", "is_recruitment", "is_top", "level", "level_name", "name", "nature", "nature_name", "outer_rate", "province_id", "province_name", "rank", "rank_type", "rate", "school_type", "tag_name", "type", "type_name", "view_month", "view_total", "view_total_number", "view_week"],
    "pagesize": 30,
  },
  "minScoreOfSchool": {
    'dataset': "data.item",
    'totalnum': "data.numFound",
    'priKey': "",
    "fields": ["answerurl", "average", "avg_section", "city_name", "county_name", "dual_class", "dual_class_name", "filing", "first_km", "local_batch_id", "local_batch_name", "local_province_name", "local_type_name", "major_score", "max", "min", "min_section", "name", "nature_name", "num", "proscore", "province_id", "province_name", "school_id", "sg_fxk", "sg_info", "sg_name", "sg_sxk", "sg_type", "special_group", "xclevel_name", "year", 'zslx_name'],
    "pagesize": 20
  },
  "enrollPlanOfSchool": {
    'dataset': "data.item",
    'totalnum': "data.numFound",
    'priKey': "",
    "fields": ["first_km", "length", "level2_name", "local_batch_name", "local_type_name", "name", "num", "province_name", "school_id", "sg_fxk", "sg_info", "sg_name", "sg_sxk", "sg_type", "sp_fxk", "sp_info", "sp_sxk", "sp_type", "sp_xuanke", "spcode", "special_group", "spname", "tuition", "year"],
    "pagesize": 20
  },
  "majorScoreOfSchool": {
    'dataset': "data.item",
    'totalnum': "data.numFound",
    'priKey': "",
    "fields": ["id", "average", "doublehigh", "dual_class_name", "first_km", "is_top", "local_batch_name", "local_province_name", "local_type_name", "max", "min", "min_section", "name", "proscore", "school_id", "sg_fxk", "sg_info", "sg_name", "sg_sxk", "sg_type", "single", "sp_fxk", "sp_info", "sp_sxk", "sp_type", "spe_id", "special_group", "special_id", "spname", "year", "zslx_name"],
    "pagesize": 20
  },
  'majorInfo': {
    'dataset': "data.item",
    'totalnum': "data.numFound",
    'priKey': "",
    "fields": ["boy_rate","degree","fivesalaryavg","girl_rate","hightitle","id","level1","level1_name","level2","level2_name","level3","level3_name","limit_year","name","rank","salaryavg","spcode","special_id","view_month","view_total","view_week"],
    "pagesize": 30
  }
};
const baseDir = "output/";
const stateDir = "state/"

let delay = (ms) => {
  const start = Date.now();
  let now = start;
  while (now - start < ms) {
    now = Date.now();
  }
};

let log = (msg, level=null) => {
  let nowTime = new Date();
  if (level == null) {
    level = 'DEBUG';
  }
  msg = nowTime.toString() + " ["+level+"] " + msg;
  console.log(msg);
};

let logstate = (category, parameters, status) => {
  fs.writeFileSync(stateDir + "/" + category + "_state.json", JSON.stringify({'category':category, 'status': status, 'params' : parameters}), {'flag':'w'}, function(err) {
    if (err) {
      log(err, "ERROR")
    }
  });
};

let getPreviousState = (category) => {
  let filename = stateDir + "/" + category + "_state.json";
  log('Open data file state ' + filename);
  try {
    fs.accessSync(filename, fs.constants.F_OK);
    let data = fs.readFileSync(filename);
    log("Previous state: " + data);
    return JSON.parse(data);
  } catch(err) {
    log("Start from begining for ingestion " + category + err, "INFO");
    return {};
  }
}

let getData = (category, parameters) => {
  logstate(category, parameters, 'new');
  delay(crypto.randomInt(4)*1000);
  let url = dataURL.base + dataURL.param[category];
  let filename = baseDir + "/" + category + ".csv";
  let page = valueIfNull(parameters['page'], 1);
  let pageSize = dataSchema[category]['pagesize'] != null ? dataSchema[category]['pagesize'] : 20;

  url = url.replace("{pagesize}", pageSize);
  url = url.replace("{page}", page);

  Object.keys(parameters).forEach((paramKey, idx) => {
    if (parameters[paramKey] != null) {
      url = url.replace("{" + paramKey + "}", parameters[paramKey])
    }
  });

  // Create file stream handlers for writing data
  if (false == createDatafileIfNotExists(category)) {
      return false;
  }
  
  let retries = 0;
  let bRetry = true;
  do {
    try{
      log("Fetch : " + url + " page:" + page);
      const response = syncFetch("GET", url);
      if (response.statusCode == 200) {
        const data = response.body;
        let dataObject = JSON.parse(data);
        if (dataObject != null && dataObject.code === "0000") {
          let dataSet = null;
          log("Data Size:" + data.length, 'DEBUG');
          dataSet = parseCsvData(category, data, filename);
          // Write primary keys to a seperate file
          if (dataSet['prikeys'] != null && dataSet['prikeys'].length > 0) {
            // log("Primary Keys" + JSON.stringify(dataSet.prikeys), 'DEBUG');
            fs.writeFileSync(baseDir + "/" + category + "_prikeys.csv", dataSet.prikeys.join("\n")+"\n", {'flag':'a+'}, function(err) {
              if (err) {
                log(err, "ERROR")
              }
            });
          }
          log('Total number : ' + dataSet.totalnum + ' current: ' + page*pageSize);
          // get left data
          if (dataSet.totalnum > page*pageSize) {
            parameters['page'] = page+1;
            getData(category, parameters);
          }
          bRetry = false;
        } else {
          log("Query failed :" + url + " - " + JSON.stringify(dataObject), "ERROR");
          if (retries++ < 10) {
            logstate(category, parameters, 'retry');
            log('Wait 3 mins for reconnect (retry:'+retries+')...');
            delay(180000);
            continue;
          } else {
            bRetry = false;
          }
        }
      } else {
        log('Response ' + response.statusCode, "ERROR");
        if (retries++ < 6) {
          logstate(category, parameters, 'retry');
          log('Wait 5 mins for reconnect (retry:'+retries+')...', "ERROR");
          delay(300000);
          continue;
        } else {
          bRetry = false;
        }
      }
    } catch(err) {
      log("Exception: " + url + " - " + err, "FATAL");
      if (retries++ < 6) {
        logstate(category, parameters, 'error');
        log('Wait 5 mins for reconnect (retry:'+retries+')...', "ERROR");
        delay(300000);
        continue;
      } else {
        bRetry = false;
      }
    }
    logstate(category, parameters, 'success');
  } while (bRetry);
}

let getDataFromDataSet = (data, dataSchema) => {
  let dataObj = JSON.parse(data);
  let dataSetPointers = String(dataSchema.dataset).split(".");
  let dataSet = null;
  let lines = [];
  let priKeys = [];
  let totalNum = null;
  let totalNumPointers = String(dataSchema.totalnum).split(".");

  dataSetPointers.forEach((field, idx) => {
    if (dataSet == null)
      dataSet = dataObj[field];
    else
      dataSet = dataSet[field];
  });

  totalNumPointers.forEach((field, idx) => {
    if (totalNum == null) {
      totalNum = dataObj[field];
    }
    else { // In last iteration, it will convert object to a number, maybe a problem
      totalNum = totalNum[field];
    }
  });

  if (dataSet != null) {
    dataSet.forEach((lineObj, idx) => {
      let lineData = [];
      dataSchema.fields.forEach((field, idx) => {
        let fieldValue = typeof (lineObj[field]) == "string" ? lineObj[field].replaceAll(",", "||").replaceAll('"','“') : lineObj[field];
        if (fieldValue == null || fieldValue == "-" || fieldValue == "--") {
          fieldValue = "";
        }
        lineData.push(fieldValue);
        if (dataSchema.priKey != "") {
          priKeys.push(lineObj[dataSchema.priKey]);
        }
      });
      lines.push(lineData.join(","));
    });
    return { 'csvlines': lines, 'prikeys': Array.from(new Set(priKeys)), 'totalnum': totalNum };
  } else {
    log("ERROR: NODATA");
    return {};
  }
};

let parseCsvData = (category, data, filename) => {
  let schema = dataSchema[category];
  let dataSet = getDataFromDataSet(data, schema);
  if (dataSet['csvlines'] != null && dataSet['csvlines'].length > 0) {
    fs.writeFileSync(filename, dataSet['csvlines'].join("\n") + "\n", {'flag':'a'}, function(err) {
        if (err) {
          log(err, "ERROR")
        }
      });
  }
  return dataSet;
};

// If testval is empty, return val, then return testval
let valueIfNull = (testval, val) => {
    return testval == null || testval == '' ? val : testval;
};

let createDatafileIfNotExists = (category) => {
    let filename = baseDir + "/" + category + ".csv";
    try {
        fs.accessSync(filename, fs.constants.F_OK);
        return true;
    } catch(err) {
        log(filename + " doesn't exist. need to create.", "INFO");
        fs.writeFileSync(filename, dataSchema[category]['fields'].join(",") + "\n", {'flag':'w'}, function(err) {
            if (err) {
                log(err, "ERROR")
                return false;
            }
        });
    }
};

let getDataWithInputKeys = (category, keydatafile, previousState) => {
  
    if (!dataURL.access_level.includes(category)) {
      log('Not support get data for ' + category);
      return false;
    }
  
    // Read primary keys data
    // let filename = baseDir + "/schoolData_prikeys.csv";
    log('Open primary keys file ' + keydatafile);
    let prikeys = [];
    try {
      fs.accessSync(keydatafile, fs.constants.F_OK);
      let data = fs.readFileSync(keydatafile);
      if (data != null && data.length > 0) {
        prikeys = String(data).split('\n');
        // log('Keys : ' + JSON.stringify(prikeys), 'DEBUG');
      }
    } catch(err) {
      log("Read primary keys  " + keydatafile + " " + err, "INFO");
      return false;
    }
    
    // Create file stream handlers for writing data
    if (false == createDatafileIfNotExists(category)) {
        return false;
    }
    
    // Bring primary key to other reuqest for data ingestion.
    // !!! NOTICE paramDict changes may cause the data duplicate.
    if (prikeys.length > 0) {
      prikeys.forEach((school_id, idx) => {
        let parameters = { "school_id": school_id };
        if (school_id != "" && school_id == valueIfNull(previousState['school_id'], school_id)) {
          previousState['school_id'] = "";
          paramDict.year.forEach((v, k) => {
            if (v != "" && v == valueIfNull(previousState['year'], v)) {
              previousState['year'] = "";
              parameters['year'] = v;
              paramDict.local_province_id.forEach((v, k) => {
                if (v != "" && v == valueIfNull(previousState['local_province_id'], v)) {
                  previousState['local_province_id'] = "";
                  parameters['local_province_id'] = v;
                  paramDict.local_type_id.forEach((v, k) => {
                    if (v != "" && v == valueIfNull(previousState['local_type_id'], v)) {
                      previousState['local_type_id'] = "";
                      parameters['local_type_id'] = v;
                      if (category == "minScoreOfSchool") {
                        parameters['page'] = 1;
                        getData("minScoreOfSchool", parameters);
                      }
                      paramDict.local_batch_id.forEach((v, k) => {
                        if (v != "" && v == valueIfNull(previousState['local_batch_id'], v)) {
                          previousState['local_batch_id'] = "";
                          parameters['local_batch_id'] = v;
                          if (category == "enrollPlanOfSchool") {
                            parameters['page'] = 1;
                            getData("enrollPlanOfSchool", parameters);
                          }
                          if (category == "majorScoreOfSchool") {
                            parameters['page'] = 1;
                            getData("majorScoreOfSchool", parameters);
                          }
                        }
                      });
                    }
                  });
                }
              });
            }
          });
        }
      });
    }
    return prikeys;
};

module.exports = {
    baseDir : baseDir,
    log : log,
    getPreviousState : getPreviousState,
    getData : getData,
    getDataWithInputKeys : getDataWithInputKeys
};