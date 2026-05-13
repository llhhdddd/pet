import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ConfigProvider } from 'antd';
import zhCN from 'antd/locale/zh_CN';

function App() {
  return (
    <ConfigProvider locale={zhCN}>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<div>小组学习陪伴宠物系统</div>} />
        </Routes>
      </BrowserRouter>
    </ConfigProvider>
  );
}

export default App;