import { useState, useEffect } from 'react';
import { Form, Input, Button, Card, message } from 'antd';
import { UserOutlined, LockOutlined } from '@ant-design/icons';
import { useAuthStore } from '@/stores';
import api from '@/services/api';

interface LoginForm {
  username: string;
  password: string;
}

export default function Login() {
  const [loading, setLoading] = useState(false);
  const [isDark, setIsDark] = useState(() => localStorage.getItem('theme-mode') === 'dark');
  const login = useAuthStore((state) => state.login);

  useEffect(() => {
    const handler = () => setIsDark(localStorage.getItem('theme-mode') === 'dark');
    window.addEventListener('theme-change', handler);
    return () => window.removeEventListener('theme-change', handler);
  }, []);

  const onFinish = async (values: LoginForm) => {
    setLoading(true);
    try {
      const auth = btoa(`${values.username}:${values.password}`);
      localStorage.setItem('auth', auth);
      
      await api.get('/categories');
      
      login(values.username, values.password);
      message.success('登录成功');
      window.location.href = '/';
    } catch (error) {
      localStorage.removeItem('auth');
      message.error('用户名或密码错误');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
        background: isDark ? '#141414' : '#f0f2f5',
      }}
    >
      <Card title="CrownFlow 登录" style={{ width: 400 }}>
        <Form
          name="login"
          onFinish={onFinish}
          autoComplete="off"
          size="large"
        >
          <Form.Item
            name="username"
            rules={[{ required: true, message: '请输入用户名' }]}
          >
            <Input prefix={<UserOutlined />} placeholder="用户名" />
          </Form.Item>

          <Form.Item
            name="password"
            rules={[{ required: true, message: '请输入密码' }]}
          >
            <Input.Password prefix={<LockOutlined />} placeholder="密码" />
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit" loading={loading} block>
              登录
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
}
