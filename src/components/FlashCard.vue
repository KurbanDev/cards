<script setup lang="ts">
import {
  CheckCircle, XCircle, RotateCcw, Trash2
} from 'lucide-vue-next';
import type { Card } from '@/types';

const props = defineProps<{
  card: Card;
  isSelected: boolean;
}>();

const emit = defineEmits<{
  (e: 'delete', id: string): void;
  (e: 'reset', id: string): void;
  (e: 'toggle-select', id: string): void;
  (e: 'select-card', id: string): void;
}>();

const openDetails = () => {
  emit('select-card', props.card.id);
};

const handleToggle = () => {
  emit('toggle-select', props.card.id);
};
</script>

<template>
  <div
    class="relative h-60 w-full shadow-lg rounded-xl bg-white border border-gray-200 p-6 flex flex-col gap-4 cursor-pointer hover:-translate-y-1 transition transform"
    :class="{ 'ring-2 ring-emerald-500 ring-offset-2': isSelected }"
    @click="openDetails"
  >
    <div class="absolute top-4 left-4 z-10" @click.stop>
      <input
        type="checkbox"
        :checked="isSelected"
        @change="handleToggle"
        class="w-5 h-5 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500 cursor-pointer"
      />
    </div>

    <div class="flex justify-between items-start gap-4 pl-8">
      <span class="bg-emerald-50 text-emerald-700 text-xs px-2 py-1 rounded font-medium uppercase tracking-wide">
        {{ card.category }}
      </span>
      <div class="flex gap-2 text-xs font-mono text-gray-400">
        <span class="text-green-600 flex items-center gap-1"><CheckCircle :size="12" /> {{ card.correctCount }}</span>
        <span class="text-red-500 flex items-center gap-1"><XCircle :size="12" /> {{ card.incorrectCount }}</span>
      </div>
    </div>

    <h3 class="text-lg font-semibold text-gray-800 leading-relaxed line-clamp-3">
      {{ card.question }}
    </h3>

    <div class="mt-auto grid grid-cols-2 gap-3 text-sm font-medium" @click.stop>
      <button
        @click="emit('reset', card.id)"
        class="flex items-center justify-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-700 py-2 rounded"
      >
        <RotateCcw :size="14" /> Сбросить
      </button>
      <button
        @click="emit('delete', card.id)"
        class="flex items-center justify-center gap-2 bg-red-50 hover:bg-red-100 text-red-600 py-2 rounded"
      >
        <Trash2 :size="14" /> Удалить
      </button>
    </div>
  </div>
</template>