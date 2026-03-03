<template>
    <div class="carousel-container" ref="containerRef">
        <button v-if="showControls && offset < 0" class="nav-btn left-btn" @click="move('prev')">
            <span class="arrow"></span>
        </button>

        <div class="carousel-viewport">
            <div class="carousel-content" :style="{ transform: `translateX(${offset}px)` }">
                <div v-for="(item, index) in items" :key="index" class="carousel-item">
                    <div class="item-card">
                        <img :src="item.url" :alt="item.name">
                        <div class="item-info">{{ item.name }}</div>
                    </div>
                </div>
            </div>
        </div>

        <button v-if="showControls && !isAtEnd" class="nav-btn right-btn" @click="move('next')">
            <span class="arrow"></span>
        </button>
    </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, computed } from 'vue';

const props = defineProps({
    items: {
        type: Array, default: () => [
            { name: '风景 1', url: 'https://picsum.photos/220/220?random=1' },
            { name: '风景 2', url: 'https://picsum.photos/220/220?random=2' },
            { name: '风景 3', url: 'https://picsum.photos/220/220?random=3' },
            { name: '风景 4', url: 'https://picsum.photos/220/220?random=4' },
            { name: '风景 5', url: 'https://picsum.photos/220/220?random=5' },
            { name: '风景 6', url: 'https://picsum.photos/220/220?random=6' },
        ]
    }
});

const containerRef = ref(null);
const offset = ref(0);
const containerWidth = ref(0);
const ITEM_SIZE = 220; // 这里的宽度必须和 CSS 中的 flex-basis 一致

// 计算属性：总内容宽度
const totalContentWidth = computed(() => props.items.length * ITEM_SIZE);

// 计算属性：最大可向左滑动的位移量（负值）
const maxScroll = computed(() => {
    const diff = totalContentWidth.value - containerWidth.value;
    return diff > 0 ? -diff : 0;
});

// 计算属性：是否已经滑到了最右侧
const isAtEnd = computed(() => {
    // 使用 1px 的阈值处理浏览器缩放带来的浮点数舍入误差
    return offset.value <= maxScroll.value + 1;
});

// 是否需要显示控制按钮
const showControls = computed(() => totalContentWidth.value > containerWidth.value);

const move = (direction) => {
    if (direction === 'prev') {
        // 向左滑：增加 offset，最大不能超过 0
        offset.value = Math.min(offset.value + ITEM_SIZE, 0);
    } else {
        // 向右滑：减少 offset，最小不能低于 maxScroll
        offset.value = Math.max(offset.value - ITEM_SIZE, maxScroll.value);
    }
};

// 监听容器宽度变化
let resizeObserver = null;
const updateWidth = () => {
    if (containerRef.value) {
        containerWidth.value = containerRef.value.offsetWidth;
        // 窗口缩放时，确保 offset 不会超出新的边界
        if (offset.value < maxScroll.value) {
            offset.value = maxScroll.value;
        }
    }
};

onMounted(() => {
    updateWidth();
    resizeObserver = new ResizeObserver(updateWidth);
    resizeObserver.observe(containerRef.value);
});

onUnmounted(() => {
    if (resizeObserver) resizeObserver.disconnect();
});
</script>

<style scoped>
.carousel-container {
    position: relative;
    width: 100%;
    display: flex;
    align-items: center;
    padding: 20px 0;
    max-width: 600px;
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