# School Code data
From : https://static-data.gaokao.cn/www/2.0/school/school_code.json
Ref link ： https://www.gaokao.cn/school/search

# 一分一段
Data : https://static-data.gaokao.cn/www/2.0/section2021/2023/21/2074/3/lists.json
Ref link : https://www.gaokao.cn/colleges/bypart


# Gaokao data dictionary
gaokao_cn_dict.json

# Schools
From : https://api.zjzw.cn/web/api/?keyword=&page=1&province_id=&ranktype=&request_type=1&size=20&type=&uri=apidata/api/gkv3/school/lists&signsafe=779d4950c08e945c62f0905010684c02

# 分数线
Link : https://api.zjzw.cn/web/api/?e_sort=zslx_rank,min&e_sorttype=desc,desc&local_province_id=21&local_type_id=2073&page=1&school_id=134&size=10&uri=apidata/api/gk/score/province&year=2023&signsafe=20a0c6e4136403201255cea673468ecc

# 招生计划
https://api.zjzw.cn/web/api/?local_batch_id=14&local_province_id=21&local_type_id=2073&page=1&school_id=140&size=10&special_group=&uri=apidata/api/gkv3/plan/school&year=2023&signsafe=a4bf8b8f5b11749ace63a643cf33636e
{
    "code": "0000",
    "message": "成功---success",
    "data": {
        "item": [
            {
                "first_km": "70000",
                "length": "4",
                "level2_name": "--",
                "local_batch_name": "本科批",
                "local_type_name": "物理类",
                "name": "清华大学",
                "num": "36",
                "province_name": "北京",
                "school_id": "140",
                "sg_fxk": "",
                "sg_info": "",
                "sg_name": "",
                "sg_sxk": "",
                "sg_type": 0,
                "sp_fxk": "70000",
                "sp_info": "首选物理，再选不限",
                "sp_sxk": "70008",
                "sp_type": "80001",
                "sp_xuanke": "70000_70001_70002,70000_70001_70003,70000_70001_70005,70000_70002_70003,70000_70002_70005,70000_70003_70005",
                "spcode": "0",
                "special_group": "0",
                "spname": "理科试验班类（物理基础类）（物理学）（等专业）",
                "tuition": "5000",
                "year": "2023"
            },
            {
                "first_km": "70000",
                "length": "8",//学制
                "level2_name": "医学",
                "local_batch_name": "本科批",
                "local_type_name": "物理类",
                "name": "清华大学",
                "num": "5", //招生人数
                "province_name": "北京",
                "school_id": "140",
                "sg_fxk": "",
                "sg_info": "",
                "sg_name": "",
                "sg_sxk": "",
                "sg_type": 0,
                "sp_fxk": "70000",
                "sp_info": "首选物理，再选化学",
                "sp_sxk": "70001",
                "sp_type": "80003",
                "sp_xuanke": "70000_70001_70002,70000_70001_70003,70000_70001_70005",
                "spcode": "1002",
                "special_group": "0",
                "spname": "临床医学类（临床医学）",
                "tuition": "5000", //学费
                "year": "2023"
            }
        ],
        "numFound": 2
    },
    "location": "",
    "encrydata": ""
}

# 分数线
https://api.zjzw.cn/web/api/?local_batch_id=14&local_province_id=21&local_type_id=2073&page=1&school_id=140&size=10&special_group=&uri=apidata/api/gk/score/special&year=2023&signsafe=3f0e02fedd1c7677ff4bde9a62b84a0f
{
    "code": "0000",
    "message": "成功---success",
    "data": {
        "item": [
            {
                "average": "-",
                "doublehigh": 0,
                "dual_class_name": "",
                "first_km": 70000,
                "id": "gkspecialscore202345583",
                "is_top": 2,
                "local_batch_name": "本科批",
                "local_province_name": "辽宁",
                "local_type_name": "物理类",
                "max": "-",
                "min": 697, // 最低分
                "min_section": 85, //最低位次
                "name": "清华大学",
                "proscore": 360,
                "school_id": 140,
                "sg_fxk": "",
                "sg_info": "",
                "sg_name": "",
                "sg_sxk": "",
                "sg_type": 0,
                "single": "",
                "sp_fxk": "70000",
                "sp_info": "首选物理，再选化学",
                "sp_sxk": "70001",
                "sp_type": 80003,
                "spe_id": 1383,
                "special_group": 0,
                "special_id": 95811,
                "spname": "临床医学类（临床医学）",
                "year": 2023,
                "zslx_name": "-"
            },
            {
                "average": "-",
                "doublehigh": 0,
                "dual_class_name": "",
                "first_km": 70000,
                "id": "gkspecialscore202345582",
                "is_top": 2,
                "local_batch_name": "本科批",
                "local_province_name": "辽宁",
                "local_type_name": "物理类",
                "max": "-",
                "min": 697,
                "min_section": 85,
                "name": "清华大学",
                "proscore": 360,
                "school_id": 140,
                "sg_fxk": "",
                "sg_info": "",
                "sg_name": "",
                "sg_sxk": "",
                "sg_type": 0,
                "single": "",
                "sp_fxk": "70000",
                "sp_info": "首选物理，再选不限",
                "sp_sxk": "70008",
                "sp_type": 80001,
                "spe_id": 2722,
                "special_group": 0,
                "special_id": 95813,
                "spname": "理科试验班类（物理基础类）（物理学（等专业））",
                "year": 2023,
                "zslx_name": "-"
            }
        ],
        "numFound": 2
    },
    "location": "",
    "encrydata": ""
}
