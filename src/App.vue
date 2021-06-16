<template>
  <!-- <img alt="Vue logo" src="./assets/logo.png"> -->
  <!-- <HelloWorld msg="Welcome to Your Vue.js App" /> -->
  <fast-design-system-provider use-defaults background-color="#F7F7F7">
    <perfect-scrollbar>
      <div id="app">
        <Index />
        <!-- <img src="http:////www.baidu.com/img/flexible/logo/pc/result.png" /> -->
      </div>
    </perfect-scrollbar>
  </fast-design-system-provider>
</template>

<script>
// import HelloWorld from "./components/HelloWorld.vue";
import Index from "./components/Index.vue";

export default {
  name: "App",
  components: {
    Index,
  },
};
</script>

<style scoped>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  /*color: #2c3e50;*/
  margin-top: 60px;
}
</style>
