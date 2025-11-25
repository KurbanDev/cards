export interface Card {
    id: string;
    category: string;
    question: string;
    answer: string;
    aiAnswer?: string;
    correctCount: number;
    incorrectCount: number;
    createdAt: number;
}

export interface AppSettings {
    apiUrl: string;
    apiKey: string;
    model: string;
    promptTemplate: string;
}

export interface RawImportItem {
    category: string;
    question: string;
    answer: string;
}