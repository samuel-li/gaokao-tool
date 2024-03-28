<script setup>
import { watch,ref,reactive } from 'vue';
import axios from 'axios'

const props = defineProps({
    dataObj: {
        type: Object,
        required: true
  }
});

const enrollPlanSet = ref({});
const enrollPlanObj = reactive({enrollPlanSet})

watch(props, (newProp, oldProp)=>{
  if (newProp.dataObj.schools) {
    axios.get('/api/enrollplan/?sids='+newProp.dataObj.schools.join(','))
      .then(res=> { 
          if(res.status == 200) {
            // console.log(res.data); 
            let enrollPlan = {};
            res.data.items.forEach((_item, _idx)=>{
              enrollPlan[_item.school_id]={};
              Object.keys(_item).forEach((_key,_kidx)=>{
                if (_key != 'school_id') {
                  if (_key.startsWith("enroll_num_")) {
                    enrollPlan[_item.school_id][_key.substring(11)]=_item[_key];
                  }
                }
              });
            });
            enrollPlanSet.value = enrollPlan;
            // console.log("Enroll Plan:" + JSON.stringify(enrollPlan));
          }
      }) 
      .catch(err=> { console.log(err); });
  }
});

let gaokaourl = (school_id)=>{return "https://www.gaokao.cn/school/"+school_id+"/provinceline"};
</script>

<template>
  <div class="schoolbox" v-for="(value, key) in props.dataObj.schools">
    <div class="schoolurl">
      <a target="_blank" :href="gaokaourl(value)">{{props.dataObj.schooldict[value]['name']}}</a>
      <a target="_blank" :href="`https://www.shanghairanking.cn/institution/${dataObj.schooldict[value]['rankId']}`" v-if="dataObj.schooldict[value]['rankId']!=''"><img src="../assets/ranklogo.svg"> </a>
      <span v-if="dataObj.schooldict[value]['f985211']-1==10">985</span>
      <span v-if="dataObj.schooldict[value]['f985211']%10==1">211</span>
    </div>
    <div class="majorlist">
        <div v-for="(year) in [2023,2022,2021]">
          <div class="yeartitle">{{year}} <span style="font-size:small;" v-if="enrollPlanObj.enrollPlanSet[value]">(共招{{ enrollPlanObj.enrollPlanSet[value][year] }}人)</span></div>
          <div :class="`majorbox box-${year}`" >
            <div>专业名称</div>
            <div>位次</div>
            <div>招生人数</div>
          </div>
          <div :class="`majorbox box-${year}-${key%2}`" v-if="dataObj[value][year]!=null" v-for="(info, key) in dataObj[value][year]">
            <div :title="info.major_name">{{info.major_name}}</div>
            <div :title="`分数:${info.major_min_score}`">{{info.major_min_section}}<br />
              <span style="font-size: smaller;">({{info.major_min_score}})</span></div>
            <div>{{info.enroll_num}}</div>
          </div>
          <div class="majorbox" v-else>
            <div>&nbsp;</div>
            <div>&nbsp;</div>
            <div>&nbsp;</div>
          </div>
        </div>
    </div>
  </div>
</template>

<style scoped>
  .schoolbox {
    width:100%;
    padding-top:15px;
    padding-bottom:15px;
  }
  .schoolbox a{
    font-size:x-large;
    padding-right: 10px;
  }
  .schoolurl {
    margin-bottom: 20px;
  }
  .schoolurl span{
    font-size: larger;
    padding: 0 15px 2px;
    line-height: 21px;
    text-align: center;
    margin-right: 10px;
    border-radius: 15px;
    min-width: 89px;
    margin-bottom: 4px;
    color: orange;
    border: 1px solid orangered;
  }
  .schoolurl a img {
    width: 60px;
    height: 20px;
    position: relative;
    top: 5px;
    margin : 0 10px;
  }
  .yeartitle {
    font-size : x-large;
    font-weight: bold;
  }
  .majorlist {
    display:grid;
    grid-template-columns: 1fr 1fr 1fr;
    grid-gap: 10px 10px;
  }
  .majorbox {
    margin-right:10px;
    display:grid;grid-template-columns: 3fr 1fr 1fr;
    padding:10px 5px;
  }
  .majorbox div {
    padding:5px;
  }

  .majorbox div:first-child {
    min-width: 40px;
    overflow: hidden;
    text-overflow: ellipsis;
    display: -webkit-box;
    -webkit-line-clamp: 4;
    -webkit-box-orient: vertical;
  }

  @media (min-width: 1024px) {
    .majorbox div:first-child {
      min-width: 40px;
      overflow: inherit;
      -webkit-box-orient: unset;
      -webkit-line-clamp: unset;
      text-overflow: unset;
    }
  }

  .box-2023 {
    background-color: #485460;
    color: white;
  }
  .box-2023-0 {
    background-color: #808e9b;
    color: white;
  }
  .box-2023-1 {
    background-color: #485460;
    color: white;
  }

  .box-2022 {
    background-color: #7f8c8d;
    color: white;
  }
  .box-2022-0 {
    background-color: #95a5a6;
    color: white;
  }
  .box-2022-1 {
    background-color: #7f8c8d;
    color: white;
  }

  .box-2021 {
    background-color: #bdc3c7;
    color: white;
  }
  .box-2021-0 {
    background-color: #ecf0f1;
    color: black;
  }
  .box-2021-1 {
    background-color: #bdc3c7;
    color: white;
  }
</style>
