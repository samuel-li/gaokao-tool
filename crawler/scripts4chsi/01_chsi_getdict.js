const syncFetch=require('sync-request');
const fs = require('fs');

let dictURL= {
  'base' : 'https://gaokao.chsi.com.cn/zyk/zybk',
  'access_level' : ["ccCategory", 'mlCategory', 'xkCategory', 'specialityesByCategory','ksyx'],
};
var baseDir = "output/";
var filepath = baseDir + "专业列表.csv";
var page = 0;
var schema = {
  "category" : "招生类别",
  "ccCategory" : "类别",
  "mlCategory" : "门类",
  "xkCategory" : "专业类",
  "specialityesByCategory" : "专业名称",
}

var fileHandlers = {};

function getDict(code, curLevel, endLevel) {
  if (curLevel < endLevel) {
    let category = dictURL.access_level[curLevel];
    let url = "";
    if (curLevel == 4) {
      url = dictURL.base + "/" + category + "?ssdm=&specId="+code;
    } else {
      url = dictURL.base + "/" + category + (code!=""?"/"+code:"");
    }
    let ws = null;
    if (fileHandlers[category] != null) {
      ws = fileHandlers[category];
    } else {
      ws = fs.createWriteStream(baseDir + "/" + category + ".csv");
      fileHandlers[category] = ws;
    }
    console.log("Access:"+curLevel+":"+url);
    // {"msg":[{"key":"1050","name":"本科（普通教育）"},{"key":"1070","name":"本科（职业教育）"},{"key":"1060","name":"高职（专科）"}],"flag":true}
    const response = syncFetch("GET", url);
    if(response.statusCode == 200) {
      const data = response.body;
      if (curLevel <= 3) {
        parseData(curLevel, endLevel, data, code, ws);
      } else if (curLevel == 4) {
        parseSpecialData(data, code, ws);
      } 
    } else {
      console.log("Fail!");
    }
  }
}

function parseData(curLevel, endLevel, data, parentCode, fileHandler) {
  let dataObj = JSON.parse(data);
  let line = [];
  if (dataObj.msg!=null && dataObj.msg.length > 0) {
    for(idx in dataObj.msg) {
      let content = "";
      if (curLevel == 3) {
        content = dataObj.msg[idx].zydm + "," + dataObj.msg[idx].zymc + "," + dataObj.msg[idx].specId + "," + dataObj.msg[idx].zymyd + "," + parentCode + "\n";
      } else {
        content = dataObj.msg[idx].key + "," + dataObj.msg[idx].name + "," + parentCode + "\n";
      }
      console.log(content);
      fileHandler.write(content);
      if (curLevel <= endLevel) {
        let code = curLevel==3?dataObj.msg[idx].specId:dataObj.msg[idx].key;
        getDict(code, curLevel+1, endLevel);
      }
    }
  }
}

function parseSpecialData(data, parentCode, fileHandler) {
  let dataObj = JSON.parse(data);
  console.log(parentCode + " has " + dataObj.msg.zymc);
  if (dataObj.msg!=null) {
    let zymc = dataObj.msg.zymc;
    let ssdmList = {};
    for (idx in dataObj.msg.ssdmList) {
      code = (dataObj.msg.ssdmList[idx].code=""?"all":dataObj.msg.ssdmList[idx].code);
      ssdmList[code]=dataObj.msg.ssdmList[idx].ssmc;
    }
    /** 
    {
      "yxdm": "10003",
      "yxmc": "清华大学",
      "ssdm": "11",
      "zytjRank": 4.5,
      "zytjCount": 118,
      "mydList": [
          {
              "type": "3",
              "typeDesc": "综合满意度",
              "rank": 4.4,
              "count": 138
          },
          {
              "type": "0",
              "typeDesc": "办学条件满意度",
              "rank": 4.4,
              "count": 137
          },
          {
              "type": "1",
              "typeDesc": "教学质量满意度",
              "rank": 4.4,
              "count": 134
          },
          {
              "type": "2",
              "typeDesc": "就业满意度",
              "rank": 4.3,
              "count": 133
          }
      ],
      "schId": "73394526",
      "academeId": "3"
  }
  */
  for(idx in dataObj.msg.schSpecList) {
      let lineDataObj = dataObj.msg.schSpecList[idx];
      let lineData = [];
      lineData.push(lineDataObj.yxdm);
      lineData.push(lineDataObj.yxmc);
      lineData.push(lineDataObj.ssdm);
      lineData.push(ssdmList[lineDataObj.ssdm]);
      lineData.push(lineDataObj.zytjRank);
      lineData.push(lineDataObj.zytjCount);
      if (lineDataObj.mydList!=null && lineDataObj.mydList.length> 0) {
        lineData.push(lineDataObj.mydList[0]['rank']!=null?lineDataObj.mydList[0].rank:"");
        lineData.push(lineDataObj.mydList[1]['rank']!=null?lineDataObj.mydList[1].rank:"");
        lineData.push(lineDataObj.mydList[2]['rank']!=null?lineDataObj.mydList[2].rank:"");
        lineData.push(lineDataObj.mydList[3]['rank']!=null?lineDataObj.mydList[3].rank:"");
      }
      let content = lineData.join(',');
      console.log(content);
      fileHandler.write(content + "\n");
    }
  }
}

for (idx in dictURL.access_level) {
  category = dictURL.access_level[idx];
  fileHandlers[category] = fs.createWriteStream(baseDir + "/" + category + ".csv");
}

try{
  getDict("", 0, 5);
} catch (err) {
  console.log(err);
}

for(level in fileHandlers) {
  console.log("Close " + level + ".csv");
  fileHandlers[level].end();
}