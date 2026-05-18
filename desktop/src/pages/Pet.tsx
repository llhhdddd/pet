import { useState, useEffect } from 'react'
import { Cat, Heart, Utensils, Gamepad2, Star, Gift, Zap, Cookie, IceCream, Cake } from 'lucide-react'
import Card from '../components/common/Card'
import Button from '../components/common/Button'
import useStore from '../store/useStore'

function Pet() {
  const currentPet = useStore((state) => state.currentPet)
  const goldBalance = useStore((state) => state.goldBalance)
  const feedPet = useStore((state) => state.feedPet)
  const playPet = useStore((state) => state.playPet)
  const updatePetStatus = useStore((state) => state.setCurrentPet)
  
  const [isFeeding, setIsFeeding] = useState(false)
  const [isPlaying, setIsPlaying] = useState(false)
  const [message, setMessage] = useState('')
  const [_showFoodMenu, setShowFoodMenu] = useState(false)

  useEffect(() => {
    if (!currentPet) {
      updatePetStatus({
        id: 1,
        name: '小橘',
        level: 1,
        growth_value: 0,
        health_value: 80,
        hunger: 60,
        happiness: 70,
        max_growth: 100,
        status: 'normal',
      })
    }
  }, [])

  const handleFeed = (foodType: 'normal' | 'delicious' | 'special') => {
    if (!currentPet) return
    
    const foodCosts = { normal: 5, delicious: 15, special: 30 }
    if (goldBalance < foodCosts[foodType]) {
      setMessage('金币不足！')
      return
    }
    
    setIsFeeding(true)
    setShowFoodMenu(false)
    setMessage('')

    setTimeout(() => {
      feedPet(foodType)
      setIsFeeding(false)
      setMessage({
        normal: '宠物吃得很满足！',
        delicious: '宠物开心地吃了美食！',
        special: '宠物超级开心，获得额外成长！',
      }[foodType])
    }, 500)
  }

  const handlePlay = () => {
    if (!currentPet) return
    
    if (goldBalance < 3) {
      setMessage('金币不足！')
      return
    }
    
    setIsPlaying(true)
    setMessage('')

    setTimeout(() => {
      playPet()
      setIsPlaying(false)
      setMessage('宠物玩得很开心！')
    }, 500)
  }

  const getPetEmoji = () => {
    if (!currentPet) return '🐱'
    switch (currentPet.status) {
      case 'happy': return '😸'
      case 'sad': return '😿'
      case 'sleeping': return '😴'
      default: return '🐱'
    }
  }

  const getStatusColor = (value: number) => {
    if (value >= 70) return 'from-green-400 to-emerald-400'
    if (value >= 40) return 'from-yellow-400 to-orange-400'
    return 'from-red-400 to-rose-400'
  }

  return (
    <div className="space-y-6">
      {/* 标题 */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-xl flex items-center justify-center">
          <Cat className="w-6 h-6 text-white" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-orange-800">宠物养成</h2>
          <p className="text-orange-500">照顾你的小宠物</p>
        </div>
      </div>

      {currentPet ? (
        <div className="grid lg:grid-cols-2 gap-6">
          {/* 宠物展示 */}
          <Card>
            <div className="text-center">
              <div className="relative inline-block">
                <div className={`w-40 h-40 bg-gradient-to-br from-yellow-100 to-orange-100 rounded-full flex items-center justify-center text-8xl mb-4 shadow-lg ${
                  isFeeding ? 'animate-bounce' : isPlaying ? 'animate-wiggle' : 'animate-float'
                }`}>
                  {getPetEmoji()}
                </div>
                <div className="absolute -top-2 -right-2 bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-3 py-1 rounded-full text-sm font-bold shadow-md">
                  Lv.{currentPet.level}
                </div>
              </div>
              <h3 className="text-2xl font-bold text-gray-800">{currentPet.name}</h3>
              <div className="flex items-center justify-center gap-4 mt-2">
                <span className="text-sm text-gray-500">
                  成长值: {currentPet.growth_value} / {currentPet.max_growth}
                </span>
              </div>
              <div className="mt-2 h-2 bg-gray-200 rounded-full overflow-hidden max-w-xs mx-auto">
                <div
                  className="h-full bg-gradient-to-r from-purple-400 to-pink-400 rounded-full transition-all duration-500"
                  style={{ width: `${(currentPet.growth_value / currentPet.max_growth) * 100}%` }}
                ></div>
              </div>
            </div>

            {/* 状态条 */}
            <div className="mt-6 space-y-4">
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="flex items-center gap-2 text-gray-600">
                    <Utensils className="w-4 h-4 text-orange-500" />
                    饱食度
                  </span>
                  <span className="text-sm font-medium">{currentPet.hunger}%</span>
                </div>
                <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className={`h-full bg-gradient-to-r ${getStatusColor(currentPet.hunger)} rounded-full transition-all duration-500`}
                    style={{ width: `${currentPet.hunger}%` }}
                  ></div>
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="flex items-center gap-2 text-gray-600">
                    <Heart className="w-4 h-4 text-red-500" />
                    健康值
                  </span>
                  <span className="text-sm font-medium">{currentPet.health_value}%</span>
                </div>
                <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className={`h-full bg-gradient-to-r ${getStatusColor(currentPet.health_value)} rounded-full transition-all duration-500`}
                    style={{ width: `${currentPet.health_value}%` }}
                  ></div>
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="flex items-center gap-2 text-gray-600">
                    <Star className="w-4 h-4 text-pink-500" />
                    快乐值
                  </span>
                  <span className="text-sm font-medium">{currentPet.happiness}%</span>
                </div>
                <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className={`h-full bg-gradient-to-r ${getStatusColor(currentPet.happiness)} rounded-full transition-all duration-500`}
                    style={{ width: `${currentPet.happiness}%` }}
                  ></div>
                </div>
              </div>
            </div>

            {/* 消息提示 */}
            {message && (
              <div className="mt-4 p-3 bg-green-100 text-green-700 rounded-xl text-center animate-fade-in">
                {message}
              </div>
            )}
          </Card>

          {/* 操作面板 */}
          <div className="space-y-4">
            {/* 食物选择 */}
            <Card>
              <h3 className="font-bold text-gray-800 mb-4">喂养宠物</h3>
              <div className="grid grid-cols-3 gap-3">
                <button
                  onClick={() => handleFeed('normal')}
                  disabled={isFeeding || goldBalance < 5}
                  className="flex flex-col items-center gap-2 p-4 bg-orange-50 rounded-xl hover:bg-orange-100 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Cookie className="w-8 h-8 text-orange-500" />
                  <span className="text-sm font-medium text-gray-700">普通食物</span>
                  <span className="text-xs text-gray-500">🍪 5金币</span>
                </button>
                <button
                  onClick={() => handleFeed('delicious')}
                  disabled={isFeeding || goldBalance < 15}
                  className="flex flex-col items-center gap-2 p-4 bg-yellow-50 rounded-xl hover:bg-yellow-100 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <IceCream className="w-8 h-8 text-yellow-500" />
                  <span className="text-sm font-medium text-gray-700">美味食物</span>
                  <span className="text-xs text-gray-500">🍦 15金币</span>
                </button>
                <button
                  onClick={() => handleFeed('special')}
                  disabled={isFeeding || goldBalance < 30}
                  className="flex flex-col items-center gap-2 p-4 bg-purple-50 rounded-xl hover:bg-purple-100 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Cake className="w-8 h-8 text-purple-500" />
                  <span className="text-sm font-medium text-gray-700">特殊食物</span>
                  <span className="text-xs text-gray-500">🎂 30金币</span>
                </button>
              </div>
              <p className="text-xs text-gray-400 text-center mt-3">当前金币: {goldBalance}</p>
            </Card>

            {/* 玩耍按钮 */}
            <Card>
              <h3 className="font-bold text-gray-800 mb-4">互动玩耍</h3>
              <Button
                onClick={handlePlay}
                disabled={isPlaying || goldBalance < 3}
                className="w-full py-4"
              >
                <Gamepad2 className="w-6 h-6" />
                <span>陪宠物玩耍</span>
                <span className="ml-auto text-sm opacity-80">⚽ 3金币</span>
              </Button>
            </Card>

            {/* 宠物特权 */}
            <Card>
              <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                <Gift className="w-5 h-5 text-purple-500" />
                宠物特权
              </h3>
              <div className="space-y-3">
                {[
                  { name: '双倍金币', desc: '完成任务获得双倍金币', unlocked: currentPet.level >= 5 },
                  { name: '任务提醒', desc: '提前提醒任务截止时间', unlocked: currentPet.level >= 10 },
                  { name: '额外奖励', desc: '每周获得额外奖励', unlocked: currentPet.level >= 15 },
                  { name: '专属皮肤', desc: '解锁宠物专属皮肤', unlocked: currentPet.level >= 20 },
                ].map((privilege, index) => (
                  <div
                    key={index}
                    className={`flex items-center justify-between p-3 rounded-xl transition-all ${privilege.unlocked ? 'bg-green-50 hover:bg-green-100' : 'bg-gray-50'}`}
                  >
                    <div>
                      <p className={`font-medium ${privilege.unlocked ? 'text-green-700' : 'text-gray-400'}`}>
                        {privilege.name}
                      </p>
                      <p className="text-sm text-gray-500">{privilege.desc}</p>
                    </div>
                    <Zap className={`w-5 h-5 ${privilege.unlocked ? 'text-green-500' : 'text-gray-300'}`} />
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </div>
      ) : (
        <Card>
          <div className="text-center py-12">
            <Cat className="w-16 h-16 mx-auto text-gray-300 mb-4" />
            <h3 className="text-xl font-bold text-gray-600 mb-2">还没有宠物</h3>
            <p className="text-gray-400 mb-4">请先加入一个小组，然后创建属于你们的宠物</p>
            <Button>加入小组</Button>
          </div>
        </Card>
      )}
    </div>
  )
}

export default Pet
