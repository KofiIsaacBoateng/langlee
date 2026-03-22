/* eslint-disable react-hooks/exhaustive-deps */
import globalStyles from "@/styles/Global";
import { AntDesign, Fontisto } from "@expo/vector-icons";
import { useVideoPlayer, VideoView } from "expo-video";
import React, { useEffect, useState } from "react";
import {
  Dimensions,
  Image,
  Keyboard,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, {
  FadeIn,
  FadeOut,
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withSpring,
  withTiming,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { verticalScale } from "react-native-size-matters";
import { scheduleOnRN } from "react-native-worklets";
import EmailAuth from "./EmailAuth";

const { width, height } = Dimensions.get("window");
const SHEETS_HEIGHT = 300;

const Intro = () => {
  const [activeText, setActiveText] = useState<number>(0);
  const [isMenuOpen, setIsMenuOpen] = useState<boolean>(false);
  const [startSignIn, setStartSignIn] = useState<boolean>(false);
  const [keyboardHeight, setKeyboardHeight] = useState<number>(0);
  const heroOpacity = useSharedValue(0);
  const heroSpecialOpacity = useSharedValue(0);
  const menuTranslateY = useSharedValue(SHEETS_HEIGHT);
  const getStartedTranslateY = useSharedValue(0);
  const insets = useSafeAreaInsets();

  const specialTexts = [
    "Listening...",
    "Speaking...",
    "Practicing...",
    "Chatting...",
  ];
  const player = useVideoPlayer(require("@/assets/videos/broll.mp4"), (p) => {
    p.muted = true;
    p.loop = true;
    p.play();
  });

  const heroAnimatedStyle = useAnimatedStyle(() => {
    return {
      opacity: heroOpacity.value,
      transform: [
        { translateY: interpolate(heroOpacity.value, [0, 1], [30, 0]) },
      ],
    };
  });

  const heroSpecialAnimatedStyle = useAnimatedStyle(() => {
    return {
      opacity: heroSpecialOpacity.value,
    };
  });

  const menuAnimatedStyle = useAnimatedStyle(() => {
    return { transform: [{ translateY: menuTranslateY.value }] };
  });

  const getStartedAnimatedStyle = useAnimatedStyle(() => {
    return { transform: [{ translateY: getStartedTranslateY.value }] };
  });

  const animateHeroIn = () => {
    heroOpacity.value = withTiming(1, { duration: 800 });
    heroSpecialOpacity.value = withDelay(800, withTiming(1, { duration: 500 }));
  };

  const fadeSpecialOut = () => {
    heroSpecialOpacity.value = withTiming(0, { duration: 500 });
  };

  const fadeSpecialIn = () => {
    heroSpecialOpacity.value = withTiming(1, { duration: 500 });
  };

  const animateMenu = (menuPosition: number, buttonPosition: number) => {
    menuTranslateY.value = withDelay(
      menuPosition ? 0 : 500,
      withSpring(menuPosition, {
        damping: 30,
        stiffness: 200,
        mass: 1,
      }),
    );

    getStartedTranslateY.value = withDelay(
      buttonPosition ? 0 : 500,
      withSpring(buttonPosition, {
        damping: 30,
        stiffness: 200,
        mass: 1,
      }),
    );
  };

  const handleMenuState = () => {
    let newState = !isMenuOpen;
    setIsMenuOpen(newState);
    if (newState) {
      animateMenu(0, SHEETS_HEIGHT + 5);
    } else {
      animateMenu(SHEETS_HEIGHT + 5, 0);
    }
  };

  useEffect(() => {
    let timeout = setTimeout(() => {
      animateHeroIn();
    }, 500);

    let interval = setInterval(() => {
      fadeSpecialOut();
      setTimeout(() => {
        setActiveText((prev) => {
          const nextIndex = (prev + 1) % specialTexts.length;
          if (nextIndex === 0) {
            setTimeout(() => fadeSpecialIn(), 150);
          }
          return nextIndex;
        });
      }, 500);
    }, 3500);

    return () => {
      clearTimeout(timeout);
      clearInterval(interval);
    };
  }, []);

  useEffect(() => {
    if (activeText > 0) {
      let timeout = setTimeout(() => {
        fadeSpecialIn();
      }, 150);

      return () => {
        clearTimeout(timeout);
      };
    }
  }, [activeText]);

  useEffect(() => {
    const keyBoardWillShow = Keyboard.addListener(
      Platform.OS === "ios" ? "keyboardWillShow" : "keyboardDidShow",
      (_e) => {
        setKeyboardHeight(_e.endCoordinates.height);
      },
    );

    const keyBoardWillHide = Keyboard.addListener(
      Platform.OS === "ios" ? "keyboardWillHide" : "keyboardDidHide",
      (_e) => {
        setKeyboardHeight(0);
      },
    );

    return () => {
      keyBoardWillHide.remove();
      keyBoardWillShow.remove();
    };
  }, []);

  const dynamicSheetsHeight =
    keyboardHeight > 0 ? SHEETS_HEIGHT + keyboardHeight + 50 : SHEETS_HEIGHT;

  const panGesture = Gesture.Pan().onEnd((e) => {
    "worklet";
    if (e.translationY > 50) {
      menuTranslateY.value = withSpring(SHEETS_HEIGHT + 5, {
        damping: 30,
        stiffness: 200,
        mass: 1,
      });
      scheduleOnRN(handleMenuState);
    }
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
          { zIndex: 15, width, height, backgroundColor: "rgba(0, 0, 0, 0.5)" },
        ]}
      />

      {/**** Hero text */}
      <Animated.View style={[styles.hero, heroAnimatedStyle]}>
        <Text style={styles.heroText}>Learn Mandarin the right way</Text>
      </Animated.View>

      {/**** Hero special text */}
      <Animated.View style={[styles.special, heroSpecialAnimatedStyle]}>
        <Text style={[styles.specialText]}>{specialTexts[activeText]}</Text>
      </Animated.View>

      {/*** BOTTOM SHEETS */}
      <GestureDetector gesture={panGesture}>
        <Animated.View
          style={[
            styles.bottomSheet,
            menuAnimatedStyle,
            {
              height: dynamicSheetsHeight,
              paddingBottom: insets.bottom + 15,
              backgroundColor: keyboardHeight > 0 ? "#000e" : "#000c",
            },
          ]}
        >
          {/*** dragger */}
          <Pressable onPress={handleMenuState} style={{ marginBottom: "auto" }}>
            <View style={styles.dragger} />
          </Pressable>

          {/**** CONTENT */}
          {startSignIn ? (
            <EmailAuth goBack={() => setStartSignIn(false)} />
          ) : (
            renderAuthOptions(() => setStartSignIn(true))
          )}
        </Animated.View>
      </GestureDetector>

      {/*** get started */}
      <Animated.View
        style={[
          styles.getStarted,
          { marginBottom: insets.bottom + 30 },
          getStartedAnimatedStyle,
        ]}
      >
        <Pressable
          onPress={handleMenuState}
          style={{ flex: 1, alignItems: "center" }}
        >
          <Text style={styles.getStartedText}>Get Started</Text>
        </Pressable>
      </Animated.View>
    </View>
  );
};

export default Intro;

const styles = StyleSheet.create({
  hero: {
    zIndex: 30,
    width: width * 0.7,
    marginTop: verticalScale(40),
    marginRight: "auto",
    marginLeft: 30,
  },

  special: {
    zIndex: 30,
    marginRight: "auto",
    marginLeft: 30,
  },

  heroText: {
    fontSize: verticalScale(55),
    fontWeight: "bold",
    color: "#fffc",
    fontFamily: "SpaceMono",
    marginTop: -5,
  },

  specialText: {
    fontSize: verticalScale(55),
    letterSpacing: 2,
    color: "#f1579c",
    fontWeight: "bold",
    fontFamily: "Inter",
  },

  getStarted: {
    zIndex: 30,
    backgroundColor: "#690030",
    elevation: 5,
    marginTop: "auto",
    marginHorizontal: 30,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 15,
    borderRadius: 50,
    flexDirection: "row",
  },

  getStartedText: {
    color: "#fffd",
    fontSize: 18,
    fontWeight: "bold",
  },

  bottomSheet: {
    position: "absolute",
    width,
    height: SHEETS_HEIGHT,
    bottom: 0,
    zIndex: 30,
    borderEndStartRadius: 20,
    borderStartStartRadius: 20,
    paddingHorizontal: 30,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "#fff7",
  },

  dragger: {
    width: width * 0.15,
    height: 5,
    backgroundColor: "#ffffff99",
    borderRadius: 50,
    marginHorizontal: "auto",
    marginTop: verticalScale(7),
  },

  content: {
    flex: 1,
  },
  header: {
    paddingTop: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  logo: {
    height: 30,
    width: 30,
  },
  logoText: {
    fontSize: 18,
    fontWeight: "bold",
    fontFamily: "MonoSpace",
    color: "#f1579ccc",
  },
  headerRight: {},
  headerText: {
    fontSize: 17,
    fontWeight: 800,
    color: "#fffc",
  },

  links: {
    marginTop: 25,
    gap: 15,
  },

  linkBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    backgroundColor: "#555a",
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "#fff8",
    paddingVertical: 15,
    borderRadius: 10,
  },

  linkText: {
    color: "#fffc",
    fontSize: 18,
    fontWeight: 700,
  },
});

const renderAuthOptions = (setSignInOption: () => void) => (
  <Animated.View entering={FadeIn} exiting={FadeOut} style={styles.content}>
    {/**** header */}
    <View style={styles.header}>
      <View style={styles.headerLeft}>
        <Image
          source={require("@/assets/images/splash-icon.png")}
          style={styles.logo}
        />
        <Text style={styles.logoText}>anglee</Text>
      </View>
      <View style={styles.headerRight}>
        <Text style={styles.headerText}>Start today</Text>
      </View>
    </View>
    {/**** links */}
    <View style={styles.links}>
      <Pressable onPress={() => null} style={styles.linkBtn}>
        <AntDesign name="apple" color="#fffc" size={20} />
        <Text style={styles.linkText}>Continue with Apple</Text>
      </Pressable>

      <Pressable onPress={() => null} style={styles.linkBtn}>
        <AntDesign name="google" color="#fffc" size={20} />
        <Text style={styles.linkText}>Continue with Google</Text>
      </Pressable>

      <Pressable onPress={setSignInOption} style={styles.linkBtn}>
        <Fontisto name="email" color="#fffc" size={20} />
        <Text style={styles.linkText}>Continue with Email</Text>
      </Pressable>
    </View>
  </Animated.View>
);
