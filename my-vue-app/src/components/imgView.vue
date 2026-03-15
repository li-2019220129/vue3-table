<template>
    <teleport to="body">
        <div ref="translateRef" class="img-translate"><img ref="imgRef" :src="item.url" alt="item.name" /></div>
    </teleport>
</template>

<script setup lang="ts">
import { onMounted, ref, onBeforeUnmount } from 'vue'
interface Item { name: string, url: string }

const translateRef = ref<HTMLDivElement>()
const imgRef = ref<HTMLImageElement>()
const scale = ref(1)
const MIN_SCALE = 0.5
const MAX_SCALE = 5

defineProps<{
    item: Item
}>()

const handleWheel = (e: WheelEvent) => {
    const el = translateRef.value
    if (!el) return
    e.preventDefault();
    const delta = e.deltaY > 0 ? -0.1 : 0.1;
    scale.value = Math.min(Math.max(scale.value + delta, MIN_SCALE), MAX_SCALE);
    imgRef.value!.style.transform = `scale(${scale.value})`
}

onMounted(() => {
    translateRef.value!.addEventListener('wheel', handleWheel, { passive: false });
})

onBeforeUnmount(() => {
    translateRef.value!.removeEventListener('wheel', handleWheel)
})
</script>
<style scoped lang='less'>
.img-translate {
    width: 100%;
    height: 100%;
    position: fixed;
    top: 0;
    left: 0;
    bottom: 0;
    right: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 9999;
    background-color: rgba(0, 0, 0, 0.4);
}
</style>