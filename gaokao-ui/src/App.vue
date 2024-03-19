<script setup>
import { RouterLink, RouterView } from 'vue-router'
import {onMounted} from 'vue'

onMounted(() => {
  if (!window.location.href.startsWith('http://101.37.252.181')) {
    window.location.href = 'http://101.37.252.181/';
  }
});
</script>

<template>
  <div class="top_nav">
    <RouterLink to="/">主页-报考工具</RouterLink>
    <RouterLink to="/qa">报考知识点</RouterLink>
  </div>
  <RouterView />
</template>

<style scoped>
header {
  line-height: 1.5;
  max-height: 100vh;
}

.logo {
  display: block;
  margin: 0 auto 2rem;
}

@media (min-width: 1024px) {}
  header {
    display: block;
    place-items: center;
    padding-right: calc(var(--section-gap) / 2);
  }

  .logo {
    margin: 0 2rem 0 0;
  }

  header .wrapper {
    display: flex;
    place-items: flex-start;
    flex-wrap: wrap;
  }

  .top_nav {
    text-align: left;
    /*margin-left: -1rem;*/
    font-size: 1rem;
    padding: 1rem 0;
    margin-top: 1rem;
  }

  .top_nav a{
    font-size:small;
    color:cornflowerblue;
    min-width:40px;
    overflow:hidden;
    text-overflow: ellipsis;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    float: left;
    margin-right: 20px;
  }
</style>
