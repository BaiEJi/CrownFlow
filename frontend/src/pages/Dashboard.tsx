/**
 * Dashboard 概览页面
 * 
 * 展示会员统计概览和即将到期的订阅提醒。
 * 使用卡片展示会员总数、活跃会员、本月支出、年度支出。
 */

import React, { useMemo, useState, useEffect, lazy, Suspense } from 'react';
import { Card, Row, Col, Statistic, List, Tag, Empty, Alert, Button, Tooltip, Space, Skeleton, Table } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import {
  UserOutlined,
  CalendarOutlined,
  WarningOutlined,
  ReloadOutlined,
  QuestionCircleOutlined,
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useOverview, useReminders, useCategorySummary } from '@/hooks';
import { formatPrice } from '@/utils';
import { adjustForDarkModeWithContrast } from '@/constants/colors';
import { ApiError } from '@/services/api';
import type { CategorySummaryItem } from '@/types';

/**
 * 会员支出排行榜骨架屏
 */
const MemberRankingSkeleton = () => (
  <Card title="会员支出排行榜">
    <Skeleton active avatar paragraph={{ rows: 3 }} />
  </Card>
);

/**
 * 到期日历骨架屏
 */
const CalendarSkeleton = () => (
  <Card title="到期日历">
    <Skeleton active paragraph={{ rows: 8 }} />
  </Card>
);

const MemberRankingCard = lazy(() => import('@/components/MemberRankingCard'));
const ExpiryCalendar = lazy(() => import('@/components/ExpiryCalendar'));

/**
 * 概览页面组件
 */
const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  
  const [isDark, setIsDark] = useState(() => localStorage.getItem('theme-mode') === 'dark');

  useEffect(() => {
    const handler = () => setIsDark(localStorage.getItem('theme-mode') === 'dark');
    window.addEventListener('theme-change', handler);
    return () => window.removeEventListener('theme-change', handler);
  }, []);

  const activeMemberColor = isDark ? adjustForDarkModeWithContrast('#3f8600') : '#3f8600';
  const monthlySpendingColor = isDark ? adjustForDarkModeWithContrast('#cf1322') : '#cf1322';
  const yearlySpendingColor = isDark ? adjustForDarkModeWithContrast('#722ed1') : '#722ed1';
  
  const {
    overview,
    loading: overviewLoading,
    error: overviewError,
    fetchOverview,
  } = useOverview(true);

  const {
    reminders,
    loading: remindersLoading,
    error: remindersError,
    fetchReminders,
  } = useReminders(true);

  const {
    categorySummary,
    loading: categoryLoading,
    fetchCategorySummary,
  } = useCategorySummary(true);

  const loading = overviewLoading || remindersLoading;

  const handleRefresh = () => {
    fetchOverview();
    fetchReminders();
    fetchCategorySummary();
  };

  const handleViewMember = (memberId: number) => {
    navigate(`/members/${memberId}`);
  };

  const sortedReminders = useMemo(() => {
    if (!reminders) return [];
    return [...reminders].sort((a, b) => a.days_remaining - b.days_remaining);
  }, [reminders]);

  const categoryColumns: ColumnsType<CategorySummaryItem> = useMemo(() => [
    {
      title: '分类',
      dataIndex: 'category_name',
      key: 'category_name',
      render: (text: string, record: CategorySummaryItem) => (
        <Space>
          <span style={{ fontSize: 16 }}>{record.category_icon || '📦'}</span>
          <span>{text}</span>
        </Space>
      ),
    },
    {
      title: '本月支出',
      dataIndex: 'monthly_spending',
      key: 'monthly_spending',
      align: 'right',
      render: (value: number) => `¥${value.toFixed(2)}`,
      sorter: (a, b) => a.monthly_spending - b.monthly_spending,
      defaultSortOrder: 'descend',
    },
    {
      title: '年度支出',
      dataIndex: 'yearly_spending',
      key: 'yearly_spending',
      align: 'right',
      render: (value: number) => `¥${value.toFixed(2)}`,
      sorter: (a, b) => a.yearly_spending - b.yearly_spending,
    },
  ], []);

  if (overviewError) {
    const errorMsg = (overviewError as ApiError).message || '无法加载概览数据';
    
    return (
      <div>
        <Alert
          message={errorMsg}
          type="error"
          showIcon
          closable
          style={{ marginBottom: 16 }}
          action={
            <Button size="small" onClick={handleRefresh}>
              重试
            </Button>
          }
        />
        <Row gutter={16}>
          <Col xs={24} sm={12} md={6}>
            <Card><Statistic title="会员总数" value={0} prefix={<UserOutlined />} /></Card>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Card><Statistic title="活跃会员" value={0} prefix={<CalendarOutlined />} valueStyle={{ color: activeMemberColor }} /></Card>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Card><Statistic title="本月支出" value={0} prefix="¥" valueStyle={{ color: monthlySpendingColor }} /></Card>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Card><Statistic title="年度支出" value={0} prefix="¥" valueStyle={{ color: yearlySpendingColor }} /></Card>
          </Col>
        </Row>
      </div>
    );
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <h2 style={{ margin: 0 }}>概览</h2>
        <Button
          icon={<ReloadOutlined />}
          onClick={handleRefresh}
          loading={loading}
        >
          刷新
        </Button>
      </div>
      
      <div style={{ display: 'flex', gap: 16 }}>
        <div style={{ flex: 1, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          <Card loading={loading}>
            <Statistic
              title="会员总数"
              value={overview?.total_members || 0}
              prefix={<UserOutlined />}
            />
          </Card>
          <Card loading={loading}>
            <Statistic
              title="活跃会员"
              value={overview?.active_members || 0}
              prefix={<CalendarOutlined />}
              valueStyle={{ color: activeMemberColor }}
            />
          </Card>
          <Card loading={loading}>
            <Statistic
              title={
                <span>
                  本月支出{' '}
                  <Tooltip title="按日均价格 × 本月覆盖天数计算（整月）">
                    <QuestionCircleOutlined style={{ color: 'var(--ant-color-text-tertiary)', fontSize: 12 }} />
                  </Tooltip>
                </span>
              }
              value={overview?.monthly_spending || 0}
              precision={2}
              prefix="¥"
              valueStyle={{ color: monthlySpendingColor }}
            />
          </Card>
          <Card loading={loading}>
            <Statistic
              title={
                <span>
                  年度支出{' '}
                  <Tooltip title="按日均价格 × 本年覆盖天数计算（整年）">
                    <QuestionCircleOutlined style={{ color: 'var(--ant-color-text-tertiary)', fontSize: 12 }} />
                  </Tooltip>
                </span>
              }
              value={overview?.yearly_spending || 0}
              precision={2}
              prefix="¥"
              valueStyle={{ color: yearlySpendingColor }}
            />
          </Card>
        </div>
        <Card 
          loading={categoryLoading}
          style={{ flex: 1 }}
          styles={{ body: { padding: '8px 12px' } }}
        >
          <Table
            dataSource={categorySummary?.categories || []}
            columns={categoryColumns}
            rowKey="category_id"
            size="small"
            pagination={false}
            scroll={{ y: 208 }}
            showHeader={true}
            summary={() => {
              if (!categorySummary) return null;
              return (
                <Table.Summary fixed>
                  <Table.Summary.Row>
                    <Table.Summary.Cell index={0}>
                      <strong>合计</strong>
                    </Table.Summary.Cell>
                    <Table.Summary.Cell index={1} align="right">
                      <strong>¥{categorySummary.total_monthly.toFixed(2)}</strong>
                    </Table.Summary.Cell>
                    <Table.Summary.Cell index={2} align="right">
                      <strong>¥{categorySummary.total_yearly.toFixed(2)}</strong>
                    </Table.Summary.Cell>
                  </Table.Summary.Row>
                </Table.Summary>
              );
            }}
          />
        </Card>
      </div>

      <Card
        title={
          <span>
            <WarningOutlined style={{ color: isDark ? adjustForDarkModeWithContrast('#faad14') : '#faad14', marginRight: 8 }} />
            即将到期提醒
          </span>
        }
        style={{ marginTop: 24 }}
        loading={remindersLoading}
      >
        {remindersError ? (
          <Alert
            message="加载提醒失败"
            description={(remindersError as ApiError).message || '无法加载提醒数据'}
            type="warning"
            showIcon
          />
        ) : sortedReminders.length === 0 ? (
          <Empty description="暂无即将到期的订阅" />
        ) : (
          <List
            dataSource={sortedReminders}
            renderItem={(item) => (
              <List.Item
                onClick={() => handleViewMember(item.member_id)}
                style={{ cursor: 'pointer' }}
              >
                <List.Item.Meta
                  avatar={
                    <span style={{ fontSize: 24 }}>
                      {item.category_icon || '📦'}
                    </span>
                  }
                  title={
                    <Space>
                      <span>{item.member_name}</span>
                      {item.level && <Tag color="blue">{item.level}</Tag>}
                    </Space>
                  }
                  description={
                    <span>
                      {item.category_name && (
                        <Tag color="blue" style={{ marginRight: 8 }}>
                          {item.category_name}
                        </Tag>
                      )}
                      到期日期: {item.end_date}
                    </span>
                  }
                />
                <div style={{ textAlign: 'right' }}>
                  <div>{formatPrice(item.price, item.currency)}</div>
                  <Tag 
                    color={item.days_remaining === 0 ? 'red' : item.days_remaining < 0 ? 'default' : 'orange'}
                  >
                    {item.days_remaining < 0
                      ? `已过期 ${Math.abs(item.days_remaining)} 天`
                      : item.days_remaining === 0
                      ? '今天到期'
                      : `${item.days_remaining}天后到期`}
                  </Tag>
                </div>
              </List.Item>
            )}
          />
        )}
      </Card>

      {/* 会员支出排行榜 */}
      <Row gutter={16} style={{ marginTop: 24 }}>
        <Col xs={24} lg={12}>
          <Suspense fallback={<MemberRankingSkeleton />}>
            <MemberRankingCard />
          </Suspense>
        </Col>
        <Col xs={24} lg={12}>
          <Suspense fallback={<CalendarSkeleton />}>
            <ExpiryCalendar onRefresh={handleRefresh} />
          </Suspense>
        </Col>
      </Row>
    </div>
  );
};

export default React.memo(Dashboard);