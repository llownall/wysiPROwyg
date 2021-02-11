<template>
  <transition name="fade">
    <div class="modal-mask" v-show="showModal">
      <div class="modal-wrapper">
        <div class="modal-dialog modal-lg" role="document">
          <div class="modal-content">
            <div class="modal-header">
              <h5 class="modal-title">Вставить картинку</h5>
              <button type="button" class="close" data-dismiss="modal" aria-label="Close" @click="showModal = false">
                <span aria-hidden="true">&times;</span>
              </button>
            </div>
            <div class="modal-body">
              <input type="file"
                     accept="image/*"
                     @change="onUpload"
                     multiple
                     ref="fileInput"
              >

              <div v-if="isMultiple"
                   style="margin-top: 24px; display: flex; justify-content: space-evenly; align-items: center">
                <button @click="(activeFileIndex > 0) ? activeFileIndex-- : null">prev.</button>
                Картинка {{ activeFileIndex + 1 }} из {{ files.length }}
                <button @click="(activeFileIndex < files.length - 1) ? activeFileIndex++ : null">next.</button>
              </div>

              <div v-if="files.length > 0">
                <div style="font-weight: bolder; margin-top: .8rem">Превью:</div>

                <div class="image"
                     ref="imageDiv"
                >
                  <img :src="activeFile.image.src"
                       :height="activeFile.image.height"
                       :width="activeFile.image.width"
                  >
                </div>

                <div class="d-flex justify-content-center align-items-center">
                  <label for="scale" style="margin-right: .4rem; margin-bottom: 0">Масштаб:</label>
                  <input type="text"
                         id="scale"
                         list="scales"
                         v-model="activeFile.scale"
                  >
                  <datalist id="scales">
                    <option v-for="scale in scales"
                            :key="scale"
                            :value="scale"
                    />
                  </datalist>
                </div>
              </div>
            </div>
            <div class="modal-footer">
              <button type="button" class="btn btn-secondary" @click="showModal = false">Отмена</button>
              <button type="button" class="btn btn-primary"
                      @click="addImage"
                      :disabled="files.length === 0"
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
export default {
  name: 'imageModal',
  props: {
    uploadUrl: {
      type: String,
      default: null
    },
  },
  data: function () {
    return {
      showModal: false,

      scales: [25, 50, 75, 100],

      activeFileIndex: 0,
      files: [],
    }
  },
  computed: {
    isMultiple() {
      return this.files.length > 1
    },
    activeFile() {
      return this.files[this.activeFileIndex]
    },
  },
  watch: {
    'activeFile.scale'(newVal) {
      if (newVal > 100) {
        this.activeFile.scale = 100
      } else if (newVal < 0) {
        this.activeFile.scale = 1
      } else if (this.activeFile !== undefined) {
        this.activeFile.image.height = this.activeFile.baseHeight * this.activeFile.scale / 100
        this.activeFile.image.width = this.activeFile.baseWidth * this.activeFile.scale / 100
      }
    },
  },
  methods: {
    toggle() {
      this.files = []
      this.$refs.fileInput.value = null
      this.showModal = true
    },

    onUpload(event) {
      let hasOversize = false
      Array.from(event.target.files).forEach(file => {
        if (file.size > 300 * 1024)
          hasOversize = true
      })
      if (hasOversize) {
        alert('Максимальный размер одного файла - 300 Кбайт')
        this.$refs.fileInput.value = null
        return
      }

      this.files = []
      let filesLeft = event.target.files.length
      Array.from(event.target.files).forEach(file => {
        let imageData = {
          file: file,
          image: null,
          url: URL.createObjectURL(file),
          scale: 100,
        }

        function getSizes(url) {
          return new Promise(function (resolve, reject) {
            let img = new Image()
            img.onload = function () {
              resolve(this)
            }
            img.onerror = reject
            img.src = url;
          })
        }

        getSizes(imageData.url).then((image) => {
          imageData.image = image
          imageData.baseHeight = image.height
          imageData.baseWidth = image.width
          this.files.push(imageData)
          filesLeft--
        })
      })

      let waitForProcess = setInterval(() => {
        if (filesLeft === 0) {
          let maxHeight = this.$refs.imageDiv.clientHeight - 24
          let maxWidth = this.$refs.imageDiv.clientWidth - 16

          this.files.forEach(imageData => {
            let scale = 1
            if (maxHeight / maxWidth < imageData.baseHeight / imageData.baseWidth) {
              scale = maxHeight / imageData.baseHeight
            } else {
              scale = maxWidth / imageData.baseWidth
            }
            imageData.image.width = imageData.baseWidth * scale
            imageData.image.height = imageData.baseHeight * scale
            imageData.baseWidth = imageData.image.width
            imageData.baseHeight = imageData.image.height
          })

          if (this.files.length > 0)
            this.activeFileIndex = 0
          else
            this.activeFileIndex = null

          this.$forceUpdate()
          clearInterval(waitForProcess)
        }
      }, 200)
    },

    addImage() {
      let imageSources = []

      if (this.uploadUrl === null) {
        alert('Не указан URL для загрузки картинок')
      } else {
        this.files.forEach(imageData => {
          let formData = new FormData();
          formData.append('width', imageData.image.width);
          formData.append('height', imageData.image.height);
          formData.append('image', imageData.file);

          fetch(this.uploadUrl, {
            method: 'POST',
            body: formData,
          })
              .then(response => response.json())
              .then(result => {
                imageSources.push(result.image_path)
              })
        })
      }

      let waitForProcess = setInterval(() => {
        if (imageSources.length === this.files.length) {
          this.showModal = false;
          this.$emit('insert-images', imageSources);
          clearInterval(waitForProcess)
        }
      }, 200)
    },
  },
}
</script>

<style>
@import 'https://stackpath.bootstrapcdn.com/bootstrap/4.4.1/css/bootstrap.min.css';
@import 'https://use.fontawesome.com/releases/v5.2.0/css/all.css';
@import 'https://fonts.googleapis.com/icon?family=Material+Icons';

.image {
  height: 50vh;
  width: 100%;
  padding: 12px 8px;
  overflow: hidden;

  display: flex;
  justify-content: center;
  align-items: center;
}

.image img {
  border-radius: 4px;
  box-shadow: 0 0 4px 2px rgba(0, 0, 0, 0.2);
  image-rendering: high-quality;
}
</style>
