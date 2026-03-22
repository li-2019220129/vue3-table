<template>
  <div class="input-editor">
    <el-input
      v-model="localValue"
      :placeholder="placeholder"
      :disabled="disabled"
      :maxlength="maxLength"
      show-word-limit
      clearable
      @input="handleInput"
      @change="handleChange"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, watch, computed } from 'vue'
import type { EditorProps, EditorEmits } from '../types'

const props = defineProps<EditorProps>()
const emit = defineEmits<EditorEmits>()

const localValue = ref(props.modelValue || '')
const disabled = computed(() => props.disabled || false)

const placeholder = computed(() => {
  return `请输入${props.config.layoutItem?.label || '内容'}`
})

const maxLength = computed(() => {
  const rules = props.config.layoutItem?.rules || []
  const lengthRule = rules.find(r => r.type === 'string-length-validator')
  return lengthRule?.max || 100
})

watch(() => props.modelValue, (newVal) => {
  localValue.value = newVal || ''
})

const handleInput = () => {
  emit('update:modelValue', localValue.value)
}

const handleChange = () => {
  emit('change', localValue.value)
}
</script>

<style scoped lang="less">
.input-editor {
  width: 100%;
}
</style>
