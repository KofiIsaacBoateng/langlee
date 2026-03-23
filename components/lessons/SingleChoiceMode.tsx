import { SpeakingOption } from "@/constants/CourseData";
import React, { useState } from "react";
import {
  Animated,
  Dimensions,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";

const { height } = Dimensions.get("window");
const SingleChoiceMode = ({
  option,
  optionFadeInAnim,
}: {
  option: SpeakingOption;
  optionFadeInAnim: Animated.Value;
}) => {
  const [showAnswer, setShowAnswer] = useState(false);
  const [isPressedIn, setIsPressedIn] = useState(false);

  const handleOptionPressed = () => {
    setShowAnswer((prev) => !prev);
  };

  return (
    <Animated.View
      style={[
        styles.container,
        {
          height: height * 0.5,

          transform: [
            {
              translateY: optionFadeInAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [height, 40],
              }),
            },
          ],
          opacity: optionFadeInAnim,
        },
      ]}
    >
      <Text style={styles.title}>Record this response in mandarin</Text>
      <Pressable
        onPress={handleOptionPressed}
        onPressIn={() => setIsPressedIn(true)}
        onPressOut={() => setIsPressedIn(false)}
      >
        <View
          style={[
            styles.button,
            {
              borderColor: isPressedIn ? "transparent" : "#3062cecc",
              borderRadius: 17,
            },
          ]}
        >
          {!isPressedIn && <View style={[styles.shadow]} />}
          <View style={[styles.overlay]} />
          {/**** content */}
          <Text style={styles.label}>{option.english}</Text>
          {!showAnswer ? (
            <Text style={styles.mandarinText}>
              Tap hear to reveal how to say it.
            </Text>
          ) : (
            <View style={styles.mandarin}>
              <Text style={[styles.mandarinText, styles.pinyin]}>
                {option.mandarin.pinyin}
              </Text>
              <Text style={[styles.mandarinText, styles.hanzi]}>
                {option.mandarin.hanzi}
              </Text>
            </View>
          )}
        </View>
      </Pressable>
    </Animated.View>
  );
};

export default SingleChoiceMode;

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 30,
    gap: 15,
    justifyContent: "center",
  },

  title: {
    fontSize: 18,
    fontFamily: "Inter",
    fontWeight: 700,
    color: "#3062ceaa",
    textAlign: "center",
  },

  button: {
    paddingVertical: 20,
    alignItems: "center",
    justifyContent: "center",
    borderLeftWidth: 2,
    borderRightWidth: 2,
    borderTopWidth: 2,
    backgroundColor: "#fff",
  },

  shadow: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: -5,
    borderRadius: 17,
    zIndex: -1,
    backgroundColor: "#3062cecc",
  },
  overlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: 17,
    zIndex: 1,
    backgroundColor: "#3062ce33",
  },
  label: {
    fontSize: 20,
    fontFamily: "Inter",
    color: "#3062cedd",
    zIndex: 5,
    marginBottom: 20,
  },

  mandarin: {
    gap: 5,
  },

  mandarinText: {
    fontWeight: "700",
    color: "#3337",
    fontSize: 16,
    textAlign: "center",
  },

  pinyin: {
    letterSpacing: 1,
    color: "#333c",
    fontSize: 20,
  },

  hanzi: {
    fontSize: 16,
    color: "#333a",
  },
});
