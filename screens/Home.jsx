import {
  StyleSheet,
  View,
  ScrollView,
  ActivityIndicator,
  Text,
} from "react-native";
import React, { useEffect, useState } from "react";
import { useAppContext } from "../context/appContext";
import Total from "../components/Total";
import Report from "../components/Report";
import LessonsList from "../components/LessonList";

const Home = () => {
  const { user, lessons, hours, loading } = useAppContext();
  const [lessonsNextWeek, setLessonsNextWeek] = useState([]);

  useEffect(() => {
    // Calculate dates for now and next week (only date without time)
    const now = new Date();
    now.setHours(0, 0, 0, 0); // Set to beginning of the current day
    const nextWeek = new Date(now);
    nextWeek.setDate(nextWeek.getDate() + 7); // Set to beginning of next week

    // Filter lessons within the next week based on date only
    const filteredLessons = lessons.filter((lesson) => {
      const lessonDate = lesson.date.toDate();
      lessonDate.setHours(0, 0, 0, 0); // Set to beginning of the lesson date
      return lessonDate >= now && lessonDate <= nextWeek;
    });

    // Sort lessons by date (ascending order)
    filteredLessons.sort((a, b) => a.date.toDate() - b.date.toDate());

    setLessonsNextWeek(filteredLessons);
  }, [lessons]);

  return loading ? (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      <ActivityIndicator color="royalblue" />
    </View>
  ) : (
    <ScrollView contentContainerStyle={{ alignItems: "center" }}>
      {user && user.role === "teacher" && (
        <>
          <Total hours={hours} />
          <Report />
        </>
      )}

      <View>
        <Text style={styles.header}>This Week</Text>
        <LessonsList lessons={lessonsNextWeek} withOptions={false} />
      </View>
    </ScrollView>
  );
};

export default Home;

const styles = StyleSheet.create({
  header: {
    fontSize: 20,
    fontWeight: "bold",
    alignSelf: "flex-start",
    margin: 10,
    marginTop: 20,
  },
});
