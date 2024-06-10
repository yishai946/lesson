import {
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  TouchableWithoutFeedback,
  Keyboard,
  Platform,
  View,
  Dimensions,
  ActivityIndicator,
  Alert,
} from "react-native";
import React, { useState } from "react";
import Auth from "../functions/Auth";
import { useAppContext } from "../context/appContext";
import Input from "../components/Input";
import Background from "../components/BackgroundImage";

const windowWidth = Dimensions.get("window").width;

const Login = ({ navigation }) => {
  const { loading, setLoading, setUser } = useAppContext();
  const [userObj, setUserObj] = useState({ email: "", password: "" });

  const change = (text, name) => {
    switch (name) {
      case "email":
        setUserObj({ ...userObj, email: text });
        break;
      case "password":
        setUserObj({ ...userObj, password: text });
        break;
      default:
        break;
    }
  };

  const login = async () => {
    try {
      setLoading(true);
      const res = await Auth.login(userObj, setUser);
      if (res.code === "auth/invalid-login-credentials") {
        throw new Error("Invalid email or password. Please try again.");
      }
    } catch (error) {
      console.error(error);
      Alert.alert(error.message);
    } finally {
      setLoading(false);
    }
  };

  return loading ? (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      <ActivityIndicator color="black" />
    </View>
  ) : (
    // <Background>
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
        <View style={styles.innerContainer}>
          <Text style={styles.header}>Login</Text>
          <Input value={userObj.email} name="email" change={change} />
          <Input
            value={userObj.password}
            name="password"
            change={change}
            secureTextEntry={true}
          />
          <TouchableOpacity
            onPress={login}
            style={{
              ...styles.button,
              backgroundColor: "royalblue",
            }}
          >
            <Text style={{ fontSize: 16, color: "white" }}>Login</Text>
          </TouchableOpacity>
          <Text style={{ margin: 10 }}>Don't have an account?</Text>
          <TouchableOpacity onPress={() => navigation.navigate("Signup")}>
            <Text style={{ color: "royalblue" }}>Sign Up</Text>
          </TouchableOpacity>
        </View>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
    // </Background>
  );
};

export default Login;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  innerContainer: {
    width: windowWidth,
    alignItems: "center",
  },
  header: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 40,
  },
  button: {
    alignItems: "center",
    backgroundColor: "#DDDDDD",
    width: "40%",
    borderRadius: 20,
    padding: 15,
    margin: 10,
  },
});
