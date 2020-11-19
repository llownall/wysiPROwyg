<template>
  <span class="wysiwyg-math-formula"
        contenteditable="false"
        v-show="show"
        ref="formula"
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
        window.katex.render(`${this.latex}`, this.$refs.formula, {
          throwOnError: false,
          output: 'html',
        });

        this.$refs.formula.innerHTML = ' ' + this.$refs.formula.innerHTML + ' ';

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
  padding: 4px;
  cursor: pointer;
  user-select: none;
}
</style>
