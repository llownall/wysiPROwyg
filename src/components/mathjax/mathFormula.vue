<template>
  <span class="wysiwyg-math-formula"
        contenteditable="false"
        v-show="show"
        ref="formula"
        v-html="` \\( ${latex} \\) `"
        @dblclick="edit"
  ></span>
</template>

<script>
export default {
  name: 'mathFormula',
  props: {
    latex: String,
  },
  data: function () {
    return {
      show: false,
    }
  },
  methods: {
    edit() {
      // x = {-b \pm \sqrt{b^2-4ac} \over 2a}
      window.bus.$emit('formula-click', {
        element: this.$refs.formula,
        latex: this.latex,
      });
    },
    render() {
      this.show = false;
      setTimeout(() => {
        window.MathJax.typeset();
        this.show = true;
      }, 100);
    },
  },
  mounted() {
    this.render();
  }
}
</script>

<style>
.wysiwyg-math-formula {
  padding: 4px 0;
}
</style>
