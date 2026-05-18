"""
任务管理接口（范海清负责）
"""
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, field_validator
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime

from app.core.database import get_db
from app.models import Task, User, Class, Group, GroupMember, Submission
from app.models.task import TaskType, TaskStatus
from app.models.submission import SubmissionStatus
from app.api.deps import get_current_teacher, get_current_active_user

router = APIRouter()


class TaskCreateRequest(BaseModel):
    """创建任务请求"""
    class_id: int
    group_id: Optional[int] = None
    title: str
    content: Optional[str] = None
    deadline: datetime
    max_score: float = 100.0
    late_penalty_rule: Optional[dict] = None
    task_type: str = "homework"
    
    @field_validator('title')
    def validate_title(cls, v):
        if len(v) < 1 or len(v) > 200:
            raise ValueError("任务标题长度必须在1-200之间")
        return v
    
    @field_validator('task_type')
    def validate_task_type(cls, v):
        if v not in ["homework", "preview", "project", "quiz"]:
            raise ValueError("任务类型必须是 homework/preview/project/quiz")
        return v


class TaskUpdateRequest(BaseModel):
    """更新任务请求"""
    title: Optional[str] = None
    content: Optional[str] = None
    deadline: Optional[datetime] = None
    max_score: Optional[float] = None
    late_penalty_rule: Optional[dict] = None
    status: Optional[str] = None


class TaskResponse(BaseModel):
    """任务响应"""
    id: int
    class_id: int
    class_name: str
    group_id: Optional[int]
    group_name: Optional[str]
    title: str
    content: Optional[str]
    deadline: str
    max_score: float
    late_penalty_rule: Optional[dict]
    task_type: str
    status: str
    created_at: str
    
    class Config:
        from_attributes = True


class SubmissionCreateRequest(BaseModel):
    """提交任务请求"""
    content: str


class SubmissionResponse(BaseModel):
    """提交响应"""
    id: int
    task_id: int
    task_title: str
    student_id: int
    student_name: str
    content: str
    score: Optional[float]
    feedback: Optional[str]
    status: str
    submitted_at: Optional[str]
    graded_at: Optional[str]
    
    class Config:
        from_attributes = True


@router.get("/", response_model=List[TaskResponse])
def get_tasks(
    class_id: Optional[int] = None,
    task_type: Optional[str] = None,
    status: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """获取任务列表"""
    query = db.query(Task)
    
    if class_id:
        query = query.filter(Task.class_id == class_id)
    
    if task_type:
        query = query.filter(Task.task_type == task_type)
    
    if status:
        query = query.filter(Task.status == status)
    
    # 权限过滤
    if current_user.role == "teacher":
        classes = db.query(Class).filter(Class.teacher_id == current_user.id).all()
        class_ids = [c.id for c in classes]
        query = query.filter(Task.class_id.in_(class_ids))
    else:
        # 学生查看自己班级的任务
        member_classes = db.query(Class).join(
            Group, Class.id == Group.class_id
        ).join(
            GroupMember, Group.id == GroupMember.group_id
        ).filter(GroupMember.user_id == current_user.id).distinct().all()
        class_ids = [c.id for c in member_classes]
        query = query.filter(Task.class_id.in_(class_ids))
    
    tasks = query.all()
    result = []
    
    for task in tasks:
        class_ = db.query(Class).filter(Class.id == task.class_id).first()
        group = db.query(Group).filter(Group.id == task.group_id).first() if task.group_id else None
        
        result.append({
            "id": task.id,
            "class_id": task.class_id,
            "class_name": class_.name if class_ else "",
            "group_id": task.group_id,
            "group_name": group.name if group else None,
            "title": task.title,
            "content": task.content,
            "deadline": str(task.deadline),
            "max_score": task.max_score,
            "late_penalty_rule": task.late_penalty_rule,
            "task_type": task.task_type,
            "status": task.status,
            "created_at": str(task.created_at)
        })
    
    return result


@router.get("/{task_id}", response_model=TaskResponse)
def get_task(
    task_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """获取任务详情"""
    task = db.query(Task).filter(Task.id == task_id).first()
    
    if not task:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="任务不存在"
        )
    
    # 权限验证
    if current_user.role == "teacher":
        class_ = db.query(Class).filter(Class.id == task.class_id).first()
        if not class_ or class_.teacher_id != current_user.id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="无权访问该任务"
            )
    else:
        is_member = db.query(GroupMember).join(
            Group, GroupMember.group_id == Group.id
        ).filter(
            Group.class_id == task.class_id,
            GroupMember.user_id == current_user.id
        ).first()
        if not is_member:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="您不是该班级成员"
            )
    
    class_ = db.query(Class).filter(Class.id == task.class_id).first()
    group = db.query(Group).filter(Group.id == task.group_id).first() if task.group_id else None
    
    return {
        "id": task.id,
        "class_id": task.class_id,
        "class_name": class_.name if class_ else "",
        "group_id": task.group_id,
        "group_name": group.name if group else None,
        "title": task.title,
        "content": task.content,
        "deadline": str(task.deadline),
        "max_score": task.max_score,
        "late_penalty_rule": task.late_penalty_rule,
        "task_type": task.task_type,
        "status": task.status,
        "created_at": str(task.created_at)
    }


@router.post("/", response_model=TaskResponse, status_code=status.HTTP_201_CREATED)
def create_task(
    request: TaskCreateRequest,
    db: Session = Depends(get_db),
    current_teacher: User = Depends(get_current_teacher)
):
    """创建任务（教师权限）"""
    # 验证班级
    class_ = db.query(Class).filter(Class.id == request.class_id).first()
    
    if not class_:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="班级不存在"
        )
    
    if class_.teacher_id != current_teacher.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="您不是该班级的创建者"
        )
    
    # 验证小组（如果有）
    group = None
    if request.group_id:
        group = db.query(Group).filter(Group.id == request.group_id).first()
        if not group:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="小组不存在"
            )
        if group.class_id != request.class_id:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="小组不属于该班级"
            )
    
    # 创建任务
    task = Task(
        class_id=request.class_id,
        group_id=request.group_id,
        title=request.title,
        content=request.content,
        deadline=request.deadline,
        max_score=request.max_score,
        late_penalty_rule=request.late_penalty_rule,
        task_type=request.task_type,
        status=TaskStatus.DRAFT
    )
    
    db.add(task)
    db.commit()
    db.refresh(task)
    
    return {
        "id": task.id,
        "class_id": task.class_id,
        "class_name": class_.name,
        "group_id": task.group_id,
        "group_name": group.name if group else None,
        "title": task.title,
        "content": task.content,
        "deadline": str(task.deadline),
        "max_score": task.max_score,
        "late_penalty_rule": task.late_penalty_rule,
        "task_type": task.task_type,
        "status": task.status,
        "created_at": str(task.created_at)
    }


@router.put("/{task_id}", response_model=TaskResponse)
def update_task(
    task_id: int,
    request: TaskUpdateRequest,
    db: Session = Depends(get_db),
    current_teacher: User = Depends(get_current_teacher)
):
    """更新任务（教师权限）"""
    task = db.query(Task).filter(Task.id == task_id).first()
    
    if not task:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="任务不存在"
        )
    
    class_ = db.query(Class).filter(Class.id == task.class_id).first()
    if not class_ or class_.teacher_id != current_teacher.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="您不是该班级的创建者"
        )
    
    if request.title:
        task.title = request.title
    
    if request.content:
        task.content = request.content
    
    if request.deadline:
        task.deadline = request.deadline
    
    if request.max_score:
        task.max_score = request.max_score
    
    if request.late_penalty_rule:
        task.late_penalty_rule = request.late_penalty_rule
    
    if request.status:
        if request.status not in ["draft", "published", "closed"]:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="状态必须是 draft/published/closed"
            )
        task.status = request.status
    
    db.commit()
    db.refresh(task)
    
    group = db.query(Group).filter(Group.id == task.group_id).first() if task.group_id else None
    
    return {
        "id": task.id,
        "class_id": task.class_id,
        "class_name": class_.name,
        "group_id": task.group_id,
        "group_name": group.name if group else None,
        "title": task.title,
        "content": task.content,
        "deadline": str(task.deadline),
        "max_score": task.max_score,
        "late_penalty_rule": task.late_penalty_rule,
        "task_type": task.task_type,
        "status": task.status,
        "created_at": str(task.created_at)
    }


@router.delete("/{task_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_task(
    task_id: int,
    db: Session = Depends(get_db),
    current_teacher: User = Depends(get_current_teacher)
):
    """删除任务（教师权限）"""
    task = db.query(Task).filter(Task.id == task_id).first()
    
    if not task:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="任务不存在"
        )
    
    class_ = db.query(Class).filter(Class.id == task.class_id).first()
    if not class_ or class_.teacher_id != current_teacher.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="您不是该班级的创建者"
        )
    
    db.delete(task)
    db.commit()
    
    return None


@router.post("/{task_id}/submit", response_model=SubmissionResponse)
def submit_task(
    task_id: int,
    request: SubmissionCreateRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """提交任务（学生权限）"""
    if current_user.role != "student":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="只有学生可以提交任务"
        )
    
    task = db.query(Task).filter(Task.id == task_id).first()
    
    if not task:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="任务不存在"
        )
    
    if task.status != "published":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="任务未发布"
        )
    
    # 检查是否是该班级学生
    is_member = db.query(GroupMember).join(
        Group, GroupMember.group_id == Group.id
    ).filter(
        Group.class_id == task.class_id,
        GroupMember.user_id == current_user.id
    ).first()
    
    if not is_member:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="您不是该班级成员"
        )
    
    # 检查是否已提交
    existing_submission = db.query(Submission).filter(
        Submission.task_id == task_id,
        Submission.student_id == current_user.id
    ).first()
    
    if existing_submission:
        # 更新提交
        existing_submission.content = request.content
        existing_submission.status = SubmissionStatus.PENDING
        existing_submission.submitted_at = datetime.now()
        db.commit()
        db.refresh(existing_submission)
        submission = existing_submission
    else:
        # 创建新提交
        submission = Submission(
            task_id=task_id,
            student_id=current_user.id,
            content=request.content,
            status=SubmissionStatus.PENDING,
            submitted_at=datetime.now()
        )
        db.add(submission)
        db.commit()
        db.refresh(submission)
    
    return {
        "id": submission.id,
        "task_id": submission.task_id,
        "task_title": task.title,
        "student_id": submission.student_id,
        "student_name": current_user.username,
        "content": submission.content,
        "score": submission.score,
        "feedback": submission.feedback,
        "status": submission.status,
        "submitted_at": str(submission.submitted_at) if submission.submitted_at else None,
        "graded_at": str(submission.graded_at) if submission.graded_at else None
    }


@router.get("/{task_id}/submissions", response_model=List[SubmissionResponse])
def get_task_submissions(
    task_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """获取任务提交列表"""
    task = db.query(Task).filter(Task.id == task_id).first()
    
    if not task:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="任务不存在"
        )
    
    # 权限验证
    if current_user.role == "teacher":
        class_ = db.query(Class).filter(Class.id == task.class_id).first()
        if not class_ or class_.teacher_id != current_user.id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="无权访问该任务的提交"
            )
        submissions = db.query(Submission).filter(Submission.task_id == task_id).all()
    else:
        # 学生只能查看自己的提交
        submissions = db.query(Submission).filter(
            Submission.task_id == task_id,
            Submission.student_id == current_user.id
        ).all()
    
    result = []
    for submission in submissions:
        student = db.query(User).filter(User.id == submission.student_id).first()
        result.append({
            "id": submission.id,
            "task_id": submission.task_id,
            "task_title": task.title,
            "student_id": submission.student_id,
            "student_name": student.username if student else "",
            "content": submission.content,
            "score": submission.score,
            "feedback": submission.feedback,
            "status": submission.status,
            "submitted_at": str(submission.submitted_at) if submission.submitted_at else None,
            "graded_at": str(submission.graded_at) if submission.graded_at else None
        })
    
    return result


@router.put("/submissions/{submission_id}/grade")
def grade_submission(
    submission_id: int,
    score: float,
    feedback: Optional[str] = None,
    db: Session = Depends(get_db),
    current_teacher: User = Depends(get_current_teacher)
):
    """批改任务（教师权限）"""
    submission = db.query(Submission).filter(Submission.id == submission_id).first()
    
    if not submission:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="提交不存在"
        )
    
    task = db.query(Task).filter(Task.id == submission.task_id).first()
    class_ = db.query(Class).filter(Class.id == task.class_id).first()
    
    if not class_ or class_.teacher_id != current_teacher.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="您不是该班级的创建者"
        )
    
    if score < 0 or score > task.max_score:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"分数必须在 0-{task.max_score} 之间"
        )
    
    submission.score = score
    submission.feedback = feedback
    submission.status = SubmissionStatus.GRADED
    submission.graded_at = datetime.now()
    
    db.commit()
    db.refresh(submission)
    
    return {"message": "批改成功"}
