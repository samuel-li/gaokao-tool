<script setup>
import QuerySchoolResult from "../components/QuerySchoolResult.vue"
import axios from 'axios'
import { reactive, ref } from 'vue'

import Multiselect from '@vueform/multiselect'

const selectedProvinces = ref([]);
const provinces = ref([]);

const queryObj = reactive({
  minsec: 2000,
  maxsec: 6000,
  majors: "计算机,电子信息,自动化",
  minsecplaceholder: '',
  maxsecplaceholder: ''
});

let navLink = {
  '一分一段表-查询位次使用': {
    url: 'https://www.gaokao.cn/colleges/bypart',
    desc: '在这里可以看看你的分数在往年处于什么位次'
  },
  '掌上高考': {
    url: 'https://gaokao.cn',
    desc: '高考相关数据准确齐全，组织合理'
  },
  '软科': {
    url: 'https://www.shanghairanking.cn/',
    desc: '学校及专业排名的权威数据'
  },
  '阳光高考': {
    url: 'https://gaokao.chsi.com.cn/',
    desc: '教育部高校招生阳光工程指定平台'
  },
  '辽宁招生考试之窗': {
    url: 'https://www.lnzsks.com/',
    desc: '典型官网风格，主管单位：辽宁省高中等教育招生考试委员会办公室'
  },
}

// import dataSet from '../assets/result.json'
const dataSet = ref({});
const dataObj = reactive({ dataSet });

axios.get('/api/getprov/').then(res => {
  if (res.status == 200) {
    provinces.value = res.data;
  }
}).catch(err => {
  console.log(err);
});


function querySchoolBySec() {
  let canBeSubmitted = true;
  if (queryObj.minsec == "") {
    canBeSubmitted = false;
    queryObj.minsecplaceholder = '必填';
  }
  if (queryObj.maxsec == "") {
    canBeSubmitted = false;
    queryObj.maxsecplaceholder = '必填';
  }
  if (!canBeSubmitted) {
    return;
  }
  if (queryObj.minsec == "") {
    queryObj.minsec = 0;
  }
  if (queryObj.maxsec == "") {
    queryObj.maxsec = '输入最大范围值';
    return;
  }
  // console.log("Query:" + 'http://localhost:3001/schools/section/'+queryObj.minsec+'/'+queryObj.maxsec+'?major='+queryObj.majors); 
  axios.get('/api/schools/section/' + queryObj.minsec + '/' + queryObj.maxsec 
            + '?provinces='+selectedProvinces.value.join(',')
            +'&major=' + queryObj.majors)
    .then(res => {
      if (res.status == 200) {
        dataSet.value = res.data;
        // console.log(dataObj.dataSet); 
      }
    })
    .catch(err => { console.log(err); });
}

let gaokaourl = (school_id) => { return "https://www.gaokao.cn/school/" + school_id + "/provinceline" };

</script>

<template>
  <p class="querytitle">
    2024年辽宁物理类志愿填报工具（辽宁，理工科，普通批次）- 2024年预计考生20.51万，2023年19.6万<br />
    <span style="font-size: small;color:red;font-style:oblique;">(仅供按位次初筛志愿使用，具体报考建议参考以下网站)</span>
  </p>
  <div class="queryarea">
    <div>
      位次范围<span style="color:red;">*</span>：
      <input v-model.number="queryObj.minsec" :placeholder="queryObj.minsecplaceholder" class="num"> ~ <input
        v-model.number="queryObj.maxsec" :placeholder="queryObj.maxsecplaceholder" class="num" />
    </div>
    <div>
      专业类别:
      <input v-model="queryObj.majors">
    </div>
    <div>
      <Multiselect v-model="selectedProvinces" mode="tags" :close-on-select="false" :searchable="true"
        :create-option="false" value-prop="id" track-by="name" label="name" placeholder="选择目标省份" :options="provinces" />
    </div>
    <div>
      <button @click="querySchoolBySec()">查&nbsp;询</button>
    </div>
  </div>
  <nav>
    <span v-for="(navitem, name) in navLink">
      <a :href="navitem['url']" target="_blank" :title="navitem['desc']">
        <img src="../assets/link.png" style="width:25px;height:25px;padding-right:5px;position:relative;top:3px;"
          :title="navitem['desc']" />
        {{ name }}
      </a>
    </span>
  </nav>
  <hr />
  <QuerySchoolResult :dataObj="dataObj.dataSet" />
</template>

<style src="@vueform/multiselect/themes/default.css"></style>
<style>
@media (min-width: 1024px) {}

.queryarea {
  /* min-height: 7vh; */
  display: grid;
  align-items: center;
  grid-template-columns: 1fr 1fr 1fr 1fr;
  text-align: center;
  margin-bottom: 20px;
}

.querytitle {
  text-align: center;
  font-size: x-large;
  font-weight: bold;
}

.queryarea div {
  padding-right: 15px;
}

hr {
  width: 100%;
}

.num {
  width: 50px;
}

nav {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr 1fr 1fr;
  text-align: center;
  padding-bottom: 15px;
}

nav a {
  font-size: large;
  color: cadetblue;
  min-width: 40px;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}

button {
  width: 80px;
  background-color: cadetblue;
  border-color: white lightgray lightgray white;
  border-radius: 10px;
  font-weight: bold;
  color: white;
  height: 30px;
}

.multiselect {
  align-items: center;
  background: var(--ms-bg, #fff);
  border: var(--ms-border-width, 1px) solid var(--ms-border-color, #d1d5db);
  border-radius: var(--ms-radius, 4px);
  box-sizing: border-box;
  cursor: pointer;
  display: flex;
  font-size: var(--ms-font-size, 1rem);
  justify-content: flex-end;
  margin: 0 auto;
  /* min-height: calc(var(--ms-border-width, 1px)*2 + var(--ms-font-size, 1rem)*var(--ms-line-height, 1.375) + var(--ms-py, .5rem)*2); */
  outline: none;
  position: relative;
  width: 100%;
  padding: 0;
}

.multiselect-wrapper {
  align-items: center;
  box-sizing: border-box;
  cursor: pointer;
  display: flex;
  justify-content: flex-end;
  margin: 0 auto;
  /* min-height: calc(var(--ms-border-width, 1px)*2 + var(--ms-font-size, 1rem)*var(--ms-line-height, 1.375) + var(--ms-py, .5rem)*2); */
  outline: none;
  position: relative;
  width: 100%;
  padding: 0;
}
</style>