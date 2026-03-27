import { ListeningOption, SpeakingOption } from "@/constants/CourseData";
import React from "react";
import { Animated, Dimensions, StyleSheet, Text } from "react-native";
import Button from "../buttons/Button";
const { height } = Dimensions.get("window");
const MultipleChoiceMode = ({
  options,
  selectedOption,
  showResult,
  handleOptionPressed,
  optionFadeInAnim,
  isCorrect,
}: {
  options: ListeningOption[] | SpeakingOption[];
  selectedOption: number | null;
  optionFadeInAnim: Animated.Value;
  showResult: boolean;
  isCorrect: boolean;
  handleOptionPressed: (id: number) => void;
}) => {
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
      <Text style={styles.title}>What did you hear?</Text>
      {options.map((option, index) => {
        const isSelected = option.id === selectedOption;

        return (
          <Button
            key={index}
            onPress={() => handleOptionPressed(option.id)}
            label={option.english}
            backgroundColor={
              isSelected ? (isCorrect ? "#16b116" : "#a10b0b") : "#fff"
            }
            shadowColor={
              isSelected ? (isCorrect ? "#16b116b3" : "#a10b0ba6") : "#3335"
            }
            labelColor={isSelected ? "#fff" : "#333d"}
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
