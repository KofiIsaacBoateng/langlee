import AsyncStorage from "@react-native-async-storage/async-storage";

const MINUTES_PER_QUESTION = 0.5;
const MINUTES_PER_CONVERSATION_TURN = 1;
const KEY = "voice_stats";

export interface VoiceStats {
  minutesSpoken: number;
  minutesListened: number;
  lastUpdated: string;
  questionsAnswered: number;
  questionsListened: number;
  conversationTurns: number;
}

export const getDefaultStats = (): VoiceStats => ({
  minutesSpoken: 0,
  minutesListened: 0,
  lastUpdated: new Date().toISOString(),
  questionsAnswered: 0,
  questionsListened: 0,
  conversationTurns: 0,
});

export const readStats = async (): Promise<VoiceStats> => {
  try {
    const rawStats = await AsyncStorage.getItem(KEY);

    if (!rawStats) {
      return getDefaultStats();
    }

    return JSON.parse(rawStats) as VoiceStats;
  } catch (error) {
    console.error("reading voice stats error: ", error);
    return getDefaultStats();
  }
};

export const writeStats = async (data: VoiceStats): Promise<void> => {
  await AsyncStorage.setItem(KEY, JSON.stringify(data));
};

export const recordQuestionAnswered = async () => {
  const stats = await readStats();
  stats.questionsAnswered += 1;
  stats.minutesSpoken = stats.questionsAnswered * MINUTES_PER_QUESTION;
  stats.lastUpdated = new Date().toISOString();
  await writeStats(stats);
};

export const recordQuestionListened = async () => {
  const stats = await readStats();
  stats.questionsListened += 1;
  stats.minutesListened = stats.questionsListened * MINUTES_PER_QUESTION;
  stats.lastUpdated = new Date().toISOString();
  await writeStats(stats);
};

export const recordConversationTurn = async () => {
  const stats = await readStats();
  stats.conversationTurns += 1;

  stats.minutesSpoken += MINUTES_PER_CONVERSATION_TURN;
  stats.minutesListened += MINUTES_PER_CONVERSATION_TURN;
  stats.lastUpdated = new Date().toISOString();
  await writeStats(stats);
};

export const getWeeklyStats = async () => {
  const stats = await readStats();

  return {
    minutesSpoken: Math.round(stats.minutesSpoken * 10) / 10,
    minutesListened: Math.round(stats.minutesListened * 10) / 10,
    weeklyChange: {
      spoken: 0,
      listened: 0,
    },
  };
};
