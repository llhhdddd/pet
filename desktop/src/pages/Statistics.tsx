import { useState, useEffect } from 'react'
import { BarChart3, TrendingUp, Users, FileText, Award, AlertCircle } from 'lucide-react'
import Card from '../components/common/Card'
import { classApi, groupApi } from '../services/api'

function Statistics() {
  const [classes, setClasses] = useState<any[]>([])
  const [selectedClass, setSelectedClass] = useState<number | null>(null)
  const [statistics, setStatistics] = useState({
    totalStudents: 0,
    avgScore: 0,
    submitRate: 0,
    activeGroups: 0,
  })
  const [groupRanking, setGroupRanking] = useState<any[]>([])
  const [warnings, setWarnings] = useState<any[]>([])

  useEffect(() => {
    loadClasses()
  }, [])

  useEffect(() => {
    if (selectedClass) {
      loadStatistics(selectedClass)
      loadGroupRanking(selectedClass)
      loadWarnings(selectedClass)
    }
  }, [selectedClass])

  const loadClasses = async () => {
    try {
      const response = await classApi.getClasses()
      setClasses(response.data)
      if (response.data.length > 0) {
        setSelectedClass(response.data[0].id)
      }
    } catch (err) {
      console.error('加载班级列表失败:', err)
    }
  }

  const loadStatistics = async (classId: number) => {
    try {
      const response = await classApi.getClassStatistics(classId)
      setStatistics(response.data)
    } catch (err) {
      console.error('加载班级统计失败:', err)
    }
  }

  const loadGroupRanking = async (classId: number) => {
    try {
      const response = await groupApi.getGroupRanking(classId)
      setGroupRanking(response.data)
    } catch (err) {
      console.error('加载小组排名失败:', err)
    }
  }

  const loadWarnings = async (classId: number) => {
    try {
      setWarnings([
        { id: 1, type: 'task', message: '张三连续3次未提交作业', student: '张三' },
        { id: 2, type: 'score', message: '李四最近两次测试成绩下滑明显', student: '李四' },
        { id: 3, type: 'pet', message: '第三小组宠物健康值低于30%', group: '第三小组' },
      ])
    } catch (err) {
      console.error('加载预警信息失败:', err)
    }
  }

  return (
    <div className="space-y-6">
      {/* 页面标题 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-orange-800">学情分析</h1>
          <p className="text-orange-500 mt-1">查看班级学习数据和异常预警</p>
        </div>
      </div>

      {/* 班级选择 */}
      <div className="bg-white/80 backdrop-blur-lg rounded-2xl p-4 shadow-lg">
        <label className="block text-orange-700 text-sm font-medium mb-2">选择班级</label>
        <div className="flex flex-wrap gap-2">
          {classes.map((cls) => (
            <button
              key={cls.id}
              onClick={() => setSelectedClass(cls.id)}
              className={`px-4 py-2 rounded-xl font-medium transition-all duration-200 ${
                selectedClass === cls.id
                  ? 'bg-gradient-to-r from-orange-400 to-amber-500 text-white shadow-md'
                  : 'bg-orange-50 text-orange-600 hover:bg-orange-100'
              }`}
            >
              {cls.name}
            </button>
          ))}
        </div>
      </div>

      {/* 统计卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-orange-400 to-amber-500 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white/80 text-sm">总学生数</p>
              <p className="text-3xl font-bold mt-1">{statistics.totalStudents}</p>
            </div>
            <Users className="w-12 h-12 text-white/50" />
          </div>
        </Card>
        <Card className="bg-gradient-to-br from-green-400 to-emerald-500 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white/80 text-sm">平均分</p>
              <p className="text-3xl font-bold mt-1">{statistics.avgScore}</p>
            </div>
            <TrendingUp className="w-12 h-12 text-white/50" />
          </div>
        </Card>
        <Card className="bg-gradient-to-br from-blue-400 to-indigo-500 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white/80 text-sm">作业提交率</p>
              <p className="text-3xl font-bold mt-1">{statistics.submitRate}%</p>
            </div>
            <FileText className="w-12 h-12 text-white/50" />
          </div>
        </Card>
        <Card className="bg-gradient-to-br from-purple-400 to-pink-500 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white/80 text-sm">活跃小组</p>
              <p className="text-3xl font-bold mt-1">{statistics.activeGroups}</p>
            </div>
            <Award className="w-12 h-12 text-white/50" />
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 小组排名 */}
        <Card className="shadow-lg">
          <div className="flex items-center gap-2 mb-4">
            <BarChart3 className="w-5 h-5 text-orange-500" />
            <h2 className="text-lg font-semibold text-orange-800">小组排行榜</h2>
          </div>
          <div className="space-y-3">
            {groupRanking.map((group, index) => (
              <div
                key={group.id}
                className="flex items-center gap-3 p-3 bg-orange-50 rounded-xl"
              >
                <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-white ${
                  index === 0 ? 'bg-gradient-to-br from-yellow-400 to-orange-500' :
                  index === 1 ? 'bg-gradient-to-br from-gray-300 to-gray-400' :
                  index === 2 ? 'bg-gradient-to-br from-amber-600 to-amber-700' :
                  'bg-gradient-to-br from-orange-300 to-orange-400'
                }`}>
                  {index + 1}
                </div>
                <div className="flex-1">
                  <p className="font-medium text-orange-800">{group.name}</p>
                  <p className="text-sm text-orange-500">{group.members_count} 名成员</p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-amber-600">{group.total_gold} 金币</p>
                  <p className="text-xs text-orange-400">宠物等级 {group.pet_level}</p>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* 异常预警 */}
        <Card className="shadow-lg">
          <div className="flex items-center gap-2 mb-4">
            <AlertCircle className="w-5 h-5 text-red-500" />
            <h2 className="text-lg font-semibold text-orange-800">异常预警</h2>
          </div>
          <div className="space-y-3">
            {warnings.map((warning) => (
              <div
                key={warning.id}
                className="flex items-start gap-3 p-3 bg-red-50 rounded-xl border border-red-100"
              >
                <AlertCircle className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />
                <div className="flex-1">
                  <p className="text-orange-800">{warning.message}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs px-2 py-0.5 bg-red-100 text-red-600 rounded-full">
                      {warning.type === 'task' ? '作业逾期' : warning.type === 'score' ? '成绩下滑' : '宠物异常'}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  )
}

export default Statistics
