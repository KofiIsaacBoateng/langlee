import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { Audio } from "expo-av";
import React, { useEffect, useState } from "react";
import { Dimensions, StyleSheet, Text, View } from "react-native";
import Animated, {
  BounceIn,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withTiming,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Confetti from "react-native-simple-confetti";
import { scheduleOnRN } from "react-native-worklets";
import Button from "../buttons/Button";
import { LessonStats } from "./LessonContent";

const sadCat = require("@/assets/images/sad-cat.png");
const happyCat = require("@/assets/images/happy-cat.png");
const lessonCompleteSound = require("@/assets/audios/complete.mp3");

const { height, width } = Dimensions.get("window");
const AnimatedText = Animated.createAnimatedComponent(Text);
const LessonCompleteScreen = ({
  onContinue,
  lessonStats,
}: {
  onContinue: () => Promise<void>;
  lessonStats: LessonStats;
}) => {
  const insets = useSafeAreaInsets();
  const kittyYPosition = useSharedValue(height);
  const kittyScale = useSharedValue(1.2);
  const [showData, setShowData] = useState(false);

  let sound: Audio.Sound;

  const playSound = async () => {
    sound = new Audio.Sound();
    await sound.loadAsync(lessonCompleteSound);
    await sound.playAsync();
  };

  useEffect(() => {
    // play sound with confetti
    playSound();

    // animate kitty in
    kittyYPosition.value = withDelay(500, withTiming(0, { duration: 500 }));
    kittyScale.value = withDelay(
      1000,
      withTiming(1, { duration: 500 }, () => {
        scheduleOnRN(setShowData, true);
      }),
    );
    return () => {
      sound.unloadAsync();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const kittyAnimatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateY: kittyYPosition.value },
      { scale: kittyScale.value },
    ],
  }));

  return (
    <View
      style={[
        styles.container,
        { paddingTop: insets.top + 10, paddingBottom: insets.bottom + 10 },
      ]}
    >
      {/**** IMAGE */}
      <Animated.Image
        source={lessonStats.accuracy >= 60 ? happyCat : sadCat}
        style={[styles.image, kittyAnimatedStyle]}
      />

      {/*** confetti */}
      {lessonStats.accuracy >= 60 && (
        <View style={styles.confetti}>
          <Confetti type="tumble" fromCenter count={70} />
        </View>
      )}
      {/**** display text */}
      <AnimatedText style={[styles.displayText, kittyAnimatedStyle]}>
        Lesson complete!
      </AnimatedText>
      {/***** stats */}
      {showData && (
        <View style={styles.stats}>
          <Animated.View
            entering={BounceIn.springify(500).delay(2000)}
            style={[styles.stat, { backgroundColor: "orange" }]}
          >
            <Text style={[styles.statTitle]}>Answered</Text>
            <View style={styles.statData}>
              <Ionicons name="flash" color="orange" size={20} />
              <Text style={[styles.statDataText, { color: "orange" }]}>
                {lessonStats.correctAnswers} / {lessonStats.totalQuestions}
              </Text>
            </View>
          </Animated.View>

          <Animated.View
            entering={BounceIn.springify(500).delay(2800)}
            style={[styles.stat, { backgroundColor: "limegreen" }]}
          >
            <Text style={[styles.statTitle]}>Accuracy</Text>
            <View style={styles.statData}>
              <MaterialCommunityIcons
                name="bullseye-arrow"
                size={20}
                color="limegreen"
              />
              <Text style={[styles.statDataText, { color: "limegreen" }]}>
                {Math.ceil(lessonStats.accuracy)}
              </Text>
            </View>
          </Animated.View>

          <Animated.View
            entering={BounceIn.springify(500).delay(3600)}
            style={[styles.stat]}
          >
            <Text style={[styles.statTitle]}>Mistakes</Text>
            <View style={styles.statData}>
              <Ionicons name="close" color="#a10b0b" size={27} />
              <Text style={[styles.statDataText]}>
                {lessonStats.totalQuestions - lessonStats.correctAnswers}
              </Text>
            </View>
          </Animated.View>
        </View>
      )}

      {/**** ctx */}
      {showData && (
        <Animated.View entering={BounceIn} style={styles.ctx}>
          <Button
            label="Keep going"
            onPress={onContinue}
            labelColor={"#fffe"}
            shadowColor={"#058fb9cc"}
            backgroundColor={"deepskyblue"}
          />
        </Animated.View>
      )}
    </View>
  );
};

export default LessonCompleteScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 20,
    alignItems: "center",
  },

  image: {
    height: height * 0.35,
    aspectRatio: 1 / 1,
    marginHorizontal: "auto",
    marginVertical: 25,
  },

  displayText: {
    fontSize: 35,
    color: "orange",
    marginBottom: 50,
    fontWeight: "600",
  },

  stats: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 10,
  },

  stat: {
    flex: 1,
    maxWidth: width * 0.3,
    padding: 3,
    borderRadius: 15,
    backgroundColor: "#a10b0b",
    alignItems: "center",
    gap: 5,
    minHeight: 90,
  },
  statTitle: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 14,
  },
  statData: {
    backgroundColor: "#fff",
    width: "100%",
    flex: 1,
    paddingHorizontal: 10,
    paddingVertical: 15,
    borderRadius: 15,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 3,
  },
  statDataText: {
    fontSize: 20,
    fontWeight: 700,
    fontFamily: "Inter",
    color: "#a10b0b",
  },
  ctx: {
    marginTop: "auto",
    width: "100%",
    position: "relative",
  },

  confetti: {
    position: "absolute",
    inset: 0,
  },
});
