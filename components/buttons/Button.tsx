import React, { useState } from "react";
import { Dimensions, Pressable, StyleSheet, Text, View } from "react-native";

const { width, height } = Dimensions.get("window");

interface ButtonType {
  onPress: () => void;
  onPressedIn?: () => void;
  onPressedOut?: () => void;
  disabled?: boolean;
  label: string;
  backgroundColor?: string | null;
  shadowColor?: string | null;
  labelColor?: string | null;
}

const Button = ({
  onPress,
  label,
  onPressedIn,
  onPressedOut,
  disabled = false,
  backgroundColor = null,
  shadowColor = null,
  labelColor = null,
}: ButtonType) => {
  const [isPressedIn, setIsPressedIn] = useState(false);
  return (
    <Pressable
      disabled={disabled}
      onPress={onPress}
      onPressIn={() => setIsPressedIn(true)}
      onPressOut={() => setIsPressedIn(false)}
    >
      <View
        style={[
          styles.button,
          {
            borderColor: isPressedIn ? "transparent" : shadowColor || "#3333",
            borderRadius: 17,
          },
        ]}
      >
        {!isPressedIn && (
          <View
            style={[styles.shadow, { backgroundColor: shadowColor || "#3333" }]}
          />
        )}
        <View
          style={[
            styles.overlay,
            {
              backgroundColor: backgroundColor || "#fffc",
            },
          ]}
        />
        <Text style={[styles.label, { color: labelColor || "#333d" }]}>
          {label}
        </Text>
      </View>
    </Pressable>
  );
};

export default Button;

const styles = StyleSheet.create({
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
  },
  overlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: 17,
    zIndex: 1,
  },
  label: {
    fontSize: 20,
    fontFamily: "Inter",
    zIndex: 5,
  },
});
