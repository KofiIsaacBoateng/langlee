import LessonContent from "@/components/lessons/LessonContent";
import VocabularyPractice from "@/components/lessons/VocabularyPractice";
import { COURSE_DATA } from "@/constants/CourseData";
import { Redirect, useLocalSearchParams } from "expo-router";
import React, { useState } from "react";
import { StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const Practice = () => {
  const insets = useSafeAreaInsets();
  const { lessonId } = useLocalSearchParams<{ lessonId: string }>();
  const [isStudyingVocabs, setIsStudyingVocabs] = useState<boolean>(true);

  const allLessons = COURSE_DATA.chapters.flatMap((c) =>
    c.review ? [...c.lessons, c.review] : c.lessons,
  );
  const currentLesson = allLessons.find((l) => l.id === lessonId);
  const questions = currentLesson ? currentLesson.questions : [];

  if (questions.length === 0) {
    return <Redirect href={"/(tabs)/lessons"} />;
  }

  if (isStudyingVocabs) {
    return (
      <VocabularyPractice
        questions={questions}
        onStartLesson={() => setIsStudyingVocabs(false)}
      />
    );
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/**** Lesson content */}
      <LessonContent questions={questions} lessonId={lessonId} />
    </View>
  );
};

export default Practice;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
