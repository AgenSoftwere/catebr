import { database } from "@/lib/firebase"
import { ref, set, get } from "firebase/database"
import CryptoJS from "crypto-js"

// Encryption key should be stored in environment variables
const ENCRYPTION_KEY = process.env.NEXT_PUBLIC_ENCRYPTION_KEY || "default-key-for-development"

export async function createUserProfile(
  uid: string,
  userData: {
    name: string
    email: string
    role: "user" | "parish"
  },
  checkExisting = false,
) {
  try {
    // Check if user already exists
    if (checkExisting) {
      const userSnapshot = await get(ref(database, `users/${uid}`))
      if (userSnapshot.exists()) {
        return userSnapshot.val()
      }
    }

    // Encrypt sensitive data
    const encryptedEmail = encryptData(userData.email)

    const userProfile = {
      name: userData.name,
      email: encryptedEmail,
      role: userData.role,
      createdAt: new Date().toISOString(),
    }

    await set(ref(database, `users/${uid}`), userProfile)
    return userProfile
  } catch (error) {
    console.error("Error creating user profile:", error)
    throw error
  }
}

export async function getUserData(uid: string) {
  try {
    const userSnapshot = await get(ref(database, `users/${uid}`))

    if (userSnapshot.exists()) {
      const userData = userSnapshot.val()

      // Decrypt sensitive data
      if (userData.email) {
        userData.email = decryptData(userData.email)
      }

      return userData
    }

    return null
  } catch (error) {
    console.error("Error getting user data:", error)
    throw error
  }
}

// Encryption and decryption functions
function encryptData(data: string): string {
  return CryptoJS.AES.encrypt(data, ENCRYPTION_KEY).toString()
}

function decryptData(encryptedData: string): string {
  const bytes = CryptoJS.AES.decrypt(encryptedData, ENCRYPTION_KEY)
  return bytes.toString(CryptoJS.enc.Utf8)
}
