"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Edit2, Merge, Trash2, Shield, AlertTriangle } from "lucide-react"
import { labels, labelBindings, conversations } from "@/lib/dummy-data"

export default function LabelsPage() {
  const [editingLabel, setEditingLabel] = useState<string | null>(null)
  const [newName, setNewName] = useState("")
  const [mergingLabel, setMergingLabel] = useState<string | null>(null)
  const [mergeTarget, setMergeTarget] = useState<string>("")

  const getLabelsWithStats = () => {
    return labels.map((label) => {
      const binding = labelBindings.find((b) => b.labelId === label.labelId && b.status === "confirmed")
      const conversationCount = conversations.filter((c) => c.labelName === label.name).length
      const lastUsed = binding?.lastUsedAt ? new Date(binding.lastUsedAt) : null

      return {
        ...label,
        binding,
        conversationCount,
        lastUsed,
        recipientName: binding?.recipientNickname,
      }
    })
  }

  const labelsWithStats = getLabelsWithStats()
  const activeLabels = labelsWithStats.filter((l) => !l.blocked)
  const blockedLabels = labelsWithStats.filter((l) => l.blocked)

  const handleRename = (labelId: string) => {
    if (newName.trim()) {
      console.log(`Renaming label ${labelId} to ${newName}`)
      setEditingLabel(null)
      setNewName("")
    }
  }

  const handleMerge = () => {
    if (mergingLabel && mergeTarget) {
      console.log(`Merging label ${mergingLabel} into ${mergeTarget}`)
      setMergingLabel(null)
      setMergeTarget("")
    }
  }

  const handleDelete = (labelId: string) => {
    if (confirm("이 라벨을 삭제하시겠어요? 관련된 대화 기록은 유지됩니다.")) {
      console.log(`Soft deleting label ${labelId}`)
    }
  }

  const handleUnblock = (labelId: string) => {
    console.log(`Unblocking label ${labelId}`)
  }

  return (
    <div className="container mx-auto px-4 py-6 max-w-md">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-2">라벨 관리</h1>
        <p className="text-muted-foreground">가족과의 대화를 더 잘 정리해보세요</p>
      </div>

      {/* Active Labels */}
      <div className="mb-8">
        <h2 className="text-lg font-semibold mb-4">활성 라벨</h2>
        <div className="space-y-3">
          {activeLabels.map((label) => (
            <Card key={label.labelId}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-medium">{label.name}</h3>
                      {label.binding && (
                        <Badge variant="secondary" className="text-xs">
                          연결됨
                        </Badge>
                      )}
                    </div>
                    <div className="text-sm text-muted-foreground space-y-1">
                      {label.recipientName && <p>최근 상대: {label.recipientName}님</p>}
                      <p>대화 {label.conversationCount}회</p>
                      {label.lastUsed && <p>마지막 사용: {label.lastUsed.toLocaleDateString("ko-KR")}</p>}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {/* Rename */}
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <Edit2 className="h-4 w-4" />
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>라벨 이름 변경</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4">
                          <Input
                            placeholder="새 라벨 이름"
                            value={newName}
                            onChange={(e) => setNewName(e.target.value)}
                          />
                          <div className="flex gap-2">
                            <Button onClick={() => handleRename(label.labelId)} className="flex-1">
                              변경
                            </Button>
                            <Button variant="outline" onClick={() => setNewName("")} className="flex-1">
                              취소
                            </Button>
                          </div>
                        </div>
                      </DialogContent>
                    </Dialog>

                    {/* Merge */}
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <Merge className="h-4 w-4" />
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>라벨 병합</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4">
                          <Alert>
                            <AlertTriangle className="h-4 w-4" />
                            <AlertDescription>
                              '{label.name}' 라벨을 다른 라벨과 병합합니다. 모든 대화 기록이 대상 라벨로 이동됩니다.
                            </AlertDescription>
                          </Alert>
                          <Select value={mergeTarget} onValueChange={setMergeTarget}>
                            <SelectTrigger>
                              <SelectValue placeholder="병합할 대상 라벨 선택" />
                            </SelectTrigger>
                            <SelectContent>
                              {activeLabels
                                .filter((l) => l.labelId !== label.labelId)
                                .map((l) => (
                                  <SelectItem key={l.labelId} value={l.labelId}>
                                    {l.name}
                                  </SelectItem>
                                ))}
                            </SelectContent>
                          </Select>
                          <div className="flex gap-2">
                            <Button
                              onClick={() => {
                                setMergingLabel(label.labelId)
                                handleMerge()
                              }}
                              disabled={!mergeTarget}
                              className="flex-1"
                            >
                              병합
                            </Button>
                            <Button variant="outline" onClick={() => setMergeTarget("")} className="flex-1">
                              취소
                            </Button>
                          </div>
                        </div>
                      </DialogContent>
                    </Dialog>

                    {/* Delete */}
                    <Button variant="ghost" size="sm" onClick={() => handleDelete(label.labelId)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Blocked Labels */}
      {blockedLabels.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Shield className="h-5 w-5" />
            차단된 라벨
          </h2>
          <div className="space-y-3">
            {blockedLabels.map((label) => (
              <Card key={label.labelId} className="bg-destructive/5 border-destructive/20">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium text-destructive">{label.name}</h3>
                      <p className="text-sm text-muted-foreground">수신 거부 상태</p>
                    </div>
                    <Button variant="outline" size="sm" onClick={() => handleUnblock(label.labelId)}>
                      차단 해제
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
