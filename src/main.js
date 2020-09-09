import RtDictRadio from './components/dict-radio'
import RtDictSelect from './components/dict-select'
import RtRegionPicker from './components/region-picker'

const components = [
  RtDictRadio,
  RtDictSelect,
  RtRegionPicker
]

const install = (Vue) => {
  for (var key in components) {
    Vue.component(components[key].name, components[key])
  }
}

// auto install
if (typeof window !== 'undefined' && window.Vue) {
  install(window.Vue)
}

export { RtRegionPicker, RtDictRadio, RtDictSelect }

export default {
  install
}
