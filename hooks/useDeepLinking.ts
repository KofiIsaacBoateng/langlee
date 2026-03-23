import { supabase } from "@/utils/supabase";
import * as QueryParams from "expo-auth-session/build/QueryParams";
import * as Linking from "expo-linking";
import { useEffect } from "react";
import { toast } from "sonner-native";

const createSessionFromUrl = async (url: string) => {
  const { params, errorCode } = QueryParams.getQueryParams(url);

  if (errorCode) {
    console.error("Error code thrown by queryParams: ", errorCode);
    throw new Error(errorCode);
  }

  const { access_token, refresh_token } = params;

  if (!access_token) return;

  const { data, error } = await supabase.auth.setSession({
    access_token,
    refresh_token,
  });

  if (error) {
    console.log("Failed to set session: ", error);
    throw error;
  }

  return data.session;
};

export const useDeepLinking = () => {
  const url = Linking.useLinkingURL();

  useEffect(() => {
    if (url) {
      createSessionFromUrl(url)
        .then((session) => {
          console.log("session created from deeplinking");
        })
        .catch((error) => {
          console.error("Error creating session from url: ", error);
          toast.error("Sign in failed! Please try again later!");
        });
    }
  }, [url]);
};
