const localtunnel = require('localtunnel');

async function start() {
  console.log('🚀 正在启动内网穿透...');
  try {
    const tunnel = await localtunnel({ 
      port: 3000,
      local_host: '127.0.0.1'
    });

    console.log('');
    console.log('🎉 内网穿透成功！');
    console.log('========================================');
    console.log('');
    console.log('🔗 公网访问地址:', tunnel.url);
    console.log('');
    console.log('========================================');
    console.log('将此链接分享给您的朋友即可访问！');
    console.log('');
    console.log('💡 提示：首次访问时需要验证IP地址');

    tunnel.on('error', (err) => {
      console.error('❌ 隧道错误:', err.message);
    });

    tunnel.on('close', () => {
      console.log('隧道已关闭');
    });

  } catch (err) {
    console.error('❌ 启动失败:', err.message);
    process.exit(1);
  }
}

start();