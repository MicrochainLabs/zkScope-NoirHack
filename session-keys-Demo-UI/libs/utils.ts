import { clsx, type ClassValue } from "clsx"
import { poseidon2 } from "poseidon-lite"
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

export const hash = (a: string | number | bigint, b: string | number | bigint) => poseidon2([a, b])
