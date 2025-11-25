<script setup lang="ts">
import { computed } from 'vue';
import type { Card } from '@/types';
import { CheckCircle, XCircle } from 'lucide-vue-next';

const props = defineProps<{
  cards: Card[];
  selectedIds: Set<string>;
}>();

const emit = defineEmits<{
  (e: 'row-select', id: string): void;
  (e: 'toggle-select', id: string): void;
}>();

const rows = computed(() => props.cards);

const handleRowClick = (id: string) => {
  emit('row-select', id);
};

const handleToggle = (id: string) => {
  emit('toggle-select', id);
};
</script>

<template>
  <div class="bg-white border border-gray-100 rounded-xl shadow-sm overflow-hidden">
    <div class="overflow-x-auto">
      <table class="min-w-full divide-y divide-gray-100">
        <thead class="bg-gray-50">
          <tr class="text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">
            <th class="px-4 py-3 w-14">Выбор</th>
            <th class="px-4 py-3">Категория</th>
            <th class="px-4 py-3">Вопрос</th>
            <th class="px-4 py-3 text-center">Статистика</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-100">
          <tr
            v-for="card in rows"
            :key="card.id"
            class="hover:bg-emerald-50/50 transition cursor-pointer"
            :class="{ 'bg-emerald-50': selectedIds.has(card.id) }"
            @click="handleRowClick(card.id)"
          >
            <td class="px-4 py-3" @click.stop>
              <input
                type="checkbox"
                :checked="selectedIds.has(card.id)"
                @change="handleToggle(card.id)"
                class="w-4 h-4 text-emerald-600 border-gray-300 rounded focus:ring-emerald-500 cursor-pointer"
              />
            </td>
            <td class="px-4 py-3 whitespace-nowrap">
              <span class="inline-flex px-2 py-1 text-xs font-medium rounded-full bg-emerald-50 text-emerald-700">
                {{ card.category }}
              </span>
            </td>
            <td class="px-4 py-3">
              <p class="text-sm text-gray-800 max-h-12 overflow-hidden">{{ card.question }}</p>
            </td>
            <td class="px-4 py-3">
              <div class="flex items-center justify-center gap-3 text-xs font-semibold">
                <span class="flex items-center gap-1 text-green-600">
                  <CheckCircle :size="14" />
                  {{ card.correctCount }}
                </span>
                <span class="flex items-center gap-1 text-red-500">
                  <XCircle :size="14" />
                  {{ card.incorrectCount }}
                </span>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>
