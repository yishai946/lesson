import {
  StyleSheet,
  Text,
  View,
  Dimensions,
  TouchableOpacity,
} from "react-native";
import React from "react";
import { useAppContext } from "../context/appContext";

const width = Dimensions.get("window").width;

const Report = () => {
  const { checkLesson, toReport } = useAppContext();

  // Create a transformed version of toReport
  const formattedToReport = toReport.map((item) => ({
    ...item,
    formattedDate: item.date.toDate().toISOString().split("T")[0],
    formattedStartTime: item.startTime
      .toDate()
      .toLocaleTimeString()
      .split(":")
      .slice(0, 2)
      .join(":"),
  }));

  return (
    <View>
      <View
        style={{
          display: "flex",
          flexDirection: "row",
          alignItems: "center",
          marginTop: 30,
        }}
      >
        <Text style={styles.header}>Report</Text>
      </View>
      <View style={styles.container}>
        {formattedToReport.length > 0 ? (
          formattedToReport.map((item, index) => (
            <View
              style={
                index === formattedToReport.length - 1
                  ? { ...styles.item, borderBottomWidth: 0 }
                  : styles.item
              }
              key={index}
            >
              <TouchableOpacity onPress={() => checkLesson(item.id)}>
                <Feather name="minus-square" size={24} color="black" />
              </TouchableOpacity>
              <Text>
                {item.formattedDate} | {item.formattedStartTime}
              </Text>
              <Text style={{ fontWeight: "bold" }}>{item.studentName}</Text>
            </View>
          ))
        ) : (
          <Text style={{ textAlign: "center", margin: 20 }}>
            No lessons to report
          </Text>
        )}
      </View>
    </View>
  );
};

export default Report;

const styles = StyleSheet.create({
  container: {
    borderWidth: 1,
    width: width * 0.9,
    borderColor: "#c2c2c2",
    display: "flex",
    borderRadius: 20,
    marginVertical: 10,
  },
  header: {
    fontSize: 20,
    fontWeight: "bold",
    alignSelf: "flex-start",
    margin: 10,
  },
  item: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-between",
    borderBottomWidth: 1,
    borderColor: "#c2c2c2",
    padding: 30,
  },
});
