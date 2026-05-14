const localtunnel = require('localtunnel');

async function startTunnel() {
  try {
    const tunnel = await localtunnel({ port: 3000 });

    console.log('========================================');
    console.log('🎉 内网穿透成功！您的公网访问地址：');
    console.log('========================================');
    console.log('');
    console.log('🔗 ' + tunnel.url);
    console.log('');
    console.log('========================================');
    console.log('将此链接分享给您的朋友即可访问！');
    console.log('========================================');
    console.log('');
    console.log('提示：首次访问时需要在页面输入您的 IP 地址进行验证');
    console.log('');

    tunnel.on('close', () => {
      console.log('隧道已关闭');
    });
  } catch (err) {
    console.error('启动隧道失败:', err.message);
  }
}

startTunnel();
