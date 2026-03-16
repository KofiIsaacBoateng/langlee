import globalStyles from "@/styles/Global";
import { useVideoPlayer, VideoView } from "expo-video";
import React from "react";
import { Dimensions, StyleSheet, Text, View } from "react-native";
import { verticalScale } from "react-native-size-matters";
import Button from "../buttons/Button";

const { width, height } = Dimensions.get("window");
const Intro = () => {
  const player = useVideoPlayer(require("@/assets/videos/broll.mp4"), (p) => {
    p.muted = true;
    p.loop = true;
    p.play();
  });
  return (
    <View style={[globalStyles.container]}>
      {/*** Background video */}
      <VideoView
        player={player}
        nativeControls={false}
        contentFit="cover"
        style={[StyleSheet.absoluteFill, { zIndex: 10 }]}
      />

      {/**** overlay */}
      <View
        style={[
          StyleSheet.absoluteFill,
          { zIndex: 15, width, height, backgroundColor: "rgba(0, 0, 0, 0.4)" },
        ]}
      />

      {/**** Hero text */}
      <View style={styles.hero}>
        <Text style={styles.heroText}>Learn</Text>
        <Text style={styles.heroText}>Mandarin</Text>
        <Text style={styles.heroText}>he right</Text>
        <Text style={styles.heroText}>way</Text>
        <View style={styles.special}>
          <Text style={[styles.heroText, styles.specialText]}>
            Special Text
          </Text>
        </View>
      </View>

      {/*** bottom sheets */}
      <View style={styles.bottomSheet}>
        {/*** dragger */}
        <View style={styles.dragger} />

        {/**** content */}
        <Button onPress={() => ({})} label="apple" />
        <Button onPress={() => ({})} label="google" />
        <Button onPress={() => ({})} label="email" />
      </View>
    </View>
  );
};

export default Intro;

const styles = StyleSheet.create({
  bottomSheet: {
    backgroundColor: "white",
    width,
    height: height * 0.35,
    zIndex: 30,
    marginTop: "auto",
    borderEndStartRadius: 50,
    borderStartStartRadius: 50,
    paddingBottom: 20,
    gap: 20,
    justifyContent: "flex-end",
  },

  hero: {
    zIndex: 30,
    marginTop: verticalScale(40),
    marginRight: "auto",
    marginLeft: 10,
    padding: 5,
  },

  heroText: {
    fontSize: verticalScale(50),
    fontWeight: "bold",
    color: "white",
    fontFamily: "SpaceMono",
    marginTop: -5,
  },

  special: {},
  specialText: {
    color: "#f1579c",
    fontWeight: "bold",
    fontFamily: "Inter",
    marginTop: 15,
  },

  dragger: {
    width: width * 0.15,
    height: 5,
    backgroundColor: "darkgray",
    borderRadius: 50,
    marginHorizontal: "auto",
    marginTop: verticalScale(7),
    marginBottom: "auto",
  },
});
