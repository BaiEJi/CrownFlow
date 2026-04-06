import React, { useMemo, useState, useEffect } from 'react';
import { Card, Radio, Progress, Space, Tag, Empty, Spin, Typography, Button } from 'antd';
import { TrophyOutlined, FireOutlined, BarChartOutlined, ReloadOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { memberApi } from '@/services/api';
import { formatPrice } from '@/utils';
import { adjustForDarkModeWithContrast } from '@/constants/colors';
import type { Member } from '@/types';
import { useApi } from '@/hooks';

const { Text } = Typography;

type RankDimension = 'total_spending' | 'avg_monthly' | 'subscription_count' | 'total_duration_days';

interface MemberWithExtra extends Member {
  avg_monthly: number;
  total_duration_days: number;
}

const MemberRankingCard: React.FC = () => {
  const navigate = useNavigate();
  const [dimension, setDimension] = useState<RankDimension>('total_spending');
  const [isDark, setIsDark] = useState(
    () => localStorage.getItem('theme-mode') === 'dark'
  );

  useEffect(() => {
    const handler = () => {
      setIsDark(localStorage.getItem('theme-mode') === 'dark');
    };
    window.addEventListener('theme-change', handler);
    return () => window.removeEventListener('theme-change', handler);
  }, []);

  const {
    data: membersData,
    loading,
    error,
    execute: fetchMembers,
  } = useApi(
    () => memberApi.getAll({ page: 1, page_size: 1000, status: undefined }),
    { immediate: true }
  );

  const members = useMemo(() => {
    return membersData?.data?.data?.items || [];
  }, [membersData]);

  const rankedMembers = useMemo(() => {
    const sorted: MemberWithExtra[] = [...members].map((m: Member) => {
      const avgMonthly = m.total_spending && m.subscription_count 
        ? m.total_spending / Math.max(1, m.subscription_count)
        : 0;
      return {
        ...m,
        avg_monthly: avgMonthly,
        total_duration_days: (m as MemberWithExtra).total_duration_days || 0,
      };
    });

    sorted.sort((a, b) => {
      if (dimension === 'total_spending') return b.total_spending - a.total_spending;
      if (dimension === 'avg_monthly') return b.avg_monthly - a.avg_monthly;
      if (dimension === 'subscription_count') return b.subscription_count - a.subscription_count;
      if (dimension === 'total_duration_days') return b.total_duration_days - a.total_duration_days;
      return 0;
    });

    return sorted.slice(0, 10);
  }, [members, dimension]);

  const maxValue = useMemo(() => {
    if (rankedMembers.length === 0) return 0;
    return Math.max(...rankedMembers.map((m) => {
      if (dimension === 'total_spending') return m.total_spending;
      if (dimension === 'avg_monthly') return m.avg_monthly;
      if (dimension === 'subscription_count') return m.subscription_count;
      if (dimension === 'total_duration_days') return m.total_duration_days;
      return 0;
    }));
  }, [rankedMembers, dimension]);

  const getValue = (member: MemberWithExtra) => {
    if (dimension === 'total_spending') return member.total_spending;
    if (dimension === 'avg_monthly') return member.avg_monthly;
    if (dimension === 'subscription_count') return member.subscription_count;
    if (dimension === 'total_duration_days') return member.total_duration_days;
    return 0;
  };

  const formatDuration = (days: number) => {
    if (days >= 365) {
      const years = Math.floor(days / 365);
      const remainDays = days % 365;
      return remainDays > 0 ? `${years}年${remainDays}天` : `${years}年`;
    }
    if (days >= 30) {
      const months = Math.floor(days / 30);
      const remainDays = days % 30;
      return remainDays > 0 ? `${months}个月${remainDays}天` : `${months}个月`;
    }
    return `${days}天`;
  };

  const getFormatValue = (member: MemberWithExtra) => {
    if (dimension === 'total_spending') return formatPrice(member.total_spending);
    if (dimension === 'avg_monthly') return formatPrice(member.avg_monthly);
    if (dimension === 'subscription_count') return `${member.subscription_count} 次`;
    if (dimension === 'total_duration_days') return formatDuration(member.total_duration_days);
    return '';
  };

  const getRankIcon = (rank: number) => {
    const goldColor = isDark ? adjustForDarkModeWithContrast('#faad14') : '#faad14';
    const silverColor = isDark ? adjustForDarkModeWithContrast('#8c8c8c') : '#8c8c8c';
    const bronzeColor = isDark ? adjustForDarkModeWithContrast('#b97d4f') : '#b97d4f';
    const otherColor = isDark ? '#999' : '#666';
    
    if (rank === 1) return <TrophyOutlined style={{ color: goldColor, fontSize: 18 }} />;
    if (rank === 2) return <TrophyOutlined style={{ color: silverColor, fontSize: 16 }} />;
    if (rank === 3) return <TrophyOutlined style={{ color: bronzeColor, fontSize: 14 }} />;
    return <span style={{ color: otherColor, fontSize: 14 }}>{rank}</span>;
  };

  const getBarColor = (rank: number) => {
    const colors = {
      first: isDark ? adjustForDarkModeWithContrast('#cf1322') : '#cf1322',
      second: isDark ? adjustForDarkModeWithContrast('#fa541c') : '#fa541c',
      third: isDark ? adjustForDarkModeWithContrast('#fa8c16') : '#fa8c16',
      fourth: isDark ? adjustForDarkModeWithContrast('#1890ff') : '#1890ff',
      other: isDark ? adjustForDarkModeWithContrast('#52c41a') : '#52c41a',
    };
    
    if (rank === 1) return colors.first;
    if (rank === 2) return colors.second;
    if (rank === 3) return colors.third;
    if (rank <= 5) return colors.fourth;
    return colors.other;
  };

  if (loading) {
    return (
      <Card>
        <Spin />
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <Empty description="加载失败" />
      </Card>
    );
  }

  return (
    <Card
      title={
        <Space>
          <BarChartOutlined />
          会员支出排行榜
        </Space>
      }
      extra={
        <Button size="small" icon={<ReloadOutlined />} onClick={fetchMembers} loading={loading}>
          刷新
        </Button>
      }
    >
      <Space style={{ marginBottom: 16 }}>
        <Radio.Group
          value={dimension}
          onChange={(e) => setDimension(e.target.value)}
          buttonStyle="solid"
          size="small"
        >
          <Radio.Button value="total_spending">累计花费</Radio.Button>
          <Radio.Button value="avg_monthly">平均订阅</Radio.Button>
          <Radio.Button value="subscription_count">订阅次数</Radio.Button>
          <Radio.Button value="total_duration_days">累计时长</Radio.Button>
        </Radio.Group>
      </Space>

      {rankedMembers.length === 0 ? (
        <Empty description="暂无会员数据" image={Empty.PRESENTED_IMAGE_SIMPLE} />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {rankedMembers.map((member, index) => {
            const rank = index + 1;
            const value = getValue(member);
            const percentage = maxValue > 0 ? (value / maxValue) * 100 : 0;

            return (
              <div
                key={member.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                  cursor: 'pointer',
                  padding: '8px 0',
                  borderBottom: rank < rankedMembers.length ? `1px solid ${isDark ? '#424242' : '#f0f0f0'}` : 'none',
                }}
                onClick={() => navigate(`/members/${member.id}`)}
              >
                <div style={{ width: 30, textAlign: 'center' }}>
                  {getRankIcon(rank)}
                </div>

                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                    <span style={{ fontSize: 14, fontWeight: rank <= 3 ? 600 : 400 }}>
                      {member.name}
                    </span>
                    {member.category && (
                      <Tag 
                        color={isDark && member.category.color ? adjustForDarkModeWithContrast(member.category.color) : (member.category.color || 'blue')} 
                        style={{ marginLeft: 4, fontSize: 11 }}
                      >
                        {member.category.icon} {member.category.name}
                      </Tag>
                    )}
{rank <= 3 && (dimension === 'total_spending' || dimension === 'total_duration_days') && (
                       <FireOutlined style={{ color: isDark ? adjustForDarkModeWithContrast('#cf1322') : '#cf1322', fontSize: 12 }} />
                     )}
                  </div>

                  <Progress
                    percent={percentage}
                    strokeColor={getBarColor(rank)}
                    showInfo={false}
                    size="small"
                    style={{ margin: 0 }}
                  />
                </div>

                <div style={{ width: dimension === 'total_duration_days' ? 120 : 100, textAlign: 'right' }}>
                  <Text strong style={{ fontSize: 14, color: getBarColor(rank) }}>
                    {getFormatValue(member)}
                  </Text>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </Card>
  );
};

export default React.memo(MemberRankingCard);