import { ArrowDownOutlined, ArrowRightOutlined, ArrowUpOutlined, InboxOutlined, ProductOutlined, WarningOutlined } from "@ant-design/icons";
import { Alert, Button, Skeleton, Table } from "antd";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../api/client";
import { PageHeader } from "../components/PageHeader";
import type { InventorySummary } from "../types";

type Activity = { id: string; transactionType: "STOCK_IN" | "STOCK_OUT"; quantity: number; createdAt: string; productName: string; userName: string };

export function DashboardPage() {
  const [data, setData] = useState<{ summary: InventorySummary; recentActivity: Activity[] } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    api<{ summary: InventorySummary; recentActivity: Activity[] }>("/dashboard")
      .then(setData).catch((caught) => setError(caught.message));
  }, []);

  const metrics = data ? [
    { label: "Active products", value: data.summary.totalProducts, note: "Catalog records", icon: <ProductOutlined />, tone: "slate" },
    { label: "Units on hand", value: data.summary.totalUnits, note: "Across all products", icon: <InboxOutlined />, tone: "green" },
    { label: "Low stock", value: data.summary.lowStock, note: "Needs attention", icon: <WarningOutlined />, tone: "amber" },
    { label: "Out of stock", value: data.summary.outOfStock, note: "Unavailable now", icon: <WarningOutlined />, tone: "red" },
  ] : [];

  return (
    <div className="view-enter">
      <PageHeader title="Inventory overview" description="A live view of current stock and the movements that changed it." actions={<Button type="primary" icon={<ArrowRightOutlined />} onClick={() => navigate("/stock")}>Record movement</Button>} />
      {error && <Alert type="error" showIcon message="Dashboard unavailable" description={error} className="section-alert" />}
      {!data ? <div className="metric-grid">{Array.from({ length: 4 }).map((_, index) => <Skeleton.Node key={index} active className="metric-skeleton" />)}</div> : (
        <div className="metric-grid dashboard-reveal">
          {metrics.map((metric) => <article className={`metric-panel metric-${metric.tone}`} key={metric.label}><div className="metric-label"><span>{metric.label}</span><i>{metric.icon}</i></div><strong>{metric.value.toLocaleString()}</strong><small>{metric.note}</small></article>)}
        </div>
      )}
      <section className="ledger-panel">
        <div className="panel-heading"><div><h2>Recent stock ledger</h2><p>The latest recorded changes across inventory.</p></div><Button type="link" onClick={() => navigate("/transactions")}>View full history</Button></div>
        <Table<Activity> rowKey="id" loading={!data && !error} dataSource={data?.recentActivity ?? []} pagination={false} scroll={{ x: 680 }} columns={[
          { title: "Movement", dataIndex: "transactionType", render: (value) => <span className={`movement-type ${value === "STOCK_IN" ? "in" : "out"}`}>{value === "STOCK_IN" ? <ArrowDownOutlined /> : <ArrowUpOutlined />}{value === "STOCK_IN" ? "Stock in" : "Stock out"}</span> },
          { title: "Product", dataIndex: "productName", render: (value) => <strong>{value}</strong> },
          { title: "Quantity", dataIndex: "quantity", align: "right", render: (value, row) => <span className="tabular">{row.transactionType === "STOCK_IN" ? "+" : "−"}{value}</span> },
          { title: "Recorded by", dataIndex: "userName" },
          { title: "Date", dataIndex: "createdAt", render: (value) => new Intl.DateTimeFormat("en-PH", { dateStyle: "medium", timeStyle: "short" }).format(new Date(value)) },
        ]} />
      </section>
    </div>
  );
}

