import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Layout as AntLayout, Menu, Button, Tooltip, Input, Modal, Empty, Spin, Space, Tag } from 'antd';
import {
  DashboardOutlined,
  UserOutlined,
  BarChartOutlined,
  SettingOutlined,
  LogoutOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  SearchOutlined,
  MoonOutlined,
  SunOutlined,
} from '@ant-design/icons';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '@/stores';
import { useLocalStorage, useDebounce } from '@/hooks';
import { memberApi } from '@/services/api';
import { adjustForDarkModeWithContrast } from '@/constants/colors';
import type { Member } from '@/types';

const { Sider, Content } = AntLayout;

const GlobalSearchModal: React.FC<{ open: boolean; onClose: () => void }> = ({ open, onClose }) => {
  const navigate = useNavigate();
  const [searchText, setSearchText] = useState('');
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchResults, setSearchResults] = useState<Member[]>([]);
  const [highlightIndex, setHighlightIndex] = useState(-1);
  const inputRef = useRef<any>(null);
  const [isDark, setIsDark] = useState(() => localStorage.getItem('theme-mode') === 'dark');

  useEffect(() => {
    const handler = () => setIsDark(localStorage.getItem('theme-mode') === 'dark');
    window.addEventListener('theme-change', handler);
    return () => window.removeEventListener('theme-change', handler);
  }, []);

  useEffect(() => {
    if (open) {
      setSearchText('');
      setSearchResults([]);
      setHighlightIndex(-1);
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [open]);

  const doSearch = useCallback(async (keyword: string) => {
    if (!keyword.trim()) {
      setSearchResults([]);
      return;
    }
    setSearchLoading(true);
    try {
      const response = await memberApi.getAll({
        keyword: keyword.trim(),
        page_size: 20,
      });
      setSearchResults(response.data.data.items);
    } catch {
      setSearchResults([]);
    } finally {
      setSearchLoading(false);
    }
  }, []);

  const debouncedSearch = useDebounce(doSearch, 300);

  useEffect(() => {
    debouncedSearch(searchText);
  }, [searchText, debouncedSearch]);

  const navigateToMember = useCallback((id: number) => {
    navigate(`/members/${id}`);
    onClose();
  }, [navigate, onClose]);

  return (
    <Modal
      title="全局搜索"
      open={open}
      onCancel={onClose}
      footer={null}
      style={{ top: 20 }}
      width={520}
    >
      <Input
        ref={inputRef}
        placeholder="搜索会员名称... (Esc 关闭)"
        prefix={<SearchOutlined />}
        size="large"
        value={searchText}
        onChange={(e) => setSearchText(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' && highlightIndex >= 0 && highlightIndex < searchResults.length) {
            navigateToMember(searchResults[highlightIndex].id);
          } else if (e.key === 'ArrowDown') {
            e.preventDefault();
            setHighlightIndex(prev => Math.min(prev + 1, searchResults.length - 1));
          } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            setHighlightIndex(prev => Math.max(prev - 1, 0));
          } else if (e.key === 'Escape') {
            e.preventDefault();
            onClose();
          }
        }}
      />
      <div style={{ maxHeight: 400, overflowY: 'auto', marginTop: 8 }}>
        {searchLoading ? (
          <div style={{ textAlign: 'center', padding: 40 }}><Spin /></div>
        ) : searchText.trim() && searchResults.length === 0 ? (
          <Empty description="未找到匹配的会员" image={Empty.PRESENTED_IMAGE_SIMPLE} />
        ) : (
          searchResults.map((member, idx) => (
            <div
              key={member.id}
              onClick={() => navigateToMember(member.id)}
              onMouseEnter={() => setHighlightIndex(idx)}
              style={{
                padding: '8px 12px',
                cursor: 'pointer',
                background: idx === highlightIndex ? 'var(--ant-color-primary-bg, #e6f4ff)' : 'transparent',
                borderRadius: 6,
                marginBottom: 2,
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <Space>
                <span>{member.category?.icon || '📦'}</span>
                <span style={{ fontWeight: 500 }}>{member.name}</span>
                {member.category && <Tag color={isDark && member.category.color ? adjustForDarkModeWithContrast(member.category.color) : member.category.color}>{member.category.name}</Tag>}
              </Space>
              <Space size="small">
                <Tag color={member.status === 'active' ? 'green' : 'default'}>
                  {member.status === 'active' ? '有效' : '已过期'}
                </Tag>
                <span style={{ color: 'var(--ant-color-text-secondary, #999)', fontSize: 12 }}>↵</span>
              </Space>
            </div>
          ))
        )}
      </div>
    </Modal>
  );
};

interface MainLayoutProps {
  children: React.ReactNode;
}

const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const logout = useAuthStore((state) => state.logout);
  const [collapsed, setCollapsed] = useLocalStorage('sidebar-collapsed', false);
  const [globalSearchOpen, setGlobalSearchOpen] = useState(false);
  const [isDark, setIsDark] = useState(() => localStorage.getItem('theme-mode') === 'dark');

  const toggleTheme = () => {
    const newMode = isDark ? 'light' : 'dark';
    localStorage.setItem('theme-mode', newMode);
    setIsDark(newMode === 'dark');
    window.dispatchEvent(new CustomEvent('theme-change'));
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setGlobalSearchOpen(true);
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  const menuItems = [
    { key: '/dashboard', icon: <DashboardOutlined />, label: '概览' },
    { key: '/members', icon: <UserOutlined />, label: '会员管理' },
    { key: '/statistics', icon: <BarChartOutlined />, label: '统计图表' },
    { key: '/settings', icon: <SettingOutlined />, label: '设置' },
  ];

  const handleMenuClick = ({ key }: { key: string }) => {
    navigate(key);
  };

  const toggleCollapsed = () => {
    setCollapsed(!collapsed);
  };

  const handleLogout = () => {
    Modal.confirm({
      title: '退出登录',
      content: '是否确认退出登录?',
      okText: '确认',
      cancelText: '取消',
      onOk: () => {
        logout();
      },
    });
  };

  return (
    <>
    <AntLayout style={{ minHeight: '100vh' }}>
        <Sider
          width={170}
          collapsedWidth={60}
          collapsed={collapsed}
          theme={isDark ? 'dark' : 'light'}
          style={{
            overflow: 'auto',
            height: '100vh',
            position: 'fixed',
            left: 0,
            top: 0,
            bottom: 0,
            zIndex: 100,
          }}
        >
        <div
          style={{
            height: 64,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            borderBottom: isDark ? '1px solid #303030' : '1px solid var(--ant-color-border, #f0f0f0)',
          }}
        >
          <h1 style={{ fontSize: 18, fontWeight: 'bold', color: isDark ? adjustForDarkModeWithContrast('#1890ff') : '#1890ff' }}>
            {collapsed ? 'CF' : 'CrownFlow'}
          </h1>
        </div>
        <Menu
          mode="inline"
          selectedKeys={[location.pathname]}
          items={menuItems}
          onClick={handleMenuClick}
          style={{ borderRight: 0 }}
        />
        <div
          style={{
            position: 'absolute',
            bottom: 0,
            width: '100%',
            padding: '16px',
            display: 'flex',
            flexDirection: 'column',
            gap: 8,
          }}
        >
          <Tooltip title={isDark ? '浅色模式' : '深色模式'} placement="right">
            <Button
              type="text"
              icon={isDark ? <SunOutlined /> : <MoonOutlined />}
              onClick={toggleTheme}
              block
              style={{ textAlign: collapsed ? 'center' : 'left' }}
            >
              {collapsed ? null : (isDark ? '浅色模式' : '深色模式')}
            </Button>
          </Tooltip>
          <Tooltip title="全局搜索 (Ctrl+K)" placement="right">
            <Button
              type="text"
              icon={<SearchOutlined />}
              onClick={() => setGlobalSearchOpen(true)}
              block
              style={{ textAlign: collapsed ? 'center' : 'left' }}
            >
              {collapsed ? null : '搜索'}
            </Button>
          </Tooltip>
          <Tooltip title={collapsed ? '展开菜单' : '收起菜单'} placement="right">
            <Button
              type="text"
              icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
              onClick={toggleCollapsed}
              block
              style={{ textAlign: collapsed ? 'center' : 'left' }}
            >
              {collapsed ? null : '收起菜单'}
            </Button>
          </Tooltip>
          <Tooltip title={collapsed ? '退出登录' : ''} placement="right">
            <Button
              type="text"
              icon={<LogoutOutlined />}
              onClick={handleLogout}
              block
              style={{ textAlign: collapsed ? 'center' : 'left' }}
            >
              {collapsed ? null : '退出登录'}
            </Button>
          </Tooltip>
        </div>
      </Sider>
      <AntLayout style={{ marginLeft: collapsed ? 60 : 170, transition: 'margin-left 0.2s' }}>
        <Content
          style={{
            padding: 24,
            margin: 0,
            minHeight: 280,
            background: 'var(--ant-color-bg-layout, #f5f5f5)',
          }}
        >
          {children}
        </Content>
      </AntLayout>
      <GlobalSearchModal
        open={globalSearchOpen}
        onClose={() => setGlobalSearchOpen(false)}
      />
    </AntLayout>
    <nav
      className="mobile-nav"
      style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        height: 56,
        background: '#fff',
        borderTop: '1px solid #f0f0f0',
        display: 'none',
        alignItems: 'center',
        justifyContent: 'space-around',
        zIndex: 1000,
      }}
    >
      {menuItems.map(item => (
        <div
          key={item.key}
          onClick={() => navigate(item.key)}
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            fontSize: 10,
            color: location.pathname === item.key ? (isDark ? adjustForDarkModeWithContrast('#1890ff') : '#1890ff') : 'var(--ant-color-text-tertiary)',
            cursor: 'pointer',
          }}
        >
          {item.icon}
          <span style={{ marginTop: 2 }}>{item.label}</span>
        </div>
      ))}
    </nav>
    </>
  );
};

export default MainLayout;
