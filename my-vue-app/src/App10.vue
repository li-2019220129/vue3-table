<template>
  <div class="agent-config-page">
    <h1>助手配置</h1>

    <agent-config-form ref="formRef" :config="currentConfig" v-model="formData" label-width="120px"
      @submit="handleSubmit" @reset="handleReset" />

    <div class="preview-section">
      <h3>表单数据预览</h3>
      <pre>{{ JSON.stringify(formData, null, 2) }}</pre>
    </div>

    <div class="preview-section">
      <h3>完整配置预览（保存到后端）</h3>
      <pre>{{ JSON.stringify(savedConfig, null, 2) }}</pre>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { AgentConfigForm, agentConfig } from './components/agent-config'
import type { FormData, AgentConfig } from './components/agent-config/types'
import { ElMessage } from 'element-plus'

const formRef = ref()
const formData = ref<FormData>({})

const currentConfig = ref<AgentConfig>(agentConfig)
const savedConfig = ref<AgentConfig | null>(null)

const handleSubmit = (data: { formData: FormData; config: AgentConfig }) => {
  console.log('提交的表单数据:', data.formData)
  console.log('提交的完整配置:', data.config)

  savedConfig.value = data.config

  ElMessage.success('配置保存成功！可查看"完整配置预览"了解保存到后端的数据')
}

const handleReset = () => {
  ElMessage.info('表单已重置')
}
</script>

<style scoped lang="less">
.agent-config-page {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;

  h1 {
    text-align: center;
    margin-bottom: 30px;
    color: #303133;
  }
}

.preview-section {
  margin-top: 30px;
  padding: 20px;
  background-color: #f5f7fa;
  border-radius: 8px;

  h3 {
    margin-bottom: 16px;
    color: #606266;
  }

  pre {
    background-color: #fff;
    padding: 16px;
    border-radius: 4px;
    overflow-x: auto;
    font-size: 14px;
    line-height: 1.6;
    color: #303133;
    max-height: 400px;
  }
}
</style>
