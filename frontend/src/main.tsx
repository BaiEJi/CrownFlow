import React from 'react';
import ReactDOM from 'react-dom/client';
import { ConfigProvider, theme } from 'antd';
import zhCN from 'antd/locale/zh_CN';
import App from './App';
import './index.css';

const RootApp = () => {
  const [isDark, setIsDark] = React.useState(
    () => localStorage.getItem('theme-mode') === 'dark'
  );

  React.useEffect(() => {
    if (isDark) {
      document.body.classList.add('dark');
    } else {
      document.body.classList.remove('dark');
    }
  }, [isDark]);

  React.useEffect(() => {
    const handler = () => {
      setIsDark(localStorage.getItem('theme-mode') === 'dark');
    };
    window.addEventListener('theme-change', handler);
    return () => window.removeEventListener('theme-change', handler);
  }, []);

  return (
    <ConfigProvider
      locale={zhCN}
      theme={{ algorithm: isDark ? theme.darkAlgorithm : theme.defaultAlgorithm }}
    >
      <App />
    </ConfigProvider>
  );
};

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <RootApp />
  </React.StrictMode>
);
