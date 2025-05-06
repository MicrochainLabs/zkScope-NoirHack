import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Zap, Droplet, Wifi } from "lucide-react"

interface BillCardProps {
  title: string
  paymentMethod: string
  amount: number
  onPay: () => void
}

export function BillCard({ title, paymentMethod, amount, onPay }: BillCardProps) {
  const getBillIcon = (title: string) => {
    if (title.toLowerCase().includes("electricity")) return <Zap className="h-5 w-5" />
    if (title.toLowerCase().includes("water")) return <Droplet className="h-5 w-5" />
    if (title.toLowerCase().includes("internet")) return <Wifi className="h-5 w-5" />
    return null
  }

  const getStablecoinColor = (paymentMethod: string) => {
    switch (paymentMethod.toLowerCase()) {
      case "usdc":
        return "bg-blue-500"
      case "dai":
        return "bg-yellow-500"
      case "usdt":
        return "bg-green-500"
      default:
        return "bg-gray-500"
    }
  }

  return (
    <Card className="bg-white">
      <CardContent className="flex items-center justify-between p-4">
        <div className="flex items-center space-x-4">
          <div className="rounded-full bg-gray-100 p-2">{getBillIcon(title)}</div>
          <div>
            <h3 className="font-medium">{title}</h3>
            <div className="flex items-center space-x-2">
              <div className={`h-3 w-3 rounded-full ${getStablecoinColor(paymentMethod)}`}></div>
              <p className="text-sm text-muted-foreground">
                {paymentMethod} - ${amount}
              </p>
            </div>
          </div>
        </div>
        <Button variant="outline" onClick={onPay}>
          View Details
        </Button>
      </CardContent>
    </Card>
  )
}

