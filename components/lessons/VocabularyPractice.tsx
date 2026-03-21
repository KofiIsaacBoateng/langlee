import { Question, Word } from "@/constants/CourseData";
import { router } from "expo-router";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import ConfirmDialog from "../ui/ConfirmDialog";
import FlashCard from "./FlashCard";
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
    state.total === 0 ? 0 : ((state.completed + 1) / state.total) * 80 + 20;
  const currentKey = state.queue[0];
  const currentCard = currentKey ? state.cards[currentKey] : undefined;
  const currentCount = currentCard
    ? Math.min(state.completed + 1, state.total)
    : state.completed;

  const onClose = (value: boolean) => {
    setShowExitModal(value);
  };

  const handleCTX = useCallback(() => {
    setState((prev) => {
      if (!prev.queue.length) {
        return prev;
      }

      const [activeKey, ...restQueue] = prev.queue;
      const entry = prev.cards[activeKey];
      if (!entry) {
        return { ...prev, queue: restQueue };
      }

      let queue = [...restQueue];
      let completed = prev.completed + 1;
      let phase = prev.phase;
      let recallKeys = prev.recallKeys;

      if (
        queue.length === 0 &&
        phase === "recognition" &&
        recallKeys.length > 0
      ) {
        queue = [...recallKeys];
        phase = "recall";
        recallKeys = [];
      }

      return {
        ...prev,
        queue,
        recallKeys,
        phase,
        completed,
      };
    });
  }, []);

  return (
    <View
      style={[
        styles.container,
        { paddingTop: insets.top, paddingBottom: insets.bottom + 10 },
      ]}
    >
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
        progress={progressPercent}
        currentCount={currentCount}
        totalCount={state.total}
        onClose={() => onClose(true)}
      />

      {/*** lessons */}
      {/**** intro */}
      <View style={styles.intro}>
        <Text style={styles.title}>Lesson Vocabulary</Text>
        <Text style={styles.subtitle}>
          Tap to flip card if you recall or recognise word
        </Text>
      </View>
      {/*** card */}
      {currentCard && (
        <View style={styles.flashCardContainer}>
          <FlashCard
            word={currentCard.word}
            key={currentKey}
            direction={currentCard.direction}
          />
        </View>
      )}

      {/**** ctx */}
      <View style={styles.ctx}>
        <Pressable onPress={handleCTX} style={styles.cancel}>
          <View style={styles.cancelShadow} />
          <Text style={styles.cancelLabel}>
            {currentCount === state.total ? "Start Lesson" : "Got it"}
          </Text>
        </Pressable>
        <Pressable onPress={onStartLesson} style={styles.confirm}>
          <Text style={styles.confirmLabel}>Skip to Lesson</Text>
        </Pressable>
      </View>
    </View>
  );
};

export default VocabularyPractice;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },

  intro: {
    alignItems: "center",
    marginTop: 20,
  },

  title: {
    fontSize: 24,
    fontWeight: "800",
    color: "#000c",
    fontFamily: "SpaceMono",
  },
  subtitle: {
    color: "#3338",
    fontSize: 15,
    fontFamily: "Inter",
    fontWeight: 700,
  },

  flashCardContainer: {
    marginVertical: 30,
    alignItems: "center",
  },
  ctx: {
    marginTop: "auto",
    gap: 15,
    paddingHorizontal: 25,
  },

  cancel: {
    backgroundColor: "#1ecc1e",
    alignItems: "center",
    paddingVertical: 15,
    borderRadius: 15,
  },

  cancelShadow: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: -5,
    top: 0,
    borderRadius: 15,
    backgroundColor: "#1ecc1ecc",
    zIndex: -1,
  },

  cancelLabel: {
    color: "#fff",
    fontSize: 15,
    textTransform: "uppercase",
    letterSpacing: 1,
    fontWeight: 800,
  },

  confirm: {
    paddingVertical: 10,
    alignItems: "center",
  },

  confirmLabel: {
    color: "#3337",
    fontSize: 13,
    textTransform: "uppercase",
    letterSpacing: 1,
    fontWeight: 800,
  },
});
