<template>
    <div class="content">
        <div class="left">
            <h2>词库管理</h2>
            <word-library-tree v-model="wordLibraryData" @add-child="handleAddChild" @rename="handleRename"
                @delete="handleDelete" />
        </div>
        <div class="right">
            <h3>操作说明</h3>
            <ul>
                <li>父级词库可点击展开/折叠子级词库</li>
                <li>鼠标悬停在词库上可显示操作按钮</li>
                <li>可拖拽调整词库顺序（父级只能在父级间拖拽，子级只能在子级间拖拽）</li>
                <li>父级词库操作：添加子级、重命名、删除</li>
                <li>子级词库操作：重命名、删除</li>
            </ul>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import WordLibraryTree from './components/WordLibraryTree.vue';

// 模拟数据
interface ChildLibrary {
    id: string;
    name: string;
    parentId: string;
}

interface ParentLibrary {
    id: string;
    name: string;
    children: ChildLibrary[];
}

// 初始数据
const wordLibraryData = ref<ParentLibrary[]>([
    {
        id: 'parent1',
        name: '父级词库1',
        children: [
            { id: 'child1-1', name: '子级词库1-1', parentId: 'parent1' },
            { id: 'child1-2', name: '子级词库1-2', parentId: 'parent1' }
        ]
    },
    {
        id: 'parent2',
        name: '父级词库2',
        children: [
            { id: 'child2-1', name: '子级词库2-1', parentId: 'parent2' }
        ]
    },
    {
        id: 'parent3',
        name: '父级词库3',
        children: []
    }
]);

// 处理添加子级词库
const handleAddChild = (parentId: string) => {
    const newChild: ChildLibrary = {
        id: `child-${Date.now()}`,
        name: `新子级词库${Date.now()}`,
        parentId
    };

    const parentIndex = wordLibraryData.value.findIndex(parent => parent.id === parentId);
    if (parentIndex !== -1) {
        wordLibraryData.value[parentIndex].children.push(newChild);
    }
};

// 处理重命名
const handleRename = (id: string, type: 'parent' | 'child', newName: string) => {
    if (type === 'parent') {
        const parentIndex = wordLibraryData.value.findIndex(parent => parent.id === id);
        if (parentIndex !== -1) {
            wordLibraryData.value[parentIndex].name = newName;
        }
    } else {
        for (const parent of wordLibraryData.value) {
            const childIndex = parent.children.findIndex(child => child.id === id);
            if (childIndex !== -1) {
                parent.children[childIndex].name = newName;
                break;
            }
        }
    }
};

// 处理删除
const handleDelete = (id: string, type: 'parent' | 'child') => {
    if (type === 'parent') {
        wordLibraryData.value = wordLibraryData.value.filter(parent => parent.id !== id);
    } else {
        for (const parent of wordLibraryData.value) {
            parent.children = parent.children.filter(child => child.id !== id);
        }
    }
};
</script>

<style scoped>
.content {
    display: flex;
    height: 100vh;
    padding: 20px;
    gap: 20px;
}

.left {
    flex: 1;
    border: 1px solid #e4e7ed;
    border-radius: 8px;
    padding: 16px;
    background-color: #f5f7fa;
}

.right {
    width: 300px;
    border: 1px solid #e4e7ed;
    border-radius: 8px;
    padding: 16px;
    background-color: #ffffff;
}

h2,
h3 {
    margin-bottom: 16px;
    color: #303133;
}

ul {
    list-style-type: disc;
    padding-left: 20px;
}

li {
    margin-bottom: 8px;
    color: #606266;
    line-height: 1.5;
}
</style>
