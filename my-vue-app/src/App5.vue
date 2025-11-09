<template>
    <div class="content">
        <!-- 左侧主区域 -->
        <div class="left" @click="handleClick" :style="{ width: leftWidth }"></div>

        <!-- 右侧抽屉 -->
        <transition name="slide-fade">
            <div v-if="isClick" class="right"></div>
        </transition>
    </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'

const isClick = ref(false)

const handleClick = () => {
    isClick.value = !isClick.value
}

// 左侧宽度平滑变化
const leftWidth = computed(() => (isClick.value ? 'calc(100% - 300px)' : '100%'))
</script>

<style scoped>
.content {
    position: relative;
    display: flex;
    height: 500px;
    overflow: hidden;
}

/* 左侧区域 */
.left {
    height: 100%;
    background-color: pink;
    transition: width 0.4s cubic-bezier(0.22, 1, 0.36, 1);
}

/* 右侧抽屉：不占位、绝对定位 */
.right {
    position: absolute;
    top: 0;
    right: 0;
    width: 300px;
    height: 100%;
    background-color: #ccc;
    box-shadow: -4px 0 10px rgba(0, 0, 0, 0.1);
}

/* 动画定义 */
.slide-fade-enter-active,
.slide-fade-leave-active {
    transition: all 0.4s cubic-bezier(0.22, 1, 0.36, 1);
}

.slide-fade-enter-from,
.slide-fade-leave-to {
    transform: translateX(100%);
    opacity: 0;
}
</style>
