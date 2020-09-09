<template>
  <div class="region-picker"
       :id="id">
    <div class="region-title">
      <slot :show="focus"
            :text="showText">
        <a-input v-if="isIview"
               :disabled="disabled"
               readonly
               v-model="showText"
               @on-focus="focus"
               :placeholder="placeholder" />
        <input v-else
               :disabled="disabled"
               type="text"
               readonly
               @focus="focus"
               v-model="showText"
               :placeholder="placeholder">
      </slot>
    </div>
    <div class="panel"
         :style="right?'right:0':'left:0'"
         v-if="showPanel">
      <div class="tabs">
        <div class="tab"
             :class="{active:activeIndex==index}"
             v-for="(tab,index) in tabs"
             @click="tabClick(index)"
             :title="tab.checked.value?tab.checked.label:tab.title"
             :key="index">
          {{tab.checked.value?(''+tab.checked.label):tab.title}}
        </div>
      </div>
      <div class="tabpanes">
        <div class="tabpane"
             :class="{active:tabs[activeIndex].checked.value==item.value}"
             v-for="(item,index) in tabs[activeIndex].list"
             :key="index"
             @click="itemClick(item)"
             :title="item.label">{{item.label}}</div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'rt-region-picker',
  inheritAttrs: true,
  props: {
    isIview: {
      type: Boolean,
      default: true
    },
    right: {
      type: Boolean,
      default: false
    },
    default: {
      type: Array,
      default: () => []
    },
    reload: {
      type: Boolean,
      default: false
    },
    placeholder: {
      default: '请选择'
    },
    disabled: {
      type: Boolean,
      default: false
    },
    // 当前最低区级的父级区域id
    defaultParentId: {
      default: null
    },
    getRegionsByParentId: {
      type: Function
    },
    getRegionsParentById: {
      type: Function
    }
  },
  computed: {
    current () {
      return this.tabs.filter(v => v.checked.value).map(v => v.checked)
    },
    defaultRegion () {
      let list = this.default.filter(v => v)
      if (this.defaultParentId) {
        list = list.slice(0, list.indexOf(this.defaultParentId) + 1)
      }
      return list
    }
  },
  watch: {
    reload () {
      this.init()
    },
    default (nv, ov) {
      if (nv !== ov) {
        this.init()
      }
    }
  },
  data () {
    return {
      id: `region-picker-${+new Date()}`,
      activeIndex: 0,
      showPanel: false,
      tabs: [{
        title: '省/直辖市',
        checked: {},
        list: []
      }],
      showText: '',
      clickOutVM: null,
      parentId: null
    }
  },
  methods: {
    onClickOutside () {
      if (!this.showPanel) return
      this.choosed(true)
    },
    focus () {
      this.showPanel = true
    },
    tabClick (i) {
      this.activeIndex = i
      this.tabs.splice(i + 1)
      this.showList = true
      this.choosed()
    },
    itemClick (item) {
      this.tabs[this.activeIndex].checked = item
      this.parentId = item.value
      this.getRegions().then(res => {
        const list = res
        if (list && list.length > 0) {
          this.tabs.push({
            title: '请选择',
            checked: {},
            list
          })
          this.activeIndex++
        } else {
          this.choosed(true)
        }
        this.choosed()
      })
    },
    init () {
      if (this.defaultRegion.length > 0) {
        this.getRegionsParentById({
          id: this.defaultParentId || this.defaultRegion[this.defaultRegion.length - 2] || null,
          isValid: true
        }).then(res => {
          if (res.code === 200) {
            const all = res.result
            const provinces = this.getFormatRegions(all.provinces)
            const citys = this.getFormatRegions(all.citys)
            const towns = this.getFormatRegions(all.towns)
            const data = [provinces, citys, towns]
            this.tabs = this.defaultRegion.map((v, i) => {
              let checked = {}
              let list = []
              if (i === 0) {
                checked = data[i].find(k => k.value === v)
                list = data[i]
              } else {
                checked = data[i].find(k => k.value === v)
                list = data[i]
              }
              return {
                title: i === 0 ? '省/直辖市' : '请选择',
                checked: checked || {},
                list: list || []
              }
            })
            this.activeIndex = this.defaultRegion.length - 1
            this.showText = ''
            this.current.map(item => {
              this.showText = this.showText + item.label
            })
            this.$emit('done', this.current.map(v => v.value), this.current, this.showText)
          } else {
            this.$Message.error(res.message)
          }
        })
      } else {
        this.parentId = null
        this.activeIndex = 0
        this.showText = ''
        this.tabs = [{
          title: '省/直辖市',
          checked: {},
          list: []
        }]
        this.getRegions().then(res => {
          this.tabs[0].list = res
        })
      }
    },
    choosed (done) {
      if (done) {
        this.showText = ''
        this.current.map(item => {
          this.showText = this.showText + item.label
        })
        this.showPanel = false
        this.$emit('done', this.current.map(v => v.value), this.current, this.showText)
      } else {
        this.$emit('choose', this.current.map(v => v.value), this.current)
      }
    },
    clickOut (elements, handler) {
      const handleClick = (e) => {
        for (let target = e.target; target; target = target.parentNode) {
          const found = elements.indexOf(target) > -1
          if (found) {
            return
          }
        }
        handler(e)
      }
      const off = () => {
        document.removeEventListener('mousedown', handleClick)
        document.removeEventListener('touchstart', handleClick)
      }
      if (!elements.indexOf) {
        elements = [elements]
      }
      document.addEventListener('mousedown', handleClick)
      document.addEventListener('touchstart', handleClick)
      return {
        off
      }
    },
    getRegions () {
      return new Promise((resolve) => {
        this.getRegionsByParentId({
          parentId: this.parentId,
          isValid: true
        }).then(res => {
          if (res.code === 200) {
            const regionList = this.getFormatRegions(res.result)
            resolve(regionList)
          } else {
            this.$Message.error(res.message)
          }
        }).catch(err => {
          this.$Message.error(err)
        })
      })
    },
    getFormatRegions (arr) {
      const regionList = []
      arr.map(item => {
        regionList.push({
          label: item.regionName,
          value: item.id
        })
      })
      return regionList
    }
  },
  mounted () {
    this.init()
    this.clickOutVM = this.clickOut(document.querySelector(`#${this.id}`), this.onClickOutside)
  },
  beforeDestroy () {
    this.clickOutVM.off()
  }
}
</script>

<style scoped lang="less">
.region-picker {
  position: relative;
  width: 100%;
}
.region-title > input {
  width: 100%;
  padding: 0 5px;
  color: #495060;
}
.panel {
  width: 582px;
  padding: 5px;
  border: 1px solid #ccc;
  position: absolute;
  top: calc(100% + 5px);
  z-index: 999999;
  background-color: #fff;
}
.text-center {
  text-align: center;
}
.ellipsis {
  white-space: nowrap;
  text-overflow: ellipsis;
  overflow: hidden;
}
.tabs {
  border-bottom: 2px solid #bac3d4;
  white-space: nowrap;
  overflow-x: auto;
  overflow-y: hidden;
  font-size: 0;
  padding: 0;
  margin: 0 0 19px 0;
  .tab {
    float: left;
    width: 150px;
    height: 36px;
    line-height: 36px;
    font-size: 14px;
    text-align: center;
    white-space: nowrap;
    text-overflow: ellipsis;
    overflow: hidden;
    cursor: pointer;
    padding: 0 5px;
    &.active {
      color: #fff;
      background-color: #205abe;
    }
  }
}
.tabpanes {
  .tabpane {
    text-align: center;
    white-space: nowrap;
    text-overflow: ellipsis;
    overflow: hidden;
    display: inline-block;
    width: 114px;
    height: 32px;
    line-height: 32px;
    color: #979797;
    font-size: 14px;
    &:hover {
      cursor: pointer;
      color: darken(#979797, 30%);
    }
    &.active {
      color: #fff;
      background-color: #205abe;
    }
  }
}
</style>
