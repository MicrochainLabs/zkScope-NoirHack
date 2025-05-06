"use client"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { CheckCircle2, ChevronDown, LogOut, Wallet, Github, Twitter, Globe, User, Banknote } from "lucide-react"

interface AccountButtonProps {
  address: string
  ensName?: string
  onDisconnect: () => void
}

export function AccountButton({ address, ensName, onDisconnect }: AccountButtonProps) {
  // Function to truncate address
  const truncateAddress = (addr: string) => {
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="h-11 space-x-2">
          <div className="flex items-center gap-2">
            <div className="relative">
              <div className="h-8 w-8 rounded-full bg-gray-200" />
              <CheckCircle2 className="absolute -right-0.5 -top-0.5 h-4 w-4 text-blue-500" />
            </div>
            <div className="flex flex-col items-start">
              <div className="flex items-center gap-1">
                <span className="text-sm font-medium">{ensName || "ens.eth"}</span>
                <CheckCircle2 className="h-3 w-3 text-blue-500" />
              </div>
              <span className="text-xs text-muted-foreground">{truncateAddress(address)}</span>
            </div>
          </div>
          <ChevronDown className="h-4 w-4 opacity-50" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-[240px]">
        <div className="flex items-center justify-center gap-4 p-2">
          <a href="#" className="rounded-full p-2 hover:bg-gray-100">
            <Twitter className="h-4 w-4" />
          </a>
          <a href="#" className="rounded-full p-2 hover:bg-gray-100">
            <Github className="h-4 w-4" />
          </a>
          <a href="#" className="rounded-full p-2 hover:bg-gray-100">
            <Globe className="h-4 w-4" />
          </a>
        </div>
        <DropdownMenuSeparator />
        <DropdownMenuItem className="flex items-center gap-2 py-2">
          <Wallet className="h-4 w-4" />
          <span>Wallet</span>
        </DropdownMenuItem>
        <DropdownMenuItem className="flex items-center gap-2 py-2">
          <Banknote className="h-4 w-4" />
          <span>Fund wallet</span>
        </DropdownMenuItem>
        <DropdownMenuItem className="flex items-center gap-2 py-2">
          <User className="h-4 w-4" />
          <span>Claim Basename</span>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          className="flex items-center gap-2 py-2 text-red-500 focus:text-red-500"
          onClick={onDisconnect}
        >
          <LogOut className="h-4 w-4" />
          <span>Disconnect</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

