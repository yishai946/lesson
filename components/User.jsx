import {
  StyleSheet,
  Text,
  View,
  Dimensions,
  TouchableOpacity,
} from "react-native";
import React from "react";
import { Entypo } from "@expo/vector-icons";

const width = Dimensions.get("window").width;

const Student = ({ item, teacher }) => {
  return (
    item && (
      <View style={styles.container}>
        {/* <TouchableOpacity
          style={styles.dots}
          onPress={() => openOptions(item)}
        >
          <Entypo name="dots-three-horizontal" size={24} color="black" />
        </TouchableOpacity> */}
        <Text style={styles.name}>{item.user.username}</Text>
        <View style={{ gap: 10 }}>
          {teacher && (
            <>
              <View style={styles.row}>
                <Text>HOURS</Text>
                <Text>{item.hours}</Text>
              </View>
              <View style={styles.row}>
                <Text>ID</Text>
                <Text>{item.user.id}</Text>
              </View>
              <View style={styles.row}>
                <Text>STUDY</Text>
                <Text>{item.user.study}</Text>
              </View>
            </>
          )}
          <View style={styles.row}>
            <Text>PHONE</Text>
            <Text>{item.user.phone}</Text>
          </View>
          <View style={styles.row}>
            <Text>SUBJECT</Text>
            <Text>{item.subject}</Text>
          </View>
        </View>
      </View>
    )
  );
};

export default Student;

const styles = StyleSheet.create({
  container: {
    borderWidth: 1,
    width: width * 0.9,
    borderColor: "#c2c2c2",
    paddingVertical: 30,
    display: "flex",
    borderRadius: 20,
    marginVertical: 10,
  },
  name: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 20,
    alignSelf: "center",
  },
  row: {
    display: "flex",
    width: "100%",
    paddingHorizontal: 20,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  dots: {
    position: "absolute",
    right: 15,
    top: 10,
  },
});
