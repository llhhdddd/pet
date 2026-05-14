import { useState, useEffect, useCallback, useRef } from 'react'
import Card from '../components/common/Card'
import Button from '../components/common/Button'
import useStore from '../store/useStore'

interface Bug {
  id: number
  x: number
  y: number
  type: 'math' | 'word' | 'logic'
  speed: number
  isCaught: boolean
  question: {
    question: string
    options: string[]
    correctAnswer: number
  }
}

interface GameState {
  phase: 'menu' | 'playing' | 'paused' | 'gameover' | 'result'
  score: number
  combo: number
  timeLeft: number
  bugsCaught: number
  bugsMissed: number
  totalBugs: number
}

const bugEmojis: Record<string, string> = {
  math: '➕',
  word: '🔤',
  logic: '🧩'
}

const questionBank = {
  math: [
    { q: '12 + 8 = ?', options: ['18', '20', '22', '24'], correct: 1 },
    { q: '45 - 17 = ?', options: ['26', '28', '32', '38'], correct: 2 },
    { q: '7 × 8 = ?', options: ['54', '56', '58', '62'], correct: 1 },
    { q: '72 ÷ 9 = ?', options: ['6', '7', '8', '9'], correct: 2 },
    { q: '15 + 25 + 35 = ?', options: ['65', '70', '75', '80'], correct: 2 },
  ],
  word: [
    { q: '"学习"的反义词是？', options: ['复习', '玩耍', '忘记', '努力'], correct: 2 },
    { q: '"高兴"近义词是？', options: ['伤心', '生气', '快乐', '害怕'], correct: 2 },
    { q: '哪个是动物？', options: ['树木', '花朵', '小狗', '河流'], correct: 2 },
    { q: '"春天"的季节特征？', options: ['下雪', '炎热', '温暖花开', '凉爽'], correct: 2 },
    { q: '正确书写"中国"？', options: ['中囯', '中国', '囗国', '中国'], correct: 1 },
  ],
  logic: [
    { q: '找规律：2, 4, 6, ?', options: ['7', '8', '9', '10'], correct: 1 },
    { q: '找规律：1, 3, 9, ?', options: ['18', '27', '36', '81'], correct: 1 },
    { q: '比熊大，比狗小的是什么？', options: ['猫', '兔子', '猪', '羊'], correct: 1 },
    { q: '一周有几天？', options: ['5天', '6天', '7天', '8天'], correct: 2 },
    { q: '最大的一位数是？', options: ['8', '9', '10', '11'], correct: 1 },
  ],
}

function BugCatch() {
  const { goldBalance, updateGold } = useStore()
  const [gameState, setGameState] = useState<GameState>({
    phase: 'menu',
    score: 0,
    combo: 0,
    timeLeft: 60,
    bugsCaught: 0,
    bugsMissed: 0,
    totalBugs: 0,
  })
  const [bugs, setBugs] = useState<Bug[]>([])
  const [selectedBug, setSelectedBug] = useState<Bug | null>(null)
  const [answerResult, setAnswerResult] = useState<{ correct: boolean; bugId: number } | null>(null)
  const gameAreaRef = useRef<HTMLDivElement>(null)
  const bugIdCounter = useRef(0)

  const spawnBug = useCallback(() => {
    const types: ('math' | 'word' | 'logic')[] = ['math', 'word', 'logic']
    const randomType = types[Math.floor(Math.random() * types.length)]
    const questions = questionBank[randomType]
    const randomQuestion = questions[Math.floor(Math.random() * questions.length)]

    const newBug: Bug = {
      id: ++bugIdCounter.current,
      x: Math.random() * 80 + 10,
      y: Math.random() * 60 + 20,
      type: randomType,
      speed: Math.random() * 1.5 + 0.5,
      isCaught: false,
      question: {
        question: randomQuestion.q,
        options: randomQuestion.options,
        correctAnswer: randomQuestion.correct,
      },
    }

    setBugs(prev => [...prev, newBug])
  }, [])

  const startGame = () => {
    setGameState({
      phase: 'playing',
      score: 0,
      combo: 0,
      timeLeft: 60,
      bugsCaught: 0,
      bugsMissed: 0,
      totalBugs: 0,
    })
    setBugs([])
    setSelectedBug(null)
  }

  const endGame = () => {
    const reward = Math.floor(gameState.score * 0.5)
    updateGold(reward)
    setGameState(prev => ({
      ...prev,
      phase: 'result',
    }))
  }

  useEffect(() => {
    if (gameState.phase !== 'playing') return

    const spawnInterval = setInterval(() => {
      if (bugs.filter(b => !b.isCaught).length < 5) {
        spawnBug()
      }
    }, 2000)

    const moveInterval = setInterval(() => {
      setBugs(prev => prev.map(bug => {
        if (bug.isCaught) return bug
        return {
          ...bug,
          x: bug.x + (Math.random() - 0.5) * 10,
          y: bug.y + (Math.random() - 0.5) * 5,
          x: Math.max(5, Math.min(85, bug.x)),
          y: Math.max(15, Math.min(75, bug.y)),
        }
      }))
    }, 500)

    return () => {
      clearInterval(spawnInterval)
      clearInterval(moveInterval)
    }
  }, [gameState.phase, bugs.length, spawnBug])

  useEffect(() => {
    if (gameState.phase !== 'playing') return

    const timer = setInterval(() => {
      setGameState(prev => {
        if (prev.timeLeft <= 1) {
          return { ...prev, timeLeft: 0, phase: 'gameover' }
        }
        return { ...prev, timeLeft: prev.timeLeft - 1 }
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [gameState.phase])

  useEffect(() => {
    if (gameState.phase === 'gameover') {
      endGame()
    }
  }, [gameState.phase])

  const handleBugClick = (bug: Bug) => {
    if (bug.isCaught) return
    setSelectedBug(bug)
    setBugs(prev => prev.map(b => b.id === bug.id ? { ...b, isCaught: true } : b))
  }

  const handleAnswer = (answerIndex: number) => {
    if (!selectedBug) return

    const isCorrect = answerIndex === selectedBug.question.correctAnswer
    setAnswerResult({ correct: isCorrect, bugId: selectedBug.id })

    if (isCorrect) {
      const comboBonus = Math.min(gameState.combo + 1, 5)
      const points = 10 * comboBonus
      setGameState(prev => ({
        ...prev,
        score: prev.score + points,
        combo: comboBonus,
        bugsCaught: prev.bugsCaught + 1,
        totalBugs: prev.totalBugs + 1,
      }))
    } else {
      setGameState(prev => ({
        ...prev,
        combo: 0,
        bugsMissed: prev.bugsMissed + 1,
        totalBugs: prev.totalBugs + 1,
      }))
    }

    setTimeout(() => {
      setSelectedBug(null)
      setAnswerResult(null)
      setBugs(prev => prev.filter(b => b.id !== selectedBug.id))
    }, 1000)
  }

  const closeQuestion = () => {
    if (selectedBug) {
      setBugs(prev => prev.map(b => b.id === selectedBug.id ? { ...b, isCaught: false } : b))
      setSelectedBug(null)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-gradient-to-br from-orange-400 to-amber-500 rounded-xl flex items-center justify-center">
          <span className="text-2xl">🐛</span>
        </div>
        <div>
          <h1 className="text-2xl font-bold text-white text-white-shadow">捉虫游戏</h1>
          <p className="text-white/80 text-white-shadow">通过游戏学习错题</p>
        </div>
      </div>

      {gameState.phase === 'menu' && (
        <Card className="animate-fadeIn text-center py-12">
          <div className="text-8xl mb-6">🐛</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-4">捉虫大挑战</h2>
          <p className="text-gray-600 mb-8 max-w-md mx-auto">
            点击虫子并答对问题即可获得积分！<br />
            连续答对可以触发连击加成！<br />
            60秒内尽可能多地捉虫吧！
          </p>
          <div className="space-y-3 mb-8">
            <div className="flex justify-center gap-8">
              <div className="text-center">
                <div className="text-2xl">➕</div>
                <p className="text-sm text-gray-500">数学题</p>
              </div>
              <div className="text-center">
                <div className="text-2xl">🔤</div>
                <p className="text-sm text-gray-500">语文题</p>
              </div>
              <div className="text-center">
                <div className="text-2xl">🧩</div>
                <p className="text-sm text-gray-500">逻辑题</p>
              </div>
            </div>
          </div>
          <Button onClick={startGame} size="lg">开始游戏</Button>
        </Card>
      )}

      {gameState.phase === 'playing' && (
        <>
          <div className="flex justify-between items-center">
            <Card className="flex-1 mr-4">
              <div className="flex items-center justify-between">
                <div className="text-center">
                  <p className="text-xs text-gray-500">得分</p>
                  <p className="text-2xl font-bold text-amber-500">{gameState.score}</p>
                </div>
                <div className="text-center">
                  <p className="text-xs text-gray-500">连击</p>
                  <p className="text-2xl font-bold text-pink-500">x{gameState.combo}</p>
                </div>
                <div className="text-center">
                  <p className="text-xs text-gray-500">剩余时间</p>
                  <p className={`text-2xl font-bold ${gameState.timeLeft <= 10 ? 'text-red-500' : 'text-blue-500'}`}>
                    {gameState.timeLeft}秒
                  </p>
                </div>
              </div>
            </Card>
            <Button variant="secondary" onClick={() => setGameState(prev => ({ ...prev, phase: 'gameover' }))}>
              结束
            </Button>
          </div>

          <div
            ref={gameAreaRef}
            className="relative w-full h-96 bg-gradient-to-b from-green-200 to-green-300 rounded-2xl overflow-hidden border-4 border-green-400"
          >
            {bugs.filter(b => !b.isCaught).map(bug => (
              <button
                key={bug.id}
                onClick={() => handleBugClick(bug)}
                className="absolute transform -translate-x-1/2 -translate-y-1/2 transition-all duration-300 hover:scale-125"
                style={{ left: `${bug.x}%`, top: `${bug.y}%` }}
              >
                <div className="text-5xl">{bugEmojis[bug.type]}</div>
                <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 bg-red-500 rounded-full animate-ping" />
              </button>
            ))}

            {bugs.filter(b => !b.isCaught).length === 0 && (
              <div className="absolute inset-0 flex items-center justify-center">
                <p className="text-green-700 text-lg">虫子正在赶来...</p>
              </div>
            )}
          </div>

          <div className="flex justify-between text-sm text-gray-600">
            <span>捉到: {gameState.bugsCaught} 只</span>
            <span>错过: {gameState.bugsMissed} 只</span>
          </div>
        </>
      )}

      {selectedBug && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="max-w-md animate-scaleIn">
            <div className="text-center mb-4">
              <div className="text-5xl mb-2">{bugEmojis[selectedBug.type]}</div>
              <span className="px-3 py-1 bg-green-100 text-green-600 text-sm rounded-full">
                {selectedBug.type === 'math' ? '数学' : selectedBug.type === 'word' ? '语文' : '逻辑'}
              </span>
            </div>
            <h3 className="text-xl font-bold text-center text-gray-800 mb-6">{selectedBug.question.question}</h3>
            <div className="grid grid-cols-2 gap-3">
              {selectedBug.question.options.map((option, i) => (
                <Button
                  key={i}
                  variant={answerResult?.bugId === selectedBug.id && answerResult?.correct && i === selectedBug.question.correctAnswer ? 'primary' : 'secondary'}
                  onClick={() => handleAnswer(i)}
                  disabled={!!answerResult}
                >
                  {option}
                </Button>
              ))}
            </div>
            <Button variant="outline" className="w-full mt-4" onClick={closeQuestion}>
              放走这只虫
            </Button>
          </Card>
        </div>
      )}

      {answerResult && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50 pointer-events-none">
          <div className="animate-scaleIn">
            <div className="text-8xl">{answerResult.correct ? '✅' : '❌'}</div>
          </div>
        </div>
      )}

      {gameState.phase === 'result' && (
        <Card className="animate-fadeIn text-center py-12">
          <div className="text-6xl mb-4">🎉</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-6">游戏结束！</h2>
          <div className="space-y-3 mb-8">
            <div className="flex justify-between px-8">
              <span className="text-gray-600">最终得分</span>
              <span className="font-bold text-2xl text-amber-500">{gameState.score}</span>
            </div>
            <div className="flex justify-between px-8">
              <span className="text-gray-600">捉到虫子</span>
              <span className="font-bold text-green-500">{gameState.bugsCaught} 只</span>
            </div>
            <div className="flex justify-between px-8">
              <span className="text-gray-600">错过虫子</span>
              <span className="font-bold text-red-500">{gameState.bugsMissed} 只</span>
            </div>
            <div className="flex justify-between px-8">
              <span className="text-gray-600">获得金币</span>
              <span className="font-bold text-amber-500">+{Math.floor(gameState.score * 0.5)}</span>
            </div>
          </div>
          <div className="space-y-3">
            <Button onClick={startGame} className="w-full">再玩一次</Button>
            <Button variant="secondary" onClick={() => setGameState(prev => ({ ...prev, phase: 'menu' }))} className="w-full">
              返回菜单
            </Button>
          </div>
        </Card>
      )}
    </div>
  )
}

export default BugCatch