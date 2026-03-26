import React, { useEffect, useRef } from "react";
import { Animated, StyleSheet, View } from "react-native";

const AudioWaveForm = ({
  isPlaying,
  waveCount = 15,
  waveColor = "#3062ce",
}: {
  isPlaying: boolean;
  waveCount?: number;
  waveColor?: string;
}) => {
  const waveAnims = useRef(
    Array.from({ length: waveCount }, () => new Animated.Value(0.3)),
  ).current;

  useEffect(() => {
    if (isPlaying) {
      const animations = waveAnims.map((anim) => {
        return Animated.loop(
          Animated.sequence([
            Animated.timing(anim, {
              toValue: Math.random() * 0.5 + 0.5,
              duration: 150 + Math.random() * 200,
              useNativeDriver: true,
            }),
            Animated.timing(anim, {
              toValue: 0.3,
              duration: 150 + Math.random() * 200,
              useNativeDriver: true,
            }),
          ]),
        );
      });
      Animated.parallel(animations).start();
    } else {
      waveAnims.map((anim) => {
        anim.stopAnimation();
        Animated.timing(anim, {
          toValue: 0.3,
          duration: 150 + Math.random() * 200,
          useNativeDriver: true,
        }).start();
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isPlaying]);

  return (
    <View style={styles.waveformContainer}>
      <View style={styles.audioWaveContainer}>
        {waveAnims.map((waveAnim, index) => (
          <Animated.View
            key={index}
            style={[
              styles.waveBar,
              {
                backgroundColor: waveColor,
                transform: [{ scaleY: waveAnim }],
                height: 20 + (index % 4) * 6,
              },
            ]}
          />
        ))}
      </View>
    </View>
  );
};

export default AudioWaveForm;

const styles = StyleSheet.create({
  waveformContainer: {
    alignItems: "center",
    justifyContent: "center",
    minHeight: 50,
  },
  audioWaveContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 2,
  },
  waveBar: {
    width: 3,
    backgroundColor: "#3062ce",
    borderRadius: 1.5,
    opacity: 0.8,
    minHeight: 8,
  },
});
