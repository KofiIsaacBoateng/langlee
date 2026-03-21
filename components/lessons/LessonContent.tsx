import { Question } from "@/constants/CourseData";
import { recordQuestionListened } from "@/lib/voiceStats";
import { Audio } from "expo-av";
import { router } from "expo-router";
import * as Speech from "expo-speech";
import React, { useMemo, useRef, useState } from "react";
import { Animated, StyleSheet, View } from "react-native";
import ConfirmDialog from "../ui/ConfirmDialog";
import AudioPrompt from "./AudioPrompt";
import ProgressBarHeader from "./ProgressBarHeader";

interface WrongQuestions {
  english: string;
  mandarin: {
    pinyin: string;
    hanzi: string;
  };
  attempts: number;
}

export interface LessonStats {
  correctAnswers: number;
  totalQuestions: number;
  accuracy: number;
  wrongQuestions: WrongQuestions[];
}

const LessonContent = ({
  questions,
  lessonId,
}: {
  questions: Question[];
  lessonId: string;
}) => {
  const [showExitModal, setShowExitModal] = useState(false);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [showMandarin, setShowMandarin] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [attemptCount, setAttemptCount] = useState(0);
  const [isRecognizing, setIsRecognizing] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const recordingRef = useRef<Audio.Recording | null>(null);
  const [transcription, setTransciption] = useState<{
    expected: string;
    said: string;
  } | null>(null);
  const currentQuestion = useMemo(
    () => questions[currentQuestionIndex],
    [currentQuestionIndex, questions],
  );
  const [isSpeechPlaying, setIsSpeechPlaying] = useState(false);
  const [hasStartedFirstPlay, setHasStartedFirstPlay] = useState(false);
  const [hasListened, setHasListened] = useState(false);

  // lesson complete screen
  const [showCompletion, setShowCompletion] = useState(false);
  const [lessonStats, setLessonStats] = useState<LessonStats | null>(null);
  const [questionAttempts, setQuestionAttempts] = useState<
    Record<number, number>
  >({});
  const [correctAnswerCount, setCorrectAnswerCount] = useState(0);
  const [wrongQuestions, setWrongQuestions] = useState<Set<number>>(new Set());

  // animation
  const fadeAnim = useRef(new Animated.Value(0)).current; // Opacity pinyin/hanzi
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const optionsAnimValue = useRef(new Animated.Value(0)).current;
  const audioSectionAnimHeight = useRef(new Animated.Value(400)).current;
  const optionSelectionAnim = useRef(new Animated.Value(0)).current;
  const instructionOpacity = useRef(new Animated.Value(1)).current;
  const listeningOpacity = useRef(new Animated.Value(0)).current;
  const listeningScale = useRef(new Animated.Value(0.95)).current;

  const progress = ((currentQuestionIndex + 1) / questions.length) * 80 + 20;

  const finishListening = () => {
    if (hasListened) return;

    setHasListened(true);
    setIsSpeechPlaying(false);
    void recordQuestionListened();
    Animated.parallel([
      Animated.timing(audioSectionAnimHeight, {
        toValue: 200,
        duration: 800,
        useNativeDriver: false,
      }),
      Animated.timing(optionSelectionAnim, {
        toValue: 1,
        duration: 800,
        delay: 500,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const playAudio = () => {
    const textToSpeak =
      currentQuestion.mandarin.hanzi || currentQuestion.mandarin.pinyin;

    if (isSpeechPlaying) {
      Speech.stop();
      setIsSpeechPlaying(false);
      return;
    }

    setIsSpeechPlaying(false);
    Speech.speak(textToSpeak, {
      language: "zh-CN",
      onDone: () => {
        finishListening();
      },

      onStopped: () => {
        finishListening();
      },
      onError: () => {
        finishListening();
      },
    });
  };

  const handleRevealMandarin = () => {
    if (showMandarin) {
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 250,
        useNativeDriver: true,
      }).start(() => setShowMandarin(false));
    } else {
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 250,
        useNativeDriver: true,
      }).start();
    }
  };

  const onClose = (value: boolean) => {
    setShowExitModal(value);
  };

  return (
    <View style={styles.container}>
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
      {/**** header */}
      <ProgressBarHeader
        progress={progress}
        currentCount={5}
        totalCount={15}
        onClose={() => onClose(true)}
      />

      {/*** main content */}
      <Animated.View
        style={[
          styles.audioSection,
          {
            backgroundColor: "#f9fafb",
            minHeight: audioSectionAnimHeight,
            flex: hasListened ? 0 : 1,
            justifyContent: "center",
            alignItems: "center",
            opacity: isLoading || showResults ? 0.6 : 1,
          },
        ]}
        pointerEvents={isLoading || showResults ? "none" : "auto"}
      >
        <AudioPrompt
          isPlaying={isSpeechPlaying}
          isRecognizing={isRecognizing}
          hasListenedToAudio={hasListened}
          onPlay={playAudio}
          onStopRecord={() => {}}
          onStartRecord={() => {}}
          onRevealMandarin={handleRevealMandarin}
          currentQuestion={currentQuestion}
          showMandarin={showMandarin}
          selectedOption={selectedOption}
          scaleAnime={scaleAnim}
          instructionOpacity={instructionOpacity}
          listeningOpacity={listeningOpacity}
          listeningScale={listeningScale}
          fadeAnime={fadeAnim}
        />
      </Animated.View>
    </View>
  );
};

export default LessonContent;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  audioSection: {},
});
