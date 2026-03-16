<template>
    <div class="carousel-container" ref="containerRef">
        <button v-if="offset < 0" class="nav-btn left-btn" @click="move('prev')">
            <span class="arrow"></span>
        </button>

        <div class="carousel-viewport" @pointerdown="handlePointerDown" @pointermove="handlePointerMove"
            @pointerup="handlePointerUp" @pointercancel="handlePointerUp" style="touch-action: pan-y;">
            <div ref="contentRef" class="carousel-content" :style="{
                transform: `translateX(${offset}px)`,
                transition: isDragging ? 'none' : 'transform 0.4s ease-out'
            }">
                <div v-for="(item, index) in items" :key="index" class="carousel-item"
                    @click="handleImageClick(item, $event)">
                    <div class="item-card">
                        <img :src="item.url" :alt="item.name" draggable="false">
                        <div class="item-info">{{ item.name }}</div>
                    </div>
                </div>
            </div>
        </div>

        <button v-if="maxOffset < 0 && offset > maxOffset" class="nav-btn right-btn" @click="move('next')">
            <span class="arrow"></span>
        </button>

        <ImgView v-if="activeImg" :item="activeImg" @close="activeImg = null"></ImgView>
    </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, onUnmounted } from 'vue';
// 假设 ImgView 已在 components 目录下
import ImgView from './components/imgView.vue';

interface Item { name: string, url: string }

const props = withDefaults(defineProps<{
    items: Item[]
}>(), {
    items: () => [
        { name: '风景 1', url: 'https://picsum.photos/220/220?random=1' },
        { name: '风景 2', url: 'https://picsum.photos/220/220?random=2' },
        { name: '风景 3', url: 'https://picsum.photos/220/220?random=3' },
        { name: '风景 4', url: 'https://picsum.photos/220/220?random=4' },
        { name: '风景 5', url: 'https://picsum.photos/220/220?random=5' },
        { name: '风景 6', url: 'https://picsum.photos/220/220?random=6' },
        { name: '风景 7', url: 'https://picsum.photos/220/220?random=7' },
    ],
})

const containerRef = ref<HTMLDivElement>()
const contentRef = ref<HTMLDivElement>()
const itemWidth = 220
const containerWidth = ref(0)
const offset = ref(0)
const activeImg = ref<Item | null>(null)
let resizeObserver: ResizeObserver | null = null

// --- 滑动逻辑状态 ---
const isDragging = ref(false)
let startX = 0
let startOffset = 0
let isMoveTriggered = false // 标记是否触发了滑动，用于区分点击和拖拽

const maxOffset = computed(() => {
    if (!contentRef.value || !containerRef.value) return 0
    return containerWidth.value - contentRef.value.offsetWidth
})

// 按钮移动逻辑
const move = (direction: 'prev' | 'next') => {
    if (direction === 'prev') {
        offset.value = Math.min(offset.value + itemWidth, 0)
    } else {
        offset.value = Math.max(offset.value - itemWidth, maxOffset.value)
    }
}

// 指针按下
const handlePointerDown = (e: PointerEvent) => {
    isDragging.value = true
    isMoveTriggered = false
    startX = e.clientX
    startOffset = offset.value

    // 捕获指针，防止鼠标移出浏览器失效
    const el = e.currentTarget as HTMLElement
    el.setPointerCapture(e.pointerId)
}

// 指针移动
const handlePointerMove = (e: PointerEvent) => {
    if (!isDragging.value) return

    const deltaX = e.clientX - startX
    if (Math.abs(deltaX) > 5) isMoveTriggered = true // 移动超过5px判定为滑动

    let newOffset = startOffset + deltaX

    // 边缘阻尼效果：超出边界时滑动阻力增加
    if (newOffset > 0) {
        newOffset *= 0.3
    } else if (newOffset < maxOffset.value) {
        newOffset = maxOffset.value + (newOffset - maxOffset.value) * 0.3
    }

    offset.value = newOffset

}

// 指针抬起
const handlePointerUp = (e: PointerEvent) => {
    if (!isDragging.value) return
    isDragging.value = false
    const el = e.currentTarget as HTMLElement
    el.releasePointerCapture(e.pointerId)

    // 自动回弹与对齐
    if (offset.value >= 0) {
        offset.value = 0
    } else if (offset.value <= maxOffset.value) {
        offset.value = maxOffset.value
    } else {
        // 可选：松手时对齐到最近的卡片
        const index = Math.round(Math.abs(offset.value) / itemWidth)
        offset.value = -index * itemWidth
        // 确保对齐后不超出 maxOffset
        if (offset.value < maxOffset.value) offset.value = maxOffset.value
    }
}

// 处理点击
const handleImageClick = (item: Item, e: MouseEvent) => {
    // 如果刚才发生了明显的滑动，则不触发点击预览
    if (isMoveTriggered) return
    activeImg.value = item
}

onMounted(() => {
    if (containerRef.value) {
        containerWidth.value = containerRef.value.offsetWidth
        resizeObserver = new ResizeObserver(() => {
            containerWidth.value = containerRef.value?.offsetWidth || 0
            // 修正调整窗口大小时的偏移
            if (offset.value < maxOffset.value) {
                offset.value = maxOffset.value
            }
        })
        resizeObserver.observe(containerRef.value)
    }
})

onUnmounted(() => {
    resizeObserver?.disconnect()
})
</script>

<style scoped>
.carousel-container {
    position: relative;
    width: 90%;
    height: 300px;
    display: flex;
    align-items: center;
    padding: 20px 0;
    margin: 0 auto;
    user-select: none;
    /* 防止拖拽时选中文字 */
}

.carousel-viewport {
    flex: 1;
    overflow: hidden;
    cursor: grab;
    height: 100%;
    display: flex;
    align-items: center;
}

.carousel-viewport:active {
    cursor: grabbing;
}

.carousel-content {
    display: flex;
    will-change: transform;
    width: fit-content;
}

.carousel-item {
    flex: 0 0 220px;
    width: 220px;
    height: 220px;
    padding: 10px;
    box-sizing: border-box;
}

.item-card {
    width: 100%;
    height: 100%;
    background: #fff;
    border: 1px solid #eee;
    border-radius: 12px;
    display: flex;
    flex-direction: column;
    overflow: hidden;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
    transition: transform 0.2s;
}

.item-card:hover {
    transform: translateY(-5px);
}

.item-card img {
    width: 100%;
    height: 160px;
    object-fit: cover;
    /* 禁止原生图片拖拽干扰我们的逻辑 */
    -webkit-user-drag: none;
}

.item-info {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: 500;
    color: #333;
}

.nav-btn {
    position: absolute;
    top: 50%;
    transform: translateY(-50%);
    width: 40px;
    height: 40px;
    border-radius: 50%;
    border: none;
    background: white;
    box-shadow: 0 4px 10px rgba(0, 0, 0, 0.15);
    cursor: pointer;
    z-index: 10;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: opacity 0.3s, background 0.2s;
}

.nav-btn:hover {
    background: #f8f8f8;
}

.left-btn {
    left: -20px;
}

.right-btn {
    right: -20px;
}

.arrow {
    width: 10px;
    height: 10px;
    border-top: 2px solid #666;
    border-right: 2px solid #666;
}

.left-btn .arrow {
    transform: rotate(-135deg);
}

.right-btn .arrow {
    transform: rotate(45deg);
}

/* 下面可以放预览组件的占位样式或直接在 components 中实现 */
</style>