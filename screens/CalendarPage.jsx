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
import LessonsList from "../components/LessonList";

const CalendarPage = () => {
  const initDate = new Date().toISOString().split("T")[0];
  const {
    lessons,
    user,
    addLesson,
    modalVisible,
    setModalVisible,
    userAssignments,
    loading,
    setLoading,
    deleteLesson,
    // updateLesson,
  } = useAppContext();
  const [newLesson, setNewLesson] = useState({
    date: new Date(),
    startTime: new Date(),
    endTime: new Date(),
    assignment: null,
    notes: "",
    id: "",
  });
  const [selected, setSelected] = useState(initDate);
  const [filteredLessons, setFilteredLessons] = useState([]);
  const [markedDatesObject, setMarkedDatesObject] = useState({});
  const [options, setOptions] = useState(false);

  useEffect(() => {
    // get the students array from the userAssignments array that have remaining hours
    if (user.role == "teacher") {
      const temp = userAssignments.filter((assignment) => assignment.hours > 0);

      if (temp.length > 0) {
        setNewLesson({ ...newLesson, assignment: temp[0] });
      }
    }
  }, [userAssignments]);

  useEffect(() => {
    if (lessons.length > 0) {
      filterLessons();
      updateLessonDates();
    }
  }, [lessons, selected]);

  const closeModal = () => {
    setModalVisible(false);
    setNewLesson({
      date: new Date(),
      startTime: new Date(),
      endTime: new Date(),
      assignment: userAssignments[0],
      notes: "",
      id: "",
    });
    setOptions(false);
  };

  const openOptions = (lesson) => {
    // find the student object from the students array
    const assignment = userAssignments.find(
      (assignment) => assignment.id === lesson.assignment.id
    );

    const startTime = new Date(lesson.startTime.seconds * 1000);
    const endTime = new Date(lesson.endTime.seconds * 1000);
    const date = new Date(lesson.date.seconds * 1000);

    setNewLesson({
      ...lesson,
      date,
      startTime,
      endTime,
      assignment,
      id: lesson.id,
    });
    setOptions(true);
    setModalVisible(true);
  };

  const handleDateChange = (event, selectedDate) => {
    setNewLesson({ ...newLesson, date: selectedDate });
  };

  const handlePickStartTime = (event, selectedDate) => {
    setNewLesson({ ...newLesson, startTime: selectedDate });
  };

  const handlePickEndTime = (event, selectedDate) => {
    setNewLesson({ ...newLesson, endTime: selectedDate });
  };

  const handleStudentChange = (id) => {
    const selected = userAssignments.find((assignment) => assignment.id === id);
    setNewLesson({ ...newLesson, assignment: selected });
  };

  const add = async () => {
    try {
      setLoading(true);
      // Check if end time is before start time
      if (newLesson.endTime < newLesson.startTime) {
        throw new Error("End time cannot be before start time.");
      }

      // Check if the selected student has enough hours left for the new lesson
      const hours = calculateLessonHours(
        newLesson.startTime,
        newLesson.endTime
      );
      if (newLesson.assignment.hours < hours) {
        throw new Error(
          "Selected student doesn't have enough hours left for this lesson."
        );
      }

      // check if the startTime and endTime are not in the middle of other lessons
      checkTimeOverlap(lessons, newLesson);

      const lesson = {
        assignment: newLesson.assignment,
        lessonId: newLesson.id,
        date: newLesson.date,
        startTime: newLesson.startTime,
        endTime: newLesson.endTime,
        notes: newLesson.notes,
        done: false,
        hours,
      };

      const assignmentHours = newLesson.assignment.hours - hours;

      closeModal();
      await addLesson(lesson, assignmentHours);
    } catch (e) {
      Alert.alert(e.message); // Display the error message in the alert
    } finally {
      setTimeout(() => {
        setLoading(false);
      }, 1000);
    }
  };

  const update = () => {
    try {
      setLoading(true);
      // delete the lesson and update the assignment hours
      handleDelete();
      closeModal();
    } catch (e) {
      console.error("error updating lesson: ", e);
    } finally {
      setTimeout(() => {
        setLoading(false);
      }, 2000);
    }
  };

  const calculateLessonHours = (start, end) => {
    let hours = end.getHours() - start.getHours();
    let minutes = end.getMinutes() - start.getMinutes();
    if (minutes < 0) {
      hours -= 1;
      minutes += 60;
    }
    const diff = hours + minutes / 60;
    return Math.round(diff * 100) / 100; // Round to two decimal places
  };

  const checkTimeOverlap = (lessons, newLesson) => {
    // get the date, start time and end time of the new lesson
    const newLessonDate = newLesson.date.toISOString().split("T")[0];

    // get all the lessons of the selected date
    const sameDayLessons = lessons.filter(
      (lesson) => formatDateFromTimestamp(lesson.date) === newLessonDate
    );

    const newLessonStartTime =
      newLesson.startTime.getHours() * 60 + newLesson.startTime.getMinutes();
    const newLessonEndTime =
      newLesson.endTime.getHours() * 60 + newLesson.endTime.getMinutes();

    // find the lesson that has start time < newLesson.startTime < end time or start time < newLesson.endTime < end time
    sameDayLessons.forEach((lesson) => {
      const lessonStart = new Date(lesson.startTime.seconds * 1000);
      const lessonEnd = new Date(lesson.endTime.seconds * 1000);
      const lessonStartTime =
        lessonStart.getHours() * 60 + lessonStart.getMinutes();
      const lessonEndTime = lessonEnd.getHours() * 60 + lessonEnd.getMinutes();

      if (lesson.id !== newLesson.id) {
        // Check for overlap
        if (
          newLessonStartTime < lessonEndTime &&
          newLessonEndTime > lessonStartTime
        ) {
          throw new Error("The new lesson overlaps with an existing lesson.");
        }
      }
    });
  };

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

    // Sort the lessons by start time when the time is Date object
    filtered.sort((a, b) => a.startTime - b.startTime);

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

  const handleDelete = async () => {
    try {
      setLoading(true);
      setModalVisible(false);
      await deleteLesson(
        newLesson.id,
        newLesson.hours,
        newLesson.assignment
      );
      closeModal();
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

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

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        <LessonsList
          lessons={filteredLessons}
          openOptions={openOptions}
          withOptions={user.role == "teacher"}
        />
      </ScrollView>

      {/* new lesson modal */}
      {user.role == "teacher" && (
        <Modal
          isVisible={modalVisible && userAssignments.length > 0}
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
                  selectedValue={
                    newLesson.assignment ? newLesson.assignment.id : ""
                  }
                  onValueChange={(itemValue, itemIndex) =>
                    handleStudentChange(itemValue)
                  }
                  style={{ width: "100%" }}
                >
                  {userAssignments.map((assignment) => (
                    <Picker.Item
                      key={assignment.id}
                      label={`${assignment.user.username} - ${assignment.subject}`}
                      value={assignment.id}
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
                <TouchableOpacity
                  style={styles.modalButton}
                  onPress={options ? update : add}
                >
                  <Text style={{ color: "white" }}>
                    {options ? "Update" : "Add Lesson"}
                  </Text>
                </TouchableOpacity>
              </View>
            </KeyboardAvoidingView>
          </TouchableWithoutFeedback>
        </Modal>
      )}
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
