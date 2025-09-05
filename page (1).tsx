"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useRouter } from "next/navigation"
import { LogOut, Upload, ImageIcon, Users } from "lucide-react"

export default function HomePage() {
  const [username, setUsername] = useState("")
  const router = useRouter()

  useEffect(() => {
    // 認証チェック
    const isAuthenticated = sessionStorage.getItem("isAuthenticated")
    const storedUsername = sessionStorage.getItem("username")

    if (!isAuthenticated) {
      router.push("/login")
      return
    }

    if (storedUsername) {
      setUsername(storedUsername)
    }
  }, [router])

  const handleLogout = () => {
    sessionStorage.removeItem("isAuthenticated")
    sessionStorage.removeItem("username")
    router.push("/")
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ヘッダー */}
      <header className="bg-white shadow-sm p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-orange-500 rounded-sm flex items-center justify-center">
              <div className="w-3 h-3 bg-white rounded-sm" />
            </div>
            <span className="font-bold text-lg">ノコル</span>
          </div>
          <Button variant="ghost" size="sm" onClick={handleLogout}>
            <LogOut className="h-4 w-4 mr-2" />
            ログアウト
          </Button>
        </div>
      </header>

      {/* メインコンテンツ */}
      <main className="p-6">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* ウェルカムメッセージ */}
          <div className="text-center space-y-2">
            <h1 className="text-3xl font-bold text-gray-900">おかえりなさい、{username}さん</h1>
            <p className="text-gray-600">大切な写真を整理して、素敵なアルバムを作りましょう</p>
          </div>

          {/* 機能カード */}
          <div className="grid md:grid-cols-3 gap-6">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardHeader className="text-center">
                <Upload className="h-12 w-12 mx-auto text-orange-500 mb-2" />
                <CardTitle>写真をアップロード</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 text-center">
                  デジタル写真やスキャンした画像をアップロードして整理できます
                </p>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardHeader className="text-center">
                <ImageIcon className="h-12 w-12 mx-auto text-orange-500 mb-2" />
                <CardTitle>アルバム作成</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 text-center">
                  テーマ別にアルバムを作成して、思い出を美しく整理できます
                </p>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardHeader className="text-center">
                <Users className="h-12 w-12 mx-auto text-orange-500 mb-2" />
                <CardTitle>共有機能</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 text-center">
                  家族や友人とアルバムを共有して、一緒に思い出を楽しめます
                </p>
              </CardContent>
            </Card>
          </div>

          {/* アクションボタン */}
          <div className="text-center">
            <Button className="bg-orange-500 hover:bg-orange-600 px-8 py-3">新しいアルバムを作成</Button>
          </div>
        </div>
      </main>
    </div>
  )
}
