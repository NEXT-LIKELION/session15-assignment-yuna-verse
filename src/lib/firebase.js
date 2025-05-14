// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAnalytics, isSupported } from "firebase/analytics";
import {
    collection,
    addDoc,
    query,
    orderBy,
    getDocs,
    getDoc,
    updateDoc,
    deleteDoc,
    doc,
} from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

const firebaseConfig = {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

let localTodos = JSON.parse(localStorage.getItem("todos") || "[]");

let app;
let db;

try {
    app = initializeApp(firebaseConfig);
    db = getFirestore(app);
    isSupported()
        .then((yes) => (yes ? getAnalytics(app) : null))
        .catch((error) => console.log("Analytics not supported"));
} catch (error) {
    console.warn("Firebase initialization failed, using local storage");
}

export { db };

export const addTodo = async (title, description, dueDate) => {
    try {
        if (db) {
            try {
                const docRef = await addDoc(collection(db, "todos"), {
                    title,
                    description,
                    dueDate,
                    completed: false,
                    createdAt: new Date(),
                });
                return docRef.id;
            } catch (firebaseError) {
                console.warn(
                    "Firebase connection failed, using local storage:",
                    firebaseError
                );
                return addLocalTodo(title, description, dueDate);
            }
        } else {
            return addLocalTodo(title, description, dueDate);
        }
    } catch (error) {
        console.error("Error adding to-do:", error);
        return addLocalTodo(title, description, dueDate);
    }
};

const addLocalTodo = (title, description, dueDate) => {
    const newTodo = {
        id: Date.now().toString(),
        title,
        description,
        dueDate,
        completed: false,
        createdAt: new Date(),
    };
    localTodos.push(newTodo);
    localStorage.setItem("todos", JSON.stringify(localTodos));
    return newTodo.id;
};

export const getTodos = async () => {
    try {
        if (db) {
            try {
                const q = query(
                    collection(db, "todos"),
                    orderBy("createdAt", "desc")
                );
                const querySnapshot = await getDocs(q);
                return querySnapshot.docs.map((doc) => ({
                    id: doc.id,
                    ...doc.data(),
                }));
            } catch (firebaseError) {
                console.warn(
                    "Firebase connection failed, using local storage:",
                    firebaseError
                );
                return localTodos.sort(
                    (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
                );
            }
        } else {
            return localTodos.sort(
                (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
            );
        }
    } catch (error) {
        console.error("Error loading to-do list:", error);
        return localTodos.sort(
            (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
        );
    }
};

export const getTodoById = async (id) => {
    try {
        if (db) {
            try {
                const todoRef = doc(db, "todos", id);
                const todoSnap = await getDoc(todoRef);

                if (todoSnap.exists()) {
                    return { id: todoSnap.id, ...todoSnap.data() };
                } else {
                    return null;
                }
            } catch (firebaseError) {
                console.warn(
                    "Firebase connection failed, using local storage:",
                    firebaseError
                );
                const todo = localTodos.find((todo) => todo.id === id);
                return todo || null;
            }
        } else {
            const todo = localTodos.find((todo) => todo.id === id);
            return todo || null;
        }
    } catch (error) {
        console.error("Error loading to-do:", error);
        return null;
    }
};

export const updateTodo = async (id, todoData) => {
    try {
        if (db) {
            try {
                const todoRef = doc(db, "todos", id);
                await updateDoc(todoRef, todoData);
                console.log(`To-do updated successfully (ID: ${id})`);
            } catch (firebaseError) {
                console.warn(
                    "Firebase connection failed, using local storage:",
                    firebaseError
                );
                updateLocalTodo(id, todoData);
            }
        } else {
            updateLocalTodo(id, todoData);
        }
    } catch (error) {
        console.error("Error updating to-do:", error);
        updateLocalTodo(id, todoData);
    }
};

const updateLocalTodo = (id, todoData) => {
    localTodos = localTodos.map((todo) =>
        todo.id === id ? { ...todo, ...todoData } : todo
    );
    localStorage.setItem("todos", JSON.stringify(localTodos));
    console.log(`To-do updated in local storage (ID: ${id})`);
};

export const deleteTodo = async (id) => {
    try {
        if (db) {
            try {
                const todoRef = doc(db, "todos", id);
                await deleteDoc(todoRef);
                console.log(`To-do deleted successfully (ID: ${id})`);
            } catch (firebaseError) {
                console.warn(
                    "Firebase connection failed, using local storage:",
                    firebaseError
                );
                deleteLocalTodo(id);
            }
        } else {
            deleteLocalTodo(id);
        }
    } catch (error) {
        console.error("Error deleting to-do:", error);
        deleteLocalTodo(id);
    }
};

const deleteLocalTodo = (id) => {
    localTodos = localTodos.filter((todo) => todo.id !== id);
    localStorage.setItem("todos", JSON.stringify(localTodos));
    console.log(`To-do deleted from local storage (ID: ${id})`);
};
