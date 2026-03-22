import { Question } from "@/constants/CourseData";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import React, { useState } from "react";
import { Animated, Pressable, StyleSheet } from "react-native";

const AudioPrompt = ({
  isPlaying,
  isRecognizing,
  onPlay,
  onStopRecord,
  onStartRecord,
  onRevealMandarin,
  currentQuestion,
  showMandarin,
  selectedOption,
  audTranslateXAnim,
  hasBeenPlayed,
}: {
  isPlaying: boolean;
  isRecognizing: boolean;
  hasBeenPlayed: boolean;
  onPlay: () => void;
  onStopRecord: () => void;
  onStartRecord: () => void;
  onRevealMandarin: () => void;
  currentQuestion: Question;
  showMandarin: boolean;
  selectedOption: number | null;
  audTranslateXAnim: Animated.Value;
}) => {
  const [pressedIn, setPressedIn] = useState(false);

  return (
    <Pressable
      disabled={isPlaying}
      onPress={
        hasBeenPlayed && currentQuestion.type === "single_response"
          ? () => requestAnimationFrame(onStartRecord)
          : () => requestAnimationFrame(onPlay)
      }
      onPressIn={() => {
        setPressedIn(true);
      }}
      onPressOut={() => {
        setPressedIn(false);
      }}
      hitSlop={20}
    >
      <Animated.View
        style={[
          styles.playButton,
          {
            transform: [{ translateX: audTranslateXAnim }],
          },
        ]}
      >
        {!pressedIn && <Animated.View style={[styles.shadow]} />}
        {isPlaying || isRecognizing ? (
          <MaterialIcons name="graphic-eq" size={36} color="#fffd" />
        ) : hasBeenPlayed && currentQuestion.type === "single_response" ? (
          <Ionicons name="mic" size={36} color="#fffd" />
        ) : (
          <Ionicons
            style={{ zIndex: 10 }}
            name="play"
            size={50}
            color="#fffd"
          />
        )}
      </Animated.View>
    </Pressable>
  );
};

export default AudioPrompt;

const styles = StyleSheet.create({
  playButton: {
    zIndex: 50,
    position: "relative",
    width: 80,
    height: 80,
    backgroundColor: "#3062ce",
    borderRadius: 17,
    alignItems: "center",
    justifyContent: "center",
  },

  shadow: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: -7,
    backgroundColor: "#3062cecc",
    borderRadius: 17,
    zIndex: -2,
  },
});
