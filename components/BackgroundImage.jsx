import { StyleSheet, Text, View, ImageBackground } from "react-native";
import React from "react";

const Background = ({ empty = false, children }) => {
  return (
    <ImageBackground
      source={
        empty
          ? require("../assets/splash2.png")
          : require("../assets/splash.png")
      }
      style={styles.backgroundImage}
    >
      {children}
    </ImageBackground>
  );
};

export default Background;

const styles = StyleSheet.create({
  backgroundImage: {
    flex: 1,
    resizeMode: "cover",
    justifyContent: "center",
  },
});
