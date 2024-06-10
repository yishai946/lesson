import { StyleSheet, Text, View, Dimensions } from "react-native";
import React from "react";

const width = Dimensions.get("window").width;

const Total = ({ hours, money }) => {
  const progress = parseInt((hours / 80) * 100);

  return (
    <View>
      <Text style={styles.header}>Totals</Text>
      <View style={styles.container}>
        <View style={styles.dataContainer}>
          <View style={styles.col}>
            <Text style={styles.subHeader}>Hours</Text>
            <Text style={{ fontSize: 16 }}>{hours}</Text>
          </View>
          <View style={styles.col}>
            <Text style={styles.subHeader}>Money</Text>
            <Text style={{ fontSize: 16 }}>{money} ₪</Text>
          </View>
        </View>
        {/* progress bar */}
        <Text style={{ alignSelf: "center", marginVertical: 10 }}>
          {progress}%
        </Text>
        <View style={styles.backgroundBar}>
          <View
            style={{
              backgroundColor: "green",
              borderRadius: 20,
              height: 20,
              width: `${progress}%`,
            }}
          />
        </View>
      </View>
    </View>
  );
};

export default Total;

const styles = StyleSheet.create({
  container: {
    width: width * 0.9,
    display: "flex",
    marginVertical: 10,
  },
  backgroundBar: {
    backgroundColor: "lightgrey",
    borderRadius: 20,
    height: 20,
    width: "100%",
  },
  dataContainer: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-around",
    marginTop: 15,
    marginBottom: 35,
  },
  subHeader: {
    fontSize: 20,
    alignSelf: "center",
    color: "#297920",
  },
  header: {
    fontSize: 20,
    fontWeight: "bold",
    alignSelf: "flex-start",
    margin: 10,
    marginTop: 30,
  },
  col: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: 10,
  },
});
