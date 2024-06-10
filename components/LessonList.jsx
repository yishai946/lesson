import { StyleSheet, Text, View } from "react-native";
import React from "react";
import Lesson from "./Lesson";

const LessonsList = ({ lessons }) => {
  return (
    <View style={styles.container}>
      <Text style={styles.header}>Today</Text>
      {lessons.map((item, index) => (
        <Lesson key={index} lesson={item} />
      ))}
    </View>
  );
};

export default LessonsList;

const styles = StyleSheet.create({
  header: {
    fontSize: 20,
    fontWeight: "bold",
    alignSelf: "flex-start",
    margin: 10,
    marginTop: 30,
  },
  container: {
    display: "flex",
    alignItems: "center",
  },
});
