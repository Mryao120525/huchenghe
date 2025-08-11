<template>
  <!--
    App.vue
    Vue3 前端应用的根组件，负责全局布局和页面容器。
  -->
  <div id="app">
    <router-view></router-view>
  </div>
</template>

<script setup>
// 这里不需要特别的代码，script setup 是 Vue 3 的新语法糖，
// 让组件编写更简洁。
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  /* margin-top: 60px; */
}
</style>