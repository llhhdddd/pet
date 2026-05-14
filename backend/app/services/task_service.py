from sqlalchemy.ext.asyncio import AsyncSession
from datetime import datetime

from app.db.models import Achievement, UserAchievement
from app.utils.pet_calculator import calculate_level

class TaskService:
    DAILY_TASKS = [
        {
            "id": "daily_login",
            "name": "每日签到",
            "description": "登录系统即可完成",
            "growth_reward": 10,
            "gold_reward": 5
        },
        {
            "id": "daily_complete_task",
            "name": "完成一个任务",
            "description": "提交并通过一个学习任务",
            "growth_reward": 20,
            "gold_reward": 15
        },
        {
            "id": "daily_interact",
            "name": "陪伴宠物",
            "description": "与宠物互动3次",
            "growth_reward": 15,
            "gold_reward": 10
        },
        {
            "id": "daily_correct",
            "name": "订正错题",
            "description": "订正一道错题",
            "growth_reward": 15,
            "gold_reward": 10
        }
    ]
    
    def __init__(self, db: AsyncSession):
        self.db = db
    
    async def check_daily_tasks(self, user_id: int):
        return self.DAILY_TASKS
    
    async def claim_daily_reward(self, user_id: int, task_id: str):
        task = next((t for t in self.DAILY_TASKS if t["id"] == task_id), None)
        if not task:
            raise ValueError("任务不存在")
        
        user = await self._get_user(user_id)
        group = await self._get_group_by_user(user_id)
        
        if not group or not group.pet_id:
            raise ValueError("用户未加入小组或小组无宠物")
        
        pet = await self._get_pet(group.pet_id)
        
        old_level = pet.level
        pet.growth_value += task["growth_reward"]
        new_level = calculate_level(pet.growth_value)
        
        await self.db.commit()
        
        return {
            "success": True,
            "growth_added": task["growth_reward"],
            "gold_added": task["gold_reward"],
            "level_up": new_level > old_level
        }
    
    async def check_achievements(self, user_id: int):
        achievements = await self.db.execute(
            self.db.query(Achievement).filter(Achievement.is_active == True)
        )
        return achievements.scalars().all()
    
    async def update_achievement_progress(self, user_id: int, achievement_id: str, progress: int):
        user_achievement = await self.db.execute(
            self.db.query(UserAchievement).filter(
                UserAchievement.user_id == user_id,
                UserAchievement.achievement_id == achievement_id
            )
        )
        user_achievement = user_achievement.scalar_one_or_none()
        
        if not user_achievement:
            user_achievement = UserAchievement(
                user_id=user_id,
                achievement_id=achievement_id,
                progress=progress
            )
            self.db.add(user_achievement)
        else:
            user_achievement.progress = progress
        
        await self.db.commit()
    
    async def _get_user(self, user_id):
        from app.db.models import User
        result = await self.db.execute(
            self.db.query(User).filter(User.id == user_id)
        )
        return result.scalar_one_or_none()
    
    async def _get_group_by_user(self, user_id):
        from app.db.models import GroupMember, Group
        result = await self.db.execute(
            self.db.query(Group).join(GroupMember).filter(GroupMember.user_id == user_id)
        )
        return result.scalar_one_or_none()
    
    async def _get_pet(self, pet_id):
        from app.db.models import Pet
        result = await self.db.execute(
            self.db.query(Pet).filter(Pet.id == pet_id)
        )
        return result.scalar_one_or_none()