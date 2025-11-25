<script setup lang="ts">
import { ref } from 'vue';
import {
  CheckCircle, XCircle, RotateCcw, Trash2, BrainCircuit, RefreshCw
} from 'lucide-vue-next';
import type { Card, AppSettings } from '@/types';


const props = defineProps<{
  card: Card;
  settings: AppSettings;
  isSelected: boolean;
}>();

const emit = defineEmits<{
  (e: 'update-stats', id: string, correct: boolean): void;
  (e: 'save-ai', id: string, answer: string): void;
  (e: 'delete', id: string): void;
  (e: 'reset', id: string): void;
  (e: 'toggle-select', id: string): void;
}>();

const isFlipped = ref(false);
const isLoadingAi = ref(false);
const aiError = ref("");

const handleResult = (correct: boolean) => {
  emit('update-stats', props.card.id, correct);
  isFlipped.value = false;
};

const handleGenerateAi = async () => {
  if (!props.settings.apiKey) {
    alert("Пожалуйста, введите API Key в настройках");
    return;
  }

  isLoadingAi.value = true;
  aiError.value = "";

  try {
    const prompt = props.settings.promptTemplate.replace('{question}', props.card.question);

    const response = await fetch(props.settings.apiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${props.settings.apiKey}`
      },
      body: JSON.stringify({
        model: props.settings.model,
        messages: [{ role: "user", content: prompt }],
      })
    });

    const data = await response.json();
    if (data.error) throw new Error(data.error.message);

    const content = data.choices?.[0]?.message?.content || "Нет ответа от API";
    emit('save-ai', props.card.id, content);
  } catch (err: any) {
    aiError.value = err.message || "Ошибка генерации";
  } finally {
    isLoadingAi.value = false;
  }
};
</script>

<template>
  <div class="relative h-96 w-full perspective-1000 group">
    <div
        class="relative w-full h-full transition-all duration-500 transform preserve-3d shadow-lg rounded-xl cursor-pointer"
        :class="{
        'rotate-y-180': isFlipped,
        'ring-2 ring-indigo-500 ring-offset-2': isSelected // Подсветка при выделении
      }"
        @click="isFlipped = !isFlipped"
    >
      <div class="absolute w-full h-full backface-hidden bg-white rounded-xl p-6 border border-gray-200 flex flex-col justify-between">

        <div class="absolute top-4 left-4 z-20" @click.stop>
          <input
              type="checkbox"
              :checked="isSelected"
              @change="$emit('toggle-select', card.id)"
              class="w-5 h-5 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
          />
        </div>

        <div>
          <div class="flex justify-between items-start mb-4 pl-8">
            <span class="bg-emerald-50 text-emerald-700 text-xs px-2 py-1 rounded font-medium uppercase tracking-wide">
              {{ card.category }}
            </span>
            <div class="flex gap-2 text-xs font-mono text-gray-400">
              <span class="text-green-600 flex items-center gap-1"><CheckCircle :size="12"/> {{ card.correctCount }}</span>
              <span class="text-red-500 flex items-center gap-1"><XCircle :size="12"/> {{ card.incorrectCount }}</span>
            </div>
          </div>
          <h3 class="text-lg font-semibold text-gray-800 leading-relaxed overflow-y-auto max-h-60 scrollbar-thin">
            {{ card.question }}
          </h3>
        </div>

        <div class="text-center text-gray-400 text-sm mt-4">
          Нажми, чтобы увидеть ответ
        </div>
      </div>

      <div class="absolute w-full h-full backface-hidden rotate-y-180 bg-white rounded-xl p-6 border border-emerald-100 flex flex-col overflow-hidden cursor-default" @click.stop>
        <div class="absolute top-4 right-4 flex gap-2 z-10">
          <button @click.stop="emit('reset', card.id)" class="text-gray-400 hover:text-gray-600" title="Сброс прогресса">
            <RotateCcw :size="16" />
          </button>
          <button @click.stop="emit('delete', card.id)" class="text-gray-400 hover:text-red-500" title="Удалить">
            <Trash2 :size="16" />
          </button>
        </div>

        <div class="flex-1 overflow-y-auto pr-2 -mr-2 scrollbar-thin mb-4">
          <div class="mb-4">
            <h4 class="text-xs uppercase text-gray-400 font-bold mb-1">Правильный ответ:</h4>
            <p class="text-gray-700 whitespace-pre-wrap text-sm">{{ card.answer || "Ответ не указан." }}</p>
          </div>
          <div v-if="card.aiAnswer" class="bg-emerald-50 p-3 rounded-lg border border-emerald-100 mb-4">
            <h4 class="text-xs uppercase text-emerald-600 font-bold mb-1 flex items-center gap-1">
              <BrainCircuit :size="12"/> AI Ответ:
            </h4>
            <p class="text-gray-700 text-sm whitespace-pre-wrap">{{ card.aiAnswer }}</p>
          </div>
        </div>

        <div class="mt-auto space-y-3">
          <button
              @click="handleGenerateAi"
              :disabled="isLoadingAi"
              class="w-full py-2 flex items-center justify-center gap-2 text-xs font-medium text-emerald-600 bg-emerald-50 hover:bg-emerald-100 rounded transition disabled:opacity-50"
          >
            <BrainCircuit v-if="!isLoadingAi" :size="14" />
            <RefreshCw v-else class="animate-spin" :size="14" />
            {{ card.aiAnswer ? "Сгенерировать заново (GPT)" : "Спросить AI (GPT)" }}
          </button>
          <p v-if="aiError" class="text-xs text-red-500 text-center">{{ aiError }}</p>

          <div class="grid grid-cols-2 gap-3">
            <button @click="handleResult(false)" class="flex items-center justify-center gap-2 bg-red-50 text-red-700 py-2 rounded hover:bg-red-100 transition text-sm font-medium"><XCircle :size="16" /> Не верно</button>
            <button @click="handleResult(true)" class="flex items-center justify-center gap-2 bg-green-50 text-green-700 py-2 rounded hover:bg-green-100 transition text-sm font-medium"><CheckCircle :size="16" /> Верно</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>