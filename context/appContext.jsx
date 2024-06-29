import { createContext, useContext, useState, useEffect } from "react";
import { db, auth } from "../firebaseConfig";
import {
  collection,
  doc,
  setDoc,
  getDocs,
  query,
  where,
  serverTimestamp,
  orderBy,
  deleteDoc,
  onSnapshot,
  updateDoc,
} from "firebase/firestore";
import Toast from "react-native-toast-message";

const AppContext = createContext();

export const AppProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [students, setStudents] = useState([]);
  const [userAssignments, setUserAssignments] = useState([]);
  const [lessons, setLessons] = useState([]);
  const [firstLoad, setFirstLoad] = useState(true); // Track first load of lessons
  const [firstAssignmentLoad, setFirstAssignmentLoad] = useState(true); // Track first load of assignments
  const [loadedLessonIds, setLoadedLessonIds] = useState(new Set()); // Track loaded lesson IDs
  const [loadedAssignmentIds, setLoadedAssignmentIds] = useState(new Set()); // Track loaded assignment IDs
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
          // Merge new assignments with existing ones
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
    if (!userAssignments.length > 0) return;

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

        const unsubscribe = onSnapshot(q, (snapshot) => {
          let updatedLessons = [...lessons]; // Clone the existing lessons

          snapshot.docChanges().forEach((change) => {
            const lessonData = { ...change.doc.data(), id: change.doc.id };

            if (change.type === "added" || change.type === "modified") {
              const existingLessonIndex = updatedLessons.findIndex(
                (lesson) => lesson.id === lessonData.id
              );

              if (existingLessonIndex >= 0) {
                // Update the existing lesson
                updatedLessons[existingLessonIndex] = lessonData;
              } else {
                // Add the new lesson
                updatedLessons.push(lessonData);

                // Show toast for new lesson if not first load
                if (!firstLoad) {
                  if (!loadedLessonIds.has(lessonData.id)) {
                    const date = new Date(
                      lessonData.date.seconds * 1000 +
                        Math.floor(lessonData.date.nanoseconds / 1000000)
                    )
                      .toISOString()
                      .split("T")[0];

                    const subject = userAssignments.find(
                      (assignment) => assignment.id === lessonData.assignmentId
                    )?.subject;

                    const message = {
                      type: "info",
                      text1: `New ${subject} Lesson added`,
                      text2: `${date}`,
                    };
                    showToast(message);
                  }
                } else {
                  setFirstLoad(false);
                }
              }
            } else if (change.type === "removed") {
              updatedLessons = updatedLessons.filter(
                (lesson) => lesson.id !== lessonData.id
              );

              // Show toast for deleted lesson if not first load
              const subject = userAssignments.find(
                (assignment) => assignment.id === lessonData.assignmentId
              )?.subject;

              const message = {
                type: "info",
                text1: `Lesson for ${subject} deleted`,
              };
              showToast(message);
            }

            setLoadedLessonIds((prev) => new Set(prev).add(lessonData.id));
          });

          // Attach assignments to lessons
          const temp = attachAssignmentsToLessons(updatedLessons);
          setLessons(temp);
        });

        return unsubscribe;
      } catch (e) {
        console.error("Error getting lessons: ", e);
      }
    };

    fetchLessons();
  }, [userAssignments]);

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

  const addLesson = async (newLesson, assignmentHours) => {
    try {
      // Update assignment hours
      const { user, id, ...rest } = newLesson.assignment;
      const assignmentRef = doc(db, "assignments", id);
      await setDoc(assignmentRef, { ...rest, hours: assignmentHours });

      // Add lesson document
      let { assignment, lessonId, ...lessonData } = newLesson;
      const lessonObj = {
        ...lessonData,
        assignmentId: assignment.id,
        timestamp: serverTimestamp(),
      };

      // Define lesson id if it doesn't exist
      lessonId =
        lessonId !== "" ? lessonId : `${lessonData.startTime.getTime()}${id}`;
      await setDoc(doc(db, "lessons", lessonId), lessonObj);
    } catch (e) {
      console.error("Error in addLesson:", e);
    }
  };

  const deleteLesson = async (lessonId, hours, assignment) => {
    try {
      // delete lesson document
      await deleteDoc(doc(db, "lessons", lessonId));

      // update assignment hours
      const assignmentRef = doc(db, "assignments", assignment.id);
      const prevHours = userAssignments.find(
        (userAssignment) => userAssignment.id === assignment.id
      ).hours;
      await updateDoc(assignmentRef, { hours: prevHours + hours });

      // Update students state
      const tempStudents = students.map((student) => {
        if (student.id === assignment.studentId) {
          return { ...student, hours: remainingHours };
        }
        return student;
      });

      setStudents(tempStudents);
    } catch (e) {
      console.error("error deleting lesson: ", e);
    }
  };

  const checkLesson = async (lessonId) => {
    try {
      const lessonUpdated = lessons.find((lesson) => lesson.id === lessonId);
      lessonUpdated.done = !lessonUpdated.done;
      const lessonRef = doc(db, "lessons", lessonId);
      await setDoc(lessonRef, lessonUpdated);
      const temp = lessons.map((lesson) => {
        if (lesson.id === lessonId) {
          return lessonUpdated;
        }
        return lesson;
      });
      setLessons(temp);

      // update the user hours and money
      const userRef = doc(db, "users", uid);
      let money = user.money;
      let hours = user.hours;

      const lessonHours = lessonUpdated.hours + lessonUpdated.minutes / 60;

      hours += lessonHours;
      money += lessonHours * 75;

      await setDoc(userRef, {
        ...user,
        hours,
        money,
      });

      setUser({ ...user, hours, money });
    } catch (e) {
      console.error("error checking lesson: ", e);
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
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => {
  return useContext(AppContext)
};
