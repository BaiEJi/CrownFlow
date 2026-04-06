/**
 * Journal 每日经验汇总页面
 *
 * 提供日记的增删改查功能，支持日期选择、事件管理、反思编辑。
 */

import React, { useState, useCallback, useEffect, useMemo } from 'react';
import {
  Card,
  DatePicker,
  Button,
  Space,
  Select,
  Input,
  Empty,
  Spin,
  Alert,
  Tag,
  Modal,
  message,
  Popconfirm,
} from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  ReloadOutlined,
  SmileOutlined,
} from '@ant-design/icons';
import dayjs from 'dayjs';
import type { Dayjs } from 'dayjs';
import type { Journal, JournalEvent, Reflection, EventCreate, EventUpdate, ReflectionCreate, ReflectionUpdate, JournalCreate, JournalUpdate } from '@/types/journal';
import { MOOD_OPTIONS } from '@/types/journal';
import { journalService } from '@/services/journalApi';
import EventCard from '@/components/EventCard';
import EventModal from '@/components/EventModal';
import ReflectionModal from '@/components/ReflectionModal';

const JournalPage: React.FC = () => {
  const [selectedDate, setSelectedDate] = useState<Dayjs>(dayjs());
  const [journal, setJournal] = useState<Journal | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [eventModalOpen, setEventModalOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<JournalEvent | null>(null);

  const [reflectionModalOpen, setReflectionModalOpen] = useState(false);
  const [editingReflection, setEditingReflection] = useState<Reflection | null>(null);
  const [currentEventIdForReflection, setCurrentEventIdForReflection] = useState<number | null>(null);

  const [isDark, setIsDark] = useState(() => localStorage.getItem('theme-mode') === 'dark');

  useEffect(() => {
    const handler = () => setIsDark(localStorage.getItem('theme-mode') === 'dark');
    window.addEventListener('theme-change', handler);
    return () => window.removeEventListener('theme-change', handler);
  }, []);

  const [journalInfoModalOpen, setJournalInfoModalOpen] = useState(false);
  const [journalFormValues, setJournalFormValues] = useState<{
    mood?: string;
    weather?: string;
    summary?: string;
  }>({});

  const dateStr = useMemo(() => selectedDate.format('YYYY-MM-DD'), [selectedDate]);

  const fetchJournal = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await journalService.getJournalByDate(dateStr);
      setJournal(response.data.data);
    } catch {
      setJournal(null);
    } finally {
      setLoading(false);
    }
  }, [dateStr]);

  useEffect(() => {
    fetchJournal();
  }, [fetchJournal]);

  const handleDateChange = useCallback((date: Dayjs | null) => {
    if (date) {
      setSelectedDate(date);
    }
  }, []);

  const handleCreateJournal = useCallback(async () => {
    try {
      setLoading(true);
      const data: JournalCreate = {
        date: dateStr,
        ...journalFormValues,
      };
      const response = await journalService.createJournal(data);
      setJournal(response.data.data);
      setJournalInfoModalOpen(false);
      message.success('日记创建成功');
    } catch {
      message.error('创建日记失败');
    } finally {
      setLoading(false);
    }
  }, [dateStr, journalFormValues]);

  const handleUpdateJournal = useCallback(async () => {
    if (!journal) return;
    try {
      setLoading(true);
      const data: JournalUpdate = journalFormValues;
      const response = await journalService.updateJournal(journal.id, data);
      setJournal(response.data.data);
      setJournalInfoModalOpen(false);
      message.success('日记更新成功');
    } catch {
      message.error('更新日记失败');
    } finally {
      setLoading(false);
    }
  }, [journal, journalFormValues]);

  const handleDeleteJournal = useCallback(async () => {
    if (!journal) return;
    try {
      setLoading(true);
      await journalService.deleteJournal(journal.id);
      setJournal(null);
      message.success('日记删除成功');
    } catch {
      message.error('删除日记失败');
    } finally {
      setLoading(false);
    }
  }, [journal]);

  const handleOpenEventModal = useCallback((event?: JournalEvent) => {
    setEditingEvent(event || null);
    setEventModalOpen(true);
  }, []);

  const handleEventSubmit = useCallback(async (data: EventCreate | EventUpdate) => {
    try {
      if (editingEvent) {
        await journalService.updateEvent(editingEvent.id, data as EventUpdate);
        message.success('事件更新成功');
      } else {
        await journalService.createEvent(dateStr, data as EventCreate);
        message.success('事件添加成功');
      }
      await fetchJournal();
      setEventModalOpen(false);
    } catch {
      throw new Error();
    }
  }, [editingEvent, dateStr, fetchJournal]);

  const handleDeleteEvent = useCallback(async (eventId: number) => {
    try {
      await journalService.deleteEvent(eventId);
      message.success('事件删除成功');
      await fetchJournal();
    } catch {
      message.error('删除事件失败');
    }
  }, [fetchJournal]);

  const handleOpenReflectionModal = useCallback((eventId: number, reflection?: Reflection) => {
    setCurrentEventIdForReflection(eventId);
    setEditingReflection(reflection || null);
    setReflectionModalOpen(true);
  }, []);

  const handleReflectionSubmit = useCallback(async (data: ReflectionCreate | ReflectionUpdate) => {
    if (!currentEventIdForReflection) return;
    try {
      if (editingReflection) {
        await journalService.updateReflection(editingReflection.id, data as ReflectionUpdate);
        message.success('反思更新成功');
      } else {
        await journalService.createReflection(currentEventIdForReflection, data as ReflectionCreate);
        message.success('反思添加成功');
      }
      await fetchJournal();
      setReflectionModalOpen(false);
    } catch {
      throw new Error();
    }
  }, [editingReflection, currentEventIdForReflection, fetchJournal]);

  const handleDeleteReflection = useCallback(async (reflectionId: number) => {
    try {
      await journalService.deleteReflection(reflectionId);
      message.success('反思删除成功');
      await fetchJournal();
    } catch {
      message.error('删除反思失败');
    }
  }, [fetchJournal]);

  const handleOpenJournalInfoModal = useCallback(() => {
    if (journal) {
      setJournalFormValues({
        mood: journal.mood,
        weather: journal.weather,
        summary: journal.summary,
      });
    } else {
      setJournalFormValues({});
    }
    setJournalInfoModalOpen(true);
  }, [journal]);

  const events = useMemo(() => journal?.events || [], [journal]);

  return (
    <div>
      <Card
        title="每日经验汇总"
        extra={
          <Space>
            <DatePicker
              value={selectedDate}
              onChange={handleDateChange}
              format="YYYY-MM-DD"
              allowClear={false}
            />
            <Button icon={<ReloadOutlined />} onClick={fetchJournal} loading={loading}>
              刷新
            </Button>
          </Space>
        }
      >
        {loading && !journal && (
          <div style={{ textAlign: 'center', padding: 40 }}>
            <Spin size="large" />
          </div>
        )}

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

        {!loading && !journal && (
          <Empty
            description={`${selectedDate.format('YYYY年MM月DD日')} 没有日记记录`}
            image={Empty.PRESENTED_IMAGE_SIMPLE}
          >
            <Button type="primary" icon={<PlusOutlined />} onClick={() => setJournalInfoModalOpen(true)}>
              创建日记
            </Button>
          </Empty>
        )}

        {journal && (
          <div>
            <div
              style={{
                marginBottom: 16,
                padding: 12,
                background: isDark ? '#1f1f1f' : '#fafafa',
                borderRadius: 8,
              }}
            >
              <Space size="middle" wrap>
                <span style={{ fontWeight: 600, fontSize: 16 }}>
                  {selectedDate.format('YYYY年MM月DD日')}
                </span>
                {journal.mood && (
                  <Tag icon={<SmileOutlined />} color="gold">
                    心情: {journal.mood}
                  </Tag>
                )}
                {journal.weather && <Tag color="cyan">天气: {journal.weather}</Tag>}
                <Button type="text" size="small" icon={<EditOutlined />} onClick={handleOpenJournalInfoModal}>
                  编辑日记信息
                </Button>
                <Popconfirm
                  title="确定删除该日记吗？"
                  description="将同时删除所有事件和反思"
                  onConfirm={handleDeleteJournal}
                  okText="确定"
                  cancelText="取消"
                >
                  <Button type="text" size="small" danger icon={<DeleteOutlined />}>
                    删除日记
                  </Button>
                </Popconfirm>
              </Space>

              {journal.summary && (
                <div style={{ marginTop: 8, color: 'var(--ant-color-text-secondary)' }}>
                  <span style={{ fontWeight: 500 }}>当日总结：</span>
                  {journal.summary}
                </div>
              )}
            </div>

            <div style={{ marginBottom: 12 }}>
              <span style={{ fontWeight: 500 }}>事件列表 ({events.length})</span>
            </div>

            {events.length === 0 ? (
              <Empty description="暂无事件记录" image={Empty.PRESENTED_IMAGE_SIMPLE}>
                <Button type="dashed" icon={<PlusOutlined />} onClick={() => handleOpenEventModal()}>
                  添加事件
                </Button>
              </Empty>
            ) : (
              <div>
                {events.map((event) => (
                  <EventCard
                    key={event.id}
                    event={event}
                    onEdit={handleOpenEventModal}
                    onDelete={handleDeleteEvent}
                    onAddReflection={(eventId) => handleOpenReflectionModal(eventId)}
                    onEditReflection={(reflection) => handleOpenReflectionModal(event.id, reflection)}
                    onDeleteReflection={handleDeleteReflection}
                  />
                ))}
                <Button
                  type="dashed"
                  icon={<PlusOutlined />}
                  onClick={() => handleOpenEventModal()}
                  style={{ width: '100%', marginTop: 8 }}
                >
                  添加事件
                </Button>
              </div>
            )}
          </div>
        )}
      </Card>

      <Modal
        title={journal ? '编辑日记信息' : '创建日记'}
        open={journalInfoModalOpen}
        onOk={journal ? handleUpdateJournal : handleCreateJournal}
        onCancel={() => setJournalInfoModalOpen(false)}
        confirmLoading={loading}
        width={500}
        destroyOnClose
      >
        <div style={{ marginBottom: 16 }}>
          <div style={{ fontWeight: 500, marginBottom: 8 }}>日期</div>
          <Tag color="blue">{selectedDate.format('YYYY-MM-DD')}</Tag>
        </div>

        <div style={{ marginBottom: 16 }}>
          <div style={{ fontWeight: 500, marginBottom: 8 }}>心情</div>
          <Select
            style={{ width: '100%' }}
            placeholder="选择心情"
            allowClear
            options={MOOD_OPTIONS}
            value={journalFormValues.mood}
            onChange={(value) => setJournalFormValues((prev) => ({ ...prev, mood: value }))}
          />
        </div>

        <div style={{ marginBottom: 16 }}>
          <div style={{ fontWeight: 500, marginBottom: 8 }}>天气</div>
          <Select
            style={{ width: '100%' }}
            placeholder="选择天气"
            allowClear
            options={[
              { value: '晴', label: '晴' },
              { value: '多云', label: '多云' },
              { value: '阴', label: '阴' },
              { value: '小雨', label: '小雨' },
              { value: '大雨', label: '大雨' },
              { value: '雪', label: '雪' },
            ]}
            value={journalFormValues.weather}
            onChange={(value) => setJournalFormValues((prev) => ({ ...prev, weather: value }))}
          />
        </div>

        <div>
          <div style={{ fontWeight: 500, marginBottom: 8 }}>当日总结</div>
          <Input.TextArea
            rows={4}
            placeholder="写下今天的总结..."
            value={journalFormValues.summary}
            onChange={(e) => setJournalFormValues((prev) => ({ ...prev, summary: e.target.value }))}
            maxLength={2000}
            showCount
          />
        </div>
      </Modal>

      <EventModal
        open={eventModalOpen}
        event={editingEvent}
        onOk={handleEventSubmit}
        onCancel={() => setEventModalOpen(false)}
      />

      <ReflectionModal
        open={reflectionModalOpen}
        reflection={editingReflection}
        onOk={handleReflectionSubmit}
        onCancel={() => setReflectionModalOpen(false)}
      />
    </div>
  );
};

export default React.memo(JournalPage);