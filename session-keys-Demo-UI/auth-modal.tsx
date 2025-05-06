"use client"

import { X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"
import Image from "next/image"

export default function AuthModal() {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/50 p-4">
      <Card className="relative w-full max-w-md">
        <Button
          variant="ghost"
          size="icon"
          className="absolute right-2 top-2 rounded-full"
          onClick={() => console.log("Close modal")}
        >
          <X className="h-4 w-4" />
        </Button>

        <CardHeader className="space-y-6 text-center">
          <div className="relative mx-auto h-12 w-12">
            <div className="absolute inset-0 animate-pulse rounded-full bg-blue-500/20 blur-xl" />
            <div className="relative h-12 w-12 rounded-full bg-blue-500" />
          </div>
          <CardTitle className="text-2xl font-bold">OnchainKit Playground</CardTitle>
        </CardHeader>

        <CardContent className="space-y-4">
          <Button variant="secondary" className="h-14 w-full justify-between text-lg font-normal">
            Sign up
            <span className="rounded-full bg-background p-2">👤</span>
          </Button>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-sm text-muted-foreground">
              <span className="bg-card px-2">or continue with an existing wallet</span>
            </div>
          </div>

          <div className="space-y-2">
            <Button variant="secondary" className="h-14 w-full justify-between text-lg font-normal">
              Coinbase Wallet
              <Image
                src="/placeholder.svg?height=24&width=24"
                alt="Coinbase"
                width={24}
                height={24}
                className="rounded bg-blue-500"
              />
            </Button>

            <Button variant="secondary" className="h-14 w-full justify-between text-lg font-normal">
              MetaMask
              <Image
                src="/placeholder.svg?height=24&width=24"
                alt="MetaMask"
                width={24}
                height={24}
                className="rounded bg-orange-500"
              />
            </Button>

            <Button variant="secondary" className="h-14 w-full justify-between text-lg font-normal">
              Phantom
              <Image
                src="/placeholder.svg?height=24&width=24"
                alt="Phantom"
                width={24}
                height={24}
                className="rounded bg-purple-500"
              />
            </Button>
          </div>

          <p className="text-center text-sm text-muted-foreground">
            By connecting a wallet, you agree to our{" "}
            <Link href="/terms" className="text-primary hover:underline">
              Terms of Service
            </Link>{" "}
            and{" "}
            <Link href="/privacy" className="text-primary hover:underline">
              Privacy Policy
            </Link>
            .
          </p>
        </CardContent>
      </Card>
    </div>
  )
}

