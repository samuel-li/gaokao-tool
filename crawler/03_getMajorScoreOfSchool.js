const fs = require('fs');
let crawler = require('./lib/gaokao-cn-crawler.js');

let category = "majorScoreOfSchool";
let previousState = crawler.getPreviousState(category);
if (previousState['status'] != null && previousState['status'] == 'success') {
  crawler.log('All data have been ingested, Please remove the state file if you want to start from begining.');
  return 0;
}

// Data ingestion
crawler.getDataWithInputKeys(
  category, 
  crawler.baseDir + "/schoolData_prikeys.csv", 
  previousState['params']!=null?previousState["params"]:{}
);


return 0;