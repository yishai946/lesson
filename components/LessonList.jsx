import { StyleSheet, Text, View } from "react-native";
import React from "react";
import Lesson from "./Lesson";

const LessonsList = ({ lessons, openOptions, withOptions = true }) => {
  return (
    <View style={styles.container}>
      {lessons.map((item, index) => (
        <Lesson key={index} lesson={item} openOptions={openOptions} withOptions={withOptions} />
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
