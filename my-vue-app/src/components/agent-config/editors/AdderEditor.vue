<template>
  <div class="adder-editor">
    <div class="adder-list">
      <div v-for="(item, index) in localValue" :key="index" class="adder-item">
        <div class="adder-item-content">
          <template v-for="(bodyConfig, bodyIndex) in bodyConfigs" :key="bodyIndex">
            <el-form-item :label="bodyConfig.layoutItem?.label" :required="bodyConfig.layoutItem?.required"
              :prop="`${currentPropPath}.${index}.${bodyConfig.layoutItem?.attributesPath}`"
              :rules="generateRules(bodyConfig)">
              <component :is="getEditorComponent(bodyConfig.type)"
                :model-value="item[bodyConfig.layoutItem?.attributesPath || '']" :config="bodyConfig"
                :disabled="disabled"
                @update:model-value="handleItemUpdate(index, bodyConfig.layoutItem?.attributesPath || '', $event)" />
            </el-form-item>
          </template>
        </div>
        <el-button type="danger" :icon="Delete" circle size="small" :disabled="disabled" @click="removeItem(index)" />
      </div>
    </div>

    <el-button v-if="canAdd" type="primary" :icon="Plus" :disabled="disabled" @click="addItem">
      添加{{ config.layoutItem?.label || '项目' }}
    </el-button>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, computed } from 'vue'
import { Plus, Delete } from '@element-plus/icons-vue'
import type { EditorProps, EditorEmits, ComponentConfig } from '../types'
import InputEditor from './InputEditor.vue'
import RichTextEditor from './RichTextEditor.vue'

const props = defineProps<EditorProps & { propPath?: string }>()
const emit = defineEmits<EditorEmits>()

const localValue = ref<any[]>(props.modelValue || [])
const disabled = computed(() => props.disabled || false)

const bodyConfigs = computed(() => {
  return props.config.attributes?.body || []
})

const maxLength = computed(() => {
  return props.config.attributes?.['max-length'] || 20
})

const canAdd = computed(() => {
  return localValue.value.length < maxLength.value
})

const currentPropPath = computed(() => {
  return props.propPath || props.config.layoutItem?.attributesPath || ''
})

watch(() => props.modelValue, (newVal) => {
  localValue.value = newVal || []
}, { deep: true })

const getEditorComponent = (type: string) => {
  const componentMap: Record<string, any> = {
    'editor-input': InputEditor,
    'editor-rich-text': RichTextEditor
  }
  return componentMap[type] || InputEditor
}

const handleItemUpdate = (index: number, path: string, value: any) => {
  if (localValue.value[index]) {
    localValue.value[index][path] = value
    emitUpdate()
  }
}

const addItem = () => {
  const newItem: any = {}
  bodyConfigs.value.forEach((config: ComponentConfig) => {
    const path = config.layoutItem?.attributesPath
    if (path) {
      newItem[path] = ''
    }
  })
  localValue.value.push(newItem)
  emitUpdate()
}

const removeItem = (index: number) => {
  localValue.value.splice(index, 1)
  emitUpdate()
}

const emitUpdate = () => {
  emit('update:modelValue', localValue.value)
  emit('change', localValue.value)
}

const generateRules = (config: ComponentConfig) => {
  const rules: any[] = []
  const layoutItem = config.layoutItem

  if (layoutItem?.required) {
    rules.push({
      required: true,
      message: `请输入${layoutItem.label}`,
      trigger: 'blur'
    })
  }

  if (layoutItem?.rules) {
    layoutItem.rules.forEach(rule => {
      if (rule.type === 'string-length-validator') {
        rules.push({
          min: rule.min,
          max: rule.max,
          message: rule.message || `长度在 ${rule.min} 到 ${rule.max} 个字符`,
          trigger: 'blur'
        })
      }
    })
  }

  return rules
}
</script>

<style scoped lang="less">
.adder-editor {
  width: 100%;
}

.adder-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
  margin-bottom: 16px;
}

.adder-item {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 16px;
  background-color: #f5f7fa;
  border-radius: 4px;
  border: 1px solid #e4e7ed;
}

.adder-item-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 12px;
}
</style>
