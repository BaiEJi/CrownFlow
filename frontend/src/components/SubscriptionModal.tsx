/**
 * SubscriptionModal 订阅表单弹窗组件
 *
 * 提供订阅记录的创建和编辑功能。
 * 支持字段：级别、价格、币种、计费周期、自定义天数、日期、订阅渠道、备注。
 *
 * @module components/SubscriptionModal
 */

import React, { useEffect, useCallback } from 'react';
import {
  Modal,
  Form,
  Input,
  InputNumber,
  Select,
  DatePicker,
  Row,
  Col,
} from 'antd';
import type { Subscription, SubscriptionCreate, SubscriptionUpdate } from '@/types';
import dayjs from 'dayjs';
import type { Dayjs } from 'dayjs';

/**
 * 计费周期选项
 */
const BILLING_CYCLE_OPTIONS = [
  { value: 'monthly', label: '月付' },
  { value: 'quarterly', label: '季付' },
  { value: 'yearly', label: '年付' },
  { value: 'custom', label: '自定义' },
];

/**
 * 币种选项
 */
const CURRENCY_OPTIONS = [
  { value: 'CNY', label: 'CNY (¥)' },
  { value: 'USD', label: 'USD ($)' },
  { value: 'EUR', label: 'EUR (€)' },
  { value: 'GBP', label: 'GBP (£)' },
  { value: 'JPY', label: 'JPY (¥)' },
];

/**
 * 默认表单值
 */
const DEFAULT_FORM_VALUES = {
  currency: 'CNY',
  billing_cycle: 'monthly',
};

/**
 * 组件属性
 */
interface SubscriptionModalProps {
  /** 是否显示弹窗 */
  open: boolean;
  /** 编辑的订阅记录（为空时表示创建） */
  subscription?: Subscription | null;
  /** 提交回调 */
  onSubmit: (data: SubscriptionCreate | SubscriptionUpdate) => Promise<void>;
  /** 取消回调 */
  onCancel: () => void;
  /** 是否正在提交 */
  loading?: boolean;
}

/**
 * 订阅表单弹窗组件
 */
const SubscriptionModal: React.FC<SubscriptionModalProps> = ({
  open,
  subscription,
  onSubmit,
  onCancel,
  loading = false,
}) => {
  const [form] = Form.useForm();

  /**
   * 初始化表单值
   */
  useEffect(() => {
    if (open) {
      if (subscription) {
        form.setFieldsValue({
          ...subscription,
          start_date: dayjs(subscription.start_date),
          end_date: dayjs(subscription.end_date),
        });
      } else {
        form.resetFields();
        form.setFieldsValue(DEFAULT_FORM_VALUES);
      }
    }
  }, [open, subscription, form]);

  /**
   * 开始日期变化时自动计算结束日期
   */
  const handleStartDateChange = useCallback((date: Dayjs | null) => {
    if (!date) return;

    const billingCycle = form.getFieldValue('billing_cycle');

    if (billingCycle === 'custom' || !billingCycle) return;

    let endDate: Dayjs;
    switch (billingCycle) {
      case 'monthly':
        endDate = date.add(1, 'month');
        break;
      case 'quarterly':
        endDate = date.add(3, 'month');
        break;
      case 'yearly':
        endDate = date.add(1, 'year');
        break;
      default:
        return;
    }

    form.setFieldsValue({ end_date: endDate });
  }, [form]);

  /**
   * 提交表单
   */
  const handleSubmit = useCallback(async () => {
    try {
      const values = await form.validateFields();
      const data = {
        ...values,
        start_date: values.start_date.format('YYYY-MM-DD'),
        end_date: values.end_date.format('YYYY-MM-DD'),
      };
      await onSubmit(data);
    } catch (err) {
      console.error('Form validation failed:', err);
    }
  }, [form, onSubmit]);

  return (
    <Modal
      title={subscription ? '编辑订阅' : '添加订阅'}
      open={open}
      onOk={handleSubmit}
      onCancel={onCancel}
      confirmLoading={loading}
      width={720}
      destroyOnClose
    >
      <Form form={form} layout="vertical">
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item name="level" label="会员级别">
              <Input placeholder="如: 豪华版、家庭版" maxLength={50} />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item
              name="price"
              label="价格"
              rules={[
                { required: true, message: '请输入价格' },
                { type: 'number', min: 0, message: '价格不能为负数' },
              ]}
            >
              <InputNumber
                min={0}
                precision={2}
                style={{ width: '100%' }}
                placeholder="价格"
              />
            </Form.Item>
          </Col>
          <Col span={4}>
            <Form.Item name="currency" label="币种">
              <Select options={CURRENCY_OPTIONS} />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name="billing_cycle"
              label="计费周期"
              rules={[{ required: true, message: '请选择计费周期' }]}
            >
              <Select options={BILLING_CYCLE_OPTIONS} />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item name="channel" label="订阅渠道">
              <Input placeholder="如: 官方、淘宝、代充" maxLength={50} />
            </Form.Item>
          </Col>
        </Row>

        <Form.Item
          noStyle
          shouldUpdate={(prev, curr) => prev.billing_cycle !== curr.billing_cycle}
        >
          {({ getFieldValue }) =>
            getFieldValue('billing_cycle') === 'custom' ? (
              <Form.Item
                name="custom_days"
                label="自定义天数"
                rules={[
                  { required: true, message: '请输入自定义天数' },
                  { type: 'number', min: 1, message: '天数必须大于0' },
                ]}
              >
                <InputNumber min={1} max={365} style={{ width: '100%' }} />
              </Form.Item>
            ) : null
          }
        </Form.Item>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name="start_date"
              label="开始日期"
              rules={[{ required: true, message: '请选择开始日期' }]}
            >
              <DatePicker style={{ width: '100%' }} onChange={handleStartDateChange} />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name="end_date"
              label="结束日期"
              dependencies={['start_date']}
              rules={[
                { required: true, message: '请选择结束日期' },
                ({ getFieldValue }) => ({
                  validator(_: unknown, value: Dayjs) {
                    if (!value || !getFieldValue('start_date')) {
                      return Promise.resolve();
                    }
                    if (value.isAfter(getFieldValue('start_date'))) {
                      return Promise.resolve();
                    }
                    return Promise.reject(new Error('结束日期必须晚于开始日期'));
                  },
                }),
              ]}
            >
              <DatePicker style={{ width: '100%' }} />
            </Form.Item>
          </Col>
        </Row>

        <Form.Item name="notes" label="备注">
          <Input.TextArea rows={2} placeholder="备注信息" maxLength={1000} showCount />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default React.memo(SubscriptionModal);