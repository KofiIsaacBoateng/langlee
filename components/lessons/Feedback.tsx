import { SpeakingOption } from "@/constants/CourseData";
import { Ionicons } from "@expo/vector-icons";
import { Audio, AVPlaybackSource } from "expo-av";
import React, { useEffect } from "react";
import { Dimensions, StyleSheet, Text, View } from "react-native";
import Animated, { BounceInDown, FadeInDown } from "react-native-reanimated";
import Button from "../buttons/Button";

interface Transcription {
  expected: string;
  said: string;
}

const correctAudio = require("@/assets/audios/correct.mp3");
const wrongAudio = require("@/assets/audios/incorrect.mp3");

const { height } = Dimensions.get("window");
const Feedback = ({
  isCorrect,
  correctOption,
  onContinue,
  transcript,
}: {
  isCorrect: boolean;
  correctOption: SpeakingOption | null;
  onContinue: () => void;
  transcript: Transcription | undefined;
}) => {
  let sound: Audio.Sound;
  const playSound = async (audio: AVPlaybackSource) => {
    sound = new Audio.Sound();
    await sound.loadAsync(audio);
    await sound.playAsync();
  };
  useEffect(() => {
    playSound(isCorrect ? correctAudio : wrongAudio);

    return () => {
      sound.unloadAsync();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <Animated.View
      entering={isCorrect ? BounceInDown : FadeInDown}
      style={[
        styles.container,
        { backgroundColor: isCorrect ? "#c9faad" : "#fa9999" },
      ]}
    >
      <View style={styles.header}>
        <Ionicons
          name={isCorrect ? "checkmark-circle" : "close-circle"}
          color={isCorrect ? "#0d5e0dcc" : "#7c0f0fcc"}
          size={28}
        />
        <Text
          style={[
            styles.remark,
            { color: isCorrect ? "#0d5e0dcc" : "#7c0f0fcc" },
          ]}
        >
          {isCorrect ? "Good Job!" : "Not quite!"}
        </Text>
      </View>

      {/**** results */}
      {transcript && (
        <View style={styles.results}>
          <View style={styles.resultsOptions}>
            <Text style={styles.resultsText}>Expected: </Text>
            <Text style={styles.answer}>{transcript?.expected}</Text>
          </View>
          <View style={styles.resultsOptions}>
            <Text style={styles.resultsText}>You said: </Text>
            <Text
              style={[
                styles.answer,
                { color: isCorrect ? "#2e682ecc" : "#7c0f0fcc" },
              ]}
            >
              {transcript?.said}
            </Text>
          </View>
        </View>
      )}

      {/**** call to action */}
      <View style={styles.footer}>
        <Animated.View
          entering={BounceInDown}
          animatedProps={{ animationDelay: 500, style: { flex: 1 } }}
        >
          <Button
            label="Continue"
            backgroundColor={isCorrect ? "#16b116" : "#a10b0b"}
            shadowColor={isCorrect ? "#16b116b3" : "#a10b0ba6"}
            onPress={onContinue}
            labelColor="#fffc"
          />
        </Animated.View>
      </View>
    </Animated.View>
  );
};

export default Feedback;

const styles = StyleSheet.create({
  container: {
    minHeight: height * 0.35,
    backgroundColor: "#c9faad",
    paddingHorizontal: 15,
    paddingVertical: 25,
    borderTopRightRadius: 15,
    borderTopLeftRadius: 15,
  },
  header: {
    flexDirection: "row",
    gap: 10,
    alignItems: "center",
    marginBottom: 20,
  },
  remark: {
    fontSize: 24,
    fontWeight: 600,
  },

  results: {
    gap: 10,
  },

  resultsOptions: {
    flexDirection: "row",
    gap: 5,
    alignItems: "center",
  },

  resultsText: {
    fontSize: 15,
    fontWeight: 500,
    fontFamily: "Inter",
    color: "#3338",
  },

  answer: {
    fontWeight: "bold",
    fontSize: 16,
    color: "#333c",
  },

  footer: {
    flex: 1,
    justifyContent: "flex-end",
  },
});
