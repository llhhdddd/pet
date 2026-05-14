import { useState } from 'react'
import Card from '../components/common/Card'
import Button from '../components/common/Button'
import useStore from '../store/useStore'

interface Transaction {
  id: number
  type: 'earn' | 'spend' | 'reward'
  amount: number
  source: string
  description: string
  date: string
}

const mockTransactions: Transaction[] = [
  { id: 1, type: 'earn', amount: 50, source: 'task', description: '完成数学作业第三章', date: '2026-05-14 10:30' },
  { id: 2, type: 'spend', amount: -30, source: 'shop', description: '购买宠物食品', date: '2026-05-14 09:15' },
  { id: 3, type: 'reward', amount: 20, source: 'bonus', description: '连续打卡奖励', date: '2026-05-13 20:00' },
  { id: 4, type: 'earn', amount: 40, source: 'task', description: '英语单词打卡', date: '2026-05-13 15:45' },
  { id: 5, type: 'spend', amount: -50, source: 'shop', description: '购买学习道具', date: '2026-05-12 18:20' },
  { id: 6, type: 'earn', amount: 100, source: 'task', description: '科学小实验项目', date: '2026-05-12 14:00' },
]

const mockShopItems = [
  { id: 1, name: '宠物食品', icon: '🍖', price: 20, description: '恢复宠物饱食度+30' },
  { id: 2, name: '宠物玩具', icon: '🎾', price: 50, description: '提升宠物快乐度+50' },
  { id: 3, name: '学习加速卡', icon: '⚡', price: 80, description: '任务奖励双倍(1次)' },
  { id: 4, name: '体力恢复药水', icon: '🧪', price: 30, description: '恢复宠物生命值+40' },
  { id: 5, name: '幸运符', icon: '🍀', price: 100, description: '捉虫游戏金币奖励+50%' },
]

const transactionIcons: Record<string, string> = {
  earn: '💰',
  spend: '🛒',
  reward: '🎁'
}

const transactionLabels: Record<string, string> = {
  earn: '获得',
  spend: '消费',
  reward: '奖励'
}

function Gold() {
  const { goldBalance, updateGold, currentPet } = useStore()
  const [transactions] = useState<Transaction[]>(mockTransactions)
  const [activeTab, setActiveTab] = useState<'record' | 'shop'>('record')
  const [purchaseModal, setPurchaseModal] = useState<{ show: boolean; item: typeof mockShopItems[0] | null }>({ show: false, item: null })

  const totalEarned = transactions.filter(t => t.type === 'earn' || t.type === 'reward').reduce((sum, t) => sum + t.amount, 0)
  const totalSpent = Math.abs(transactions.filter(t => t.type === 'spend').reduce((sum, t) => sum + t.amount, 0))

  const handlePurchase = (item: typeof mockShopItems[0]) => {
    if (goldBalance >= item.price) {
      updateGold(-item.price)
      setPurchaseModal({ show: true, item })
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-gradient-to-br from-orange-400 to-amber-500 rounded-xl flex items-center justify-center">
          <span className="text-2xl">💰</span>
        </div>
        <div>
          <h1 className="text-2xl font-bold text-white text-white-shadow">金币系统</h1>
          <p className="text-white/80 text-white-shadow">管理你的金币和商城</p>
        </div>
      </div>

      <Card className="animate-fadeIn">
        <div className="text-center py-6">
          <p className="text-white/80 text-sm mb-1">当前余额</p>
          <div className="flex items-center justify-center gap-2">
            <span className="text-5xl font-bold text-white text-white-shadow">{goldBalance}</span>
            <span className="text-2xl">💰</span>
          </div>
          <div className="flex justify-center gap-6 mt-4 text-sm">
            <div className="text-green-300">
              <span className="opacity-70">累计获得</span>
              <span className="ml-1 font-medium">{totalEarned}</span>
            </div>
            <div className="text-red-300">
              <span className="opacity-70">累计消费</span>
              <span className="ml-1 font-medium">{totalSpent}</span>
            </div>
          </div>
        </div>
      </Card>

      <div className="flex gap-2">
        <Button
          variant={activeTab === 'record' ? 'primary' : 'secondary'}
          size="sm"
          onClick={() => setActiveTab('record')}
        >
          📜 交易记录
        </Button>
        <Button
          variant={activeTab === 'shop' ? 'primary' : 'secondary'}
          size="sm"
          onClick={() => setActiveTab('shop')}
        >
          🛒 商城
        </Button>
      </div>

      {activeTab === 'record' && (
        <div className="space-y-3">
          {transactions.map(tx => (
            <Card key={tx.id} className="animate-fadeIn">
              <div className="flex items-center gap-4">
                <div className="text-3xl">{transactionIcons[tx.type]}</div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className={`font-medium ${tx.amount > 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {tx.amount > 0 ? '+' : ''}{tx.amount}
                    </span>
                    <span className={`px-2 py-0.5 text-xs rounded-full ${
                      tx.type === 'earn' ? 'bg-green-100 text-green-600' :
                      tx.type === 'spend' ? 'bg-red-100 text-red-600' :
                      'bg-yellow-100 text-yellow-600'
                    }`}>
                      {transactionLabels[tx.type]}
                    </span>
                  </div>
                  <p className="text-gray-600 text-sm">{tx.description}</p>
                  <p className="text-gray-400 text-xs">{tx.date}</p>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {activeTab === 'shop' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {mockShopItems.map(item => (
            <Card key={item.id} className="animate-fadeIn">
              <div className="flex items-center gap-4">
                <div className="text-4xl">{item.icon}</div>
                <div className="flex-1">
                  <h3 className="font-bold text-gray-800">{item.name}</h3>
                  <p className="text-gray-600 text-sm">{item.description}</p>
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-amber-500 font-medium">💰 {item.price}</span>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handlePurchase(item)}
                      disabled={goldBalance < item.price}
                    >
                      {goldBalance < item.price ? '余额不足' : '购买'}
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {purchaseModal.show && purchaseModal.item && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="max-w-sm animate-scaleIn">
            <div className="text-center">
              <div className="text-6xl mb-4">{purchaseModal.item.icon}</div>
              <h2 className="text-xl font-bold text-gray-800 mb-2">购买成功！</h2>
              <p className="text-gray-600 mb-4">已购买 {purchaseModal.item.name}</p>
              <p className="text-amber-500 mb-6">💰 -{purchaseModal.item.price}</p>
              <Button onClick={() => setPurchaseModal({ show: false, item: null })}>确定</Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  )
}

export default Gold