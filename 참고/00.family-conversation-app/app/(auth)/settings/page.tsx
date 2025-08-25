"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Bell, Clock, LogOut, Trash2, Shield, AlertTriangle } from "lucide-react"

export default function SettingsPage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [settings, setSettings] = useState({
    sendTime: "09",
    reminderEnabled: true,
    notificationsEnabled: true,
  })

  useEffect(() => {
    const userData = localStorage.getItem("user")
    if (userData) {
      setUser(JSON.parse(userData))
    }
  }, [])

  const handleLogout = () => {
    if (confirm("로그아웃 하시겠어요?")) {
      localStorage.removeItem("isAuthenticated")
      localStorage.removeItem("user")
      router.push("/")
    }
  }

  const handleDeleteAccount = () => {
    if (confirm("정말로 계정을 삭제하시겠어요? 모든 데이터가 영구적으로 삭제됩니다.")) {
      if (confirm("마지막 확인입니다. 계정 삭제는 되돌릴 수 없습니다.")) {
        localStorage.clear()
        router.push("/")
      }
    }
  }

  const handleSettingChange = (key: string, value: any) => {
    setSettings((prev) => ({ ...prev, [key]: value }))
    console.log(`Setting ${key} changed to:`, value)
  }

  return (
    <div className="container mx-auto px-4 py-6 max-w-md">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-2">설정</h1>
        <p className="text-muted-foreground">앱 사용 환경을 개인화해보세요</p>
      </div>

      {/* User Info */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-lg">계정 정보</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <p className="font-medium">{user?.nickname || "사용자"}</p>
            <p className="text-sm text-muted-foreground">카카오 계정으로 로그인</p>
          </div>
        </CardContent>
      </Card>

      {/* Notification Settings */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Bell className="h-5 w-5" />
            알림 설정
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">푸시 알림</p>
              <p className="text-sm text-muted-foreground">새로운 질문과 답변 알림</p>
            </div>
            <Switch
              checked={settings.notificationsEnabled}
              onCheckedChange={(checked) => handleSettingChange("notificationsEnabled", checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">리마인더</p>
              <p className="text-sm text-muted-foreground">답변하지 않은 질문 알림</p>
            </div>
            <Switch
              checked={settings.reminderEnabled}
              onCheckedChange={(checked) => handleSettingChange("reminderEnabled", checked)}
            />
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              <p className="font-medium">발송 시간대</p>
            </div>
            <Select value={settings.sendTime} onValueChange={(value) => handleSettingChange("sendTime", value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="09">오전 9시</SelectItem>
                <SelectItem value="12">오후 12시</SelectItem>
                <SelectItem value="19">오후 7시</SelectItem>
                <SelectItem value="custom">직접 설정</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Privacy & Security */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Shield className="h-5 w-5" />
            개인정보 및 보안
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <Button variant="outline" className="w-full justify-start bg-transparent">
            개인정보 처리방침
          </Button>
          <Button variant="outline" className="w-full justify-start bg-transparent">
            서비스 이용약관
          </Button>
          <Button variant="outline" className="w-full justify-start bg-transparent">
            차단 관리
          </Button>
        </CardContent>
      </Card>

      {/* Account Actions */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-lg">계정 관리</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <Button variant="outline" onClick={handleLogout} className="w-full justify-start bg-transparent">
            <LogOut className="h-4 w-4 mr-2" />
            로그아웃
          </Button>

          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>계정을 삭제하면 모든 대화 기록과 데이터가 영구적으로 삭제됩니다.</AlertDescription>
          </Alert>

          <Button variant="destructive" onClick={handleDeleteAccount} className="w-full justify-start">
            <Trash2 className="h-4 w-4 mr-2" />
            계정 삭제
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
