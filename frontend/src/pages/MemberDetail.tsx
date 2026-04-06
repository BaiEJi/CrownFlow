/**
 * MemberDetail 会员详情页面
 *
 * 展示会员基础信息和所有订阅记录。
 * 支持添加、编辑、删除订阅记录。
 * 订阅记录以表格形式展示，每行显示完整属性。
 * 支持日期筛选功能（筛选覆盖指定日期的订阅）。
 *
 * @module pages/MemberDetail
 */

import React, { useEffect, useState, useCallback, useMemo } from 'react';
import {
  Card,
  Button,
  Space,
  Tag,
  Table,
  Popconfirm,
  message,
  Empty,
  Spin,
  Typography,
  Select,
  DatePicker,
  Tabs,
} from 'antd';
import {
  ArrowLeftOutlined,
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  ReloadOutlined,
  ClockCircleOutlined,
  ClearOutlined,
  UnorderedListOutlined,
  FieldTimeOutlined,
} from '@ant-design/icons';
import { useParams, useNavigate } from 'react-router-dom';
import { memberApi, subscriptionApi } from '@/services/api';
import { formatPrice, getBillingCycleLabel, getDaysRemaining } from '@/utils';
import { adjustForDarkModeWithContrast } from '@/constants/colors';
import SubscriptionModal from '@/components/SubscriptionModal';
import SubscriptionTimeline from '@/components/SubscriptionTimeline';
import type { Member, Subscription, SubscriptionCreate, SubscriptionUpdate } from '@/types';
import dayjs from 'dayjs';

const { Title, Text } = Typography;

/**
 * 计费周期选项
 */
const BILLING_CYCLE_OPTIONS = [
  { value: 'monthly', label: '月付' },
  { value: 'quarterly', label: '季付' },
  { value: 'yearly', label: '年付' },
  { value: 'custom', label: '自定义' },
];

/**
 * 状态选项
 */
const STATUS_OPTIONS = [
  { value: 'active', label: '正常' },
  { value: 'expiring', label: '即将到期' },
  { value: 'expired', label: '已过期' },
];

/**
 * 会员详情页面组件
 */
const MemberDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const memberId = id ? parseInt(id, 10) : null;

  const [member, setMember] = useState<Member | null>(null);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingSubscription, setEditingSubscription] = useState<Subscription | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [isDark, setIsDark] = useState(() => localStorage.getItem('theme-mode') === 'dark');

  useEffect(() => {
    const handler = () => setIsDark(localStorage.getItem('theme-mode') === 'dark');
    window.addEventListener('theme-change', handler);
    return () => window.removeEventListener('theme-change', handler);
  }, []);

  // 筛选状态
  const [filters, setFilters] = useState<{
    level?: string;
    billingCycle?: string;
    status?: string;
    date?: string;
  }>({});

  /**
   * 获取会员详情
   */
  const fetchMember = useCallback(async () => {
    if (!memberId) return;

    try {
      setLoading(true);
      const response = await memberApi.getById(memberId);
      setMember(response.data.data);
    } catch (err) {
      message.error('获取会员详情失败');
      console.error('Failed to fetch member:', err);
    } finally {
      setLoading(false);
    }
  }, [memberId]);

  useEffect(() => {
    fetchMember();
  }, [fetchMember]);

  /**
   * 打开创建订阅弹窗
   */
  const handleCreateSubscription = useCallback(() => {
    setEditingSubscription(null);
    setModalOpen(true);
  }, []);

  /**
   * 打开编辑订阅弹窗
   */
  const handleEditSubscription = useCallback((subscription: Subscription) => {
    setEditingSubscription(subscription);
    setModalOpen(true);
  }, []);

  /**
   * 删除订阅
   */
  const handleDeleteSubscription = useCallback(async (subscriptionId: number) => {
    try {
      await subscriptionApi.delete(subscriptionId);
      message.success('删除成功');
      fetchMember();
    } catch (err) {
      message.error('删除失败');
      console.error('Failed to delete subscription:', err);
    }
  }, [fetchMember]);

  /**
   * 提交订阅表单
   */
  const handleSubmitSubscription = useCallback(async (data: SubscriptionCreate | SubscriptionUpdate) => {
    if (!memberId) return;

    try {
      setSubmitting(true);
      if (editingSubscription) {
        await subscriptionApi.update(editingSubscription.id, data as SubscriptionUpdate);
        message.success('更新成功');
      } else {
        await subscriptionApi.create(memberId, data as SubscriptionCreate);
        message.success('创建成功');
      }
      setModalOpen(false);
      fetchMember();
    } catch (err) {
      const errorMsg = editingSubscription ? '更新失败' : '创建失败';
      message.error(errorMsg);
      console.error('Failed to submit subscription:', err);
    } finally {
      setSubmitting(false);
    }
  }, [memberId, editingSubscription, fetchMember]);

  /**
   * 返回会员列表
   */
  const handleGoBack = useCallback(() => {
    navigate('/members');
  }, [navigate]);

  /**
   * 清除筛选
   */
  const handleClearFilters = useCallback(() => {
    setFilters({});
  }, []);

  /**
   * 应用筛选后的数据
   */
  const filteredSubscriptions = useMemo(() => {
    if (!member?.subscriptions) return [];

    let result = [...member.subscriptions];

    // 级别筛选
    if (filters.level) {
      result = result.filter(s => s.level === filters.level);
    }

    // 计费周期筛选
    if (filters.billingCycle) {
      result = result.filter(s => s.billing_cycle === filters.billingCycle);
    }

    // 状态筛选
    if (filters.status && member) {
      result = result.filter(s => {
        const daysRemaining = getDaysRemaining(s.end_date);
        const isExpired = daysRemaining < 0;
        const isExpiringSoon = daysRemaining >= 0 && daysRemaining <= member.reminder_days;

        if (filters.status === 'active') return !isExpired && !isExpiringSoon;
        if (filters.status === 'expiring') return isExpiringSoon;
        if (filters.status === 'expired') return isExpired;
        return true;
      });
    }

    // 日期筛选（订阅覆盖该日期）
    if (filters.date) {
      result = result.filter(s => 
        s.start_date <= filters.date! && s.end_date >= filters.date!
      );
    }

    return result;
  }, [member, filters]);

  // 获取所有唯一的级别选项
  const levelOptions = useMemo(() => {
    if (!member?.subscriptions) return [];
    const levels = new Set(member.subscriptions.map(s => s.level).filter(Boolean));
    return Array.from(levels).map(level => ({ value: level, label: level }));
  }, [member]);

  // 按币种分组的累计花费
  const spendingByCurrency = useMemo(() => {
    if (!member?.subscriptions) return {};
    const result: Record<string, number> = {};
    for (const sub of member.subscriptions) {
      const currency = sub.currency || 'CNY';
      if (!result[currency]) {
        result[currency] = 0;
      }
      result[currency] += sub.price;
    }
    return result;
  }, [member]);

  // 是否有筛选条件
  const hasFilters = Object.keys(filters).some(key => {
    const value = filters[key as keyof typeof filters];
    return value !== undefined && value !== '';
  });

  /**
   * 表格列定义
   */
  const columns = useMemo(() => {
    if (!member) return [];
    
    return [
      {
        title: '有效期',
        key: 'period',
        width: 205,
        render: (_: unknown, record: Subscription) => (
          <span>{record.start_date} ~ {record.end_date}</span>
        ),
      },
      {
        title: '价格',
        dataIndex: 'price',
        key: 'price',
        width: 110,
        render: (price: number, record: Subscription) => formatPrice(price, record.currency),
      },
      {
        title: '计费周期',
        dataIndex: 'billing_cycle',
        key: 'billing_cycle',
        width: 100,
        render: (cycle: string, record: Subscription) => 
          cycle === 'custom' ? `${record.custom_days}天` : getBillingCycleLabel(cycle),
      },
      {
        title: '状态',
        key: 'status',
        width: 100,
        render: (_: unknown, record: Subscription) => {
          const daysRemaining = getDaysRemaining(record.end_date);
          const isExpired = daysRemaining < 0;
          const isExpiringSoon = daysRemaining >= 0 && daysRemaining <= member.reminder_days;

          return (
            <Tag color={isExpired ? 'default' : isExpiringSoon ? 'orange' : 'green'}>
              {isExpired
                ? `已过期${Math.abs(daysRemaining)}天`
                : daysRemaining === 0
                ? '今天到期'
                : `${daysRemaining}天后到期`}
            </Tag>
          );
        },
      },
      {
        title: '级别',
        dataIndex: 'level',
        key: 'level',
        width: 100,
        render: (level: string) => level || <span style={{ color: 'var(--ant-color-text-tertiary)' }}>-</span>,
      },
      {
        title: '订阅渠道',
        dataIndex: 'channel',
        key: 'channel',
        width: 120,
        render: (channel: string) => channel || <span style={{ color: 'var(--ant-color-text-tertiary)' }}>-</span>,
      },
      {
        title: '备注',
        dataIndex: 'notes',
        key: 'notes',
        width: 150,
        ellipsis: true,
        render: (notes: string) => notes || <span style={{ color: 'var(--ant-color-text-tertiary)' }}>-</span>,
      },
      {
        title: '操作',
        key: 'action',
        width: 120,
        fixed: 'right' as const,
        render: (_: unknown, record: Subscription) => (
          <Space>
            <Button
              type="link"
              size="small"
              icon={<EditOutlined />}
              onClick={() => handleEditSubscription(record)}
            >
              编辑
            </Button>
            <Popconfirm
              title="确定删除该订阅记录吗？"
              description="此操作不可撤销"
              onConfirm={() => handleDeleteSubscription(record.id)}
              okText="确定"
              cancelText="取消"
            >
              <Button type="link" size="small" danger icon={<DeleteOutlined />}>
                删除
              </Button>
            </Popconfirm>
          </Space>
        ),
      },
    ];
  }, [member, handleEditSubscription, handleDeleteSubscription]);

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '100px 0' }}>
        <Spin size="large" />
      </div>
    );
  }

  if (!member) {
    return (
      <Card>
        <Empty description="会员不存在" />
        <div style={{ textAlign: 'center', marginTop: 16 }}>
          <Button onClick={handleGoBack}>返回会员列表</Button>
        </div>
      </Card>
    );
  }

  const subscriptions = member.subscriptions || [];

  return (
    <div>
      {/* 页面标题 */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <Space>
          <Button icon={<ArrowLeftOutlined />} onClick={handleGoBack}>
            返回
          </Button>
          <Title level={3} style={{ margin: 0 }}>
            {member.name}
          </Title>
          <Tag color={member.status === 'active' ? 'green' : 'default'}>
            {member.status === 'active' ? '有效' : '已过期'}
          </Tag>
        </Space>
        <Space>
          <Button icon={<ReloadOutlined />} onClick={fetchMember} loading={loading}>
            刷新
          </Button>
        </Space>
      </div>

      {/* 会员基础信息 */}
      <Card style={{ marginBottom: 24 }}>
        <Space size={48} wrap>
          <div>
            <Text type="secondary">分类: </Text>
            {member.category ? (
              <Tag color={isDark && member.category.color ? adjustForDarkModeWithContrast(member.category.color) : (member.category.color || 'blue')}>
                {member.category.icon} {member.category.name}
              </Tag>
            ) : (
              <Text type="secondary">未分类</Text>
            )}
          </div>
          <div>
            <Text type="secondary">订阅数: </Text>
            <Text strong>{member.subscription_count}</Text>
          </div>
          <div>
            <Text type="secondary">累计花费: </Text>
            <Text strong style={{ color: isDark ? adjustForDarkModeWithContrast('#cf1322') : '#cf1322' }}>
              {Object.entries(spendingByCurrency).map(([currency, amount]) => 
                formatPrice(amount, currency)
              ).join(' + ') || '¥0.00'}
            </Text>
          </div>
          <div>
            <Text type="secondary">提前提醒: </Text>
            <Text strong>{member.reminder_days} 天</Text>
          </div>
          {member.notes && (
            <div>
              <Text type="secondary">备注: </Text>
              <Text>{member.notes}</Text>
            </div>
          )}
        </Space>
      </Card>

      {/* 订阅记录 */}
      <Card
        title={
          <Space>
            <ClockCircleOutlined />
            订阅记录
            <Text type="secondary" style={{ fontSize: 14 }}>
              ({filteredSubscriptions.length}/{subscriptions.length})
            </Text>
          </Space>
        }
        extra={
          <Space>
            {hasFilters && (
              <Button icon={<ClearOutlined />} onClick={handleClearFilters}>
                清除筛选
              </Button>
            )}
            <Button type="primary" icon={<PlusOutlined />} onClick={handleCreateSubscription}>
              添加订阅
            </Button>
          </Space>
        }
      >
        <Tabs
          defaultActiveKey="table"
          items={[
            {
              key: 'table',
              label: (
                <Space>
                  <UnorderedListOutlined />
                  表格视图
                </Space>
              ),
              children: (
                <>
                  {/* 筛选栏 */}
                  <div style={{ marginBottom: 16 }}>
                    <Space wrap size={12}>
                      <Select
                        placeholder="筛选级别"
                        value={filters.level}
                        onChange={(value) => setFilters(prev => ({ ...prev, level: value || undefined }))}
                        style={{ width: 120 }}
                        options={levelOptions}
                        allowClear
                      />
                      <Select
                        placeholder="计费周期"
                        value={filters.billingCycle}
                        onChange={(value) => setFilters(prev => ({ ...prev, billingCycle: value || undefined }))}
                        style={{ width: 100 }}
                        options={BILLING_CYCLE_OPTIONS}
                        allowClear
                      />
                      <Select
                        placeholder="状态"
                        value={filters.status}
                        onChange={(value) => setFilters(prev => ({ ...prev, status: value || undefined }))}
                        style={{ width: 100 }}
                        options={STATUS_OPTIONS}
                        allowClear
                      />
                      <DatePicker
                        placeholder="筛选日期（订阅覆盖该日期）"
                        style={{ width: 200 }}
                        value={filters.date ? dayjs(filters.date) : null}
                        onChange={(date) => {
                          if (date) {
                            setFilters(prev => ({ ...prev, date: date.format('YYYY-MM-DD') }));
                          } else {
                            setFilters(prev => {
                              const { date, ...rest } = prev;
                              return rest;
                            });
                          }
                        }}
                      />
                    </Space>
                  </div>

                  <Table
                    columns={columns}
                    dataSource={filteredSubscriptions}
                    rowKey="id"
                    size="small"
                    scroll={{ x: 1100 }}
                    locale={{
                      emptyText: (
                        <Empty
                          description={hasFilters ? '没有符合条件的订阅记录' : '暂无订阅记录'}
                          image={Empty.PRESENTED_IMAGE_SIMPLE}
                        />
                      ),
                    }}
                    pagination={false}
                  />
                </>
              ),
            },
            {
              key: 'timeline',
              label: (
                <Space>
                  <FieldTimeOutlined />
                  时间轴
                </Space>
              ),
              children: (
                <SubscriptionTimeline
                  subscriptions={subscriptions}
                  member={member}
                />
              ),
            },
          ]}
        />
      </Card>

      <SubscriptionModal
        open={modalOpen}
        subscription={editingSubscription}
        onSubmit={handleSubmitSubscription}
        onCancel={() => setModalOpen(false)}
        loading={submitting}
      />
    </div>
  );
};

export default React.memo(MemberDetail);