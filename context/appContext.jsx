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
  getDoc,
  onSnapshot,
} from "firebase/firestore";

const AppContext = createContext();

export const AppProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [students, setStudents] = useState([]);
  const [userAssignments, setUserAssignments] = useState([]);
  const [lessons, setLessons] = useState([]);
  const uid = auth.currentUser?.uid;

  // real time listener for new assignments for user
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
          const assignments = [];
          const userIds = [];

          // Get assignments data and corresponding user ids array
          snapshot.forEach((doc) => {
            const assignmentData = { ...doc.data(), id: doc.id };
            userIds.push(assignmentData[oppositeRoleField]);
            assignments.push(assignmentData);
          });

          // Fetch user data based on the ids collected
          const userQuery = query(
            collection(db, "users"),
            where("__name__", "in", userIds)
          );

          const res = await getDocs(userQuery);
          const usersData = res.docs.map((doc) => {
            return { ...doc.data(), docId: doc.id };
          });

          // Join assignments with user data
          assignments.forEach((assignment) => {
            const userData = usersData.find(
              (doc) => doc.docId === assignment[oppositeRoleField]
            );
            assignment.user = userData;
          });

          // Update state
          setUserAssignments(assignments);
        });

        return unsubscribe;
      } catch (e) {
        console.error("error in real time listener: ", e);
      }
    };

    fetchAssignments();
  }, [user?.role]);

  // real time listener for user lessons
  useEffect(() => {
    if (!userAssignments.length > 0) return;

    const fetchLessons = async () => {
      try {
        const assignmentIds = userAssignments.map((assignment) => assignment.id);
        const q = query(
          collection(db, "lessons"),
          where("assignmentId", "in", assignmentIds),
          orderBy("startTime", "desc")
        );

        const unsubscribe = onSnapshot(q, async (snapshot) => {
          const lessons = [];
          snapshot.forEach((doc) => {
            lessons.push({ ...doc.data(), id: doc.id });
          });

          // add assignment data to lessons
          const temp = attachAssignmentsToLessons(lessons);

          setLessons(temp);
        });

        return unsubscribe;
      } catch (e) {
        console.error("error getting lessons: ", e);
      }
    }
    
    fetchLessons();
  }, [userAssignments]);


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

  const deleteLesson = async (lesson) => {
    try {
      // delete lesson document
      await deleteDoc(doc(db, "lessons", lesson.id));

      // Update lessons state
      const temp = lessons.filter((item) => item.id !== lesson.id);
      setLessons(temp);

      // Update student hours
      const studentRef = doc(db, "students", lesson.student.id);
      const studentSnap = await getDoc(studentRef);
      if (!studentSnap.exists()) {
        throw new Error("Student does not exist");
      }

      const studentData = studentSnap.data();
      const remainingHours =
        studentData.hours + lesson.hours + lesson.minutes / 60;

      await setDoc(studentRef, {
        ...studentData,
        hours: remainingHours,
      });

      // Update students state
      const tempStudents = students.map((student) => {
        if (student.id === lesson.student.id) {
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
  return useContext(AppContext);
};
