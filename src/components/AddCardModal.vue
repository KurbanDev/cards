<script setup lang="ts">
import { ref } from 'vue';

const props = defineProps<{ categories: string[] }>();
const emit = defineEmits<{
  (e: 'save', category: string, question: string, answer: string): void;
  (e: 'close'): void;
}>();

const cat = ref(props.categories[0] || "General");
const q = ref("");
const a = ref("");

const submit = () => {
  if (q.value) emit('save', cat.value, q.value, a.value);
};

</script>

<template>
  <div class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
    <div class="bg-white rounded-xl shadow-xl w-full max-w-lg p-6">
      <h2 class="text-xl font-bold mb-4">Новая карточка</h2>
      <div class="space-y-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Категория</label>
          <div class="flex gap-2">
            <input
                list="categories-list"
                v-model="cat"
                class="w-full border rounded-md p-2 text-sm"
            />
            <datalist id="categories-list">
              <option v-for="c in categories" :key="c" :value="c" />
            </datalist>
          </div>
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Вопрос</label>
          <textarea v-model="q" class="w-full border rounded-md p-2 h-20 text-sm"></textarea>
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Ответ (необязательно)</label>
          <textarea v-model="a" class="w-full border rounded-md p-2 h-20 text-sm"></textarea>
        </div>
        <div class="flex justify-end gap-2">
          <button @click="$emit('close')" class="px-4 py-2 text-gray-600 text-sm">Отмена</button>
          <button @click="submit" :disabled="!q" class="px-4 py-2 bg-emerald-600 text-white rounded text-sm hover:bg-emerald-700 disabled:opacity-50">Добавить</button>
        </div>
      </div>
    </div>
  </div>
</template>