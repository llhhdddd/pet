import { useState, useEffect } from 'react'
import Card from '../components/common/Card'
import Button from '../components/common/Button'
import useStore from '../store/useStore'

interface Action {
  id: string
  name: string
  icon: string
  cost: number
  effect: {
    hunger?: number
    happiness?: number
    health?: number
    growth?: number
  }
  description: string
}

const actions: Action[] = [
  { id: 'feed', name: '喂食', icon: '🍖', cost: 10, effect: { hunger: 30, happiness: 5 }, description: '给宠物喂喜欢的食物' },
  { id: 'play', name: '玩耍', icon: '🎾', cost: 15, effect: { happiness: 40, hunger: -10 }, description: '和宠物一起玩游戏' },
  { id: 'bath', name: '洗澡', icon: '🛁', cost: 20, effect: { health: 30, happiness: 10 }, description: '给宠物清洁身体' },
  { id: 'walk', name: '散步', icon: '🚶', cost: 15, effect: { happiness: 20, health: 10, hunger: -15 }, description: '带宠物出去走走' },
  { id: 'study', name: '学习', icon: '📚', cost: 0, effect: { growth: 10, happiness: 5 }, description: '陪伴宠物一起学习' },
  { id: 'sleep', name: '休息', icon: '😴', cost: 0, effect: { health: 15, hunger: -10 }, description: '让宠物好好休息' },
]

const evolutionStages = [
  { level: 1, name: '小橘', emoji: '🐱', progress: 0 },
  { level: 2, name: '大橘', emoji: '🐱', progress: 100 },
  { level: 3, name: '橘猫', emoji: '🐯', progress: 300 },
  { level: 4, name: '虎王', emoji: '🦁', progress: 600 },
  { level: 5, name: '神兽', emoji: '🐉', progress: 1000 },
]

function Pet() {
  const { currentPet, updatePet, goldBalance, updateGold } = useStore()
  const [actionCooldown, setActionCooldown] = useState<string | null>(null)
  const [showEffect, setShowEffect] = useState<{ type: string; value: number } | null>(null)
  const [mood, setMood] = useState<string>('happy')

  const pet = currentPet || { id: 1, name: '小橘', level: 1, growth: 0, health: 100, hunger: 80, happiness: 90 }

  const currentStage = evolutionStages.find((s, i) => {
    const nextStage = evolutionStages[i + 1]
    return nextStage ? pet.growth < nextStage.progress : true
  }) || evolutionStages[evolutionStages.length - 1]

  const nextStage = evolutionStages.find(s => s.progress > pet.growth)
  const evolutionProgress = nextStage
    ? ((pet.growth - currentStage.progress) / (nextStage.progress - currentStage.progress)) * 100
    : 100

  useEffect(() => {
    if (pet.happiness < 30) setMood('sad')
    else if (pet.happiness < 60) setMood('neutral')
    else setMood('happy')
  }, [pet.happiness])

  useEffect(() => {
    const interval = setInterval(() => {
      updatePet({
        hunger: Math.max(0, pet.hunger - 1),
        happiness: Math.max(0, pet.happiness - 0.5)
      })
    }, 30000)
    return () => clearInterval(interval)
  }, [pet.hunger, pet.happiness])

  const handleAction = async (action: Action) => {
    if (actionCooldown || goldBalance < action.cost) return

    setActionCooldown(action.id)
    updateGold(-action.cost)

    const newStats = {
      hunger: Math.min(100, pet.hunger + (action.effect.hunger || 0)),
      happiness: Math.min(100, pet.happiness + (action.effect.happiness || 0)),
      health: Math.min(100, pet.health + (action.effect.health || 0)),
      growth: pet.growth + (action.effect.growth || 0),
    }

    updatePet(newStats)

    Object.entries(action.effect).forEach(([key, value]) => {
      if (value && value > 0) {
        setShowEffect({ type: key, value })
        setTimeout(() => setShowEffect(null), 1500)
      }
    })

    setTimeout(() => setActionCooldown(null), 2000)
  }

  const getMoodEmoji = () => {
    switch (mood) {
      case 'happy': return '😊'
      case 'neutral': return '😐'
      case 'sad': return '😢'
    }
  }

  const getStatusColor = (value: number) => {
    if (value >= 70) return 'bg-green-500'
    if (value >= 40) return 'bg-yellow-500'
    return 'bg-red-500'
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-gradient-to-br from-orange-400 to-amber-500 rounded-xl flex items-center justify-center">
          <span className="text-2xl">🐱</span>
        </div>
        <div>
          <h1 className="text-2xl font-bold text-white text-white-shadow">宠物养成</h1>
          <p className="text-white/80 text-white-shadow">照顾你的学习伙伴</p>
        </div>
      </div>

      <Card className="animate-fadeIn">
        <div className="text-center py-6 relative">
          <div className="text-8xl mb-2 transition-transform hover:scale-110 duration-300">
            {currentStage.emoji}
          </div>
          <h2 className="text-2xl font-bold text-gray-800">{pet.name}</h2>
          <p className="text-gray-500 text-sm mb-1">等级 {pet.level} · {currentStage.name}</p>
          <div className="flex items-center justify-center gap-1 text-2xl">
            <span>{getMoodEmoji()}</span>
          </div>

          {showEffect && (
            <div className="absolute top-4 right-4 bg-white rounded-full px-4 py-2 shadow-lg animate-bounce">
              <span className="text-green-500 font-bold">
                +{showEffect.value} {showEffect.type === 'hunger' ? '饱食' : showEffect.type === 'happiness' ? '快乐' : showEffect.type === 'health' ? '健康' : '成长'}
              </span>
            </div>
          )}
        </div>

        <div className="space-y-3 mt-4">
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span className="text-gray-600">饱食度</span>
              <span className="text-orange-500">{Math.round(pet.hunger)}%</span>
            </div>
            <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
              <div className={`h-full ${getStatusColor(pet.hunger)} transition-all duration-500`} style={{ width: `${pet.hunger}%` }} />
            </div>
          </div>

          <div>
            <div className="flex justify-between text-sm mb-1">
              <span className="text-gray-600">快乐度</span>
              <span className="text-pink-500">{Math.round(pet.happiness)}%</span>
            </div>
            <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
              <div className={`h-full ${getStatusColor(pet.happiness)} transition-all duration-500`} style={{ width: `${pet.happiness}%` }} />
            </div>
          </div>

          <div>
            <div className="flex justify-between text-sm mb-1">
              <span className="text-gray-600">健康值</span>
              <span className="text-blue-500">{Math.round(pet.health)}%</span>
            </div>
            <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
              <div className={`h-full ${getStatusColor(pet.health)} transition-all duration-500`} style={{ width: `${pet.health}%` }} />
            </div>
          </div>

          <div>
            <div className="flex justify-between text-sm mb-1">
              <span className="text-gray-600">成长值</span>
              <span className="text-purple-500">{pet.growth} / {nextStage?.progress || 1000}</span>
            </div>
            <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
              <div className="h-full bg-purple-500 transition-all duration-500" style={{ width: `${evolutionProgress}%` }} />
            </div>
            <p className="text-center text-xs text-gray-400 mt-1">
              {nextStage ? `再获得 ${nextStage.progress - pet.growth} 成长值即可进化为 ${nextStage.name}` : '已达到最高等级！'}
            </p>
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {actions.map(action => (
          <Card key={action.id} hover className="text-center">
            <button
              onClick={() => handleAction(action)}
              disabled={actionCooldown !== null || goldBalance < action.cost}
              className={`w-full ${actionCooldown === action.id ? 'opacity-50' : ''}`}
            >
              <div className="text-4xl mb-1">{action.icon}</div>
              <h3 className="font-bold text-gray-800">{action.name}</h3>
              <p className="text-xs text-gray-500 mb-2">{action.description}</p>
              <div className="text-amber-500 text-sm">
                {action.cost > 0 ? `💰 ${action.cost}` : '免费'}
              </div>
            </button>
          </Card>
        ))}
      </div>

      <Card className="animate-fadeIn">
        <h3 className="font-bold text-gray-800 mb-3">进化历程</h3>
        <div className="flex items-center justify-between">
          {evolutionStages.map((stage, i) => (
            <div key={stage.level} className="flex flex-col items-center">
              <div className={`w-12 h-12 rounded-full flex items-center justify-center text-2xl ${
                pet.growth >= stage.progress ? 'bg-orange-100' : 'bg-gray-100'
              }`}>
                {stage.emoji}
              </div>
              <span className="text-xs mt-1 text-gray-600">{stage.name}</span>
              <span className="text-xs text-gray-400">Lv.{stage.level}</span>
              {i < evolutionStages.length - 1 && (
                <div className={`absolute h-1 w-8 ${pet.growth >= stage.progress ? 'bg-orange-400' : 'bg-gray-200'}`}
                  style={{ left: `${(i + 1) * 20}%` }} />
              )}
            </div>
          ))}
        </div>
      </Card>
    </div>
  )
}

export default Pet