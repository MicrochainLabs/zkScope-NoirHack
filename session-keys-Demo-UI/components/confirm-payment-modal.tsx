import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { X, Check, Loader2 } from "lucide-react"
import Image from "next/image"
import { createPublicClient, http, createWalletClient, custom, parseEther, type Address } from "viem"
import { polygon } from "viem/chains"
import { erc20TransferWithPaymaster } from "./erc20Transfer"
import { loadZkSessionKeyFromLocalStorage } from "@/libs/utils"

interface ConfirmPaymentModalProps {
  amount: string
  stablecoin: {
    name: string
    color: string
    address: Address
    logo: string
  }
  billType: {
    name: string,
    address: Address
  }
  onClose: () => void
  onConfirm: () => void
}

export function ConfirmPaymentModal({ amount, stablecoin, billType, onClose, onConfirm }: ConfirmPaymentModalProps) {
  const [transactionState, setTransactionState] = useState<"idle" | "pending" | "success" | "error">("idle")
  const [transactionHash, setTransactionHash] = useState<`0x${string}` | null>(null)

  const sendTransaction = async () => {
    setTransactionState("pending")
    try {
    
      const zkSessionKey = loadZkSessionKeyFromLocalStorage()
      if(zkSessionKey == null){
        console.error("Transaction failed")
        setTransactionState("error")
        return;
      }
      const result=  await erc20TransferWithPaymaster(stablecoin.address, billType.address, amount, zkSessionKey?.accountIdentifier, zkSessionKey?.sessionOwnerPrivateKey, zkSessionKey?.sessionAllowedSmartContracts, zkSessionKey?.sessionAllowedToTree)
      setTransactionHash(result.txHash)
      if (result.success) {
      //if (receipt.status === "success") {
        setTransactionState("success")
        onConfirm()
      } else {
        throw new Error("Transaction failed")
      }
    } catch (error) {
      console.error("Transaction failed:", error)
      setTransactionState("error")
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <Card className="relative w-full max-w-sm overflow-hidden">
        <CardHeader className="border-b px-4 py-3">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium">Confirm Payment</h3>
            <Button
              variant="ghost"
              size="icon"
              className="rounded-full"
              onClick={onClose}
              disabled={transactionState === "pending"}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-6 p-0">
          <div className="space-y-1 bg-gray-50 px-4 py-6 text-center">
            <p className="text-sm text-muted-foreground">Paying for {billType.name}</p>
            <div className="text-4xl font-bold">${amount}</div>
          </div>

          <div className="px-4">
            <div className="rounded-lg bg-gray-50 p-3">
              <div className="flex items-center space-x-3">
                <div className={`h-8 w-8 rounded-full ${stablecoin.color}`}>
                  <Image
                    src={stablecoin.logo}
                    alt={stablecoin.name}
                    width={32}
                    height={32}
                    className="h-8 w-8"
                  />
                </div>
                <p className="font-medium">{stablecoin.name}</p>
              </div>
            </div>
          </div>

          <div className="p-4">
            {transactionState === "idle" && (
              <Button
                className="h-12 w-full bg-blue-500 text-base font-medium hover:bg-blue-600"
                onClick={sendTransaction}
              >
                Confirm Payment
              </Button>
            )}
            {transactionState === "pending" && (
              <Button className="h-12 w-full bg-blue-500 text-base font-medium" disabled>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Processing...
              </Button>
            )}
            {transactionState === "success" && (
              <div className="text-center">
                <Check className="mx-auto h-8 w-8 text-green-500" />
                <p className="mt-2 text-sm font-medium text-green-500">Payment Successful</p>
                {transactionHash && (
                  <a
                    href={`https://polygonscan.com/tx/${transactionHash}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-2 block text-xs text-blue-500 hover:underline"
                  >
                    View on PolygonScan
                  </a>
                )}
              </div>
            )}
            {transactionState === "error" && (
              <div className="text-center">
                <X className="mx-auto h-8 w-8 text-red-500" />
                <p className="mt-2 text-sm font-medium text-red-500">Transaction Failed</p>
                <Button
                  className="mt-4 h-12 w-full bg-blue-500 text-base font-medium hover:bg-blue-600"
                  onClick={sendTransaction}
                >
                  Try Again
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

