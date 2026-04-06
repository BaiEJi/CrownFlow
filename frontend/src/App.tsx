/**
 * 应用入口组件
 *
 * 配置路由和权限控制。
 * 路由结构：
 * - /login: 登录页
 * - /dashboard: 概览页
 * - /members: 会员列表
 * - /members/:id: 会员详情
 * - /statistics: 统计分析
 * - /settings: 系统设置
 */

import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Spin } from 'antd';
import ErrorBoundary from './components/ErrorBoundary';
import MainLayout from './components/Layout';

const Login = lazy(() => import('./pages/Login'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const Members = lazy(() => import('./pages/Members'));
const MemberDetail = lazy(() => import('./pages/MemberDetail'));
const Statistics = lazy(() => import('./pages/Statistics'));
const Settings = lazy(() => import('./pages/Settings'));
const Journal = lazy(() => import('./pages/Journal'));

const LoadingFallback = () => (
  <div style={{
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: '100vh'
  }}>
    <Spin size="large" tip="加载中..." />
  </div>
);

/**
 * 私有路由组件
 * 检查用户是否已登录，未登录则跳转到登录页
 */
function PrivateRoute({ children }: { children: React.ReactNode }) {
  const auth = localStorage.getItem('auth');
  return auth ? <>{children}</> : <Navigate to="/login" replace />;
}

/**
 * 应用主组件
 */
function App() {
  return (
    <ErrorBoundary>
      <BrowserRouter>
        <Routes>
          {/* 登录页 */}
          <Route
            path="/login"
            element={
              <Suspense fallback={<LoadingFallback />}>
                <Login />
              </Suspense>
            }
          />
          
          {/* 需要认证的页面 */}
          <Route
            path="/*"
            element={
              <PrivateRoute>
                <MainLayout>
                  <Suspense fallback={<LoadingFallback />}>
<Routes>
                       <Route path="/" element={<Navigate to="/dashboard" replace />} />
                       <Route path="/dashboard" element={<Dashboard />} />
                       <Route path="/members" element={<Members />} />
                       <Route path="/members/:id" element={<MemberDetail />} />
                       <Route path="/statistics" element={<Statistics />} />
                       <Route path="/settings" element={<Settings />} />
                       <Route path="/journal" element={<Journal />} />
                     </Routes>
                  </Suspense>
                </MainLayout>
              </PrivateRoute>
            }
          />
        </Routes>
      </BrowserRouter>
    </ErrorBoundary>
  );
}

export default App;