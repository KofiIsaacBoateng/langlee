import { supabase } from "@/utils/supabase";
import { Octicons } from "@expo/vector-icons";
import { makeRedirectUri } from "expo-auth-session";
import { useState } from "react";
import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import Animated, { FadeIn, FadeOut } from "react-native-reanimated";
import { toast } from "sonner-native";

const redirectTo = makeRedirectUri();

const EmailAuth = ({ goBack }: { goBack: () => void }) => {
  const [email, setEmail] = useState<string>("");
  const [loading, setLoading] = useState(false);

  const sendMagicLink = async () => {
    if (!email) {
      toast.error("Please enter your email!");
      return;
    }

    setLoading(true);
    try {
      const { error, data } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: redirectTo,
        },
      });

      if (error) {
        throw error;
      }
    } catch (error) {
      toast.error("Something went wrong. Please try again!");
      console.error("Error sending magic link: ", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Animated.View entering={FadeIn} exiting={FadeOut} style={styles.emailAuth}>
      {/*** back */}
      <Pressable style={styles.back} onPress={goBack}>
        <Octicons name="chevron-left" size={25} color="#fffc" />
      </Pressable>
      {/*** Heading texts */}
      <View style={styles.heading}>
        <Text style={styles.title}>Enter your email address.</Text>
        <Text style={styles.subtitle}>
          We will send you a magic link to sign in.
        </Text>
      </View>
      {/*** email input */}
      <TextInput
        onChangeText={setEmail}
        onSubmitEditing={sendMagicLink}
        placeholder="Type your email"
        placeholderTextColor="#fff8"
        keyboardType="email-address"
        autoCapitalize="none"
        autoComplete="email"
        autoFocus
        returnKeyLabel="Send"
        returnKeyType="send"
        style={styles.emailInput}
      />
      {/*** send btn */}
      <Pressable
        onPress={sendMagicLink}
        style={[
          styles.linkBtn,
          { marginTop: 20, borderWidth: 0, backgroundColor: "#555a" },
        ]}
      >
        <Text style={styles.linkText}>
          {loading ? "Sending..." : "Send magic link"}
        </Text>
      </Pressable>
    </Animated.View>
  );
};

export default EmailAuth;

const styles = StyleSheet.create({
  emailAuth: {
    flex: 1,
    paddingTop: 15,
  },

  back: {
    paddingVertical: 5,
  },

  heading: {
    gap: 5,
    marginVertical: 10,
  },

  title: {
    fontSize: 25,
    fontWeight: 900,
    color: "#fffc",
  },
  subtitle: {
    fontSize: 15,
    color: "#fffa",
    fontWeight: 700,
  },

  emailInput: {
    backgroundColor: "#555a",
    color: "#fffe",
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "#fff8",
    paddingVertical: 13,
    paddingHorizontal: 15,
    borderRadius: 5,
    fontSize: 16,
    marginTop: 10,
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
