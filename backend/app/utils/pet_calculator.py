def calculate_level(growth_value: int) -> int:
    """根据成长值计算当前等级"""
    return min(growth_value // 100 + 1, 99)

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

def calculate_growth_efficiency(pet) -> float:
    """计算当前成长效率系数"""
    efficiency = 1.0
    
    if pet.health_value >= 81:
        efficiency += 0.20
    elif pet.health_value >= 61:
        efficiency += 0.0
    elif pet.health_value >= 41:
        efficiency -= 0.10
    elif pet.health_value >= 21:
        efficiency -= 0.30
    
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
    
    level_bonus = min(pet.level * 0.005, 0.5)
    efficiency += level_bonus
    
    return max(efficiency, 0.1)