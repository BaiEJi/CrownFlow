/**
 * Statistics 统计图表页面
 *
 * 展示支出趋势图和分类支出饼图。
 * 支持按月/周/季度查看趋势，支持日期范围筛选。
 *
 * @module pages/Statistics
 */

import React, { useState, useMemo, useEffect } from 'react';
import { Card, Row, Col, DatePicker, Select, Spin, Empty, Switch, Typography, message } from 'antd';
import {
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts';
import { useTrend, useCategoryStats } from '@/hooks';
import { formatPrice, getDateRange } from '@/utils';
import { ApiError } from '@/services/api';
import { COLORS, DARK_COLORS } from '@/constants/colors';
import dayjs from 'dayjs';
import type { CategoryStats, TrendCategoryDetail, SpendingDetail } from '@/types';

const { Text } = Typography;

const { RangePicker } = DatePicker;

/**
 * 统计图表页面组件
 */
const Statistics: React.FC = () => {
  const [isDark, setIsDark] = React.useState(() => localStorage.getItem('theme-mode') === 'dark');

  React.useEffect(() => {
    const handler = () => setIsDark(localStorage.getItem('theme-mode') === 'dark');
    window.addEventListener('theme-change', handler);
    return () => window.removeEventListener('theme-change', handler);
  }, []);

  // Theme-aware chart colors
  const chartColors = isDark ? DARK_COLORS : COLORS;

  const tooltipStyle: React.CSSProperties = {
    backgroundColor: isDark ? '#2a2a2a' : '#fff',
    border: `1px solid ${isDark ? '#424242' : '#e0e0e0'}`,
    borderRadius: '8px',
    boxShadow: isDark ? '0 2px 8px rgba(0,0,0,0.4)' : '0 2px 8px rgba(0,0,0,0.15)',
    padding: '12px 16px',
    maxWidth: 400,
    maxHeight: 500,
    overflowY: 'auto',
    color: isDark ? 'rgba(255,255,255,0.85)' : undefined,
    fontSize: '14px',
    fontWeight: 500,
    transition: 'opacity 0.2s ease-in-out',
  };

  const [dateRange, setDateRange] = useState<[string, string]>([
    dayjs().startOf('month').format('YYYY-MM-DD'),
    dayjs().endOf('month').format('YYYY-MM-DD'),
  ]);
  const [granularity, setGranularity] = useState<'day' | 'month' | 'week' | 'quarter'>('week');
  const [showDetails, setShowDetails] = useState(false);
  const [quickSelectType, setQuickSelectType] = useState<'week' | 'month' | 'quarter' | 'year' | null>(null);

  // Disable "按天" when date range is quarter (>=90 days) or year (>=365 days)
  const isDayGranularityDisabled = useMemo(() => {
    if (quickSelectType === 'quarter' || quickSelectType === 'year') {
      return true;
    }
    // Also check actual date range span
    const start = dayjs(dateRange[0]);
    const end = dayjs(dateRange[1]);
    const daysDiff = end.diff(start, 'day');
    return daysDiff >= 90; // Disable if span is >= 90 days
  }, [dateRange, quickSelectType]);

  const trendParams = useMemo(() => ({
    start_date: dateRange[0],
    end_date: dateRange[1],
    granularity,
  }), [dateRange, granularity]);

  const categoryParams = useMemo(() => ({
    start_date: dateRange[0],
    end_date: dateRange[1],
  }), [dateRange]);

  const { trend, loading: trendLoading, error: trendError, fetchTrend } = useTrend(trendParams, false);
  const { categoryStats, loading: categoryLoading, error: categoryError, fetchCategoryStats } = useCategoryStats(categoryParams, false);

  const loading = trendLoading || categoryLoading;

  React.useEffect(() => {
    fetchTrend();
    fetchCategoryStats();
  }, [fetchTrend, fetchCategoryStats]);

  useEffect(() => {
    if (trendError) {
      message.error((trendError as ApiError)?.message || '加载趋势数据失败');
    }
    if (categoryError) {
      message.error((categoryError as ApiError)?.message || '加载分类数据失败');
    }
  }, [trendError, categoryError]);

  // 日期范围变化处理
  const handleDateChange = (dates: [dayjs.Dayjs | null, dayjs.Dayjs | null] | null) => {
    if (dates && dates[0] && dates[1]) {
      setDateRange([
        dates[0].format('YYYY-MM-DD'),
        dates[1].format('YYYY-MM-DD'),
      ]);
      setQuickSelectType(null);
    }
  };

  // 快速选择日期范围
  const handleQuickSelect = (type: 'week' | 'month' | 'quarter' | 'year') => {
    const range = getDateRange(type);
    setDateRange([range.start, range.end]);
    setQuickSelectType(type);
  };

  // Auto-switch granularity when day becomes disabled
  useEffect(() => {
    if (isDayGranularityDisabled && granularity === 'day') {
      setGranularity('week');
    }
  }, [isDayGranularityDisabled, granularity]);

  // 饼图数据转换
  const pieData = useMemo(() => {
    if (!categoryStats?.categories) return [];
    return categoryStats.categories.map((item: CategoryStats, index: number) => ({
      name: item.category_name,
      value: Number(item.total),
      percentage: item.percentage,
      color: item.category_color || chartColors[index % chartColors.length],
      details: (item.details || []).sort((a, b) => a.member_name.localeCompare(b.member_name, 'zh-CN')),
    }));
  }, [categoryStats]);

  // 折线图自定义 Tooltip
  const LineChartTooltip = ({ active, payload, label }: { active?: boolean; payload?: Array<{ value: number; payload: { date: string; amount: number; details?: TrendCategoryDetail[] } }>; label?: string }) => {
    if (!active || !payload || !payload.length) return null;
    
    const data = payload[0].payload;
    
    return (
      <div style={tooltipStyle}>
        <Text strong style={isDark ? { color: 'rgba(255,255,255,0.85)' } : undefined}>{label}</Text>
        <br />
        <Text style={isDark ? { color: 'rgba(255,255,255,0.65)' } : undefined}>支出金额: {formatPrice(data.amount)}</Text>
        {showDetails && data.details && data.details.length > 0 && (
          <div style={{ marginTop: 8 }}>
            {data.details.map((cat: TrendCategoryDetail) => (
              <div key={cat.category_id} style={{ marginTop: 8 }}>
                <Text strong style={{ color: isDark ? cat.category_color : cat.category_color }}>{cat.category_name}: {formatPrice(cat.total)}</Text>
                <div style={{ paddingLeft: 12, marginTop: 4 }}>
                  {cat.subscriptions.sort((a, b) => a.member_name.localeCompare(b.member_name, 'zh-CN')).map((sub: SpendingDetail) => (
                    <div key={sub.subscription_id}>
                      <Text style={isDark ? { color: 'rgba(255,255,255,0.45)' } : undefined}>{sub.member_name}{sub.level ? ` (${sub.level})` : ''}: {formatPrice(sub.amount)}</Text>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  // 饼图自定义 Tooltip
  const PieChartTooltip = ({ active, payload }: { active?: boolean; payload?: Array<{ payload: { name: string; value: number; percentage: number; color: string; details: SpendingDetail[] } }> }) => {
    if (!active || !payload || !payload.length) return null;
    
    const data = payload[0].payload;
    
    return (
      <div style={tooltipStyle}>
        <Text strong style={{ color: data.color }}>{data.name}</Text>
        <br />
        <Text style={isDark ? { color: 'rgba(255,255,255,0.65)' } : undefined}>支出金额: {formatPrice(data.value)}</Text>
        <br />
        <Text style={isDark ? { color: 'rgba(255,255,255,0.45)' } : undefined}>占比: {data.percentage}%</Text>
        {showDetails && data.details && data.details.length > 0 && (
          <div style={{ marginTop: 8, borderTop: `1px solid ${isDark ? '#424242' : '#f0f0f0'}`, paddingTop: 8 }}>
            <Text style={isDark ? { color: 'rgba(255,255,255,0.45)' } : undefined}>明细:</Text>
            {data.details.map((sub: SpendingDetail) => (
              <div key={sub.subscription_id}>
                <Text style={isDark ? { color: 'rgba(255,255,255,0.45)' } : undefined}>{sub.member_name}{sub.level ? ` (${sub.level})` : ''}: {formatPrice(sub.amount)}</Text>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div>
      <h2 style={{ marginBottom: 24 }}>统计图表</h2>

      {/* 筛选控制栏 */}
      <Card
        style={{
          marginBottom: 24,
          borderRadius: '12px',
          boxShadow: isDark ? '0 1px 3px rgba(0,0,0,0.3)' : '0 1px 3px rgba(0,0,0,0.1)',
        }}
      >
        <Row gutter={16} align="middle">
          <Col>
            <RangePicker
              value={[dayjs(dateRange[0]), dayjs(dateRange[1])]}
              onChange={handleDateChange}
            />
          </Col>
          <Col>
            <Select
              value={granularity}
              onChange={setGranularity}
              style={{ width: 120 }}
            >
              <Select.Option value="day" disabled={isDayGranularityDisabled}>按天</Select.Option>
              <Select.Option value="week">按周</Select.Option>
              <Select.Option value="month">按月</Select.Option>
              <Select.Option value="quarter">按季度</Select.Option>
            </Select>
          </Col>
          <Col>
            <a onClick={() => handleQuickSelect('week')}>本周</a>
          </Col>
          <Col>
            <a onClick={() => handleQuickSelect('month')}>本月</a>
          </Col>
          <Col>
            <a onClick={() => handleQuickSelect('quarter')}>本季度</a>
          </Col>
          <Col>
            <a onClick={() => handleQuickSelect('year')}>本年</a>
          </Col>
          <Col flex="auto" style={{ textAlign: 'right' }}>
            <span style={{ marginRight: 8 }}>支出明细</span>
            <Switch checked={showDetails} onChange={setShowDetails} />
          </Col>
        </Row>
      </Card>

      {/* 图表区域 */}
      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', minHeight: 400 }}>
          <Spin size="large" />
        </div>
      ) : (
        <Row gutter={16}>
          {/* 趋势图 */}
          <Col xs={24} lg={16}>
            <Card
              title="支出趋势"
              style={{
                borderRadius: '12px',
                boxShadow: isDark ? '0 1px 3px rgba(0,0,0,0.3)' : '0 1px 3px rgba(0,0,0,0.1)',
              }}
            >
              {!trend?.trend || trend.trend.length === 0 ? (
                <Empty description="暂无数据" />
              ) : (
                <ResponsiveContainer width="100%" height={400}>
                  <AreaChart data={trend.trend}>
                    <defs>
                      <linearGradient id="colorExpense" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={chartColors[0]} stopOpacity={isDark ? 0.6 : 0.8} />
                        <stop offset="95%" stopColor={chartColors[0]} stopOpacity={isDark ? 0.05 : 0.1} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke={isDark ? '#424242' : '#d9d9d9'} vertical={true} horizontal={true} />
                    <XAxis 
                      dataKey="date" 
                      interval={granularity === 'day' ? 0 : 'preserveStartEnd'}
                      angle={-45}
                      textAnchor="end"
                      height={60}
                      padding={{ left: 15, right: 15 }}
                      tick={{ fontSize: 12 }}
                      tickLine={true}
                    />
                    <YAxis tickLine={true} />
                    <Tooltip content={<LineChartTooltip />} />
                    <Legend />
                    <Area
                      type="monotone"
                      dataKey="amount"
                      stroke={chartColors[0]}
                      name="支出金额"
                      strokeWidth={2}
                      fill="url(#colorExpense)"
                      fillOpacity={1}
                      isAnimationActive={true}
                      animationDuration={500}
                      animationEasing="ease-out"
                      dot={{ 
                        fill: chartColors[0], 
                        stroke: isDark ? '#1f1f1f' : '#fff', 
                        strokeWidth: 2, 
                        r: 4,
                        cursor: 'pointer'
                      }}
                      activeDot={{ 
                        fill: chartColors[0], 
                        stroke: isDark ? '#fff' : '#fff', 
                        strokeWidth: 2, 
                        r: 6 
                      }}
                    />
                    {trend?.trend?.map((entry, index) => (
                      <ReferenceLine key={index} x={entry.date} stroke={isDark ? '#424242' : '#e0e0e0'} strokeDasharray="3 3" />
                    ))}
                  </AreaChart>
                </ResponsiveContainer>
              )}
            </Card>
          </Col>

          {/* 分类饼图 */}
          <Col xs={24} lg={8}>
            <Card
              title={`分类支出 (总计: ${formatPrice(categoryStats?.total || 0)})`}
              style={{
                borderRadius: '12px',
                boxShadow: isDark ? '0 1px 3px rgba(0,0,0,0.3)' : '0 1px 3px rgba(0,0,0,0.1)',
              }}
            >
              {pieData.length === 0 ? (
                <Empty description="暂无数据" />
              ) : (
                <ResponsiveContainer width="100%" height={400}>
                    <PieChart>
                      <Pie
                        data={pieData}
                        cx="50%"
                        cy="45%"
                        innerRadius={60}
                        outerRadius={110}
                        fill={chartColors[0]}
                        dataKey="value"
                        isAnimationActive={true}
                        animationDuration={500}
                        animationEasing="ease-out"
                      >
                        {pieData.map((entry, index) => (
                          <Cell 
                            key={`cell-${index}`} 
                            fill={entry.color}
                            stroke={isDark ? '#2a2a2a' : '#fff'}
                            strokeWidth={2}
                          />
                        ))}
                      </Pie>
                      <Tooltip content={<PieChartTooltip />} />
                      <Legend 
                        layout="horizontal"
                        align="center"
                        verticalAlign="bottom"
                        iconType="circle"
                        formatter={(value) => {
                          const item = pieData.find(p => p.name === value);
                          return `${value} (${item?.percentage || 0}%)`;
                        }}
                        wrapperStyle={{
                          paddingTop: 16,
                          maxHeight: 120,
                          overflowY: 'auto',
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
              )}
            </Card>
          </Col>
        </Row>
      )}
    </div>
  );
};

export default React.memo(Statistics);
