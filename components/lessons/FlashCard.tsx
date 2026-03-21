import { Word } from "@/constants/CourseData";
import React, { useRef, useState } from "react";
import {
  Animated,
  Dimensions,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";

const { width } = Dimensions.get("window");
const FlashCard = ({
  word,
  direction,
}: {
  word: Word;
  direction: "en-zh" | "zh-en";
}) => {
  const [isFlipped, setIsFlipped] = useState<boolean>(false);
  const flipAnimation = useRef(new Animated.Value(0)).current;

  const frontInterpolate = flipAnimation.interpolate({
    inputRange: [0, 180],
    outputRange: ["0deg", "180deg"],
  });

  const backInterpolate = flipAnimation.interpolate({
    inputRange: [0, 180],
    outputRange: ["180deg", "0deg"],
  });

  const frontFlipAnimatedStyle = {
    transform: [{ rotateY: frontInterpolate }],
  };

  const backFlipAnimatedStyle = {
    transform: [{ rotateY: backInterpolate }],
  };

  const flipToFront = () => {
    Animated.timing(flipAnimation, {
      toValue: 0,
      duration: 250,
      useNativeDriver: true,
    }).start();
    setIsFlipped(false);
  };

  const flipToBack = () => {
    Animated.timing(flipAnimation, {
      toValue: 180,
      duration: 250,
      useNativeDriver: true,
    }).start();
    setIsFlipped(true);
  };

  const FrontContent = () =>
    direction === "en-zh" ? (
      <Text style={[styles.text, styles.front, styles.english]}>
        {word.english}
      </Text>
    ) : (
      <View style={styles.mandarin}>
        <Text style={[styles.text, styles.front, styles.pinyin]}>
          {word.pinyin}
        </Text>
        <Text style={[styles.text, styles.front, styles.hanzi]}>
          {word.hanzi}
        </Text>
      </View>
    );

  const BackContent = () =>
    direction === "zh-en" ? (
      <Text style={[styles.text, styles.back, styles.english]}>
        {word.english}
      </Text>
    ) : (
      <View style={styles.mandarin}>
        <Text style={[styles.text, styles.back, styles.pinyin]}>
          {word.pinyin}
        </Text>
        <Text style={[styles.text, styles.back, styles.hanzi]}>
          {word.hanzi}
        </Text>
      </View>
    );

  return (
    <Pressable onPress={isFlipped ? flipToFront : flipToBack}>
      <View>
        <Animated.View
          style={[styles.card, styles.frontCard, frontFlipAnimatedStyle]}
        >
          <FrontContent />
        </Animated.View>
        <Animated.View
          style={[styles.card, styles.backCard, backFlipAnimatedStyle]}
        >
          <BackContent />
        </Animated.View>
      </View>
    </Pressable>
  );
};

export default FlashCard;

const styles = StyleSheet.create({
  card: {
    width: width * 0.75,
    aspectRatio: 1 / 1.4,
    backgroundColor: "#fff",
    borderRadius: 28,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 12,
    elevation: 5,
    paddingHorizontal: 15,
    alignItems: "center",
    justifyContent: "center",
    backfaceVisibility: "hidden",
  },
  frontCard: {},
  backCard: {
    backgroundColor: "#141350",
    position: "absolute",
  },

  text: {
    fontSize: 35,
    fontFamily: "Inter",
    fontWeight: 700,
    letterSpacing: 1,
    textAlign: "center",
  },

  front: {
    color: "#000c",
  },

  back: {
    color: "#fffe",
    fontStyle: "italic",
  },

  mandarin: {
    alignItems: "center",
    gap: 15,
  },

  hanzi: {
    fontSize: 30,
    fontWeight: "bold",
  },

  pinyin: {
    fontWeight: "bold",
  },

  english: {},
});
