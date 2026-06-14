export const QUIZ_MIN_CARDS = 4;
export const QUIZ_CHOICE_COUNT = 4;

export type QuizCard = {
  id: string;
  front: string;
  back: string;
  imageUrl?: string | null;
};

export type QuizQuestion = {
  cardId: string;
  front: string;
  imageUrl?: string | null;
  choices: string[];
  correctIndex: number;
};

function shuffle<T>(input: readonly T[]): T[] {
  const arr = [...input];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function pickDistractors(card: QuizCard, allCards: readonly QuizCard[]): string[] {
  const otherBacks = allCards
    .filter((c) => c.id !== card.id)
    .map((c) => c.back)
    .filter((b) => b !== card.back);
  const uniqueBacks = Array.from(new Set(otherBacks));
  const want = QUIZ_CHOICE_COUNT - 1;
  if (uniqueBacks.length >= want) {
    return shuffle(uniqueBacks).slice(0, want);
  }
  return shuffle(otherBacks).slice(0, want);
}

export function generateQuizQuestions(
  cards: readonly QuizCard[]
): QuizQuestion[] {
  const shuffledCards = shuffle(cards);
  return shuffledCards.map((card) => {
    const distractors = pickDistractors(card, cards);
    const choices = shuffle([card.back, ...distractors]);
    return {
      cardId: card.id,
      front: card.front,
      imageUrl: card.imageUrl ?? null,
      choices,
      correctIndex: choices.indexOf(card.back),
    };
  });
}
