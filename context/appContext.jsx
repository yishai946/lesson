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

  useEffect(() => {
    if (user) {
      fetchAssignments();
    }
  }, [user]);

  useEffect(() => {
    if (userAssignments.length > 0) {
      fetchLessons();
    }
  }, [userAssignments]);

  const fetchAssignments = async () => {
    try {
      if (!user) {
        throw new Error("User is not authenticated");
      }

      // Determine the user role and set appropriate query fields
      const isTeacher = user.role === "teacher";
      const roleField = isTeacher ? "teacherId" : "studentId";
      const oppositeRoleField = isTeacher ? "studentId" : "teacherId";

      // Get assignments data and corresponding user ids array
      const q = query(
        collection(db, "assignments"),
        where(roleField, "==", uid),
        orderBy("timestamp", "desc")
      );
      const res1 = await getDocs(q);
      const userIds = [];
      const assignments = []
      res1.forEach((doc) => {
        const assignmentData = { ...doc.data(), id: doc.id };
        userIds.push(assignmentData[oppositeRoleField]);
        assignments.push(assignmentData);
      });

      // Fetch user data based on the ids collected
      const userQuery = query(
        collection(db, "users"),
        where("__name__", "in", userIds)
      );

      const res2 = await getDocs(userQuery);
      const usersData = res2.docs.map((doc) => {
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
    } catch (e) {
      console.error("error fetching assignments: ", e);
    }
  };

  const fetchLessons = async () => {
    try {
      const assignmentIds = userAssignments.map((assignment) => assignment.id);
      const q = query(
        collection(db, "lessons"),
        where("assignmentId", "in", assignmentIds),
        orderBy("startTime", "desc")
      );
      const res = await getDocs(q);
      const lessons = [];
      res.forEach((doc) => {
        lessons.push({ ...doc.data(), id: doc.id });
      });

      setLessons(lessons);
    } catch (e) {
      console.error("error getting lessons: ", e);
    }
  };

  // TODO: fix the addLesson function
  const addLesson = async (newLesson, pastDuration) => {
    try {
      // Parse start and end time strings into Date objects
      const startTime = new Date(`2000-01-01T${newLesson.startTime}`);
      const endTime = new Date(`2000-01-01T${newLesson.endTime}`);

      // Calculate duration in milliseconds
      let durationMs = endTime.getTime() - startTime.getTime();

      // Convert duration from milliseconds to hours and minutes
      const hours = Math.floor(durationMs / (60 * 60 * 1000));
      const minutes = Math.floor((durationMs % (60 * 60 * 1000)) / (60 * 1000));

      // Update student hours
      const studentRef = doc(db, "students", newLesson.student);
      const studentSnap = await getDoc(studentRef);
      if (!studentSnap.exists()) {
        throw new Error("Student does not exist");
      }

      const studentData = studentSnap.data();
      const remainingHours =
        studentData.hours - (hours + minutes / 60) + pastDuration;

      // Add lesson document
      const id = newLesson.startTime + uid;
      await setDoc(doc(db, "lessons", id), {
        ...newLesson,
        teacherId: uid,
        timestamp: serverTimestamp(),
        hours,
        minutes,
        done: false,
      });

      // Update lessons state
      const temp = lessons.filter((lesson) => lesson.id !== newLesson.id);
      temp.unshift({
        ...newLesson,
        teacherId: auth.currentUser.uid,
        hours,
        minutes,
        id: id,
        done: false,
      });
      setLessons(temp);

      await setDoc(studentRef, {
        ...studentData,
        hours: remainingHours,
      });

      // Update students state
      const tempStudents = students.map((student) => {
        if (student.id === newLesson.student) {
          return { ...student, hours: remainingHours };
        }
        return student;
      });

      setStudents(tempStudents);
    } catch (e) {
      return e;
    }
  };

  // const addStudent = async (newStudent) => {
  //   try {
  //     await setDoc(doc(db, "users", uid), {
  //       ...newStudent,
  //       teacherId: auth.currentUser.uid,
  //       timestamp: serverTimestamp(),
  //     });
  //     const temp = students.filter((student) => student.id !== newStudent.id);
  //     temp.unshift({ ...newStudent, teacherId: auth.currentUser.uid });
  //     setStudents(temp);
  //   } catch (e) {
  //     console.error("error adding student: ", e);
  //   }
  // };

  // const deleteStudent = async (id) => {
  //   try {
  //     await deleteDoc(doc(db, "students", id));
  //     const temp = students.filter((student) => student.id !== id);
  //     setStudents(temp);
  //   } catch (e) {
  //     console.error("error deleting student: ", e);
  //   }
  // };

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
        // students,
        // addStudent,
        // deleteStudent,
        lessons,
        addLesson,
        deleteLesson,
        checkLesson,
        // teachers,

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
