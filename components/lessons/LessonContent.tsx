import { Question, SpeakingOption } from "@/constants/CourseData";
import {
  incrementLessonCompletion,
  setCurrentLesson,
} from "@/lib/progressStats";
import {
  recordQuestionAnswered,
  recordQuestionListened,
} from "@/lib/voiceStats";
import { Audio, InterruptionModeIOS } from "expo-av";
import { router } from "expo-router";
import * as Speech from "expo-speech";
import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  Dimensions,
  Animated as RNAnimated,
  StyleSheet,
  Text,
  View,
} from "react-native";
import Animated, { FadeIn } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { toast } from "sonner-native";
import strc from "string-comparison";
import ConfirmDialog from "../ui/ConfirmDialog";
import AudioPrompt from "./AudioPrompt";
import AudioWaveForm from "./AudioWaveform";
import Feedback from "./Feedback";
import LessonCompleteScreen from "./LessonCompleteScreen";
import MultipleChoiceMode from "./MultipleChoiceMode";
import ProgressBarHeader from "./ProgressBarHeader";
import SingleChoiceMode from "./SingleChoiceMode";

const { width, height } = Dimensions.get("window");
// interface WrongQuestions {
//   english: string;
//   mandarin: {
//     pinyin: string;
//     hanzi: string;
//   };
//   attempts: number;
// }

export interface LessonStats {
  correctAnswers: number;
  totalQuestions: number;
  accuracy: number;
  // wrongQuestions: WrongQuestions[];
}

const LessonContent = ({
  questions,
  lessonId,
}: {
  questions: Question[];
  lessonId: string;
}) => {
  const insets = useSafeAreaInsets();
  const [showExitModal, setShowExitModal] = useState(false);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [showMandarin, setShowMandarin] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [attemptCount, setAttemptCount] = useState(0);
  const [isRecognizing, setIsRecognizing] = useState(false);
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
  const fadeAnim = useRef(new RNAnimated.Value(0)).current; // Opacity pinyin/hanzi
  const shrinkAudSection = useRef(new RNAnimated.Value(height * 0.8)).current;
  const textOpacityAnim = useRef(new RNAnimated.Value(0)).current;
  const textTranslateXAnim = useRef(new RNAnimated.Value(50)).current;
  const audTranslateXAnim = useRef(new RNAnimated.Value(0)).current;
  const optionFadeInAnim = useRef(new RNAnimated.Value(0)).current;

  const selectedSentence = useMemo((): SpeakingOption | null => {
    if (currentQuestion.type === "listening_mc") {
      if (showResults) {
        const correctEnglish =
          currentQuestion.options.find(
            (opt) => opt.id === currentQuestion.correctOptionId,
          )?.english || "";

        return {
          id: currentQuestion.id,
          english: correctEnglish,
          mandarin: { ...currentQuestion.mandarin },
        };
      }

      return null;
    }

    if (!selectedOption) return null;

    return currentQuestion.options.find((opt) => opt.id === selectedOption)!;
  }, [currentQuestion, showResults, selectedOption]);

  useEffect(() => {
    return () => {
      Speech.stop();
      if (recordingRef.current) {
        recordingRef.current.stopAndUnloadAsync();
      }
    };
  }, []);

  useEffect(() => {
    Speech.stop();
    setIsSpeechPlaying(false);
  }, [currentQuestion]);

  useEffect(() => {
    if (showResults) {
      if (isCorrect) {
        if (
          attemptCount === 0 ||
          (attemptCount > 0 && wrongQuestions.has(currentQuestion.id))
        ) {
          setCorrectAnswerCount((prev) => prev + 1);
        } else {
          setQuestionAttempts((prev) => ({
            ...prev,
            [currentQuestion.id]: (prev[currentQuestion.id] || 0) + 1,
          }));

          if (attemptCount === 0) {
            setWrongQuestions((prev) => new Set(prev).add(currentQuestion.id));
          }
        }
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showResults, isCorrect, attemptCount, currentQuestion]);

  const progress = ((currentQuestionIndex + 1) / questions.length) * 80 + 20;

  const finishListening = () => {
    if (!hasStartedFirstPlay) {
      setTimeout(() => {
        setHasStartedFirstPlay(true);
      }, 800);
      RNAnimated.parallel([
        RNAnimated.timing(shrinkAudSection, {
          toValue: 200,
          duration: 500,
          delay: 500,
          useNativeDriver: false,
        }),
        RNAnimated.timing(textOpacityAnim, {
          toValue: 1,
          duration: 800,
          delay: 800,
          useNativeDriver: true,
        }),
        RNAnimated.timing(textTranslateXAnim, {
          toValue: 60,
          duration: 800,
          delay: 1000,
          useNativeDriver: true,
        }),
        RNAnimated.timing(audTranslateXAnim, {
          toValue: currentQuestion.type === "single_response" ? 0 : -80,
          duration: 1000,
          delay: 800,
          useNativeDriver: true,
        }),
        RNAnimated.timing(optionFadeInAnim, {
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

  const startRecording = async () => {
    if (isSpeechPlaying) {
      Speech.stop();
      setIsSpeechPlaying(false);
    }

    try {
      // ask for microphone permision
      const permission = await Audio.requestPermissionsAsync();
      if (!permission.granted) {
        toast.error("Microphone Permission", {
          description: "Microphone access is required to practice speaking!",
        });
        return;
      }

      // audio mode settings
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
        interruptionModeIOS: InterruptionModeIOS.DoNotMix,
        staysActiveInBackground: true,
      });

      // audio presets
      const presets = Audio.RecordingOptionsPresets.HIGH_QUALITY;

      const { recording } = await Audio.Recording.createAsync({
        ...presets,
        ios: {
          ...presets.ios,
          extension: ".wav",
          audioQuality: Audio.IOSAudioQuality.MAX,
          outputFormat: Audio.IOSOutputFormat.LINEARPCM,
        },
        android: {
          ...presets.android,
          extension: ".wav",
          outputFormat: Audio.AndroidOutputFormat.DEFAULT,
          audioEncoder: Audio.AndroidAudioEncoder.DEFAULT,
        },
      });

      recordingRef.current = recording;
      setIsRecognizing(true);
      console.log("Start recording: ", isRecognizing);
    } catch (error) {
      console.error("Error while recording audio: ", error);
      toast.error(
        "Unable to start audio recording right now. Please try again!",
      );
      recordingRef.current = null;
      setIsRecognizing(false);
    }
  };

  const stopRecording = async () => {
    setIsRecognizing(false);
    console.log("Stopped recording: ", isRecognizing);
    setIsLoading(true);

    try {
      const recording = recordingRef.current;

      if (!recording) {
        setIsLoading(false);
        toast.error("Recording failed!");
        return;
      }

      await recording.stopAndUnloadAsync();
      const uri = recording.getURI();
      recordingRef.current = null;

      if (!uri) {
        setIsLoading(false);
        toast.error("No recording found!");
        return;
      }

      // const audioFile = new FileSystem.File(uri);
      // const base64Audio = await audioFile.base64();

      /***** commented out because no credit card available to access Openrouters API on Edge Function*/
      // const { data, error } = await supabase.functions.invoke(
      //   "transcribe-audio",
      //   {
      //     body: {
      //       inputAudio: {
      //         data: base64Audio,
      //         format: "wav",
      //       },
      //     },
      //   },
      // );

      // if (error) {
      //   throw error;
      // }

      // if (data?.transcript) {
      //   // process speech results
      //   console.log(
      //     "Got transcript data: ",
      //     data.transcript,
      //     "[ ",
      //     "Processing results ]",
      //   );
      //   processSpeechResults(data.transcript);
      // } else {
      //   throw new Error("No transcript returned!");
      // }
      setTimeout(() => {
        processSpeechResults(currentQuestion.mandarin.pinyin);
      }, 3000);
    } catch (error) {
      console.log("Failed to start/stop recording: ", error);
      setIsLoading(false);
      toast.error("Transcript error", {
        description: "Could not transcribe audio.",
      });
    }
  };

  const processSpeechResults = async (transcript: string) => {
    setIsLoading(false);
    setShowResults(true);

    const punctuationRegex = /[.,\/#!$%\^&\*;:{}=\-_`~()?]/g;

    const rawExpected = selectedSentence?.mandarin.pinyin || "";
    const expected = rawExpected
      .toLocaleLowerCase()
      .replace(punctuationRegex, "")
      .replace(/\s+/g, "")
      .trim();
    const said = transcript
      .toLocaleLowerCase()
      .replace(punctuationRegex, "")
      .replace(/\s+/g, "")
      .trim();

    setTransciption({ expected: rawExpected, said: transcript });

    if (!said || !expected) {
      setIsCorrect(false);
      console.log("Wrong!");
    } else {
      const similarity = strc.lcs.similarity(expected, said);
      const isSimilarEnough = similarity >= 0.8;

      setIsCorrect(isSimilarEnough);
      if (isSimilarEnough) {
        console.log("Correct!");
        void recordQuestionAnswered();
      }
    }

    console.log("Speech results processing complete!");
  };

  const handleOptionPressed = (optionId: number) => {
    setSelectedOption((prev) => (prev === optionId ? null : optionId));

    if (currentQuestion.type !== "single_response") {
      setShowResults(true);
      setIsCorrect(currentQuestion?.correctOptionId === optionId);
    }
  };

  const handleRevealMandarin = () => {
    if (showMandarin) {
      RNAnimated.timing(fadeAnim, {
        toValue: 0,
        duration: 250,
        useNativeDriver: true,
      }).start(() => setShowMandarin(false));
    } else {
      RNAnimated.timing(fadeAnim, {
        toValue: 1,
        duration: 250,
        useNativeDriver: true,
      }).start();
    }
  };

  const onClose = (value: boolean) => {
    setShowExitModal(value);
  };

  useEffect(() => {
    if (
      hasStartedFirstPlay &&
      currentQuestion.type === "single_response" &&
      currentQuestion.options.length > 0
    ) {
      setSelectedOption(currentQuestion.options[0].id);
    }
  }, [currentQuestion, hasStartedFirstPlay]);

  const resetQuestion = () => {
    setShowMandarin(false);
    setShowResults(false);
    setSelectedOption(null);
    setHasStartedFirstPlay(false);
    setIsLoading(false);
    Speech.stop();
    setIsSpeechPlaying(false);
    setTransciption(null);

    fadeAnim.setValue(0);
    shrinkAudSection.setValue(height * 0.8);
    textOpacityAnim.setValue(0);
    textTranslateXAnim.setValue(50);
    audTranslateXAnim.setValue(0);
    optionFadeInAnim.setValue(0);
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      // reset for next question
      resetQuestion();
      // update current question
      setCurrentQuestionIndex((prev) => prev + 1);
    } else {
      const accuracy = Math.round(
        (correctAnswerCount / questions.length) * 100,
      );

      setLessonStats({
        accuracy,
        correctAnswers: correctAnswerCount,
        totalQuestions: questions.length,
      });
      setShowCompletion(true);
    }
  };

  if (showCompletion && lessonStats) {
    return (
      <LessonCompleteScreen
        onContinue={async () => {
          await incrementLessonCompletion(lessonId);
          const [chap, less] = lessonId.split("-");
          const newLess = (Number(less) + 1).toString();
          await setCurrentLesson([chap, newLess].join("-"));
          router.replace({ pathname: "/(tabs)/lessons" });
        }}
        lessonStats={lessonStats}
      />
    );
  }

  return (
    <View style={styles.container}>
      <ConfirmDialog
        visible={showExitModal}
        title="Are you sure about that?"
        description="All progress in this lesson will be lost."
        cancelLabel="keep going"
        confirmLabel="end session"
        onCancel={() => onClose(false)}
        onConfirm={async () => {
          onClose(false);
          Speech.stop();
          if (recordingRef.current) {
            await recordingRef.current.stopAndUnloadAsync();
          }
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
      <RNAnimated.View
        style={[
          styles.audioSection,
          {
            height: shrinkAudSection,
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
          onStartRecord={startRecording}
          onStopRecord={stopRecording}
          onRevealMandarin={handleRevealMandarin}
          currentQuestion={currentQuestion}
          showMandarin={showMandarin}
          selectedOption={selectedOption}
        />
        {currentQuestion.type === "single_response" ? null : (
          <RNAnimated.View
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
          </RNAnimated.View>
        )}
        <View
          style={[
            {
              display:
                currentQuestion.type === "single_response" ||
                !hasStartedFirstPlay
                  ? "flex"
                  : "none",
              marginTop: 20,
            },
          ]}
        >
          {hasStartedFirstPlay ? (
            currentQuestion.type === "single_response" && isRecognizing ? (
              <View style={{ alignItems: "center" }}>
                <AudioWaveForm isPlaying={isRecognizing} />
                <Text style={styles.textText}>Speak your response now.</Text>
              </View>
            ) : (
              <Text style={styles.textText}>Tap the microphone to record.</Text>
            )
          ) : (
            <Text style={styles.textText}>Tap to play.</Text>
          )}
        </View>
      </RNAnimated.View>

      {/**** main content - options */}
      {currentQuestion.type !== "single_response" && (
        <MultipleChoiceMode
          options={currentQuestion.options}
          selectedOption={selectedOption}
          showResult={showResults}
          optionFadeInAnim={optionFadeInAnim}
          handleOptionPressed={handleOptionPressed}
          isCorrect={isCorrect}
        />
      )}

      {currentQuestion.type === "single_response" && (
        <SingleChoiceMode
          option={currentQuestion.options[0]}
          optionFadeInAnim={optionFadeInAnim}
        />
      )}

      {/**** loading indicator */}
      {isLoading && (
        <View style={[styles.isLoading, { paddingBottom: insets.bottom + 20 }]}>
          <View style={styles.loading}>
            <ActivityIndicator size="large" color="#3062ce" />
            <Text style={styles.loadingText}>
              Analyzing your pronunciation...
            </Text>
          </View>
        </View>
      )}

      {/**** feedback */}
      {showResults && (
        <Animated.View entering={FadeIn} style={styles.isLoading}>
          <Feedback
            onContinue={handleNextQuestion}
            isCorrect={isCorrect}
            correctOption={selectedSentence}
            transcript={
              transcription
                ? { expected: transcription.expected, said: transcription.said }
                : undefined
            }
          />
        </Animated.View>
      )}
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
    minWidth: width * 0.9,
    gap: 10,
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

  isLoading: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "#fff5",
    zIndex: 30,
    justifyContent: "flex-end",
  },

  loading: {
    gap: 15,
    alignItems: "center",
  },
  loadingText: {
    fontSize: 18,
    fontFamily: "Inter",
    color: "#333c",
  },
});
