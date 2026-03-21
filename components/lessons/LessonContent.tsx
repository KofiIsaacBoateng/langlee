import { Question } from "@/constants/CourseData";
import { recordQuestionListened } from "@/lib/voiceStats";
import { Audio } from "expo-av";
import { router } from "expo-router";
import * as Speech from "expo-speech";
import React, { useMemo, useRef, useState } from "react";
import { Animated, Dimensions, StyleSheet, Text, View } from "react-native";
import ConfirmDialog from "../ui/ConfirmDialog";
import AudioPrompt from "./AudioPrompt";
import MultipleChoiceMode from "./MultipleChoiceMode";
import ProgressBarHeader from "./ProgressBarHeader";

const { width, height } = Dimensions.get("window");
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
  const audFlexAnim = useRef(new Animated.Value(0)).current;
  const audBorderRadiusAnim = useRef(new Animated.Value(0)).current;
  const audPaddingAnim = useRef(new Animated.Value(0)).current;
  const textOpacityAnim = useRef(new Animated.Value(0)).current;
  const textTranslateXAnim = useRef(new Animated.Value(50)).current;
  const audTranslateXAnim = useRef(new Animated.Value(0)).current;
  const optionFadeInAnim = useRef(new Animated.Value(0)).current;

  const progress = ((currentQuestionIndex + 1) / questions.length) * 80 + 20;

  const finishListening = () => {
    if (!hasStartedFirstPlay) {
      setTimeout(() => {
        setHasStartedFirstPlay(true);
      }, 800);
      Animated.parallel([
        Animated.timing(audFlexAnim, {
          toValue: 1,
          duration: 500,
          delay: 500,
          useNativeDriver: false,
        }),
        Animated.timing(audPaddingAnim, {
          toValue: 1,
          duration: 500,
          delay: 500,
          useNativeDriver: false,
        }),
        Animated.timing(audBorderRadiusAnim, {
          toValue: 1,
          duration: 500,
          delay: 500,
          useNativeDriver: false,
        }),
        Animated.timing(textOpacityAnim, {
          toValue: 1,
          duration: 800,
          delay: 800,
          useNativeDriver: true,
        }),
        Animated.timing(textTranslateXAnim, {
          toValue: 60,
          duration: 800,
          delay: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(audTranslateXAnim, {
          toValue: -80,
          duration: 1000,
          delay: 800,
          useNativeDriver: true,
        }),
        Animated.timing(optionFadeInAnim, {
          toValue: 1,
          duration: 500,
          delay: 500,
          useNativeDriver: true,
        }),
      ]).start();
    }

    setIsSpeechPlaying(false);
    void recordQuestionListened();
  };

  const playAudio = async () => {
    const textToSpeak =
      currentQuestion.mandarin.hanzi || currentQuestion.mandarin.pinyin;

    setIsSpeechPlaying(true);
    Speech.speak(textToSpeak, {
      language: "zh-CN",
      rate: 0.7,
      pitch: 0.5,
      voice: Speech.VoiceQuality.Enhanced,
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

  const handleOptionPressed = (optionId: number) => {
    setSelectedOption((prev) => (prev === optionId ? null : optionId));
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

      {/*** main content - audio */}
      <Animated.View
        style={[
          styles.audioSection,
          {
            flex: audFlexAnim.interpolate({
              inputRange: [0, 1],
              outputRange: [1, 0.3],
            }),
            marginHorizontal: audPaddingAnim.interpolate({
              inputRange: [0, 1],
              outputRange: [0, 20],
            }),
            paddingHorizontal: audPaddingAnim.interpolate({
              inputRange: [0, 1],
              outputRange: [0, 20],
            }),
            marginTop: audPaddingAnim.interpolate({
              inputRange: [0, 1],
              outputRange: [0, 20],
            }),
            borderRadius: audBorderRadiusAnim.interpolate({
              inputRange: [0, 1],
              outputRange: [0, 20],
            }),
          },
        ]}
        pointerEvents={isLoading || showResults ? "none" : "auto"}
      >
        <AudioPrompt
          isPlaying={isSpeechPlaying}
          isRecognizing={isRecognizing}
          hasBeenPlayed={hasStartedFirstPlay}
          audTranslateXAnim={audTranslateXAnim}
          onPlay={playAudio}
          onStopRecord={() => {}}
          onStartRecord={() => {}}
          onRevealMandarin={handleRevealMandarin}
          currentQuestion={currentQuestion}
          showMandarin={showMandarin}
          selectedOption={selectedOption}
        />
        <Animated.View
          style={[
            styles.text,
            {
              maxWidth: hasStartedFirstPlay ? width * 0.55 - 20 : 0,
              transform: [{ translateX: textTranslateXAnim }],
              opacity: textOpacityAnim,
            },
          ]}
        >
          <Text style={[styles.textText, { fontWeight: 900, fontSize: 22 }]}>
            {currentQuestion.mandarin.hanzi}
          </Text>
          <Text style={[styles.textText, { fontWeight: 600 }]}>
            {currentQuestion.mandarin.pinyin}
          </Text>
        </Animated.View>
      </Animated.View>

      {/**** main content - options */}
      <MultipleChoiceMode
        options={currentQuestion.options}
        selectedOption={selectedOption}
        showResult={showResults}
        audFlexAnim={audFlexAnim}
        handleOptionPressed={handleOptionPressed}
      />
    </View>
  );
};

export default LessonContent;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  audioSection: {
    minHeight: 200,
    flexDirection: "row",
    minWidth: width * 0.9,
    gap: 20,
    backgroundColor: "#f9fafb",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },

  text: {
    gap: 5,
    position: "absolute",
    zIndex: -1,
  },

  textText: {
    fontSize: 18,
    color: "#000c",
    fontFamily: "Inter",
    letterSpacing: 0.5,
  },
});
