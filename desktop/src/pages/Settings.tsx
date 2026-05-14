import { useState } from 'react'
import { Settings, Save, RotateCcw, Coins, Star, AlertTriangle, CheckCircle } from 'lucide-react'
import Card from '../components/common/Card'
import Button from '../components/common/Button'

function SettingsPage() {
  const [rules, setRules] = useState({
    goldEarn: {
      completeTask: 10,
      excellentTask: 20,
      classAttendance: 5,
      helpClassmate: 15,
      correctWrong: 8,
    },
    goldDeduct: {
      overdueTask: -10,
      absentClass: -5,
      petNeglect: -15,
    },
    petGrowth: {
      feedCost: 5,
      playCost: 3,
      levelUpGrowth: 100,
    },
    privileges: {
      level1: '基础学习资料',
      level3: '进阶学习资料',
      level5: '专属学习空间',
      level7: '一对一辅导资格',
      level10: '学习之星称号',
    },
  })

  const [saved, setSaved] = useState(false)

  const handleInputChange = (category: string, key: string, value: number) => {
    setRules((prev) => ({
      ...prev,
      [category]: {
        ...prev[category],
        [key]: value,
      },
    }))
    setSaved(false)
  }

  const handleSave = () => {
    setSaved(true)
    setTimeout(() => setSaved(false), 3000)
  }

  const handleReset = () => {
    setRules({
      goldEarn: {
        completeTask: 10,
        excellentTask: 20,
        classAttendance: 5,
        helpClassmate: 15,
        correctWrong: 8,
      },
      goldDeduct: {
        overdueTask: -10,
        absentClass: -5,
        petNeglect: -15,
      },
      petGrowth: {
        feedCost: 5,
        playCost: 3,
        levelUpGrowth: 100,
      },
      privileges: {
        level1: '基础学习资料',
        level3: '进阶学习资料',
        level5: '专属学习空间',
        level7: '一对一辅导资格',
        level10: '学习之星称号',
      },
    })
    setSaved(false)
  }

  return (
    <div className="space-y-6">
      {/* 页面标题 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-orange-800">规则配置</h1>
          <p className="text-orange-500 mt-1">设置金币奖惩、宠物成长和特权解锁规则</p>
        </div>
        <div className="flex items-center gap-2">
          {saved && (
            <div className="flex items-center gap-2 px-4 py-2 bg-green-100 text-green-600 rounded-xl">
              <CheckCircle className="w-5 h-5" />
              已保存
            </div>
          )}
          <Button onClick={handleReset} variant="outline">
            <RotateCcw className="w-4 h-4 mr-2" />
            重置
          </Button>
          <Button onClick={handleSave}>
            <Save className="w-4 h-4 mr-2" />
            保存配置
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 金币获取规则 */}
        <Card className="shadow-lg">
          <div className="flex items-center gap-2 mb-4">
            <Coins className="w-5 h-5 text-amber-500" />
            <h2 className="text-lg font-semibold text-orange-800">金币获取规则</h2>
          </div>
          <div className="space-y-4">
            {Object.entries(rules.goldEarn).map(([key, value]) => (
              <div key={key} className="flex items-center justify-between">
                <label className="text-orange-700">
                  {key === 'completeTask' && '完成任务'}
                  {key === 'excellentTask' && '优秀作业'}
                  {key === 'classAttendance' && '课堂签到'}
                  {key === 'helpClassmate' && '帮助同学'}
                  {key === 'correctWrong' && '订正错题'}
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    value={value}
                    onChange={(e) => handleInputChange('goldEarn', key, Number(e.target.value))}
                    className="w-20 px-3 py-2 bg-orange-50 border border-orange-200 rounded-xl text-orange-800 text-center focus:outline-none focus:ring-2 focus:ring-orange-400"
                  />
                  <span className="text-amber-600 font-medium">金币</span>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* 金币扣减规则 */}
        <Card className="shadow-lg">
          <div className="flex items-center gap-2 mb-4">
            <AlertTriangle className="w-5 h-5 text-red-500" />
            <h2 className="text-lg font-semibold text-orange-800">金币扣减规则</h2>
          </div>
          <div className="space-y-4">
            {Object.entries(rules.goldDeduct).map(([key, value]) => (
              <div key={key} className="flex items-center justify-between">
                <label className="text-orange-700">
                  {key === 'overdueTask' && '逾期未交'}
                  {key === 'absentClass' && '旷课'}
                  {key === 'petNeglect' && '宠物忽视'}
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    value={Math.abs(value)}
                    onChange={(e) => handleInputChange('goldDeduct', key, -Math.abs(Number(e.target.value)))}
                    className="w-20 px-3 py-2 bg-red-50 border border-red-200 rounded-xl text-red-600 text-center focus:outline-none focus:ring-2 focus:ring-red-400"
                  />
                  <span className="text-red-500 font-medium">金币</span>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* 宠物成长规则 */}
        <Card className="shadow-lg">
          <div className="flex items-center gap-2 mb-4">
            <Star className="w-5 h-5 text-yellow-500" />
            <h2 className="text-lg font-semibold text-orange-800">宠物成长规则</h2>
          </div>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <label className="text-orange-700">喂食消耗</label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  value={rules.petGrowth.feedCost}
                  onChange={(e) => handleInputChange('petGrowth', 'feedCost', Number(e.target.value))}
                  className="w-20 px-3 py-2 bg-orange-50 border border-orange-200 rounded-xl text-orange-800 text-center focus:outline-none focus:ring-2 focus:ring-orange-400"
                />
                <span className="text-amber-600 font-medium">金币</span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <label className="text-orange-700">玩耍消耗</label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  value={rules.petGrowth.playCost}
                  onChange={(e) => handleInputChange('petGrowth', 'playCost', Number(e.target.value))}
                  className="w-20 px-3 py-2 bg-orange-50 border border-orange-200 rounded-xl text-orange-800 text-center focus:outline-none focus:ring-2 focus:ring-orange-400"
                />
                <span className="text-amber-600 font-medium">金币</span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <label className="text-orange-700">升级所需成长值</label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  value={rules.petGrowth.levelUpGrowth}
                  onChange={(e) => handleInputChange('petGrowth', 'levelUpGrowth', Number(e.target.value))}
                  className="w-20 px-3 py-2 bg-orange-50 border border-orange-200 rounded-xl text-orange-800 text-center focus:outline-none focus:ring-2 focus:ring-orange-400"
                />
                <span className="text-orange-600 font-medium">成长值</span>
              </div>
            </div>
          </div>
        </Card>

        {/* 特权解锁规则 */}
        <Card className="shadow-lg">
          <div className="flex items-center gap-2 mb-4">
            <Settings className="w-5 h-5 text-purple-500" />
            <h2 className="text-lg font-semibold text-orange-800">特权解锁规则</h2>
          </div>
          <div className="space-y-3">
            {Object.entries(rules.privileges).map(([key, value]) => (
              <div key={key} className="flex items-center gap-3 p-3 bg-purple-50 rounded-xl">
                <div className="w-8 h-8 bg-gradient-to-br from-purple-400 to-pink-500 rounded-lg flex items-center justify-center text-white font-bold">
                  {key.replace('level', '')}
                </div>
                <div className="flex-1">
                  <p className="text-orange-800 font-medium">{value}</p>
                  <p className="text-sm text-orange-500">宠物等级 {key.replace('level', '')} 解锁</p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  )
}

export default SettingsPage
