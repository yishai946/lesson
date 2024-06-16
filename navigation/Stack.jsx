import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { onAuthStateChanged } from "firebase/auth";
import React, { useEffect } from "react";
import { StatusBar } from "react-native";
import { useAppContext } from "../context/appContext";
import { auth } from "../firebaseConfig";
import Login from "../screens/Login";
import Signup from "../screens/SIgnupPage";
import Tabs from "./Tabs";
import Auth from "../functions/Auth";

const stack = createNativeStackNavigator();

const Stack = () => {
  const { user, setUser, loading, setLoading } = useAppContext();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      try {
        if (user) {
          setUser(await Auth.getData(user.uid));
        } else {
          if (loading) {
            setLoading(false);
          }
          setUser(null);
        }
      } catch (e) {
        console.error(e);
      } finally {
        if (loading) {
          setLoading(false);
        }
      }
    });
    return unsubscribe;
  }, []);

  return (
    <NavigationContainer>
      <StatusBar barStyle="dark-content" backgroundColor="white" />

      {user ? (
        <stack.Navigator screenOptions={{ headerShown: false }}>
          <stack.Screen name="Tabs" component={Tabs} />
        </stack.Navigator>
      ) : (
        <stack.Navigator
          initialRouteName="Login"
          screenOptions={{ headerShown: false }}
        >
          <stack.Screen name="Login" component={Login} />
          <stack.Screen name="Signup" component={Signup} />
        </stack.Navigator>
      )}
    </NavigationContainer>
  );
};

export default Stack;
