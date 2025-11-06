<template>
    <div class="tree" tabindex="0" ref="treeRef" @click="handleInputClick">
        <div class="tree-input">
            <span v-if="placeholder && !modelValue" class="tree-input--placeholder">
                {{ placeholder }}
            </span>
            <span v-else class="tree-input--value">
                {{ modelValue }}
            </span>
        </div>
        <div class="tree-icon" ref="iconRef">
            <el-icon size="14" color="#a8abb2">
                <ArrowDown />
            </el-icon>
        </div>
        <transition name="popup">
            <div ref="popupRef" :class="{ 'tree-popupBox': true }" v-show="isClick">
                <div class="popover-arrow"></div>
                <div class="content">
                    <TreeList :modelValue="modelValue" :checkStrictly="checkStrictly" :showCheckbox="showCheckbox"
                        :nodeData="data" @node-click="handleNodeClick">
                    </TreeList>
                </div>
            </div>
        </transition>
    </div>
</template>

<script setup lang="ts">
import { useTemplateRef, onMounted, onUnmounted, ref, watch } from 'vue'
import type { TreeData } from './type/treeSelect'
import TreeList from './tree-list'

const { placeholder = 'select', checkStrictly = false, showCheckbox = false } = defineProps<{
    data: TreeData[],
    checkStrictly: boolean,
    placeholder?: string,
    showCheckbox: boolean
}>()

const treeRef = useTemplateRef<HTMLElement>('treeRef')
const iconRef = useTemplateRef<HTMLElement>('iconRef')
const popupRef = useTemplateRef<HTMLElement>('popupRef')
const isClick = ref(false)
const modelValue = defineModel<string>()
const emit = defineEmits(['node-click'])

const handleNodeClick = (data: any) => {
    if (checkStrictly || !data.children || data.children.length === 0) {
        modelValue.value = data.value
        if (showCheckbox) {
            isClick.value = true
            return
        }
        isClick.value = false
    }
}

const handleInputClick = (e: Event) => {
    if (popupRef.value?.contains(e.target as Node)) {
        setFocus()
        return
    }
    isClick.value = !isClick.value
}

const setRotate = (degree: string | number) => {
    iconRef.value!.style.transform = `rotate(${degree}deg)`
}

const setFocus = () => {
    treeRef.value!.focus()
}

// const removeFocus = () => {
//     isClick.value = false
//     treeRef.value!.blur()
// }

// const setEventFn = (
//     eventStr: string,
//     fn: (e: Event) => void,
//     type: 'add' | 'remove' = 'add'
// ) => {
//     if (type === 'add') {
//         treeRef.value!.addEventListener(eventStr, fn)
//     } else {
//         treeRef.value!.removeEventListener(eventStr, fn)
//     }
// }

watch(
    () => isClick.value,
    (newValue) => {
        if (newValue) {
            setRotate(180)
        } else {
            setRotate(0)
        }
    }
)
const handleTargetClick = (e: Event) => {
    if (!treeRef.value?.contains(e.target as Node)) {
        isClick.value = false
    }
}
const ClickGlobal = () => {
    document.addEventListener('click', handleTargetClick)
}
onMounted(() => {
    ClickGlobal()
    // if (treeRef.value) {
    //     setEventFn('focus', setFocus, 'add')
    //     setEventFn('blur', removeFocus, 'add')
    // }
})

onUnmounted(() => {
    document.removeEventListener('click', handleTargetClick)
    // if (treeRef.value) {
    //     setEventFn('focus', setFocus, 'remove')
    //     setEventFn('blur', removeFocus, 'remove')
    // }
})
</script>
<style lang="less" scoped>
.tree {
    position: relative;
    display: flex;
    cursor: pointer;
    width: 200px;
    height: 32px;
    border: 1px solid #d9d9d9;
    border-radius: 4px;
    transition: all 0.3s;
    padding: 4px 12px;
    box-sizing: border-box;
}

.tree-popupBox {
    position: absolute;
    background: #fff;
    top: calc(100% + 10px);
    left: 0;
    width: 100%;
    min-height: 40px;
    border-radius: 4px;
    box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
    border: 1px solid #d9d9d9;
}

.content {
    width: 100%;
    overflow: auto;
    max-height: 250px;
}

/* 滚动条整体样式 */
::-webkit-scrollbar {
    width: 4px;
    height: 4px;
}

/* 滚动条轨道 */
::-webkit-scrollbar-track {
    background: transparent;
    border-radius: 4px;
}

/* 滚动条滑块 */
::-webkit-scrollbar-thumb {
    background: #ccc;
    border-radius: 4px;
}

/* 滚动条滑块悬停状态 */
::-webkit-scrollbar-thumb:hover {
    background: #a8a8a8;
}

/* 滚动条角落 */
::-webkit-scrollbar-corner {
    background: transparent;
}

.popover-arrow {
    position: absolute;
    top: -8px;
    left: 50%;
    transform: translateX(-50%);
    width: 0;
    height: 0;
}

.popover-arrow::before {
    content: '';
    position: absolute;
    border-left: 8px solid transparent;
    border-right: 8px solid transparent;
    border-bottom: 8px solid #d9d9d9;
    top: 0;
    left: 0;
}

.popover-arrow::after {
    content: '';
    position: absolute;
    border-left: 7px solid transparent;
    border-right: 7px solid transparent;
    border-bottom: 7px solid white;
    top: 1px;
    left: 1.5px;
}

.popup-enter-from,
.popup-leave-to {
    transform: scaleY(0);
    opacity: 0;
    transform-origin: top;
}

.popup-enter-active,
.popup-leave-active {
    transition: transform 0.2s ease, opacity 0.2s ease;
    transform-origin: top;
}

.popup-enter-to,
.popup-leave-from {
    transform: scaleY(1);
    opacity: 1;
}

.tree .tree-icon {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.3s;
}

.tree .tree-input {
    width: 94%;
    height: 100%;
    display: flex;
    align-items: center;
    color: #606266;
}

.tree:hover {
    border: 1px solid #9d969c;
}

.tree:focus {
    border: 1px solid #409eff;
}

.tree-input--placeholder {
    color: #a8abb2;
}
</style>