<template>
  <div class="min-h-screen bg-neutral-950 text-neutral-50">
    <!-- Верхняя панель -->
    <header class="border-b border-neutral-800 bg-neutral-900/80 backdrop-blur">
      <div class="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
        <div class="flex items-center gap-2">
          <span class="text-lg font-semibold tracking-tight">Flashcards</span>
          <Badge
              variant="outline"
              class="border-neutral-700 text-neutral-300 bg-neutral-900/60"
          >
            Vue · shadcn · Tailwind
          </Badge>
        </div>

        <div class="flex items-center gap-2">
          <Button
              variant="destructive"
              size="sm"
              class="bg-red-700 hover:bg-red-600"
              @click="resetAllProgress"
          >
            Сбросить прогресс всех проектов
          </Button>
        </div>
      </div>
    </header>

    <main
        class="max-w-6xl mx-auto px-4 py-6 grid grid-cols-1 md:grid-cols-[260px,1fr] gap-6"
    >
      <!-- Сайдбар проектов -->
      <aside class="space-y-4">
        <Card class="bg-neutral-900 border-neutral-800">
          <CardHeader class="pb-3">
            <div class="flex items-center justify-between gap-2">
              <CardTitle class="text-base text-neutral-50">Проекты</CardTitle>
            </div>
          </CardHeader>
          <CardContent class="space-y-3">
            <div class="flex gap-2">
              <Input
                  v-model="newProjectName"
                  placeholder="Название проекта"
                  class="h-9 text-sm bg-neutral-900 border-neutral-700 text-neutral-100 placeholder-neutral-500"
                  @keyup.enter="addProject"
              />
              <Button
                  size="sm"
                  class="bg-neutral-700 hover:bg-neutral-600 text-neutral-50"
                  @click="addProject"
              >
                +
              </Button>
            </div>

            <Separator class="bg-neutral-800" />

            <div
                v-if="projects.length === 0"
                class="text-xs text-neutral-400"
            >
              Пока нет проектов. Создайте первый 😊
            </div>

            <nav
                v-else
                class="space-y-1 max-h-[260px] overflow-y-auto custom-scrollbar"
            >
              <button
                  v-for="project in projects"
                  :key="project.id"
                  class="flex w-full items-center justify-between rounded-md px-2 py-1.5 text-sm transition text-left
                       hover:bg-neutral-800 hover:text-neutral-50"
                  :class="
                  selectedProjectId === project.id
                    ? 'bg-neutral-800 text-neutral-50'
                    : 'text-neutral-300'
                "
                  @click="selectProject(project.id)"
              >
                <span class="truncate">{{ project.name || 'Без названия' }}</span>
                <span class="text-[10px] text-neutral-500 ml-2 shrink-0">
                  {{ project.cards.length }} шт.
                </span>
              </button>
            </nav>
          </CardContent>
        </Card>
      </aside>

      <!-- Основная область -->
      <section class="space-y-4">
        <div v-if="!selectedProject">
          <Alert class="bg-neutral-900 border-neutral-700 text-neutral-100">
            <AlertTitle class="text-neutral-50">Нет выбранного проекта</AlertTitle>
            <AlertDescription class="text-neutral-300">
              Создайте проект слева или выберите существующий.
            </AlertDescription>
          </Alert>
        </div>

        <div v-else class="space-y-4">
          <!-- Заголовок проекта и кнопки -->
          <div class="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h1 class="text-xl font-semibold text-neutral-50">
                {{ selectedProject.name || 'Без названия' }}
              </h1>
              <p class="text-xs text-neutral-400">
                Карточек: {{ selectedProject.cards.length }}
              </p>
            </div>

            <div class="flex flex-wrap gap-2">
              <Button
                  variant="outline"
                  size="sm"
                  class="border-neutral-700 text-neutral-200 bg-neutral-900 hover:bg-neutral-800"
                  @click="resetProjectProgress"
              >
                Сбросить прогресс проекта
              </Button>
              <Button
                  size="sm"
                  class="bg-emerald-600 hover:bg-emerald-500 text-neutral-50 disabled:opacity-40"
                  :disabled="!canStartGame"
                  @click="startGame"
              >
                Играть
              </Button>
            </div>
          </div>

          <Separator class="bg-neutral-800" />

          <!-- Форма добавления карточек -->
          <Card class="bg-neutral-900 border-neutral-800">
            <CardHeader class="pb-3">
              <CardTitle class="text-base text-neutral-50">
                Добавить карточки
              </CardTitle>
              <CardDescription class="text-xs text-neutral-400">
                Можно добавлять по одной карточке или загрузить массив JSON сразу.
              </CardDescription>
            </CardHeader>
            <CardContent class="grid gap-4 md:grid-cols-2">
              <!-- Одна карточка -->
              <div class="space-y-2">
                <div class="text-sm font-medium text-neutral-200">
                  Одна карточка
                </div>
                <div class="space-y-2">
                  <Input
                      v-model="newQuestion"
                      placeholder="Вопрос"
                      class="text-sm bg-neutral-900 border-neutral-700 text-neutral-100 placeholder-neutral-500"
                  />
                  <Textarea
                      v-model="newAnswer"
                      placeholder="Ответ (поддерживается HTML)"
                      class="min-h-[90px] text-sm bg-neutral-900 border-neutral-700 text-neutral-100 placeholder-neutral-500"
                  />
                  <Button
                      size="sm"
                      class="bg-neutral-700 hover:bg-neutral-600 text-neutral-50"
                      @click="addCard"
                  >
                    Добавить
                  </Button>
                </div>
              </div>

              <!-- Импорт JSON -->
              <div class="space-y-2">
                <div class="text-sm font-medium text-neutral-200">
                  Импорт JSON
                </div>
                <Textarea
                    v-model="jsonBulk"
                    placeholder='[
  { "question": "Вопрос 1", "answer": "<b>Ответ 1</b>" },
  { "question": "Вопрос 2", "answer": "Ответ 2" }
]'
                    class="min-h-[160px] text-xs font-mono bg-neutral-900 border-neutral-700 text-neutral-100 placeholder-neutral-500"
                />
                <div class="flex items-center justify-between gap-2">
                  <Button
                      size="sm"
                      variant="outline"
                      class="border-neutral-700 text-neutral-200 bg-neutral-900 hover:bg-neutral-800"
                      @click="importJson"
                  >
                    Импортировать
                  </Button>
                  <span
                      v-if="jsonError"
                      class="text-[11px] text-red-400"
                  >
                    {{ jsonError }}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          <!-- Список карточек проекта -->
          <Card
              v-if="selectedProject.cards.length"
              class="bg-neutral-900 border-neutral-800"
          >
            <CardHeader class="pb-3">
              <CardTitle class="text-base text-neutral-50">
                Карточки проекта
              </CardTitle>
            </CardHeader>
            <CardContent
                class="space-y-2 max-h-[260px] overflow-y-auto custom-scrollbar"
            >
              <div
                  v-for="card in selectedProject.cards"
                  :key="card.id"
                  class="flex items-start justify-between gap-2 rounded-md border border-neutral-800 bg-neutral-950/60 px-3 py-2 text-xs"
              >
                <div class="space-y-1 flex-1">
                  <div class="font-medium line-clamp-2 text-neutral-100">
                    {{ card.question || 'Без вопроса' }}
                  </div>
                  <div class="flex flex-wrap gap-1 text-[10px] text-neutral-500">
                    <Badge
                        v-if="card.remembered"
                        variant="outline"
                        class="border-emerald-500/70 text-emerald-300 bg-emerald-950/30"
                    >
                      помню
                    </Badge>
                    <Badge
                        v-if="card.notRemembered && !card.remembered"
                        variant="outline"
                        class="border-amber-500/70 text-amber-300 bg-amber-950/30"
                    >
                      не помню
                    </Badge>
                    <span
                        v-if="!card.remembered && !card.notRemembered"
                        class="text-neutral-500"
                    >
                      ещё не играли
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <!-- Режим игры -->
          <Card
              v-if="isGameActive"
              class="bg-neutral-900 border-neutral-800"
          >
            <CardHeader class="pb-2">
              <div class="flex items-center justify-between gap-2">
                <CardTitle class="text-base text-neutral-50">
                  Режим игры
                </CardTitle>
                <span class="text-xs text-neutral-400">
                  Вопрос: {{ questionCounter }}
                </span>
              </div>
            </CardHeader>

            <CardContent>
              <div v-if="currentCard" class="space-y-4">
                <div class="space-y-1">
                  <div
                      class="text-[11px] uppercase tracking-wide text-neutral-500"
                  >
                    Вопрос
                  </div>
                  <div class="text-sm font-medium text-neutral-50">
                    {{ currentCard.question || 'Без вопроса' }}
                  </div>
                </div>

                <div class="space-y-1">
                  <div class="flex items-center gap-2">
                    <Button
                        size="sm"
                        variant="outline"
                        class="border-neutral-700 text-neutral-200 bg-neutral-900 hover:bg-neutral-800 disabled:opacity-40"
                        :disabled="showAnswer"
                        @click="revealAnswer"
                    >
                      Ответ
                    </Button>
                    <span class="text-[11px] text-neutral-500">
                      Нажмите, чтобы открыть ответ
                    </span>
                  </div>

                  <div
                      v-if="showAnswer"
                      class="mt-2 rounded-md border border-neutral-800 bg-neutral-950 px-3 py-2 text-sm text-neutral-100"
                  >
                    <!-- Ответ может содержать HTML -->
                    <div v-html="currentCard.answer"></div>
                  </div>
                </div>
              </div>

              <div v-else class="text-sm text-neutral-400">
                Карточек для игры не осталось.
              </div>
            </CardContent>

            <CardFooter class="flex justify-between gap-2">
              <div class="flex gap-2">
                <Button
                    size="sm"
                    variant="secondary"
                    class="bg-neutral-800 hover:bg-neutral-700 text-neutral-100 border-neutral-700 disabled:opacity-40"
                    :disabled="!currentCard"
                    @click="onDontRemember"
                >
                  Не помню
                </Button>
                <Button
                    size="sm"
                    class="bg-emerald-600 hover:bg-emerald-500 text-neutral-50 disabled:opacity-40"
                    :disabled="!currentCard"
                    @click="onRemember"
                >
                  Помню
                </Button>
              </div>

              <div class="text-[11px] text-neutral-500 text-right">
                Карточки «не помню» будут появляться,
                пока вы не отметите все как «помню».
              </div>
            </CardFooter>
          </Card>

          <!-- Поздравление -->
          <Alert
              v-if="congratsMessage && !isGameActive"
              class="border-emerald-700 bg-emerald-950/40 text-emerald-100"
          >
            <AlertTitle class="text-emerald-100">
              Отлично! 🎉
            </AlertTitle>
            <AlertDescription>
              {{ congratsMessage }}
            </AlertDescription>
          </Alert>
        </div>
      </section>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from "vue";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import {
  Alert,
  AlertTitle,
  AlertDescription,
} from "@/components/ui/alert";

type CardItem = {
  id: string;
  question: string;
  answer: string;
  remembered: boolean; // флаг "помню"
  notRemembered: boolean; // флаг "не помню"
};

type Project = {
  id: string;
  name: string;
  cards: CardItem[];
};

const LS_KEY = "flashcard_projects_v1";

// --- состояние проектов ---
const projects = ref<Project[]>([]);
const selectedProjectId = ref<string | null>(null);

// --- формы ---
const newProjectName = ref("");
const newQuestion = ref("");
const newAnswer = ref("");
const jsonBulk = ref("");
const jsonError = ref<string | null>(null);

// --- состояние игры ---
const isGameActive = ref(false);
const gameQueue = ref<CardItem[]>([]);
const currentIndex = ref(0);
const showAnswer = ref(false);
const congratsMessage = ref<string | null>(null);

// --- вычисления ---
const selectedProject = computed<Project | null>(() => {
  return projects.value.find((p) => p.id === selectedProjectId.value) ?? null;
});

const canStartGame = computed(() => {
  const p = selectedProject.value;
  if (!p) return false;
  return p.cards.some((c) => !c.remembered);
});

const currentCard = computed<CardItem | null>(() => {
  if (!isGameActive.value) return null;
  if (
      currentIndex.value < 0 ||
      currentIndex.value >= gameQueue.value.length
  )
    return null;
  return gameQueue.value[currentIndex.value];
});

const questionCounter = computed(() => {
  const total = gameQueue.value.length;
  if (total === 0 || !currentCard.value) return "0/0";
  return `${currentIndex.value + 1}/${total}`;
});

// --- утилиты ---
function makeId() {
  return `${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

function saveToStorage() {
  try {
    localStorage.setItem(LS_KEY, JSON.stringify(projects.value));
  } catch (e) {
    console.error("Ошибка сохранения в localStorage", e);
  }
}

function loadFromStorage() {
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (!raw) return;
    const parsed = JSON.parse(raw) as Project[];
    projects.value = (parsed || []).map((p) => ({
      ...p,
      cards: (p.cards || []).map((c) => ({
        ...c,
        remembered: !!c.remembered,
        notRemembered: !!c.notRemembered,
      })),
    }));
    if (projects.value.length && !selectedProjectId.value) {
      selectedProjectId.value = projects.value[0].id;
    }
  } catch (e) {
    console.error("Ошибка чтения из localStorage", e);
  }
}

// --- watchers ---
watch(
    projects,
    () => {
      saveToStorage();
    },
    { deep: true }
);

watch(selectedProjectId, () => {
  stopGame();
});

// --- инициализация ---
onMounted(() => {
  // если хочешь тёмную тему всегда — убедись, что на html есть класс "dark"
  document.documentElement.classList.add("dark");
  loadFromStorage();
});

// --- работа с проектами ---
function addProject() {
  const name = newProjectName.value.trim();
  if (!name) return;
  const project: Project = {
    id: makeId(),
    name,
    cards: [],
  };
  projects.value.push(project);
  newProjectName.value = "";
  selectedProjectId.value = project.id;
}

function selectProject(id: string) {
  selectedProjectId.value = id;
}

// --- карточки ---
function addCard() {
  const p = selectedProject.value;
  if (!p) return;

  const q = newQuestion.value.trim();
  const a = newAnswer.value.trim();
  if (!q && !a) return;

  const card: CardItem = {
    id: makeId(),
    question: q,
    answer: a,
    remembered: false,
    notRemembered: false,
  };

  p.cards.push(card);
  newQuestion.value = "";
  newAnswer.value = "";
}

function importJson() {
  const p = selectedProject.value;
  if (!p) return;
  jsonError.value = null;

  if (!jsonBulk.value.trim()) {
    jsonError.value = "Поле пустое";
    return;
  }

  try {
    const arr = JSON.parse(jsonBulk.value) as Array<{
      question?: string;
      answer?: string;
    }>;
    if (!Array.isArray(arr)) {
      jsonError.value = "JSON должен быть массивом";
      return;
    }

    const newCards: CardItem[] = arr.map((item) => ({
      id: makeId(),
      question: (item.question ?? "").toString(),
      answer: (item.answer ?? "").toString(),
      remembered: false,
      notRemembered: false,
    }));

    p.cards.push(...newCards);
    jsonBulk.value = "";
  } catch (e) {
    jsonError.value = "Ошибка парсинга JSON";
    console.error(e);
  }
}

// --- игра ---
function startGame() {
  const p = selectedProject.value;
  if (!p) return;

  const pool = p.cards.filter((c) => !c.remembered);

  if (pool.length === 0) {
    isGameActive.value = false;
    gameQueue.value = [];
    currentIndex.value = 0;
    showAnswer.value = false;
    congratsMessage.value =
        "Вы уже помните все карточки этого проекта!";
    return;
  }

  const shuffled = [...pool].sort(() => Math.random() - 0.5);

  gameQueue.value = shuffled;
  currentIndex.value = 0;
  isGameActive.value = true;
  showAnswer.value = false;
  congratsMessage.value = null;
}

function stopGame() {
  isGameActive.value = false;
  gameQueue.value = [];
  currentIndex.value = 0;
  showAnswer.value = false;
}

function revealAnswer() {
  showAnswer.value = true;
}

function updateCardFlags(
    cardId: string,
    remembered: boolean,
    notRemembered: boolean,
) {
  const p = selectedProject.value;
  if (!p) return;
  const card = p.cards.find((c) => c.id === cardId);
  if (!card) return;
  card.remembered = remembered;
  card.notRemembered = notRemembered;
}

// Нажатие "Помню"
function onRemember() {
  const card = currentCard.value;
  if (!card) return;

  updateCardFlags(card.id, true, false);

  const id = card.id;
  gameQueue.value = gameQueue.value.filter((c) => c.id !== id);

  if (gameQueue.value.length === 0) {
    isGameActive.value = false;
    showAnswer.value = false;
    currentIndex.value = 0;
    congratsMessage.value =
        "Вы вспомнили все ответы в этом проекте. Так держать!";
    return;
  }

  if (currentIndex.value >= gameQueue.value.length) {
    currentIndex.value = 0;
  }
  showAnswer.value = false;
}

// Нажатие "Не помню"
function onDontRemember() {
  const card = currentCard.value;
  if (!card) return;

  updateCardFlags(card.id, false, true);

  const idx = currentIndex.value;
  const queue = gameQueue.value;
  const [current] = queue.splice(idx, 1);
  queue.push(current);

  if (currentIndex.value >= queue.length) {
    currentIndex.value = 0;
  }
  showAnswer.value = false;
}

// --- сброс прогресса ---
function resetProjectProgress() {
  const p = selectedProject.value;
  if (!p) return;

  p.cards.forEach((c) => {
    c.remembered = false;
    c.notRemembered = false;
  });

  stopGame();
  congratsMessage.value = null;
}

function resetAllProgress() {
  projects.value.forEach((p) => {
    p.cards.forEach((c) => {
      c.remembered = false;
      c.notRemembered = false;
    });
  });
  stopGame();
  congratsMessage.value = null;
}
</script>

<style scoped>
.custom-scrollbar::-webkit-scrollbar {
  width: 6px;
}
.custom-scrollbar::-webkit-scrollbar-track {
  background: transparent;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background: rgba(115, 115, 115, 0.7);
  border-radius: 999px;
}
.custom-scrollbar::-webkit-scrollbar-thumb:hover {
  background: rgba(163, 163, 163, 0.8);
}
</style>
