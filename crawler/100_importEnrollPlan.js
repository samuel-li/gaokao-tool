const fs = require('fs');  
const mysql = require('mysql2');  
const csv = require('csv-parser');  
  
// MySQL连接配置  
const dbConfig = {  
  host: '172.30.165.94',  
  user: 'root',  
  password: 'asdf1234',  
  database: 'gaokaodb'  
};  
  
// 创建MySQL连接  
const connection = mysql.createConnection(dbConfig);  
  
// 连接到MySQL数据库  
connection.connect((err) => {  
  if (err) {  
    console.error('Error connecting to MySQL database:', err);  
    return;  
  }  
  console.log('Connected to MySQL database');  
  
  // 读取CSV文件并解析  
  fs.createReadStream('output/enrollPlanOfSchool_temp.csv')  
    .pipe(csv())  
    .on('headers', (headers) => {  
      // 打印CSV文件的列名  
      console.log(headers);  
    })  
    .on('data', (dataRow) => {  
      console.log(dataRow.spname);
      // 将CSV文件的一行数据插入到MySQL数据库中  
      const sql = 'INSERT INTO enrollPlan SET ?';  
      const insertData = {  
        first_km:dataRow.first_km,
        length:dataRow.length,
        level2_name:dataRow.level2_name,
        local_batch_name:dataRow.local_batch_name,
        local_type_name:dataRow.local_type_name,
        name:dataRow.name,
        num:dataRow.num,
        province_name:dataRow.province_name,
        school_id:dataRow.school_id,
        sg_fxk:dataRow.sg_fxk,
        sg_info:dataRow.sg_info,
        sg_name:dataRow.sg_name,
        sg_sxk:dataRow.sg_sxk,
        sg_type:dataRow.sg_type,
        sp_fxk:dataRow.sp_fxk,
        sp_info:dataRow.sp_info,
        sp_sxk:dataRow.sp_sxk,
        sp_type:dataRow.sp_type,
        sp_xuanke:dataRow.sp_xuanke,
        spcode:dataRow.spcode,
        special_group:dataRow.special_group,
        spname:dataRow.spname,
        tuition:dataRow.tuition,
        year:dataRow.year
      };  
      connection.query(sql, insertData, (err, result) => {  
        if (err) {  
          console.error('Error inserting data into MySQL:', err);  
          return;  
        }  
        console.log(`Inserted row: ${result.insertId}`);  
      });  
    })  
    .on('end', () => {  
      console.log('CSV file imported successfully');  
      connection.end(); // 关闭MySQL连接  
    })  
    .on('error', (err) => {  
      console.error('Error reading CSV file:', err);  
    });  
});