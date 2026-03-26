import { SpeakingOption } from "@/constants/CourseData";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { Dimensions, StyleSheet, Text, View } from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";
import Button from "../buttons/Button";

interface Transcription {
  expected: string;
  said: string;
}

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
  return (
    <Animated.View
      entering={FadeInDown}
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
        <Button
          label="Continue"
          backgroundColor={isCorrect ? "#50ce08" : "#ad1616cc"}
          shadowColor={isCorrect ? "#0d5e0d" : "#752222"}
          onPress={onContinue}
          labelColor="#fffc"
        />
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
    marginTop: "auto",
  },
});
