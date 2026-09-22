import { DownloadOutlined, FileTextOutlined } from "@ant-design/icons";
import { Alert, Button, Skeleton, Table } from "antd";
import { useEffect, useState } from "react";
import { api } from "../api/client";
import { PageHeader } from "../components/PageHeader";
import { StockStatusTag } from "../components/StockStatusTag";
import type { InventorySummary, Product } from "../types";

function csvCell(value: unknown) { return `"${String(value ?? "").replaceAll('"', '""')}"`; }

export function ReportsPage() {
  const [report, setReport] = useState<{ summary: InventorySummary; products: Product[] } | null>(null);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => { api<{ summary: InventorySummary; products: Product[] }>("/reports/inventory").then(setReport).catch((caught) => setError(caught.message)); }, []);
  function download() {
    if (!report) return;
    const rows = [["Product", "Barcode", "Category", "Unit", "Quantity", "Minimum stock", "Status"], ...report.products.map((item) => [item.name, item.barcode, item.categoryName, item.unit, item.quantity, item.minimumStock, item.stockStatus])];
    const blob = new Blob([rows.map((row) => row.map(csvCell).join(",")).join("\r\n")], { type: "text/csv;charset=utf-8" });
    const link = document.createElement("a"); link.href = URL.createObjectURL(blob); link.download = `inventory-report-${new Date().toISOString().slice(0, 10)}.csv`; link.click(); URL.revokeObjectURL(link.href);
  }
  return <div className="view-enter"><PageHeader title="Inventory report" description="A printable, exportable snapshot of current product availability." actions={<Button type="primary" icon={<DownloadOutlined />} disabled={!report} onClick={download}>Export CSV</Button>} />
    {error && <Alert type="error" showIcon message={error} className="section-alert" />}
    {!report ? <Skeleton active /> : <><div className="report-summary"><div><FileTextOutlined /><span>Report date<strong>{new Intl.DateTimeFormat("en-PH", { dateStyle: "long" }).format(new Date())}</strong></span></div><dl><div><dt>Products</dt><dd>{report.summary.totalProducts}</dd></div><div><dt>Units</dt><dd>{report.summary.totalUnits}</dd></div><div><dt>Low stock</dt><dd>{report.summary.lowStock}</dd></div><div><dt>Out of stock</dt><dd>{report.summary.outOfStock}</dd></div></dl></div>
      <section className="ledger-panel"><Table<Product> rowKey="id" dataSource={report.products} pagination={{ pageSize: 15 }} scroll={{ x: 760 }} columns={[
        { title: "Product", dataIndex: "name", render: (value) => <strong>{value}</strong> }, { title: "Barcode", dataIndex: "barcode", render: (value) => <code>{value}</code> }, { title: "Category", dataIndex: "categoryName", render: (value) => value || "Uncategorized" }, { title: "Quantity", dataIndex: "quantity", align: "right", render: (value, row) => <span className="tabular">{value} {row.unit}</span> }, { title: "Minimum", dataIndex: "minimumStock", align: "right" }, { title: "Status", dataIndex: "stockStatus", render: (value) => <StockStatusTag status={value} /> },
      ]} /></section></>}
  </div>;
}

