import React, { PropsWithChildren } from "react";
import { Dimensions, StyleSheet, Text, TouchableOpacity } from "react-native";

const { width, height } = Dimensions.get("window");
type ButtonType = {
  onPress: () => {};
  label: string;
};
const Button = ({ onPress, label }: PropsWithChildren & ButtonType) => {
  return (
    <TouchableOpacity onPress={onPress} style={styles.btn} activeOpacity={0.8}>
      <Text style={styles.btnText}>{label}</Text>
    </TouchableOpacity>
  );
};

export default Button;

const styles = StyleSheet.create({
  btn: {
    width: width * 0.8,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 15,
    marginHorizontal: "auto",
    backgroundColor: "#ac044f",
  },
  btnText: {
    fontSize: 20,
    fontWeight: "bold",
    fontFamily: "Inter",
    color: "white",
  },
});
