import { useState } from 'react'
import { Coins, TrendingUp, ShoppingCart, History, ArrowUpRight, ArrowDownRight, Zap } from 'lucide-react'
import Card from '../components/common/Card'
import Button from '../components/common/Button'
import useStore from '../store/useStore'

interface Transaction {
  id: number
  amount: number
  transaction_type: 'earn' | 'spend' | 'deduct' | 'transfer'
  source_type: string
  description: string
  created_at: string
}

interface ShopItem {
  id: number
  name: string
  description: string
  price: number
  item_type: 'food' | 'toy' | 'boost' | 'decoration'
  effect: string
  emoji: string
}

interface EarnMethod {
  id: number
  name: string
  description: string
  reward: number
  icon: string
  completed: boolean
}

function Gold() {
  const [transactions, setTransactions] = useState<Transaction[]>([
    { id: 1, amount: 10, transaction_type: 'earn', source_type: 'task_complete', description: '完成数学作业', created_at: '2026-05-14 16:30' },
    { id: 2, amount: 5, transaction_type: 'spend', source_type: 'feed_pet', description: '喂养宠物', created_at: '2026-05-14 15:20' },
    { id: 3, amount: 15, transaction_type: 'earn', source_type: 'excellent_work', description: '作业获得优秀', created_at: '2026-05-14 10:15' },
    { id: 4, amount: 3, transaction_type: 'spend', source_type: 'play_pet', description: '陪宠物玩耍', created_at: '2026-05-13 19:45' },
    { id: 5, amount: 10, transaction_type: 'earn', source_type: 'daily_login', description: '每日登录奖励', created_at: '2026-05-13 08:30' },
    { id: 6, amount: 20, transaction_type: 'earn', source_type: 'task_complete', description: '完成历史测验', created_at: '2026-05-12 17:00' },
    { id: 7, amount: 30, transaction_type: 'spend', source_type: 'shop_purchase', description: '购买特殊食物', created_at: '2026-05-12 14:30' },
    { id: 8, amount: 5, transaction_type: 'earn', source_type: 'task_complete', description: '完成英语预习', created_at: '2026-05-11 16:00' },
  ])

  const [shopItems] = useState<ShopItem[]>([
    { id: 1, name: '普通食物', description: '恢复宠物20点饱食度', price: 5, item_type: 'food', effect: '+20 饱食度', emoji: '🍪' },
    { id: 2, name: '美味食物', description: '恢复宠物40点饱食度和10点健康值', price: 15, item_type: 'food', effect: '+40 饱食度 +10 健康', emoji: '🍦' },
    { id: 3, name: '特殊食物', description: '恢复宠物60点饱食度和20点健康值，额外获得成长值', price: 30, item_type: 'food', effect: '+60 饱食度 +20 健康 +10 成长', emoji: '🎂' },
    { id: 4, name: '玩具球', description: '增加宠物快乐值', price: 10, item_type: 'toy', effect: '+15 快乐值', emoji: '⚽' },
    { id: 5, name: '毛线球', description: '宠物最爱玩的玩具', price: 15, item_type: 'toy', effect: '+25 快乐值', emoji: '🧶' },
    { id: 6, name: '成长加速', description: '下一次喂食获得双倍成长值', price: 25, item_type: 'boost', effect: '双倍成长', emoji: '🚀' },
    { id: 7, name: '健康药水', description: '立即恢复50点健康值', price: 20, item_type: 'boost', effect: '+50 健康值', emoji: '💊' },
    { id: 8, name: '宠物皮肤', description: '解锁可爱的猫咪皮肤', price: 100, item_type: 'decoration', effect: '解锁皮肤', emoji: '🎨' },
  ])

  const [earnMethods, setEarnMethods] = useState<EarnMethod[]>([
    { id: 1, name: '每日登录', description: '每天登录即可领取', reward: 5, icon: '📅', completed: true },
    { id: 2, name: '完成任务', description: '完成老师布置的任务', reward: 10, icon: '✅', completed: false },
    { id: 3, name: '优秀作业', description: '作业获得优秀评价', reward: 15, icon: '⭐', completed: false },
    { id: 4, name: '连续签到', description: '连续登录7天', reward: 50, icon: '🔥', completed: false },
    { id: 5, name: '邀请同学', description: '邀请同学加入班级', reward: 20, icon: '👥', completed: false },
    { id: 6, name: '捉虫达人', description: '完成捉虫任务', reward: 8, icon: '🐛', completed: false },
  ])

  const [purchaseMessage, setPurchaseMessage] = useState('')

  const { goldBalance, setGoldBalance } = useStore()

  const handlePurchase = (item: ShopItem) => {
    if (goldBalance < item.price) {
      setPurchaseMessage('金币不足！')
      setTimeout(() => setPurchaseMessage(''), 3000)
      return
    }

    setGoldBalance(goldBalance - item.price)
    setTransactions([
      {
        id: Date.now(),
        amount: item.price,
        transaction_type: 'spend',
        source_type: 'shop_purchase',
        description: `购买 ${item.name}`,
        created_at: new Date().toLocaleString('zh-CN'),
      },
      ...transactions,
    ])
    setPurchaseMessage(`成功购买 ${item.name}！`)
    setTimeout(() => setPurchaseMessage(''), 3000)
  }

  const handleEarn = (method: EarnMethod) => {
    if (method.completed) return

    setGoldBalance(goldBalance + method.reward)
    setTransactions([
      {
        id: Date.now(),
        amount: method.reward,
        transaction_type: 'earn',
        source_type: 'task_complete',
        description: method.name,
        created_at: new Date().toLocaleString('zh-CN'),
      },
      ...transactions,
    ])
    setEarnMethods(earnMethods.map((m) => (m.id === method.id ? { ...m, completed: true } : m)))
  }

  const getTotalEarned = () => transactions.filter((t) => t.transaction_type === 'earn').reduce((sum, t) => sum + t.amount, 0)
  const getTotalSpent = () => transactions.filter((t) => t.transaction_type === 'spend').reduce((sum, t) => sum + t.amount, 0)

  const itemTypeColors: Record<string, string> = {
    food: 'bg-orange-50 border-orange-200',
    toy: 'bg-blue-50 border-blue-200',
    boost: 'bg-purple-50 border-purple-200',
    decoration: 'bg-pink-50 border-pink-200',
  }

  const itemTypeLabels: Record<string, string> = {
    food: '食物',
    toy: '玩具',
    boost: '增益',
    decoration: '装扮',
  }

  return (
    <div className="space-y-6">
      {/* 标题 */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-xl flex items-center justify-center">
          <Coins className="w-6 h-6 text-white" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-orange-800">金币经济</h2>
          <p className="text-orange-500">管理你的金币和消费记录</p>
        </div>
      </div>

      {/* 余额卡片 */}
      <Card className="relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-yellow-100 rounded-full -translate-y-1/2 translate-x-1/2" />
        <div className="relative flex items-center justify-between">
          <div>
            <p className="text-gray-500 mb-1">当前金币余额</p>
            <div className="flex items-baseline gap-2">
              <span className="text-4xl font-bold text-yellow-500">{goldBalance}</span>
              <Coins className="w-8 h-8 text-yellow-500" />
            </div>
            <div className="flex gap-4 mt-2 text-sm">
              <span className="text-green-600 flex items-center gap-1">
                <ArrowUpRight className="w-4 h-4" />
                累计收入: {getTotalEarned()}
              </span>
              <span className="text-red-600 flex items-center gap-1">
                <ArrowDownRight className="w-4 h-4" />
                累计支出: {getTotalSpent()}
              </span>
            </div>
          </div>
          <div className="flex gap-3">
            <Button variant="secondary">
              <TrendingUp className="w-5 h-5" />
              赚取金币
            </Button>
            <Button>
              <ShoppingCart className="w-5 h-5" />
              去商城
            </Button>
          </div>
        </div>
        {/* 购买成功提示 */}
        {purchaseMessage && (
          <div className="absolute top-4 right-4 bg-green-500 text-white px-4 py-2 rounded-lg text-sm animate-fade-in">
            {purchaseMessage}
          </div>
        )}
      </Card>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* 赚取金币 */}
        <Card>
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-gray-800 flex items-center gap-2">
              <Zap className="w-5 h-5 text-yellow-500" />
              赚取金币
            </h3>
          </div>

          <div className="space-y-3">
            {earnMethods.map((method) => (
              <button
                key={method.id}
                onClick={() => handleEarn(method)}
                disabled={method.completed}
                className={`w-full flex items-center justify-between p-3 rounded-xl border-2 transition-all ${
                  method.completed
                    ? 'bg-green-50 border-green-200 cursor-default'
                    : 'bg-white border-gray-200 hover:border-yellow-400 hover:bg-yellow-50 cursor-pointer'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-xl ${
                    method.completed ? 'bg-green-100' : 'bg-yellow-100'
                  }`}>
                    {method.icon}
                  </div>
                  <div className="text-left">
                    <p className={`font-medium ${method.completed ? 'text-green-700' : 'text-gray-800'}`}>
                      {method.name}
                    </p>
                    <p className="text-sm text-gray-500">{method.description}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className={`font-bold ${method.completed ? 'text-green-600' : 'text-yellow-600'}`}>
                    {method.completed ? (
                      <span className="flex items-center gap-1">
                        <ArrowUpRight className="w-4 h-4" />
                        已完成
                      </span>
                    ) : (
                      <span className="flex items-center gap-1">
                        <Coins className="w-4 h-4" />
                        +{method.reward}
                      </span>
                    )}
                  </p>
                </div>
              </button>
            ))}
          </div>
        </Card>

        {/* 商城 */}
        <Card>
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-gray-800 flex items-center gap-2">
              <ShoppingCart className="w-5 h-5 text-yellow-500" />
              商城
            </h3>
          </div>

          <div className="space-y-3">
            {shopItems.map((item) => (
              <div
                key={item.id}
                className={`flex items-center justify-between p-3 rounded-xl border-2 ${itemTypeColors[item.item_type]}`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center text-2xl shadow-sm">
                    {item.emoji}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-medium text-gray-800">{item.name}</p>
                      <span className="px-2 py-0.5 bg-white/50 rounded text-xs text-gray-600">
                        {itemTypeLabels[item.item_type]}
                      </span>
                    </div>
                    <p className="text-sm text-gray-500">{item.description}</p>
                    <p className="text-xs text-green-600 mt-1">{item.effect}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="flex items-center gap-1 text-yellow-600 font-bold">
                    <Coins className="w-4 h-4" />
                    {item.price}
                  </p>
                  <Button
                    size="sm"
                    onClick={() => handlePurchase(item)}
                    disabled={goldBalance < item.price}
                    className="mt-1"
                  >
                    购买
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* 交易记录 */}
        <Card>
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-gray-800 flex items-center gap-2">
              <History className="w-5 h-5 text-gray-500" />
              交易记录
            </h3>
          </div>

          <div className="space-y-3 max-h-80 overflow-y-auto">
            {transactions.slice(0, 10).map((transaction) => (
              <div
                key={transaction.id}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-xl"
              >
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                    transaction.transaction_type === 'earn' ? 'bg-green-100' : 'bg-red-100'
                  }`}>
                    {transaction.transaction_type === 'earn' ? (
                      <ArrowUpRight className="w-5 h-5 text-green-600" />
                    ) : (
                      <ArrowDownRight className="w-5 h-5 text-red-600" />
                    )}
                  </div>
                  <div>
                    <p className="font-medium text-gray-800 text-sm">{transaction.description}</p>
                    <p className="text-xs text-gray-500">
                      {transaction.created_at}
                    </p>
                  </div>
                </div>
                <span className={`font-bold text-sm ${
                  transaction.transaction_type === 'earn' ? 'text-green-600' : 'text-red-600'
                }`}>
                  {transaction.transaction_type === 'earn' ? '+' : '-'}{transaction.amount}
                </span>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  )
}

export default Gold
