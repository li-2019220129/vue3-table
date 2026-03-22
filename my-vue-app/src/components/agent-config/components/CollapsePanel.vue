<template>
  <el-collapse v-model="activeNames" class="collapse-panel">
    <el-collapse-item :name="panelName">
      <template #title>
        <div class="panel-header">
          <div class="panel-title">
            <span class="title-text">{{ config.attributes?.title }}</span>
            <span v-if="config.attributes?.titleEN" class="title-en">
              ({{ config.attributes.titleEN }})
            </span>
          </div>
          <el-button type="primary" size="small" :icon="Plus" @click.stop="handleAddPanel">
            新增
          </el-button>
        </div>
      </template>

      <div class="panel-content">
        <template v-for="(component, index) in config.components" :key="index">
          <el-form-item v-if="component.layoutItem" :label="component.layoutItem.label"
            :required="component.layoutItem.required" :prop="component.layoutItem.attributesPath"
            :label-width="component.layoutItem['label-width']" :rules="generateRules(component)">
            <el-tooltip v-if="component.layoutItem.tooltips" :content="component.layoutItem.tooltips" placement="top">
              <el-icon class="tooltip-icon">
                <QuestionFilled />
              </el-icon>
            </el-tooltip>

            <component :is="getEditorComponent(component.type)"
              :model-value="localData[component.layoutItem.attributesPath]" :config="component"
              :prop-path="component.layoutItem.attributesPath"
              @update:model-value="handleModelUpdate(component, $event)" />
          </el-form-item>
        </template>
      </div>
    </el-collapse-item>
  </el-collapse>
</template>

<script setup lang="ts">
import { ref, reactive, watch, computed } from 'vue'
import { QuestionFilled, Plus } from '@element-plus/icons-vue'
import type { ComponentConfig, CollapsePanelConfig } from '../types'
import RichTextEditor from '../editors/RichTextEditor.vue'
import InputEditor from '../editors/InputEditor.vue'
import AdderEditor from '../editors/AdderEditor.vue'

const props = defineProps<{
  config: CollapsePanelConfig
  modelValue?: any
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: any): void
  (e: 'addPanel', config: CollapsePanelConfig): void
}>()

const panelName = computed(() => props.config.attributes?.titleEN || 'panel')
const activeNames = ref([panelName.value])

const localData = reactive<Record<string, any>>({})

const initLocalData = () => {
  if (props.modelValue) {
    Object.assign(localData, props.modelValue)
  } else {
    props.config.components?.forEach(component => {
      if (component.layoutItem?.attributesPath) {
        const path = component.layoutItem.attributesPath
        if (component.type === 'editor-adder') {
          localData[path] = []
        } else {
          localData[path] = ''
        }
      }
    })
  }
}

const getEditorComponent = (type: string) => {
  const componentMap: Record<string, any> = {
    'editor-rich-text': RichTextEditor,
    'editor-input': InputEditor,
    'editor-adder': AdderEditor
  }
  return componentMap[type] || InputEditor
}

const handleAddPanel = () => {
  emit('addPanel', props.config)
}

const generateRules = (component: ComponentConfig) => {
  const rules: any[] = []
  const layoutItem = component.layoutItem

  if (!layoutItem) return rules

  if (layoutItem.required) {
    rules.push({
      required: true,
      message: `请输入${layoutItem.label}`,
      trigger: 'blur'
    })
  }

  if (layoutItem.rules) {
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

const handleModelUpdate = (component: ComponentConfig, value: any) => {
  if (component.layoutItem?.attributesPath) {
    localData[component.layoutItem.attributesPath] = value
    emit('update:modelValue', { ...localData })
  }
}

watch(() => props.modelValue, (newVal) => {
  if (newVal) {
    Object.assign(localData, newVal)
  }
}, { deep: true, immediate: true })

initLocalData()
</script>

<style scoped lang="less">
.collapse-panel {
  margin-bottom: 16px;
  border: 1px solid #e4e7ed;
  border-radius: 4px;

  :deep(.el-collapse-item__header) {
    background-color: #f5f7fa;
    border-bottom: 1px solid #e4e7ed;
    padding: 0 16px;
    font-weight: 600;
  }

  :deep(.el-collapse-item__wrap) {
    border-bottom: none;
  }

  :deep(.el-collapse-item__content) {
    padding: 20px;
  }
}

.panel-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  padding-right: 16px;
}

.panel-title {
  display: flex;
  align-items: center;
  gap: 8px;

  .title-text {
    font-size: 16px;
    color: #303133;
  }

  .title-en {
    font-size: 14px;
    color: #909399;
    font-weight: normal;
  }
}

.panel-content {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.tooltip-icon {
  margin-left: 8px;
  color: #909399;
  cursor: help;
}
</style>
