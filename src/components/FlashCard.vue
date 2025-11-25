<script setup lang="ts">
import { CheckCircle, XCircle } from 'lucide-vue-next';
import type { Card } from '@/types';

const props = defineProps<{
  card: Card;
  isSelected: boolean;
}>();

const emit = defineEmits<{
  (e: 'select', id: string): void;
  (e: 'toggle-select', id: string): void;
}>();

const handleCardClick = () => {
  emit('select', props.card.id);
};

const handleToggleSelection = (event: Event) => {
  event.stopPropagation();
  emit('toggle-select', props.card.id);
};
</script>

<template>
  <div
      class="bg-white rounded-xl shadow-sm border border-gray-200 p-5 h-full flex flex-col gap-4 hover:border-emerald-200 transition cursor-pointer"
      @click="handleCardClick"
  >
    <div class="flex items-start justify-between gap-2">
      <div class="flex-1 min-w-0">
        <div class="flex items-center gap-2 mb-2">
          <span class="bg-emerald-50 text-emerald-700 text-xs px-2 py-1 rounded font-medium uppercase tracking-wide truncate">
            {{ card.category }}
          </span>
          <span v-if="card.aiAnswer" class="text-[10px] text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full border border-emerald-100">AI</span>
        </div>
        <h3 class="text-lg font-semibold text-gray-800 leading-relaxed line-clamp-3">
          {{ card.question }}
        </h3>
      </div>

      <div class="flex flex-col items-end gap-2" @click.stop>
        <input
            type="checkbox"
            :checked="isSelected"
            @change="handleToggleSelection"
            class="w-5 h-5 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500 cursor-pointer"
        />
        <div class="text-xs font-mono text-gray-500 flex flex-col items-end gap-1">
          <span class="flex items-center gap-1 text-green-600"><CheckCircle :size="12" /> {{ card.correctCount }}</span>
          <span class="flex items-center gap-1 text-red-500"><XCircle :size="12" /> {{ card.incorrectCount }}</span>
        </div>
      </div>
    </div>

    <p class="text-sm text-gray-500 line-clamp-2">
      {{ card.answer || 'Ответ не указан.' }}
    </p>

    <button
        class="self-start text-sm font-medium text-emerald-600 hover:text-emerald-700 flex items-center gap-2"
        type="button"
    >
      Открыть детали
    </button>
  </div>
</template>
