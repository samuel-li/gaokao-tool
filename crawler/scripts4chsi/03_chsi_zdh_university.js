const syncFetch=require('sync-request');
const cheerio = require('cheerio'),
  http = require('http'),
  url = require('url'),
  fs = require('fs'),
  axios = require('axios');

var host = 'https://gaokao.chsi.com.cn/zyk/pub/zytj/recommendTop.action?zymc={zymc}&start=';
var progress = 0; // 0 - new ; 1-on-goning; 2-end; 3-quit
//var host = 'test.html';
var zymc = "自动化";
var baseDir = "output/";
var filepath = baseDir + zymc + "_院校专业关联.csv";
var page = 0;
var dict = {
  "yxmc": "院校名称",
  "yxmc-link": "院校数据链接",
  "ssmc": "院校所在地",
  "yxls": "教育行政主管部门",
  "xlcc": "学历层次",
  "zymc": "专业名称",
  "tjqk": "推荐情况",
  "detail": "详情",
  "detail-link": "详情链接"
};

function parseData(data, fileHandler) {
  let body = "";
  var $ = cheerio.load(data);
  $('head').remove();
  $('style').remove();
  $('div.top-nav-wrapper').remove();
  $('div.div-top').remove();
  $('div.searchForm').remove();
  if ($("div.no-data-page").length > 0) {
    return false;
  }
  categories = ["yxmc a", "ssmc", "yxls", "xlcc", "zymc", "star span.avg_rank"];
  var csvBody = [];
  var itemList = $("div.item-container").each((idx, el) => {
    var line = [];
    for (ci in categories) {
      var lineE = $(el).find('div.item-' + categories[ci])
      if (lineE != null && lineE != undefined) {
        if (lineE.text() != "") {
          line.push(lineE.text().trim());
        }
        if (categories[ci].endsWith(" a")) {
          line.push(lineE.attr().href);
        }
      }
    }
    csvBody.push(line.join(","));
  });
  console.log(csvBody.join("\n"));
  if (fileHandler != null) {
    fileHandler.write(csvBody.join("\n")+"\n");
  }
  return true;
}

// setInterval(()=>{scraper(host)}, 1000*60*15);//15 分钟更新一次
let ws = fs.createWriteStream(filepath);
console.log("Start...\n");
var categories = ["yxmc", "yxmc-link", "ssmc", "yxls", "xlcc", "zymc", "tjqk"];
var csvHeader = [];
for (category in categories) {
  csvHeader.push(dict[categories[category]]);
}
ws.write(csvHeader.join(",")+"\n");
console.log(csvHeader.join(","));
do {
  let url = host.replace("{zymc}", encodeURI(zymc)) + page;
  const response = syncFetch("GET", url);
  if(response.statusCode!=200) {
    throw new Error(`HTTP error! status: `);  
  } else {
    // const data = fs.readFileSync(host);
    const data = response.body;
    hasData = parseData(data, ws);
  }
  page += 20;
} while (hasData);
ws.end();
// http.createServer(function (req, res) {
//   var path = url.parse(req.url).pathname;
//   path = path == '/' ? 0 : parseInt(path.slice(1));
//   res.writeHead(200, {"Content-Type":"text/html"});
//   res.end(html[path]);
// }).listen(3000);

// console.log('Server running at localhost:3000');