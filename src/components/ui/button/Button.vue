<script setup>
import { computed } from "vue";
import { cn } from "@/lib/utils";
import { buttonVariants } from ".";

const props = defineProps({
  variant: { type: String, required: false },
  size: { type: String, required: false },
  class: { type: null, required: false },
  as: { type: [String, Object], required: false, default: "button" },
});

const componentTag = computed(() => props.as || "button");
</script>

<template>
  <component
    :is="componentTag"
    :class="cn(buttonVariants({ variant, size }), props.class)"
  >
    <slot />
  </component>
</template>
