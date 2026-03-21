import { ListeningOption, SpeakingOption } from "@/constants/CourseData";
import React from "react";
import { Animated, Dimensions, StyleSheet, Text } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Button from "../buttons/Button";
const { height } = Dimensions.get("window");
const MultipleChoiceMode = ({
  options,
  selectedOption,
  showResult,
  handleOptionPressed,
  audFlexAnim,
}: {
  options: ListeningOption[] | SpeakingOption[];
  selectedOption: number | null;
  audFlexAnim: Animated.Value;
  showResult: boolean;
  handleOptionPressed: (id: number) => void;
}) => {
  const insets = useSafeAreaInsets();

  return (
    <Animated.View
      style={[
        styles.container,
        {
          height: audFlexAnim.interpolate({
            inputRange: [0, 1],
            outputRange: [0, height * 0.5],
          }),
          transform: [
            {
              translateY: audFlexAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [height, 0],
              }),
            },
          ],
          opacity: audFlexAnim,
          marginBottom: audFlexAnim.interpolate({
            inputRange: [0, 1],
            outputRange: [0, insets.bottom + 30],
          }),

          marginTop: audFlexAnim.interpolate({
            inputRange: [0, 1],
            outputRange: [0, 20],
          }),
        },
      ]}
    >
      <Text style={styles.title}>Translate the above</Text>
      {options.map((option, index) => {
        const isSelected = option.id === selectedOption;

        return (
          <Button
            key={index}
            onPress={() => handleOptionPressed(option.id)}
            label={option.english}
            backgroundColor={isSelected ? "#3062ce33" : "#fff"}
            shadowColor={isSelected ? "#3062cecc" : "#3335"}
            labelColor={isSelected ? "#3062cecc" : "#333d"}
          />
        );
      })}
    </Animated.View>
  );
};

export default MultipleChoiceMode;

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 30,
    gap: 30,
    justifyContent: "center",
  },

  title: {
    fontSize: 20,
    fontFamily: "Inter",
    fontWeight: 700,
    color: "#333d",
  },
});
