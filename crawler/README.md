# !!!注意：尊重数据版权，仅限自用
## 代码列表
- lib/gaokao-cn-crawler.js
- 02_getSchoolData.js
- 03_getMinScoreOfSchool.js
- 04_getMajorScoreOfSchool.js
- 05_enrollPlanOfSchool.js

## 配置项
```
let paramDict = {
  "local_province_id": [21],     // 哪些省的数据   14 - 辽宁
  "local_type_id": [2073, 2074], // 哪些类别的专业 2073-物理类  2074-历史类
  "local_batch_id": [14],        // 哪些批次       14-普通批 10-专科批
  "year": [2021, 2022, 2023]     // 哪些年的数据
}
```
相关code可以在reference/gaokao_cn_dict.json中查找相应定义

## Data Structure:
- 用于参考的数据样例 :  ./reference  
- 存放抓取的数据文件 ： ./output/
- 存放运行时状态文件 :  ./state/
- 表定义文件(人工整理，不保证准确性)： schemas/

## 运行 
1. 创建output和state目录  
2. 抓取学校数据  
```node 01_getSchoolData.js```
3. 抓取所有学校投档的最低分数及位次,抓取范围在配置项中设定  
```node 02_getMinScoreOfSchool.js```
4. 抓取所有学校专业的最低分数及位次,抓取范围在配置项中设定  
```node 03_getMajorScoreOfSchool.js```
5. 抓取所有学校招生计划,抓取范围在配置项中设定  
```node 04_enrollPlanOfSchool.js```
6. 抓取所有所有专业的基本信息  
```node 05_getMajorInfo.js```
7. 软科里的大学ID及名称 
```node 05_getMajorInfo.js```

## 运行注意事项  
1. 学校数据需要先抓取（01_getSchoolData.js）完成才能进行抓取其它数据。
2. 所有步骤均支持断点恢复，可以重复运抓取剩余数据。
3. 如果准备重新抓取某个数据，需要把state下面对应的状态文件删除，并删除output下面的数据文件。

## Hackton
1. gaokao-cn-crawler.js 中每个请求的间隔是随机1~5秒，可以自行修改提速，但是如果访问过于频繁会被平台方关小黑屋15分钟。提速代码参考:  
```delay(1000); => delay(100);```

## 未完成
1. 不同省份的录取逻辑有区别，目前只处理了辽宁省的数据 （2021~2023年份，普通本科批，物理类/历史类), 其它省份请自行修改代码处理


# 其它文件：
00_generateDDL.js : 读取schemas下的文件输入DDL内容 （目前只支持mysql)


