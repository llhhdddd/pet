"""
测试数据生成脚本
"""
import os
import sys
import random
from datetime import datetime, timedelta

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.core.database import SessionLocal, engine
from app.models import (
    User, Class, Group, GroupMember, Pet, Task, 
    Submission, GoldTransaction, TransactionType, TransactionSource
)
from app.utils.security import get_password_hash


def create_test_data():
    """创建测试数据"""
    db = SessionLocal()
    
    try:
        print("正在创建测试数据...")
        
        # 1. 创建测试教师
        teacher_password = get_password_hash("teacher123")
        teacher = User(
            username="teacher",
            email="teacher@example.com",
            hashed_password=teacher_password,
            role="teacher",
            is_active=True,
            is_verified=True
        )
        db.add(teacher)
        db.commit()
        db.refresh(teacher)
        print("✓ 创建教师账号: teacher")
        
        # 2. 创建测试学生
        students = []
        for i in range(10):
            password = get_password_hash(f"student{i+1}")
            student = User(
                username=f"student{i+1}",
                email=f"student{i+1}@example.com",
                hashed_password=password,
                role="student",
                is_active=True,
                is_verified=True
            )
            students.append(student)
            db.add(student)
        db.commit()
        print("✓ 创建10个学生账号")
        
        # 3. 创建班级
        class_ = Class(
            name="高三一班",
            invite_code="CLASS2026",
            teacher_id=teacher.id
        )
        db.add(class_)
        db.commit()
        db.refresh(class_)
        print("✓ 创建班级: 高三一班")
        
        # 4. 创建小组
        groups = []
        group_names = ["阳光组", "智慧组", "创新组", "奋进组", "团结组"]
        for i in range(5):
            group = Group(
                class_id=class_.id,
                name=group_names[i],
                gold_balance=random.randint(100, 500),
                growth_value=random.randint(0, 200),
                health_value=random.randint(60, 100)
            )
            groups.append(group)
            db.add(group)
        db.commit()
        
        # 5. 创建宠物并关联小组
        pet_names = ["小猫咪", "小狗狗", "小兔子", "小熊猫", "小企鹅"]
        pet_types = ["cat", "dog", "rabbit", "panda", "penguin"]
        
        for i, group in enumerate(groups):
            pet = Pet(
                name=pet_names[i],
                type=pet_types[i],
                level=random.randint(1, 5),
                growth_threshold=100,
                unlock_privileges={"privileges": []}
            )
            db.add(pet)
            db.commit()
            db.refresh(pet)
            
            group.pet_id = pet.id
            db.commit()
        
        print("✓ 创建5个小组和5只宠物")
        
        # 6. 分配学生到小组
        for i, student in enumerate(students):
            group = groups[i % 5]
            member = GroupMember(
                group_id=group.id,
                user_id=student.id,
                contribution=random.randint(0, 100)
            )
            db.add(member)
        db.commit()
        print("✓ 分配学生到小组")
        
        # 7. 创建测试任务
        task_titles = [
            "数学作业 - 第三章练习",
            "语文作文 - 我的梦想",
            "英语听力练习",
            "物理实验报告",
            "小组项目策划"
        ]
        
        for i in range(5):
            deadline = datetime.now() + timedelta(days=i+1)
            task = Task(
                class_id=class_.id,
                title=task_titles[i],
                content=f"这是第{i+1}个测试任务的内容",
                deadline=deadline,
                max_score=100.0,
                late_penalty_rule={"rate": 0.1, "max_deduction": 30},
                task_type="homework",
                status="published"
            )
            db.add(task)
        db.commit()
        print("✓ 创建5个测试任务")
        
        # 8. 创建测试提交
        tasks = db.query(Task).all()
        for task in tasks[:3]:  # 前3个任务有提交
            for student in students[:4]:  # 前4个学生提交
                submission = Submission(
                    task_id=task.id,
                    student_id=student.id,
                    content=f"{student.username}提交的{task.title}",
                    score=random.randint(60, 100),
                    feedback="完成得不错",
                    status="graded",
                    submitted_at=datetime.now() - timedelta(hours=random.randint(1, 24)),
                    graded_at=datetime.now() - timedelta(hours=random.randint(1, 12))
                )
                db.add(submission)
        db.commit()
        print("✓ 创建测试提交")
        
        # 9. 创建金币交易记录
        for student in students[:5]:
            transaction = GoldTransaction(
                user_id=student.id,
                group_id=groups[students.index(student) % 5].id,
                amount=random.randint(10, 50),
                transaction_type=TransactionType.EARN,
                source_type=TransactionSource.TASK_COMPLETE,
                related_id=random.choice(tasks).id if tasks else None
            )
            db.add(transaction)
        db.commit()
        print("✓ 创建金币交易记录")
        
        print("\n✅ 测试数据创建完成！")
        print(f"教师账号: teacher / teacher123")
        print(f"学生账号: student1~student10 / student1~student10")
        
    except Exception as e:
        print(f"❌ 创建测试数据失败: {e}")
        db.rollback()
    finally:
        db.close()


if __name__ == "__main__":
    create_test_data()
