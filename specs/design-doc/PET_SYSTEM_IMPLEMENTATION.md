# 宠物养成模块实现方案

## 1. 文档概述

### 1.1 文档说明
本文档详细描述宠物养成模块的技术实现方案，包括宠物属性系统、成长机制、互动功能、任务系统及外观变化系统的设计与实现。

### 1.2 关联文档
- **产品规格**: [PET_SYSTEM_SPEC.md](file:///C:/Users/liugu/Desktop/新建文件夹/pet/specs/product-spec/PET_SYSTEM_SPEC.md)
- **系统设计**: [SYSTEM_DESIGN.md](file:///C:/Users/liugu/Desktop/新建文件夹/pet/specs/design-doc/SYSTEM_DESIGN.md)
- **执行计划**: [EXECUTION_PLAN.md](file:///C:/Users/liugu/Desktop/新建文件夹/pet/specs/plan/EXECUTION_PLAN.md)

### 1.3 模块定位
```
┌─────────────────────────────────────────────────────────────┐
│                      宠物养成模块                            │
├─────────────────────────────────────────────────────────────┤
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │  属性系统    │  │  成长机制    │  │  互动功能    │      │
│  │  (状态管理)  │  │  (等级进化)  │  │  (喂食玩耍)  │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
│          │                 │                 │              │
│          ▼                 ▼                 ▼              │
│  ┌──────────────────────────────────────────────────────┐   │
│  │                    核心引擎                           │   │
│  │  (状态计算、事件触发、数据持久化)                     │   │
│  └──────────────────────────────────────────────────────┘   │
│          │                 │                 │              │
│          ▼                 ▼                 ▼              │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │  任务系统    │  │  外观系统    │  │  特权系统    │      │
│  │  (日常成就)  │  │  (形象变化)  │  │  (解锁功能)  │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
└─────────────────────────────────────────────────────────────┘
```

---

## 2. 宠物属性系统设计

### 2.1 核心属性定义

| 属性名称 | 英文标识 | 类型 | 取值范围 | 说明 |
|---------|---------|------|---------|------|
| 生命值 | health_value | INT | 0-100 | 宠物健康状态，0时宠物"生病"需特殊护理 |
| 饱食度 | hunger_value | INT | 0-100 | 宠物饥饿程度，影响生命值衰减速度 |
| 心情值 | mood_value | INT | 0-100 | 宠物愉悦度，影响成长效率和互动反馈 |
| 成长值 | growth_value | INT | 0-∞ | 累积成长经验，用于等级提升 |
| 等级 | level | INT | 1-99 | 宠物当前等级 |

### 2.2 属性量化标准

#### 2.2.1 生命值量化
```
生命值状态说明:
┌─────────────────────────────────────────────────────────────┐
| 数值范围 | 状态名称 | 颜色标识 | 影响效果                  |
├──────────┼──────────┼──────────┼───────────────────────────┤
| 81-100   | 精力充沛 | 绿色     | 成长效率+20%             |
| 61-80    | 状态良好 | 浅绿色   | 成长效率正常             |
| 41-60    | 略显疲惫 | 黄色     | 成长效率-10%             |
| 21-40    | 疲惫不堪 | 橙色     | 成长效率-30%，无法玩耍   |
| 0-20     | 生病虚弱 | 红色     | 无法执行任何操作，需治疗 |
└─────────────────────────────────────────────────────────────┘
```

#### 2.2.2 饱食度量化
```
饱食度状态说明:
┌─────────────────────────────────────────────────────────────┐
| 数值范围 | 状态名称 | 影响效果                  |
├──────────┼──────────┼───────────────────────────┤
| 81-100   | 吃饱     | 生命值衰减减缓50%         |
| 61-80    | 微饱     | 正常状态                 |
| 41-60    | 有点饿   | 生命值衰减加速20%         |
| 21-40    | 很饿     | 生命值衰减加速50%，心情-5 |
| 0-20     | 饥饿     | 生命值衰减加速100%        |
└─────────────────────────────────────────────────────────────┘
```

#### 2.2.3 心情值量化
```
心情值状态说明:
┌─────────────────────────────────────────────────────────────┐
| 数值范围 | 状态名称 | 影响效果                  |
├──────────┼──────────┼───────────────────────────┤
| 81-100   | 开心     | 成长效率+15%             |
| 61-80    | 愉快     | 成长效率+5%              |
| 41-60    | 一般     | 正常状态                 |
| 21-40    | 低落     | 成长效率-15%             |
| 0-20     | 郁闷     | 成长效率-30%，拒绝互动   |
└─────────────────────────────────────────────────────────────┘
```

### 2.3 属性关系图

```
┌─────────────────────────────────────────────────────────────┐
│                    属性相互影响关系                          │
└─────────────────────────────────────────────────────────────┘
                              │
          ┌───────────────────┼───────────────────┐
          ▼                   ▼                   ▼
    ┌──────────┐       ┌──────────┐       ┌──────────┐
    │  饱食度  │──────▶│  生命值  │◀─────│  心情值  │
    └──────────┘       └──────────┘       └──────────┘
         │                   │                   │
         │                   │                   │
         └───────────────────┼───────────────────┘
                             ▼
                      ┌──────────┐
                      │ 成长效率 │
                      └──────────┘
                             │
                             ▼
                      ┌──────────┐
                      │ 成长值   │───▶ 等级提升
                      └──────────┘
```

---

## 3. 成长机制设计

### 3.1 等级提升条件

```python
# 等级计算公式
def calculate_level(growth_value: int) -> int:
    """根据成长值计算当前等级"""
    return min(growth_value // 100 + 1, 99)  # 最高99级

def calculate_required_growth(current_level: int) -> int:
    """计算升级所需成长值"""
    return current_level * 100

def calculate_progress_to_next_level(growth_value: int) -> float:
    """计算距离下一等级的进度百分比"""
    current_level = calculate_level(growth_value)
    if current_level >= 99:
        return 100.0
    required = calculate_required_growth(current_level)
    current_progress = growth_value - (current_level - 1) * 100
    return (current_progress / 100) * 100
```

### 3.2 属性成长曲线

| 等级 | 升级所需成长值 | 解锁特权 | 属性加成 |
|-----|--------------|---------|---------|
| 1 | 100 | 基础功能 | 无 |
| 5 | 500 | 查看答案解析 | 成长效率+5% |
| 10 | 1000 | 优先查阅优秀作业 | 成长效率+10% |
| 15 | 1500 | 作业迟交免扣分1次/周 | 成长效率+15% |
| 20 | 2000 | 小组任务双倍金币 | 成长效率+20% |
| 30 | 3000 | 高级装扮解锁 | 成长效率+25% |
| 50 | 5000 | 专属宠物技能 | 成长效率+35% |
| 99 | 9900 | 满级成就 | 成长效率+50% |

### 3.3 进化触发条件

```
进化触发规则:
1. 等级达到指定阈值(Lv.10, Lv.20, Lv.30, Lv.50, Lv.99)
2. 满足最低属性要求:
   - 生命值 >= 60
   - 心情值 >= 70
   - 饱食度 >= 60
3. 消耗一定数量的小组金币

进化流程:
┌─────────────────────────────────────────────────────────────┐
│                    进化触发流程                             │
└─────────────────────────────────────────────────────────────┘
   等级达到阈值?
        │
        ▼ (是)
   属性满足条件?
        │
   ┌────┴────┐
   │(是)     │(否)
   ▼         ▼
消耗金币   提示提升属性
   │
   ▼
 进化成功
   │
   ├──▶ 更新外观形象
   ├──▶ 解锁新特权
   └──▶ 发放进化奖励
```

### 3.4 成长效率计算公式

```python
def calculate_growth_efficiency(pet) -> float:
    """计算当前成长效率系数"""
    efficiency = 1.0
    
    # 生命值加成
    if pet.health_value >= 81:
        efficiency += 0.20
    elif pet.health_value >= 61:
        efficiency += 0.0
    elif pet.health_value >= 41:
        efficiency -= 0.10
    elif pet.health_value >= 21:
        efficiency -= 0.30
    
    # 心情值加成
    if pet.mood_value >= 81:
        efficiency += 0.15
    elif pet.mood_value >= 61:
        efficiency += 0.05
    elif pet.mood_value >= 41:
        efficiency += 0.0
    elif pet.mood_value >= 21:
        efficiency -= 0.15
    else:
        efficiency -= 0.30
    
    # 等级加成
    level_bonus = min(pet.level * 0.005, 0.5)  # 最高+50%
    efficiency += level_bonus
    
    return max(efficiency, 0.1)  # 最低保留10%效率
```

---

## 4. 互动功能设计

### 4.1 互动类型与效果

| 互动类型 | 操作名称 | 消耗资源 | 效果 | 冷却时间 |
|---------|---------|---------|------|---------|
| 喂食 | 喂食 | 小组金币 | 饱食度+20~50 | 5分钟 |
| 清洁 | 洗澡 | 小组金币 | 生命值+10~20 | 30分钟 |
| 玩耍 | 玩耍 | 无 | 心情值+15~30，饱食度-5 | 10分钟 |
| 治疗 | 治疗 | 小组金币 | 生命值+30~50 | 1小时 |
| 抚摸 | 抚摸 | 无 | 心情值+5~10 | 1分钟 |

### 4.2 互动实现逻辑

```python
class PetInteractionService:
    def __init__(self, pet_repo, group_repo, gold_service):
        self.pet_repo = pet_repo
        self.group_repo = group_repo
        self.gold_service = gold_service
    
    async def feed(self, group_id: int, item_id: int, quantity: int = 1):
        """
        喂食宠物
        :param group_id: 小组ID
        :param item_id: 食物道具ID
        :param quantity: 喂食数量
        """
        group = await self.group_repo.get_by_id(group_id)
        pet = await self.pet_repo.get_by_id(group.pet_id)
        item = await self.shop_repo.get_item(item_id)
        
        total_cost = item.price * quantity
        
        if group.gold_balance < total_cost:
            raise InsufficientGoldError("小组金币不足")
        
        await self.gold_service.spend_group_gold(group_id, total_cost)
        
        # 计算饱食度增加量
        hunger_increase = item.effect_value.get('hunger', 20) * quantity
        pet.hunger_value = min(pet.hunger_value + hunger_increase, 100)
        
        # 附带生命值恢复
        health_increase = item.effect_value.get('health', 0) * quantity
        pet.health_value = min(pet.health_value + health_increase, 100)
        
        await self.pet_repo.update(pet)
        
        return InteractionResult(
            success=True,
            message=f"喂食成功！饱食度+{hunger_increase}",
            pet_state=pet.to_dict()
        )
    
    async def play(self, group_id: int):
        """
        与宠物玩耍
        :param group_id: 小组ID
        """
        group = await self.group_repo.get_by_id(group_id)
        pet = await self.pet_repo.get_by_id(group.pet_id)
        
        if pet.health_value < 21:
            raise PetUnavailableError("宠物生病中，无法玩耍")
        
        if pet.mood_value < 21:
            raise PetUnavailableError("宠物心情太差，拒绝玩耍")
        
        # 玩耍消耗饱食度，增加心情值
        mood_increase = random.randint(15, 30)
        hunger_decrease = 5
        
        pet.mood_value = min(pet.mood_value + mood_increase, 100)
        pet.hunger_value = max(pet.hunger_value - hunger_decrease, 0)
        
        await self.pet_repo.update(pet)
        
        return InteractionResult(
            success=True,
            message=f"玩耍成功！心情+{mood_increase}",
            pet_state=pet.to_dict()
        )
    
    async def heal(self, group_id: int):
        """
        治疗宠物
        :param group_id: 小组ID
        """
        group = await self.group_repo.get_by_id(group_id)
        pet = await self.pet_repo.get_by_id(group.pet_id)
        
        heal_cost = 50  # 治疗固定消耗50金币
        
        if group.gold_balance < heal_cost:
            raise InsufficientGoldError("小组金币不足")
        
        await self.gold_service.spend_group_gold(group_id, heal_cost)
        
        # 治疗恢复大量生命值
        health_increase = min(50, 100 - pet.health_value)
        pet.health_value += health_increase
        
        await self.pet_repo.update(pet)
        
        return InteractionResult(
            success=True,
            message=f"治疗成功！生命值+{health_increase}",
            pet_state=pet.to_dict()
        )
```

### 4.3 互动状态机

```
宠物互动状态机:
                              ┌──────────────┐
                              │   空闲状态    │
                              └──────┬───────┘
                                     │
          ┌──────────────────────────┼──────────────────────────┐
          │                          │                          │
          ▼                          ▼                          ▼
   ┌────────────┐            ┌────────────┐            ┌────────────┐
   │   喂食中   │            │   玩耍中   │            │   治疗中   │
   └──────┬─────┘            └──────┬─────┘            └──────┬─────┘
          │                         │                         │
          ▼                         ▼                         ▼
   ┌────────────┐            ┌────────────┐            ┌────────────┐
   │ 检查金币   │            │ 检查状态   │            │ 检查金币   │
   └──────┬─────┘            └──────┬─────┘            └──────┬─────┘
          │                         │                         │
    ┌─────┴─────┐            ┌──────┴──────┐            ┌─────┴─────┐
    │(充足)     │(不足)      │(正常)       │(异常)      │(充足)     │(不足)
    ▼           ▼            ▼            ▼            ▼           ▼
  扣除金币   失败提示      执行玩耍    失败提示      扣除金币   失败提示
    │                      │                         │
    ▼                      ▼                         ▼
 更新饱食度           更新心情饱食度              更新生命值
    │                      │                         │
    └──────────────────────┼──────────────────────────┘
                           ▼
                      返回空闲状态
```

---

## 5. 任务系统设计

### 5.1 任务类型

| 任务类型 | 标识 | 触发条件 | 奖励 | 周期 |
|---------|------|---------|------|------|
| 日常任务 | daily | 每日0点刷新 | 成长值+20, 金币+10 | 每日 |
| 成就任务 | achievement | 达成特定条件 | 成长值+50~200 | 一次性 |
| 学习任务 | learning | 教师发布 | 成长值+任务分值×0.5 | 一次性 |
| 小组任务 | group | 小组共同完成 | 成长值+100, 金币+50 | 周期性 |

### 5.2 日常任务设计

```python
class DailyTaskService:
    DAILY_TASKS = [
        {
            "id": "daily_login",
            "name": "每日签到",
            "description": "登录系统即可完成",
            "growth_reward": 10,
            "gold_reward": 5,
            "check_func": lambda user: user.last_login_at.date() == datetime.now().date()
        },
        {
            "id": "daily_complete_task",
            "name": "完成一个任务",
            "description": "提交并通过一个学习任务",
            "growth_reward": 20,
            "gold_reward": 15,
            "check_func": lambda user: user.today_completed_tasks >= 1
        },
        {
            "id": "daily_interact",
            "name": "陪伴宠物",
            "description": "与宠物互动3次",
            "growth_reward": 15,
            "gold_reward": 10,
            "check_func": lambda user: user.today_interactions >= 3
        },
        {
            "id": "daily_correct",
            "name": "订正错题",
            "description": "订正一道错题",
            "growth_reward": 15,
            "gold_reward": 10,
            "check_func": lambda user: user.today_corrections >= 1
        }
    ]
    
    async def check_daily_tasks(self, user_id: int):
        """检查用户每日任务完成情况"""
        user = await self.user_repo.get_by_id(user_id)
        completed_tasks = []
        
        for task in self.DAILY_TASKS:
            if task["check_func"](user):
                completed_tasks.append(task)
        
        return completed_tasks
    
    async def claim_daily_reward(self, user_id: int, task_id: str):
        """领取每日任务奖励"""
        task = next(t for t in self.DAILY_TASKS if t["id"] == task_id)
        
        # 添加成长值到小组宠物
        user = await self.user_repo.get_by_id(user_id)
        group = await self.group_repo.get_by_user_id(user_id)
        pet = await self.pet_repo.get_by_id(group.pet_id)
        
        pet.growth_value += task["growth_reward"]
        await self.pet_repo.update(pet)
        
        # 添加金币到个人
        await self.gold_service.add_personal_gold(user_id, task["gold_reward"])
        
        return {
            "success": True,
            "growth_added": task["growth_reward"],
            "gold_added": task["gold_reward"]
        }
```

### 5.3 成就任务设计

| 成就ID | 成就名称 | 解锁条件 | 奖励成长值 | 奖励特权 |
|-------|---------|---------|-----------|---------|
| ach_first_task | 初出茅庐 | 完成第一个任务 | 50 | 无 |
| ach_10_tasks | 学习达人 | 累计完成10个任务 | 100 | 成长效率+5% |
| ach_excellent | 优秀学生 | 获得5次优秀作业 | 150 | 优先批改 |
| ach_50_tasks | 坚持不懈 | 累计完成50个任务 | 200 | 每日任务+1 |
| ach_perfect | 完美答卷 | 获得一次满分 | 100 | 双倍经验卡×1 |
| ach_bug_hunter | 捉虫高手 | 成功捉虫10次 | 150 | 捉虫奖励+20% |
| ach_group_leader | 团队领袖 | 带领小组完成5个小组任务 | 200 | 小组金币+10% |
| ach_max_level | 满级大师 | 宠物达到99级 | 500 | 专属称号 |

### 5.4 任务奖励发放流程

```
任务奖励发放流程:
┌─────────────────────────────────────────────────────────────┐
│                    任务奖励发放流程                         │
└─────────────────────────────────────────────────────────────┘
                    任务完成/批改完成
                              │
                              ▼
                    计算基础奖励
                              │
                              ▼
              ┌──────────────┴──────────────┐
              │                             │
              ▼                             ▼
        个人奖励分配                   小组奖励分配
              │                             │
              │                             │
              ▼                             ▼
       30%个人金币                    70%小组金币
       记录个人流水                   记录小组流水
                                        │
                                        ▼
                                   宠物成长值+N
                                        │
                                        ▼
                                   检查等级提升
                                        │
                                        ▼
                                   解锁特权(如有)
```

---

## 6. 宠物外观变化系统

### 6.1 外观展示规则

```python
class PetAppearanceService:
    # 外观配置
    APPEARANCE_CONFIG = {
        "dog": {
            "base_url": "/static/pets/dog/",
            "levels": {
                1: "dog_lv1.png",
                5: "dog_lv5.png",
                10: "dog_lv10.png",
                20: "dog_lv20.png",
                30: "dog_lv30.png",
                50: "dog_lv50.png",
                99: "dog_lv99.png"
            },
            "evolutions": {
                10: "dog_evolve_1.png",
                20: "dog_evolve_2.png",
                30: "dog_evolve_3.png"
            }
        },
        "cat": {
            "base_url": "/static/pets/cat/",
            "levels": {
                1: "cat_lv1.png",
                5: "cat_lv5.png",
                10: "cat_lv10.png",
                20: "cat_lv20.png",
                30: "cat_lv30.png",
                50: "cat_lv50.png",
                99: "cat_lv99.png"
            },
            "evolutions": {
                10: "cat_evolve_1.png",
                20: "cat_evolve_2.png",
                30: "cat_evolve_3.png"
            }
        }
    }
    
    def get_current_appearance(self, pet) -> str:
        """获取宠物当前外观URL"""
        config = self.APPEARANCE_CONFIG.get(pet.type, self.APPEARANCE_CONFIG["dog"])
        levels = config["levels"]
        
        # 找到当前等级对应的外观
        current_level = pet.level
        appearance_key = 1
        
        for level in sorted(levels.keys()):
            if current_level >= level:
                appearance_key = level
            else:
                break
        
        return f"{config['base_url']}{levels[appearance_key]}"
    
    def get_unlocked_appearances(self, pet) -> list:
        """获取已解锁的外观列表"""
        config = self.APPEARANCE_CONFIG.get(pet.type, self.APPEARANCE_CONFIG["dog"])
        levels = config["levels"]
        
        unlocked = []
        for level in levels.keys():
            if pet.level >= level:
                unlocked.append(f"{config['base_url']}{levels[level]}")
        
        return unlocked
    
    def get_evolution_progress(self, pet) -> dict:
        """获取进化进度"""
        config = self.APPEARANCE_CONFIG.get(pet.type, self.APPEARANCE_CONFIG["dog"])
        evolutions = config["evolutions"]
        
        next_evolution = None
        progress = 0.0
        
        for evo_level in sorted(evolutions.keys()):
            if pet.level < evo_level:
                next_evolution = evo_level
                required_growth = evo_level * 100
                current_growth = pet.growth_value
                progress = min((current_growth / required_growth) * 100, 100)
                break
        
        return {
            "next_evolution_level": next_evolution,
            "progress_percent": progress,
            "unlocked_evolutions": [l for l in evolutions.keys() if pet.level >= l]
        }
```

### 6.2 外观状态映射

```
外观状态映射表:
┌─────────────────────────────────────────────────────────────┐
│ 状态条件                    │ 外观效果                     │
├─────────────────────────────┼───────────────────────────────┤
│ 生命值 < 20                │ 宠物显示生病动画，颜色灰暗      │
│ 饱食度 < 20                │ 宠物显示饥饿动画，肚子咕咕叫    │
│ 心情值 < 20                │ 宠物显示郁闷动画，头顶乌云      │
│ 等级达到进化节点            │ 宠物显示进化光效动画          │
│ 有未订正错题                │ 宠物身上显示虫子图标          │
│ 任务即将截止                │ 宠物显示焦虑动画              │
└─────────────────────────────────────────────────────────────┘
```

---

## 7. 可扩展性设计

### 7.1 新增宠物类型扩展

```python
class PetTypeRegistry:
    _registry = {}
    
    @classmethod
    def register_pet_type(cls, pet_type: str, config: dict):
        """
        注册新宠物类型
        :param pet_type: 宠物类型标识
        :param config: 配置字典，包含外观、属性成长系数等
        """
        cls._registry[pet_type] = config
    
    @classmethod
    def get_pet_type_config(cls, pet_type: str) -> dict:
        """获取宠物类型配置"""
        return cls._registry.get(pet_type, cls._registry.get("dog", {}))
    
    @classmethod
    def list_pet_types(cls) -> list:
        """列出所有已注册的宠物类型"""
        return list(cls._registry.keys())

# 扩展示例：注册新宠物类型
PetTypeRegistry.register_pet_type("rabbit", {
    "name": "兔子",
    "base_url": "/static/pets/rabbit/",
    "growth_factor": 1.2,      # 成长速度比普通快20%
    "health_factor": 0.8,      # 生命值上限为80%
    "mood_factor": 1.3,        # 心情值变化更快
    "levels": {1: "rabbit_lv1.png", 5: "rabbit_lv5.png", ...},
    "evolutions": {10: "rabbit_evolve_1.png", ...}
})
```

### 7.2 新增互动方式扩展

```python
class InteractionPlugin:
    """互动方式插件基类"""
    def __init__(self):
        self.id = ""
        self.name = ""
        self.description = ""
        self.cost = 0
        self.cool_down = 0
    
    async def execute(self, pet, group):
        """执行互动逻辑"""
        raise NotImplementedError

class InteractionRegistry:
    _registry = {}
    
    @classmethod
    def register_interaction(cls, interaction_id: str, plugin_class: type):
        """注册新互动方式"""
        cls._registry[interaction_id] = plugin_class
    
    @classmethod
    def get_interaction(cls, interaction_id: str) -> InteractionPlugin:
        """获取互动插件实例"""
        plugin_class = cls._registry.get(interaction_id)
        if plugin_class:
            return plugin_class()
        return None

# 扩展示例：注册新互动方式
class PetDanceInteraction(InteractionPlugin):
    def __init__(self):
        self.id = "dance"
        self.name = "跳舞"
        self.description = "和宠物一起跳舞"
        self.cost = 30  # 消耗30金币
        self.cool_down = 300  # 5分钟冷却
    
    async def execute(self, pet, group):
        # 跳舞增加大量心情值，消耗少量饱食度
        mood_increase = random.randint(25, 40)
        hunger_decrease = 10
        
        pet.mood_value = min(pet.mood_value + mood_increase, 100)
        pet.hunger_value = max(pet.hunger_value - hunger_decrease, 0)
        
        return {
            "success": True,
            "message": f"跳舞成功！心情+{mood_increase}",
            "changes": {"mood_value": mood_increase, "hunger_value": -hunger_decrease}
        }

InteractionRegistry.register_interaction("dance", PetDanceInteraction)
```

### 7.3 新增养成玩法扩展

```python
class GameplayPlugin:
    """养成玩法插件基类"""
    def __init__(self):
        self.id = ""
        self.name = ""
        self.description = ""
        self.required_level = 1
    
    async def trigger(self, pet, user=None, group=None):
        """触发玩法"""
        raise NotImplementedError
    
    async def check_availability(self, pet) -> bool:
        """检查玩法是否可用"""
        return pet.level >= self.required_level

class GameplayRegistry:
    _registry = {}
    
    @classmethod
    def register_gameplay(cls, gameplay_id: str, plugin_class: type):
        """注册新养成玩法"""
        cls._registry[gameplay_id] = plugin_class
    
    @classmethod
    def get_available_gameplays(cls, pet) -> list:
        """获取宠物当前可用的玩法"""
        available = []
        for gameplay_id, plugin_class in cls._registry.items():
            plugin = plugin_class()
            if await plugin.check_availability(pet):
                available.append(plugin)
        return available

# 扩展示例：注册新养成玩法
class PetAdventurePlugin(GameplayPlugin):
    def __init__(self):
        self.id = "adventure"
        self.name = "宠物探险"
        self.description = "让宠物外出探险，可能获得稀有道具"
        self.required_level = 10
    
    async def trigger(self, pet, user=None, group=None):
        # 探险逻辑：消耗饱食度，随机获得奖励
        if pet.hunger_value < 30:
            return {"success": False, "message": "宠物太饿了，无法探险"}
        
        pet.hunger_value -= 30
        
        # 随机奖励
        rewards = [
            {"type": "growth", "value": 20},
            {"type": "gold", "value": 15},
            {"type": "item", "value": "rare_item"},
            {"type": "nothing", "value": 0}
        ]
        
        reward = random.choice(rewards)
        
        if reward["type"] == "growth":
            pet.growth_value += reward["value"]
            message = f"探险发现宝藏！成长值+{reward['value']}"
        elif reward["type"] == "gold":
            await self.gold_service.add_group_gold(group.id, reward["value"])
            message = f"探险获得金币！小组金币+{reward['value']}"
        elif reward["type"] == "item":
            message = f"探险获得稀有道具！"
        else:
            message = "探险什么都没找到..."
        
        return {"success": True, "message": message}

GameplayRegistry.register_gameplay("adventure", PetAdventurePlugin)
```

---

## 8. 核心数据模型

### 8.1 宠物实体扩展

```sql
-- 扩展宠物表结构
ALTER TABLE pets
ADD COLUMN hunger_value INT DEFAULT 100,
ADD COLUMN mood_value INT DEFAULT 100,
ADD COLUMN last_interaction_at TIMESTAMP,
ADD COLUMN appearance_state VARCHAR(50) DEFAULT 'normal',
ADD COLUMN current_evolution INT DEFAULT 0;

-- 宠物互动记录表
CREATE TABLE pet_interactions (
    id SERIAL PRIMARY KEY,
    pet_id INT NOT NULL REFERENCES pets(id) ON DELETE CASCADE,
    user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    interaction_type VARCHAR(30) NOT NULL,
    interaction_data JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_pet_interactions_pet ON pet_interactions(pet_id);
CREATE INDEX idx_pet_interactions_user ON pet_interactions(user_id);
CREATE INDEX idx_pet_interactions_type ON pet_interactions(interaction_type);
```

### 8.2 任务成就关联表

```sql
-- 成就表
CREATE TABLE achievements (
    id SERIAL PRIMARY KEY,
    achievement_id VARCHAR(50) NOT NULL UNIQUE,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    icon_url VARCHAR(500),
    growth_reward INT DEFAULT 0,
    gold_reward INT DEFAULT 0,
    privilege_code VARCHAR(50),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 用户成就记录表
CREATE TABLE user_achievements (
    id SERIAL PRIMARY KEY,
    user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    achievement_id VARCHAR(50) NOT NULL REFERENCES achievements(achievement_id),
    progress INT DEFAULT 0,
    is_completed BOOLEAN DEFAULT FALSE,
    claimed_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, achievement_id)
);

CREATE INDEX idx_user_achievements_user ON user_achievements(user_id);
CREATE INDEX idx_user_achievements_achievement ON user_achievements(achievement_id);
```

---

## 9. API接口设计

### 9.1 获取宠物信息

**GET /api/v1/pets/{pet_id}**

```json
{
    "code": 200,
    "message": "success",
    "data": {
        "id": 1,
        "name": "小旺",
        "type": "dog",
        "level": 5,
        "growth_value": 450,
        "growth_to_next_level": 500,
        "health_value": 90,
        "hunger_value": 75,
        "mood_value": 85,
        "image_url": "/static/pets/dog/dog_lv5.png",
        "appearance_state": "normal",
        "unlocked_images": ["dog_lv1", "dog_lv5"],
        "privileges": ["view_answer", "view_excellent"],
        "evolution_progress": {
            "next_evolution_level": 10,
            "progress_percent": 45.0
        }
    }
}
```

### 9.2 宠物互动

**POST /api/v1/groups/{group_id}/pet/interact**

请求体:
```json
{
    "interaction_type": "feed",
    "item_id": 1,
    "quantity": 1
}
```

响应:
```json
{
    "code": 200,
    "message": "success",
    "data": {
        "interaction_type": "feed",
        "message": "喂食成功！饱食度+25",
        "pet_state": {
            "health_value": 90,
            "hunger_value": 100,
            "mood_value": 85
        },
        "cost": {
            "gold_spent": 15
        }
    }
}
```

### 9.3 领取任务奖励

**POST /api/v1/users/{user_id}/tasks/{task_id}/claim**

响应:
```json
{
    "code": 200,
    "message": "success",
    "data": {
        "task_id": "daily_login",
        "task_name": "每日签到",
        "rewards": {
            "personal_gold": 5,
            "group_gold": 0,
            "growth_value": 10
        },
        "pet_level_up": false
    }
}
```

---

## 10. 关键流程图

### 10.1 宠物成长流程

```
┌─────────────────────────────────────────────────────────────┐
│                    宠物成长流程图                           │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
                       任务完成/互动
                              │
                              ▼
                   计算成长值增量(含效率系数)
                              │
                              ▼
                    更新宠物成长值
                              │
                              ▼
                   检查是否达到升级条件
                              │
                    ┌─────────┴─────────┐
                    │(是)               │(否)
                    ▼                   ▼
              等级+1              返回当前状态
                    │
                    ▼
              检查进化节点
                    │
            ┌───────┴───────┐
            │(达到)         │(未达到)
            ▼               ▼
         触发进化          解锁特权(如有)
            │
            ▼
         更新外观
            │
            ▼
         发放进化奖励
```

### 10.2 属性衰减流程

```
┌─────────────────────────────────────────────────────────────┐
│                    属性衰减流程图                           │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
                       定时任务触发
                              │
                              ▼
                   遍历所有活跃宠物
                              │
                              ▼
              ┌─────────────────────────┐
              │                        │
              ▼                        ▼
         饱食度衰减               生命值衰减
    (每30分钟-1)           (根据饱食度计算)
              │                        │
              └──────────┬─────────────┘
                         ▼
                  检查属性阈值
                         │
              ┌──────────┴──────────┐
              │(低于阈值)           │(正常)
              ▼                     ▼
         发送提醒通知           更新数据库
              │
              ▼
         桌面端气泡提示
```

---

## 11. 异常处理机制

### 11.1 异常类型定义

| 异常类型 | 错误码 | 场景 |
|---------|-------|------|
| PetNotFoundError | PET_001 | 宠物不存在 |
| GroupNotFoundError | PET_002 | 小组不存在 |
| InsufficientGoldError | PET_003 | 金币不足 |
| PetUnavailableError | PET_004 | 宠物状态异常无法互动 |
| CoolDownError | PET_005 | 操作冷却中 |
| EvolutionConditionError | PET_006 | 进化条件不满足 |

### 11.2 异常处理示例

```python
class PetServiceException(Exception):
    def __init__(self, error_code: str, message: str):
        self.error_code = error_code
        self.message = message
        super().__init__(message)

class InsufficientGoldError(PetServiceException):
    def __init__(self, message: str = "金币不足"):
        super().__init__("PET_003", message)

class PetUnavailableError(PetServiceException):
    def __init__(self, reason: str):
        super().__init__("PET_004", f"宠物无法进行此操作: {reason}")

# FastAPI异常处理器
@app.exception_handler(PetServiceException)
async def pet_exception_handler(request: Request, exc: PetServiceException):
    return JSONResponse(
        status_code=400,
        content={
            "code": exc.error_code,
            "message": exc.message,
            "error": type(exc).__name__
        }
    )
```

---

## 12. 性能优化策略

### 12.1 缓存策略

```python
class PetCacheService:
    def __init__(self, redis_client):
        self.redis = redis_client
        self.PET_CACHE_TTL = 300  # 5分钟
        self.GROUP_CACHE_TTL = 600  # 10分钟
    
    async def get_pet(self, pet_id: int) -> Optional[Pet]:
        """从缓存获取宠物信息"""
        cache_key = f"pet:{pet_id}"
        cached = await self.redis.get(cache_key)
        
        if cached:
            return Pet.parse_raw(cached)
        
        # 从数据库获取并缓存
        pet = await self.pet_repo.get_by_id(pet_id)
        if pet:
            await self.redis.set(cache_key, pet.json(), expire=self.PET_CACHE_TTL)
        
        return pet
    
    async def invalidate_pet_cache(self, pet_id: int):
        """失效宠物缓存"""
        await self.redis.delete(f"pet:{pet_id}")
    
    async def increment_growth(self, pet_id: int, amount: int):
        """原子增量更新成长值"""
        cache_key = f"pet:{pet_id}:growth"
        await self.redis.incrby(cache_key, amount)
        
        # 定期同步到数据库
        await self._sync_growth_to_db(pet_id)
```

### 12.2 批量操作优化

```python
class PetBatchService:
    async def batch_update_pet_states(self, pet_ids: list):
        """批量更新宠物状态"""
        async with self.db.transaction():
            # 使用批量更新减少数据库交互
            stmt = (
                update(Pet)
                .where(Pet.id.in_(pet_ids))
                .values(hunger_value=Pet.hunger_value - 1)
            )
            await self.db.execute(stmt)
    
    async def batch_check_health_decay(self):
        """批量检查健康值衰减"""
        # 使用SQL查询直接筛选需要衰减的宠物
        stmt = select(Pet).where(
            Pet.health_value > 0,
            Pet.hunger_value < 40
        )
        result = await self.db.execute(stmt)
        pets = result.scalars().all()
        
        # 批量更新
        async with self.db.transaction():
            for pet in pets:
                decay_amount = min(
                    (40 - pet.hunger_value) // 10,
                    pet.health_value
                )
                pet.health_value -= decay_amount
            
            await self.db.commit()
```

---

## 13. 安全与权限

### 13.1 权限检查

```python
class PetPermissionService:
    async def check_pet_access(self, user_id: int, pet_id: int) -> bool:
        """检查用户是否有权限访问宠物"""
        # 获取用户所在小组
        group_member = await self.group_member_repo.get_by_user_id(user_id)
        if not group_member:
            return False
        
        # 获取宠物所属小组
        pet = await self.pet_repo.get_by_id(pet_id)
        if not pet:
            return False
        
        # 检查是否属于同一小组
        group = await self.group_repo.get_by_id(group_member.group_id)
        return group.pet_id == pet_id
    
    async def check_group_pet_access(self, user_id: int, group_id: int) -> bool:
        """检查用户是否有权限操作小组宠物"""
        group_member = await self.group_member_repo.get_by_user_id_and_group_id(
            user_id, group_id
        )
        return group_member is not None
```

### 13.2 操作日志

```python
class PetActionLogService:
    async def log_action(self, user_id: int, action_type: str, target_id: int, details: dict = None):
        """记录宠物操作日志"""
        log_entry = PetActionLog(
            user_id=user_id,
            action_type=action_type,
            target_id=target_id,
            details=details,
            created_at=datetime.now()
        )
        await self.db.add(log_entry)
        await self.db.commit()

# 使用示例
await action_log_service.log_action(
    user_id=1,
    action_type="feed",
    target_id=1,
    details={"item_id": 1, "cost": 15, "hunger_increase": 25}
)
```

---

## 14. 部署与集成

### 14.1 模块依赖

| 依赖模块 | 说明 |
|---------|------|
| auth | 用户认证、角色权限 |
| groups | 小组管理 |
| gold | 金币经济系统 |
| tasks | 任务管理 |
| websocket | 实时同步 |

### 14.2 目录结构

```
backend/
├── app/
│   ├── api/
│   │   └── v1/
│   │       ├── pets.py          # 宠物API路由
│   │       └── interactions.py  # 互动API路由
│   ├── services/
│   │   ├── pet_service.py      # 宠物核心服务
│   │   ├── interaction_service.py  # 互动服务
│   │   ├── growth_service.py   # 成长服务
│   │   └── appearance_service.py   # 外观服务
│   ├── repositories/
│   │   ├── pet_repository.py   # 宠物数据访问
│   │   └── interaction_repository.py  # 互动记录
│   ├── schemas/
│   │   ├── pet_schemas.py      # 宠物数据模型
│   │   └── interaction_schemas.py    # 互动数据模型
│   ├── plugins/
│   │   └── pet/                # 宠物类型/互动插件
│   └── utils/
│       └── pet_calculator.py   # 属性计算工具
└── tests/
    ├── test_pet_service.py      # 宠物服务测试
    ├── test_interaction.py      # 互动功能测试
    └── test_growth.py           # 成长机制测试
```

---

## 15. 总结

本实现方案涵盖了宠物养成模块的核心功能：

1. **属性系统**：定义了生命值、饱食度、心情值、成长值四大核心属性及其量化标准
2. **成长机制**：实现了等级计算、成长效率、进化触发等逻辑
3. **互动功能**：支持喂食、清洁、玩耍、治疗等多种互动方式
4. **任务系统**：包含日常任务和成就任务，支持奖励发放
5. **外观系统**：实现了随等级变化的外观展示和进化机制
6. **可扩展性**：设计了插件化架构，支持新增宠物类型、互动方式和养成玩法

方案遵循系统设计文档的技术栈规范，使用FastAPI + SQLAlchemy实现，确保与现有系统无缝集成。