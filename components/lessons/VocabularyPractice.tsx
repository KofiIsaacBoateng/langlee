import { Question, Word } from "@/constants/CourseData";
import { router } from "expo-router";
import React, { useEffect, useMemo, useState } from "react";
import { StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import ConfirmDialog from "../ui/ConfirmDialog";
import ProgressBarHeader from "./ProgressBarHeader";

interface StudyCard {
  key: string;
  word: Word;
  direction: "zh-en" | "en-zh";
}

interface DeckBuckets {
  recognition: StudyCard[];
  recall: StudyCard[];
  total: number;
}

type StudyPhase = "recognition" | "recall";

interface StudyState {
  phase: StudyPhase;
  queue: string[];
  recallKeys: string[];
  cards: Record<string, StudyCard>;
  total: number;
  completed: number;
}

const getUniqueWords = (questions: Question[]): Word[] => {
  const allwords = new Map<string, Word>();

  questions.forEach((question) => {
    const wordSource =
      question.type === "listening_mc"
        ? question.mandarin.words
        : question.options.flatMap((q) => q.mandarin.words);

    wordSource.forEach((word) => {
      if (word && word.hanzi && !allwords.has(word.hanzi)) {
        allwords.set(word.hanzi, word);
      }
    });
  });

  return Array.from(allwords.values());
};

const buildDeck = (words: Word[]): DeckBuckets => {
  const recognition: StudyCard[] = words.map((word) => ({
    key: `${word.hanzi}-recognition`,
    word: word,
    direction: "zh-en",
  }));

  const recall: StudyCard[] = words.map((word) => ({
    key: `${word.hanzi}-recall`,
    word: word,
    direction: "en-zh",
  }));

  return {
    recognition,
    recall,
    total: recognition.length + recall.length,
  };
};

const initializeStudyState = (deck: DeckBuckets): StudyState => {
  const cards: Record<string, StudyCard> = {};

  [...deck.recognition, ...deck.recall].forEach(
    (entry) => (cards[entry.key] = entry),
  );

  return {
    phase: "recognition",
    queue: deck.recognition.map((entry) => entry.key),
    recallKeys: deck.recall.map((entry) => entry.key),
    cards,
    total: deck.total,
    completed: 0,
  };
};

const VocabularyPractice = ({
  questions,
  onStartLesson,
}: {
  questions: Question[];
  onStartLesson: () => void;
}) => {
  const insets = useSafeAreaInsets();
  const vocabs = useMemo(() => getUniqueWords(questions), [questions]);
  const deck = useMemo(() => buildDeck(vocabs), [vocabs]);
  const [state, setState] = useState<StudyState>(() =>
    initializeStudyState(deck),
  );
  const [showExitModal, setShowExitModal] = useState<boolean>(false);

  useEffect(() => {
    if (
      state.queue.length === 0 &&
      state.recallKeys.length === 0 &&
      state.completed >= state.total
    ) {
      onStartLesson();
    }
  }, [
    state.queue.length,
    state.recallKeys.length,
    state.completed,
    state.total,
    onStartLesson,
  ]);

  const progressPercent =
    state.total === 0 ? 0 : (state.completed / state.total) * 100;
  const currentKey = state.queue[0];
  const currentCard = currentKey ? state.cards[currentKey] : undefined;
  const currentCount = currentCard
    ? Math.min(state.completed + 1, state.total)
    : state.completed;

  const onClose = (value: boolean) => {
    setShowExitModal(value);
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <ConfirmDialog
        visible={showExitModal}
        title="Are you sure about that?"
        description="All progress in this lesson will be lost."
        cancelLabel="keep going"
        confirmLabel="end session"
        onCancel={() => onClose(false)}
        onConfirm={() => {
          onClose(false);
          router.back();
        }}
      />
      <ProgressBarHeader
        progress={50}
        currentCount={currentCount}
        totalCount={state.total}
        onClose={() => onClose(true)}
      />
    </View>
  );
};

export default VocabularyPractice;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },

  header: {},
});
