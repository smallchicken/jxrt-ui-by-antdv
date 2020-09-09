export default {
  props: {
    value: {
      type: [String, Number]
    },
    disabled: {
      type: Boolean,
      default: false
    },
    dictType: {
      type: [String, Number, Boolean],
      required: true
    },
    enabled: {
      type: Boolean,
      default: true
    },
    getDictDataFn: {
      type: Function
    }
  },
  data () {
    return {
      dictList: [],
      currentValue: this.value
    }
  },
  created () {
    const option = this.$options.doNotInit
    if (!option) {
      this.getDictList()
    }
  },
  watch: {
    value () {
      this.currentValue = this.value
    }
  },
  methods: {
    selectChange (value) {
      const param = value === undefined ? '' : value
      this.$emit('input', param)
      this.$emit('on-change', param)
    },
    getDictList () {
      this.getDictDataFn({
        dictType: this.dictType,
        enabled: this.enabled
      }).then(res => {
        if (res.code === 200) {
          this.dictList = res.result
          this.$emit('getDictList', this.dictList)
        } else {
          this.$Message.error(res.message)
        }
      })
    }
  }
}
