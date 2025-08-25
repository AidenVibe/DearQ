"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Plus, Star, Clock, AlertTriangle, Share } from "lucide-react"
import { labels, labelBindings } from "@/lib/dummy-data"

interface SendModalProps {
  isOpen: boolean
  onClose: () => void
  onSendComplete: () => void
  question: string
}

export function SendModal({ isOpen, onClose, onSendComplete }: SendModalProps) {
  const [selectedLabel, setSelectedLabel] = useState<string | null>(null)
  const [newLabelName, setNewLabelName] = useState("")
  const [isAddingLabel, setIsAddingLabel] = useState(false)
  const [isSharing, setIsSharing] = useState(false)

  // Get label with binding info
  const getLabelsWithBindings = () => {
    return labels.map((label) => {
      const binding = labelBindings.find((b) => b.labelId === label.labelId && b.status === "confirmed")
      return {
        ...label,
        binding,
        isRecommended: !!binding,
        displayName: binding ? `${label.name} (최근 ${binding.recipientNickname}님)` : label.name,
      }
    })
  }

  const labelsWithBindings = getLabelsWithBindings()
  const recommendedLabels = labelsWithBindings.filter((l) => l.isRecommended)
  const otherLabels = labelsWithBindings.filter((l) => !l.isRecommended)

  const handleAddLabel = () => {
    if (newLabelName.trim()) {
      // In real app, this would add to the labels list
      console.log("Adding new label:", newLabelName)
      setNewLabelName("")
      setIsAddingLabel(false)
    }
  }

  const handleShare = async () => {
    if (!selectedLabel) return

    setIsSharing(true)

    try {
      // Simulate Kakao sharing
      await new Promise((resolve) => setTimeout(resolve, 1500))

      // In real app, this would:
      // 1. Create send event with token
      // 2. Open Kakao share dialog
      // 3. Handle share completion

      console.log("Shared to Kakao for label:", selectedLabel)
      onSendComplete()
      onClose()
    } catch (error) {
      console.error("Share failed:", error)
    } finally {
      setIsSharing(false)
    }
  }

  const selectedLabelData = labelsWithBindings.find((l) => l.labelId === selectedLabel)
  const isBlocked = selectedLabelData?.blocked

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md mx-auto">
        <DialogHeader>
          <DialogTitle>누구에게 보낼까요?</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Recommended Labels */}
          {recommendedLabels.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Star className="h-4 w-4 text-yellow-500" />
                <span className="text-sm font-medium">추천</span>
              </div>
              <div className="space-y-2">
                {recommendedLabels.map((label) => (
                  <Card
                    key={label.labelId}
                    className={`cursor-pointer transition-colors ${
                      selectedLabel === label.labelId ? "ring-2 ring-primary bg-primary/5" : "hover:bg-accent"
                    }`}
                    onClick={() => setSelectedLabel(label.labelId)}
                  >
                    <CardContent className="p-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">{label.name}</p>
                          <p className="text-sm text-muted-foreground">최근 {label.binding?.recipientNickname}님</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant="secondary" className="text-xs">
                            <Clock className="h-3 w-3 mr-1" />
                            자동 추천
                          </Badge>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Other Labels */}
          {otherLabels.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-3">
                <span className="text-sm font-medium">기타</span>
              </div>
              <div className="space-y-2">
                {otherLabels.map((label) => (
                  <Card
                    key={label.labelId}
                    className={`cursor-pointer transition-colors ${
                      selectedLabel === label.labelId ? "ring-2 ring-primary bg-primary/5" : "hover:bg-accent"
                    } ${label.blocked ? "opacity-60" : ""}`}
                    onClick={() => !label.blocked && setSelectedLabel(label.labelId)}
                  >
                    <CardContent className="p-3">
                      <div className="flex items-center justify-between">
                        <p className="font-medium">{label.name}</p>
                        {label.blocked && (
                          <Badge variant="destructive" className="text-xs">
                            차단됨
                          </Badge>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Add New Label */}
          <div>
            {!isAddingLabel ? (
              <Button variant="outline" className="w-full bg-transparent" onClick={() => setIsAddingLabel(true)}>
                <Plus className="h-4 w-4 mr-2" />새 라벨 추가
              </Button>
            ) : (
              <div className="space-y-2">
                <Input
                  placeholder="라벨 이름 (예: 동생, 친구)"
                  value={newLabelName}
                  onChange={(e) => setNewLabelName(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleAddLabel()}
                />
                <div className="flex gap-2">
                  <Button size="sm" onClick={handleAddLabel}>
                    추가
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      setIsAddingLabel(false)
                      setNewLabelName("")
                    }}
                  >
                    취소
                  </Button>
                </div>
              </div>
            )}
          </div>

          {/* Blocked Warning */}
          {isBlocked && (
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>이 라벨은 수신 거부 상태입니다. 전송하기 전에 상대방과 확인해보세요.</AlertDescription>
            </Alert>
          )}

          {/* Share Button */}
          <div className="pt-4 border-t">
            <Button
              className="w-full"
              size="lg"
              disabled={!selectedLabel || isBlocked || isSharing}
              onClick={handleShare}
            >
              {isSharing ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  카카오로 공유 중...
                </>
              ) : (
                <>
                  <Share className="h-4 w-4 mr-2" />
                  카카오로 공유하기
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
