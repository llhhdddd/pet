function Loading() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500">
      <div className="relative">
        <div className="w-20 h-20 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full animate-pulse shadow-lg"></div>
        <div className="absolute -top-2 -right-2 w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-lg">
          <span className="text-2xl">🐱</span>
        </div>
      </div>
      <p className="mt-6 text-white/80 font-medium">正在加载中...</p>
      <div className="mt-4 flex gap-2">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="w-3 h-3 bg-white/40 rounded-full animate-bounce"
            style={{ animationDelay: `${i * 0.2}s` }}
          ></div>
        ))}
      </div>
    </div>
  )
}

export default Loading
