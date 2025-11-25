<script setup lang="ts">
import { ref } from 'vue';
import { Settings } from 'lucide-vue-next';
import type { AppSettings } from '../types';

const props = defineProps<{ settings: AppSettings }>();
const emit = defineEmits<{
  (e: 'update:settings', val: AppSettings): void;
  (e: 'close'): void;
}>();

// Копируем пропс для локального редактирования
const localSettings = ref({ ...props.settings });

const save = () => {
  emit('update:settings', localSettings.value);
  emit('close');
};
</script>

<template>
  <div class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
    <div class="bg-white rounded-xl shadow-2xl w-full max-w-lg p-6">
      <h2 class="text-xl font-bold mb-4 flex items-center gap-2">
        <Settings :size="20"/> Настройки AI
      </h2>
      <form @submit.prevent="save" class="space-y-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">API URL (OpenAI Compatible)</label>
          <input
              type="text"
              v-model="localSettings.apiUrl"
              class="w-full border rounded-md p-2 text-sm"
          />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">API Key</label>
          <input
              type="password"
              v-model="localSettings.apiKey"
              class="w-full border rounded-md p-2 text-sm"
              placeholder="sk-..."
          />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Модель</label>
          <input
              type="text"
              v-model="localSettings.model"
              class="w-full border rounded-md p-2 text-sm"
          />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Промпт</label>
          <p class="text-xs text-gray-500 mb-2">Используй {question} для вставки вопроса.</p>
          <textarea
              v-model="localSettings.promptTemplate"
              class="w-full border rounded-md p-2 text-sm h-24"
          ></textarea>
        </div>
        <div class="flex justify-end gap-2 mt-6">
          <button type="button" @click="$emit('close')" class="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded text-sm">Отмена</button>
          <button type="submit" class="px-4 py-2 bg-emerald-600 text-white rounded hover:bg-emerald-700 text-sm">Сохранить</button>
        </div>
      </form>
    </div>
  </div>
</template>