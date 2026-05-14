import { useState, useEffect, useCallback } from 'react'
import { Bug, Trophy, Target, Clock, Sparkles } from 'lucide-react'
import Card from '../components/common/Card'
import Button from '../components/common/Button'
import useStore from '../store/useStore'

interface Bug {
  id: number
  x: number
  y: number
  type: 'easy' | 'medium' | 'hard'
  emoji: string
  caught: boolean
}

interface WrongAnswer {
  id: number
  question: string
  subject: string
  correctAnswer: string
  yourAnswer: string
  bugValue: number
}

function BugCatch() {
  const [bugs, setBugs] = useState<Bug[]>([])
  const [score, setScore] = useState(0)
  const [timeLeft, setTimeLeft] = useState(60)
  const [isPlaying, setIsPlaying] = useState(false)
  const [caughtCount, setCaughtCount] = useState(0)
  const [showResult, setShowResult] = useState(false)
  
  const { goldBalance, setGoldBalance } = useStore()

  const wrongAnswers: WrongAnswer[] = [
    { id: 1, question: '2+3=?', subject: '数学', correctAnswer: '5', yourAnswer: '4', bugValue: 5 },
    { id: 2, question: '水的化学式是?', subject: '化学', correctAnswer: 'H2O', yourAnswer: 'HO2', bugValue: 8 },
    { id: 3, question: '中国首都是?', subject: '地理', correctAnswer: '北京', yourAnswer: '上海', bugValue: 3 },
    { id: 4, question: '光合作用的原料是?', subject: '生物', correctAnswer: '二氧化碳和水', yourAnswer: '氧气', bugValue: 10 },
    { id: 5, question: '100-25=?', subject: '数学', correctAnswer: '75', yourAnswer: '85', bugValue: 5 },
  ]

  const bugTypes = [
    { type: 'easy' as const, emoji: '🐛', points: 5 },
    { type: 'medium' as const, emoji: '🦗', points: 10 },
    { type: 'hard' as const, emoji: '🪲', points: 15 },
  ]

  const generateBugs = useCallback(() => {
    const newBugs: Bug[] = []
    for (let i = 0; i < 8; i++) {
      const bugType = bugTypes[Math.floor(Math.random() * bugTypes.length)]
      newBugs.push({
        id: i,
        x: Math.random() * 70 + 10,
        y: Math.random() * 60 + 10,
        type: bugType.type,
        emoji: bugType.emoji,
        caught: false,
      })
    }
    setBugs(newBugs)
  }, [])

  useEffect(() => {
    if (isPlaying && timeLeft > 0) {
      const timer = setInterval(() => {
        setTimeLeft((prev) => prev - 1)
      }, 1000)
      return () => clearInterval(timer)
    } else if (timeLeft === 0) {
      setIsPlaying(false)
      setShowResult(true)
      setGoldBalance(goldBalance + score)
    }
  }, [isPlaying, timeLeft, score, goldBalance, setGoldBalance])

  const handleBugClick = (bugId: number) => {
    if (!isPlaying) return
    
    setBugs((prev) =>
      prev.map((bug) =>
        bug.id === bugId ? { ...bug, caught: true } : bug
      )
    )
    
    const bug = bugs.find((b) => b.id === bugId)
    if (bug) {
      const points = bug.type === 'easy' ? 5 : bug.type === 'medium' ? 10 : 15
      setScore((prev) => prev + points)
      setCaughtCount((prev) => prev + 1)
      
      setTimeout(() => {
        generateBugs()
      }, 500)
    }
  }

  const startGame = () => {
    setScore(0)
    setTimeLeft(60)
    setCaughtCount(0)
    setShowResult(false)
    generateBugs()
    setIsPlaying(true)
  }

  const getBugColor = (type: string) => {
    switch (type) {
      case 'easy': return 'text-green-500'
      case 'medium': return 'text-yellow-500'
      case 'hard': return 'text-red-500'
      default: return 'text-gray-500'
    }
  }

  return (
    <div className="space-y-6">
      {/* 标题 */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-gradient-to-br from-green-400 to-emerald-500 rounded-xl flex items-center justify-center">
          <Bug className="w-6 h-6 text-white" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-white">捉虫大作战</h2>
          <p className="text-white/60">抓住错题转化的虫子，赢取金币奖励！</p>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* 游戏区域 */}
        <div className="lg:col-span-2">
          <Card className="relative h-[500px] overflow-hidden">
            {/* 游戏状态栏 */}
            <div className="absolute top-4 left-4 right-4 flex items-center justify-between z-10">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2 bg-white/80 backdrop-blur px-4 py-2 rounded-xl shadow-md">
                  <Trophy className="w-5 h-5 text-yellow-500" />
                  <span className="font-bold text-gray-800">{score}</span>
                  <span className="text-gray-500 text-sm">分</span>
                </div>
                <div className="flex items-center gap-2 bg-white/80 backdrop-blur px-4 py-2 rounded-xl shadow-md">
                  <Target className="w-5 h-5 text-green-500" />
                  <span className="font-bold text-gray-800">{caughtCount}</span>
                  <span className="text-gray-500 text-sm">只</span>
                </div>
              </div>
              <div className={`flex items-center gap-2 px-4 py-2 rounded-xl shadow-md ${
                timeLeft <= 10 ? 'bg-red-100' : 'bg-white/80 backdrop-blur'
              }`}>
                <Clock className={`w-5 h-5 ${timeLeft <= 10 ? 'text-red-500' : 'text-blue-500'}`} />
                <span className={`font-bold ${timeLeft <= 10 ? 'text-red-600' : 'text-gray-800'}`}>
                  {timeLeft}s
                </span>
              </div>
            </div>

            {/* 游戏背景 */}
            <div className="absolute inset-0 bg-gradient-to-br from-green-100 via-emerald-100 to-teal-100">
              {/* 草地装饰 */}
              <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-green-200 to-transparent" />
              {/* 叶子装饰 */}
              <div className="absolute top-10 left-10 text-4xl opacity-20">🍃</div>
              <div className="absolute top-20 right-20 text-3xl opacity-20">🌿</div>
              <div className="absolute bottom-32 left-1/4 text-3xl opacity-20">🌱</div>
            </div>

            {/* 虫子 */}
            {isPlaying && bugs.map((bug) => (
              <button
                key={bug.id}
                onClick={() => handleBugClick(bug.id)}
                disabled={bug.caught}
                className={`absolute text-4xl transition-all duration-300 ${
                  bug.caught ? 'opacity-0 scale-0 pointer-events-none' : 'hover:scale-125 cursor-pointer animate-bounce-slow'
                }`}
                style={{ left: `${bug.x}%`, top: `${bug.y}%` }}
              >
                <span className={`drop-shadow-lg ${getBugColor(bug.type)}`}>
                  {bug.emoji}
                </span>
              </button>
            ))}

            {/* 开始界面 */}
            {!isPlaying && !showResult && (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/30">
                <div className="text-8xl mb-6 animate-bounce">🐛</div>
                <h3 className="text-2xl font-bold text-white mb-4">准备好捉虫了吗？</h3>
                <p className="text-white/80 text-center mb-6">
                  在60秒内抓住尽可能多的虫子<br />
                  不同难度的虫子有不同分值！
                </p>
                <div className="flex gap-4 mb-6">
                  <div className="flex items-center gap-2 bg-white/80 px-4 py-2 rounded-xl">
                    <span className="text-2xl">🐛</span>
                    <span className="text-gray-700">简单 +5分</span>
                  </div>
                  <div className="flex items-center gap-2 bg-white/80 px-4 py-2 rounded-xl">
                    <span className="text-2xl">🦗</span>
                    <span className="text-gray-700">中等 +10分</span>
                  </div>
                  <div className="flex items-center gap-2 bg-white/80 px-4 py-2 rounded-xl">
                    <span className="text-2xl">🪲</span>
                    <span className="text-gray-700">困难 +15分</span>
                  </div>
                </div>
                <Button onClick={startGame} size="lg">
                  <Sparkles className="w-5 h-5" />
                  开始捉虫
                </Button>
              </div>
            )}

            {/* 结果界面 */}
            {showResult && (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/30">
                <div className="text-8xl mb-4">🎉</div>
                <h3 className="text-3xl font-bold text-white mb-2">游戏结束！</h3>
                <div className="text-6xl font-bold text-yellow-400 mb-4">{score}</div>
                <p className="text-white/80 mb-2">总共抓住了 {caughtCount} 只虫子</p>
                <p className="text-green-300 mb-6 flex items-center gap-2">
                  <Trophy className="w-5 h-5" />
                  获得 {score} 金币奖励！
                </p>
                <div className="flex gap-4">
                  <Button onClick={startGame}>
                    <Sparkles className="w-5 h-5" />
                    再玩一次
                  </Button>
                  <Button variant="outline" onClick={() => setShowResult(false)}>
                    返回
                  </Button>
                </div>
              </div>
            )}
          </Card>
        </div>

        {/* 错题列表 */}
        <div>
          <Card>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-gray-800 flex items-center gap-2">
                <Bug className="w-5 h-5 text-green-500" />
                错题转化
              </h3>
            </div>

            <p className="text-gray-500 text-sm mb-4">
              你的错题变成了虫子，抓住它们来巩固知识！
            </p>

            <div className="space-y-3">
              {wrongAnswers.map((item) => (
                <div
                  key={item.id}
                  className="p-3 bg-orange-50 rounded-xl border-2 border-orange-200"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="px-2 py-0.5 bg-orange-200 text-orange-700 rounded text-xs font-medium">
                      {item.subject}
                    </span>
                    <span className="text-green-600 font-bold flex items-center gap-1">
                      <Trophy className="w-4 h-4" />
                      +{item.bugValue}
                    </span>
                  </div>
                  <p className="text-gray-800 font-medium text-sm mb-1">{item.question}</p>
                  <div className="flex items-center gap-4 text-xs">
                    <span className="text-red-500">
                      你的答案: <span className="font-medium">{item.yourAnswer}</span>
                    </span>
                    <span className="text-green-600">
                      正确答案: <span className="font-medium">{item.correctAnswer}</span>
                    </span>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-4 p-3 bg-green-50 rounded-xl border border-green-200">
              <div className="flex items-center gap-2 text-green-700">
                <Sparkles className="w-5 h-5" />
                <span className="font-medium">提示</span>
              </div>
              <p className="text-sm text-green-600 mt-1">
                每抓住一只虫子，就代表你掌握了一个知识点！坚持下去，你会越来越棒！
              </p>
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}

export default BugCatch
