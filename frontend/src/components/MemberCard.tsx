import React from 'react';
import { Card, Tag, Space, Button, Tooltip } from 'antd';
import { EyeOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import type { Member } from '@/types';
import { formatPrice, getDaysRemaining } from '@/utils';
import { adjustForDarkModeWithContrast } from '@/constants/colors';

interface MemberCardProps {
  member: Member;
  onView: (id: number) => void;
  onEdit: (member: Member) => void;
  onDelete: (id: number) => void;
}

const MemberCard: React.FC<MemberCardProps> = ({ member, onView, onEdit, onDelete }) => {
  const [isDark, setIsDark] = React.useState(() => localStorage.getItem('theme-mode') === 'dark');
  
  React.useEffect(() => {
    const handler = () => setIsDark(localStorage.getItem('theme-mode') === 'dark');
    window.addEventListener('theme-change', handler);
    return () => window.removeEventListener('theme-change', handler);
  }, []);

  const daysRemaining = member.latest_subscription
    ? getDaysRemaining(member.latest_subscription.end_date)
    : null;

  const isExpired = daysRemaining !== null && daysRemaining < 0;
  const isExpiringSoon = daysRemaining !== null && daysRemaining >= 0 && daysRemaining <= member.reminder_days;

  const getBorderColor = () => {
    if (isExpired) return isDark ? adjustForDarkModeWithContrast('#d9d9d9') : '#d9d9d9';
    if (isExpiringSoon) return isDark ? adjustForDarkModeWithContrast('#fa8c16') : '#fa8c16';
    return isDark ? adjustForDarkModeWithContrast('#52c41a') : '#52c41a';
  };

  const getStatusTag = () => {
    if (isExpired) {
      return <Tag color="default">已过期 {Math.abs(daysRemaining!)} 天</Tag>;
    }
    if (daysRemaining === 0) {
      return <Tag color="red">今天到期</Tag>;
    }
    if (isExpiringSoon) {
      return <Tag color="orange">{daysRemaining} 天后到期</Tag>;
    }
    if (daysRemaining !== null) {
      return <Tag color="green">{daysRemaining} 天后到期</Tag>;
    }
    return <Tag color="default">无订阅</Tag>;
  };

  return (
    <Card
      hoverable
      style={{
        width: '100%',
        borderLeft: `4px solid ${getBorderColor()}`,
        cursor: 'pointer',
      }}
      onClick={() => onView(member.id)}
      styles={{ body: { padding: '16px' } }}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', marginBottom: 12 }}>
        <span style={{ fontSize: 32, marginRight: 12 }}>
          {member.category?.icon || '📦'}
        </span>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 16, fontWeight: 600, marginBottom: 4 }}>
            {member.name}
          </div>
          {member.category && (
            <Tag color={isDark && member.category.color ? adjustForDarkModeWithContrast(member.category.color) : (member.category.color || 'blue')} style={{ marginRight: 0 }}>
              {member.category.name}
            </Tag>
          )}
        </div>
      </div>

      {member.latest_subscription && (
        <div style={{ marginBottom: 12 }}>
          <div style={{ fontSize: 14, color: 'var(--ant-color-text-secondary)', marginBottom: 4 }}>
            {member.latest_subscription.level || '标准版'}
          </div>
          <div style={{ fontSize: 18, fontWeight: 600, color: isDark ? adjustForDarkModeWithContrast('#cf1322') : '#cf1322' }}>
            {formatPrice(member.latest_subscription.price, member.latest_subscription.currency)}
            <span style={{ fontSize: 12, color: 'var(--ant-color-text-tertiary)', marginLeft: 8 }}>
              /{member.latest_subscription.billing_cycle === 'monthly' ? '月' :
                member.latest_subscription.billing_cycle === 'quarterly' ? '季' :
                member.latest_subscription.billing_cycle === 'yearly' ? '年' : '周期'}
            </span>
          </div>
        </div>
      )}

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
        {getStatusTag()}
        <div style={{ fontSize: 12, color: 'var(--ant-color-text-tertiary)' }}>
          累计: {formatPrice(member.total_spending)}
        </div>
      </div>

      <Space style={{ width: '100%', justifyContent: 'flex-end' }}>
        <Tooltip title="查看详情">
          <Button
            type="text"
            size="small"
            icon={<EyeOutlined />}
            onClick={(e) => {
              e.stopPropagation();
              onView(member.id);
            }}
          />
        </Tooltip>
        <Tooltip title="编辑">
          <Button
            type="text"
            size="small"
            icon={<EditOutlined />}
            onClick={(e) => {
              e.stopPropagation();
              onEdit(member);
            }}
          />
        </Tooltip>
        <Tooltip title="删除">
          <Button
            type="text"
            size="small"
            danger
            icon={<DeleteOutlined />}
            onClick={(e) => {
              e.stopPropagation();
              onDelete(member.id);
            }}
          />
        </Tooltip>
      </Space>
    </Card>
  );
};

export default React.memo(MemberCard);