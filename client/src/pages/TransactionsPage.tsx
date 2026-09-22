import { ArrowDownOutlined, ArrowUpOutlined, SearchOutlined } from "@ant-design/icons";
import { Alert, Input, Select, Table } from "antd";
import { useEffect, useMemo, useState } from "react";
import { api } from "../api/client";
import { PageHeader } from "../components/PageHeader";
import type { StockTransaction } from "../types";

export function TransactionsPage() {
  const [items, setItems] = useState<StockTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [type, setType] = useState<string>();
  useEffect(() => { api<{ transactions: StockTransaction[] }>("/inventory/transactions?limit=500").then((result) => setItems(result.transactions)).catch((caught) => setError(caught.message)).finally(() => setLoading(false)); }, []);
  const filtered = useMemo(() => items.filter((item) => (!type || item.transactionType === type) && `${item.productName} ${item.barcode} ${item.userName}`.toLowerCase().includes(search.toLowerCase())), [items, search, type]);
  return <div className="view-enter"><PageHeader title="Transaction history" description="A chronological audit trail of every stock increase and decrease." />
    {error && <Alert type="error" showIcon message={error} className="section-alert" />}
    <section className="ledger-panel"><div className="table-toolbar"><Input allowClear prefix={<SearchOutlined />} placeholder="Search product, barcode, or staff" value={search} onChange={(event) => setSearch(event.target.value)} /><Select allowClear placeholder="All movement types" value={type} onChange={setType} options={[{ value: "STOCK_IN", label: "Stock in" }, { value: "STOCK_OUT", label: "Stock out" }]} /><span className="result-count">{filtered.length} records</span></div>
      <Table<StockTransaction> rowKey="id" loading={loading} dataSource={filtered} pagination={{ pageSize: 15, showSizeChanger: true }} scroll={{ x: 900 }} columns={[
        { title: "Date", dataIndex: "createdAt", render: (value) => new Intl.DateTimeFormat("en-PH", { dateStyle: "medium", timeStyle: "short" }).format(new Date(value)), sorter: (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(), defaultSortOrder: "descend" },
        { title: "Movement", dataIndex: "transactionType", render: (value) => <span className={`movement-type ${value === "STOCK_IN" ? "in" : "out"}`}>{value === "STOCK_IN" ? <ArrowDownOutlined /> : <ArrowUpOutlined />}{value === "STOCK_IN" ? "Stock in" : "Stock out"}</span> },
        { title: "Product", dataIndex: "productName", render: (value, row) => <div className="primary-cell"><strong>{value}</strong><code>{row.barcode}</code></div> },
        { title: "Change", dataIndex: "quantity", align: "right", render: (value, row) => <strong className="tabular">{row.transactionType === "STOCK_IN" ? "+" : "−"}{value}</strong> },
        { title: "Balance", dataIndex: "newQuantity", align: "right", render: (value) => <span className="tabular">{value}</span> },
        { title: "Recorded by", dataIndex: "userName" },
        { title: "Notes", dataIndex: "notes", render: (value) => value || "—" },
      ]} />
    </section></div>;
}

