/**
 * 错误边界组件
 * 
 * 捕获React组件树中的JavaScript错误，记录错误并显示降级UI
 */

import { Component, ErrorInfo, ReactNode } from 'react';
import { Result, Button } from 'antd';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    this.setState({
      errorInfo,
    });
  }

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
    window.location.href = '/';
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div style={{ padding: '50px', textAlign: 'center' }}>
          <Result
            status="error"
            title="页面出现错误"
            subTitle="抱歉，页面遇到了一些问题。请尝试刷新页面或返回首页。"
            extra={[
              <Button type="primary" key="home" onClick={this.handleReset}>
                返回首页
              </Button>,
              <Button key="refresh" onClick={() => window.location.reload()}>
                刷新页面
              </Button>,
            ]}
          />
          {import.meta.env.DEV && this.state.error && (
            <details style={{ textAlign: 'left', marginTop: 20 }}>
              <summary style={{ cursor: 'pointer', marginBottom: 10 }}>
                错误详情（仅开发环境可见）
              </summary>
              <pre style={{ 
                background: localStorage.getItem('theme-mode') === 'dark' ? '#1f1f1f' : '#f5f5f5', 
                padding: 16, 
                borderRadius: 4,
                overflow: 'auto',
                maxHeight: 400,
                fontSize: 12,
              }}>
                {this.state.error.toString()}
                {'\n\n'}
                {this.state.errorInfo?.componentStack}
              </pre>
            </details>
          )}
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
