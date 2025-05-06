"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import Link from "next/link"
import { Wallet, Key, Plus, Loader2, CheckCircle, AlertCircle } from "lucide-react"
import { useState } from "react"
import { createWalletClient, custom, WalletClient } from "viem"
import { mainnet } from "viem/chains"
import { SmartSessionModal } from "./smart-session-modal"
import { deployAccountAndOpenNewZKSessionWithPaymaster } from "./createNewSmartAccount"

export default function SignIn() {
  const [isConnecting, setIsConnecting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [connectedAddress, setConnectedAddress] = useState<string | null>(null)
  const [showFailureDialog, setShowFailureDialog] = useState(false)
  const [ensAddress, setEnsAddress] = useState("")
  const [showModal, setShowModal] = useState(false)
  //const [walletClient, setWalletClient] = useState<WalletClient | null>(null)
  

  const createNewSmartAccount = async () => {
    if (!window.ethereum) {
      throw new Error("MetaMask is not installed")
    }

    // Request account access
    const accounts = (await window.ethereum.request({
      method: "eth_requestAccounts",
    })) as string[]

    // Get the connected address
    const [address] = accounts

      const client = createWalletClient({
              chain: mainnet,
              transport: custom(window.ethereum),
            })

    const result= await deployAccountAndOpenNewZKSessionWithPaymaster(address, client)
    setEnsAddress(result.accountIdentifier)
    console.log(result)
  }
  
  const connectWallet = async () => {
    if (connectedAddress) {
      // If already connected, disconnect
      setConnectedAddress(null)
      return
    }

    setIsConnecting(true)
    setError(null)

    try {
      // Check if MetaMask is installed
      if (!window.ethereum) {
        throw new Error("MetaMask is not installed")
      }

      // Request account access
      const accounts = (await window.ethereum.request({
        method: "eth_requestAccounts",
      })) as string[]

      // Get the connected address
      const [address] = accounts

      console.log("Connected address:", address)
        setConnectedAddress(address)
     
    
    } catch (err) {
      console.error("Failed to connect wallet:", err)
      setError(err instanceof Error ? err.message : "Failed to connect wallet")
    } finally {
      setIsConnecting(false)
    }
  }

  const truncateAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-2 text-center">
          <CardTitle className="text-2xl font-bold">Welcome back!</CardTitle>
          <p className="text-sm text-muted-foreground">
            Do not have a smart account yet?{" "}
            <Button
                variant="outline"
                className="h-14 w-full justify-between bg-white text-left font-normal"
                onClick={createNewSmartAccount}
              >
                Create new smart account
              </Button>
          </p>
        </CardHeader>

        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="ens-address" className="text-sm font-medium">
              ENS | Smart account address <span className="text-red-500">*</span>
            </Label>
            <Input
              id="ens-address"
              placeholder="name.eth or 0x..."
              className="h-14 bg-white"
              required
              value={ensAddress}
              onChange={(e) => setEnsAddress(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="signer" className="text-sm font-medium">
              Signer <span className="text-red-500">*</span>
            </Label>
            <div className="space-y-2">
              <Button
                variant="outline"
                className="h-14 w-full justify-between bg-white text-left font-normal"
                onClick={connectWallet}
                disabled={isConnecting}
              >
                {isConnecting ? (
                  <>
                    <span>Connecting...</span>
                    <span className="rounded-full bg-gray-100 p-2 shadow-sm">
                      <Loader2 className="h-5 w-5 animate-spin text-blue-500" />
                    </span>
                  </>
                ) : connectedAddress ? (
                  <>
                    <span>Connected: {truncateAddress(connectedAddress)}</span>
                    <span className="rounded-full bg-gray-100 p-2 shadow-sm">
                      <CheckCircle className="h-5 w-5 text-green-500" />
                    </span>
                  </>
                ) : (
                  <>
                    <span>Continue with a Wallet</span>
                    <span className="rounded-full bg-gray-100 p-2 shadow-sm">
                      <Wallet className="h-5 w-5 text-blue-500" />
                    </span>
                  </>
                )}
              </Button>
              <Button
                variant="outline"
                className="h-14 w-full justify-between bg-white text-left font-normal"
                disabled={!!connectedAddress}
              >
                Continue with a Passkey
                <span className="rounded-full bg-gray-100 p-2 shadow-sm">
                  <Key className="h-5 w-5 text-blue-500" />
                </span>
              </Button>
              <Button
                variant="outline"
                className="h-14 w-full justify-between bg-white text-left font-normal"
                disabled={!!connectedAddress}
              >
                Continue with a ...
                <span className="rounded-full bg-gray-100 p-2 shadow-sm">
                  <Plus className="h-5 w-5 text-blue-500" />
                </span>
              </Button>
            </div>
          </div>

          {/*error && <p className="text-sm text-red-500">{error}</p>*/}
          {error && (
            <div className="rounded-md bg-red-50 p-4 text-sm text-red-500">
              <div className="flex">
                <div className="flex-shrink-0">
                  <AlertCircle className="h-5 w-5 text-red-400" />
                </div>
                <div className="ml-3">ensAddress
                  <p>{error}</p>
                </div>
              </div>
            </div>
          )}

          <Button
            className="h-14 w-full bg-blue-500 text-lg font-medium hover:bg-blue-600"
            onClick={() => setShowModal(true)}
            disabled={!connectedAddress}
          >
            Sign in
          </Button>
        </CardContent>
      </Card>
      
      {showModal && (
       
        <SmartSessionModal onClose={() => setShowModal(false)} ensAddress= {ensAddress} />

      )}
      
      {/*<Dialog open={showFailureDialog} onOpenChange={setShowFailureDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Signing Failed</DialogTitle>
            <DialogDescription>There was an error while signing the message. Please try again.</DialogDescription>
          </DialogHeader>
          <Button onClick={() => setShowFailureDialog(false)} className="bg-red-500 hover:bg-red-600 text-white">
            Close
          </Button>
        </DialogContent>
      </Dialog>*/}
    </div>
  )
}

