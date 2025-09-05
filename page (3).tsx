"use client"

import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"
import { Menu } from "lucide-react"

export default function HomePage() {
  const router = useRouter()

  const handleLogin = () => {
    router.push("/login")
  }

  const handleGuestStart = () => {
    // ゲストモードのフラグをセッションストレージに保存
    sessionStorage.setItem("isGuest", "true")
    router.push("/guest")
  }

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* 背景画像 */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: "url(/images/nokoru-hero.png)",
        }}
      />

      {/* ヘッダー */}
      <header className="relative z-10 flex justify-between items-center p-6 lg:p-8">
        <div className="w-10 h-10 bg-orange-500 rounded-sm flex items-center justify-center">
          <div className="w-5 h-5 bg-white rounded-sm" />
        </div>
        <Button variant="ghost" size="icon" className="text-white hover:bg-white/10">
          <Menu className="h-6 w-6" />
        </Button>
      </header>

      <div className="absolute bottom-0 left-0 right-0 z-10 p-6 lg:p-8">
        <div className="max-w-sm mx-auto space-y-4">
          <Button
            onClick={handleLogin}
            className="w-full bg-orange-500 hover:bg-orange-600 text-white font-medium py-4 text-lg rounded-xl shadow-lg transition-all duration-200 hover:shadow-xl"
          >
            ログイン
          </Button>

          <Button
            onClick={handleGuestStart}
            variant="secondary"
            className="w-full bg-white/90 hover:bg-white text-gray-800 font-medium py-4 text-lg rounded-xl shadow-lg transition-all duration-200 hover:shadow-xl backdrop-blur-sm"
          >
            ゲストとして始める
          </Button>
        </div>
      </div>
    </div>
  )
}
