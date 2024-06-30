import { StyleSheet, View, ScrollView, ActivityIndicator } from "react-native";
import React, { useEffect, useState } from "react";
import { useAppContext } from "../context/appContext";
import Total from "../components/Total";
import Report from "../components/Report";
import LessonsList from "../components/LessonList";

const Home = () => {
  const { user, lessons, hours, loading } = useAppContext();
  const [lessonsToday, setLessonsToday] = useState([]);
  const now = React.useRef(new Date()).current;

  useEffect(() => {
    // filter lesson of today
    const filtered = lessons.filter((item) => {
      // convert date string "yyyy-mm-dd" to date object
      const date = new Date(item.date);
      return date.toDateString() === now.toDateString();
    });

    setLessonsToday(filtered);
  }, [lessons, now]);

  return loading ? (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      <ActivityIndicator color="royalblue" />
    </View>
  ) : (
    <ScrollView
      contentContainerStyle={{ display: "flex", alignItems: "center" }}
    >
      {user && user.role == "teacher" && (
        <>
          <Total hours={hours} />
          <Report />
        </>
      )}
      <LessonsList lessons={lessonsToday} withOptions={false} />
    </ScrollView>
  );
};

export default Home;

const styles = StyleSheet.create({});
