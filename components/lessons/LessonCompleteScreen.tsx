import { Feather, Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import React from "react";
import { Dimensions, Image, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Button from "../buttons/Button";
import { LessonStats } from "./LessonContent";

const { height, width } = Dimensions.get("window");
const LessonCompleteScreen = ({
  onContinue,
  lessonStats,
}: {
  onContinue: () => Promise<void>;
  lessonStats: LessonStats;
}) => {
  const insets = useSafeAreaInsets();
  return (
    <View
      style={[
        styles.container,
        { paddingTop: insets.top + 10, paddingBottom: insets.bottom + 10 },
      ]}
    >
      {/**** IMAGE */}
      <Image
        source={require("@/assets/images/sad-kitty.png")}
        style={styles.image}
      />
      {/**** display text */}
      <Text style={styles.displayText}>Lesson complete!</Text>
      {/***** stats */}
      <View style={styles.stats}>
        <View style={[styles.stat, { backgroundColor: "orange" }]}>
          <Text style={[styles.statTitle]}>Answered</Text>
          <View style={styles.statData}>
            <Ionicons name="flash" color="orange" size={20} />
            <Text style={[styles.statDataText, { color: "orange" }]}>100%</Text>
          </View>
        </View>

        <View style={[styles.stat, { backgroundColor: "limegreen" }]}>
          <Text style={[styles.statTitle]}>Answered</Text>
          <View style={styles.statData}>
            <MaterialCommunityIcons
              name="bullseye-arrow"
              size={20}
              color="limegreen"
            />
            <Text style={[styles.statDataText, { color: "limegreen" }]}>
              100%
            </Text>
          </View>
        </View>

        <View style={[styles.stat]}>
          <Text style={[styles.statTitle]}>Answered</Text>
          <View style={styles.statData}>
            <Feather name="clock" color="deepskyblue" size={20} />
            <Text style={[styles.statDataText]}>100%</Text>
          </View>
        </View>
      </View>

      {/**** ctx */}
      <View style={styles.ctx}>
        <Button
          label="Keep going"
          onPress={onContinue}
          labelColor={"#fffe"}
          shadowColor={"#058fb9cc"}
          backgroundColor={"deepskyblue"}
        />
      </View>
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
    height: height * 0.4,
    aspectRatio: 1 / 1,
    marginHorizontal: "auto",
    marginVertical: 25,
  },

  displayText: {
    fontSize: 35,
    color: "limegreen",
    marginBottom: 50,
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
    backgroundColor: "deepskyblue",
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
    fontSize: 18,
    fontWeight: 800,
    fontFamily: "Inter",
    color: "deepskyblue",
  },
  ctx: {
    marginTop: "auto",
    width: "100%",
    position: "relative",
  },
});
