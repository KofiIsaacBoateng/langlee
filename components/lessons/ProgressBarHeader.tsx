import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

const ProgressBarHeader = ({
  progress,
  currentCount,
  totalCount,
  onClose,
}: {
  progress: number;
  currentCount: number;
  onClose: () => void;
  totalCount: number;
}) => {
  return (
    <View style={styles.progress}>
      <Pressable onPress={onClose} hitSlop={20} style={styles.close}>
        <Ionicons name="close" size={24} color="#333a" />
      </Pressable>

      <View style={styles.progressBar}>
        <View style={[styles.progressFill, { width: `${progress}%` }]} />
      </View>

      <Text style={styles.count}>{/* {currentCount}/{totalCount} */}</Text>
    </View>
  );
};

export default ProgressBarHeader;

const styles = StyleSheet.create({
  progress: {
    flexDirection: "row",
    gap: 20,
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 15,
    paddingHorizontal: 15,
    borderBottomWidth: 3,
    borderBottomColor: "#3333330a",
  },

  close: {},
  progressBar: {
    flex: 1,
    height: 15,
    borderRadius: 10,
    backgroundColor: "#33333315",
  },
  progressFill: {
    height: "100%",
    backgroundColor: "limegreen",
    borderRadius: 10,
  },
  count: {
    fontFamily: "Inter",
    color: "#333c",
    fontSize: 16,
  },
});
