<template>
  <div class="word-library-tree">
    <el-tree
      v-model:expanded-keys="expandedKeys"
      :data="treeData"
      :default-expand-all="false"
      :draggable="true"
      :allow-drop="allowDrop"
      @node-click="handleNodeClick"
      @node-drag-end="handleDragEnd"
      node-key="id"
      class="custom-tree"
    >
      <!-- 使用默认插槽替换renderContent，避免使用h函数 -->
      <template #default="{ node, data }">
        <div
          class="tree-node-content"
          @mouseenter="handleMouseEnter(data.id)"
          @mouseleave="handleMouseLeave"
        >
          <!-- 拖拽图标，在hover时显示，位于最左侧 -->
          <div class="drag-icon" v-show="hoveredNodeId === data.id">
            <el-icon><Rank /></el-icon>
          </div>
          
          <!-- 节点文本 -->
          <div class="node-label" :style="{ 'marginLeft': data.type === 'child' ? '16px' : '0' }">
            {{ data.label }}
          </div>
          
          <!-- 操作项 -->
          <div class="actions" :style="{ 'opacity': hoveredNodeId === data.id ? '1' : '0' }">
            <!-- 添加子级（仅父级显示） -->
            <el-icon
              v-if="data.type === 'parent'"
              class="action-icon"
              @click.stop="handleAddChild(data.id)"
            >
              <Plus />
            </el-icon>
            
            <!-- 重命名 -->
            <el-icon class="action-icon" @click.stop="handleRename(data.id, data.type)">
              <Edit />
            </el-icon>
            
            <!-- 删除 -->
            <el-icon class="action-icon" @click.stop="handleDelete(data.id, data.type)">
              <Delete />
            </el-icon>
          </div>
        </div>
      </template>
    </el-tree>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { ElTree, ElIcon } from 'element-plus';
import { CaretRight, Rank, Plus, Edit, Delete } from '@element-plus/icons-vue';

// 数据类型定义
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

interface TreeDataItem {
  id: string;
  label: string;
  children?: TreeDataItem[];
  type: 'parent' | 'child';
  parentId?: string;
}

// Props
const props = defineProps<{
  modelValue?: ParentLibrary[];
}>();

// Emits
const emit = defineEmits<{
  'update:modelValue': [value: ParentLibrary[]];
  'add-child': [parentId: string];
  'rename': [id: string, type: 'parent' | 'child', name: string];
  'delete': [id: string, type: 'parent' | 'child'];
}>();

// 内部状态
const expandedKeys = ref<string[]>([]);
const hoveredNodeId = ref<string | null>(null);

// 计算属性：将传入的词库数据转换为树数据
const treeData = computed<TreeDataItem[]>(() => {
  return (props.modelValue || []).map(parent => ({
    id: parent.id,
    label: parent.name,
    type: 'parent',
    children: parent.children.map(child => ({
      id: child.id,
      label: child.name,
      type: 'child',
      parentId: parent.id
    }))
  }));
});

// 允许拖拽的条件
const allowDrop = (draggingNode: any, dropNode: any, type: string) => {
  // 禁止拖拽到子节点内部（只允许平级拖拽）
  if (type === 'inner') return false;
  
  // 只允许在同类型之间拖拽
  return draggingNode.data.type === dropNode.data.type;
};

// 节点点击事件
const handleNodeClick = (data: TreeDataItem) => {
  // 仅父级节点可点击展开/折叠
  if (data.type === 'parent') {
    const index = expandedKeys.value.indexOf(data.id);
    if (index > -1) {
      expandedKeys.value.splice(index, 1);
    } else {
      expandedKeys.value.push(data.id);
    }
  }
};

// 拖拽结束事件
const handleDragEnd = () => {
  // 拖拽结束后，将树数据转换回原始数据格式
  const newData = convertTreeToData(treeData.value);
  emit('update:modelValue', newData);
};

// 转换树数据为原始数据格式
const convertTreeToData = (tree: TreeDataItem[]): ParentLibrary[] => {
  return tree.map(item => ({
    id: item.id,
    name: item.label,
    children: (item.children || []).map(child => ({
      id: child.id,
      name: child.label,
      parentId: item.id
    }))
  }));
};

// 处理hover事件
const handleMouseEnter = (id: string) => {
  hoveredNodeId.value = id;
};

const handleMouseLeave = () => {
  hoveredNodeId.value = null;
};

// 操作项处理
const handleAddChild = (parentId: string) => {
  emit('add-child', parentId);
};

const handleRename = (id: string, type: 'parent' | 'child') => {
  const newName = prompt('请输入新名称:');
  if (newName) {
    emit('rename', id, type, newName);
  }
};

const handleDelete = (id: string, type: 'parent' | 'child') => {
  if (confirm('确定要删除吗？')) {
    emit('delete', id, type);
  }
};
</script>

<style scoped>
.word-library-tree {
  width: 100%;
  max-height: 500px;
  overflow-y: auto;
  padding: 10px;
}

.custom-tree :deep(.el-tree-node__content) {
  display: flex;
  align-items: center;
  padding: 8px 12px;
  cursor: pointer;
  transition: all 0.3s ease;
  border-radius: 4px;
}

.custom-tree :deep(.el-tree-node__content:hover) {
  background-color: #f5f7fa;
}

.custom-tree :deep(.el-tree-node__expand-icon) {
  margin-right: 8px;
  color: #c0c4cc;
}

.custom-tree :deep(.el-tree-node__expand-icon.expanded) {
  transform: rotate(90deg);
}

.tree-node-content {
  display: flex;
  align-items: center;
  width: 100%;
}

/* 拖拽图标样式 */
.drag-icon {
  display: flex;
  align-items: center;
  margin-right: 8px;
  color: #c0c4cc;
  cursor: move;
  transition: all 0.3s ease;
}

.drag-icon:hover {
  color: #409eff;
}

/* 节点文本样式 */
.node-label {
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-weight: 500;
}

/* 操作项样式 */
.actions {
  display: flex;
  gap: 12px;
  opacity: 0;
  transition: opacity 0.3s ease;
}

.action-icon {
  color: #c0c4cc;
  cursor: pointer;
  transition: color 0.3s ease;
  font-size: 18px;
}

.action-icon:hover {
  color: #409eff;
}

.action-icon:hover:nth-child(3) {
  color: #f56c6c;
}

/* 拖拽状态 */
.custom-tree :deep(.el-tree__node.dragging) {
  opacity: 0.5;
}

.custom-tree :deep(.el-tree__drop-indicator) {
  background-color: #409eff;
}
</style>
