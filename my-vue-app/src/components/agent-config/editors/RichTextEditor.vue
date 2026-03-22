<template>
  <div class="rich-text-editor">
    <el-input
      v-model="localValue"
      type="textarea"
      :rows="4"
      :placeholder="placeholder"
      :disabled="disabled"
      @input="handleInput"
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

watch(() => props.modelValue, (newVal) => {
  localValue.value = newVal || ''
})

const handleInput = () => {
  emit('update:modelValue', localValue.value)
  emit('change', localValue.value)
}
</script>

<style scoped lang="less">
.rich-text-editor {
  width: 100%;
}
</style>
