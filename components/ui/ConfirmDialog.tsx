import React from "react";
import {
  Dimensions,
  Image,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const { height } = Dimensions.get("window");
const ConfirmDialog = ({
  visible,
  title,
  description,
  cancelLabel = "cancel",
  confirmLabel = "confirm",
  onCancel,
  onConfirm,
  destructive = false,
}: {
  visible: boolean;
  title: string;
  description?: string;
  cancelLabel?: string;
  confirmLabel?: string;
  onCancel: () => void;
  onConfirm: () => void;
  destructive?: boolean;
}) => {
  return (
    <Modal
      backdropColor={"#0003"}
      visible={visible}
      onRequestClose={onCancel}
      animationType="slide"
      allowSwipeDismissal={true}
    >
      <SafeAreaView style={styles.container} edges={["top"]}>
        <View style={styles.bottomSheet}>
          {/*** dragger */}
          <View style={styles.dragger} />
          <View style={styles.content}>
            {/**** image */}
            <Image
              source={require("@/assets/images/sad-kitty.png")}
              style={styles.image}
            />
            {/**** texts */}
            <Text style={styles.title}>{title}</Text>
            <Text style={styles.description}>{description ?? ""}</Text>
            {/**** call to actions */}
            <View style={styles.ctx}>
              <Pressable onPress={onCancel} style={styles.cancel}>
                <View style={styles.cancelShadow} />
                <Text style={styles.cancelLabel}>{cancelLabel}</Text>
              </Pressable>
              <Pressable onPress={onConfirm} style={styles.confirm}>
                <Text style={styles.confirmLabel}>{confirmLabel}</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </SafeAreaView>
    </Modal>
  );
};

export default ConfirmDialog;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    zIndex: 50,
  },
  bottomSheet: {
    alignItems: "center",
    height: height * 0.7,
    backgroundColor: "#fff",
    marginTop: "auto",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingVertical: 10,
  },

  dragger: {
    width: 50,
    height: 6,
    backgroundColor: "#3335",
    borderRadius: 10,
    marginHorizontal: "auto",
  },

  content: {
    paddingHorizontal: 30,
  },

  image: {
    height: height * 0.25,
    aspectRatio: 1 / 1,
    marginHorizontal: "auto",
    marginVertical: 25,
  },
  title: {
    fontSize: 22,
    fontFamily: "Inter",
    color: "#000c",
    fontWeight: 700,
    textAlign: "center",
    marginBottom: 10,
    letterSpacing: 0.5,
  },
  description: {
    textAlign: "center",
    fontSize: 18,
    color: "#000a",
    letterSpacing: 0.5,
    marginBottom: 10,
  },
  ctx: {
    flex: 1,
    justifyContent: "space-evenly",
  },

  cancel: {
    backgroundColor: "#1e7be6",
    alignItems: "center",
    paddingVertical: 15,
    borderRadius: 15,
  },

  cancelShadow: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: -5,
    top: 0,
    borderRadius: 15,
    backgroundColor: "#1e7be6cc",
    zIndex: -1,
  },

  cancelLabel: {
    color: "#fffe",
    fontSize: 15,
    textTransform: "uppercase",
    letterSpacing: 1,
    fontWeight: 800,
  },

  confirm: {
    alignItems: "center",
  },

  confirmLabel: {
    color: "#f00d",
    fontSize: 15,
    textTransform: "uppercase",
    letterSpacing: 1,
    fontWeight: 800,
  },
});
