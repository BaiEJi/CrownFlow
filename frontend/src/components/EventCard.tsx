/**
 * EventCard 事件卡片组件
 *
 * 展示单个事件的详细信息，包括时间、地点、背景、过程、结果和反思。
 */

import React, { useState, useMemo, useEffect } from 'react';
import { Card, Tag, Space, Button, Collapse, Empty, Popconfirm, message } from 'antd';
import { EditOutlined, DeleteOutlined, PlusOutlined, ClockCircleOutlined, EnvironmentOutlined } from '@ant-design/icons';
import type { JournalEvent, Reflection } from '@/types/journal';
import { REFLECTION_TYPE_LABELS, REFLECTION_TYPE_COLORS } from '@/types/journal';

interface EventCardProps {
  event: JournalEvent;
  onEdit: (event: JournalEvent) => void;
  onDelete: (eventId: number) => void;
  onAddReflection: (eventId: number) => void;
  onEditReflection: (reflection: Reflection) => void;
  onDeleteReflection: (reflectionId: number) => void;
}

const EventCard: React.FC<EventCardProps> = ({
  event,
  onEdit,
  onDelete,
  onAddReflection,
  onEditReflection,
  onDeleteReflection,
}) => {
  const [expanded, setExpanded] = useState(false);
  const [isDark, setIsDark] = useState(() => localStorage.getItem('theme-mode') === 'dark');

  useEffect(() => {
    const handler = () => setIsDark(localStorage.getItem('theme-mode') === 'dark');
    window.addEventListener('theme-change', handler);
    return () => window.removeEventListener('theme-change', handler);
  }, []);

  const timeDisplay = useMemo(() => {
    if (event.start_time && event.end_time) {
      return `${event.start_time} - ${event.end_time}`;
    }
    if (event.start_time) {
      return event.start_time;
    }
    return null;
  }, [event.start_time, event.end_time]);

  const reflections = event.reflections || [];

  const groupedReflections = useMemo(() => {
    const groups: Record<string, Reflection[]> = {};
    reflections.forEach((r) => {
      const key = r.type === 'custom' ? r.custom_type_name || '自定义' : r.type;
      if (!groups[key]) groups[key] = [];
      groups[key].push(r);
    });
    return groups;
  }, [reflections]);

  const handleDeleteReflection = async (reflectionId: number) => {
    try {
      onDeleteReflection(reflectionId);
    } catch {
      message.error('删除反思失败');
    }
  };

  return (
    <Card
      size="small"
      title={
        <Space>
          <span style={{ fontWeight: 600 }}>{event.title}</span>
          {timeDisplay && (
            <Tag icon={<ClockCircleOutlined />} color="blue">
              {timeDisplay}
            </Tag>
          )}
          {event.location && (
            <Tag icon={<EnvironmentOutlined />} color="geekblue">
              {event.location}
            </Tag>
          )}
        </Space>
      }
      extra={
        <Space size="small">
          <Button type="text" size="small" icon={<EditOutlined />} onClick={() => onEdit(event)}>
            编辑
          </Button>
          <Popconfirm
            title="确定删除该事件吗？"
            description="将同时删除所有反思"
            onConfirm={() => onDelete(event.id)}
            okText="确定"
            cancelText="取消"
          >
            <Button type="text" size="small" danger icon={<DeleteOutlined />}>
              删除
            </Button>
          </Popconfirm>
        </Space>
      }
      style={{ marginBottom: 12 }}
    >
      <Collapse
        ghost
        activeKey={expanded ? ['1'] : []}
        onChange={() => setExpanded(!expanded)}
        items={[
          {
            key: '1',
            label: expanded ? '收起详情' : '展开详情',
            children: (
              <div>
                {event.background && (
                  <div style={{ marginBottom: 8 }}>
                    <div style={{ fontWeight: 500, marginBottom: 4 }}>背景</div>
                    <div style={{ color: 'var(--ant-color-text-secondary)', whiteSpace: 'pre-wrap' }}>{event.background}</div>
                  </div>
                )}

                {event.process && (
                  <div style={{ marginBottom: 8 }}>
                    <div style={{ fontWeight: 500, marginBottom: 4 }}>过程</div>
                    <div style={{ color: 'var(--ant-color-text-secondary)', whiteSpace: 'pre-wrap' }}>{event.process}</div>
                  </div>
                )}

                {event.result && (
                  <div style={{ marginBottom: 8 }}>
                    <div style={{ fontWeight: 500, marginBottom: 4 }}>结果</div>
                    <div style={{ color: 'var(--ant-color-text-secondary)', whiteSpace: 'pre-wrap' }}>{event.result}</div>
                  </div>
                )}

                <div style={{ marginTop: 12, borderTop: `1px solid ${isDark ? '#424242' : '#f0f0f0'}`, paddingTop: 12 }}>
                  <div style={{ fontWeight: 500, marginBottom: 8 }}>
                    反思 ({reflections.length})
                  </div>

                  {reflections.length === 0 ? (
                    <Empty description="暂无反思" image={Empty.PRESENTED_IMAGE_SIMPLE} />
                  ) : (
                    <Space direction="vertical" style={{ width: '100%' }}>
                      {Object.entries(groupedReflections).map(([type, items]) => (
                        <div key={type}>
                          <Tag color={REFLECTION_TYPE_COLORS[type] || 'purple'}>
                            {REFLECTION_TYPE_LABELS[type] || type}
                          </Tag>
                          {items.map((r) => (
                            <div
                              key={r.id}
                              style={{
                                padding: '8px 12px',
                                background: isDark ? '#1f1f1f' : '#fafafa',
                                borderRadius: 4,
                                marginTop: 4,
                                position: 'relative',
                              }}
                            >
                              <div style={{ whiteSpace: 'pre-wrap' }}>{r.content}</div>
                              <Space style={{ marginTop: 4, position: 'absolute', right: 8, top: 4 }}>
                                <Button
                                  type="text"
                                  size="small"
                                  icon={<EditOutlined />}
                                  onClick={() => onEditReflection(r)}
                                />
                                <Popconfirm
                                  title="确定删除该反思吗？"
                                  onConfirm={() => handleDeleteReflection(r.id)}
                                  okText="确定"
                                  cancelText="取消"
                                >
                                  <Button type="text" size="small" danger icon={<DeleteOutlined />} />
                                </Popconfirm>
                              </Space>
                            </div>
                          ))}
                        </div>
                      ))}
                    </Space>
                  )}

                  <Button
                    type="dashed"
                    icon={<PlusOutlined />}
                    onClick={() => onAddReflection(event.id)}
                    style={{ marginTop: 8, width: '100%' }}
                  >
                    添加反思
                  </Button>
                </div>
              </div>
            ),
          },
        ]}
      />
    </Card>
  );
};

export default React.memo(EventCard);