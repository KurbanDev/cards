<template>
  <div
    class="min-h-screen bg-slate-50 text-slate-900 dark:bg-neutral-950 dark:text-neutral-50 transition-colors duration-300"
  >
    <header
      class="border-b border-slate-200 dark:border-neutral-800 bg-white/80 dark:bg-neutral-900/80 backdrop-blur"
    >
      <div class="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
        <div class="flex items-center gap-2">
          <span class="text-lg font-semibold tracking-tight">Flashcards</span>
          <Badge
            variant="outline"
            class="border-slate-200 text-slate-600 bg-white/70 dark:border-neutral-700 dark:text-neutral-300 dark:bg-neutral-900/60"
          >
            Vue · shadcn · Tailwind
          </Badge>
        </div>

        <div class="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            class="border border-slate-200 dark:border-neutral-800"
            @click="toggleTheme"
          >
            <Sun v-if="!isDark" class="h-4 w-4" />
            <Moon v-else class="h-4 w-4" />
          </Button>
          <Button
            variant="destructive"
            size="sm"
            class="bg-red-600 hover:bg-red-500"
            @click="resetAllProgress"
          >
            Сбросить прогресс всех проектов
          </Button>
        </div>
      </div>
    </header>

    <main class="max-w-6xl mx-auto px-4 py-6 space-y-8">
      <section class="space-y-4">
        <div class="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 class="text-xl font-semibold">Проекты</h1>
            <p class="text-sm text-slate-500 dark:text-neutral-400">
              Соберите карточки по проектам и тренируйтесь в режиме игры.
            </p>
          </div>
          <div class="flex flex-wrap gap-2">
            <Button
              size="sm"
              class="bg-neutral-900 text-neutral-50 hover:bg-neutral-800 dark:bg-white dark:text-neutral-900"
              @click="isProjectModalOpen = true"
            >
              <Plus class="h-4 w-4 mr-1" /> Новый проект
            </Button>
            <Button
              size="sm"
              variant="outline"
              class="border-slate-200 text-slate-700 hover:bg-slate-100 dark:border-neutral-700 dark:text-neutral-200 dark:hover:bg-neutral-800"
              :disabled="!selectedProject"
              @click="isCardModalOpen = true"
            >
              <LayoutList class="h-4 w-4 mr-1" /> Добавить карточки
            </Button>
          </div>
        </div>

        <div
          v-if="projects.length === 0"
          class="rounded-xl border border-dashed border-slate-200 bg-white/70 dark:bg-neutral-900/40 dark:border-neutral-800 p-6 text-sm text-slate-500 dark:text-neutral-400"
        >
          Пока нет проектов. Создайте первый, чтобы начать.
        </div>
        <div v-else class="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <Card
            v-for="project in projects"
            :key="project.id"
            class="border-slate-200 bg-white hover:border-emerald-300 hover:-translate-y-0.5 transition dark:border-neutral-800 dark:bg-neutral-900"
          >
            <CardHeader class="pb-3 space-y-1">
              <CardTitle class="text-base flex items-center justify-between gap-2">
                <span class="truncate">{{ project.name || 'Без названия' }}</span>
                <span class="text-[11px] text-slate-500 dark:text-neutral-400">{{ project.cards.length }} шт.</span>
              </CardTitle>
              <CardDescription class="text-xs text-slate-500 dark:text-neutral-400">
                Карточки для тренировки
              </CardDescription>
            </CardHeader>
            <CardContent class="space-y-3">
              <div class="space-y-1">
                <div class="flex items-center justify-between text-xs text-slate-500 dark:text-neutral-400">
                  <span>Прогресс</span>
                  <span class="font-semibold text-slate-700 dark:text-neutral-200">
                    {{ getProjectProgress(project) }}%
                  </span>
                </div>
                <div class="h-2 rounded-full bg-slate-100 dark:bg-neutral-800 overflow-hidden">
                  <div
                    class="h-full bg-emerald-500 transition-all duration-500"
                    :style="{ width: `${getProjectProgress(project)}%` }"
                  />
                </div>
              </div>
              <div class="flex gap-2">
                <Button
                  size="sm"
                  class="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white"
                  :variant="selectedProjectId === project.id ? 'default' : 'secondary'"
                  @click="selectProject(project.id)"
                >
                  {{ selectedProjectId === project.id ? 'Выбрано' : 'Открыть' }}
                </Button>
                <Button
                  size="icon"
                  variant="outline"
                  class="border-slate-200 text-slate-700 hover:bg-slate-100 dark:border-neutral-700 dark:text-neutral-200 dark:hover:bg-neutral-800"
                  :disabled="!project.cards.length"
                  @click="startGame(project.id)"
                >
                  <Play class="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      <section v-if="selectedProject" class="space-y-4">
        <div class="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 class="text-xl font-semibold">{{ selectedProject.name || 'Без названия' }}</h2>
            <p class="text-xs text-slate-500 dark:text-neutral-400">
              Карточек: {{ selectedProject.cards.length }} · Помню: {{ rememberedCount }}/{{ selectedProject.cards.length }}
            </p>
          </div>
          <div class="flex flex-wrap gap-2">
            <Button
              variant="outline"
              size="sm"
              class="border-slate-200 text-slate-700 hover:bg-slate-100 dark:border-neutral-700 dark:text-neutral-200 dark:hover:bg-neutral-800"
              :disabled="!selectedProject.cards.length"
              @click="isCardModalOpen = true"
            >
              Добавить карточку
            </Button>
            <Button
              size="sm"
              class="bg-emerald-600 hover:bg-emerald-500 text-white disabled:opacity-40"
              :disabled="!canStartGame"
              @click="startGame(selectedProject.id)"
            >
              Играть
            </Button>
            <Button
              variant="secondary"
              size="sm"
              class="bg-slate-100 text-slate-800 hover:bg-slate-200 dark:bg-neutral-800 dark:text-neutral-100 dark:hover:bg-neutral-700"
              @click="resetProjectProgress"
            >
              Сбросить прогресс проекта
            </Button>
          </div>
        </div>

        <div class="space-y-2">
          <div class="flex items-center justify-between text-xs text-slate-500 dark:text-neutral-400">
            <span>Общий прогресс</span>
            <span class="font-semibold text-slate-700 dark:text-neutral-200">{{ projectProgress }}%</span>
          </div>
            <div class="h-3 rounded-full bg-slate-200 dark:bg-neutral-800 overflow-hidden">
              <div
                class="h-full bg-emerald-500 transition-all duration-700"
                :style="{ width: `${projectProgress}%` }"
              />
            </div>
        </div>

        <div
          v-if="!selectedProject.cards.length"
          class="rounded-xl border border-dashed border-slate-200 bg-white/70 dark:bg-neutral-900/40 dark:border-neutral-800 p-4 text-sm text-slate-500 dark:text-neutral-400"
        >
          В этом проекте пока нет карточек. Добавьте первые.
        </div>

        <div v-else class="overflow-hidden rounded-xl border border-slate-200 bg-white dark:border-neutral-800 dark:bg-neutral-900">
          <table class="min-w-full divide-y divide-slate-200 dark:divide-neutral-800">
            <thead class="bg-slate-50 dark:bg-neutral-900/60">
              <tr class="text-left text-[11px] font-semibold uppercase tracking-wide text-slate-500 dark:text-neutral-400">
                <th class="px-4 py-3">Вопрос</th>
                <th class="px-4 py-3">Ответ</th>
                <th class="px-4 py-3">Статус</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100 dark:divide-neutral-800">
              <tr
                v-for="card in selectedProject.cards"
                :key="card.id"
                class="hover:bg-emerald-50/60 dark:hover:bg-neutral-800/60 transition-colors"
              >
                <td class="px-4 py-3 text-sm font-medium text-slate-800 dark:text-neutral-100">
                  <span class="line-clamp-2">{{ card.question || 'Без вопроса' }}</span>
                </td>
                <td class="px-4 py-3 text-sm text-slate-600 dark:text-neutral-300">
                  <span class="line-clamp-2" v-html="card.answer || 'Без ответа'"></span>
                </td>
                <td class="px-4 py-3">
                  <div class="flex items-center gap-2">
                    <Badge
                      v-if="card.remembered"
                      variant="outline"
                      class="text-[10px] border-emerald-500/70 text-emerald-600 bg-emerald-50 dark:text-emerald-300 dark:bg-emerald-950/30"
                    >
                      помню
                    </Badge>
                    <Badge
                      v-if="card.notRemembered && !card.remembered"
                      variant="outline"
                      class="text-[10px] border-amber-500/70 text-amber-600 bg-amber-50 dark:text-amber-300 dark:bg-amber-950/30"
                    >
                      не помню
                    </Badge>
                    <span v-if="!card.remembered && !card.notRemembered" class="text-[10px] text-slate-400 dark:text-neutral-500">
                      ещё не играли
                    </span>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <Alert
          v-if="congratsMessage && !isGameActive"
          class="border-emerald-700 bg-emerald-50 text-emerald-800 dark:bg-emerald-950/40 dark:border-emerald-700 dark:text-emerald-100"
        >
          <AlertTitle>Отлично! 🎉</AlertTitle>
          <AlertDescription>
            {{ congratsMessage }}
          </AlertDescription>
        </Alert>
      </section>

      <section v-else>
        <Alert class="bg-white border-slate-200 text-slate-700 dark:bg-neutral-900 dark:border-neutral-800 dark:text-neutral-200">
          <AlertTitle>Нет выбранного проекта</AlertTitle>
          <AlertDescription>
            Создайте проект или выберите существующий в списке выше.
          </AlertDescription>
        </Alert>
      </section>
    </main>

    <!-- Модалка проекта -->
    <div
      v-if="isProjectModalOpen"
      class="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 px-4"
    >
      <div class="w-full max-w-md rounded-xl border border-slate-200 bg-white shadow-2xl p-6 dark:border-neutral-800 dark:bg-neutral-900">
        <div class="flex items-center justify-between mb-4">
          <h3 class="text-lg font-semibold">Новый проект</h3>
          <button class="text-slate-500 hover:text-slate-700 dark:text-neutral-400" @click="isProjectModalOpen = false">✕</button>
        </div>
        <div class="space-y-3">
          <Input
            v-model="newProjectName"
            placeholder="Название проекта"
            class="bg-white dark:bg-neutral-800"
            @keyup.enter="addProject"
          />
          <div class="flex justify-end gap-2 pt-2">
            <Button variant="ghost" @click="isProjectModalOpen = false">Отмена</Button>
            <Button class="bg-emerald-600 hover:bg-emerald-500 text-white" :disabled="!newProjectName.trim()" @click="addProject">
              Создать
            </Button>
          </div>
        </div>
      </div>
    </div>

    <!-- Модалка добавления карточек -->
    <div
      v-if="isCardModalOpen && selectedProject"
      class="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 px-4"
    >
      <div class="w-full max-w-2xl rounded-xl border border-slate-200 bg-white shadow-2xl p-6 dark:border-neutral-800 dark:bg-neutral-900">
        <div class="flex items-center justify-between mb-4">
          <div>
            <h3 class="text-lg font-semibold">Добавить карточки</h3>
            <p class="text-xs text-slate-500 dark:text-neutral-400">{{ selectedProject.name }}</p>
          </div>
          <button class="text-slate-500 hover:text-slate-700 dark:text-neutral-400" @click="closeCardModal">✕</button>
        </div>

        <div class="grid gap-4 md:grid-cols-2">
          <div class="space-y-2">
            <div class="text-sm font-medium">Одна карточка</div>
            <Input
              v-model="newQuestion"
              placeholder="Вопрос"
              class="bg-white dark:bg-neutral-800"
            />
            <Textarea
              v-model="newAnswer"
              placeholder="Ответ (поддерживается HTML)"
              class="min-h-[100px] bg-white dark:bg-neutral-800"
            />
            <Button
              size="sm"
              class="bg-neutral-900 text-neutral-50 hover:bg-neutral-800 dark:bg-white dark:text-neutral-900"
              @click="addCard"
            >
              Добавить
            </Button>
          </div>

          <div class="space-y-2">
            <div class="text-sm font-medium">Импорт JSON</div>
            <Textarea
              v-model="jsonBulk"
              placeholder='[
  { "question": "Вопрос 1", "answer": "<b>Ответ 1</b>" },
  { "question": "Вопрос 2", "answer": "Ответ 2" }
]'
              class="min-h-[180px] text-xs font-mono bg-white dark:bg-neutral-800"
            />
            <div class="flex items-center justify-between gap-2">
              <Button
                size="sm"
                variant="outline"
                class="border-slate-200 text-slate-700 hover:bg-slate-100 dark:border-neutral-700 dark:text-neutral-200 dark:hover:bg-neutral-800"
                @click="importJson"
              >
                Импортировать
              </Button>
              <span v-if="jsonError" class="text-[11px] text-red-500">{{ jsonError }}</span>
            </div>
          </div>
        </div>

        <div class="flex justify-end gap-2 mt-4">
          <Button variant="ghost" @click="closeCardModal">Закрыть</Button>
        </div>
      </div>
    </div>

    <!-- Модалка режима игры -->
    <div
      v-if="isGameActive && selectedProject"
      class="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 px-4"
    >
      <Card class="w-full max-w-2xl border-slate-200 bg-white shadow-2xl dark:border-neutral-800 dark:bg-neutral-900">
        <CardHeader class="pb-2 flex items-center justify-between">
          <div>
            <CardTitle class="text-base">Режим игры</CardTitle>
            <CardDescription class="text-xs text-slate-500 dark:text-neutral-400">Вопрос: {{ questionCounter }}</CardDescription>
          </div>
          <button class="text-slate-500 hover:text-slate-700 dark:text-neutral-400" @click="stopGame">✕</button>
        </CardHeader>
        <CardContent class="space-y-4">
          <div class="space-y-1">
            <div class="flex items-center justify-between text-[11px] uppercase tracking-wide text-slate-500 dark:text-neutral-400">
              <span>Вопрос</span>
              <span class="font-semibold text-slate-700 dark:text-neutral-200">{{ projectProgress }}%</span>
            </div>
            <div class="h-2 rounded-full bg-slate-100 dark:bg-neutral-800 overflow-hidden">
              <div class="h-full bg-emerald-500 transition-all duration-700" :style="{ width: `${projectProgress}%` }" />
            </div>
          </div>

          <div v-if="currentCard" class="space-y-3">
            <div class="text-sm font-medium text-slate-800 dark:text-neutral-100">{{ currentCard.question || 'Без вопроса' }}</div>
            <div class="flex items-center gap-2 text-xs text-slate-500 dark:text-neutral-400">
              <Button
                size="sm"
                variant="outline"
                class="border-slate-200 text-slate-700 hover:bg-slate-100 dark:border-neutral-700 dark:text-neutral-200 dark:hover:bg-neutral-800"
                :disabled="showAnswer"
                @click="revealAnswer"
              >
                Ответ
              </Button>
              <span>Нажмите, чтобы открыть ответ</span>
            </div>
            <div
              v-if="showAnswer"
              class="mt-2 rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700 dark:border-neutral-800 dark:bg-neutral-950"
            >
              <div v-html="currentCard.answer"></div>
            </div>
          </div>
          <div v-else class="text-sm text-slate-500 dark:text-neutral-400">Карточек для игры не осталось.</div>
        </CardContent>
        <CardFooter class="flex justify-between gap-2">
          <div class="flex gap-2">
            <Button
              size="sm"
              variant="secondary"
              class="bg-slate-100 text-slate-800 hover:bg-slate-200 dark:bg-neutral-800 dark:text-neutral-100 dark:hover:bg-neutral-700"
              :disabled="!currentCard"
              @click="onDontRemember"
            >
              Не помню
            </Button>
            <Button
              size="sm"
              class="bg-emerald-600 hover:bg-emerald-500 text-white disabled:opacity-40"
              :disabled="!currentCard"
              @click="onRemember"
            >
              Помню
            </Button>
          </div>
          <div class="text-[11px] text-slate-500 dark:text-neutral-400 text-right">
            Карточки «не помню» будут появляться, пока вы не отметите все как «помню».
          </div>
        </CardFooter>
      </Card>
    </div>
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
import { Badge } from "@/components/ui/badge";
import {
  Alert,
  AlertTitle,
  AlertDescription,
} from "@/components/ui/alert";
import { LayoutList, Moon, Play, Plus, Sun } from "lucide-vue-next";

type CardItem = {
  id: string;
  question: string;
  answer: string;
  remembered: boolean;
  notRemembered: boolean;
};

type Project = {
  id: string;
  name: string;
  cards: CardItem[];
};

const LS_KEY = "flashcard_projects_v1";
const THEME_KEY = "flashcard_theme";

const projects = ref<Project[]>([]);
const selectedProjectId = ref<string | null>(null);

const newProjectName = ref("");
const newQuestion = ref("");
const newAnswer = ref("");
const jsonBulk = ref("");
const jsonError = ref<string | null>(null);

const isProjectModalOpen = ref(false);
const isCardModalOpen = ref(false);

const isGameActive = ref(false);
const gameQueue = ref<CardItem[]>([]);
const currentIndex = ref(0);
const showAnswer = ref(false);
const congratsMessage = ref<string | null>(null);

const isDark = ref(true);

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
  if (currentIndex.value < 0 || currentIndex.value >= gameQueue.value.length) return null;
  return gameQueue.value[currentIndex.value];
});

const questionCounter = computed(() => {
  const total = gameQueue.value.length;
  if (total === 0 || !currentCard.value) return "0/0";
  return `${currentIndex.value + 1}/${total}`;
});

const rememberedCount = computed(() => {
  const p = selectedProject.value;
  if (!p) return 0;
  return p.cards.filter((c) => c.remembered).length;
});

const projectProgress = computed(() => {
  const p = selectedProject.value;
  if (!p || !p.cards.length) return 0;
  return Math.round((rememberedCount.value / p.cards.length) * 100);
});

function makeId() {
  return `${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

function getProjectProgress(project: Project) {
  if (!project.cards.length) return 0;
  const remembered = project.cards.filter((c) => c.remembered).length;
  return Math.round((remembered / project.cards.length) * 100);
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

function applyTheme() {
  const root = document.documentElement;
  if (isDark.value) {
    root.classList.add("dark");
    localStorage.setItem(THEME_KEY, "dark");
  } else {
    root.classList.remove("dark");
    localStorage.setItem(THEME_KEY, "light");
  }
}

function toggleTheme() {
  isDark.value = !isDark.value;
  applyTheme();
}

watch(projects, () => saveToStorage(), { deep: true });

watch(selectedProjectId, () => {
  stopGame();
});

onMounted(() => {
  const savedTheme = localStorage.getItem(THEME_KEY);
  isDark.value = savedTheme ? savedTheme === "dark" : true;
  applyTheme();
  loadFromStorage();
});

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
  isProjectModalOpen.value = false;
}

function selectProject(id: string) {
  selectedProjectId.value = id;
}

function closeCardModal() {
  isCardModalOpen.value = false;
  newQuestion.value = "";
  newAnswer.value = "";
  jsonBulk.value = "";
  jsonError.value = null;
}

function addCard() {
  const p = selectedProject.value;
  if (!p) return;

  const q = newQuestion.value.trim();
  const a = newAnswer.value.trim();
  if (!q) return;

  p.cards.push({
    id: makeId(),
    question: q,
    answer: a,
    remembered: false,
    notRemembered: false,
  });

  newQuestion.value = "";
  newAnswer.value = "";
}

function importJson() {
  const p = selectedProject.value;
  if (!p) return;
  jsonError.value = null;

  try {
    const parsed = JSON.parse(jsonBulk.value || "[]") as Array<{
      question?: string;
      answer?: string;
    }>;
    if (!Array.isArray(parsed)) throw new Error("Формат должен быть массивом");
    const prepared = parsed
      .filter((item) => item.question)
      .map((item) => ({
        id: makeId(),
        question: item.question || "",
        answer: item.answer || "",
        remembered: false,
        notRemembered: false,
      }));
    p.cards.push(...prepared);
    jsonBulk.value = "";
    jsonError.value = null;
  } catch (e) {
    jsonError.value = "Ошибка парсинга JSON";
  }
}

function startGame(projectId?: string) {
  if (projectId) {
    selectedProjectId.value = projectId;
  }
  const p = selectedProject.value;
  if (!p) return;

  const pool = p.cards.filter((c) => !c.remembered);
  if (pool.length === 0) {
    currentIndex.value = 0;
    showAnswer.value = false;
    congratsMessage.value = "Вы уже помните все карточки этого проекта!";
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

function updateCardFlags(cardId: string, remembered: boolean, notRemembered: boolean) {
  const p = selectedProject.value;
  if (!p) return;
  const card = p.cards.find((c) => c.id === cardId);
  if (!card) return;
  card.remembered = remembered;
  card.notRemembered = notRemembered;
}

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
    congratsMessage.value = "Вы вспомнили все ответы в этом проекте. Так держать!";
    return;
  }

  if (currentIndex.value >= gameQueue.value.length) {
    currentIndex.value = 0;
  }
  showAnswer.value = false;
}

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

function resetProjectProgress() {
  const p = selectedProject.value;
  if (!p) return;

  if (!confirm("Сбросить прогресс проекта?")) return;

  p.cards.forEach((c) => {
    c.remembered = false;
    c.notRemembered = false;
  });

  stopGame();
  congratsMessage.value = null;
  alert("Прогресс проекта сброшен.");
}

function resetAllProgress() {
  if (!confirm("Сбросить прогресс у всех проектов?")) return;

  projects.value.forEach((p) => {
    p.cards.forEach((c) => {
      c.remembered = false;
      c.notRemembered = false;
    });
  });
  stopGame();
  congratsMessage.value = null;
  alert("Прогресс всех проектов сброшен.");
}
</script>

<style scoped>
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>
