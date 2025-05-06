"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { BillCard } from "@/components/bill-card"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Zap, Droplet, Wifi, ChevronDown } from "lucide-react"
import { ConfirmPaymentModal } from "./confirm-payment-modal"
import { AccountButton } from "./account-button"
import type { Address } from "viem"
import { useSearchParams } from "next/navigation"

export default function BillPayment() {
  const [selectedBill, setSelectedBill] = useState("electricity")
  const [selectedStablecoin, setSelectedStablecoin] = useState("usdc")
  const [amount, setAmount] = useState("")
  const [showConfirmModal, setShowConfirmModal] = useState(false)

  const searchParams = useSearchParams()
  const smartAccountAddress = searchParams.get("address") || ""

  // Mock ENS name - in a real app, this would come from ENS resolution
  const ensName = "ens.eth"

  const billIcons = {
    electricity: <Zap className="h-5 w-5" />,
    water: <Droplet className="h-5 w-5" />,
    internet: <Wifi className="h-5 w-5" />,
  }

  const stablecoins: Record<string, { name: string; color: string; logo: string; address: Address }> = {
    usdc: {
      name: "USDC",
      color: "bg-blue-500",
      logo: "/usd-coin-usdc-logo.png?height=24&width=24",
      address: "0x337Df693AE75a0ff64317A77dAC8886F61455b85",
    },
    dai: {
      name: "DAI",
      color: "bg-yellow-500",
      logo: "/multi-collateral-dai-dai-logo.png?height=24&width=24",
      address: "0x2CA1d854C83997d56263Bf560A2D198911383b2b",
    },
    usdt: {
      name: "USDT",
      color: "bg-green-500",
      logo: "/tether-usdt-logo.png?height=24&width=24",
      address: "0x94D869Ed79067747Be5f160a9566CC79DDc28C3E",
    },
  }

  const getBillName = (type: string) => {
    switch (type) {
      case "electricity":
        return "Electricity Bill"
      case "water":
        return "Water Bill"
      case "internet":
        return "Internet Bill"
      default:
        return "Bill"
    }
  }

  const getBillAddress = (type: string) : Address => {
    switch (type) {
      case "electricity":
        return "0xbd8faF57134f9C5584da070cC0be7CA8b5A24953"
      case "water":
        return "0xb9890DC58a1A1a9264cc0E3542093Ee0A1780822"
      case "internet":
        return "0x45B52500cb12Ae6046D8566598aB9ccFa7B21aD7"
      default:
        return "0x"
    }
  }

  const handleDisconnect = () => {
    console.log("Disconnecting wallet...")
    // Add your disconnect logic here
  }

  return (
    <div className="container mx-auto max-w-2xl space-y-6 p-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <CardTitle className="text-2xl font-bold">Bill Payment</CardTitle>
          <AccountButton address={smartAccountAddress} ensName={ensName} onDisconnect={handleDisconnect} />
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="pay" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="pay">Pay a Bill</TabsTrigger>
              <TabsTrigger value="history">Payment History</TabsTrigger>
            </TabsList>
            <TabsContent value="pay" className="space-y-4 pt-4">
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Bill Type</label>
                  <Select value={selectedBill} onValueChange={setSelectedBill}>
                    <SelectTrigger className="h-14">
                      <SelectValue placeholder="Select bill type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="electricity">
                        <div className="flex items-center">
                          <Zap className="mr-2 h-4 w-4" />
                          Electricity
                        </div>
                      </SelectItem>
                      <SelectItem value="water">
                        <div className="flex items-center">
                          <Droplet className="mr-2 h-4 w-4" />
                          Water
                        </div>
                      </SelectItem>
                      <SelectItem value="internet">
                        <div className="flex items-center">
                          <Wifi className="mr-2 h-4 w-4" />
                          Internet
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Amount and Stablecoin</label>
                  <div className="flex overflow-hidden rounded-md border">
                    <Input
                      type="number"
                      placeholder="0.00"
                      className="flex-1 border-none px-4 py-3 text-right text-lg"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                    />
                    <Select value={selectedStablecoin} onValueChange={setSelectedStablecoin}>
                      <SelectTrigger className="w-32 border-l bg-gray-50 px-4 py-3">
                        <div className="flex items-center">
                          <div className={`mr-2 h-5 w-5 rounded-full ${stablecoins[selectedStablecoin].color}`}></div>
                          <span className="mr-1">{stablecoins[selectedStablecoin].name}</span>
                          <ChevronDown className="h-4 w-4 opacity-50" />
                        </div>
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(stablecoins).map(([value, { name, color }]) => (
                          <SelectItem key={value} value={value}>
                            <div className="flex items-center">
                              <div className={`mr-2 h-4 w-4 rounded-full ${color}`}></div>
                              {name}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              <Button
                className="h-14 w-full bg-blue-500 text-lg font-medium hover:bg-blue-600"
                onClick={() => setShowConfirmModal(true)}
                disabled={!amount || Number.parseFloat(amount) <= 0}
              >
                Pay Bill
              </Button>
            </TabsContent>
            <TabsContent value="history" className="pt-4">
              <div className="space-y-4">
                <BillCard
                  title="Electricity - January"
                  paymentMethod="USDC"
                  amount={100}
                  onPay={() => console.log("View details")}
                />
                <BillCard
                  title="Water - January"
                  paymentMethod="DAI"
                  amount={50}
                  onPay={() => console.log("View details")}
                />
                <BillCard
                  title="Internet - January"
                  paymentMethod="USDT"
                  amount={75}
                  onPay={() => console.log("View details")}
                />
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {showConfirmModal && (
        <ConfirmPaymentModal
          amount={amount}
          stablecoin={{
            name: stablecoins[selectedStablecoin].name,
            color: stablecoins[selectedStablecoin].color,
            address: stablecoins[selectedStablecoin].address,
            logo: stablecoins[selectedStablecoin].logo
          }}
          billType={{
            name: getBillName(selectedBill),
            address: getBillAddress(selectedBill)
          }}
          onClose={() => setShowConfirmModal(false)}
          onConfirm={() => {
            console.log("Payment confirmed", {
              bill: selectedBill,
              amount,
              stablecoin: selectedStablecoin,
            })
            //setShowConfirmModal(false)
          }}
        />
      )}
    </div>
  )
}

