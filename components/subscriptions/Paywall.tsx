import { useAuthContext } from "@/context/AuthContext";
import { supabase } from "@/utils/supabase";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Dimensions,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { toast } from "sonner-native";

const { width } = Dimensions.get("screen");
interface Feature {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  description: string;
}

interface Plan {
  id: string;
  name: string;
  price: string;
  period: string;
  billingCycle: string;
  features: string[];
  recommended?: boolean;
  savings?: string;
}

const features: Feature[] = [
  {
    icon: "book-outline",
    title: "Advanced Curriculum",
    description: "Access the world's most advanced speaking curriculum",
  },
  {
    icon: "trending-up-outline",
    title: "Target Your Mistakes",
    description: "Lessons personalized to fix your frequent mistakes",
  },
  {
    icon: "bulb-outline",
    title: "Custom Vocabulary",
    description: "Learn vocabulary tailored to your interests",
  },
  {
    icon: "people-outline",
    title: "Situational Roleplays",
    description: "Practice real-world conversations",
  },
  {
    icon: "mic-outline",
    title: "Pronunciation Coach",
    description: "Get instant feedback on your pronunciation",
  },
  {
    icon: "analytics-outline",
    title: "Progress Reports",
    description: "Track your learning journey with detailed analytics",
  },
];

const plans: { annual: Plan; monthly: Plan } = {
  annual: {
    id: "premium_annual",
    name: "Premium",
    price: "799.00",
    period: "year",
    billingCycle: "Billed yearly",
    features: ["7-day free trial", "Cancel anytime"],
    recommended: true,
    savings: "Save 40%",
  },
  monthly: {
    id: "premium_monthly",
    name: "Premium",
    price: "199.00",
    period: "month",
    billingCycle: "Billed monthly",
    features: ["7-day free trial", "Cancel anytime"],
  },
};

const Paywall = ({
  visible,
  onClose,
}: {
  visible: boolean;
  onClose: () => void;
}) => {
  const [loading, setLoading] = useState(false);
  const { refreshProfile } = useAuthContext();
  const [billingCycle, setBillingCycle] = useState<"monthly" | "annual">(
    "annual",
  );

  const selectedPlan = plans[billingCycle];

  const updateBilling = () => {
    setBillingCycle((prev) => (prev === "monthly" ? "annual" : "monthly"));
  };

  const handleStartTrial = async () => {
    setLoading(true);

    try {
      const { error } = await supabase.functions.invoke("start-trial", {
        body: { planId: selectedPlan.id },
      });

      if (error) throw error;
      await refreshProfile();

      onClose();
    } catch (error) {
      console.log("Error starting free trial: ", error);
      toast.error("Could not start free trial. Please try again!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      visible={visible}
      onRequestClose={onClose}
      presentationStyle="pageSheet"
      animationType="slide"
      allowSwipeDismissal={true}
    >
      <SafeAreaView style={styles.container} edges={["top"]}>
        {/**** linear-gradient */}
        <LinearGradient
          colors={["#ff0088", "#040720"]}
          start={{ x: 0.5, y: 0 }}
          end={{ x: 0.5, y: 1 }}
          style={styles.gradient}
        />

        {/**** header */}
        <View style={styles.header}>
          <Pressable onPress={onClose} style={styles.close}>
            <Ionicons name="close" size={24} color="#fffd" />
          </Pressable>
          <Text style={styles.headerText}>Go Premium</Text>
          <View style={styles.invisibleFlex} />
        </View>

        {/**** content */}
        <ScrollView
          style={styles.content}
          contentContainerStyle={{ paddingTop: 20, paddingBottom: 30 }}
          showsVerticalScrollIndicator={false}
        >
          {/*** intro */}
          <Text style={styles.intro}>
            Join over <Text style={styles.introUnique}>5 million</Text> users
            learning with Langlee
          </Text>

          {/**** features */}
          <View style={styles.featureContainer}>
            {features.map((feature) => (
              <View key={feature.title} style={styles.feature}>
                <View style={styles.featureIcon}>
                  <Ionicons name={feature.icon} size={26} color="#cf0a73" />
                </View>
                <Text style={styles.featureTitle}>{feature.title}</Text>
                <Text style={styles.featureDescription}>
                  {feature.description}
                </Text>
              </View>
            ))}
          </View>

          {/***** billing */}
          <View style={styles.billing}>
            <Pressable
              onPress={updateBilling}
              style={[
                styles.billingNav,
                {
                  backgroundColor:
                    billingCycle === "annual" ? "#fff" : "transparent",
                },
              ]}
            >
              {/* <View style={styles.billingContent}> */}
              <Text
                style={[
                  styles.billingText,
                  {
                    color: billingCycle === "annual" ? "#333c" : "#fffd",
                  },
                ]}
              >
                Annual
              </Text>
              <View style={styles.savings}>
                {<Text style={styles.savingsText}>{plans.annual.savings}</Text>}
              </View>
              {/* </View> */}
            </Pressable>

            <Pressable
              onPress={updateBilling}
              style={[
                styles.billingNav,
                {
                  backgroundColor:
                    billingCycle === "monthly" ? "#fff" : "transparent",
                },
              ]}
            >
              <Text
                style={[
                  styles.billingText,
                  {
                    color: billingCycle === "monthly" ? "#333c" : "#fffd",
                  },
                ]}
              >
                Monthly
              </Text>
            </Pressable>
          </View>

          {/**** billing details */}
          <View style={styles.billingDetails}>
            <View style={styles.billingDetailsHeader}>
              <Text style={styles.billingHeaderText}>Best Sales</Text>
            </View>

            {/*** pricing */}
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <View>
                <Text style={styles.name}>{selectedPlan.name}</Text>
                <Text style={styles.cycle}>{selectedPlan.billingCycle}</Text>
              </View>

              <View style={styles.billDetailsRight}>
                <Text style={styles.price}>{selectedPlan.price}</Text>
                <Text
                  style={[
                    styles.cycle,
                    {
                      marginTop: -10,
                    },
                  ]}
                >
                  {selectedPlan.period}
                </Text>
              </View>
            </View>

            {/**** billing features */}
            <View style={styles.billingFeatures}>
              {selectedPlan.features.map((feature) => (
                <View key={feature} style={styles.billingFeature}>
                  <Ionicons
                    name="checkmark-circle"
                    size={16}
                    color="limegreen"
                  />
                  <Text style={styles.billingFeatureText}>{feature}</Text>
                </View>
              ))}
            </View>
          </View>

          {/**** cta button */}
          <Pressable
            disabled={loading}
            style={styles.callToAction}
            onPress={handleStartTrial}
          >
            {loading ? (
              <ActivityIndicator size="small" color="#fffc" />
            ) : (
              <>
                <Ionicons name="star" color="#fffc" size={18} />
                <Text style={styles.callToActionText}>Start my free week</Text>
              </>
            )}
          </Pressable>

          {/**** footer */}
          <Text style={styles.footer}>Try 7 days free. Cancel anytime.</Text>
          <Text style={styles.footerNote}>
            We will send you a reminder before your trial ends
          </Text>

          <View style={styles.separator} />
          {/**** legal links */}
          <View style={styles.links}>
            <Pressable>
              <Text style={styles.link}>Restore Purchase</Text>
            </Pressable>
            <Pressable>
              <Text style={styles.link}>•</Text>
            </Pressable>
            <Pressable>
              <Text style={styles.link}>Terms of Service</Text>
            </Pressable>
            <Pressable>
              <Text style={styles.link}>•</Text>
            </Pressable>
            <Pressable>
              <Text style={styles.link}>Privacy Policy</Text>
            </Pressable>
          </View>
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );
};

export default Paywall;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 15,
    zIndex: 50,
  },

  gradient: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    top: 0,
  },

  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  close: {
    backgroundColor: "#0005",
    borderRadius: 50,
    padding: 5,
  },

  headerText: {
    flex: 1,
    color: "#fff6d4ec",
    fontSize: 19,
    fontWeight: 800,
    textAlign: "center",
  },

  invisibleFlex: {
    width: 30,
  },

  content: {
    marginTop: 10,
  },

  intro: {
    fontSize: 26,
    color: "#fffc",
    fontWeight: "700",
    textAlign: "center",
    lineHeight: 35,
    marginBottom: 20,
  },

  introUnique: {
    color: "#FFD700",
    fontWeight: "900",
  },

  featureContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    gap: 15,
  },

  feature: {
    backgroundColor: "#04072085",
    paddingVertical: 15,
    paddingHorizontal: 10,
    width: width * 0.43,
    borderRadius: 15,
  },

  featureIcon: {
    backgroundColor: "#cf0a7355",
    borderRadius: 5,
    padding: 10,
    marginBottom: 5,
    marginRight: "auto",
  },

  featureTitle: {
    fontSize: 16,
    color: "#fffe",
    marginBottom: 2,
    fontWeight: "800",
  },

  featureDescription: {
    color: "#fff7",
    fontWeight: "600",
  },

  billing: {
    flexDirection: "row",
    backgroundColor: "#04072085",
    padding: 3,
    gap: 10,
    borderRadius: 15,
    marginVertical: 30,
  },

  billingNav: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    borderRadius: 10,
    paddingVertical: 10,
  },

  billingText: {
    fontSize: 16,
    fontWeight: "900",
  },

  savings: {
    backgroundColor: "limegreen",
    padding: 7,
    borderRadius: 5,
  },

  savingsText: {
    color: "#fff",
    fontSize: 13,
  },

  billingDetails: {
    backgroundColor: "#fffd",
    paddingVertical: 30,
    paddingHorizontal: 20,
    borderRadius: 25,
    marginBottom: 20,
  },

  billingDetailsHeader: {
    backgroundColor: "#cf0a73",
    paddingVertical: 8,
    paddingHorizontal: 15,
    position: "absolute",
    alignSelf: "center",
    top: -15,
    borderRadius: 20,
  },

  billingHeaderText: {
    color: "#fffd",
    fontWeight: "800",
  },

  name: {
    fontSize: 25,
    fontWeight: "900",
    color: "#333c",
  },

  cycle: {
    fontWeight: "300",
    color: "#3337",
    fontSize: 13,
  },

  billDetailsRight: {
    alignItems: "flex-end",
  },

  price: {
    fontSize: 40,
    fontWeight: "700",
    color: "#333e",
  },

  billingFeatures: {
    marginTop: 40,
    gap: 10,
  },

  billingFeature: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },

  billingFeatureText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333c",
  },

  callToAction: {
    backgroundColor: "#cf0a73",
    paddingVertical: 20,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    borderRadius: 50,
    marginBottom: 5,
  },

  callToActionText: { color: "#fffc", fontSize: 16, fontWeight: "800" },

  footer: {
    color: "#fffc",
    textAlign: "center",
    fontWeight: "800",
    fontSize: 13,
  },
  footerNote: {
    fontSize: 12,
    color: "#fffa",
    textAlign: "center",
    marginTop: 5,
    fontWeight: "600",
  },

  separator: {
    height: 2,
    borderRadius: 10,
    backgroundColor: "#fff3",
    marginTop: 20,
    marginBottom: 10,
  },

  links: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  link: {
    color: "#fffa",
  },
});
