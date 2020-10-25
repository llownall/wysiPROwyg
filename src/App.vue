<template>
  <div id="app">
    <div id="nav">
      <router-link to="/jax">wysiwygMath - MathJax</router-link>
      <!--      |-->
      <!--      <router-link to="/quill">wysiwygMath - MathQuill</router-link>-->
    </div>
    <div style="padding: 40px">
      <keep-alive>
        <router-view/>
      </keep-alive>
    </div>
  </div>
</template>

<script>
export default {
  created() {
    if (this.$router.currentRoute.path !== '/jax')
      this.$router.push('/jax');
  }
}
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: #2c3e50;
}

#nav {
  padding: 30px;
  text-align: center;
}

#nav a {
  font-weight: bold;
  color: #2c3e50;
}

#nav a.router-link-exact-active {
  color: #42b983;
}
</style>
