import { COURSE_DATA, Lesson } from "@/constants/CourseData";
import { useVoiceStats } from "@/hooks/useVoiceStats";
import { lessonColors } from "@/lib/lessonColorCodes";
import { getAllProgress, getCurrentLesson } from "@/lib/progressStats";
import { Ionicons } from "@expo/vector-icons";
import { router, useFocusEffect } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  Dimensions,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const { width } = Dimensions.get("window");
const Lessons = () => {
  const insets = useSafeAreaInsets();
  const { loading, stats, refresh } = useVoiceStats();
  const lastOffset = useRef(0);
  const direction = useRef("down"); // track scroll direction
  const [progress, setProgress] = useState<Record<string, number>>({});
  const [currentScrollChapter, setCurrentScrollChapter] = useState<number>(1);
  const [currentLesson, setCurrentLesson] = useState<string>(
    COURSE_DATA.chapters[0].lessons[0].id,
  );
  const viewableChapter = COURSE_DATA.chapters[currentScrollChapter - 1];

  useFocusEffect(
    useCallback(() => {
      refresh();
    }, [refresh]),
  );

  useEffect(() => {
    (async () => {
      setProgress(await getAllProgress());
      const lesson = await getCurrentLesson();
      if (lesson) {
        setCurrentLesson(lesson);
      }
    })();
  }, []);

  const onScroll = (e: any) => {
    const currentOffset = e.nativeEvent.contentOffset.y;

    direction.current = currentOffset > lastOffset.current ? "down" : "up";

    lastOffset.current = currentOffset;
  };

  const viewabilityConfig = {
    itemVisiblePercentThreshold: 0.2, // Item is "viewable" if 50% visible
  };

  const onViewableItemsChanged = useRef(({ changed }: { changed: any[] }) => {
    // console.log("changed");
    changed.forEach((item) => {
      if (!item.isViewable && direction.current === "down") {
        console.log(`Item ${item.key} EXITED the scroll view`);
        setCurrentScrollChapter(Number(item.key) + 1);
      }

      if (item.isViewable && direction.current === "up") {
        console.log(`Top edge re-entered: ${item.item.title}`);
        setCurrentScrollChapter(Number(item.key));
      }
    });
  }).current;

  const handleLessonPressed = (lessonId: string) => {
    router.push({ pathname: "/practice", params: { lessonId } });
  };

  const handleReviewLessonPressed = (lessonId: string) => {
    router.push({
      pathname: "/practice",
      params: { lessonId },
    });
  };

  const renderLessonNode = (lesson: Lesson, indexX: number, indexY: number) => {
    const transformStyle = {
      translateX:
        indexY < 0
          ? 0
          : indexX > 2
            ? indexX % 2 === 0
              ? indexY % 2 === 0
                ? -40
                : 40
              : indexY % 2 === 0
                ? -40
                : 40
            : indexX % 2 === 0
              ? indexY % 2 === 0
                ? -40
                : 40
              : indexY % 2 === 0
                ? 40
                : -40,
    };

    return (
      <TouchableOpacity
        activeOpacity={0.8}
        disabled={
          progress[lesson.id] || currentLesson === lesson.id ? false : true
        }
        onPress={() =>
          indexY === -1
            ? handleReviewLessonPressed(lesson.id)
            : handleLessonPressed(lesson.id)
        }
        key={lesson.id}
        style={[
          styles.chapterWrapper,
          styles.lessonWrapper,
          { transform: [transformStyle] },
          {
            backgroundColor:
              progress[lesson.id] || currentLesson === lesson.id
                ? lessonColors[indexX % lessonColors.length].main
                : "#3331",
          },
        ]}
      >
        <Ionicons name={lesson.icon} size={25} color="#fff" />
        <Text style={styles.lessonTitle}>{lesson.title}</Text>
        <View
          style={[
            styles.layer,
            styles.lessonLayer,
            {
              backgroundColor:
                progress[lesson.id] || currentLesson === lesson.id
                  ? lessonColors[indexX % lessonColors.length].shadow
                  : "#3333",
            },
          ]}
        />
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />
      {/**** header */}
      <View style={[styles.header, { paddingTop: insets.top + 15 }]}>
        <Pressable onPress={() => {}} style={styles.right}>
          <Text style={styles.rightTitle}>This week</Text>
          <Text style={styles.subtitle}>In reviews</Text>
        </Pressable>

        <Pressable onPress={() => {}} style={styles.left}>
          <View style={styles.leftUp}>
            <Text style={styles.minutes}>
              {loading ? "-" : Math.ceil(stats?.minutesSpoken ?? 0)}
            </Text>
            <Ionicons name="arrow-up" color="limegreen" size={15} />
            <Text style={styles.minutesUp}>5</Text>
          </View>
          <Text style={styles.subtitle}>minutes spoken</Text>
        </Pressable>

        <Pressable onPress={() => {}} style={styles.left}>
          <View style={styles.leftUp}>
            <Text style={styles.minutes}>
              {loading ? "-" : Math.ceil(stats?.minutesListened ?? 0)}
            </Text>
            <Ionicons name="arrow-up" color="limegreen" size={15} />
            <Text style={styles.minutesUp}>5</Text>
          </View>
          <Text style={styles.subtitle}>minutes listened</Text>
        </Pressable>
      </View>

      {/**** lesson chapters */}
      <View style={styles.content}>
        <View style={styles.chapterHead}>
          <View
            style={[
              styles.chapterWrapper,
              {
                backgroundColor:
                  lessonColors[(currentScrollChapter - 1) % lessonColors.length]
                    .main,
              },
            ]}
          >
            <Text style={styles.chapter}>Chapter {currentScrollChapter}</Text>
            <Text style={styles.chapterTitle}>{viewableChapter.title}</Text>
            <View
              style={[
                styles.layer,
                {
                  backgroundColor:
                    lessonColors[
                      (currentScrollChapter - 1) % lessonColors.length
                    ].shadow,
                },
              ]}
            />
          </View>
        </View>

        <FlatList
          data={COURSE_DATA.chapters}
          keyExtractor={(item, index) => item.id.toString()}
          onScroll={onScroll}
          renderItem={({ item: chapter, index: indexX }) => (
            <View key={chapter.id} style={styles.lessonsContainer}>
              {/**** header */}
              {indexX > 0 && (
                <View style={styles.lessonsHeader}>
                  <View style={styles.lessonChapterWrapper}>
                    <Text style={styles.lessonChapterTitle}>
                      {chapter.title}
                    </Text>
                  </View>
                </View>
              )}

              {/**** lessons */}
              {chapter.lessons.map((lesson, indexY) =>
                renderLessonNode(lesson, indexX, indexY),
              )}
              {chapter.review && renderLessonNode(chapter.review, indexX, -1)}
            </View>
          )}
          viewabilityConfig={viewabilityConfig}
          onViewableItemsChanged={onViewableItemsChanged}
          contentContainerStyle={{
            paddingVertical: 20,
            paddingHorizontal: 30,
          }}
          showsVerticalScrollIndicator={false}
          scrollEventThrottle={16}
          style={styles.lessons}
        />
      </View>
    </View>
  );
};

export default Lessons;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "white",
  },

  header: {
    paddingHorizontal: 20,
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-between",
    paddingBottom: 10,
  },

  right: {},
  rightTitle: {
    fontSize: 24,
    fontFamily: "Inter",
    fontWeight: "800",
    color: "#000d",
  },
  subtitle: {
    color: "#3337",
    fontSize: 13,
    fontWeight: "600",
    fontFamily: "Inter",
  },
  left: { alignItems: "center", flex: 1 },
  leftUp: { flexDirection: "row", alignItems: "center" },
  minutes: {
    fontSize: 22,
    fontWeight: "600",
    fontFamily: "Inter",
  },
  minutesUp: {
    color: "limegreen",
  },

  content: {
    flex: 1,
  },
  chapterHead: {
    paddingHorizontal: 25,
    paddingBottom: 5,
    zIndex: 10,
  },
  chapterWrapper: {
    padding: 15,
    position: "relative",
    borderRadius: 15,
  },

  chapter: {
    color: "#fffa",
    fontFamily: "Inter",
    fontWeight: "bold",
    fontSize: 14,
    textTransform: "uppercase",
  },

  chapterTitle: {
    color: "#fffe",
    fontSize: 20,
    fontWeight: "900",
    fontFamily: "Inter",
  },

  layer: {
    borderRadius: 15,
    position: "absolute",
    bottom: -5,
    left: 0,
    right: 0,
    top: 0,
    zIndex: -1,
  },
  lessons: {},
  lessonsContainer: {
    paddingBottom: 30,
  },

  lessonsHeader: {
    marginBottom: 50,
    backgroundColor: "#3332",
    height: 1.5,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 10,
  },

  lessonChapterWrapper: {
    position: "absolute",
    backgroundColor: "#fff",
    paddingHorizontal: 15,
  },

  lessonChapterTitle: {
    fontSize: 14,
    fontFamily: "Inter",
    color: "#3339",
  },

  lessonWrapper: {
    marginBottom: 30,
    marginHorizontal: "auto",
    minWidth: width * 0.45,
    borderRadius: 50,
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },

  lessonTitle: {
    color: "#fffe",
    fontSize: 14,
    fontFamily: "Inter",
    fontWeight: "bold",
  },
  lessonLayer: {
    borderRadius: 50,
    bottom: -8,
  },
});
