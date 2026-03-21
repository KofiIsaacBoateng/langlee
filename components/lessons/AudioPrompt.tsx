import { Question } from "@/constants/CourseData";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import React from "react";
import {
  Animated,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";

const AudioPrompt = ({
  isPlaying,
  isRecognizing,
  hasListenedToAudio,
  onPlay,
  onStopRecord,
  onStartRecord,
  onRevealMandarin,
  currentQuestion,
  showMandarin,
  selectedOption,
  scaleAnime,
  instructionOpacity,
  listeningOpacity,
  listeningScale,
  fadeAnime,
}: {
  isPlaying: boolean;
  isRecognizing: boolean;
  hasListenedToAudio: boolean;
  onPlay: () => void;
  onStopRecord: () => void;
  onStartRecord: () => void;
  onRevealMandarin: () => void;
  currentQuestion: Question;
  showMandarin: boolean;
  selectedOption: number | null;
  scaleAnime: Animated.Value;
  instructionOpacity: Animated.Value;
  listeningOpacity: Animated.Value;
  listeningScale: Animated.Value;
  fadeAnime: Animated.Value;
}) => {
  const playbackDisabled = !selectedOption && (isPlaying || hasListenedToAudio);

  return (
    <>
      <Pressable
        disabled={playbackDisabled}
        onPress={
          selectedOption
            ? isRecognizing
              ? onStopRecord
              : () => requestAnimationFrame(onStartRecord)
            : playbackDisabled
              ? undefined
              : () => requestAnimationFrame(onPlay)
        }
        onPressIn={() => {
          if (playbackDisabled) return;
          Animated.spring(scaleAnime, {
            toValue: 0.9,
            useNativeDriver: true,
          }).start();
        }}
        onPressOut={() => {
          if (playbackDisabled) {
            return;
          }

          Animated.spring(scaleAnime, {
            toValue: 1,
            useNativeDriver: true,
          }).start();
        }}
      >
        <Animated.View
          style={[
            styles.playButton,
            {
              backgroundColor: selectedOption
                ? isRecognizing
                  ? "#ef4444"
                  : "#8a1147"
                : playbackDisabled
                  ? "#ff8c66"
                  : "#8a1147",
              transform: [{ scale: scaleAnime }],
            },
          ]}
        >
          {selectedOption ? (
            isRecognizing ? (
              <MaterialIcons name="stop" size={45} color="#fff" />
            ) : (
              <Ionicons name="mic" color="#fff" size={36} />
            )
          ) : isPlaying ? (
            <MaterialIcons name="graphic-eq" size={36} color="#fff" />
          ) : (
            <Ionicons name="play" size={45} color="#fff" />
          )}

          {
            selectedOption && isRecognizing ? (
              <View style={styles.recordingStatus}>
                <View style={styles.recordingIndicatorLarge}>
                  <View style={styles.recordingDotLarge}></View>
                </View>
                <Text style={styles.recordingText}>Recording...</Text>
              </View>
            ) : null
            // <AudioWaveform isPlaying={isPlaying} />
          }
        </Animated.View>
      </Pressable>
    </>
  );
};

export default AudioPrompt;

const styles = StyleSheet.create({
  playButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#8a1147",
    justifyContent: "center",
    alignItems: "center",
    marginVertical: 10,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.25,
        shadowRadius: 8,
      },
    }),
  },
  mandarinText: {
    alignItems: "center",
    padding: 16,
    borderRadius: 12,
  },
  pinyin: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 8,
  },
  hanzi: {
    fontSize: 18,
  },
  revealButton: {
    marginBottom: 8,
    marginTop: 16,
    alignItems: "center",
  },
  revealButtonText: {
    fontSize: 16,
    color: "#333a",
    marginBottom: 4,
  },
  recordingStatus: {
    alignItems: "center",
    marginVertical: 16,
  },
  recordingIndicatorLarge: {
    marginBottom: 8,
  },
  recordingDotLarge: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: "#ef4444",
  },
  recordingText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#ef4444",
  },
  promptTextContainer: {
    alignItems: "center",
  },
  recordingPromptTop: {
    alignItems: "center",
    padding: 12,
  },
  recordingPromptText: {
    fontSize: 16,
    color: "#333a",
    textAlign: "center",
  },
  listeningPrompt: {
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
    minHeight: 60,
  },
  instructionContainer: {
    alignItems: "center",
  },
  listeningContainer: {
    position: "absolute",
    alignItems: "center",
    justifyContent: "center",
  },
  instructionText: {
    fontSize: 16,
    textAlign: "center",
    color: "#333a",
  },
  instructionHint: {
    fontSize: 14,
    textAlign: "center",
    color: "#9ca3af",
  },
});
