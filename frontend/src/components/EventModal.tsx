/**
 * EventModal 事件编辑弹窗组件
 */

import React, { useEffect, useMemo } from 'react';
import { Modal, Form, Input, Row, Col, TimePicker, message } from 'antd';
import type { JournalEvent, EventCreate, EventUpdate } from '@/types/journal';
import dayjs from 'dayjs';

interface EventModalProps {
  open: boolean;
  event: JournalEvent | null;
  onOk: (data: EventCreate | EventUpdate) => Promise<void>;
  onCancel: () => void;
}

const EventModal: React.FC<EventModalProps> = ({ open, event, onOk, onCancel }) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = React.useState(false);

  const isEdit = useMemo(() => !!event, [event]);

  useEffect(() => {
    if (open) {
      if (event) {
        form.setFieldsValue({
          title: event.title,
          start_time: event.start_time ? dayjs(event.start_time, 'HH:mm') : undefined,
          end_time: event.end_time ? dayjs(event.end_time, 'HH:mm') : undefined,
          location: event.location,
          background: event.background,
          process: event.process,
          result: event.result,
        });
      } else {
        form.resetFields();
      }
    }
  }, [open, event, form]);

  const handleOk = async () => {
    try {
      setLoading(true);
      const values = await form.validateFields();

      const data: EventCreate | EventUpdate = {
        title: values.title,
        start_time: values.start_time?.format('HH:mm'),
        end_time: values.end_time?.format('HH:mm'),
        location: values.location,
        background: values.background,
        process: values.process,
        result: values.result,
      };

      await onOk(data);
      form.resetFields();
    } catch {
      message.error(isEdit ? '更新事件失败' : '创建事件失败');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      title={isEdit ? '编辑事件' : '添加事件'}
      open={open}
      onOk={handleOk}
      onCancel={onCancel}
      confirmLoading={loading}
      width={700}
      destroyOnClose
    >
      <Form form={form} layout="vertical">
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name="title"
              label="事件标题"
              rules={[
                { required: true, message: '请输入事件标题' },
                { max: 100, message: '标题最多100个字符' },
              ]}
            >
              <Input placeholder="如：上午开会" maxLength={100} />
            </Form.Item>
          </Col>
          <Col span={6}>
            <Form.Item name="start_time" label="开始时间">
              <TimePicker format="HH:mm" style={{ width: '100%' }} placeholder="开始" />
            </Form.Item>
          </Col>
          <Col span={6}>
            <Form.Item name="end_time" label="结束时间">
              <TimePicker format="HH:mm" style={{ width: '100%' }} placeholder="结束" />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item name="location" label="地点">
              <Input placeholder="如：公司会议室" maxLength={100} />
            </Form.Item>
          </Col>
        </Row>

        <Form.Item name="background" label="背景">
          <Input.TextArea rows={2} placeholder="事件的背景或起因" showCount maxLength={2000} />
        </Form.Item>

        <Form.Item name="process" label="过程">
          <Input.TextArea rows={3} placeholder="事件的过程描述" showCount maxLength={2000} />
        </Form.Item>

        <Form.Item name="result" label="结果">
          <Input.TextArea rows={2} placeholder="事件的结果" showCount maxLength={2000} />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default React.memo(EventModal);