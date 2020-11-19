<template>
  <div>
    <div class="d-flex justify-content-end">
      <h3>KaTeX</h3>
    </div>

    <transition name="fade">
    <span class="popup"
          :class="{'hidden': !showPopup}"
          @mousedown="preventHide"
    >
      <span class="border-right">
        <button v-for="(fontStyle, index) in fontStyles"
                :key="index"
                class="popup-button"
                :class="{'selected': fontStyle.selected}"
                @click="setStyle(fontStyle.style, false, null, true)"
        >
          <i :class="fontStyle.icon"></i>
        </button>
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
      <span class="border-right">
        <button v-for="(textStyle, index) in textStyles"
                :key="index"
                class="popup-button"
                :class="{selected: textStyle.selected}"
                @click="textAlign(textStyle.style); textStyle.selected = !textStyle.selected"
        >
          <i :class="textStyle.icon"></i>
        </button>
      </span>
      <span class="border-right">
        <button v-for="(listType, index) in lists"
                :key="index"
                class="popup-button"
                :class="{selected: listType.selected}"
                @click="setStyle(listType.style, false, null)"
        >
          <i :class="listType.icon"></i>
        </button>
      </span>
      <!--      <span class="border-right">-->
      <!--        <button @click="setStyle('formatBlock', false, 'h4')"><i class="fas fa-heading"></i></button>-->
      <!--      </span>-->
      <span class="border-right">
<!--        <button @click="alert('not implemented')"><i class="fas fa-image"></i></button>-->
        <button class="popup-button"
                @click="createFormula"
        >
          <i class="fas fa-square-root-alt"></i>
        </button>
        <!--        <button @click="toggleRaw">RAW</button>-->
      </span>
      <span class="">
        <button class="popup-button"
                @click="setStyle('undo')"
        ><i class="fas fa-undo-alt"></i>
        </button>
      </span>
    </span>
    </transition>
    <span :id="id"
          :placeholder="placeholder"
          :style="`height: calc(1.5em * ${rows} + .75rem + 2px);`"
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

    </span>

    <!--    cursorPos = {{ cursorPos }}-->

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
import mathFormula from "@/components/katex/mathFormula";
import formulaModal from "@/components/katex/formulaModal";
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

      data: '',
      selection: null,
      range: null,

      align: 'left',

      fontStyles: [
        {tag: 'b', icon: 'fas fa-bold', style: 'bold', selected: false},
        {tag: 'i', icon: 'fas fa-italic', style: 'italic', selected: false},
        {tag: 'u', icon: 'fas fa-underline', style: 'underline', selected: false},
        {tag: 'strike', icon: 'fas fa-strikethrough', style: 'strikethrough', selected: false},
      ],

      lists: [
        {tag: 'ul', icon: 'fas fa-list-ul', style: 'insertUnorderedList', selected: false},
        {tag: 'ol', icon: 'fas fa-list-ol', style: 'insertOrderedList', selected: false},
      ],

      textStyles: [
        {tag: 'left', icon: 'fas fa-align-left', style: 'left', selected: false},
        {tag: 'center', icon: 'fas fa-align-center', style: 'center', selected: false},
        {tag: 'right', icon: 'fas fa-align-right', style: 'right', selected: false},
        {tag: 'justify', icon: 'fas fa-align-justify', style: 'justify', selected: false},
      ],

      // textStyles: [
      //   {tag: 'left', icon: 'fas fa-align-left', style: 'justifyLeft', selected: false},
      //   {tag: 'center', icon: 'fas fa-align-center', style: 'justifyCenter', selected: false},
      //   {tag: 'right', icon: 'fas fa-align-right', style: 'justifyRight', selected: false},
      //   {tag: 'justify', icon: 'fas fa-align-justify', style: 'justifyFull', selected: false},
      // ],

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
        96,
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
  watch: {},
  methods: {
    preventHide() {
      // console.log('preventHide')
      this.preventHideFlag = true;
      //
      // if (this.hideTimeout)
      //   clearInterval(this.hideTimeout);
    },

    // eslint-disable-next-line no-unused-vars
    setStyle(style, showUI = false, value = null, setPressed = false) {
      // this.preventHide();
      document.execCommand(style, showUI, value);

      // editor.trigger('keyup')

      this.$refs.textarea.focus();

      if (setPressed) {
        let fontStyle = this.fontStyles.find(fontStyle => fontStyle.style === style);
        if (fontStyle) {
          fontStyle.selected = !fontStyle.selected;
        }
      } else {
        setTimeout(() => {
          this.analyze();
        }, 100)
      }
    },

    textAlign(side) {
      let paragraph = this.selection.getRangeAt(0).commonAncestorContainer;
      while (paragraph.nodeName.toLowerCase() !== 'p') {
        paragraph = paragraph.parentNode;
      }
      paragraph.style.textAlign = side;

      this.$refs.textarea.focus();
      setTimeout(() => {
        this.analyze();
      }, 100)
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
      let el = document.createElement('p');

      this.range.insertNode(el);
      this.updateData();
    },

    changeFontSize() {
      if (this.$refs.textarea.textContent === '') {
        this.$refs.textarea.innerHTML = `<p><span style="font-size: ${this.selectedFontSize}pt;"><br></span></p>`;
      } else {
        let selected = this.range.extractContents();

        let parent = this.selection.anchorNode.parentNode;
        if (parent.textContent === '')
          parent.remove();

        Array.from(selected.children).forEach(element => element.style.removeProperty('font-size'))
        let wrapper = document.createElement('span')
        wrapper.style.fontSize = this.selectedFontSize.toString() + 'pt';
        wrapper.appendChild(selected);
        this.range.insertNode(wrapper);
      }
      this.updateData();
      this.$refs.textarea.focus();
    },

    insertLaTeX(latex) {
      // 'x = {-b \\pm \\sqrt{b^2-4ac} \\over 2a}'
      let ComponentClass = Vue.mixin(mathFormula)
      let instance = new ComponentClass({
        propsData: {latex: latex}
      })
      instance.$mount();
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
    updateCursorPos(event) {
      this.selection = window.getSelection();
      this.range = this.selection.getRangeAt(0);

      if (event.type === 'click')
        setTimeout(this.analyze, 100);
      else
        this.analyze();
    },

    analyze() {
      // let selection = window.getSelection(), parentEl, tags = [];
      let selection = this.selection;
      let parentEl, tags = [], styles = {};

      // console.log(selection)
      // console.log(selection.getRangeAt(0))

      if (selection.rangeCount) {
        parentEl = selection.getRangeAt(0).commonAncestorContainer;

        // eslint-disable-next-line no-constant-condition
        while (true) {
          // parentEl = parentEl.parentNode;

          if (parentEl == null)
            break;

          // console.log(parentEl)

          let parentName = parentEl.nodeName.toLowerCase();

          if (parentEl === this.$refs.textarea) {
            break;
          }

          // eslint-disable-next-line no-inner-declarations
          function getParam(parentStyle, key) {
            try {
              if (parentStyle[key] !== '') {
                return parentStyle[key];
              } else return null;
            } catch (e) {
              return null;
            }
          }

          if (!('textAlign' in styles && styles.textAlign !== null)) {
            styles.textAlign = getParam(parentEl.style, 'textAlign');
          }
          if (!('fontSize' in styles && styles.fontSize !== null)) {
            styles.fontSize = getParam(parentEl.style, 'fontSize');
          }
          if (!('fontWeight' in styles && styles.fontWeight !== null)) {
            styles.fontWeight = getParam(parentEl.style, 'fontWeight');
          }

          tags.push(parentName);

          parentEl = parentEl.parentNode;
        }
      }

      // console.log(tags)
      // console.log(styles)

      if (![undefined, null].includes(styles.fontSize)) {
        let size = parseInt(styles.fontSize.slice(0, -2))
        let dimension = styles.fontSize.slice(-2);
        if (dimension === 'px') {
          size *= 3 / 4;
        }
        this.selectedFontSize = size;
      } else {
        this.selectedFontSize = 12;
      }

      this.lists.forEach(listStyle => listStyle.selected = tags.includes(listStyle.tag));
      this.fontStyles.forEach(fontStyle => fontStyle.selected = tags.includes(fontStyle.tag));
      if (styles.fontWeight === 'bolder') {
        this.fontStyles[0].selected = true;
      }

      let isAlignSet = false;
      this.textStyles.forEach(textStyle => {
        textStyle.selected = styles.textAlign === textStyle.tag;
        if (textStyle.selected) isAlignSet = true;
      });
      if (!isAlignSet) this.textStyles[0].selected = true;
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
    // let jScript = document.createElement('script');
    // jScript.setAttribute('src', 'https://cdn.jsdelivr.net/npm/katex@0.12.0/dist/katex.js')
    // document.head.appendChild(jScript);
    //
    // let jScript2 = document.createElement('script');
    // jScript2.setAttribute('src', 'https://cdn.jsdelivr.net/npm/katex@0.12.0/dist/contrib/auto-render.min.js')
    // jScript2.setAttribute('onload', 'renderMathInElement(document.body)')
    // document.head.appendChild(jScript2);
  },
  beforeMount() {
  },
  mounted() {
    window.bus = new Vue({});
    window.bus.$on('formula-click', (data) => {
      this.$refs.formulaEditModal.toggle(data);
    });
    document.execCommand('defaultParagraphSeparator', false, 'p');
    this.$refs.textarea.innerHTML = '<p><span style="font-size: 12pt;"><br></span></p>';
  },

  updated() {
  }
}
</script>

<style>
@import 'https://stackpath.bootstrapcdn.com/bootstrap/4.4.1/css/bootstrap.min.css';
/*@import 'https://use.fontawesome.com/releases/v5.2.0/css/all.css';*/
@import 'https://fonts.googleapis.com/icon?family=Material+Icons';
/*@import 'https://cdn.jsdelivr.net/npm/katex@0.12.0/dist/katex.css';*/
/*@import 'https://cdn.jsdelivr.net/npm/katex@0.12.0/dist/katex.min.css';*/

.editor[placeholder]:empty:before {
  content: attr(placeholder);
  color: #555;
}

.editor[placeholder]:empty:focus:before {
  content: '';
}

.editor {
  overflow-x: hidden;
  white-space: pre-wrap;
}

.editor p {
  margin: 0;
}

.hidden {
  position: fixed;
  top: 0;
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

.popup-button {
  border: none;
  line-height: 1;
  background-color: inherit;
  padding: 4px;
  margin: 0 1px;
  width: 27px;
  border-radius: 3px !important;
}

.popup-button:hover {
  background-color: #dedede;
}

.selected {
  background-color: #bfbfbf !important;
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

button {
  outline: none !important;
}
</style>
