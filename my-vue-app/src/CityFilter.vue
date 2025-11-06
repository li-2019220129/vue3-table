<template>
    <div style="padding: 10px; min-width: 200px">
        <!-- 搜索框 -->
        <div style="margin-bottom: 8px">
            <tiny-input v-model="searchKeyword" placeholder="搜索城市" size="small" clearable />
        </div>

        <!-- 全选 -->
        <div style="margin-bottom: 6px">
            <tiny-checkbox v-model="selectAll" @change="toggleSelectAll">
                全选
            </tiny-checkbox>
        </div>

        <!-- 城市列表 -->
        <tiny-checkbox-group v-model="localValue" vertical>
            <div style="max-height: 180px; overflow-y: auto">
                <tiny-checkbox v-for="item in filteredOptions" :key="item.value" :label="item.value">
                    {{ item.label }}
                </tiny-checkbox>
            </div>
        </tiny-checkbox-group>

        <!-- 操作按钮 -->
        <div style="margin-top: 10px; text-align: right">
            <tiny-button size="small" type="primary" @click="onConfirm">确认</tiny-button>
            <tiny-button size="small" @click="onClear">清空</tiny-button>
            <tiny-button size="small" text @click="onCancel">取消</tiny-button>
        </div>
    </div>
</template>

<script setup>
import { ref, watch, computed } from 'vue'
import {
    Input as TinyInput,
    Checkbox as TinyCheckbox,
    CheckboxGroup as TinyCheckboxGroup,
    Button as TinyButton
} from '@opentiny/vue'

const props = defineProps({
    grid: Object,
    values: Array,    // 原始 options: [{ label, value }]
    args: Object,     // 筛选上下文 args（包含当前 options、column 等）
    context: Object   // 筛选面板 context（关闭面板、触发筛选）
})

const searchKeyword = ref('')
const localValue = ref([])
const selectAll = ref(false)

// 同步初始化选中项
watch(
    () => props.args.options,
    (val) => {
        console.log(val);
        localValue.value = [...(val || [])]
        selectAll.value = val?.length === props.values.length
    },
    { immediate: true }
)

// 模糊过滤选项
const filteredOptions = computed(() => {
    if (!searchKeyword.value) return props.values
    return props.values.filter(item =>
        item.label.toLowerCase().includes(searchKeyword.value.toLowerCase())
    )
})

// 切换全选
function toggleSelectAll(val) {
    if (val) {
        localValue.value = filteredOptions.value.map(item => item.value)
    } else {
        localValue.value = []
    }
}

// 确认筛选
function onConfirm() {
    props.grid.filter({
        column: props.args.column,
        value: localValue.value
    })
    props.context.close()
}

// 清空筛选
function onClear() {
    localValue.value = []
    selectAll.value = false
    props.args.options = []
    props.grid.handleFilter({
        column: props.args.column,
        value: []
    })
    props.context.close()
}

// 取消（关闭面板，不应用筛选）
function onCancel() {
    props.context.close()
}
</script>
