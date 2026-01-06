<template>
    <div class="form-renderer">
        <template v-for="(field, index) in schema" :key="index">
            <!-- 折叠组 -->
            <el-collapse v-if="field.type === 'group'" v-model="collapseMap[field.label]">
                <el-collapse-item :title="field.label">
                    <FormRenderer :model="model[field.prop]" :schema="field.children || []"
                        :basePath="fullPath(field.prop)" @update:model="(val) => (model[field.prop] = val)" />
                </el-collapse-item>
            </el-collapse>

            <!-- 对象嵌套 -->
            <div v-else-if="field.type === 'object'" class="form-object">
                <h4>{{ field.label }}</h4>
                <FormRenderer :model="model[field.prop]" :schema="field.children || []" :basePath="fullPath(field.prop)"
                    @update:model="(val) => (model[field.prop] = val)" />
            </div>

            <!-- 数组 -->
            <div v-else-if="field.type === 'array'" class="form-array">
                <div class="array-header">
                    <h4>{{ field.label }}</h4>
                    <el-button type="primary" size="small" @click="addArrayItem(field)">添加</el-button>
                </div>
                <div v-for="(item, i) in model[field.prop]" :key="i" class="array-item">
                    <FormRenderer :model="model[field.prop][i]" :schema="field.itemSchema || []"
                        :basePath="fullPath(`${field.prop}.${i}`)"
                        @update:model="(val) => (model[field.prop][i] = val)" />
                    <el-button type="danger" size="small" @click="removeArrayItem(field, i)">删除</el-button>
                </div>
            </div>

            <!-- 基础字段 -->
            <el-form-item v-else :label="field.label" :prop="fullPath(field.prop)" :rules="field.rules">
                <component v-if="model" :is="getComponentType(field)" v-model="model[field.prop]" v-bind="field.attrs"
                    clearable />
            </el-form-item>
        </template>
    </div>
</template>

<script setup lang="ts">
import { reactive, defineProps, defineEmits } from 'vue'

const props = defineProps({
    model: { type: Object, required: true },
    schema: { type: Array, required: true },
    basePath: { type: String, default: '' }
})
const emit = defineEmits(['update:model'])

const collapseMap = reactive<Record<string, boolean>>({})

// 拼接完整 prop 路径
function fullPath(prop?: string) {
    if (!prop) return props.basePath || ''
    return props.basePath ? `${props.basePath}.${prop}` : prop
}

// 递归初始化 model，确保所有嵌套字段都有值
function initModel(schema: any[], model: any) {
    if (!model) return
    schema.forEach((field) => {
        if (!field.prop) return

        // 初始化字段
        if (!(field.prop in model) || model[field.prop] === undefined) {
            if (field.type === 'array') model[field.prop] = []
            else if (field.type === 'group' || field.type === 'object')
                model[field.prop] = {}
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

// 初始化当前 model
initModel(props.schema, props.model)

const model = props.model

// 数组操作
function addArrayItem(field: any) {
    const arr = model[field.prop]
    if (Array.isArray(arr)) {
        const newItem: any = {}
            ; (field.itemSchema || []).forEach((sub: any) => {
                if (sub.prop) newItem[sub.prop] = sub.default ?? ''
            })
        arr.push(newItem)
        emit('update:model', model)
    }
}

function removeArrayItem(field: any, index: number) {
    const arr = model[field.prop]
    arr.splice(index, 1)
    emit('update:model', model)
}

// 根据 type 返回组件
function getComponentType(field: any) {
    switch (field.type) {
        case 'input':
            return 'el-input'
        case 'textarea':
            return 'el-input'
        case 'number':
            return 'el-input-number'
        case 'switch':
            return 'el-switch'
        default:
            return 'el-input'
    }
}
</script>

<style scoped>
.form-group,
.form-object {
    margin-bottom: 12px;
}

.form-array {
    border: 1px dashed #ccc;
    padding: 10px;
    border-radius: 6px;
    margin-bottom: 12px;
}

.array-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 8px;
}

.array-item {
    background: #fafafa;
    padding: 8px;
    margin-bottom: 8px;
    border-radius: 4px;
}
</style>
