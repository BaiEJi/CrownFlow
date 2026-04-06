/**
 * Members 会员管理页面
 *
 * 提供会员的增删改查功能。
 * 支持分页、筛选、搜索和排序。
 * 点击会员行跳转详情页查看订阅记录。
 *
 * @module pages/Members
 */

import React, { useEffect, useState, useCallback, useMemo } from 'react';
import {
  Card,
  Table,
  Button,
  Modal,
  Form,
  Input,
  Select,
  Space,
  Tag,
  Popconfirm,
  message,
  Empty,
  Alert,
  Row,
  Col,
  InputNumber,
  Radio,
} from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  SearchOutlined,
  ReloadOutlined,
  EyeOutlined,
  UnorderedListOutlined,
  AppstoreOutlined,
} from '@ant-design/icons';
import { useNavigate, useSearchParams } from 'react-router-dom';
import type { Member, MemberCreate, MemberUpdate, MemberQueryParams } from '@/types';
import { memberApi } from '@/services/api';
import { formatPrice, getDaysRemaining } from '@/utils';
import { adjustForDarkModeWithContrast } from '@/constants/colors';
import { useCategories, useLocalStorage, useDebouncedValue } from '@/hooks';
import MemberCard from '@/components/MemberCard';

/**
 * 状态选项
 */
const STATUS_OPTIONS = [
  { value: 'active', label: '有效' },
  { value: 'expired', label: '已过期' },
];

/**
 * 默认表单值
 */
const DEFAULT_FORM_VALUES = {
  reminder_days: 7,
};

/**
 * 会员管理页面组件
 */
const Members: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const initialCategoryId = searchParams.get('category_id');
  
  const [viewMode, setViewMode] = useLocalStorage<'table' | 'card'>('members-view-mode', 'table');
  const [isDark, setIsDark] = useState(() => localStorage.getItem('theme-mode') === 'dark');

  useEffect(() => {
    const handler = () => setIsDark(localStorage.getItem('theme-mode') === 'dark');
    window.addEventListener('theme-change', handler);
    return () => window.removeEventListener('theme-change', handler);
  }, []);
  
  const [members, setMembers] = useState<Member[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [searchText, setSearchText] = useState('');

  const [modalOpen, setModalOpen] = useState(false);
  const [editingMember, setEditingMember] = useState<Member | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [form] = Form.useForm();

  const [pagination, setPagination] = useState({ page: 1, pageSize: 10 });
  const [filters, setFilters] = useState<{
    category_id?: number;
    status?: 'active' | 'expired';
  }>(() => {
    const cid = initialCategoryId ? Number(initialCategoryId) : undefined;
    return { status: 'active', ...(cid ? { category_id: cid } : {}) };
  });
  const { categories, loading: categoriesLoading } = useCategories(true);
  const debouncedSearch = useDebouncedValue(searchText, 300);

  const fetchMembers = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const params: MemberQueryParams = {
        page: pagination.page,
        page_size: pagination.pageSize,
        ...filters,
      };
      if (debouncedSearch) {
        params.keyword = debouncedSearch;
      }
      const response = await memberApi.getAll(params);
      setMembers(response.data.data.items);
      setTotal(response.data.data.total);
    } catch (err) {
      setError('获取会员列表失败，请重试');
      console.error('Failed to fetch members:', err);
    } finally {
      setLoading(false);
    }
  }, [pagination, filters, debouncedSearch]);

  useEffect(() => {
    fetchMembers();
  }, [fetchMembers]);

  /**
   * 打开创建弹窗
   */
  const handleCreate = useCallback(() => {
    setEditingMember(null);
    form.resetFields();
    form.setFieldsValue(DEFAULT_FORM_VALUES);
    setModalOpen(true);
  }, [form]);

  /**
   * 打开编辑弹窗
   */
  const handleEdit = useCallback((member: Member, e?: React.MouseEvent) => {
    if (e) {
      e.stopPropagation();
    }
    setEditingMember(member);
    form.setFieldsValue({
      name: member.name,
      category_id: member.category_id,
      notes: member.notes,
      reminder_days: member.reminder_days,
    });
    setModalOpen(true);
  }, [form]);

  const handleCardEdit = useCallback((member: Member) => {
    setEditingMember(member);
    form.setFieldsValue({
      name: member.name,
      category_id: member.category_id,
      notes: member.notes,
      reminder_days: member.reminder_days,
    });
    setModalOpen(true);
  }, [form]);

  const handleCardDelete = useCallback((id: number) => {
    Modal.confirm({
      title: '确定删除该会员吗？',
      content: '将同时删除所有订阅记录',
      okText: '确定',
      cancelText: '取消',
      onOk: async () => {
        try {
          await memberApi.delete(id);
          message.success('删除成功');
          fetchMembers();
        } catch (err) {
          message.error('删除失败');
          console.error('Failed to delete member:', err);
        }
      },
    });
  }, [fetchMembers]);

  /**
   * 查看会员详情
   */
  const handleView = useCallback((memberId: number) => {
    navigate(`/members/${memberId}`);
  }, [navigate]);

  /**
   * 删除会员
   */
  const handleDelete = useCallback(async (id: number, e?: React.MouseEvent) => {
    if (e) {
      e.stopPropagation();
    }
    try {
      await memberApi.delete(id);
      message.success('删除成功');
      fetchMembers();
    } catch (err) {
      message.error('删除失败');
      console.error('Failed to delete member:', err);
    }
  }, [fetchMembers]);

  /**
   * 提交表单
   */
  const handleSubmit = useCallback(async () => {
    try {
      setSubmitting(true);
      const values = await form.validateFields();

      if (editingMember) {
        await memberApi.update(editingMember.id, values as MemberUpdate);
        message.success('更新成功');
      } else {
        await memberApi.create(values as MemberCreate);
        message.success('创建成功');
      }

      setModalOpen(false);
      fetchMembers();
    } catch (err) {
      const errorMsg = editingMember ? '更新失败' : '创建失败';
      message.error(errorMsg);
      console.error('Failed to submit member:', err);
    } finally {
      setSubmitting(false);
    }
  }, [editingMember, form, fetchMembers]);

  /**
   * 清除筛选
   */
  const handleClearFilters = useCallback(() => {
    setFilters({});
    setSearchText('');
    setPagination({ page: 1, pageSize: 10 });
  }, []);

  // 表格列定义
  const columns = useMemo(() => [
    {
      title: '名称',
      dataIndex: 'name',
      key: 'name',
      fixed: 'left' as const,
      width: 180,
      ellipsis: true,
      render: (name: string, record: Member) => (
        <a onClick={() => handleView(record.id)}>{name}</a>
      ),
    },
    {
      title: '分类',
      dataIndex: 'category',
      key: 'category',
      width: 130,
      render: (category: Member['category']) =>
        category ? (
          <Tag color={isDark && category.color ? adjustForDarkModeWithContrast(category.color) : (category.color || 'blue')}>
            {category.icon} {category.name}
          </Tag>
        ) : <span style={{ color: 'var(--ant-color-text-tertiary)' }}>-</span>,
    },
    {
      title: '最新订阅',
      key: 'latest_subscription',
      width: 180,
      render: (_: unknown, record: Member) => {
        const sub = record.latest_subscription;
        if (!sub) return <span style={{ color: 'var(--ant-color-text-tertiary)' }}>无订阅</span>;
        const daysRemaining = getDaysRemaining(sub.end_date);
        const isExpired = daysRemaining < 0;
        return (
          <Space direction="vertical" size={0}>
            <span>{sub.level || '标准版'}</span>
            <span style={{ color: 'var(--ant-color-text-secondary)', fontSize: 12 }}>
              {formatPrice(sub.price, sub.currency)} · {isExpired ? `已过期${Math.abs(daysRemaining)}天` : `${daysRemaining}天后到期`}
            </span>
          </Space>
        );
      },
    },
    {
      title: '总订阅数',
      dataIndex: 'subscription_count',
      key: 'subscription_count',
      width: 90,
      align: 'center' as const,
    },
    {
      title: '累计花费',
      dataIndex: 'total_spending',
      key: 'total_spending',
      width: 120,
      render: (spending: number) => formatPrice(spending),
    },
    {
      title: '状态',
      key: 'status',
      width: 80,
      render: (_: unknown, record: Member) => (
        <Tag color={record.status === 'active' ? 'green' : 'default'}>
          {record.status === 'active' ? '有效' : '已过期'}
        </Tag>
      ),
    },
    {
      title: '操作',
      key: 'action',
      fixed: 'right' as const,
      width: 180,
      render: (_: unknown, record: Member) => (
        <Space>
          <Button
            type="link"
            size="small"
            icon={<EyeOutlined />}
            onClick={() => handleView(record.id)}
          >
            详情
          </Button>
          <Button
            type="link"
            size="small"
            icon={<EditOutlined />}
            onClick={(e) => handleEdit(record, e)}
          >
            编辑
          </Button>
          <Popconfirm
            title="确定删除该会员吗？"
            description="将同时删除所有订阅记录"
            onConfirm={(e) => handleDelete(record.id, e as React.MouseEvent)}
            okText="确定"
            cancelText="取消"
          >
            <Button type="link" size="small" danger icon={<DeleteOutlined />} onClick={(e) => e.stopPropagation()}>
              删除
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ], [handleView, handleEdit, handleDelete]);

  // 判断是否有筛选条件
  const hasFilters = Object.keys(filters).length > 0 || searchText.length > 0;
  return (
    <div>
      <Card
        title="会员管理"
        extra={
          <Space>
            <Radio.Group
              value={viewMode}
              onChange={(e) => setViewMode(e.target.value)}
              buttonStyle="solid"
              size="small"
            >
              <Radio.Button value="table">
                <UnorderedListOutlined /> 表格
              </Radio.Button>
              <Radio.Button value="card">
                <AppstoreOutlined /> 卡片
              </Radio.Button>
            </Radio.Group>
            <Button
              icon={<ReloadOutlined />}
              onClick={fetchMembers}
              loading={loading}
            >
              刷新
            </Button>
            {hasFilters && (
              <Button onClick={handleClearFilters}>
                清除筛选
              </Button>
            )}
            <Button type="primary" icon={<PlusOutlined />} onClick={handleCreate}>
              添加会员
            </Button>
          </Space>
        }
      >
        {/* 错误提示 */}
        {error && (
          <Alert
            message={error}
            type="error"
            closable
            onClose={() => setError(null)}
            showIcon
            style={{ marginBottom: 16 }}
          />
        )}

        {/* 筛选栏 */}
        <Space style={{ marginBottom: 16 }} wrap>
          <Input
            placeholder="搜索会员名称"
            prefix={<SearchOutlined />}
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            style={{ width: 200 }}
            allowClear
          />
          <Select
            placeholder="选择分类"
            allowClear
            style={{ width: 150 }}
            onChange={(value) => setFilters((prev) => ({ ...prev, category_id: value }))}
            value={filters.category_id}
            loading={categoriesLoading}
          >
            {categories.map((cat) => (
              <Select.Option key={cat.id} value={cat.id}>
                {cat.icon} {cat.name}
              </Select.Option>
            ))}
          </Select>
          <Select
            placeholder="状态"
            allowClear
            style={{ width: 120 }}
            options={STATUS_OPTIONS}
            onChange={(value) => setFilters((prev) => ({ ...prev, status: value }))}
            value={filters.status}
          />
        </Space>

        {/* 视图内容 */}
        {viewMode === 'card' ? (
          <Row gutter={[16, 16]}>
            {members.length === 0 ? (
              <Col span={24}>
                <Empty
                  description={hasFilters ? '没有符合条件的会员' : '暂无会员数据'}
                  image={Empty.PRESENTED_IMAGE_SIMPLE}
                />
              </Col>
            ) : (
              members.map((member) => (
                <Col key={member.id} xs={24} sm={12} md={8} lg={6}>
                  <MemberCard
                    member={member}
                    onView={handleView}
                    onEdit={handleCardEdit}
                    onDelete={handleCardDelete}
                  />
                </Col>
              ))
            )}
          </Row>
        ) : (
          <Table
            columns={columns}
            dataSource={members}
            rowKey="id"
            loading={loading}
            size="small"
            scroll={{ x: 1100 }}
            onRow={(record) => ({
              onClick: () => handleView(record.id),
              style: { cursor: 'pointer' },
            })}
            locale={{
              emptyText: (
                <Empty
                  description={hasFilters ? '没有符合条件的会员' : '暂无会员数据'}
                  image={Empty.PRESENTED_IMAGE_SIMPLE}
                />
              ),
            }}
            pagination={{
              current: pagination.page,
              pageSize: pagination.pageSize,
              total: total,
              showSizeChanger: true,
              showQuickJumper: true,
              showTotal: (t) => `共 ${t} 条`,
              onChange: (page, pageSize) => setPagination({ page, pageSize }),
            }}
          />
        )}
      </Card>

      {/* 创建/编辑弹窗 */}
      <Modal
        title={editingMember ? '编辑会员' : '添加会员'}
        open={modalOpen}
        onOk={handleSubmit}
        onCancel={() => setModalOpen(false)}
        confirmLoading={submitting}
        width={600}
        destroyOnClose
      >
        <Form form={form} layout="vertical">
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="name"
                label="会员名称"
                rules={[
                  { required: true, message: '请输入会员名称' },
                  { max: 100, message: '名称最多100个字符' },
                  { whitespace: true, message: '名称不能为空格' },
                ]}
              >
                <Input placeholder="如: QQ音乐、Netflix" maxLength={100} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="category_id" label="分类">
                <Select placeholder="选择分类" allowClear loading={categoriesLoading}>
                  {categories.map((cat) => (
                    <Select.Option key={cat.id} value={cat.id}>
                      {cat.icon} {cat.name}
                    </Select.Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="reminder_days"
                label="提前提醒天数"
                tooltip="在订阅到期前多少天开始提醒"
              >
                <InputNumber min={0} max={365} style={{ width: '100%' }} />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item name="notes" label="备注">
            <Input.TextArea rows={2} placeholder="备注信息" maxLength={1000} showCount />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default React.memo(Members);