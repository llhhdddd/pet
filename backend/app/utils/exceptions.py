class PetServiceException(Exception):
    def __init__(self, error_code: str, message: str):
        self.error_code = error_code
        self.message = message
        super().__init__(message)

class PetNotFoundError(PetServiceException):
    def __init__(self, message: str = "宠物不存在"):
        super().__init__("PET_001", message)

class GroupNotFoundError(PetServiceException):
    def __init__(self, message: str = "小组不存在"):
        super().__init__("PET_002", message)

class InsufficientGoldError(PetServiceException):
    def __init__(self, message: str = "金币不足"):
        super().__init__("PET_003", message)

class PetUnavailableError(PetServiceException):
    def __init__(self, reason: str):
        super().__init__("PET_004", f"宠物无法进行此操作: {reason}")

class CoolDownError(PetServiceException):
    def __init__(self, message: str = "操作冷却中"):
        super().__init__("PET_005", message)

class EvolutionConditionError(PetServiceException):
    def __init__(self, message: str = "进化条件不满足"):
        super().__init__("PET_006", message)