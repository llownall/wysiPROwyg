<template>
  <div>
    <div class="d-flex justify-content-end">
      <h3>MathJax</h3>
    </div>

    <transition name="fade">
    <span class="popup"
          v-show="showPopup"
          @mousedown="preventHide"
    >
      <span class="border-right">
        <button v-for="(fontStyle, index) in fontStyles"
                :key="index"
                :class="{selected: fontStyle.selected}"
                @click="setStyle(fontStyle.style, false, null, true)"><i :class="fontStyle.icon"></i></button>
        <!--        <button @click="setStyle('italic')"><i class="fas fa-italic"></i></button>-->
        <!--        <button @click="setStyle('underline')"><i class="fas fa-underline"></i></button>-->
        <!--        <button @click="setStyle('strikethrough')"><i class="fas fa-strikethrough"></i></button>-->
      </span>
      <span class="border-right">
<!--        <button @click="decreaseFont">smaller</button>-->
        <!--        <button @click="increaseFont">bigger</button>-->
        <select class=""
                v-model="selectedFontSize"
                @change="changeFontSize"
        >
          <option v-for="value in newFontSizes"
                  :key="value"
          >{{ value }}</option>
        </select>
      </span>
      <span class="border-right"><button @click="setStyle('justifyLeft')"><i class="fas fa-align-left"></i></button>
        <button @click="setStyle('justifyCenter')"><i class="fas fa-align-center"></i></button>
        <button @click="setStyle('justifyRight')"><i class="fas fa-align-right"></i></button>
        <button @click="setStyle('justifyFull')"><i class="fas fa-align-justify"></i></button>
      </span>
      <span class="border-right">
        <button @click="setStyle('insertUnorderedList')"><i class="fas fa-list-ul"></i></button>
        <button @click="setStyle('insertOrderedList')"><i class="fas fa-list-ol"></i></button>
      </span>
      <!--      <span class="border-right">-->
      <!--        <button @click="setStyle('formatBlock', false, 'h4')"><i class="fas fa-heading"></i></button>-->
      <!--      </span>-->
      <span class="border-right">
<!--        <button @click="alert('not implemented')"><i class="fas fa-image"></i></button>-->
        <button @click="createFormula"><i class="fas fa-square-root-alt"></i></button>
        <!--        <button @click="toggleRaw">RAW</button>-->
      </span>
      <span class="">
        <button @click="setStyle('undo')"><i class="fas fa-undo-alt"></i></button>
      </span>
    </span>
    </transition>
    <div :id="id"
         :placeholder="placeholder"
         :style="`height: calc(1.5em * ${rows} + .75rem + 2px); display: inline-block`"
         class="form-control editor"
         contenteditable
         ref="textarea"
         @focusin="showPopup = true"
         @focusout="hideSelf"
         @input="onDivInput"
         @change="onDivInput"
         @click="updateCursorPos"
         @keyup="updateCursorPos"
    >
    </div>

    cursorPos = {{ cursorPos }}

    <div>
      dataRaw
      <div>
        <textarea v-model="data"
                  cols="100"
                  rows="10"
                  @input="onDataRawInput"
                  @change="onDataRawInput"
        ></textarea>
      </div>
    </div>

    <formula-modal ref="formulaAddModal"
                   @insert-latex="insertLaTeX"
    />

    <formula-modal ref="formulaEditModal"
                   is-in-edit-mode
                   @insert-latex="insertLaTeX2"
    />
  </div>
</template>

<script>
import mathFormula from "@/components/mathFormula";
import formulaModal from "@/components/formulaModal";
import Vue from 'vue';

export default {
  name: 'wysiwygMath',
  components: {
    // eslint-disable-next-line vue/no-unused-components
    mathFormula,
    formulaModal
  },
  props: {
    id: String,
    placeholder: String,
    rows: {
      type: Number,
      default: 5
    },
  },
  data: function () {
    return {
      showPopup: false,
      hideTimeout: null,
      preventHideFlag: false,
      formula: 'x',
      // formula: 'x = {-b \\pm \\sqrt{b^2-4ac} \\over 2a}',

      data: '',
      selection: null,
      range: null,

      fontStyles: [
        {tag: 'b', icon: 'fas fa-bold', style: 'bold', selected: false},
        {tag: 'i', icon: 'fas fa-italic', style: 'italic', selected: false},
        {tag: 'u', icon: 'fas fa-underline', style: 'underline', selected: false},
        {tag: 'strike', icon: 'fas fa-strikethrough', style: 'strikethrough', selected: false},
      ],

      fontSizes: [
        {name: 'x-small', value: '1'},
        {name: 'small', value: '2'},
        {name: 'medium', value: '3'},
        {name: 'large', value: '4'},
        {name: 'x-large', value: '5'},
        {name: 'xx-large', value: '6'},
        {name: 'xxx-large', value: '7'},
      ],

      selectedFontSize: 12,
      newFontSizes: [
        8,
        9,
        10,
        11,
        12,
        14,
        18,
        24,
        30,
        36,
        48,
        60,
        72,
        96
      ],

      updateFormulaTimeout: null,
    }
  },
  computed: {
    cursorPos() {
      try {
        return this.range.startOffset;
      } catch (e) {
        return -1;
      }
    },
  },
  watch: {
    formula() {
      if (this.updateFormulaTimeout)
        clearTimeout(this.updateFormulaTimeout);

      this.updateFormulaTimeout = setTimeout(() => {
        // this.$refs.formulaPreview.style.opacity = 0;
        this.$refs.formulaPreview.innerHTML = `\\(${this.formula}\\)`;
        window.MathJax.typeset();
        // setTimeout(() => {
        //   window.MathJax.typeset();
        //   this.$refs.formulaPreview.style.opacity = 1;
        // }, 200);
      }, 1500);
    },
  },
  methods: {
    preventHide() {
      // console.log('preventHide')
      this.preventHideFlag = true;
      //
      // if (this.hideTimeout)
      //   clearInterval(this.hideTimeout);
    },

    setStyle(style, showUI = false, value = null, pressButton = false) {
      // this.preventHide();
      document.execCommand(style, showUI, value);

      if (pressButton) {
        let fontStyle = this.fontStyles.find(fontStyle => fontStyle.style === style)
        if (fontStyle) {
          fontStyle.selected = !fontStyle.selected;
        }
      }

      // editor.trigger('keyup')
    },
    hideSelf() {
      if (!this.preventHideFlag) {
        this.showPopup = false;
      } else {
        this.preventHideFlag = !this.preventHideFlag;
      }
    },
    createFormula() {
      this.$refs.formulaAddModal.toggle();

      // this.isInEditMode = false;
      // this.$refs.formulaPreview.style.opacity = 0;
      // this.$refs.formulaPreview.innerHTML = `\\(${this.formula}\\)`;
      //
      // this.showModal = true;
      // // this.renderFormula();
      // setTimeout(() => {
      //   window.MathJax.typeset();
      //   this.$refs.formulaPreview.style.opacity = 1;
      // }, 500);
    },

    onDivInput(event) {
      this.$emit('input', event.target.innerHTML)
      this.data = event.target.innerHTML;
    },
    onDataRawInput() {
      this.$refs.textarea.innerHTML = this.data;
    },

    test() {
      console.log('test')
    },

    changeFontSize() {
      let size = this.selectedFontSize;
      let selected = this.range.extractContents();
      Array.from(selected.children).forEach(element => element.style.removeProperty('font-size'))
      let wrapper = document.createElement('span')
      wrapper.style.fontSize = size.toString() + 'pt';
      wrapper.appendChild(selected);
      this.range.insertNode(wrapper);

      this.updateData();
    },

    insertLaTeX(latex) {
      // 'x = {-b \\pm \\sqrt{b^2-4ac} \\over 2a}'
      let ComponentClass = Vue.mixin(mathFormula)
      let instance = new ComponentClass({
        propsData: {latex: latex}
      })
      instance.$mount()
      this.range.insertNode(instance.$el);
      this.updateData();

      this.selection.removeAllRanges();
      this.selection.addRange(this.range);
      this.selection.collapseToEnd();
      this.$refs.textarea.focus();
    },

    insertLaTeX2(data) {
      let ComponentClass = Vue.mixin(mathFormula)
      let instance = new ComponentClass({
        propsData: {latex: data.latex}
      })
      instance.$mount()
      data.element.parentNode.insertBefore(instance.$el, data.element);
      data.element.parentNode.removeChild(data.element);
      this.$refs.textarea.focus();
    },

    updateData() {
      this.data = this.$refs.textarea.innerHTML;
    },

    // editFormula() {
    //   this.isInEditMode = true;
    //   this.showModal = true;
    // },

    // handleInput(e) {
    //   this.divData = e.target.innerHTML;
    // },

    // getCursorPos() {
    //   let _range = document.getSelection().getRangeAt(0)
    //   let range = _range.cloneRange()
    //   range.selectNodeContents(this.$refs.textarea)
    //   range.setEnd(_range.endContainer, _range.endOffset)
    //   return range.toString().length;
    // },
    updateCursorPos() {
      this.selection = window.getSelection();
      this.range = this.selection.getRangeAt(0);
      this.analyze();
    },

    analyze() {
      // let selection = window.getSelection(), parentEl, tags = [];
      let selection = this.selection;
      let parentEl, tags = [];

      if (selection.rangeCount) {
        parentEl = selection.getRangeAt(0).commonAncestorContainer;

        // eslint-disable-next-line no-constant-condition
        while (true) {
          parentEl = parentEl.parentNode;

          if (parentEl == null)
            break;

          let parentName = parentEl.nodeName.toLowerCase();
          if (parentEl === this.$refs.textarea) {
            break;
          }
          tags.push(parentName);
        }
      }
      this.fontStyles.forEach(fontStyle => fontStyle.selected = tags.includes(fontStyle.tag));
    },

    // preventEnter(event) {
    //   if (event.keyCode === 13) {
    //     console.log('insertHTML')
    //     document.execCommand('insertHTML', false, '<br>');
    //     event.preventDefault();
    //     return false
    //   }
    // },

    increaseFont() {
      // this.preventHide();

      let parent = window.getSelection().getRangeAt(0).commonAncestorContainer.parentElement
      if (parent !== this.$refs.textarea) {
        if (parent.style.fontSize !== '') {
          let index = this.fontSizes.map(obj => obj.name).indexOf(parent.style.fontSize);
          if (index < this.fontSizes.length - 1) {
            document.execCommand('styleWithCSS', false, true);
            document.execCommand('fontSize', false, this.fontSizes[index + 1].value);
            document.execCommand('styleWithCSS', false, false);
          }
        }
      } else {
        document.execCommand('styleWithCSS', false, true);
        document.execCommand('fontSize', false, this.fontSizes[3].value);
        document.execCommand('styleWithCSS', false, false);
      }
    },

    decreaseFont() {
      // this.preventHide();

      let parent = window.getSelection().getRangeAt(0).commonAncestorContainer.parentElement
      if (parent !== this.$refs.textarea) {
        if (parent.style.fontSize !== '') {
          let index = this.fontSizes.map(obj => obj.name).indexOf(parent.style.fontSize);
          if (index > 0) {
            document.execCommand('styleWithCSS', false, true);
            document.execCommand('fontSize', false, this.fontSizes[index - 1].value);
            document.execCommand('styleWithCSS', false, false);
          }
        }
      } else {
        document.execCommand('styleWithCSS', false, true);
        document.execCommand('fontSize', false, this.fontSizes[1].value);
        document.execCommand('styleWithCSS', false, false);
      }
    },
  },
  beforeCreate() {
    // let jScript = document.createElement('script')
    // jScript.setAttribute('src', 'https://cdn.jsdelivr.net/npm/mathjax@3/es5/tex-mml-chtml.js')
    // document.head.appendChild(jScript);
  },
  beforeMount() {
    window.MathJax = {
      options: {
        enableMenu: false,
      }
    };

    // window.MathJax.Hub.Config({
    //   showMathMenu: false,
    // });
  },
  mounted() {
    window.bus = new Vue({});
    window.bus.$on('formula-click', (data) => {
      this.$refs.formulaEditModal.toggle(data);
    });
  },
}
</script>

<style>
@import 'https://stackpath.bootstrapcdn.com/bootstrap/4.4.1/css/bootstrap.min.css';
/*@import 'https://use.fontawesome.com/releases/v5.2.0/css/all.css';*/
@import 'https://fonts.googleapis.com/icon?family=Material+Icons';

.editor[placeholder]:empty:before {
  content: attr(placeholder);
  color: #555;
}

.editor[placeholder]:empty:focus:before {
  content: '';
}

.editor {
  overflow-x: hidden;
  font-size: 12pt;
}

.popup {
  background-color: #f3f3f3;
  color: #000000;
  text-align: center;
  border-radius: 6px;
  padding: 3px 0;
  position: absolute;
  margin-top: calc(-28px - 1rem);
  z-index: 5000;
  border: 1px solid #c4c4c4;
  display: flex;
  align-items: center;
}

.popup::before, .popup::after {
  content: "";
  position: absolute;
  top: 96%;
  left: 5%;
  margin-left: -5px;
  border-width: 7px;
  border-style: solid;
  border-color: #f3f3f3 transparent transparent transparent;
}

.popup::before {
  top: 100%;
  border-color: #c4c4c4 transparent transparent transparent;
}

.popup > span {
  padding: 0 4px;
}

.popup button {
  border: none;
  line-height: 1;
  background-color: inherit;
  padding: 3px 4px;
  margin: 2px 3px;
}

a:hover {
  background: azure;
}

.fade-enter-active, .fade-leave-active {
  transition: opacity .1s;
}

.fade-enter, .fade-leave-to {
  opacity: 0;
}

.btn-md {
  display: flex;
  align-items: center;
  padding: 0 2px !important;
}

.modal-mask {
  position: fixed;
  z-index: 9998;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, .5);
  display: table;
}

.modal-wrapper {
  display: table-cell;
  vertical-align: middle;
}

.selected {
  background-color: #ffffff !important;
  border: 2px #bebebe solid !important;
  border-radius: 3px !important;
  margin: 0 1px !important;
}

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

</style>
