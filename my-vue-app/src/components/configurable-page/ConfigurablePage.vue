<template>
    <div class="configurable-page">
        <div class="left-preview">
            <ComponentPreview :model="formModel" />
        </div>
        <div class="right-config">
            <el-form ref="formRef" :model="formModel" label-width="100px">
                <FormRenderer :model="formModel" :schema="schema" />
                <div class="actions">
                    <el-button type="primary" @click="handleSubmit">提交</el-button>
                    <el-button @click="resetForm">重置</el-button>
                    <el-button @click="exportJSON">导出 JSON</el-button>
                </div>
            </el-form>
        </div>
    </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { createInitialModel, exampleSchema } from './form-schema'
import FormRenderer from './FormRenderer.vue'
import ComponentPreview from './ComponentPreview.vue'
const schema = ref(exampleSchema)
const formModel = ref(createInitialModel(schema.value))
const formRef = ref()


// 初始化 model，递归确保每个字段都有值，包括数组和嵌套
function initModel(schema: any[], model: any) {
    schema.forEach(field => {
        if (!field.prop) return

        // 如果字段不存在，初始化
        if (!(field.prop in model) || model[field.prop] === undefined) {
            if (field.type === 'array') model[field.prop] = []
            else if (field.type === 'group' || field.type === 'object') model[field.prop] = {}
            else model[field.prop] = field.default ?? ''
        }

        // 初始化 children
        if (field.children) {
            initModel(field.children, model[field.prop])
        }

        // 初始化数组 itemSchema 的默认值
        if (field.type === 'array' && Array.isArray(model[field.prop])) {
            model[field.prop].forEach((item: any) => {
                initModel(field.itemSchema || [], item)
            })
        }
    })
}

onMounted(() => {

    console.log(formModel.value);
    initModel(exampleSchema, formModel) // 初始化整个表单 model


})

function handleSubmit() {
    formRef.value.validate((valid: boolean) => {
        if (valid) {
            console.log('✅ 表单通过:', formModel.value)
        } else {
            console.warn('❌ 校验失败')
        }
    })
}

function resetForm() {
    formModel.value = createInitialModel(schema.value)
}

function exportJSON() {
    console.log(JSON.stringify(formModel.value, null, 2))
}
</script>

<style scoped>
.configurable-page {
    display: flex;
    height: 100%;
}

.left-preview {
    flex: 1;
    background: #f9fafc;
    padding: 20px;
}

.right-config {
    width: 480px;
    border-left: 1px solid #eee;
    background: #fff;
    padding: 20px;
    overflow-y: auto;
}

.actions {
    margin-top: 20px;
    display: flex;
    justify-content: flex-end;
    gap: 10px;
}
</style>
