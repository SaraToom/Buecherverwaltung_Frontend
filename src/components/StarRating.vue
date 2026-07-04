<script setup lang="ts">
import { ref, computed, getCurrentInstance } from 'vue'

const props = withDefaults(defineProps<{
  modelValue: number
  readonly?: boolean
  max?: number
  size?: number
}>(), {
  max: 5,
  readonly: false,
  size: 26,
})

const emit = defineEmits<{
  'update:modelValue': [value: number]
}>()

const id = `sr-${getCurrentInstance()!.uid}`
const hoverValue = ref<number | null>(null)
const display = computed(() => hoverValue.value ?? props.modelValue)

const STAR = 'M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26Z'

function clipWidth(i: number): number {
  const val = display.value
  if (val >= i) return 24
  if (val >= i - 0.5) return 12
  return 0
}

function onMouseMove(event: MouseEvent, i: number) {
  if (props.readonly) return
  const rect = (event.currentTarget as HTMLElement).getBoundingClientRect()
  hoverValue.value = event.clientX - rect.left < rect.width / 2 ? i - 0.5 : i
}

function onMouseLeave() {
  hoverValue.value = null
}

function onClick() {
  if (props.readonly || hoverValue.value === null) return
  emit('update:modelValue', hoverValue.value)
}
</script>

<template>
  <div
    class="star-rating"
    :class="{ 'star-rating--interactive': !readonly }"
    @mouseleave="onMouseLeave"
    :title="readonly ? `${modelValue} von ${max} Sternen` : undefined"
  >
    <span
      v-for="i in max"
      :key="i"
      class="star-slot"
      @mousemove="onMouseMove($event, i)"
      @click="onClick"
    >
      <svg
        :width="size"
        :height="size"
        viewBox="0 0 24 24"
        class="star-svg"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <clipPath :id="`${id}-${i}`">
            <rect x="0" y="0" :width="clipWidth(i)" height="24" />
          </clipPath>
        </defs>
        <path :d="STAR" class="star-empty" />
        <path :d="STAR" class="star-filled" :clip-path="`url(#${id}-${i})`" />
      </svg>
    </span>
  </div>
</template>

<style scoped>
.star-rating {
  display: inline-flex;
  gap: 2px;
  align-items: center;
  line-height: 0;
}
.star-rating--interactive .star-slot {
  cursor: pointer;
}
.star-slot {
  display: inline-block;
  line-height: 0;
  transition: transform 0.1s ease;
}
.star-rating--interactive .star-slot:hover {
  transform: scale(1.15);
}
.star-svg {
  display: block;
  filter: drop-shadow(0 1px 1px rgba(0, 0, 0, 0.08));
}
.star-empty {
  fill: #e8ddd0;
  stroke: #bfb0a0;
  stroke-width: 0.8;
  stroke-linejoin: round;
}
.star-filled {
  fill: #F5C518;
  stroke: #d4a800;
  stroke-width: 0.5;
  stroke-linejoin: round;
}

/* Besserer Kontrast auf dunklem Hintergrund (z.B. Buchkarten) */
:global(.stars-on-card) .star-empty {
  fill: rgba(255, 255, 255, 0.25);
  stroke: rgba(255, 255, 255, 0.5);
}
:global(.stars-on-card) .star-filled {
  fill: #FFD700;
  stroke: #e6c000;
}
</style>
