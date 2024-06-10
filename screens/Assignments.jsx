import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import Modal from "react-native-modal";
import User from "../components/User";
import { useAppContext } from "../context/appContext";

const Assignments = () => {
  const { loading, userAssignments } = useAppContext();

  // const [newStudent, setNewStudent] = useState({});
  // const [optionsOpen, setOptionsOpen] = useState(false);

  // const add = async () => {
  //   try {
  //     if (
  //       newStudent.name &&
  //       newStudent.hours &&
  //       newStudent.id &&
  //       newStudent.study &&
  //       newStudent.phone
  //     ) {
  //       setLoading(true);
  //       closeModal();
  //       await addStudent(newStudent);
  //     } else {
  //       Alert.alert("Please fill all the fields");
  //     }
  //   } catch (e) {
  //     console.log(e);
  //   } finally {
  //     setLoading(false);
  //   }
  // };

  // const handleDelete = async () => {
  //   try {
  //     setLoading(true);
  //     setModalVisible(false);
  //     await deleteStudent(newStudent.id);
  //     closeModal();
  //   } catch (e) {
  //     console.log(e);
  //   } finally {
  //     setLoading(false);
  //   }
  // };

  // const openOptions = (student) => {
  //   setNewStudent(student);
  //   setOptionsOpen(true);
  //   setModalVisible(true);
  // };

  // const closeModal = () => {
  //   setModalVisible(false);
  //   setNewStudent({});
  //   setOptionsOpen(false);
  // };

  return (
    <>
      {loading ? (
        <View
          style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
        >
          <ActivityIndicator />
        </View>
      ) : (
        <FlatList
          contentContainerStyle={styles.container}
          data={userAssignments}
          keyExtractor={(item) => item.user.docId}
          renderItem={({ item }) => (
            <User item={item} />
          )}
        />
      )}

      {/* {modalVisible && (
        <Modal
          isVisible={modalVisible}
          onBackdropPress={closeModal}
          style={styles.modal}
          propagateSwipe={true}
        >
          <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            style={styles.modalContainer}
          >
            <TextInput
              style={styles.input}
              placeholder="Name"
              placeholderTextColor="gray"
              value={newStudent.name}
              onChangeText={(text) =>
                setNewStudent({ ...newStudent, name: text })
              }
            />
            <TextInput
              style={styles.input}
              placeholder="Hours"
              keyboardType="numeric"
              placeholderTextColor="gray"
              value={newStudent.hours ? newStudent.hours.toString() : ""}
              onChangeText={(text) =>
                setNewStudent({ ...newStudent, hours: parseFloat(text) })
              }
            />
            <TextInput
              style={styles.input}
              placeholder="ID"
              keyboardType="numeric"
              placeholderTextColor="gray"
              value={newStudent.id}
              onChangeText={(text) =>
                setNewStudent({ ...newStudent, id: text })
              }
              editable={!optionsOpen}
            />
            <TextInput
              style={styles.input}
              placeholder="Phone"
              keyboardType="numeric"
              placeholderTextColor="gray"
              value={newStudent.phone}
              onChangeText={(text) =>
                setNewStudent({ ...newStudent, phone: text })
              }
            />
            <TextInput
              style={styles.input}
              placeholder="Study"
              placeholderTextColor="gray"
              value={newStudent.study}
              onChangeText={(text) =>
                setNewStudent({ ...newStudent, study: text })
              }
            />
            <View style={styles.modalButtonsContainer}>
              {!optionsOpen ? (
                <TouchableOpacity
                  onPress={() => setNewStudent({})}
                  style={{
                    ...styles.modalButton,
                    backgroundColor: "#e1e1e1",
                  }}
                >
                  <Text>Clear</Text>
                </TouchableOpacity>
              ) : (
                <TouchableOpacity
                  onPress={handleDelete}
                  style={{
                    ...styles.modalButton,
                    backgroundColor: "#b30000",
                  }}
                >
                  <Text style={{ color: "white" }}>Delete</Text>
                </TouchableOpacity>
              )}
              <TouchableOpacity style={styles.modalButton} onPress={add}>
                <Text style={{ color: "white" }}>
                  {optionsOpen ? "Update" : "Add Student"}
                </Text>
              </TouchableOpacity>
            </View>
          </KeyboardAvoidingView>
        </Modal>
      )} */}
    </>
  );
};

export default Assignments;

const styles = StyleSheet.create({
  container: {
    justifyContent: "flex-start",
    alignItems: "center",
    paddingTop: 10,
    flexDirection: "column",
  },
  modal: {
    margin: 0,
    justifyContent: "flex-end",
  },
  modalContainer: {
    backgroundColor: "white",
    padding: 16,
    paddingBottom: 40,
    borderTopRightRadius: 18,
    borderTopLeftRadius: 18,
  },
  modalButtonsContainer: {
    width: "100%",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 15,
  },
  modalButton: {
    fontSize: 18,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    marginBottom: 15,
    backgroundColor: "royalblue",
    borderRadius: 8,
    width: "48%",
  },
  input: {
    textAlign: "center",
    borderWidth: 1,
    borderColor: "#e1e1e1",
    padding: 15,
    borderRadius: 8,
    marginBottom: 12,
  },
  inputText: {
    fontSize: 16,
    marginLeft: 10,
  },
});
