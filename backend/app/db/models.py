from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, JSON, Boolean
from sqlalchemy.orm import relationship
from datetime import datetime

from app.db.session import Base

class Pet(Base):
    __tablename__ = "pets"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(50), nullable=False)
    type = Column(String(30), nullable=False)
    level = Column(Integer, default=1)
    growth_value = Column(Integer, default=0)
    health_value = Column(Integer, default=100)
    hunger_value = Column(Integer, default=100)
    mood_value = Column(Integer, default=100)
    image_url = Column(String(500))
    appearance_state = Column(String(50), default="normal")
    current_evolution = Column(Integer, default=0)
    unlocked_images = Column(JSON, default=[])
    unlocked_privileges = Column(JSON, default=[])
    created_at = Column(DateTime, default=datetime.now)
    updated_at = Column(DateTime, default=datetime.now, onupdate=datetime.now)

class PetInteraction(Base):
    __tablename__ = "pet_interactions"
    
    id = Column(Integer, primary_key=True, index=True)
    pet_id = Column(Integer, ForeignKey("pets.id"))
    user_id = Column(Integer, ForeignKey("users.id"))
    interaction_type = Column(String(30), nullable=False)
    interaction_data = Column(JSON)
    created_at = Column(DateTime, default=datetime.now)
    
    pet = relationship("Pet")

class Achievement(Base):
    __tablename__ = "achievements"
    
    id = Column(Integer, primary_key=True, index=True)
    achievement_id = Column(String(50), unique=True, nullable=False)
    name = Column(String(100), nullable=False)
    description = Column(String(500))
    icon_url = Column(String(500))
    growth_reward = Column(Integer, default=0)
    gold_reward = Column(Integer, default=0)
    privilege_code = Column(String(50))
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.now)

class UserAchievement(Base):
    __tablename__ = "user_achievements"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    achievement_id = Column(String(50), ForeignKey("achievements.achievement_id"))
    progress = Column(Integer, default=0)
    is_completed = Column(Boolean, default=False)
    claimed_at = Column(DateTime)
    created_at = Column(DateTime, default=datetime.now)
    
    achievement = relationship("Achievement")