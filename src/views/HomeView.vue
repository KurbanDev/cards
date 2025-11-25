<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue';
import {
  Upload,
  Settings,
  BrainCircuit,
  Plus,
  Filter,
  RefreshCw,
  Search,
  Trash2,
  CheckCircle,
  XCircle,
  RotateCcw
} from 'lucide-vue-next';
import type { Card, AppSettings, RawImportItem } from '@/types';
import FlashCard from '@/components/FlashCard.vue';
import SettingsModal from '@/components/SettingsModal.vue';
import AddCardModal from '@/components/AddCardModal.vue';

// --- Константы ---
const DEFAULT_SETTINGS: AppSettings = {
  apiUrl: "https://api.openai.com/v1",
  apiKey: "",
  model: "gpt-4o-mini",
  promptTemplate: "Ты — опытный технический ментор. Ответь кратко и по сути на следующий вопрос собеседования:\n\n{question}"
};

// --- Состояние ---
const cards = ref<Card[]>([]);
const settings = ref<AppSettings>(DEFAULT_SETTINGS);
const activeCategory = ref("All");
const filterStatus = ref<"all" | "correct" | "incorrect">("all");
const selectedIds = ref<Set<string>>(new Set());
const activeCardId = ref<string | null>(null);
const aiLoadingId = ref<string | null>(null);
const aiError = ref("");

// Модалки
const isSettingsOpen = ref(false);
const isAddModalOpen = ref(false);

// --- Утилиты ---
const generateId = () => Math.random().toString(36).substr(2, 9);

const toggleSelection = (id: string) => {
  if (selectedIds.value.has(id)) {
    selectedIds.value.delete(id);
  } else {
    selectedIds.value.add(id);
  }
};

const deleteSelectedCards = () => {
  const count = selectedIds.value.size;
  if (count === 0) return;

  if (confirm(`Вы уверены, что хотите удалить ${count} карточек? Это действие необратимо.`)) {
    if (activeCardId.value && selectedIds.value.has(activeCardId.value)) {
      activeCardId.value = null;
    }
    cards.value = cards.value.filter(c => !selectedIds.value.has(c.id));
    selectedIds.value.clear(); // Очистить выбор после удаления
  }
};

const selectAllVisible = () => {
  // Если все видимые уже выбраны - снимаем выделение, иначе выбираем все
  const allVisibleIds = filteredCards.value.map(c => c.id);
  const allSelected = allVisibleIds.every(id => selectedIds.value.has(id));

  if (allSelected) {
    // Снимаем выбор только с видимых (или очищаем всё, по желанию)
    allVisibleIds.forEach(id => selectedIds.value.delete(id));
  } else {
    allVisibleIds.forEach(id => selectedIds.value.add(id));
  }
};

// --- Lifecycle & Persistence ---
onMounted(() => {
  const savedCards = localStorage.getItem('flashcards-data');
  const savedSettings = localStorage.getItem('flashcards-settings');

  if (savedCards) {
    try {
      cards.value = JSON.parse(savedCards);
    } catch (e) { console.error("Error parsing cards", e); }
  }

  if (savedSettings) {
    try {
      settings.value = JSON.parse(savedSettings);
    } catch (e) { console.error("Error parsing settings", e); }
  }
});

// Deep watch для сохранения любых изменений внутри объектов
watch(cards, (newVal) => {
  localStorage.setItem('flashcards-data', JSON.stringify(newVal));
}, { deep: true });

watch(cards, () => {
  if (activeCardId.value && !cards.value.some(card => card.id === activeCardId.value)) {
    activeCardId.value = null;
  }
}, { deep: true });

watch(settings, (newVal) => {
  localStorage.setItem('flashcards-settings', JSON.stringify(newVal));
}, { deep: true });

// --- Логика ---

const handleFileUpload = (event: Event) => {
  const target = event.target as HTMLInputElement;
  const file = target.files?.[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = (e) => {
    try {
      const json = JSON.parse(e.target?.result as string) as RawImportItem[];
      if (!Array.isArray(json)) throw new Error("Файл должен содержать массив");

      const newCards: Card[] = json.map(item => ({
        id: generateId(),
        category: item.category || "Uncategorized",
        question: item.question,
        answer: item.answer || "",
        correctCount: 0,
        incorrectCount: 0,
        createdAt: Date.now()
      }));

      cards.value.push(...newCards);
      alert(`Успешно добавлено ${newCards.length} карточек!`);
    } catch (error) {
      alert("Ошибка чтения JSON файла.");
    }
  };
  reader.readAsText(file);
  target.value = ''; // Сброс value
};

const addNewCard = (category: string, question: string, answer: string) => {
  cards.value.unshift({
    id: generateId(),
    category,
    question,
    answer,
    correctCount: 0,
    incorrectCount: 0,
    createdAt: Date.now()
  });
  isAddModalOpen.value = false;
};

// CRUD операции передаются в дочерние компоненты или вызываются напрямую
const updateCardStats = (id: string, isCorrect: boolean) => {
  const card = cards.value.find(c => c.id === id);
  if (card) {
    if (isCorrect) card.correctCount++;
    else card.incorrectCount++;
  }
};

const saveAiAnswer = (id: string, answer: string) => {
  const card = cards.value.find(c => c.id === id);
  if (card) card.aiAnswer = answer;
};

const deleteCard = (id: string) => {
  if (confirm("Удалить эту карточку?")) {
    cards.value = cards.value.filter(c => c.id !== id);
  }
};

const resetCardProgress = (id: string) => {
  const card = cards.value.find(c => c.id === id);
  if (card) {
    card.correctCount = 0;
    card.incorrectCount = 0;
  }
};

const setActiveCard = (id: string) => {
  activeCardId.value = id;
  aiError.value = "";
};

const resetAllProgress = () => {
  if (confirm("Сбросить прогресс у ВСЕХ карточек?")) {
    cards.value.forEach(c => {
      c.correctCount = 0;
      c.incorrectCount = 0;
    });
  }
};

const handleCardDeletion = (id: string) => {
  deleteCard(id);
  if (activeCardId.value === id) {
    activeCardId.value = null;
    aiError.value = "";
  }
};

const updateCardStatsFromSidebar = (isCorrect: boolean) => {
  if (!activeCardId.value) return;
  updateCardStats(activeCardId.value, isCorrect);
};

const resetProgressFromSidebar = () => {
  if (!activeCardId.value) return;
  resetCardProgress(activeCardId.value);
};

const selectedCard = computed(() => cards.value.find(c => c.id === activeCardId.value) || null);

const generateAiAnswer = async () => {
  if (!selectedCard.value) return;
  if (!settings.value.apiKey) {
    alert("Пожалуйста, введите API Key в настройках");
    return;
  }

  aiLoadingId.value = selectedCard.value.id;
  aiError.value = "";

  try {
    const prompt = settings.value.promptTemplate.replace('{question}', selectedCard.value.question);

    const response = await fetch(settings.value.apiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${settings.value.apiKey}`
      },
      body: JSON.stringify({
        model: settings.value.model,
        messages: [{ role: "user", content: prompt }],
      })
    });

    const data = await response.json();
    if (data.error) throw new Error(data.error.message);

    const content = data.choices?.[0]?.message?.content || "Нет ответа от API";
    saveAiAnswer(selectedCard.value.id, content);
  } catch (err: any) {
    aiError.value = err.message || "Ошибка генерации";
  } finally {
    aiLoadingId.value = null;
  }
};

// --- Computed ---
const categories = computed(() => {
  const cats = new Set(cards.value.map(c => c.category));
  return ["All", ...Array.from(cats)];
});

const filteredCards = computed(() => {
  return cards.value.filter(card => {
    const matchesCategory = activeCategory.value === "All" || card.category === activeCategory.value;

    let matchesStatus = true;
    if (filterStatus.value === "correct") {
      matchesStatus = card.correctCount > 0 && card.correctCount > card.incorrectCount;
    }
    if (filterStatus.value === "incorrect") {
      matchesStatus = card.incorrectCount > 0 && card.incorrectCount >= card.correctCount;
    }

    return matchesCategory && matchesStatus;
  });
});
</script>

<template>
  <div class="min-h-screen bg-gray-50 text-gray-900 font-sans">
    <header class="bg-white shadow-sm sticky top-0 z-10">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <div class="flex items-center gap-2">
          <BrainCircuit class="text-emerald-600 w-8 h-8" />
          <h1 class="text-xl font-bold text-gray-800">VueFlash AI</h1>
        </div>

        <div class="flex items-center gap-3">
          <label class="cursor-pointer bg-emerald-50 hover:bg-emerald-100 text-emerald-700 px-3 py-2 rounded-md text-sm font-medium transition flex items-center gap-2">
            <Upload :size="16" />
            <span class="hidden sm:inline">Импорт JSON</span>
            <input type="file" accept=".json" @change="handleFileUpload" class="hidden" />
          </label>

          <button @click="isAddModalOpen = true" class="bg-blue-50 hover:bg-blue-100 text-blue-700 px-3 py-2 rounded-md text-sm font-medium transition flex items-center gap-2">
            <Plus :size="16" />
            <span class="hidden sm:inline">Добавить</span>
          </button>

          <button @click="isSettingsOpen = true" class="p-2 text-gray-500 hover:bg-gray-100 rounded-full transition">
            <Settings :size="20" />
          </button>
        </div>
      </div>
    </header>

    <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

      <div class="mb-8 space-y-4">
        <div class="flex flex-wrap gap-2">
          <button
              v-for="cat in categories"
              :key="cat"
              @click="activeCategory = cat"
              :class="[
              'px-4 py-1.5 rounded-full text-sm font-medium border transition-colors',
              activeCategory === cat
                ? 'bg-emerald-600 text-white border-emerald-600'
                : 'bg-white text-gray-600 border-gray-200 hover:border-emerald-300'
            ]"
          >
            {{ cat }}
          </button>
        </div>

        <div class="flex flex-wrap items-center justify-between gap-4 bg-white p-3 rounded-lg shadow-sm border border-gray-100">
          <div class="flex items-center gap-4 text-sm">
            <div class="flex items-center gap-2 text-gray-600">
              <Filter :size="16" />
              <span>Показать:</span>
            </div>
            <select v-model="filterStatus" class="border-none bg-gray-50 rounded-md py-1 px-2 focus:ring-2 focus:ring-emerald-500 text-gray-700">
              <option value="all">Все карточки</option>
              <option value="correct">В основном верные</option>
              <option value="incorrect">В основном неверные</option>
            </select>
            <span class="text-gray-400">|</span>
            <span class="text-gray-500">Всего: {{ filteredCards.length }}</span>
          </div>

          <button
              v-if="selectedIds.size > 0"
              @click="deleteSelectedCards"
              class="bg-red-50 text-red-600 hover:bg-red-100 px-3 py-1 rounded text-sm flex items-center gap-1 transition-colors font-medium"
          >
            <Trash2 :size="14" />
            Удалить ({{ selectedIds.size }})
          </button>

          <button @click="resetAllProgress" class="text-red-600 hover:text-red-800 text-sm flex items-center gap-1">
            <RefreshCw :size="14" /> Сбросить весь прогресс
          </button>
        </div>
      </div>

      <div v-if="filteredCards.length === 0" class="text-center py-20">
        <div class="inline-block p-4 bg-gray-100 rounded-full mb-4">
          <Search :size="32" class="text-gray-400" />
        </div>
        <h3 class="text-lg font-medium text-gray-900">Карточки не найдены</h3>
        <p class="text-gray-500 mt-1">Импортируйте файл или измените фильтры.</p>
      </div>

      <div v-else class="grid lg:grid-cols-3 gap-6 items-start">
        <div class="lg:col-span-2 space-y-6">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FlashCard
                v-for="card in filteredCards"
                :key="card.id"
                :card="card"
                :is-selected="selectedIds.has(card.id)"
                @toggle-select="toggleSelection"
                @select="setActiveCard"
            />
          </div>
        </div>

        <aside class="bg-white border border-gray-200 rounded-xl shadow-sm p-6 lg:sticky lg:top-20 space-y-4">
          <div class="flex items-center justify-between gap-4">
            <div>
              <p class="text-xs uppercase text-gray-400 font-semibold">Детали карточки</p>
              <h3 class="text-lg font-bold text-gray-800">{{ selectedCard ? 'Просмотр' : 'Выберите карточку' }}</h3>
            </div>
            <button
                v-if="selectedCard"
                @click="activeCardId = null"
                class="text-sm text-gray-500 hover:text-gray-700"
            >
              Очистить
            </button>
          </div>

          <div v-if="selectedCard" class="space-y-4">
            <div class="flex items-center justify-between">
              <span class="bg-emerald-50 text-emerald-700 text-xs px-2 py-1 rounded font-semibold uppercase tracking-wide">
                {{ selectedCard.category }}
              </span>
              <div class="flex items-center gap-3 text-xs font-mono">
                <span class="flex items-center gap-1 text-green-600"><CheckCircle :size="12" /> {{ selectedCard.correctCount }}</span>
                <span class="flex items-center gap-1 text-red-500"><XCircle :size="12" /> {{ selectedCard.incorrectCount }}</span>
              </div>
            </div>

            <div class="space-y-2">
              <h4 class="text-sm font-semibold text-gray-600">Вопрос</h4>
              <p class="text-gray-900 whitespace-pre-wrap">{{ selectedCard.question }}</p>
            </div>

            <div class="space-y-2">
              <h4 class="text-sm font-semibold text-gray-600">Ответ</h4>
              <p class="text-gray-800 whitespace-pre-wrap bg-gray-50 rounded-lg p-3 border border-gray-100">{{ selectedCard.answer || 'Ответ не указан.' }}</p>
            </div>

            <div class="space-y-2">
              <div class="flex items-center justify-between">
                <h4 class="text-sm font-semibold text-emerald-700 flex items-center gap-2">
                  <BrainCircuit :size="16" /> AI ответ
                </h4>
                <button
                    @click="generateAiAnswer"
                    :disabled="aiLoadingId === selectedCard.id"
                    class="text-xs px-3 py-1.5 rounded-md border border-emerald-200 text-emerald-700 hover:bg-emerald-50 transition disabled:opacity-50"
                >
                  {{ selectedCard.aiAnswer ? 'Обновить' : 'Сгенерировать' }}
                </button>
              </div>
              <div v-if="selectedCard.aiAnswer" class="bg-emerald-50 border border-emerald-100 rounded-lg p-3 text-sm text-gray-800 whitespace-pre-wrap">
                {{ selectedCard.aiAnswer }}
              </div>
              <div v-else class="text-xs text-gray-400">AI-ответ пока не получен.</div>
              <div v-if="aiError && aiLoadingId === null" class="text-xs text-red-500">{{ aiError }}</div>
              <div v-if="aiLoadingId === selectedCard.id" class="text-xs text-emerald-600">Генерация ответа...</div>
            </div>

            <div class="grid grid-cols-2 gap-3">
              <button
                  @click="updateCardStatsFromSidebar(false)"
                  class="flex items-center justify-center gap-2 bg-red-50 text-red-700 py-2 rounded hover:bg-red-100 transition text-sm font-medium"
              >
                <XCircle :size="16" /> Не верно
              </button>
              <button
                  @click="updateCardStatsFromSidebar(true)"
                  class="flex items-center justify-center gap-2 bg-green-50 text-green-700 py-2 rounded hover:bg-green-100 transition text-sm font-medium"
              >
                <CheckCircle :size="16" /> Верно
              </button>
            </div>

            <div class="flex items-center justify-between gap-3">
              <button
                  @click="resetProgressFromSidebar"
                  class="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-800"
              >
                <RotateCcw :size="14" /> Сбросить прогресс
              </button>
              <button
                  @click="handleCardDeletion(selectedCard.id)"
                  class="flex items-center gap-2 text-sm text-red-600 hover:text-red-700"
              >
                <Trash2 :size="14" /> Удалить
              </button>
            </div>
          </div>

          <div v-else class="text-gray-500 text-sm">
            Нажмите на карточку в списке, чтобы открыть боковую панель с подробностями и действиями.
          </div>
        </aside>
      </div>
    </main>

    <SettingsModal
        v-if="isSettingsOpen"
        v-model:settings="settings"
        @close="isSettingsOpen = false"
    />

    <AddCardModal
        v-if="isAddModalOpen"
        :categories="categories.filter(c => c !== 'All')"
        @save="addNewCard"
        @close="isAddModalOpen = false"
    />
  </div>
</template>