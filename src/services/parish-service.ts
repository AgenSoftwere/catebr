import { database } from "@/lib/firebase"
import { ref, set, get } from "firebase/database"
import type { Parish } from "@/types/parish"
import CryptoJS from "crypto-js"

// Encryption key should be stored in environment variables
const ENCRYPTION_KEY = process.env.NEXT_PUBLIC_ENCRYPTION_KEY || "default-key-for-development"

export async function createParish(
  uid: string,
  parishData: {
    name: string
    email: string
    phone: string
    cnpj: string
    address: {
      street: string
      number: string
      neighborhood: string
      city: string
      state: string
      zipCode: string
    }
    responsibleName: string
  },
) {
  try {
    // Check if CNPJ already exists
    const existingParish = await getParishByCNPJ(parishData.cnpj)
    if (existingParish) {
      throw new Error("CNPJ já cadastrado no sistema.")
    }

    // Encrypt sensitive data
    const encryptedEmail = encryptData(parishData.email)
    const encryptedCNPJ = encryptData(parishData.cnpj)

    const parishProfile = {
      id: uid,
      name: parishData.name,
      email: encryptedEmail,
      phone: parishData.phone,
      cnpj: encryptedCNPJ,
      address: parishData.address,
      responsibleName: parishData.responsibleName,
      role: "parish",
      createdAt: new Date().toISOString(),
    }

    await set(ref(database, `parishes/${uid}`), parishProfile)
    return parishProfile
  } catch (error) {
    console.error("Error creating parish profile:", error)
    throw error
  }
}

export async function getParishByCNPJ(cnpj: string) {
  try {
    const parishesRef = ref(database, "parishes")
    const parishesSnapshot = await get(parishesRef)

    if (parishesSnapshot.exists()) {
      const parishes = parishesSnapshot.val()

      for (const key in parishes) {
        const parish = parishes[key]
        const decryptedCNPJ = decryptData(parish.cnpj)

        if (decryptedCNPJ === cnpj) {
          return { ...parish, id: key }
        }
      }
    }

    return null
  } catch (error) {
    console.error("Error getting parish by CNPJ:", error)
    throw error
  }
}

export async function getParishes(): Promise<Parish[]> {
  try {
    const parishesRef = ref(database, "parishes")
    const parishesSnapshot = await get(parishesRef)

    if (parishesSnapshot.exists()) {
      const parishes = parishesSnapshot.val()
      const parishList: Parish[] = []

      for (const key in parishes) {
        const parish = parishes[key]

        parishList.push({
          id: key,
          name: parish.name,
          address: parish.address,
          phone: parish.phone,
        })
      }

      return parishList.sort((a, b) => a.name.localeCompare(b.name))
    }

    return []
  } catch (error) {
    console.error("Error getting parishes:", error)
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
