<template>
    <div class="carousel-container" ref="containerRef">
        <button v-if="offset < 0" class="nav-btn left-btn" @click="move('prev')">
            <span class="arrow"></span>
        </button>

        <div class="carousel-viewport">
            <div ref="contentRef" class="carousel-content" :style="{ transform: `translateX(${offset}px)` }">
                <div v-for="(item, index) in items" :key="index" class="carousel-item">
                    <div class="item-card">
                        <img :src="item.url" :alt="item.name">
                        <div class="item-info">{{ item.name }}</div>
                    </div>
                </div>
            </div>
        </div>

        <button v-if="maxOffset < 0 && offset > maxOffset" class="nav-btn right-btn" @click="move('next')">
            <span class="arrow"></span>
        </button>
    </div>
</template>

<script setup lang="ts">
interface Item { name: string, url: string }

import { computed, ref } from 'vue';

const containerRef = ref<HTMLDivElement>()
const contentRef = ref<HTMLDivElement>()
withDefaults(defineProps<{
    items: Item[]
}>(), {
    items: () => [
        { name: '风景 1', url: 'https://picsum.photos/220/220?random=1' },
        { name: '风景 2', url: 'https://picsum.photos/220/220?random=2' },
        { name: '风景 3', url: 'https://picsum.photos/220/220?random=3' },
        { name: '风景 4', url: 'https://picsum.photos/220/220?random=4' },
        { name: '风景 5', url: 'https://picsum.photos/220/220?random=5' },
        { name: '风景 6', url: 'https://picsum.photos/220/220?random=6' },
    ],
})


const itemWidth = 220

const offset = ref(0)

const maxOffset = computed(() => {
    if (!contentRef.value || !containerRef.value) return 0
    return containerRef.value!.offsetWidth - contentRef.value!.offsetWidth
})

const move = (direction: 'prev' | 'next') => {
    if (direction === 'prev') {
        offset.value = Math.min(offset.value + itemWidth, 0)
    } else {
        offset.value = Math.max(offset.value - itemWidth, maxOffset.value)
    }
}
</script>

<style scoped>
.carousel-container {
    position: relative;
    width: 80%;
    height: 300px;
    display: flex;
    align-items: center;
    padding: 20px 0;
    margin: 0 auto;
}

.carousel-viewport {
    flex: 1;
    overflow: hidden;
    /* 核心：裁剪溢出 */
}

.carousel-content {
    display: flex;
    transition: transform 0.4s ease-out;
    will-change: transform;
    width: fit-content;
}

.carousel-item {
    flex: 0 0 220px;
    /* 严格固定宽度 */
    width: 220px;
    height: 220px;
    padding: 5px;
    box-sizing: border-box;
}

.item-card {
    width: 100%;
    height: 100%;
    background: #fff;
    border: 1px solid #eee;
    border-radius: 8px;
    display: flex;
    flex-direction: column;
}

.item-card img {
    width: 100%;
    height: 170px;
    object-fit: cover;
    border-radius: 8px 8px 0 0;
}

.item-info {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 14px;
}

.nav-btn {
    position: absolute;
    top: 50%;
    transform: translateY(-50%);
    width: 36px;
    height: 36px;
    border-radius: 50%;
    border: none;
    background: white;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
    cursor: pointer;
    z-index: 10;
    display: flex;
    align-items: center;
    justify-content: center;
}

.left-btn {
    left: -18px;
}

.right-btn {
    right: -18px;
}

.arrow {
    width: 8px;
    height: 8px;
    border-top: 2px solid #333;
    border-right: 2px solid #333;
}

.left-btn .arrow {
    transform: rotate(-135deg);
}

.right-btn .arrow {
    transform: rotate(45deg);
}
</style>