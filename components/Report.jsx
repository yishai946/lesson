import {
  StyleSheet,
  Text,
  View,
  Dimensions,
  TouchableOpacity,
} from "react-native";
import React from "react";
import { Ionicons, Feather } from "@expo/vector-icons";
import * as Linking from "expo-linking";
import { useAppContext } from "../context/appContext";

const width = Dimensions.get("window").width;
const url =
  "https://docs.google.com/forms/d/e/1FAIpQLScITsuaUkNsQTjMwwG-Xtml4i4o28L0EyAw6THEbgLOO_qSPQ/viewform?pli=1&pli=1";

const Report = ({ lessons }) => {
  const { checkLesson } = useAppContext();

  const link = () => {
    Linking.openURL(url);
  };

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
        <TouchableOpacity onPress={link}>
          <Ionicons name="arrow-forward" size={24} color="royalblue" />
        </TouchableOpacity>
      </View>
      <View style={styles.container}>
        {lessons.map((item, index) => (
          <View
            style={
              index == lessons.length - 1
                ? { ...styles.item, borderBottomWidth: 0 }
                : styles.item
            }
            key={index}
          >
            <TouchableOpacity onPress={() => checkLesson(item.id)}>
              <Feather name="minus-square" size={24} color="black" />
            </TouchableOpacity>
            <Text>
              {item.date} | {item.startTime}
            </Text>
            <Text style={{ fontWeight: "bold" }}>{item.studentName}</Text>
          </View>
        ))}
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
