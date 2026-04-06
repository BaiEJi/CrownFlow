/**
 * Settings 设置页面
 *
 * 提供分类管理功能，包括图表分类和会员分类管理.
 *
 * @module pages/Settings
 */

import React, { useState, useCallback, useMemo } from 'react';
import {
  Card,
  Tabs,
  Table,
  Button,
  Modal,
  Form,
  Input,
  Space,
  Popconfirm,
  message,
  Alert,
  Empty,
  List,
  Badge,
  ColorPicker,
} from 'antd';
import type { Color } from 'antd/es/color-picker';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  AppstoreOutlined,
  UserOutlined,
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import type { Category, CategoryCreate, CategoryUpdate, Member } from '@/types';
import { useCategories, useMembers } from '@/hooks';
import { adjustForDarkModeWithContrast } from '@/constants/colors';

const CategoryManageTab: React.FC<{ active: boolean }> = ({ active }) => {
  const {
    categories,
    loading,
    error,
    fetchCategories,
    createCategory,
    updateCategory,
    deleteCategory,
  } = useCategories(false);

  const [isDark, setIsDark] = useState(() => localStorage.getItem('theme-mode') === 'dark');

  React.useEffect(() => {
    const handler = () => setIsDark(localStorage.getItem('theme-mode') === 'dark');
    window.addEventListener('theme-change', handler);
    return () => window.removeEventListener('theme-change', handler);
  }, []);

  React.useEffect(() => {
    if (active) {
      fetchCategories();
    }
  }, [active]);

  const [modalOpen, setModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [form] = Form.useForm();
  const [searchName, setSearchName] = useState('');

  const filteredCategories = useMemo(() => {
    if (!searchName.trim()) return categories;
    return categories.filter(cat => 
      cat.name.toLowerCase().includes(searchName.toLowerCase().trim())
    );
  }, [categories, searchName]);

  const handleCreate = useCallback(() => {
    setEditingCategory(null);
    form.resetFields();
    setModalOpen(true);
  }, [form]);

  const handleEdit = useCallback((category: Category) => {
    setEditingCategory(category);
    form.setFieldsValue({
      ...category,
      color: category.color || '#1890ff',
    });
    setModalOpen(true);
  }, [form]);

  const handleDelete = useCallback(async (id: number) => {
    try {
      await deleteCategory(id);
      message.success('删除成功');
    } catch (err) {
      const error = err as { response?: { data?: { message?: string } } };
      message.error(error.response?.data?.message || '删除失败');
    }
  }, [deleteCategory]);

  const handleSubmit = useCallback(async () => {
    try {
      setSubmitting(true);
      const values = await form.validateFields();

      if (editingCategory) {
        await updateCategory(editingCategory.id, values as CategoryUpdate);
        message.success('更新成功');
      } else {
        await createCategory(values as CategoryCreate);
        message.success('创建成功');
      }

      setModalOpen(false);
    } catch (err) {
      const error = err as { response?: { data?: { message?: string } } };
      message.error(error.response?.data?.message || (editingCategory ? '更新失败' : '创建失败'));
    } finally {
      setSubmitting(false);
    }
  }, [editingCategory, form, createCategory, updateCategory]);

  const columns = [
    {
      title: <span style={{ fontWeight: 600, fontSize: 14 }}>图标</span>,
      dataIndex: 'icon',
      key: 'icon',
      width: 60,
      render: (icon: string) => (
        <div style={{ textAlign: 'center', fontSize: 20 }}>
          {icon || '📦'}
        </div>
      ),
    },
    {
      title: <span style={{ fontWeight: 600, fontSize: 14 }}>名称</span>,
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: <span style={{ fontWeight: 600, fontSize: 14 }}>颜色</span>,
      dataIndex: 'color',
      key: 'color',
      render: (color: string) =>
        color ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div
              style={{
                width: 24,
                height: 24,
                borderRadius: '50%',
                backgroundColor: isDark ? adjustForDarkModeWithContrast(color) : color,
                boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                border: '1px solid rgba(255,255,255,0.2)',
              }}
            />
            <span style={{ fontFamily: 'monospace', fontSize: 13, color: 'var(--ant-color-text-secondary)' }}>
              {color}
            </span>
          </div>
        ) : (
          <span style={{ color: 'var(--ant-color-text-tertiary)' }}>-</span>
        ),
    },
    {
      title: <span style={{ fontWeight: 600, fontSize: 14 }}>创建时间</span>,
      dataIndex: 'created_at',
      key: 'created_at',
      render: (date: string) => new Date(date).toLocaleString('zh-CN'),
    },
    {
      title: <span style={{ fontWeight: 600, fontSize: 14 }}>操作</span>,
      key: 'action',
      width: 150,
      render: (_: unknown, record: Category) => (
        <Space size="small">
          <Button
            type="link"
            size="small"
            icon={<EditOutlined style={{ fontSize: 14 }} />}
            onClick={() => handleEdit(record)}
          >
            编辑
          </Button>
          <Popconfirm
            title="确定删除该分类吗？"
            description="删除后无法恢复，如果该分类下有会员则无法删除"
            onConfirm={() => handleDelete(record.id)}
            okText="确定"
            cancelText="取消"
          >
            <Button
              type="link"
              size="small"
              danger
              icon={<DeleteOutlined style={{ fontSize: 14 }} />}
            >
              删除
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <>
      <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <span style={{ color: 'var(--ant-color-text-secondary)' }}>管理会员订阅的分类，如视频、音乐、工具等</span>
          <Input.Search
            placeholder="搜索分类名称"
            allowClear
            style={{ width: 200 }}
            value={searchName}
            onChange={(e) => setSearchName(e.target.value)}
          />
        </div>
        <Button type="primary" icon={<PlusOutlined />} onClick={handleCreate}>
          添加分类
        </Button>
      </div>

      {error && (
        <Alert
          message="获取分类列表失败"
          type="error"
          closable
          onClose={() => fetchCategories()}
          showIcon
          style={{ marginBottom: 16 }}
        />
      )}

      <Table
        columns={columns}
        dataSource={filteredCategories}
        rowKey="id"
        loading={loading}
        pagination={false}
        size="middle"
        onRow={() => ({
          onMouseEnter: (e) => {
            e.currentTarget.style.backgroundColor = isDark ? '#1a1a1a' : '#f5f5f5';
            e.currentTarget.style.transition = 'background-color 0.2s ease-in-out';
          },
          onMouseLeave: (e) => {
            e.currentTarget.style.backgroundColor = '';
          },
        })}
        style={{
          border: 'none',
        }}
        locale={{
          emptyText: (
            <Empty
              description={searchName ? '未找到匹配的分类' : '暂无分类数据'}
              image={Empty.PRESENTED_IMAGE_SIMPLE}
            />
          ),
        }}
      />

      <Modal
        title={editingCategory ? '编辑分类' : '添加分类'}
        open={modalOpen}
        onOk={handleSubmit}
        onCancel={() => setModalOpen(false)}
        confirmLoading={submitting}
        destroyOnClose
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="name"
            label="分类名称"
            rules={[
              { required: true, message: '请输入分类名称' },
              { max: 50, message: '名称最多50个字符' },
              { whitespace: true, message: '名称不能为空格' },
            ]}
          >
            <Input placeholder="分类名称" maxLength={50} />
          </Form.Item>

          <Form.Item
            name="icon"
            label={<span>图标 <a href="https://www.emojiall.com/zh-hans" target="_blank" rel="noopener noreferrer" style={{ fontSize: 12, fontWeight: 'normal' }}>Emoji 图标</a></span>}
            rules={[{ max: 10, message: '图标最多10个字符' }]}
          >
            <Input placeholder="如: 🎬, 🎵, 💻" maxLength={10} />
          </Form.Item>

          <Form.Item
            name="color"
            label="颜色"
            getValueFromEvent={(color: Color) => color.toHexString()}
            getValueProps={(value: string) => ({
              value: value || '#1890ff',
            })}
          >
            <ColorPicker
              format="hex"
              showText
              disabledAlpha
              presets={[
                {
                  label: '推荐',
                  colors: [
                    '#f5222d', '#fa541c', '#fa8c16', '#faad14', '#fadb14',
                    '#a0d911', '#52c41a', '#13c2c2', '#1890ff', '#2f54eb',
                    '#722ed1', '#eb2f96', '#faeee7', '#b7eb8f', '#ffd6e7', '#d3f261',
                  ],
                },
              ]}
            />
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
};

const MemberCategoryTab: React.FC<{ active: boolean }> = ({ active }) => {
  const navigate = useNavigate();
  const { categories, loading: categoriesLoading, fetchCategories } = useCategories(false);
  const { members, loading: membersLoading, fetchMembers } = useMembers({ immediate: false });
  const [isDark, setIsDark] = useState(() => localStorage.getItem('theme-mode') === 'dark');

  React.useEffect(() => {
    const handler = () => setIsDark(localStorage.getItem('theme-mode') === 'dark');
    window.addEventListener('theme-change', handler);
    return () => window.removeEventListener('theme-change', handler);
  }, []);

  const loading = categoriesLoading || membersLoading;

  React.useEffect(() => {
    if (active) {
      fetchCategories();
      fetchMembers();
    }
  }, [active]);

  const categoryMemberCount = useMemo(() => {
    const countMap = new Map<number, number>();
    const uncategorized = { count: 0 };

    members?.forEach((member: Member) => {
      if (member.category_id) {
        countMap.set(member.category_id, (countMap.get(member.category_id) || 0) + 1);
      } else {
        uncategorized.count++;
      }
    });

    return { countMap, uncategorized: uncategorized.count };
  }, [members]);

  return (
    <>
      <div style={{ marginBottom: 16, color: 'var(--ant-color-text-secondary)' }}>
        查看各分类下的会员分布情况
      </div>

      <List
        loading={loading}
        grid={{
          gutter: 16,
          xs: 1,
          sm: 2,
          md: 3,
          lg: 3,
          xl: 4,
          xxl: 4,
        }}
        dataSource={[
          ...categories.map((cat) => ({
            id: cat.id,
            name: cat.name,
            icon: cat.icon,
            color: cat.color,
            count: categoryMemberCount.countMap.get(cat.id) || 0,
          })),
          {
            id: -1,
            name: '未分类',
            icon: '📦',
            color: isDark ? adjustForDarkModeWithContrast('#999') : '#999',
            count: categoryMemberCount.uncategorized,
          },
        ]}
        renderItem={(item) => (
          <List.Item>
            <Card
              hoverable
              style={{ textAlign: 'center', cursor: 'pointer' }}
              onClick={() => navigate(`/members?category_id=${item.id}`)}
            >
              <div style={{ fontSize: 36, marginBottom: 8 }}>
                {item.icon || '📦'}
              </div>
              <div style={{ fontSize: 16, fontWeight: 500, marginBottom: 8 }}>
                {item.name}
              </div>
              <Badge
                count={item.count}
                showZero
                color={isDark && item.color ? adjustForDarkModeWithContrast(item.color) : (item.color || '#1890ff')}
                style={{
                  backgroundColor: isDark && item.color ? adjustForDarkModeWithContrast(item.color) : (item.color || '#1890ff')
                }}
              />
              <div style={{ marginTop: 8, color: 'var(--ant-color-text-tertiary)', fontSize: 12 }}>
                个会员
              </div>
            </Card>
          </List.Item>
        )}
      />
    </>
  );
};

const Settings: React.FC = () => {
  const [activeKey, setActiveKey] = useState('chart-category');

  const handleTabChange = useCallback((key: string) => {
    setActiveKey(key);
  }, []);

  return (
    <Card>
      <Tabs
        activeKey={activeKey}
        onChange={handleTabChange}
        items={[
          {
            key: 'chart-category',
            label: (
              <span>
                <AppstoreOutlined />
                图表分类
              </span>
            ),
            children: <CategoryManageTab active={activeKey === 'chart-category'} />,
            forceRender: true,
          },
          {
            key: 'member-category',
            label: (
              <span>
                <UserOutlined />
                会员分类管理
              </span>
            ),
            children: <MemberCategoryTab active={activeKey === 'member-category'} />,
            forceRender: true,
          },
        ]}
        tabBarStyle={{ marginBottom: 24 }}
      />
    </Card>
  );
};

export default Settings;
