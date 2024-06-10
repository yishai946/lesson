import { StyleSheet, Text, View, TextInput } from "react-native";
import React from "react";

const Input = ({ value, name, change, secureTextEntry = false }) => {
  return (
    <>
      <Text>{name}</Text>
      <TextInput
        style={styles.input}
        secureTextEntry={secureTextEntry}
        onChangeText={(text) => {
          change(text, name);
        }}
        value={value}
      />
    </>
  );
};

export default Input;

const styles = StyleSheet.create({
  input: {
    width: "80%",
    padding: 10,
    margin: 10,
    borderWidth: 1,
    borderColor: "black",
    borderRadius: 14,
    marginBottom: 20,
    textAlign: "left",
    borderWidth: 1,
  },
});
