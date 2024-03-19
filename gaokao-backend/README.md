# 按位次范围查询意向专业的大学及相关专业

## Requirements

- Node.js

## How to run?

With Docker
```
sudo docker-compose up -d
```

With npm

```
$ npm install
$ npm start

# testing
$ npm test

```
## 服务端口
默认 3001

# `数据库密码要修改，数据安全放心头`

## 主要文件  
- server.js

## APIs
### 按位次范围查询意向专业的大学及相关专业，返回值以大学分组
- GET /school/section/:minnum/:maxnum?major=majorA,majorB,majorC
## 其它
### 按分数范围查询意向专业的大学及相关专业，返回值以大学分组
- GET /school/score/:minnum/:maxnum?major=majorA,majorB,majorC&year=2023&size=numberOfItems  
### 按分数范围查询意向专业的大学及相关专业，返回值按年度和位次排名
- GET /score/:minnum/:maxnum?major=majorA,majorB,majorC&year=2023&size=numberOfItems   
### 按位次范围查询意向专业的大学及相关专业，返回值按年度和位次排名
- GET /section/:minnum/:maxnum?major=majorA,majorB,majorC&year=2023&&size=numberOfItems  
## 参数说明
- minnum : 查询分数或位次范围的最小值
- maxnum : 查询分数或位次范围的最大值
- major : 要查询的专业关键字，多个专业之间以逗号分割
- year : 要查询的高考年份，默认所有
- size : 返回的最大条目数，默认全部
