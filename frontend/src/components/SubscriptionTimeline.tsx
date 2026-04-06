import React, { useMemo, useState, useEffect } from 'react';
import { Tooltip, Modal, Descriptions, Tag, Button, Space, Typography } from 'antd';
import { LeftOutlined, RightOutlined, ZoomInOutlined, ZoomOutOutlined } from '@ant-design/icons';
import type { Subscription, Member } from '@/types';
import { formatPrice, getBillingCycleLabel, getDaysRemaining } from '@/utils';
import { adjustForDarkModeWithContrast } from '@/constants/colors';
import dayjs from 'dayjs';

const { Text } = Typography;

interface SubscriptionTimelineProps {
  subscriptions: Subscription[];
  member: Member;
}

const SubscriptionTimeline: React.FC<SubscriptionTimelineProps> = ({
  subscriptions,
  member,
}) => {
  const [viewRange, setViewRange] = useState<'3m' | '6m' | '12m' | 'all'>('12m');
  const [rangeOffset, setRangeOffset] = useState(0);
  const [selectedSub, setSelectedSub] = useState<Subscription | null>(null);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [isDark, setIsDark] = useState(() => localStorage.getItem('theme-mode') === 'dark');

  useEffect(() => {
    const handler = () => setIsDark(localStorage.getItem('theme-mode') === 'dark');
    window.addEventListener('theme-change', handler);
    return () => window.removeEventListener('theme-change', handler);
  }, []);

  const sortedSubscriptions = useMemo(() => {
    return [...subscriptions].sort((a, b) =>
      dayjs(a.start_date).unix() - dayjs(b.start_date).unix()
    );
  }, [subscriptions]);

  const baseDateRange = useMemo(() => {
    const today = dayjs();
    const allDates = subscriptions.flatMap(s => [dayjs(s.start_date), dayjs(s.end_date)]);

    if (viewRange === 'all') {
      if (allDates.length === 0) {
        return { start: today.subtract(1, 'month'), end: today.add(1, 'month') };
      }
      const minDate = allDates.reduce((min, d) => d.isBefore(min) ? d : min);
      const maxDate = allDates.reduce((max, d) => d.isAfter(max) ? d : max);
      return {
        start: minDate.subtract(1, 'month'),
        end: maxDate.add(1, 'month'),
      };
    }

    const monthCount = viewRange === '3m' ? 3 : viewRange === '6m' ? 6 : 12;
    const earliestStart = allDates.length > 0
      ? allDates.reduce((min, d) => d.isBefore(min) ? d : min)
      : today;

    const rangeStart = earliestStart.isBefore(today.subtract(monthCount / 2, 'month'))
      ? earliestStart.subtract(1, 'month')
      : today.subtract(Math.floor(monthCount / 2), 'month');

    return {
      start: rangeStart,
      end: rangeStart.add(monthCount, 'month'),
    };
  }, [subscriptions, viewRange]);

  const dateRange = useMemo(() => {
    if (viewRange === 'all' || rangeOffset === 0) return baseDateRange;
    const monthCount = viewRange === '3m' ? 3 : viewRange === '6m' ? 6 : 12;
    const offsetMonths = rangeOffset * Math.max(1, Math.floor(monthCount / 2));
    return {
      start: baseDateRange.start.add(offsetMonths, 'month'),
      end: baseDateRange.end.add(offsetMonths, 'month'),
    };
  }, [baseDateRange, viewRange, rangeOffset]);

  const monthLabels = useMemo(() => {
    const result: dayjs.Dayjs[] = [];
    let current = dateRange.start.startOf('month');
    while (current.isBefore(dateRange.end) || current.isSame(dateRange.end, 'month')) {
      result.push(current);
      current = current.add(1, 'month');
    }
    return result;
  }, [dateRange]);

  const totalDays = dateRange.end.diff(dateRange.start, 'day');

  const getPosition = (date: dayjs.Dayjs) => {
    const daysFromStart = date.diff(dateRange.start, 'day');
    return Math.max(0, Math.min(100, (daysFromStart / totalDays) * 100));
  };

  const getSubscriptionColor = (sub: Subscription) => {
    const daysRemaining = getDaysRemaining(sub.end_date);
    if (daysRemaining < 0) return isDark ? adjustForDarkModeWithContrast('#d9d9d9') : '#d9d9d9';
    if (daysRemaining <= member.reminder_days) return isDark ? adjustForDarkModeWithContrast('#fa8c16') : '#fa8c16';
    return isDark ? adjustForDarkModeWithContrast('#52c41a') : '#52c41a';
  };

  const handleBarClick = (sub: Subscription) => {
    setSelectedSub(sub);
    setDetailModalOpen(true);
  };

  const handleZoomIn = () => {
    const order: Array<'3m' | '6m' | '12m' | 'all'> = ['all', '12m', '6m', '3m'];
    const currentIndex = order.indexOf(viewRange);
    if (currentIndex < order.length - 1) {
      setViewRange(order[currentIndex + 1]);
      setRangeOffset(0);
    }
  };

  const handleZoomOut = () => {
    const order: Array<'3m' | '6m' | '12m' | 'all'> = ['3m', '6m', '12m', 'all'];
    const currentIndex = order.indexOf(viewRange);
    if (currentIndex < order.length - 1) {
      setViewRange(order[currentIndex + 1]);
      setRangeOffset(0);
    }
  };

  const shiftRange = (direction: 'left' | 'right') => {
    if (viewRange === 'all') return;
    setRangeOffset(prev => prev + (direction === 'left' ? -1 : 1));
  };

  if (subscriptions.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--ant-color-text-tertiary)' }}>
        暂无订阅记录
      </div>
    );
  }

  return (
    <div>
      {/* 控制栏 */}
      <Space style={{ marginBottom: 16 }} wrap>
        <Text>时间范围:</Text>
        <Button.Group size="small">
          <Button
            type={viewRange === '3m' ? 'primary' : 'default'}
            onClick={() => { setViewRange('3m'); setRangeOffset(0); }}
          >
            3个月
          </Button>
          <Button
            type={viewRange === '6m' ? 'primary' : 'default'}
            onClick={() => { setViewRange('6m'); setRangeOffset(0); }}
          >
            6个月
          </Button>
          <Button
            type={viewRange === '12m' ? 'primary' : 'default'}
            onClick={() => { setViewRange('12m'); setRangeOffset(0); }}
          >
            12个月
          </Button>
          <Button
            type={viewRange === 'all' ? 'primary' : 'default'}
            onClick={() => { setViewRange('all'); setRangeOffset(0); }}
          >
            全部
          </Button>
        </Button.Group>
        <Button
          size="small"
          icon={<ZoomInOutlined />}
          onClick={handleZoomIn}
          disabled={viewRange === '3m'}
        />
        <Button
          size="small"
          icon={<ZoomOutOutlined />}
          onClick={handleZoomOut}
          disabled={viewRange === 'all'}
        />
        <Button
          size="small"
          icon={<LeftOutlined />}
          onClick={() => shiftRange('left')}
          disabled={viewRange === 'all'}
        />
        <Button
          size="small"
          icon={<RightOutlined />}
          onClick={() => shiftRange('right')}
          disabled={viewRange === 'all'}
        />
        {rangeOffset !== 0 && viewRange !== 'all' && (
          <Button size="small" onClick={() => setRangeOffset(0)}>
            回到当前
          </Button>
        )}
      </Space>

      {/* 时间轴 */}
      <div style={{ position: 'relative', overflow: 'hidden' }}>
        {/* 月份刻度 */}
        <div style={{
          display: 'flex',
          borderBottom: '1px solid var(--ant-color-border, #d9d9d9)',
          marginBottom: 8,
          paddingBottom: 4,
        }}>
          {monthLabels.map((month) => (
            <div
              key={month.format('YYYY-MM')}
              style={{
                flex: 1,
                textAlign: 'center',
                fontSize: 12,
                color: 'var(--ant-color-text-secondary, #666)',
              }}
            >
              {month.format('YYYY-MM')}
            </div>
          ))}
        </div>

        {/* 今天标记 */}
        {(() => {
          const todayPos = getPosition(dayjs());
          const todayColor = isDark ? adjustForDarkModeWithContrast('#1890ff') : '#1890ff';
          if (todayPos >= 0 && todayPos <= 100) {
            return (
              <div style={{
                position: 'absolute',
                top: 30,
                bottom: 0,
                left: `${todayPos}%`,
                width: 2,
                background: todayColor,
                zIndex: 10,
              }}>
                <div style={{
                  position: 'absolute',
                  top: -20,
                  left: -20,
                  width: 42,
                  fontSize: 10,
                  color: todayColor,
                  textAlign: 'center',
                }}>
                  今天
                </div>
              </div>
            );
          }
          return null;
        })()}

        {/* 订阅条 */}
        <div style={{ minHeight: sortedSubscriptions.length * 32 + 10 }}>
          {sortedSubscriptions.map((sub) => {
            const startPos = getPosition(dayjs(sub.start_date));
            const endPos = getPosition(dayjs(sub.end_date));
            const width = Math.max(2, endPos - startPos);
            const color = getSubscriptionColor(sub);
            const daysRemaining = getDaysRemaining(sub.end_date);

            return (
              <div
                key={sub.id}
                style={{
                  position: 'relative',
                  height: 32,
                  marginBottom: 2,
                }}
              >
                <div style={{
                  position: 'absolute',
                  left: 0,
                  top: 8,
                  width: 120,
                  fontSize: 12,
                  color: 'var(--ant-color-text, #333)',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}>
                  {sub.level || '标准版'}
                </div>

                <Tooltip
                  title={
                    <div>
                      <div>{sub.level || '标准版'}</div>
                      <div>{sub.start_date} ~ {sub.end_date}</div>
                      <div>{formatPrice(sub.price, sub.currency)} · {getBillingCycleLabel(sub.billing_cycle)}</div>
                      <div>
                        {daysRemaining < 0
                          ? `已过期${Math.abs(daysRemaining)}天`
                          : daysRemaining === 0
                            ? '今天到期'
                            : `${daysRemaining}天后到期`}
                      </div>
                    </div>
                  }
                >
                  <div
                    style={{
                      position: 'absolute',
                      left: `${Math.max(0, startPos)}%`,
                      top: 4,
                      width: `${width}%`,
                      minWidth: 20,
                      height: 24,
                      background: color,
                      borderRadius: 4,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: 10,
                      color: width > 15 ? '#fff' : 'transparent',
                      overflow: 'hidden',
                      transition: 'all 0.2s',
                    }}
                    onClick={() => handleBarClick(sub)}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = 'scaleY(1.1)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'scaleY(1)';
                    }}
                  >
                    {width > 20 && sub.price ? formatPrice(sub.price, sub.currency) : ''}
                  </div>
                </Tooltip>
              </div>
            );
          })}
        </div>
      </div>

      {/* 订阅详情弹窗 */}
      <Modal
        title="订阅详情"
        open={detailModalOpen}
        onCancel={() => setDetailModalOpen(false)}
        footer={[
          <Button key="close" onClick={() => setDetailModalOpen(false)}>
            关闭
          </Button>,
        ]}
        width={500}
      >
        {selectedSub && (
          <Descriptions column={2} bordered size="small">
            <Descriptions.Item label="级别">{selectedSub.level || '标准版'}</Descriptions.Item>
            <Descriptions.Item label="价格">
              {formatPrice(selectedSub.price, selectedSub.currency)}
            </Descriptions.Item>
            <Descriptions.Item label="计费周期">
              {selectedSub.billing_cycle === 'custom'
                ? `${selectedSub.custom_days}天`
                : getBillingCycleLabel(selectedSub.billing_cycle)}
            </Descriptions.Item>
            <Descriptions.Item label="订阅渠道">
              {selectedSub.channel || '-'}
            </Descriptions.Item>
            <Descriptions.Item label="有效期" span={2}>
              {selectedSub.start_date} ~ {selectedSub.end_date}
            </Descriptions.Item>
            <Descriptions.Item label="状态">
              <Tag color={getSubscriptionColor(selectedSub)}>
                {getDaysRemaining(selectedSub.end_date) < 0
                  ? `已过期${Math.abs(getDaysRemaining(selectedSub.end_date))}天`
                  : getDaysRemaining(selectedSub.end_date) === 0
                    ? '今天到期'
                    : `${getDaysRemaining(selectedSub.end_date)}天后到期`}
              </Tag>
            </Descriptions.Item>
            <Descriptions.Item label="日均价格">
              {formatPrice(
                selectedSub.price / (selectedSub.billing_cycle === 'custom'
                  ? (selectedSub.custom_days || 30)
                  : selectedSub.billing_cycle === 'monthly' ? 30
                  : selectedSub.billing_cycle === 'quarterly' ? 90
                  : 365),
                selectedSub.currency
              )}
            </Descriptions.Item>
            {selectedSub.notes && (
              <Descriptions.Item label="备注" span={2}>
                {selectedSub.notes}
              </Descriptions.Item>
            )}
          </Descriptions>
        )}
      </Modal>
    </div>
  );
};

export default React.memo(SubscriptionTimeline);
