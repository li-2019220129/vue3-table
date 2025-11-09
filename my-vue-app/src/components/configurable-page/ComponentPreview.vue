<template>
    <div class="preview">
        <div class="preview-card" :style="styleObject">
            <h3>{{ model.title }}</h3>
            <p>{{ model.desc }}</p>
            <ul>
                <li v-for="(item, i) in model.items" :key="i">
                    {{ item.name }} × {{ item.count }}
                </li>
            </ul>
        </div>
    </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
const props = defineProps({
    model: { type: Object, required: true }
})

const styleObject = computed(() => ({
    width: props.model.style?.width || '100%',
    height: props.model.style?.height || '200px',
    boxShadow: props.model.style?.shadow ? '0 0 10px rgba(0,0,0,0.3)' : 'none',
    background: '#fff',
    padding: '12px',
    borderRadius: '8px'
}))
</script>

<style scoped>
.preview {
    padding: 16px;
    background: #f5f7fa;
    min-height: 100%;
}

.preview-card {
    transition: all 0.3s ease;
}
</style>
