import { createContext, useContext, useState, useEffect } from "react";
import { db, auth } from "../firebaseConfig";
import {
  collection,
  doc,
  setDoc,
  query,
  where,
  orderBy,
  deleteDoc,
  onSnapshot,
  Timestamp,
  getDocs,
} from "firebase/firestore";
import Toast from "react-native-toast-message";

const AppContext = createContext();

export const AppProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [userAssignments, setUserAssignments] = useState([]);
  const [lessons, setLessons] = useState([]);
  const [toReport, setToReport] = useState([]);
  const [firstLoad, setFirstLoad] = useState(true);
  const [firstAssignmentLoad, setFirstAssignmentLoad] = useState(true);
  const [loadedLessonIds, setLoadedLessonIds] = useState(new Set());
  const [loadedAssignmentIds, setLoadedAssignmentIds] = useState(new Set());
  const [hours, setHours] = useState(0);
  const uid = auth.currentUser?.uid;

  // Real-time listener for new assignments for user
  useEffect(() => {
    const fetchAssignments = async () => {
      if (!user) return;

      try {
        const isTeacher = user.role === "teacher";
        const roleField = isTeacher ? "teacherId" : "studentId";
        const oppositeRoleField = isTeacher ? "studentId" : "teacherId";
        const q = query(
          collection(db, "assignments"),
          where(roleField, "==", uid),
          orderBy("timestamp", "desc")
        );

        const unsubscribe = onSnapshot(q, async (snapshot) => {
          const updatedAssignments = [];
          const userIds = new Set();

          snapshot.docChanges().forEach((change) => {
            const assignmentData = { ...change.doc.data(), id: change.doc.id };

            if (change.type === "added" || change.type === "modified") {
              updatedAssignments.push(assignmentData);

              if (change.type === "added" && !firstAssignmentLoad) {
                if (!loadedAssignmentIds.has(assignmentData.id)) {
                  const message = {
                    type: "info",
                    text1: `New ${assignmentData.subject} Assignment added`,
                  };
                  showToast(message);
                  setLoadedAssignmentIds((prev) =>
                    new Set(prev).add(assignmentData.id)
                  );
                }
              }

              userIds.add(assignmentData[oppositeRoleField]);
            } else if (change.type === "removed") {
              // Remove assignment and show toast
              if (!firstAssignmentLoad) {
                const message = {
                  type: "info",
                  text1: `Assignment for ${assignmentData.subject} deleted`,
                };
                showToast(message);
              }
            }
          });

          const userQuery = query(
            collection(db, "users"),
            where("__name__", "in", Array.from(userIds))
          );

          const res = await getDocs(userQuery);
          const usersData = res.docs.map((doc) => ({
            ...doc.data(),
            docId: doc.id,
          }));

          updatedAssignments.forEach((assignment) => {
            const userData = usersData.find(
              (doc) => doc.docId === assignment[oppositeRoleField]
            );
            assignment.user = userData;
          });

          setUserAssignments((prevAssignments) => {
            const mergedAssignments = [...prevAssignments];
            updatedAssignments.forEach((newAssignment) => {
              const index = mergedAssignments.findIndex(
                (assignment) => assignment.id === newAssignment.id
              );
              if (index >= 0) {
                mergedAssignments[index] = newAssignment;
              } else {
                mergedAssignments.push(newAssignment);
              }
            });
            return mergedAssignments;
          });

          if (firstAssignmentLoad) {
            setFirstAssignmentLoad(false);
          }
        });

        return unsubscribe;
      } catch (e) {
        console.error("Error in real-time listener for assignments: ", e);
      }
    };

    fetchAssignments();
  }, [user?.role]);

  // Real-time listener for user lessons
  useEffect(() => {
    if (userAssignments.length <= 0) return;

    const fetchLessons = async () => {
      try {
        const assignmentIds = userAssignments.map(
          (assignment) => assignment.id
        );
        const q = query(
          collection(db, "lessons"),
          where("assignmentId", "in", assignmentIds),
          orderBy("startTime", "desc")
        );

        onSnapshot(q, (snapshot) => {
          const updatedLessons = snapshot.docs.map((doc) => ({
            ...doc.data(),
            id: doc.id,
          }));

          const lessonsWithAssignments =
            attachAssignmentsToLessons(updatedLessons);
          setLessons(lessonsWithAssignments);
        });
      } catch (e) {
        console.error("Error in real-time listener for lessons: ", e);
      }
    };

    fetchLessons();
  }, [userAssignments]);

  useEffect(() => {
    if (lessons.length <= 0) return;

    const toReportUpdate = lessons.filter(
      (lesson) => !lesson.done && lesson.date.toDate() < new Date()
    );
    setToReport(toReportUpdate);

    const totalHours = lessons.reduce((acc, lesson) => {
      if (lesson.done) {
        return acc + lesson.hours;
      }
      return acc;
    }, 0);

    setHours(totalHours);
  }, [lessons]);

  const showToast = (message) => {
    Toast.show({
      ...message,
      position: "top",
      visibilityTime: 4000,
      autoHide: true,
      topOffset: 50,
      swipeable: true,
    });
  };

  const attachAssignmentsToLessons = (lessons) => {
    return lessons.map((lesson) => {
      const assignment = userAssignments.find(
        (assignment) => assignment.id === lesson.assignmentId
      );
      lesson.assignment = assignment;
      return lesson;
    });
  };

  const addLesson = async (newLesson) => {
    try {
      const now = new Date();
      const timestamp = Timestamp.fromDate(now);

      // add lesson to db
      const lessonId = `${now.getTime()}${newLesson.assignment.id}`;
      const lessonObj = {
        ...newLesson,
        assignmentId: newLesson.assignment.id,
        timestamp,
      };

      await setDoc(doc(db, "lessons", lessonId), lessonObj);

      // update assignment hours
      const updatedAssignment = {
        ...newLesson.assignment,
        hours: newLesson.assignment.hours - newLesson.hours,
      };

      await setDoc(
        doc(db, "assignments", newLesson.assignment.id),
        updatedAssignment
      );
    } catch (e) {
      console.error("Error in addLesson:", e);
    }
  };

  const deleteLesson = async (lessonId) => {
    try {
      // update assignment hours
      const lesson = lessons.find((lesson) => lesson.id === lessonId);
      const updatedAssignment = {
        ...lesson.assignment,
        hours: lesson.assignment.hours + lesson.hours,
      };

      await setDoc(
        doc(db, "assignments", lesson.assignment.id),
        updatedAssignment
      );

      // delete lesson
      await deleteDoc(doc(db, "lessons", lessonId));
    } catch (e) {
      console.error("Error deleting lesson:", e);
    }
  };

  const checkLesson = async (lessonId) => {
    try {
      setLoading(true);
      const lesson = lessons.find((lesson) => lesson.id === lessonId);
      const updatedLesson = { ...lesson, done: !lesson.done };
      await setDoc(doc(db, "lessons", lessonId), updatedLesson);
    } catch (e) {
      console.error("Error checking lesson:", e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AppContext.Provider
      value={{
        user,
        setUser,
        loading,
        setLoading,
        modalVisible,
        setModalVisible,
        lessons,
        addLesson,
        deleteLesson,
        checkLesson,
        userAssignments,
        hours,
        toReport,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => {
  return useContext(AppContext);
};
