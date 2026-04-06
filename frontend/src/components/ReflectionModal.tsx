/**
 * ReflectionModal 反思编辑弹窗组件
 */

import React, { useEffect, useMemo, useState } from 'react';
import { Modal, Form, Select, Input, message } from 'antd';
import type { Reflection, ReflectionCreate, ReflectionUpdate } from '@/types/journal';
import { REFLECTION_TYPE_OPTIONS } from '@/types/journal';

interface ReflectionModalProps {
  open: boolean;
  reflection: Reflection | null;
  onOk: (data: ReflectionCreate | ReflectionUpdate) => Promise<void>;
  onCancel: () => void;
}

const ReflectionModal: React.FC<ReflectionModalProps> = ({ open, reflection, onOk, onCancel }) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [showCustomName, setShowCustomName] = useState(false);

  const isEdit = useMemo(() => !!reflection, [reflection]);

  useEffect(() => {
    if (open) {
      if (reflection) {
        form.setFieldsValue({
          type: reflection.type,
          custom_type_name: reflection.custom_type_name,
          content: reflection.content,
        });
        setShowCustomName(reflection.type === 'custom');
      } else {
        form.resetFields();
        setShowCustomName(false);
      }
    }
  }, [open, reflection, form]);

  const handleTypeChange = (value: string) => {
    setShowCustomName(value === 'custom');
    if (value !== 'custom') {
      form.setFieldValue('custom_type_name', undefined);
    }
  };

  const handleOk = async () => {
    try {
      setLoading(true);
      const values = await form.validateFields();

      const data: ReflectionCreate | ReflectionUpdate = {
        type: values.type,
        custom_type_name: values.type === 'custom' ? values.custom_type_name : undefined,
        content: values.content,
      };

      await onOk(data);
      form.resetFields();
    } catch {
      message.error(isEdit ? '更新反思失败' : '添加反思失败');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      title={isEdit ? '编辑反思' : '添加反思'}
      open={open}
      onOk={handleOk}
      onCancel={onCancel}
      confirmLoading={loading}
      width={500}
      destroyOnClose
    >
      <Form form={form} layout="vertical">
        <Form.Item
          name="type"
          label="反思类型"
          rules={[{ required: true, message: '请选择反思类型' }]}
        >
          <Select options={REFLECTION_TYPE_OPTIONS} onChange={handleTypeChange} />
        </Form.Item>

        {showCustomName && (
          <Form.Item
            name="custom_type_name"
            label="自定义类型名称"
            rules={[{ required: true, message: '请输入自定义类型名称' }]}
          >
            <Input placeholder="如：灵感、感悟" maxLength={50} />
          </Form.Item>
        )}

        <Form.Item
          name="content"
          label="反思内容"
          rules={[
            { required: true, message: '请输入反思内容' },
            { max: 2000, message: '内容最多2000个字符' },
          ]}
        >
          <Input.TextArea
            rows={4}
            placeholder="写下你的反思..."
            showCount
            maxLength={2000}
          />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default React.memo(ReflectionModal);