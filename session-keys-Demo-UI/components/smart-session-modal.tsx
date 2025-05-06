import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { storeZkSessionKeyInLocalStorage } from "@/libs/utils"
import { Loader2 } from "lucide-react"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { createWalletClient, custom, WalletClient } from "viem"
import { mainnet } from "viem/chains"
import { openNewZKSessionWithPaymaster } from "./openNewZkSession"

interface SmartSessionModalProps {
  onClose: () => void,
  ensAddress: string
}

export function SmartSessionModal({ onClose, ensAddress }: SmartSessionModalProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [walletClient, setWalletClient] = useState<WalletClient | null>(null)

  useEffect(() => {
    const checkEthereumObject = async () => {
      if (typeof window.ethereum === "undefined") {
        setError("MetaMask is not installed. Please install MetaMask to use this feature.")
      } else {
        const client = createWalletClient({
          chain: mainnet,
          transport: custom(window.ethereum),
        })
        setWalletClient(client)
      }
    }

    checkEthereumObject()
  }, [])


  const handleConfirm = async () => {
    setIsLoading(true)
    setError("")

    try {
      if (!walletClient) {
        throw new Error("Wallet client not initialized")
      }

      const [address] = await walletClient.requestAddresses()

      if (!address) {
        throw new Error("No accounts found. Please connect to MetaMask.")
      }
      
      const zkSessionKey= await openNewZKSessionWithPaymaster(ensAddress, address, walletClient)
      storeZkSessionKeyInLocalStorage(zkSessionKey);
      console.log("zkSessionKey: ", zkSessionKey)

      router.push(`/bill-payment?address=${ensAddress}`)
    } catch (err) {
      console.error("Error during signing process:", err)
      if (err instanceof Error) {
        setError(err.message)
      } else if (typeof err === "object" && err !== null) {
        setError(JSON.stringify(err))
      } else {
        setError("An unknown error occurred. Please try again.")
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-xl font-semibold">Smart session creation</CardTitle>
        </CardHeader>

        <CardContent className="space-y-6">
          <p className="text-sm text-muted-foreground">The smart session allowed for:</p>
          <ul className="list-disc pl-5 text-sm text-muted-foreground">
            <li>Using stablecoins: USDC, DAI, and USDT</li>
            <li>Transfer money to electricity, water, and Internet companies accounts</li>
          </ul>
          <div className="flex gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#2775CA]">
              <Image src="/usd-coin-usdc-logo.png?height=32&width=32" alt="USDC" width={32} height={32} />
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#F4B731]">
              <Image src="/multi-collateral-dai-dai-logo.png?height=32&width=32" alt="DAI" width={32} height={32} />
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#26A17B]">
              <Image src="/tether-usdt-logo.png?height=32&width=32" alt="USDT" width={32} height={32} />
            </div>
          </div>

          {error && (
            <div className="rounded-md bg-red-50 p-4 text-sm text-red-500">
              <p>{error}</p>
            </div>
          )}

          <div className="flex gap-3">
            <Button variant="outline" className="flex-1" onClick={onClose} disabled={isLoading}>
              Cancel
            </Button>
            <Button className="flex-1 bg-blue-500 hover:bg-blue-600" onClick={handleConfirm} disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                "Confirm"
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

