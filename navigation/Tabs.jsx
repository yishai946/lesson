import {
  MaterialCommunityIcons,
  AntDesign,
  MaterialIcons,
} from "@expo/vector-icons";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import React from "react";
import Home from "../screens/Home";
import Assignments from "../screens/Assignments";
import CalendarPage from "../screens/CalendarPage";
import { TouchableOpacity } from "react-native";
import { useAppContext } from "../context/appContext";
import Auth from "../functions/Auth";
import HomeStudent from "../screens/HomeStudent";

const Tab = createBottomTabNavigator();

const Tabs = () => {
  const { setModalVisible, user, setUser } = useAppContext();

  const isTeacher = user && user.role == "teacher";

  return (
    <Tab.Navigator>
      <Tab.Screen
        name="Home"
        component={isTeacher ? Home : HomeStudent}
        options={{
          tabBarLabel: "Home",
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="home" color={color} size={size} />
          ),
          headerRight: () => (
            <TouchableOpacity
              style={{ marginRight: 15 }}
              onPress={() => {
                Auth.logout();
                setUser(null);
              }}
            >
              <MaterialIcons name="logout" size={24} color="black" />
            </TouchableOpacity>
          ),
        }}
      />

      <Tab.Screen
        name="Calendar"
        component={CalendarPage}
        options={{
          tabBarLabel: "Calendar",
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="calendar" color={color} size={size} />
          ),
          ...(isTeacher && {
            headerRight: () => (
              <TouchableOpacity
                style={{ marginRight: 15 }}
                onPress={() => setModalVisible(true)}
              >
                <AntDesign name="pluscircle" size={24} color="royalblue" />
              </TouchableOpacity>
            ),
          }),
        }}
      />

      <Tab.Screen
        name="Assignments"
        component={Assignments}
        options={{
          tabBarLabel: isTeacher ? "Students" : "Teachers",
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons
              name="account-group"
              color={color}
              size={size}
            />
          ),
        }}
      />
    </Tab.Navigator>
  );
};

export default Tabs;
