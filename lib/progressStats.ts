import AsyncStorage from "@react-native-async-storage/async-storage";

const KEY = "lesson_progress";

export interface LessonProgress {
  [lessonId: string]: number;
}

export interface ActiveLesson {
  [lessonId: string]: string;
}

export const readProgress = async (): Promise<LessonProgress> => {
  try {
    const rawProgress = await AsyncStorage.getItem(KEY);

    if (!rawProgress) {
      return {};
    }

    return JSON.parse(rawProgress) as LessonProgress;
  } catch (error) {
    console.error("reading lesson progress: ", error);
    return {};
  }
};

export const writeProgress = async (data: LessonProgress): Promise<void> => {
  await AsyncStorage.setItem(KEY, JSON.stringify(data));
};

export const incrementLessonCompletion = async (lessonId: string) => {
  const progress = await readProgress();
  progress[lessonId] = (progress[lessonId] || 0) + 1;
  await writeProgress(progress);
};

export const getAllProgress = async (): Promise<LessonProgress> => {
  return await readProgress();
};

export const getCurrentLesson = async (): Promise<string> => {
  try {
    const lesson = await AsyncStorage.getItem("current-lesson");
    if (!lesson) {
      return "";
    }

    return lesson;
  } catch (error) {
    console.log("Error getting active lesson: ", error);
    return "";
  }
};

export const setCurrentLesson = async (lessonId: string): Promise<void> => {
  await AsyncStorage.setItem("current-lesson", lessonId);
};
