<script setup>
import { computed } from "vue";
import { cn } from "@/lib/utils";

const props = defineProps({
  orientation: { type: String, required: false, default: "horizontal" },
  decorative: { type: Boolean, required: false, default: true },
  as: { type: [String, Object], required: false, default: "div" },
  class: { type: null, required: false },
});

const role = computed(() => (props.decorative ? "presentation" : "separator"));
const componentTag = computed(() => props.as || "div");
</script>

<template>
  <component
    :is="componentTag"
    :role="role"
    :aria-orientation="props.orientation"
    :class="
      cn(
        'shrink-0 bg-border',
        props.orientation === 'horizontal' ? 'h-px w-full' : 'w-px h-full',
        props.class,
      )
    "
  />
</template>
