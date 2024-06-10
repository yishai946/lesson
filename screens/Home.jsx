import { StyleSheet, Text, ScrollView } from "react-native";
import React, { useEffect, useState } from "react";
import { useAppContext } from "../context/appContext";
import Total from "../components/Total";
import Report from "../components/Report";
import LessonsList from "../components/LessonList";

const Home = () => {
  const { user, lessons } = useAppContext();
  const [toReport, setToReport] = useState([]);
  const [lessonsToday, setLessonsToday] = useState([]);
  const now = React.useRef(new Date()).current;

  useEffect(() => {
    const filtered = lessons.filter((item) => {
      // convert date string "yyyy-mm-dd" to date object
      const date = new Date(item.date);
      return date < now && !item.done;
    });

    // filter lesson of today
    const filtered2 = lessons.filter((item) => {
      // convert date string "yyyy-mm-dd" to date object
      const date = new Date(item.date);
      return date.toDateString() === now.toDateString();
    });

    setToReport(filtered);
    setLessonsToday(filtered2);
  }, [lessons, now]);

  return (
    <ScrollView
      contentContainerStyle={{ display: "flex", alignItems: "center" }}
    >
      <Total hours={user.hours} money={user.money} />
      <Report lessons={toReport} />
      <LessonsList lessons={lessonsToday} />
    </ScrollView>
  );
};

export default Home;

const styles = StyleSheet.create({});
