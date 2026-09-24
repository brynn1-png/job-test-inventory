import { LockOutlined, MailOutlined } from "@ant-design/icons";
import { Alert, Button, Form, Input } from "antd";
import { useState } from "react";
import { Navigate, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthProvider";

type LoginValues = { email: string; password: string };

export function LoginPage() {
  const { user, login } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  if (user) return <Navigate to="/" replace />;
  const destination = (location.state as { from?: string } | null)?.from ?? "/";

  async function submit(values: LoginValues) {
    setSubmitting(true);
    setError(null);
    try {
      await login(values.email, values.password);
      navigate(destination, { replace: true });
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Sign in failed. Try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="login-page">
      <section className="login-story" aria-label="Product introduction">
        <div className="login-brand"><img src="/inventory-mark.svg" alt="" /><span>Inventory Management</span></div>
        <div className="login-story-copy">
          <h1>Every item accounted for.</h1>
          <p>Receive stock, trace every movement, and keep inventory accurate from one dependable workspace.</p>
        </div>
        <div className="login-ledger" aria-hidden="true">
          <div><span>Today’s receiving</span><strong>24 entries</strong></div>
          <div><span>Inventory status</span><strong className="positive">Healthy</strong></div>
          <div><span>Last reconciliation</span><strong>4:32 PM</strong></div>
        </div>
      </section>
      <section className="login-form-panel">
        <div className="login-form-wrap">
          <h2>Welcome back</h2>
          <p>Sign in with your assigned staff account.</p>
          {error && <Alert type="error" showIcon message={error} className="form-alert" />}
          <Form<LoginValues> layout="vertical" requiredMark={false} onFinish={submit} size="large">
            <Form.Item label="Email address" name="email" rules={[{ required: true, message: "Enter your email address." }, { type: "email", message: "Enter a valid email address." }]}> 
              <Input prefix={<MailOutlined aria-hidden="true" />} type="email" autoComplete="username" placeholder="name@example.com" />
            </Form.Item>
            <Form.Item label="Password" name="password" rules={[{ required: true, message: "Enter your password." }, { min: 8, message: "Password must contain at least 8 characters." }]}> 
              <Input.Password prefix={<LockOutlined aria-hidden="true" />} autoComplete="current-password" placeholder="Your password" />
            </Form.Item>
            <Button type="primary" htmlType="submit" loading={submitting} block>Sign in to inventory</Button>
          </Form>
          <p className="login-help">Demo account details are listed in the project README after database seeding.</p>
        </div>
      </section>
    </main>
  );
}
