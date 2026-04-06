import React, { useMemo, useState, useCallback, useEffect } from 'react';
import { Card, Badge, Modal, List, Tag, Space, Button, Typography, Empty, Tooltip } from 'antd';
import { LeftOutlined, RightOutlined, CalendarOutlined, ReloadOutlined, WarningOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import dayjs from 'dayjs';
import { Solar } from 'lunar-javascript';
import { reminderApi } from '@/services/api';
import { formatPrice } from '@/utils';
import { adjustForDarkModeWithContrast } from '@/constants/colors';
import { useHolidays } from '@/hooks';
import type { ReminderItem } from '@/types';

const { Text } = Typography;

interface ExpiryCalendarProps {
  onRefresh?: () => void;
}

interface CalendarItem {
  member_id: number;
  member_name: string;
  category_name?: string;
  category_icon?: string;
  category_color?: string;
  level?: string;
  end_date: string;
  price: number;
  currency: string;
  days_remaining: number;
}

const ExpiryCalendar: React.FC<ExpiryCalendarProps> = ({ onRefresh }) => {
  const navigate = useNavigate();
  const [currentMonth, setCurrentMonth] = useState(dayjs());
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [expiryItems, setExpiryItems] = useState<CalendarItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [isDark, setIsDark] = useState(() => localStorage.getItem('theme-mode') === 'dark');

  useEffect(() => {
    const handler = () => setIsDark(localStorage.getItem('theme-mode') === 'dark');
    window.addEventListener('theme-change', handler);
    return () => window.removeEventListener('theme-change', handler);
  }, []);

  const { getDayInfo } = useHolidays(currentMonth.year());

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const response = await reminderApi.getAll();
      const reminders = response.data.data.reminders as ReminderItem[];
      const items: CalendarItem[] = reminders.map(r => ({
        member_id: r.member_id,
        member_name: r.member_name,
        category_name: r.category_name,
        category_icon: r.category_icon,
        category_color: r.category_color,
        level: r.level,
        end_date: r.end_date,
        price: r.price,
        currency: r.currency,
        days_remaining: r.days_remaining,
      }));
      setExpiryItems(items);
    } catch (err) {
      console.error('Failed to fetch reminders:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, []);

  const expiryDataByDate = useMemo(() => {
    const data: Record<string, CalendarItem[]> = {};
    
    for (const item of expiryItems) {
      const endDate = item.end_date;
      if (!data[endDate]) {
        data[endDate] = [];
      }
      data[endDate].push(item);
    }
    
    return data;
  }, [expiryItems]);

  const monthDays = useMemo(() => {
    const daysInMonth = currentMonth.daysInMonth();
    const days: dayjs.Dayjs[] = [];
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(currentMonth.date(i));
    }
    return days;
  }, [currentMonth]);

  const weekDays = ['周一', '周二', '周三', '周四', '周五', '周六', '周日'];

  const prevMonth = useCallback(() => {
    setCurrentMonth(currentMonth.subtract(1, 'month'));
  }, [currentMonth]);

  const nextMonth = useCallback(() => {
    setCurrentMonth(currentMonth.add(1, 'month'));
  }, [currentMonth]);

  const goToToday = useCallback(() => {
    setCurrentMonth(dayjs());
  }, []);

  const handleDateClick = useCallback((date: dayjs.Dayjs) => {
    const dateStr = date.format('YYYY-MM-DD');
    if (expiryDataByDate[dateStr] && expiryDataByDate[dateStr].length > 0) {
      setSelectedDate(dateStr);
      setModalOpen(true);
    }
  }, [expiryDataByDate]);

  const getLunarDay = useCallback((day: dayjs.Dayjs) => {
    try {
      const solar = Solar.fromYmd(day.year(), day.month() + 1, day.date());
      const lunar = solar.getLunar();
      const festivals = lunar.getFestivals();
      const otherFestivals = lunar.getOtherFestivals();
      if (festivals.length > 0) return festivals[0];
      if (otherFestivals.length > 0) return otherFestivals[0];
      const dayInChinese = lunar.getDayInChinese();
      if (day.date() === 1) return lunar.getMonthInChinese() + '月';
      return dayInChinese;
    } catch {
      return '';
    }
  }, []);

  const getLunarColor = useCallback((lunarText: string) => {
    if (!lunarText) return isDark ? 'rgba(255,255,255,0.45)' : '#999';
    if (lunarText.includes('月') && lunarText.length <= 3) return isDark ? '#ff7875' : '#cf1322';
    if (['春节', '元宵', '端午', '七夕', '中秋', '重阳', '冬至', '腊八', '除夕', '清明'].some(f => lunarText.includes(f))) return isDark ? '#ff7875' : '#cf1322';
    return isDark ? 'rgba(255,255,255,0.45)' : '#999';
  }, [isDark]);

  const getBadgeColor = (items: CalendarItem[] | undefined) => {
    if (!items || items.length === 0) return null;
    
    const hasExpired = items.some(i => i.days_remaining < 0);
    const hasExpiringSoon = items.some(i => i.days_remaining >= 0 && i.days_remaining <= 7);
    
    if (hasExpired) return '#d9d9d9';
    if (hasExpiringSoon) return '#fa8c16';
    return '#52c41a';
  };

  const selectedDateItems = useMemo(() => {
    if (!selectedDate) return [];
    return expiryDataByDate[selectedDate] || [];
  }, [selectedDate, expiryDataByDate]);

  const getDayCellBackground = (day: dayjs.Dayjs) => {
    const info = getDayInfo(day);
    if (info.isHoliday) return isDark ? '#2a1215' : '#fff1f0';
    if (info.isRestDay) return isDark ? '#141d2c' : '#f0f5ff';
    return 'transparent';
  };

  const getDayCellBorder = (day: dayjs.Dayjs) => {
    const info = getDayInfo(day);
    if (info.isHoliday) return `1px solid ${isDark ? '#58181c' : '#ffa39e'}`;
    if (info.isRestDay && !info.isHoliday) return `1px solid ${isDark ? '#1d3966' : '#adc6ff'}`;
    return `1px solid ${isDark ? '#303030' : '#f0f0f0'}`;
  };

  const renderDayCell = (day: dayjs.Dayjs) => {
    const dateStr = day.format('YYYY-MM-DD');
    const items = expiryDataByDate[dateStr];
    const isToday = day.isSame(dayjs(), 'day');
    const count = items?.length || 0;
    const color = getBadgeColor(items);
    const dayInfo = getDayInfo(day);
    const lunarText = getLunarDay(day);
    const lunarColor = getLunarColor(lunarText);

    const bg = isToday ? (isDark ? '#12201a' : '#f6ffed') : getDayCellBackground(day);
    const border = isToday ? `2px solid ${isDark ? '#306230' : '#52c41a'}` : getDayCellBorder(day);

    let dateTextColor = isDark ? 'rgba(255,255,255,0.85)' : '#333';
    if (isToday) dateTextColor = isDark ? '#73d13d' : '#389e0d';
    else if (dayInfo.isHoliday) dateTextColor = isDark ? '#ff7875' : '#cf1322';
    else if (dayInfo.isRestDay) dateTextColor = isDark ? '#69b1ff' : '#1890ff';

    const holidayLabel = dayInfo.holidayName
      ? (dayInfo.isHoliday ? dayInfo.holidayName : `补班`)
      : undefined;

    const showLunar = !holidayLabel && lunarText;

    return (
      <div
        style={{
          height: 72,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          border,
          borderRadius: 4,
          cursor: count > 0 ? 'pointer' : 'default',
          background: bg,
          transition: 'all 0.2s',
          position: 'relative',
          padding: '2px 0',
        }}
        onClick={() => handleDateClick(day)}
        onMouseEnter={(e) => {
          if (count > 0) {
            e.currentTarget.style.background = isToday
              ? (isDark ? '#1a3a24' : '#d9f7be')
              : (isDark ? '#262626' : '#f5f5f5');
          }
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = bg;
        }}
      >
        <Text style={{ fontSize: 12, color: dateTextColor, fontWeight: isToday ? 700 : 400, lineHeight: '16px' }}>
          {day.format('D')}
        </Text>
        {holidayLabel && (
          <Tooltip title={dayInfo.holidayName || ''}>
            <Text
              style={{
                fontSize: 9,
                lineHeight: '12px',
                color: dayInfo.isHoliday ? (isDark ? '#ff7875' : '#cf1322') : (isDark ? '#ffa940' : '#fa8c16'),
                maxWidth: '100%',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
            >
              {holidayLabel}
            </Text>
          </Tooltip>
        )}
        {showLunar && (
          <Text
            style={{
              fontSize: 9,
              lineHeight: '12px',
              color: lunarColor,
              maxWidth: '100%',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
            title={lunarText}
          >
            {lunarText}
          </Text>
        )}
        {count > 0 && (
          <Tooltip title={`${count} 个订阅到期`} placement="top">
            <Badge
              count={count}
              size="small"
              style={{ backgroundColor: color ?? undefined, position: 'absolute', top: 2, right: 4 }}
              overflowCount={99}
            />
          </Tooltip>
        )}
      </div>
    );
  };

  return (
    <Card
      title={
        <Space>
          <CalendarOutlined />
          订阅到期日历
        </Space>
      }
      extra={
        <Space>
          <Button size="small" onClick={goToToday}>
            今天
          </Button>
          <Button 
            size="small" 
            icon={<ReloadOutlined />} 
            onClick={() => {
              fetchData();
              onRefresh?.();
            }} 
            loading={loading}
          >
            刷新
          </Button>
        </Space>
      }
      loading={loading}
    >
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center',
        marginBottom: 16,
        gap: 16,
      }}>
        <Button icon={<LeftOutlined />} onClick={prevMonth} />
        <Text strong style={{ fontSize: 16 }}>
          {currentMonth.format('YYYY年MM月')}
        </Text>
        <Button icon={<RightOutlined />} onClick={nextMonth} />
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(7, 1fr)',
        gap: 4,
        marginBottom: 8,
      }}>
        {weekDays.map((wd, idx) => (
          <div 
            key={wd}
            style={{
              textAlign: 'center',
              fontSize: 12,
              color: idx >= 5 ? (isDark ? '#69b1ff' : '#1890ff') : (isDark ? 'rgba(255,255,255,0.65)' : '#666'),
              padding: '4px 0',
            }}
          >
            {wd}
          </div>
        ))}
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(7, 1fr)',
        gap: 4,
      }}>
        {Array.from({ length: (monthDays[0].day() - 1 + 7) % 7 }).map((_, i) => (
          <div key={`empty-${i}`} style={{ height: 72 }} />
        ))}
        
        {monthDays.map((day) => renderDayCell(day))}
      </div>

      <div style={{ display: 'flex', gap: 16, marginTop: 12, justifyContent: 'center' }}>
        <Space size={4}>
          <div style={{ width: 12, height: 12, borderRadius: 2, background: isDark ? '#2a1215' : '#fff1f0', border: `1px solid ${isDark ? '#58181c' : '#ffa39e'}` }} />
          <Text style={{ fontSize: 11, color: isDark ? 'rgba(255,255,255,0.45)' : '#999' }}>节假日</Text>
        </Space>
        <Space size={4}>
          <div style={{ width: 12, height: 12, borderRadius: 2, background: isDark ? '#141d2c' : '#f0f5ff', border: `1px solid ${isDark ? '#1d3966' : '#adc6ff'}` }} />
          <Text style={{ fontSize: 11, color: isDark ? 'rgba(255,255,255,0.45)' : '#999' }}>休息日</Text>
        </Space>
        <Space size={4}>
          <div style={{ width: 12, height: 12, borderRadius: 2, background: isDark ? '#141414' : '#fff', border: `1px solid ${isDark ? '#303030' : '#f0f0f0'}` }} />
          <Text style={{ fontSize: 11, color: isDark ? 'rgba(255,255,255,0.45)' : '#999' }}>工作日</Text>
        </Space>
      </div>

      <Modal
        title={
          <Space>
            <WarningOutlined style={{ color: isDark ? adjustForDarkModeWithContrast('#faad14') : '#faad14' }} />
            {selectedDate} 到期的订阅
          </Space>
        }
        open={modalOpen}
        onCancel={() => setModalOpen(false)}
        footer={[
          <Button key="close" onClick={() => setModalOpen(false)}>
            关闭
          </Button>,
        ]}
        width={600}
      >
        {selectedDateItems.length === 0 ? (
          <Empty description="当日无到期订阅" />
        ) : (
          <List
            dataSource={selectedDateItems}
            renderItem={(item) => {
              const isExpired = item.days_remaining < 0;
              
              return (
                <List.Item
                  onClick={() => navigate(`/members/${item.member_id}`)}
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
                      <Space>
                        {item.category_name && (
                          <Tag color="blue">
                            {item.category_name}
                          </Tag>
                        )}
                        <Text type="secondary">
                          {formatPrice(item.price, item.currency)}
                        </Text>
                      </Space>
                    }
                  />
                  <Tag color={isExpired ? 'default' : 'orange'}>
                    {isExpired ? `已过期${Math.abs(item.days_remaining)}天` : '当日到期'}
                  </Tag>
                </List.Item>
              );
            }}
          />
        )}
      </Modal>
    </Card>
  );
};

export default React.memo(ExpiryCalendar);
