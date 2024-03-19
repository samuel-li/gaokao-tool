const fs = require('fs');
let crawler = require('./lib/gaokao-cn-crawler.js');


let category = "majorInfo";

let previousState = crawler.getPreviousState(category);
if (previousState['status'] != null && previousState['status'] == 'success') {
  crawler.log('All data have been ingested, Please remove the state file if you want to start from begining.');
  return 0;
}

crawler.getData(category, (previousState['params']!=null?previousState["params"]:{}));

return 0;