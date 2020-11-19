<template>
  <transition name="fade">
    <div class="modal-mask" v-show="showModal">
      <div class="modal-wrapper">
        <div class="modal-dialog" role="document">
          <div class="modal-content">
            <div class="modal-header">
              <h5 class="modal-title">{{ isInEditMode ? 'Редактировать формулу' : 'Вставить формулу' }}</h5>
              <button type="button" class="close" data-dismiss="modal" aria-label="Close" @click="showModal = false">
                <span aria-hidden="true">&times;</span>
              </button>
            </div>
            <div class="modal-body">
              <div class="d-flex mb-3">
                <div class="d-flex">
                  <div style="position:relative;"
                  >
                    <div class="py-1 px-2 text-center section-button"
                         :class="{'expanded': showLetters}"
                         @click="showLetters = !showLetters"
                         @focusout="hideSelf"
                         tabindex="0"
                    >
                      \(\alpha \beta \delta\)
                    </div>
                    <div v-show="showLetters"
                         style="z-index: 100; background-color: #ffffff; position: absolute; top: 100%; left: 0;
                           margin-top: 8px; border: black 1px solid; border-radius: 4px; padding: 4px;
                           display: grid; grid-template-columns: repeat(8, 1fr); flex-wrap: wrap; text-align: center"
                         @mousedown="preventHide"
                    >
                      <div v-for="(letter, index) in letters"
                           :key="index"
                           @click="insertLetter(letter)"
                           class="letter"
                      >
                        \( {{ letter }} \)
                      </div>
                    </div>
                  </div>

                  <div style="position:relative;"
                       class="ml-2"
                  >
                    <div class="py-1 px-2 text-center section-button"
                         :class="{'expanded': showOperators}"
                         @click="showOperators = !showOperators"
                         @focusout="hideSelf"
                         tabindex="0"
                    >
                      \(\sum\)
                    </div>
                    <div v-show="showOperators"
                         class=""
                         style="z-index: 100; background-color: #ffffff; position: absolute; top: 100%; left: 0;
                           margin-top: 8px; border: black 1px solid; border-radius: 4px; padding: 4px;
                           display: grid; grid-template-columns: repeat(4, 1fr); flex-wrap: wrap; text-align: center"
                         @mousedown="preventHide"
                    >
                      <div v-for="(operator, index) in operators"
                           :key="index"
                           @click="insertOperator(operator)"
                           class="letter"
                      >
                        \({{ operator }}\)
                      </div>
                    </div>
                  </div>

                  <div style="position:relative;"
                       class="ml-2"
                  >
                    <div class="py-1 px-2 text-center section-button"
                         :class="{'expanded': showSymbols}"
                         @click="showSymbols = !showSymbols"
                         @focusout="hideSelf"
                         tabindex="0"
                    >
                      \(\neq\)
                    </div>
                    <div v-show="showSymbols"
                         class=""
                         style="z-index: 100; background-color: #ffffff; position: absolute; top: 100%; left: 0;
                           margin-top: 8px; border: black 1px solid; border-radius: 4px; padding: 4px;
                           display: grid; grid-template-columns: repeat(7, 1fr); flex-wrap: wrap; text-align: center"
                         @mousedown="preventHide"
                    >
                      <div v-for="(symbol, index) in symbols"
                           :key="index"
                           @click="insertSymbol(symbol)"
                           class="letter"
                      >
                        \({{ symbol }}\)
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <textarea v-model="formula"
                        style="width: 100%"
                        rows="3"
                        @click="updateFormulaCursorPos"
                        @keydown="updateFormulaCursorPos"
                        ref="formulaTextarea"
                        autofocus
              ></textarea>

              <div style="font-weight: bolder; margin: .8rem 0 .4rem">Результат:</div>
              <div ref="formulaPreview" style="margin: .5rem 0; height: 40px"></div>
            </div>
            <div class="modal-footer">
              <button type="button" class="btn btn-secondary" @click="showModal = false">Отмена</button>
              <button type="button" class="btn btn-primary"
                      v-if="isInEditMode"
                      @click="saveFormula"
              >Сохранить
              </button>
              <button type="button" class="btn btn-primary"
                      v-else
                      @click="addFormula"
              >Добавить
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </transition>
</template>

<script>
import mathFormula from "@/components/mathFormula";

export default {
  name: 'wysiwygMath',
  components: {
    // eslint-disable-next-line vue/no-unused-components
    mathFormula
  },
  props: {
    isInEditMode: {
      type: Boolean,
      default: false
    },
  },
  data: function () {
    return {
      showModal: false,
      updateFormulaTimeout: null,

      formula: '',
      data: null,

      showLetters: false,
      showOperators: false,
      showSymbols: false,

      preventHideFlag: false,
      changeOpacity: false,

      letters: [
        '\\alpha',
        '\\beta',
        '\\gamma',
        '\\delta',
        '\\epsilon',
        '\\zeta',
        '\\eta',
        '\\theta',
        '\\iota',
        '\\kappa',
        '\\lambda',
        '\\mu',
        '\\nu',
        '\\pi',
        '\\rho',
        '\\sigma',
        '\\tau',
        '\\upsilon',
        '\\phi',
        '\\chi',
        '\\psi',
        '\\omega',
      ],

      operators: [
        '\\sqrt{ab}',
        '\\sqrt[n]{ab}',
        '\\log_{a}{b}',
        '\\lg{ab}',
        'a^{b}',
        'a_{b} c_a^b',
        'c_a^b',
        '\\widetilde{ab}',
        '\\widehat{ab}',
        '\\overrightarrow{ab}',
        '\\overline{ab}',
        '\\frac{ab}{cd}',
        '\\frac{\\partial a}{\\partial b}',
        '\\frac{\\text{d}x}{\\text{d}y}',
        '\\lim_{a \\rightarrow b}',
        '\\int_{a}^{b}',
        '\\prod_a^b',
        '\\bigcap_a^b',
        '\\bigcup_a^b',
        '\\sum_a^b',
        '\\left(\\begin{array}{c}a\\\\ b\\end{array}\\right)',
        '\\begin{bmatrix}a & b \\\\c & d \\end{bmatrix}',
        '\\begin{cases}a & x = 0\\\\b & x > 0\\end{cases}',
      ],

      symbols: [
        '\\times',
        '\\div',
        '\\pm',
        '\\mp',
        '\\cdot',
        '\\star',
        '\\neq',
        '\\leq',
        '\\geq',
        '\\sim',
        '\\approx',
        '\\cong',
        '\\equiv',
        '\\ll',
        '\\gg',
        '\\in',
        '\\subset',
        '\\subseteq',
        '\\ni',
        '\\models',
        '\\vdash',
        '\\perp',
        '\\mid',
        '\\parallel',
        '\\hat{a}',
        '\\check{a}',
        '\\acute{a}',
        '\\tilde{a}',
        '\\bar{a}',
        '\\vec{a}',
        '\\dot{a}',
        '\\ddot{a}',
        '\\leftarrow',
        '\\Leftarrow',
        '\\rightarrow',
        '\\Rightarrow',
        '\\leftrightarrow',
        '\\Leftrightarrow',
        '\\exists',
        '\\forall',
        '\\triangle',
        '\\triangledown',
      ],
    }
  },
  watch: {
    formula() {
      if (this.updateFormulaTimeout)
        clearTimeout(this.updateFormulaTimeout);

      this.updateFormulaTimeout = setTimeout(() => {
        // this.$refs.formulaPreview.style.opacity = 0;
        this.$refs.formulaPreview.innerHTML = `\\(${this.formula}\\)`;
        window.MathJax.typeset();

        if (this.changeOpacity) {
          this.$refs.formulaPreview.style.opacity = 1;
          this.changeOpacity = false;
        }
      }, 1500);
    },

    // showLetters() {
    //   if (this.showLetters) {
    //     this.showOperators = false;
    //     this.showSymbols = false;
    //   }
    // },
    // showOperators() {
    //   if (this.showOperators) {
    //     this.showLetters = false;
    //     this.showSymbols = false;
    //   }
    // },
    // showSymbols() {
    //   if (this.showSymbols) {
    //     this.showLetters = false;
    //     this.showOperators = false;
    //   }
    // },
  },
  methods: {
    toggle(data = null) {
      this.data = data;

      if (this.isInEditMode) {
        this.$refs.formulaPreview.style.opacity = 0;
        this.changeOpacity = true;
        this.formula = data.latex;
      }

      if (this.formula)
        this.$refs.formulaPreview.innerHTML = `\\(${this.formula}\\)`;
      else
        this.$refs.formulaPreview.innerHTML = '';

      this.showModal = true;

      // setTimeout(() => {
      //   this.$refs.formulaTextarea.focus();
      // }, 100);
    },

    test() {
      console.log('123');
    },

    preventHide() {
      this.preventHideFlag = true;
    },

    hideSelf() {
      if (!this.preventHideFlag) {
        this.showLetters = false;
        this.showOperators = false;
        this.showSymbols = false;
      } else {
        this.preventHideFlag = !this.preventHideFlag;
      }
    },

    updateData() {
      this.data = this.$refs.textarea.innerHTML;
    },

    updateFormulaCursorPos(event) {
      this.formulaCursorPos = event.target.selectionStart;
    },

    insertToFormula(symbol) {
      if (this.formulaCursorPos !== undefined) {
        this.formula = this.formula.slice(0, this.formulaCursorPos) + ` ${symbol} ` + this.formula.slice(this.formulaCursorPos);
      } else {
        this.formula += ` ${symbol} `;
      }
    },
    insertLetter(symbol) {
      this.showLetters = false;
      this.insertToFormula(symbol);
    },
    insertOperator(symbol) {
      this.showOperators = false;
      this.insertToFormula(symbol);
    },
    insertSymbol(symbol) {
      this.showSymbols = false;
      this.insertToFormula(symbol);
    },

    addFormula() {
      this.showModal = false;
      this.$emit('insert-latex', this.formula);
    },

    editFormula() {
      console.log('editFormula')
    },

    saveFormula() {
      this.showModal = false;
      this.data.latex = this.formula;
      this.$emit('insert-latex', this.data);
    },
  },
}
</script>

<style>
@import 'https://stackpath.bootstrapcdn.com/bootstrap/4.4.1/css/bootstrap.min.css';
@import 'https://use.fontawesome.com/releases/v5.2.0/css/all.css';
@import 'https://fonts.googleapis.com/icon?family=Material+Icons';

.letter {
  padding: 2px 4px;
  margin: 1px;
  display: flex;
  justify-content: center;
  align-items: center;
}

.letter:hover {
  background-color: #e2e2e2;
  margin: 0;
  border: 1px solid #868686;
  border-radius: 3px;
}

.formula {
  cursor: pointer;
}

.section-button {
  outline: none !important;
  background-color: #ffffff;
  position:relative;
  cursor: pointer;
  user-select: none;
  margin: 1px;
  border: rgb(133, 133, 133) solid 1px;
  border-radius: 4px
}

.expanded {
  background-color: #e9e9e9 !important;
}
</style>
