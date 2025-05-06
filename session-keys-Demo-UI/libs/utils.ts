import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export type zkSessionKeyArgType = {
  accountIdentifier: string 
  sessionOwnerPrivateKey: string
  sessionAllowedSmartContracts: string[] 
  sessionAllowedToTree: string[]
}

const STORAGE_ZK_SESSION_KEY = 'zkSessionKey'

export function storeZkSessionKeyInLocalStorage (sessionKey: zkSessionKeyArgType) {
  localStorage.setItem(STORAGE_ZK_SESSION_KEY, JSON.stringify(sessionKey))
}

export function loadZkSessionKeyFromLocalStorage (): zkSessionKeyArgType | null {
  const ZkSessionKeyStored = localStorage.getItem(STORAGE_ZK_SESSION_KEY)
  return ZkSessionKeyStored ? JSON.parse(ZkSessionKeyStored) : null
}
