import Paywall from "@/components/subscriptions/Paywall";
import { useAuthContext } from "@/context/AuthContext";
import { supabase } from "@/utils/supabase";
import { Ionicons, Octicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, { useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import Animated, {
  FadeIn,
  FadeOut,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { verticalScale } from "react-native-size-matters";
import { toast } from "sonner-native";

type LevelsType = {
  id: "beginner" | "intermediate" | "advanced";
  description: string;
  title: string;
};

const LEVELS: LevelsType[] = [
  {
    id: "beginner",
    title: "Beginner",
    description: "I know a few words or not at all.",
  },
  {
    id: "intermediate",
    title: "Intermediate",
    description: "I can have basic conversations.",
  },
  {
    id: "advanced",
    title: "Advanced",
    description: "I can express myself fluently.",
  },
];

const MOTIVATIONS = [
  {
    id: "travel",
    title: "Travel",
    icon: "airplane-outline",
  },
  {
    id: "work",
    title: "Work",
    icon: "briefcase-outline",
  },
  {
    id: "family",
    title: "Family",
    icon: "people-outline",
  },

  {
    id: "culture",
    title: "Culture",
    icon: "book-outline",
  },
  {
    id: "hobby",
    title: "Hobby",
    icon: "game-controller-outline",
  },
];

const INTERESTS = [
  "Food & Dining",
  "Business",
  "Daily life",
  "Technology",
  "Art",
  "Music",
  "Politics",
  "Sports",
];

const OnboardingScreen = () => {
  const [name, setName] = useState<string>("");
  const [level, setLevel] = useState<
    "beginner" | "intermediate" | "advanced" | null
  >(null);
  const [interests, setInterests] = useState<string[]>([]);
  const [motivations, setMotivations] = useState<string[]>([]);
  const [showPaywall, setShowPaywall] = useState<boolean>(false);
  const [focused, setFocused] = useState<boolean>(false);
  const [step, setStep] = useState<number>(0);
  const { refreshProfile } = useAuthContext();
  const [loading, setLoading] = useState<boolean>(false);
  const progressBarWidth = useSharedValue(25);
  const insets = useSafeAreaInsets();

  const progressAnimatedStyle = useAnimatedStyle(() => {
    return {
      width: `${progressBarWidth.value}%`,
    };
  });

  const animateProgressBar = (nextStep: number) => {
    progressBarWidth.value = withTiming((nextStep + 1) * 25, {
      duration: 1000,
    });
  };

  const handleBack = () => {
    if (step > 0) {
      const prevStep = step - 1;
      setStep(prevStep);
      animateProgressBar(prevStep);
    } else {
      return router.back();
    }
  };

  const handleContinue = () => {
    if (step < 3) {
      const nextStep = step + 1;
      setStep(nextStep);
      animateProgressBar(nextStep);
    } else {
      console.log("called save profile");
      saveProfile();
      console.log("Profile saved!");
    }
  };

  const isNextEnabled = () => {
    if (step === 0) return name.trim().length > 0;
    if (step === 1) return !!level;
    if (step === 2) return motivations.length > 0;
    if (step === 3) return interests.length > 0;
  };

  const saveProfile = async () => {
    setLoading(true);
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("No user found. Please sign in first!");

      const { error } = await supabase.from("profiles").upsert({
        id: user.id,
        full_name: name,
        chinese_level: level,
        motivations,
        interests,
        onboarding_completed: true,
        updated_at: new Date().toISOString(),
      });

      if (error) throw error;

      await refreshProfile();

      toast(`You are logged in as ${name}`);
      setShowPaywall(true);
    } catch (error) {
      console.log("Fiailed to save profile: ", error);
      toast.error("Something happened. Please try again!");
    } finally {
      setLoading(false);
    }
  };

  const updateMotivations = (id: string) => {
    if (motivations.includes(id)) {
      setMotivations((prev) => prev.filter((pid) => pid !== id));
    } else {
      setMotivations((prev) => [...prev, id]);
    }
  };

  const updateInterests = (i: string) => {
    if (interests.includes(i)) {
      setInterests((prev) => prev.filter((pi) => pi !== i));
    } else {
      setInterests((prev) => [...prev, i]);
    }
  };

  const renderStep0Name = () => {
    return (
      <View style={styles.stepContainer}>
        <Text style={styles.title}>What should we call you?</Text>
        <Text style={styles.subtitle}>
          Your name will be used to personalised your lessons
        </Text>
        <TextInput
          value={name}
          onChangeText={setName}
          onSubmitEditing={handleContinue}
          onBlur={() => setFocused(false)}
          onFocus={() => setFocused(true)}
          placeholder="Your name"
          placeholderTextColor={"#0003"}
          returnKeyType="next"
          returnKeyLabel="Cont'"
          autoComplete="name"
          style={[
            styles.textInput,
            { borderBottomColor: focused ? "#9c0147" : "#3333" },
          ]}
        />
      </View>
    );
  };

  const renderStep1Level = () => {
    return (
      <View style={styles.stepContainer}>
        <Text style={styles.title}>How much chinese do you know?</Text>

        <ScrollView
          contentContainerStyle={{ rowGap: 16 }}
          showsVerticalScrollIndicator={false}
          style={styles.collectible}
        >
          {LEVELS.map(
            (l: {
              id: "beginner" | "intermediate" | "advanced";
              title: string;
              description: string;
            }) => (
              <TouchableOpacity
                activeOpacity={0.7}
                onPress={() => setLevel(l.id === level ? null : l.id)}
                key={l.id}
                style={[
                  styles.selectCard,
                  {
                    borderColor: l.id === level ? "#9c0147cc" : "#3333",
                    backgroundColor: l.id === level ? "#fff" : "transparent",
                  },
                ]}
              >
                <Text
                  style={[
                    styles.selectTitle,
                    {
                      color: l.id !== level ? "#000c" : "#9c0147cc",
                    },
                  ]}
                >
                  {l.title}
                </Text>
                <Text style={styles.selectDescription}>{l.description}</Text>
              </TouchableOpacity>
            ),
          )}
        </ScrollView>
      </View>
    );
  };

  const renderStep2Motivation = () => {
    return (
      <View style={styles.stepContainer}>
        <Text style={styles.title}>Why are you learning Chinese?</Text>
        <Text style={styles.subtitle}>Select all that apply.</Text>

        <ScrollView
          contentContainerStyle={{ rowGap: 16, paddingVertical: 15 }}
          showsVerticalScrollIndicator={false}
          style={[styles.collectible, { marginTop: 10 }]}
        >
          {MOTIVATIONS.map((m) => {
            const isSelected = motivations.includes(m.id);
            return (
              <TouchableOpacity
                activeOpacity={0.7}
                onPress={() => updateMotivations(m.id)}
                key={m.id}
                style={[
                  styles.selectCard,
                  styles.motivationSelectCard,
                  {
                    borderColor: isSelected ? "#9c0147cc" : "#3333",
                    backgroundColor: isSelected ? "#fff" : "transparent",
                  },
                ]}
              >
                <Text
                  style={[
                    styles.selectTitle,
                    {
                      color: !isSelected ? "#000c" : "#9c0147cc",
                      fontSize: 18,
                    },
                  ]}
                >
                  {m.title}
                </Text>
                <Ionicons
                  name={m.icon as any}
                  size={20}
                  color={!isSelected ? "#000c" : "#9c0147cc"}
                />
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>
    );
  };

  const renderStep3Interests = () => {
    return (
      <View style={styles.stepContainer}>
        <Text style={styles.title}>What are you interested in?</Text>
        <Text style={styles.subtitle}>Select all that apply.</Text>

        <ScrollView
          contentContainerStyle={{
            columnGap: 10,
            rowGap: 16,
            paddingVertical: 15,
            flexDirection: "row",
            flexWrap: "wrap",
          }}
          showsVerticalScrollIndicator={false}
          style={[styles.collectible, { marginTop: 10 }]}
        >
          {INTERESTS.map((i) => {
            const isSelected = interests.includes(i);
            return (
              <TouchableOpacity
                activeOpacity={0.7}
                onPress={() => updateInterests(i)}
                key={i}
                style={[
                  styles.selectCard,
                  {
                    borderColor: isSelected ? "transparent" : "#3333",
                    backgroundColor: isSelected ? "#9c0147" : "transparent",
                    borderRadius: 100,
                    paddingLeft: 15,
                    paddingRight: 25,
                    paddingVertical: 10,
                    minWidth: 100,
                  },
                ]}
              >
                <Text
                  style={[
                    styles.selectTitle,
                    {
                      color: !isSelected ? "#000c" : "#fff",
                      fontSize: 18,
                    },
                  ]}
                >
                  {i}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>
    );
  };

  return (
    <View
      style={[
        styles.container,
        {
          paddingTop: insets.top + 10,
          paddingBottom: insets.bottom + 10,
        },
      ]}
    >
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "android" ? "height" : "padding"}
      >
        <StatusBar backgroundColor="transparent" style="dark" />
        {/**** header */}
        <View style={styles.header}>
          {/**** back */}
          <Pressable
            disabled={loading}
            onPress={handleBack}
            style={styles.back}
          >
            <Octicons
              name="chevron-left"
              size={25}
              color={loading ? "#0003" : "#000a"}
            />
          </Pressable>
          {/**** progress-bar */}
          <View style={styles.progressBar}>
            <Animated.View style={[styles.progress, progressAnimatedStyle]} />
          </View>
          {/**** content */}
        </View>
        <Animated.View
          entering={FadeIn}
          exiting={FadeOut}
          style={styles.content}
        >
          {step === 0 && renderStep0Name()}
          {step === 1 && renderStep1Level()}
          {step === 2 && renderStep2Motivation()}
          {step === 3 && renderStep3Interests()}
        </Animated.View>

        <View style={[styles.footer]}>
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={handleContinue}
            style={[
              styles.callToAction,
              {
                backgroundColor:
                  isNextEnabled() && !loading ? "#9c0147" : "#2222",
              },
            ]}
            disabled={!isNextEnabled() || loading}
          >
            {!loading ? (
              <Text
                style={[
                  styles.callToActionText,
                  { color: isNextEnabled() ? "#fffd" : "#3333" },
                ]}
              >
                {step === 3 ? "Get Started" : "Continue"}
              </Text>
            ) : (
              <ActivityIndicator color={"#333a"} size="small" />
            )}
          </TouchableOpacity>
        </View>

        {/**** paywall modal */}
        <Paywall
          visible={showPaywall}
          onClose={() => router.replace("/(tabs)/lessons")}
        />
      </KeyboardAvoidingView>
    </View>
  );
};

export default OnboardingScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    paddingBottom: 0,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 5,
  },
  back: {
    flex: 0.08,
  },
  progressBar: {
    flex: 0.9,
    height: 15,
    backgroundColor: "#0001",
    borderRadius: 50,
    marginRight: "auto",
    borderWidth: 1,
    borderColor: "#00000001",
  },
  progress: {
    backgroundColor: "#9c0147",
    height: "100%",
    borderRadius: 50,
  },

  content: {
    flex: 1,
    marginTop: verticalScale(30),
    paddingHorizontal: 20,
  },
  stepContainer: {
    flex: 1,
  },
  title: {
    fontSize: verticalScale(25),
    fontWeight: "700",
    fontFamily: "Inter",
    marginBottom: 5,
    color: "#222c",
  },

  subtitle: {
    fontSize: verticalScale(17),
    fontFamily: "Inter",
    color: "#222a",
    marginBottom: 10,
  },

  textInput: {
    fontSize: 20,
    fontWeight: "600",
    fontFamily: "Inter",
    borderBottomWidth: 1,
    borderBottomColor: "#0001",
    paddingVertical: 10,
    color: "#333c",
    marginTop: 40,
  },

  collectible: { marginTop: 20 },
  selectCard: {
    borderWidth: 1.5,
    borderRadius: 15,
    padding: 15,
  },

  motivationSelectCard: {
    flexDirection: "row-reverse",
    justifyContent: "flex-end",
    alignItems: "center",
    gap: 10,
    padding: 20,
  },

  selectTitle: {
    fontSize: 20,
    fontWeight: 700,
    fontFamily: "Inter",
  },
  selectDescription: {
    color: "#2228",
    fontWeight: 600,
    fontFamily: "Inter",
    marginTop: 5,
    fontSize: 16,
  },

  footer: {
    marginTop: "auto",
    paddingHorizontal: 20,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: "#3331",
  },
  callToAction: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    borderRadius: 50,
  },
  callToActionText: {
    fontSize: 20,
    fontWeight: "600",
    fontFamily: "Inter",
  },
});
