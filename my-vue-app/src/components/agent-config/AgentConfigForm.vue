<template>
  <div class="agent-config-form">
    <el-form ref="formRef" :model="formData" :rules="formRules" :label-width="labelWidth"
      :label-position="labelPosition">
      <template v-for="(component, index) in allComponents" :key="index">
        <component :is="getComponentType(component.type)" :config="component" :model-value="getFormDataValue(component)"
          @update:model-value="updateFormData($event, component)" @add-panel="handleAddPanel" />
      </template>
    </el-form>

    <div class="form-actions">
      <el-button type="primary" @click="handleSubmit">
        保存配置
      </el-button>
      <el-button @click="handleReset">
        重置
      </el-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, watch, computed } from 'vue'
import type { FormInstance, FormRules } from 'element-plus'
import type { AgentConfig, ComponentConfig, FormData } from './types'
import CollapsePanel from './components/CollapsePanel.vue'

const props = defineProps<{
  config: AgentConfig
  modelValue?: FormData
  labelWidth?: string | number
  labelPosition?: 'left' | 'right' | 'top'
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: FormData): void
  (e: 'submit', value: { formData: FormData; config: AgentConfig }): void
  (e: 'reset'): void
}>()

const formRef = ref<FormInstance>()
const formData = reactive<FormData>({})
const formRules = reactive<FormRules>({})
const dynamicPanels = ref<ComponentConfig[]>([])
let panelCounter = 0

const labelWidth = computed(() => props.labelWidth || '120px')
const labelPosition = computed(() => props.labelPosition || 'right')

const allComponents = computed(() => {
  return [...props.config.components, ...dynamicPanels.value]
})

const handleAddPanel = (templateConfig: ComponentConfig) => {
  panelCounter++
  const suffix = `_${panelCounter}`

  const newPanel = JSON.parse(JSON.stringify(templateConfig))

  newPanel.attributes = {
    ...newPanel.attributes,
    title: `${newPanel.attributes?.title || '面板'} (副本 ${panelCounter})`,
    titleEN: `${newPanel.attributes?.titleEN || 'panel'}${suffix}`
  }

  if (newPanel.components) {
    updateAttributesPath(newPanel.components, suffix)
  }

  dynamicPanels.value.push(newPanel)

  initPanelFormData(newPanel)
}

const updateAttributesPath = (components: ComponentConfig[], suffix: string) => {
  components.forEach(component => {
    if (component.layoutItem?.attributesPath) {
      component.layoutItem.attributesPath += suffix
    }
    if (component.components) {
      updateAttributesPath(component.components, suffix)
    }
  })
}

const initPanelFormData = (panel: ComponentConfig) => {
  if (panel.components) {
    panel.components.forEach(component => {
      if (component.layoutItem?.attributesPath) {
        const path = component.layoutItem.attributesPath
        if (component.type === 'editor-adder') {
          formData[path] = []
        } else {
          formData[path] = ''
        }
      }
    })
  }
}

const initFormData = () => {
  Object.keys(formData).forEach(key => delete formData[key])

  if (props.modelValue) {
    Object.assign(formData, props.modelValue)
  } else {
    initializeFormDataFromConfig(props.config.components)
  }
}

const initializeFormDataFromConfig = (components: ComponentConfig[]) => {
  components.forEach(component => {
    if (component.type === 'collapse-panel' && component.components) {
      initializeFormDataFromConfig(component.components)
    } else if (component.layoutItem?.attributesPath) {
      const path = component.layoutItem.attributesPath
      if (component.type === 'editor-adder') {
        formData[path] = []
      } else {
        formData[path] = ''
      }
    }
  })
}

const getComponentType = (type: string) => {
  const componentMap: Record<string, any> = {
    'collapse-panel': CollapsePanel,
    'editor-rich-text': 'RichTextEditor',
    'editor-input': 'InputEditor',
    'editor-adder': 'AdderEditor'
  }
  return componentMap[type]
}

const getFormDataValue = (component: ComponentConfig) => {
  if (component.type === 'collapse-panel') {
    return formData
  }
  const path = component.layoutItem?.attributesPath
  return path ? formData[path] : undefined
}

const updateFormData = (value: any, component: ComponentConfig) => {
  if (component.type === 'collapse-panel') {
    Object.assign(formData, value)
    emit('update:modelValue', { ...formData })
  } else {
    const path = component.layoutItem?.attributesPath
    if (path) {
      formData[path] = value
      emit('update:modelValue', { ...formData })
    }
  }
}

const handleSubmit = async () => {
  if (!formRef.value) return

  try {
    await formRef.value.validate()
    const fullConfig = getFullConfig()
    emit('submit', {
      formData: { ...formData },
      config: fullConfig
    })
  } catch (error) {
    console.error('表单验证失败:', error)
  }
}

const getFullConfig = () => {
  return {
    type: 'Agent',
    components: allComponents.value
  }
}

const handleReset = () => {
  formRef.value?.resetFields()
  emit('reset')
}

watch(() => props.config, () => {
  initFormData()
}, { immediate: true, deep: true })

watch(() => props.modelValue, (newVal) => {
  if (newVal) {
    Object.keys(formData).forEach(key => delete formData[key])
    Object.assign(formData, newVal)
  }
}, { deep: true })

defineExpose({
  validate: () => formRef.value?.validate(),
  resetFields: () => formRef.value?.resetFields(),
  clearValidate: () => formRef.value?.clearValidate()
})
</script>

<style scoped lang="less">
.agent-config-form {
  width: 100%;
  padding: 20px;
  background-color: #fff;
  border-radius: 8px;
}

.form-actions {
  display: flex;
  justify-content: center;
  gap: 16px;
  margin-top: 24px;
  padding-top: 24px;
  border-top: 1px solid #e4e7ed;
}
</style>
