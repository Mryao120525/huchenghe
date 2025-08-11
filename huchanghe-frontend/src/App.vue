<!--
  App.vue
  Vue3 前端应用的根组件，负责全局布局和页面容器。

  ## 功能描述
  这是整个前端应用的根组件，使用 Vue 3 的 `<script setup>` 语法糖编写。
  它主要负责提供应用的基本布局结构，并作为路由视图的容器。

  ## 组件结构
  - template: 包含一个 router-view 组件，用于渲染路由匹配的组件
  - script: 使用 Vue 3 的 Composition API 语法糖
  - style: 全局样式定义

  ## 样式说明
  - 设置了应用的字体族和基本外观
  - 添加了字体平滑处理以提高文本渲染质量
  - 居中对齐文本内容
  - 设置了主要文本颜色
-->
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