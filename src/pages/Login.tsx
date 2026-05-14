import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Mail, Lock, Phone, User, Eye, EyeOff, ChevronRight, CheckCircle, AlertCircle, Loader2, ArrowLeft, RefreshCw } from 'lucide-react'
import Input from '../components/common/Input'
import Button from '../components/common/Button'
import useStore from '../store/useStore'

function Login() {
  const navigate = useNavigate()
  const { login, user } = useStore()

  const [isLogin, setIsLogin] = useState(true)
  const [role, setRole] = useState<'student' | 'teacher'>('student')
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
  })
  const [passwordStrength, setPasswordStrength] = useState(0)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [successMessage, setSuccessMessage] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [currentStep, setCurrentStep] = useState(1)
  const [isRememberMe, setIsRememberMe] = useState(false)
  const [verificationCode, setVerificationCode] = useState('')
  const [isVerifying, setIsVerifying] = useState(false)
  
  const [isForgotPassword, setIsForgotPassword] = useState(false)
  const [forgotStep, setForgotStep] = useState(1)
  const [forgotFormData, setForgotFormData] = useState({
    email: '',
    phone: '',
    code: '',
    newPassword: '',
    confirmPassword: '',
  })
  const [forgotPasswordStrength, setForgotPasswordStrength] = useState(0)
  const [showForgotPassword, setShowForgotPassword] = useState(false)
  const [showForgotConfirmPassword, setShowForgotConfirmPassword] = useState(false)
  const [forgotErrors, setForgotErrors] = useState<Record<string, string>>({})
  const [forgotSuccessMessage, setForgotSuccessMessage] = useState('')
  const [isForgotSubmitting, setIsForgotSubmitting] = useState(false)
  const [isSendingCode, setIsSendingCode] = useState(false)

  useEffect(() => {
    if (user) {
      navigate(user.role === 'teacher' ? '/class' : '/home')
    }
  }, [user, navigate])

  useEffect(() => {
    if (!isLogin) {
      let strength = 0
      const pwd = formData.password
      if (pwd.length >= 8) strength += 1
      if (pwd.length >= 12) strength += 1
      if (/[a-z]/.test(pwd)) strength += 1
      if (/[A-Z]/.test(pwd)) strength += 1
      if (/[0-9]/.test(pwd)) strength += 1
      if (/[!@#$%^&*(),.?":{}|<>]/.test(pwd)) strength += 1
      setPasswordStrength(Math.min(strength, 4))
    }
  }, [formData.password, isLogin])

  useEffect(() => {
    let strength = 0
    const pwd = forgotFormData.newPassword
    if (pwd.length >= 8) strength += 1
    if (pwd.length >= 12) strength += 1
    if (/[a-z]/.test(pwd)) strength += 1
    if (/[A-Z]/.test(pwd)) strength += 1
    if (/[0-9]/.test(pwd)) strength += 1
    if (/[!@#$%^&*(),.?":{}|<>]/.test(pwd)) strength += 1
    setForgotPasswordStrength(Math.min(strength, 4))
  }, [forgotFormData.newPassword])

  const validateForm = () => {
    const newErrors: Record<string, string> = {}
    
    if (isLogin) {
      if (!formData.username.trim()) {
        newErrors.username = '请输入用户名'
      }
      if (!formData.password) {
        newErrors.password = '请输入密码'
      }
    } else {
      if (!formData.username.trim()) {
        newErrors.username = '请输入用户名'
      }
      if (!formData.email) {
        newErrors.email = '请输入邮箱'
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
        newErrors.email = '请输入有效的邮箱地址'
      }
      if (!formData.phone) {
        newErrors.phone = '请输入手机号'
      } else if (!/^1[3-9]\d{9}$/.test(formData.phone)) {
        newErrors.phone = '请输入有效的手机号'
      }
      if (!formData.password) {
        newErrors.password = '请输入密码'
      } else if (formData.password.length < 8) {
        newErrors.password = '密码至少需要8个字符'
      }
      if (formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = '两次输入的密码不一致'
      }
      if (currentStep === 2 && !verificationCode) {
        newErrors.verificationCode = '请输入验证码'
      }
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async () => {
    if (!validateForm()) return

    setIsSubmitting(true)

    if (isLogin) {
      const result = await login({
        username: formData.username,
        password: formData.password,
      })

      if (result.success) {
        setSuccessMessage('登录成功！正在跳转...')
        setTimeout(() => {
          navigate('/role-select')
        }, 1000)
      } else {
        setErrors({ password: result.error || '登录失败' })
      }
    } else {
      if (currentStep === 1) {
        setIsVerifying(true)
        const result = await register({
          username: formData.username,
          email: formData.email,
          password: formData.password,
          role,
          phone: formData.phone,
        })
        setIsVerifying(false)

        if (result.success) {
          setSuccessMessage('验证码已发送！')
          setCurrentStep(2)
        } else {
          setErrors({ email: result.error || '注册失败' })
        }
      } else {
        setSuccessMessage('注册成功！正在跳转...')
        setTimeout(() => {
          setIsLogin(true)
          setCurrentStep(1)
          setSuccessMessage('')
        }, 1500)
      }
    }

    setIsSubmitting(false)
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
    setSuccessMessage('')
  }

  const getStrengthLabel = () => {
    const labels = ['弱', '一般', '中等', '强', '非常强']
    return labels[passwordStrength]
  }

  const getStrengthColor = () => {
    const colors = ['bg-red-500', 'bg-orange-500', 'bg-yellow-500', 'bg-green-400', 'bg-green-500']
    return colors[passwordStrength]
  }

  const strengthSegments = Array.from({ length: 4 }, (_, i) => (
    <div
      key={i}
      className={`h-2 rounded-full transition-all duration-300 ${
        i < passwordStrength ? getStrengthColor() : 'bg-gray-200'
      }`}
    />
  ))

  const validateForgotForm = () => {
    const newErrors: Record<string, string> = {}
    
    if (forgotStep === 1) {
      if (!forgotFormData.email && !forgotFormData.phone) {
        newErrors.contact = '请输入邮箱或手机号'
      }
      if (forgotFormData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(forgotFormData.email)) {
        newErrors.email = '请输入有效的邮箱地址'
      }
      if (forgotFormData.phone && !/^1[3-9]\d{9}$/.test(forgotFormData.phone)) {
        newErrors.phone = '请输入有效的手机号'
      }
    } else if (forgotStep === 2) {
      if (!forgotFormData.code) {
        newErrors.code = '请输入验证码'
      }
    } else if (forgotStep === 3) {
      if (!forgotFormData.newPassword) {
        newErrors.newPassword = '请输入新密码'
      } else if (forgotFormData.newPassword.length < 8) {
        newErrors.newPassword = '密码至少需要8个字符'
      }
      if (forgotFormData.newPassword !== forgotFormData.confirmPassword) {
        newErrors.confirmPassword = '两次输入的密码不一致'
      }
    }
    
    setForgotErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleForgotSubmit = async () => {
    if (!validateForgotForm()) return
    
    setIsForgotSubmitting(true)
    
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    if (forgotStep === 1) {
      setIsSendingCode(true)
      await new Promise(resolve => setTimeout(resolve, 1000))
      setIsSendingCode(false)
      setForgotSuccessMessage('验证码已发送！')
      setForgotStep(2)
    } else if (forgotStep === 2) {
      setForgotSuccessMessage('验证成功！')
      setForgotStep(3)
    } else if (forgotStep === 3) {
      setForgotSuccessMessage('密码重置成功！')
      setTimeout(() => {
        setIsForgotPassword(false)
        setForgotStep(1)
        setForgotFormData({ email: '', phone: '', code: '', newPassword: '', confirmPassword: '' })
        setForgotSuccessMessage('')
      }, 1500)
    }
    
    setIsForgotSubmitting(false)
  }

  const handleForgotInputChange = (field: string, value: string) => {
    setForgotFormData(prev => ({ ...prev, [field]: value }))
    if (forgotErrors[field]) {
      setForgotErrors(prev => ({ ...prev, [field]: '' }))
    }
    setForgotSuccessMessage('')
  }

  const getForgotStrengthLabel = () => {
    const labels = ['弱', '一般', '中等', '强', '非常强']
    return labels[forgotPasswordStrength]
  }

  const getForgotStrengthColor = () => {
    const colors = ['bg-red-500', 'bg-orange-500', 'bg-yellow-500', 'bg-green-400', 'bg-green-500']
    return colors[forgotPasswordStrength]
  }

  const forgotStrengthSegments = Array.from({ length: 4 }, (_, i) => (
    <div
      key={i}
      className={`h-2 rounded-full transition-all duration-300 ${
        i < forgotPasswordStrength ? getForgotStrengthColor() : 'bg-gray-200'
      }`}
    />
  ))

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-10 left-10 w-32 h-32 bg-white/10 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-20 w-48 h-48 bg-white/10 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-white/5 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 w-full max-w-md animate-scaleIn">
        {!isLogin && (
          <div className="flex items-center justify-center gap-4 mb-6">
            <div className="flex items-center gap-2">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
                currentStep >= 1 ? 'bg-gradient-to-br from-orange-400 to-amber-500 text-white' : 'bg-white/30 text-white/60'
              }`}>
                {currentStep > 1 ? <CheckCircle className="w-5 h-5" /> : '1'}
              </div>
              <span className={`text-sm ${currentStep >= 1 ? 'text-white text-white-shadow' : 'text-white/60'}`}>
                填写信息
              </span>
            </div>
            <ChevronRight className="text-white/60" />
            <div className="flex items-center gap-2">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
                currentStep >= 2 ? 'bg-gradient-to-br from-orange-400 to-amber-500 text-white' : 'bg-white/30 text-white/60'
              }`}>
                {currentStep > 2 ? <CheckCircle className="w-5 h-5" /> : '2'}
              </div>
              <span className={`text-sm ${currentStep >= 2 ? 'text-white text-white-shadow' : 'text-white/60'}`}>
                验证
              </span>
            </div>
          </div>
        )}

        <div className="glass rounded-3xl p-8 shadow-2xl">
          <div className="text-center mb-8">
            <div className="w-20 h-20 mx-auto mb-4 bg-gradient-to-br from-orange-400 to-amber-500 rounded-2xl flex items-center justify-center shadow-lg">
              <User className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-gray-800 mb-2">
              {isLogin ? '欢迎回来' : '创建账号'}
            </h1>
            <p className="text-gray-500">
              {isLogin ? '请登录您的账号' : '开始您的学习之旅'}
            </p>
          </div>

          <div className="flex gap-3 mb-6">
            <button
              onClick={() => setRole('student')}
              className={`flex-1 py-3 rounded-xl font-medium transition-all duration-300 ${
                role === 'student'
                  ? 'bg-gradient-to-r from-orange-400 to-amber-500 text-white shadow-lg'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              👨‍🎓 学生
            </button>
            <button
              onClick={() => setRole('teacher')}
              className={`flex-1 py-3 rounded-xl font-medium transition-all duration-300 ${
                role === 'teacher'
                  ? 'bg-gradient-to-r from-blue-400 to-indigo-500 text-white shadow-lg'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              👨‍🏫 教师
            </button>
          </div>

          <div className="space-y-5">
            <Input
              label="用户名"
              icon={<User className="w-5 h-5 text-gray-400" />}
              value={formData.username}
              onChange={(e) => handleInputChange('username', e.target.value)}
              placeholder="请输入用户名"
              error={errors.username}
            />

            {!isLogin && (
              <Input
                label="邮箱"
                icon={<Mail className="w-5 h-5 text-gray-400" />}
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                placeholder="请输入邮箱地址"
                error={errors.email}
              />
            )}

            {!isLogin && currentStep === 1 && (
              <Input
                label="手机号"
                icon={<Phone className="w-5 h-5 text-gray-400" />}
                type="tel"
                value={formData.phone}
                onChange={(e) => handleInputChange('phone', e.target.value)}
                placeholder="请输入手机号码"
                error={errors.phone}
              />
            )}

            {!isLogin && currentStep === 2 && (
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">验证码</label>
                <div className="flex gap-3">
                  <Input
                    icon={<Lock className="w-5 h-5 text-gray-400" />}
                    type="text"
                    value={verificationCode}
                    onChange={(e) => {
                      setVerificationCode(e.target.value)
                      if (errors.verificationCode) {
                        setErrors(prev => ({ ...prev, verificationCode: '' }))
                      }
                    }}
                    placeholder="请输入验证码"
                    error={errors.verificationCode}
                    className="flex-1"
                  />
                  <Button
                    onClick={() => {
                      setIsVerifying(true)
                      setTimeout(() => {
                        setIsVerifying(false)
                        setSuccessMessage('验证码已重新发送！')
                      }, 1000)
                    }}
                    disabled={isVerifying}
                    className="px-4"
                  >
                    {isVerifying ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      '发送'
                    )}
                  </Button>
                </div>
              </div>
            )}

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">密码</label>
              <div className="relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2">
                  <Lock className="w-5 h-5 text-gray-400" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={(e) => handleInputChange('password', e.target.value)}
                  placeholder="请输入密码"
                  className={`w-full pl-12 pr-12 py-4 rounded-xl border-2 bg-gray-50 focus:bg-white transition-all ${
                    errors.password ? 'border-red-300 focus:border-red-400' : 'border-gray-200 focus:border-orange-400'
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              {errors.password && (
                <p className="flex items-center gap-1 text-sm text-red-500">
                  <AlertCircle className="w-4 h-4" />
                  {errors.password}
                </p>
              )}
              {!isLogin && formData.password && (
                <div className="space-y-1">
                  <div className="flex justify-between text-xs text-gray-500">
                    <span>密码强度</span>
                    <span className={passwordStrength >= 3 ? 'text-green-500' : passwordStrength >= 2 ? 'text-yellow-500' : 'text-red-500'}>
                      {getStrengthLabel()}
                    </span>
                  </div>
                  <div className="flex gap-1">
                    {strengthSegments}
                  </div>
                </div>
              )}
            </div>

            {!isLogin && currentStep === 1 && (
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">确认密码</label>
                <div className="relative">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2">
                    <Lock className="w-5 h-5 text-gray-400" />
                  </div>
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={formData.confirmPassword}
                    onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                    placeholder="请再次输入密码"
                    className={`w-full pl-12 pr-12 py-4 rounded-xl border-2 bg-gray-50 focus:bg-white transition-all ${
                      errors.confirmPassword ? 'border-red-300 focus:border-red-400' : 'border-gray-200 focus:border-orange-400'
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                {errors.confirmPassword && (
                  <p className="flex items-center gap-1 text-sm text-red-500">
                    <AlertCircle className="w-4 h-4" />
                    {errors.confirmPassword}
                  </p>
                )}
              </div>
            )}

            {isLogin && (
              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isRememberMe}
                    onChange={(e) => setIsRememberMe(e.target.checked)}
                    className="w-4 h-4 rounded border-gray-300 text-orange-500 focus:ring-orange-400"
                  />
                  <span className="text-sm text-gray-600">记住我</span>
                </label>
                <button 
                  onClick={() => setIsForgotPassword(true)}
                  className="text-sm text-orange-500 hover:text-orange-600 font-medium transition-colors"
                >
                  忘记密码？
                </button>
              </div>
            )}
          </div>

          {successMessage && (
            <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-xl flex items-center gap-2 animate-fadeIn">
              <CheckCircle className="w-5 h-5 text-green-500" />
              <span className="text-green-700">{successMessage}</span>
            </div>
          )}

          <Button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="w-full mt-6 py-4 text-lg btn-press"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin mr-2" />
                {isLogin ? '登录中...' : currentStep === 1 ? '发送验证码...' : '注册中...'}
              </>
            ) : isLogin ? (
              '登录'
            ) : currentStep === 1 ? (
              '发送验证码'
            ) : (
              '完成注册'
            )}
          </Button>

          <div className="mt-6 text-center">
            <p className="text-gray-500">
              {isLogin ? '还没有账号？' : '已有账号？'}
              <button
                onClick={() => {
                  setIsLogin(!isLogin)
                  setCurrentStep(1)
                  setVerificationCode('')
                  setErrors({})
                  setSuccessMessage('')
                }}
                className="ml-1 text-orange-500 hover:text-orange-600 font-medium transition-colors"
              >
                {isLogin ? '立即注册' : '立即登录'}
              </button>
            </p>
          </div>
        </div>

        <p className="text-center text-white/60 text-sm mt-6 text-white-shadow">
          登录即表示您同意我们的服务条款和隐私政策
        </p>
      </div>

      {isForgotPassword && (
        <div className="relative z-10 w-full max-w-md animate-scaleIn">
          <div className="flex items-center justify-center gap-3 mb-6">
            {[
              { step: 1, label: '验证身份' },
              { step: 2, label: '验证验证码' },
              { step: 3, label: '设置新密码' },
            ].map((item, index) => (
              <div key={item.step} className="flex items-center">
                <div className="flex items-center gap-2">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
                    forgotStep >= item.step 
                      ? 'bg-gradient-to-br from-blue-400 to-indigo-500 text-white' 
                      : 'bg-white/30 text-white/60'
                  }`}>
                    {forgotStep > item.step ? <CheckCircle className="w-5 h-5" /> : item.step}
                  </div>
                  <span className={`text-sm ${forgotStep >= item.step ? 'text-white text-white-shadow' : 'text-white/60'}`}>
                    {item.label}
                  </span>
                </div>
                {index < 2 && <ChevronRight className="text-white/60 mx-2" />}
              </div>
            ))}
          </div>

          <div className="glass rounded-3xl p-8 shadow-2xl">
            <div className="flex items-center gap-4 mb-8">
              <button 
                onClick={() => {
                  setIsForgotPassword(false)
                  setForgotStep(1)
                  setForgotFormData({ email: '', phone: '', code: '', newPassword: '', confirmPassword: '' })
                  setForgotErrors({})
                  setForgotSuccessMessage('')
                }}
                className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div>
                <h1 className="text-2xl font-bold text-gray-800">找回密码</h1>
                <p className="text-gray-500">请按照步骤完成密码重置</p>
              </div>
            </div>

            <div className="space-y-5">
              {forgotStep === 1 && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">邮箱或手机号</label>
                    <p className="text-xs text-gray-400 mb-3">请输入您注册时使用的邮箱或手机号</p>
                  </div>
                  <Input
                    label="邮箱"
                    icon={<Mail className="w-5 h-5 text-gray-400" />}
                    type="email"
                    value={forgotFormData.email}
                    onChange={(e) => handleForgotInputChange('email', e.target.value)}
                    placeholder="请输入邮箱地址"
                    error={forgotErrors.email}
                  />
                  <Input
                    label="手机号"
                    icon={<Phone className="w-5 h-5 text-gray-400" />}
                    type="tel"
                    value={forgotFormData.phone}
                    onChange={(e) => handleForgotInputChange('phone', e.target.value)}
                    placeholder="请输入手机号码"
                    error={forgotErrors.phone}
                  />
                  {forgotErrors.contact && (
                    <p className="flex items-center gap-1 text-sm text-red-500">
                      <AlertCircle className="w-4 h-4" />
                      {forgotErrors.contact}
                    </p>
                  )}
                </>
              )}

              {forgotStep === 2 && (
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">验证码</label>
                  <div className="flex gap-3">
                    <Input
                      icon={<Lock className="w-5 h-5 text-gray-400" />}
                      type="text"
                      value={forgotFormData.code}
                      onChange={(e) => handleForgotInputChange('code', e.target.value)}
                      placeholder="请输入验证码"
                      error={forgotErrors.code}
                      className="flex-1"
                    />
                    <Button
                      onClick={() => {
                        setIsSendingCode(true)
                        setTimeout(() => {
                          setIsSendingCode(false)
                          setForgotSuccessMessage('验证码已重新发送！')
                        }, 1000)
                      }}
                      disabled={isSendingCode}
                      className="px-4"
                    >
                      {isSendingCode ? (
                        <RefreshCw className="w-4 h-4 animate-spin" />
                      ) : (
                        '发送'
                      )}
                    </Button>
                  </div>
                </div>
              )}

              {forgotStep === 3 && (
                <>
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">新密码</label>
                    <div className="relative">
                      <div className="absolute left-4 top-1/2 -translate-y-1/2">
                        <Lock className="w-5 h-5 text-gray-400" />
                      </div>
                      <input
                        type={showForgotPassword ? 'text' : 'password'}
                        value={forgotFormData.newPassword}
                        onChange={(e) => handleForgotInputChange('newPassword', e.target.value)}
                        placeholder="请输入新密码"
                        className={`w-full pl-12 pr-12 py-4 rounded-xl border-2 bg-gray-50 focus:bg-white transition-all ${
                          forgotErrors.newPassword ? 'border-red-300 focus:border-red-400' : 'border-gray-200 focus:border-blue-400'
                        }`}
                      />
                      <button
                        type="button"
                        onClick={() => setShowForgotPassword(!showForgotPassword)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      >
                        {showForgotPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                    {forgotErrors.newPassword && (
                      <p className="flex items-center gap-1 text-sm text-red-500">
                        <AlertCircle className="w-4 h-4" />
                        {forgotErrors.newPassword}
                      </p>
                    )}
                    {forgotFormData.newPassword && (
                      <div className="space-y-1">
                        <div className="flex justify-between text-xs text-gray-500">
                          <span>密码强度</span>
                          <span className={forgotPasswordStrength >= 3 ? 'text-green-500' : forgotPasswordStrength >= 2 ? 'text-yellow-500' : 'text-red-500'}>
                            {getForgotStrengthLabel()}
                          </span>
                        </div>
                        <div className="flex gap-1">
                          {forgotStrengthSegments}
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">确认新密码</label>
                    <div className="relative">
                      <div className="absolute left-4 top-1/2 -translate-y-1/2">
                        <Lock className="w-5 h-5 text-gray-400" />
                      </div>
                      <input
                        type={showForgotConfirmPassword ? 'text' : 'password'}
                        value={forgotFormData.confirmPassword}
                        onChange={(e) => handleForgotInputChange('confirmPassword', e.target.value)}
                        placeholder="请再次输入新密码"
                        className={`w-full pl-12 pr-12 py-4 rounded-xl border-2 bg-gray-50 focus:bg-white transition-all ${
                          forgotErrors.confirmPassword ? 'border-red-300 focus:border-red-400' : 'border-gray-200 focus:border-blue-400'
                        }`}
                      />
                      <button
                        type="button"
                        onClick={() => setShowForgotConfirmPassword(!showForgotConfirmPassword)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      >
                        {showForgotConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                    {forgotErrors.confirmPassword && (
                      <p className="flex items-center gap-1 text-sm text-red-500">
                        <AlertCircle className="w-4 h-4" />
                        {forgotErrors.confirmPassword}
                      </p>
                    )}
                  </div>
                </>
              )}
            </div>

            {forgotSuccessMessage && (
              <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-xl flex items-center gap-2 animate-fadeIn">
                <CheckCircle className="w-5 h-5 text-green-500" />
                <span className="text-green-700">{forgotSuccessMessage}</span>
              </div>
            )}

            <Button
              onClick={handleForgotSubmit}
              disabled={isForgotSubmitting}
              className="w-full mt-6 py-4 text-lg btn-press"
            >
              {isForgotSubmitting ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin mr-2" />
                  处理中...
                </>
              ) : forgotStep === 1 ? (
                '发送验证码'
              ) : forgotStep === 2 ? (
                '验证'
              ) : (
                '重置密码'
              )}
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}

export default Login
