"use client"

import { useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useRouter } from "next/navigation"
import { ArrowLeft, Upload, Eye, Download } from "lucide-react"

export default function GuestPage() {
  const router = useRouter()

  useEffect(() => {
    // ゲストモードのフラグを確認
    const isGuest = sessionStorage.getItem("isGuest")
    if (!isGuest) {
      router.push("/")
    }
  }, [router])

  const handleBack = () => {
    sessionStorage.removeItem("isGuest")
    router.push("/")
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ヘッダー */}
      <header className="bg-white shadow-sm p-4">
        <div className="flex items-center justify-between">
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
          <div className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">ゲストモード</div>
        </div>
      </header>

      {/* メインコンテンツ */}
      <main className="p-6">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* ウェルカムメッセージ */}
          <div className="text-center space-y-2">
            <h1 className="text-3xl font-bold text-gray-900">ゲストモードへようこそ</h1>
            <p className="text-gray-600">アカウント登録なしで、ノコルの基本機能をお試しいただけます</p>
          </div>

          {/* 制限事項の説明 */}
          <Card className="bg-blue-50 border-blue-200">
            <CardContent className="p-4">
              <h3 className="font-semibold text-blue-900 mb-2">ゲストモードの制限</h3>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• 写真の保存期間は24時間です</li>
                <li>• アップロードできる写真は最大10枚までです</li>
                <li>• 共有機能は利用できません</li>
                <li>• アルバムの永続保存はできません</li>
              </ul>
            </CardContent>
          </Card>

          {/* 機能カード */}
          <div className="grid md:grid-cols-3 gap-6">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardHeader className="text-center">
                <Upload className="h-12 w-12 mx-auto text-orange-500 mb-2" />
                <CardTitle>写真アップロード</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 text-center mb-4">
                  最大10枚まで写真をアップロードしてお試しいただけます
                </p>
                <Button className="w-full bg-orange-500 hover:bg-orange-600">写真を選択</Button>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardHeader className="text-center">
                <Eye className="h-12 w-12 mx-auto text-orange-500 mb-2" />
                <CardTitle>プレビュー機能</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 text-center mb-4">アルバムのレイアウトをプレビューできます</p>
                <Button variant="outline" className="w-full bg-transparent">
                  プレビューを見る
                </Button>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardHeader className="text-center">
                <Download className="h-12 w-12 mx-auto text-orange-500 mb-2" />
                <CardTitle>ダウンロード</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 text-center mb-4">作成したアルバムをPDFでダウンロードできます</p>
                <Button variant="outline" className="w-full bg-transparent">
                  ダウンロード
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* アカウント作成の案内 */}
          <Card className="bg-orange-50 border-orange-200">
            <CardContent className="p-6 text-center">
              <h3 className="font-semibold text-orange-900 mb-2">もっと便利に使いませんか？</h3>
              <p className="text-orange-800 mb-4">
                アカウントを作成すると、写真の永続保存や共有機能など、すべての機能をご利用いただけます
              </p>
              <Button className="bg-orange-500 hover:bg-orange-600">アカウントを作成</Button>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
