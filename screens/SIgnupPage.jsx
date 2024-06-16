import { MaterialIcons, AntDesign } from "@expo/vector-icons";
import { Image } from "expo-image";
import * as ImagePicker from "expo-image-picker";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Dimensions,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
  Alert,
} from "react-native";
import Input from "../components/Input";
import { useAppContext } from "../context/appContext";
import Auth from "../functions/Auth";

const windowWidth = Dimensions.get("window").width;

const Signup = ({ navigation }) => {
  const { loading, setLoading, setUser } = useAppContext();
  const [userObj, setUserObj] = useState({
    email: "",
    password: "",
    role: "",
    username: "",
    phone: "",
    id: "",
    study: "",
    image: "https://tinyurl.com/2pxxfxb6",
  });

  const change = (text, name) => {
    switch (name) {
      case "email":
        setUserObj({ ...userObj, email: text });
        break;
      case "password":
        setUserObj({ ...userObj, password: text });
        break;
      case "username":
        setUserObj({ ...userObj, username: text });
        break;
      case "phone":
        setUserObj({ ...userObj, phone: text });
        break;
      case "id":
        setUserObj({ ...userObj, id: text });
        break;
      case "study":
        setUserObj({ ...userObj, study: text });
        break;
      case "Re-enter password":
        setUserObj({ ...userObj, check: text });
        break;
    }
  };

  const signup = async () => {
    try {
      setLoading(true);
      res = await Auth.signup(userObj, setUser);
      switch (res.code) {
        case "auth/email-already-in-use":
          throw new Error("Email already in use. Please try again.");
        case "auth/weak-password":
          throw new Error("Password is too weak. Please try again.");
        case "auth/invalid-email":
          throw new Error("Invalid email. Please try again.");
      }
    } catch (error) {
      console.error(error);
      Alert.alert(error.message);
    } finally {
      setLoading(false);
    }
  };

  const pickImage = async () => {
    // No permissions request is necessary for launching the image library
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.All,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled) {
      res = result.assets[0].uri;
      setUserObj({ ...userObj, image: res });
    }
  };

  const move = (role) => {
    if (userObj.email == "" || userObj.password == "" || userObj.check == "") {
      Alert.alert("Please fill in all fields");
      return;
    }
    if (userObj.password != userObj.check) {
      Alert.alert("Passwords do not match");
      return;
    }
    if (role == "student") setUserObj({ ...userObj, role: "student" });
    else setUserObj({ ...userObj, role: "teacher" });
  };

 return loading ? (
   <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
     <ActivityIndicator color="black" />
   </View>
 ) : userObj.role === "" ? (
   <KeyboardAvoidingView
     style={styles.container}
     behavior={Platform.OS === "ios" ? "padding" : "height"}
   >
     <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
       <View style={styles.innerContainer}>
         <Text style={styles.header}>Sign Up</Text>
         {/* profile image */}
         <TouchableOpacity onPress={pickImage}>
           <Image source={{ uri: userObj.image }} style={styles.profile} />
         </TouchableOpacity>
         {userObj.image !== "https://tinyurl.com/2pxxfxb6" && (
           <TouchableOpacity
             style={{ margin: 20 }}
             onPress={() =>
               setUserObj({
                 ...userObj,
                 image: "https://tinyurl.com/2pxxfxb6",
               })
             }
           >
             <MaterialIcons name="delete" size={24} color="black" />
           </TouchableOpacity>
         )}
         {/* email */}
         <Input value={userObj.email} name={"email"} change={change} />
         {/* password */}
         <Input
           value={userObj.password}
           name={"password"}
           change={change}
           secureTextEntry={true}
         />
         <Input
           value={userObj.check}
           name={"Re-enter password"}
           change={change}
           secureTextEntry={true}
         />
         {/* choose a role */}
         <View style={{ display: "flex", flexDirection: "row-reverse" }}>
           <TouchableOpacity
             style={{ ...styles.button, backgroundColor: "royalblue" }}
             onPress={() => move("student")}
           >
             <Text style={{ color: "white", fontSize: 16 }}>Student</Text>
           </TouchableOpacity>
           <TouchableOpacity
             style={styles.button}
             onPress={() => move("teacher")}
           >
             <Text style={{ fontSize: 16 }}>Teacher</Text>
           </TouchableOpacity>
         </View>
         {/* return to login */}
         <Text style={{ margin: 10 }}>Already have an account?</Text>
         <TouchableOpacity onPress={() => navigation.navigate("Login")}>
           <Text style={{ color: "royalblue" }}>Login</Text>
         </TouchableOpacity>
       </View>
     </TouchableWithoutFeedback>
   </KeyboardAvoidingView>
 ) : (
   <KeyboardAvoidingView
     style={styles.container}
     behavior={Platform.OS === "ios" ? "padding" : "height"}
   >
     <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
       <View style={styles.innerContainer}>
         {/* change role */}
         <TouchableOpacity
           style={{ ...styles.button, marginBottom: 40 }}
           onPress={() => setUserObj({ ...userObj, role: "" })}
         >
           <AntDesign name="closecircle" size={20} color="black" />
           <Text style={styles.header}>{userObj.role}</Text>
         </TouchableOpacity>
         {/* username */}
         <Input value={userObj.username} name={"username"} change={change} />
         {/* phone */}
         <Input value={userObj.phone} name={"phone"} change={change} />
         {/* id */}
         <Input value={userObj.id} name={"id"} change={change} />
         {/* study */}
         <Input value={userObj.study} name={"study"} change={change} />
         {/* signup button */}
         <TouchableOpacity
           onPress={signup}
           style={{
             ...styles.button,
             backgroundColor: "royalblue",
           }}
         >
           <Text style={{ fontSize: 16, color: "white" }}>Sign Up</Text>
         </TouchableOpacity>
       </View>
     </TouchableWithoutFeedback>
   </KeyboardAvoidingView>
 );

};

export default Signup;

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
  },
  button: {
    display: "flex",
    flexDirection: "row",
    gap: 10,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#DDDDDD",
    width: "40%",
    borderRadius: 20,
    padding: 15,
    margin: 10,
  },
  profile: {
    width: 100,
    height: 100,
    borderRadius: 50,
    margin: 20,
  },
});
