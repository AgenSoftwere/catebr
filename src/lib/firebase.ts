import { initializeApp } from "firebase/app"
import { getAuth } from "firebase/auth"
import { getDatabase } from "firebase/database"
import { getFirestore } from "firebase/firestore"

const firebaseConfig = {
  apiKey: "AIzaSyC9KZjAhkA0RsShHu-vktyTdvgTeWM_E7U",
  authDomain: "jogogramaticando.firebaseapp.com",
  databaseURL: "https://jogogramaticando-default-rtdb.firebaseio.com",
  projectId: "jogogramaticando",
  storageBucket: "jogogramaticando.firebasestorage.app",
  messagingSenderId: "171981053372",
  appId: "1:171981053372:web:73888d0eda7762e2139fb9",
  measurementId: "G-C94NF58ZMS"
}

const app = initializeApp(firebaseConfig)
export const auth = getAuth(app)
export const database = getDatabase(app)
export const firestore = getFirestore(app)

export default app
