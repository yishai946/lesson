import DateTimePicker from "@react-native-community/datetimepicker";
import { Picker } from "@react-native-picker/picker";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import { Calendar } from "react-native-calendars";
import Modal from "react-native-modal";
import Lesson from "../components/Lesson";
import { useAppContext } from "../context/appContext";

const CalendarPage = () => {
  const initDate = new Date().toISOString().split("T")[0];
  const {
    lessons,
    addLesson,
    modalVisible,
    setModalVisible,
    userAssignments,
    loading,
    setLoading,
    deleteLesson,
  } = useAppContext();
  const [newLesson, setNewLesson] = useState({
    date: new Date(),
    startTime: new Date(),
    endTime: new Date(),
    student: userAssignments[0].user,
    notes: "",
  });
  const [studentsArr, setStudentsArr] = useState([]);
  const [selected, setSelected] = useState(initDate);
  const [filteredLessons, setFilteredLessons] = useState([]);
  const [markedDatesObject, setMarkedDatesObject] = useState({});
  const [options, setOptions] = useState(false);

  // useEffect(() => {
  //   // get the students array from the userAssignments array that have remaining hours
  //   if (user.role == "teacher") {
  //     const temp = userAssignments.filter((assignment) => assignment.hours > 0);
  //     const students = temp.map((assignment) => {
  //       return {
  //         ...assignment.user,
  //       };
  //     });
  //     setStudentsArr(students);
  //   }
  // }, [userAssignments]);

  useEffect(() => {
    if (lessons.length > 0) {
      filterLessons();
      updateLessonDates();
    }
  }, [lessons, selected]);

  // const closeModal = () => {
  //   setModalVisible(false);
  //   setNewLesson({
  //     date: new Date(),
  //     startTime: new Date(),
  //     endTime: new Date(),
  //     student: studentsArr[0],
  //     notes: "",
  //   });
  //   setOptions(false);
  // };

  // const openOptions = (lesson) => {
  //   const [year, month, day] = lesson.date.split("-").map(Number);
  //   const [startHour, startMinute] = lesson.startTime.split(":").map(Number);
  //   const [endHour, endMinute] = lesson.endTime.split(":").map(Number);

  //   const endTime = new Date(year, month - 1, day, endHour, endMinute);
  //   const startTime = new Date(year, month - 1, day, startHour, startMinute);

  //   // find the student object from the students array
  //   const student = userAssignments.find((assignment) => assignment.studentId === lesson.studentId).user;

  //   setNewLesson({ ...lesson, startTime, endTime, date: startTime, student });
  //   setOptions(true);
  //   setModalVisible(true);
  // };

  // const handleDateChange = (event, selectedDate) => {
  //   setNewLesson({ ...newLesson, date: selectedDate });
  // };

  // const handlePickStartTime = (event, selectedDate) => {
  //   setNewLesson({ ...newLesson, startTime: selectedDate });
  // };

  // const handlePickEndTime = (event, selectedDate) => {
  //   setNewLesson({ ...newLesson, endTime: selectedDate });
  // };

  // const handleStudentChange = (name) => {
  //   const selected = students.find((student) => student.name === name);
  //   setNewLesson({ ...newLesson, student: selected });
  // };

  // const add = async () => {
  //   try {
  //     setLoading(true);

  //     let pastDuration = 0;
  //     if (options) {
  //       // get the lesson from the lessons array
  //       const lesson = lessons.find((item) => item.id === newLesson.id);
  //       pastDuration = lesson.hours + lesson.minutes / 60;
  //     }

  //     // Check if end time is before start time
  //     if (newLesson.endTime < newLesson.startTime) {
  //       throw new Error("End time cannot be before start time.");
  //     }

  //     // Check if the selected student has enough hours left for the new lesson
  //     if (
  //       newLesson.student.hours <
  //       calculateLessonHours(newLesson.startTime, newLesson.endTime)
  //     ) {
  //       throw new Error(
  //         "Selected student doesn't have enough hours left for this lesson."
  //       );
  //     }

  //     const lesson = {
  //       ...newLesson,
  //       studentId: newLesson.student.id,
  //       studentName: newLesson.student.name,
  //       date: newLesson.date.toISOString().split("T")[0], // Extract date part from ISO string
  //       startTime: newLesson.startTime.toLocaleTimeString("en-US", {
  //         hour: "2-digit",
  //         minute: "2-digit",
  //       }), // Convert time to a string in the format "HH:MM"
  //       endTime: newLesson.endTime.toLocaleTimeString("en-US", {
  //         hour: "2-digit",
  //         minute: "2-digit",
  //       }), // Convert time to a string in the format "HH:MM"
  //     };

  //     // check if the startTime and endTime are not in the middle of other lessons
  //     const filtered = lessons.filter((item) => {
  //       if (item.date) {
  //         return item.date === lesson.date;
  //       }
  //       return false;
  //     });

  //     const convertToMinutes = (timeString) => {
  //       const [hours, minutes] = timeString.split(":").map(Number);
  //       return hours * 60 + minutes;
  //     };

  //     filtered.map((item) => {
  //       if (
  //         convertToMinutes(item.startTime) <
  //           convertToMinutes(lesson.startTime) &&
  //         convertToMinutes(lesson.startTime) < convertToMinutes(item.endTime) &&
  //         item.id !== lesson.id
  //       ) {
  //         throw new Error("The start time is in the middle of another lesson");
  //       } else if (
  //         convertToMinutes(item.startTime) < convertToMinutes(lesson.endTime) &&
  //         convertToMinutes(lesson.endTime) < convertToMinutes(item.endTime) &&
  //         item.id !== lesson.id
  //       ) {
  //         throw new Error("The end time is in the middle of another lesson");
  //       }
  //     });

  //     await addLesson(lesson, pastDuration);
  //     closeModal();
  //   } catch (e) {
  //     Alert.alert(e.message); // Display the error message in the alert
  //   } finally {
  //     setLoading(false);
  //   }
  // };

  // const calculateLessonHours = (startTime, endTime) => {
  //   const start = new Date(startTime);
  //   const end = new Date(endTime);
  //   const diff = (end.getTime() - start.getTime()) / (1000 * 60 * 60); // Convert milliseconds to hours
  //   return diff;
  // };

  const handleDayPress = (selectedDate) => {
    setSelected(selectedDate.dateString);
  };

  const formatDateFromTimestamp = (timestamp) => {
    const date = new Date(timestamp.seconds * 1000); // Convert seconds to milliseconds
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0"); // Months are 0-based, so add 1
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  const filterLessons = () => {
    // Convert Firestore Timestamp to 'YYYY-MM-DD' format

    // Filter lessons of the selected date
    const filtered = lessons.filter(
      (lesson) => formatDateFromTimestamp(lesson.date) === selected
    );

    // Sort the lessons by start time
    filtered.sort((a, b) => {
      const parseTime = (timeStr) => {
        const [hours, minutes] = timeStr.split(":").map(Number);
        return hours * 60 + minutes; // Convert hours to minutes and add minutes
      };

      const startTimeA = parseTime(a.startTime);
      const startTimeB = parseTime(b.startTime);

      return startTimeA - startTimeB;
    });

    // Update local state
    setFilteredLessons(filtered);
  };

  const updateLessonDates = () => {
    const dates = lessons.reduce((acc, lesson) => {
      if (lesson.date) {
        const formattedDate = formatDateFromTimestamp(lesson.date);
        acc[formattedDate] = { marked: true, dotColor: "royalblue" };
      }
      return acc;
    }, {});

    const markedDatesObject = {
      ...dates,
      [selected]: {
        selected: true,
        selectedColor: "royalblue",
        selectedTextColor: "#ffffff",
      },
    };

    setMarkedDatesObject(markedDatesObject);
  };

  // const handleDelete = async () => {
  //   try {
  //     setLoading(true);
  //     setModalVisible(false);
  //     await deleteLesson(newLesson);
  //     closeModal();
  //   } catch (e) {
  //     console.log(e);
  //   } finally {
  //     setLoading(false);
  //   }
  // };

  return loading ? (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      <ActivityIndicator />
    </View>
  ) : (
    <View>
      <Calendar
        onDayPress={handleDayPress} // can cause problems
        initialDate={initDate}
        markedDates={markedDatesObject}
        enableSwipeMonths={true}
      />

      {/* <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        {filteredLessons.map((lesson, index) => (
          <Lesson
            key={index}
            lesson={lesson}
            openOptions={openOptions}
            withOptions={true}
          />
        ))}
      </ScrollView> */}

      {/* <Modal
        isVisible={modalVisible && studentsArr.length > 0}
        onBackdropPress={closeModal}
        style={styles.modal}
        propagateSwipe={true}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            style={styles.modalContainer}
          >
            <View style={{ alignItems: "center" }}>
              <Picker
                selectedValue={newLesson.student ? newLesson.student.name : ""}
                onValueChange={(itemValue, itemIndex) =>
                  handleStudentChange(itemValue)
                }
                style={{ width: "100%" }}
              >
                {studentsArr.map((student) => (
                  <Picker.Item
                    key={student.id}
                    label={student.name}
                    value={student.name}
                  />
                ))}
              </Picker>
            </View>

            <View style={styles.row}>
              <Text style={styles.modalText}>Date</Text>
              <DateTimePicker
                value={newLesson.date}
                mode={"date"}
                onChange={(event, selectedDate) =>
                  handleDateChange(event, selectedDate)
                }
              />
            </View>

            <View style={styles.row}>
              <Text style={styles.modalText}>Start</Text>
              <DateTimePicker
                value={newLesson.startTime}
                mode={"time"}
                onChange={(event, selectedDate) =>
                  handlePickStartTime(event, selectedDate)
                }
              />
            </View>

            <View style={styles.row}>
              <Text style={styles.modalText}>End</Text>
              <DateTimePicker
                value={newLesson.endTime}
                mode={"time"}
                onChange={(event, selectedDate) =>
                  handlePickEndTime(event, selectedDate)
                }
              />
            </View>

            <View style={styles.row}>
              <Text style={styles.modalText}>Notes</Text>
              <TextInput
                style={styles.notes}
                value={newLesson.notes}
                maxLength={25}
                onChangeText={(text) =>
                  setNewLesson({ ...newLesson, notes: text })
                }
              />
            </View>

            <View style={styles.modalButtons}>
              {!options ? (
                <TouchableOpacity
                  style={{
                    ...styles.modalButton,
                    backgroundColor: "#e1e1e1",
                  }}
                  onPress={closeModal}
                >
                  <Text>Cancel</Text>
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
                  {options ? "Update" : "Add Lesson"}
                </Text>
              </TouchableOpacity>
            </View>
          </KeyboardAvoidingView>
        </TouchableWithoutFeedback>
      </Modal> */}
    </View>
  );
};

export default CalendarPage;

const styles = StyleSheet.create({
  contentContainer: {
    justifyContent: "center",
    alignItems: "center",
    paddingBottom: 30,
  },
  scrollView: {
    height: "50%",
    alignSelf: "center",
    padding: 10,
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
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginVertical: 20,
    paddingRight: 15,
    paddingLeft: 20,
  },
  modalText: {
    fontSize: 18,
  },
  modalButtons: {
    width: "100%",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginVertical: 15,
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
  notes: {
    width: "70%",
    height: 40,
    borderColor: "gray",
    borderWidth: 1,
    borderRadius: 8,
    padding: 10,
  },
});
