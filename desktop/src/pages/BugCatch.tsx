import { useState, useEffect, useCallback } from 'react'
import { Bug, Trophy, Target, Clock, Sparkles, CheckCircle, AlertCircle } from 'lucide-react'
import Card from '../components/common/Card'
import Button from '../components/common/Button'
import useStore from '../store/useStore'

interface BugItem {
  id: number
  x: number
  y: number
  type: 'easy' | 'medium' | 'hard'
  emoji: string
  points: number
  caught: boolean
}

interface Question {
  id: number
  question: string
  subject: string
  correctAnswer: string
  points: number
}

function BugCatch() {
  const [bugs, setBugs] = useState<BugItem[]>([])
  const [score, setScore] = useState(0)
  const [timeLeft, setTimeLeft] = useState(60)
  const [isPlaying, setIsPlaying] = useState(false)
  const [caughtCount, setCaughtCount] = useState(0)
  const [showResult, setShowResult] = useState(false)

  // 答题相关状态
  const [showQuestion, setShowQuestion] = useState(false)
  const [activeBug, setActiveBug] = useState<BugItem | null>(null)
  const [activeQuestion, setActiveQuestion] = useState<Question | null>(null)
  const [userAnswer, setUserAnswer] = useState('')
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null)

  const { goldBalance, setGoldBalance } = useStore()

  // 题库
  const questionBank: Question[] = [
    { id: 1, question: '2 + 3 = ?', subject: '数学', correctAnswer: '5', points: 5 },
    { id: 2, question: '水的化学式是？', subject: '化学', correctAnswer: 'H2O', points: 8 },
    { id: 3, question: '中国的首都是？', subject: '地理', correctAnswer: '北京', points: 3 },
    { id: 4, question: '光合作用的原料是？', subject: '生物', correctAnswer: '二氧化碳和水', points: 10 },
    { id: 5, question: '100 - 25 = ?', subject: '数学', correctAnswer: '75', points: 5 },
    { id: 6, question: '"床前明月光"的作者是？', subject: '语文', correctAnswer: '李白', points: 5 },
    { id: 7, question: '地球绕太阳转一圈需要多久？', subject: '地理', correctAnswer: '一年', points: 6 },
    { id: 8, question: '英语"苹果"怎么说？', subject: '英语', correctAnswer: 'apple', points: 4 },
    { id: 9, question: '36 ÷ 6 = ?', subject: '数学', correctAnswer: '6', points: 5 },
    { id: 10, question: '人体最大的器官是？', subject: '生物', correctAnswer: '皮肤', points: 8 },
    { id: 11, question: '"Hello"是什么意思？', subject: '英语', correctAnswer: '你好', points: 3 },
    { id: 12, question: '7 × 8 = ?', subject: '数学', correctAnswer: '56', points: 5 },
  ]

  const bugTypes = [
    { type: 'easy' as const, emoji: '🐛', points: 5 },
    { type: 'medium' as const, emoji: '🦗', points: 10 },
    { type: 'hard' as const, emoji: '🪲', points: 15 },
  ]

  const generateBugs = useCallback(() => {
    const newBugs: BugItem[] = []
    for (let i = 0; i < 8; i++) {
      const bugType = bugTypes[Math.floor(Math.random() * bugTypes.length)]
      newBugs.push({
        id: i,
        x: Math.random() * 70 + 10,
        y: Math.random() * 60 + 10,
        type: bugType.type,
        emoji: bugType.emoji,
        points: bugType.points,
        caught: false,
      })
    }
    setBugs(newBugs)
  }, [])

  // 计时器 — 答题时暂停
  useEffect(() => {
    if (isPlaying && timeLeft > 0 && !showQuestion) {
      const timer = setInterval(() => {
        setTimeLeft((prev) => prev - 1)
      }, 1000)
      return () => clearInterval(timer)
    } else if (timeLeft === 0 && isPlaying) {
      setIsPlaying(false)
      setShowResult(true)
      setGoldBalance(goldBalance + score)
    }
  }, [isPlaying, timeLeft, showQuestion, score, goldBalance, setGoldBalance])

  const handleBugClick = (bug: BugItem) => {
    if (!isPlaying || bug.caught || showQuestion) return

    setActiveBug(bug)

    // 根据虫子难度筛选题目
    const pool = questionBank.filter((q) => {
      if (bug.type === 'easy') return q.points <= 5
      if (bug.type === 'medium') return q.points >= 5 && q.points <= 8
      return q.points >= 6
    })
    const question = pool.length > 0
      ? pool[Math.floor(Math.random() * pool.length)]
      : questionBank[Math.floor(Math.random() * questionBank.length)]

    setActiveQuestion(question)
    setUserAnswer('')
    setFeedback(null)
    setShowQuestion(true)
  }

  const handleSubmitAnswer = () => {
    if (!activeBug || !activeQuestion || feedback) return

    const isCorrect =
      userAnswer.trim().toLowerCase() === activeQuestion.correctAnswer.toLowerCase()

    if (isCorrect) {
      setFeedback('correct')
      setBugs((prev) =>
        prev.map((b) => (b.id === activeBug.id ? { ...b, caught: true } : b))
      )
      setScore((prev) => prev + activeBug.points)
      setCaughtCount((prev) => prev + 1)
    } else {
      setFeedback('wrong')
    }

    // 延迟关闭弹窗
    setTimeout(() => {
      setShowQuestion(false)
      setActiveBug(null)
      setActiveQuestion(null)
      setUserAnswer('')
      setFeedback(null)
    }, 800)
  }

  const startGame = () => {
    setScore(0)
    setTimeLeft(60)
    setCaughtCount(0)
    setShowResult(false)
    setShowQuestion(false)
    setActiveBug(null)
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

  const getBugLabel = (type: string) => {
    switch (type) {
      case 'easy': return '简单'
      case 'medium': return '中等'
      case 'hard': return '困难'
      default: return ''
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
          <h2 className="text-2xl font-bold text-orange-800">捉虫大作战</h2>
          <p className="text-orange-500">点击虫子回答问题，答对才能捉住虫子！</p>
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
              <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-green-200 to-transparent" />
              <div className="absolute top-10 left-10 text-4xl opacity-20">🍃</div>
              <div className="absolute top-20 right-20 text-3xl opacity-20">🌿</div>
              <div className="absolute bottom-32 left-1/4 text-3xl opacity-20">🌱</div>
            </div>

            {/* 虫子 */}
            {isPlaying && bugs.map((bug) => (
              <button
                key={bug.id}
                onClick={() => handleBugClick(bug)}
                disabled={bug.caught}
                className={`absolute text-4xl transition-all duration-300 ${
                  bug.caught
                    ? 'opacity-0 scale-0 pointer-events-none'
                    : showQuestion
                      ? 'pointer-events-none'
                      : 'hover:scale-125 cursor-pointer animate-bounce-slow'
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
                  点击虫子会弹出题目<br />
                  答对才能捉住虫子获得分数！
                </p>
                <div className="flex gap-4 mb-6">
                  <div className="flex items-center gap-2 bg-white/80 px-4 py-2 rounded-xl">
                    <span className="text-2xl">🐛</span>
                    <span className="text-gray-700">简单题 +5分</span>
                  </div>
                  <div className="flex items-center gap-2 bg-white/80 px-4 py-2 rounded-xl">
                    <span className="text-2xl">🦗</span>
                    <span className="text-gray-700">中等题 +10分</span>
                  </div>
                  <div className="flex items-center gap-2 bg-white/80 px-4 py-2 rounded-xl">
                    <span className="text-2xl">🪲</span>
                    <span className="text-gray-700">困难题 +15分</span>
                  </div>
                </div>
                <Button onClick={startGame} size="lg">
                  <Sparkles className="w-5 h-5" />
                  开始捉虫
                </Button>
              </div>
            )}

            {/* 答题弹窗 */}
            {showQuestion && activeQuestion && activeBug && (
              <div className="absolute inset-0 z-20 flex items-center justify-center bg-black/50 px-4">
                <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-2xl animate-scaleIn">
                  {/* 虫子和题目信息 */}
                  <div className="flex items-center gap-3 mb-4">
                    <span className="text-4xl">{activeBug.emoji}</span>
                    <div>
                      <span className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded text-xs font-medium">
                        {activeQuestion.subject} · {getBugLabel(activeBug.type)}
                      </span>
                      <p className="text-xs text-gray-400 mt-1">答对 +{activeBug.points} 分</p>
                    </div>
                  </div>

                  {/* 题目 */}
                  <h4 className="text-lg font-bold text-gray-800 mb-4">
                    {activeQuestion.question}
                  </h4>

                  {/* 输入区域 */}
                  {!feedback && (
                    <>
                      <input
                        type="text"
                        value={userAnswer}
                        onChange={(e) => setUserAnswer(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleSubmitAnswer()}
                        placeholder="输入你的答案..."
                        autoFocus
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl text-gray-800 focus:outline-none focus:border-green-400 focus:ring-2 focus:ring-green-200 transition-all"
                      />
                      <div className="flex gap-3 mt-4">
                        <Button
                          onClick={handleSubmitAnswer}
                          disabled={!userAnswer.trim()}
                          className="flex-1"
                        >
                          确认答案
                        </Button>
                      </div>
                    </>
                  )}

                  {/* 结果反馈 */}
                  {feedback === 'correct' && (
                    <div className="flex flex-col items-center py-4">
                      <CheckCircle className="w-16 h-16 text-green-500 mb-3" />
                      <p className="text-xl font-bold text-green-600">回答正确！</p>
                      <p className="text-green-500 mt-1">+{activeBug.points} 分</p>
                    </div>
                  )}
                  {feedback === 'wrong' && (
                    <div className="flex flex-col items-center py-4">
                      <AlertCircle className="w-16 h-16 text-red-500 mb-3" />
                      <p className="text-xl font-bold text-red-600">回答错误！</p>
                      <p className="text-gray-500 mt-1">
                        正确答案：<span className="font-bold text-green-600">{activeQuestion.correctAnswer}</span>
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* 结果界面 */}
            {showResult && (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/30">
                <div className="text-8xl mb-4">🎉</div>
                <h3 className="text-3xl font-bold text-white mb-2">游戏结束！</h3>
                <div className="text-6xl font-bold text-yellow-400 mb-4">{score}</div>
                <p className="text-white/80 mb-2">总共答对 {caughtCount} 道题</p>
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

        {/* 题库列表 */}
        <div>
          <Card>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-gray-800 flex items-center gap-2">
                <Bug className="w-5 h-5 text-green-500" />
                知识题库
              </h3>
            </div>

            <p className="text-gray-500 text-sm mb-4">
              这些知识点会出现在捉虫中，准备好了吗？
            </p>

            <div className="space-y-3">
              {questionBank.slice(0, 8).map((item) => (
                <div
                  key={item.id}
                  className="p-3 bg-gray-50 rounded-xl border border-gray-200"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="px-2 py-0.5 bg-green-100 text-green-700 rounded text-xs font-medium">
                      {item.subject}
                    </span>
                    <span className="text-green-600 font-bold flex items-center gap-1 text-sm">
                      +{item.points}
                    </span>
                  </div>
                  <p className="text-gray-800 font-medium text-sm">{item.question}</p>
                </div>
              ))}
            </div>

            <div className="mt-4 p-3 bg-green-50 rounded-xl border border-green-200">
              <div className="flex items-center gap-2 text-green-700">
                <Sparkles className="w-5 h-5" />
                <span className="font-medium">玩法说明</span>
              </div>
              <p className="text-sm text-green-600 mt-1">
                点击虫子 → 弹出题目 → 答对得分！不同难度对应不同分值的题目。答错不扣分，但会浪费时间哦！
              </p>
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}

export default BugCatch
