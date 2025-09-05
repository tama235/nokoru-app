"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useRouter } from "next/navigation"
import { ArrowLeft } from "lucide-react"

export default function LoginPage() {
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setIsLoading(true)

    // 簡易認証ロジック
    if (username === "test" && password === "1234") {
      // ログイン成功
      sessionStorage.setItem("isAuthenticated", "true")
      sessionStorage.setItem("username", username)
      router.push("/home")
    } else {
      // ログイン失敗
      setError("ユーザー名またはパスワードが正しくありません。")
    }

    setIsLoading(false)
  }

  const handleBack = () => {
    router.push("/")
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* ヘッダー */}
      <header className="bg-white shadow-sm p-4">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={handleBack}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-orange-500 rounded-sm flex items-center justify-center">
              <div className="w-3 h-3 bg-white rounded-sm" />
            </div>
            <span className="font-bold text-lg">ノコル</span>
          </div>
        </div>
      </header>

      {/* メインコンテンツ */}
      <main className="flex-1 flex items-center justify-center p-6">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold">ログイン</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <div className="space-y-2">
                <Label htmlFor="username">ユーザー名</Label>
                <Input
                  id="username"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="ユーザー名を入力してください"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">パスワード</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="パスワードを入力してください"
                  required
                />
              </div>

              <Button type="submit" className="w-full bg-orange-500 hover:bg-orange-600" disabled={isLoading}>
                {isLoading ? "ログイン中..." : "ログイン"}
              </Button>
            </form>

            <div className="mt-4 text-center text-sm text-gray-600">
              <p>テスト用アカウント:</p>
              <p>ユーザー名: test / パスワード: 1234</p>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
