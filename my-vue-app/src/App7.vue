<template>
    <div class="tag-editor" @click="focusInput">
        <div class="tag-list">
            <el-tag v-for="(tag, index) in tags" :key="index" closable @close="removeTag(index)" class="tag-item">
                {{ tag }}
            </el-tag>
            <!-- 输入框 -->
            <el-input v-model="inputValue" ref="inputRef" class="tag-input" placeholder="按回车生成标签"
                @keydown.enter.prevent="handleEnter" @paste="handlePaste" type="textarea"
                :autosize="{ minRows: 1, maxRows: 1 }" maxlength="100" show-word-limit={false} />
        </div>
    </div>
</template>

<script lang="ts" setup>
import { ref } from 'vue'
import { ElMessage } from 'element-plus'

const tags = ref<string[]>([])
const inputValue = ref('')
const inputRef = ref<any>(null)
const MAX_TAGS = 100

const focusInput = () => {
    inputRef.value?.focus()
}

// 添加一个 tag
const handleEnter = () => {
    const value = inputValue.value.trim()
    if (!value) return
    addTags([value])
    inputValue.value = ''
}

// 粘贴多行批量添加 tag
const handlePaste = (e: ClipboardEvent) => {
    const text = e.clipboardData?.getData('text') || ''
    const lines = text.split(/\r?\n/).map(s => s.trim()).filter(Boolean)
    addTags(lines)
    e.preventDefault()
    inputValue.value = ''
}

// 添加标签逻辑
const addTags = (list: string[]) => {
    for (const t of list) {
        if (tags.value.length >= MAX_TAGS) {
            ElMessage.warning(`最多只能添加 ${MAX_TAGS} 个标签`)
            break
        }
        if (t && !tags.value.includes(t)) {
            tags.value.push(t)
        }
    }
}

// 删除 tag
const removeTag = (index: number) => {
    tags.value.splice(index, 1)
}
</script>

<style scoped>
.tag-editor {
    width: 440px;
    max-height: 200px;
    overflow-y: auto;
    padding: 6px;
    border-radius: 8px;
    background: #f9fafb;
    cursor: text;
}

/* 标签列表，每个标签独占一行 */
.tag-list {
    display: flex;
    flex-direction: column;
    gap: 6px;
}

/* 标签样式 */
.tag-item {
    width: fit-content;
    /* 宽度由内容撑开 */
}

/* 输入框样式 */
.tag-input :deep(.el-textarea__inner) {
    border: none;
    outline: none;
    box-shadow: none;
    background: transparent;
    min-height: 28px;
    line-height: 28px;
    font-size: 14px;
    width: 100%;
    resize: none;
}

/* 聚焦时仍然无黑边 */
.tag-input :deep(.el-textarea__inner:focus) {
    border: none;
    outline: none;
    box-shadow: none;
}
</style>
