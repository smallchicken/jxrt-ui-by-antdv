<template>
  <a-select v-model="currentValue" @change="selectChange" v-bind="$attrs" v-on="$listener" :disabled="disabled" class="input-select" :placeholder="placeholder" :allowClear="clearable">
    <a-select-option v-for="item in dictList" :value="item.dictValue" :key="item.dictValue">{{ item.dictLabel }}</a-select-option>
  </a-select>
</template>

<script>
import dictMixin from '../../mixins/dictMixin'
export default {
  name: 'rt-dict-select',
  mixins: [dictMixin],
  props: {
    placeholder: {
      type: String,
      default: '请选择'
    },
    clearable: {
      type: Boolean,
      default: true
    }
  }
}
</script>
