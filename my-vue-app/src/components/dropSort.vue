<template>
    <div class="drop-sort">
        <TransitionGroup name="list" tag="div" class="list-container">
            <div v-for="(item, index) in dropList" :key="item.name" draggable="true" class="drop-list"
                :class="{ 'is-active': index === activeIndex }" @dragstart="handledragStart($event, index)"
                @dragover.prevent="handledragOver($event, index)" @dragend="handledragEnd">
                <span class="handle">⠿</span>
                {{ item.name }}
            </div>
        </TransitionGroup>

        <pre class="drop-data">{{dropList.map(i => i.name).join(' -> ')}}</pre>
    </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

interface Item { name: string }

const dropList = ref<Item[]>([
    { name: '1. 莫奈的睡莲' }, { name: '2. 梵高的星空' },
    { name: '3. 戴珍珠耳环的少女' }, { name: '4. 呐喊' },
    { name: '5. 记忆的永恒' }
])

const activeIndex = ref(-1)
let lastIndex = -1 // 用于防止同索引重复触发

const handledragStart = (e: DragEvent, index: number) => {
    activeIndex.value = index
    if (e.dataTransfer) {
        e.dataTransfer.effectAllowed = 'move'
    }
    const target = e.target as HTMLElement
    setTimeout(() => {
        target.classList.add('moving')
    }, 0)
}

const handledragOver = (e: DragEvent, index: number) => {
    // 1. 如果位置没变，直接返回
    if (index === activeIndex.value) return

    // 2. 核心：距离判定（防止闪动）
    const targetElement = e.currentTarget as HTMLElement
    const rect = targetElement.getBoundingClientRect()
    const offset = e.clientY - rect.top // 鼠标相对于目标元素顶部的距离
    const threshold = rect.height / 2   // 只有超过元素高度的一半才触发

    //如果向上拖，鼠标没过中线就不动；向下拖同理
    if (index < activeIndex.value && offset > threshold) return
    if (index > activeIndex.value && offset < threshold) return

    // 3. 执行交换
    const movingItem = dropList.value[activeIndex.value]
    dropList.value.splice(activeIndex.value, 1)
    dropList.value.splice(index, 0, movingItem)

    activeIndex.value = index
}

const handledragEnd = (e: DragEvent) => {
    const target = e.target as HTMLElement
    target.classList.remove('moving')
    activeIndex.value = -1
}
</script>

<style scoped lang="less">
.drop-sort {
    width: 400px;
    margin: 50px auto;

    .list-container {
        display: flex;
        flex-direction: column;
        gap: 8px;
        position: relative; // 保证动画计算准确
    }

    .drop-list {
        padding: 0 15px;
        height: 45px;
        display: flex;
        align-items: center;
        background: white;
        border-radius: 8px;
        border: 1px solid #ebeef5;
        cursor: grab;
        // 关键：防止子元素干扰 drag 事件触发
        pointer-events: auto;

        &.is-active {
            background: #f0f7ff;
        }
    }

    // .list-move {
    //     transition: transform 0.3s ease;
    // }

    .moving {
        opacity: 0.1; // 不要设为0，稍微留点余地让浏览器识别
    }

    .drop-data {
        margin-top: 20px;
        padding: 10px;
        background: #282c34;
        color: #abb2bf;
        border-radius: 6px;
        font-size: 12px;
    }
}
</style>