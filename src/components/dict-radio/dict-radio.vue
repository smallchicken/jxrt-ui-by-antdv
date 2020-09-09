<template>
  <a-radio-group v-model="currentValue" v-bind="$attrs" v-on="$listener" @on-change="selectChange">
    <a-radio :label="item.dictValue" v-for="item in dictList" :key="item.dictValue">{{ item.dictLabel }}</a-radio>
  </a-radio-group>
</template>

<script>
import dictMixin from '../../mixins/dictMixin'
export default {
  name: 'rt-dict-radio',
  mixins: [dictMixin]
}
</script>
