import React from "react";
import { Text, View } from "react-native";
import Lesson from "./Lesson";


const LessonsList = ({ lessons, openOptions, withOptions = true }) => {
  return (
    <View>
      {lessons.length > 0 ? (
        lessons.map((item, index) => (
          <Lesson
            key={index}
            lesson={item}
            openOptions={openOptions}
            withOptions={withOptions}
          />
        ))
      ) : (
        <Text style={{ textAlign: "center", margin: 20 }}>No lessons</Text>
      )}
    </View>
  );
};

export default LessonsList;