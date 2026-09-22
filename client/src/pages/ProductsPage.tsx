import { EditOutlined, PlusOutlined, SearchOutlined, StopOutlined } from "@ant-design/icons";
import { Alert, Button, Drawer, Form, Input, InputNumber, Modal, Select, Space, Table, message } from "antd";
import { useCallback, useEffect, useMemo, useState } from "react";
import { api } from "../api/client";
import { useAuth } from "../auth/AuthProvider";
import { PageHeader } from "../components/PageHeader";
import { StockStatusTag } from "../components/StockStatusTag";
import type { Category, Product } from "../types";

type ProductForm = { name: string; barcode: string; categoryId?: string; description?: string; unit: string; minimumStock: number };

export function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [categoryId, setCategoryId] = useState<string>();
  const [editing, setEditing] = useState<Product | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form] = Form.useForm<ProductForm>();
  const { user } = useAuth();
  const canManage = user?.role === "administrator" || user?.role === "manager";
  const canArchive = user?.role === "administrator";

  const load = useCallback(async () => {
    setError(null);
    try {
      const [productResult, categoryResult] = await Promise.all([
        api<{ products: Product[] }>("/products"),
        api<{ categories: Category[] }>("/categories"),
      ]);
      setProducts(productResult.products); setCategories(categoryResult.categories);
    } catch (caught) { setError(caught instanceof Error ? caught.message : "Products could not be loaded."); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => {
    let active = true;
    Promise.all([
      api<{ products: Product[] }>("/products"),
      api<{ categories: Category[] }>("/categories"),
    ]).then(([productResult, categoryResult]) => {
      if (!active) return;
      setProducts(productResult.products);
      setCategories(categoryResult.categories);
    }).catch((caught) => {
      if (active) setError(caught instanceof Error ? caught.message : "Products could not be loaded.");
    }).finally(() => {
      if (active) setLoading(false);
    });
    return () => { active = false; };
  }, []);
  const filtered = useMemo(() => products.filter((product) => {
    const matchesSearch = `${product.name} ${product.barcode}`.toLowerCase().includes(search.toLowerCase());
    return matchesSearch && (!categoryId || product.categoryId === categoryId);
  }), [products, search, categoryId]);

  function openCreate() { setEditing(null); form.resetFields(); form.setFieldsValue({ unit: "piece", minimumStock: 5 }); setDrawerOpen(true); }
  function openEdit(product: Product) { setEditing(product); form.setFieldsValue({ name: product.name, barcode: product.barcode, categoryId: product.categoryId ?? undefined, description: product.description ?? undefined, unit: product.unit, minimumStock: product.minimumStock }); setDrawerOpen(true); }

  async function save(values: ProductForm) {
    setSaving(true);
    try {
      await api(editing ? `/products/${editing.id}` : "/products", { method: editing ? "PUT" : "POST", body: values });
      message.success(editing ? "Product updated." : "Product created.");
      setDrawerOpen(false); await load();
    } catch (caught) { message.error(caught instanceof Error ? caught.message : "Product could not be saved."); }
    finally { setSaving(false); }
  }

  function archive(product: Product) {
    Modal.confirm({ title: `Archive ${product.name}?`, content: "It will no longer appear in active inventory or stock movement forms.", okText: "Archive product", okButtonProps: { danger: true }, async onOk() { await api(`/products/${product.id}`, { method: "DELETE" }); message.success("Product archived."); await load(); } });
  }

  return (
    <div className="view-enter">
      <PageHeader title="Product ledger" description="Search, register, and maintain every product carried by the store." actions={canManage && <Button type="primary" icon={<PlusOutlined />} onClick={openCreate}>Add product</Button>} />
      {error && <Alert type="error" showIcon message={error} className="section-alert" />}
      <section className="ledger-panel">
        <div className="table-toolbar">
          <Input allowClear prefix={<SearchOutlined />} placeholder="Search name or barcode" value={search} onChange={(event) => setSearch(event.target.value)} />
          <Select allowClear placeholder="All categories" value={categoryId} onChange={setCategoryId} options={categories.map((category) => ({ value: category.id, label: category.name }))} />
          <span className="result-count">{filtered.length} products</span>
        </div>
        <Table<Product> rowKey="id" loading={loading} dataSource={filtered} pagination={{ pageSize: 10, showSizeChanger: true }} scroll={{ x: 940 }} columns={[
          { title: "Product", dataIndex: "name", sorter: (a, b) => a.name.localeCompare(b.name), render: (value, row) => <div className="primary-cell"><strong>{value}</strong><span>{row.description || "No description"}</span></div> },
          { title: "Barcode", dataIndex: "barcode", render: (value) => <code>{value}</code> },
          { title: "Category", dataIndex: "categoryName", render: (value) => value ?? "Uncategorized" },
          { title: "On hand", dataIndex: "quantity", align: "right", sorter: (a, b) => a.quantity - b.quantity, render: (value, row) => <strong className="tabular">{value.toLocaleString()} <small>{row.unit}</small></strong> },
          { title: "Status", dataIndex: "stockStatus", render: (value) => <StockStatusTag status={value} /> },
          { title: "Actions", key: "actions", fixed: "right", width: 120, render: (_, row) => <Space>{canManage && <Button type="text" icon={<EditOutlined />} aria-label={`Edit ${row.name}`} onClick={() => openEdit(row)} />}{canArchive && <Button type="text" danger icon={<StopOutlined />} aria-label={`Archive ${row.name}`} onClick={() => archive(row)} />}</Space> },
        ]} />
      </section>
      <Drawer title={editing ? "Edit product" : "Register product"} width={520} open={drawerOpen} onClose={() => setDrawerOpen(false)} destroyOnHidden extra={<Button type="primary" loading={saving} onClick={() => form.submit()}>{editing ? "Save changes" : "Create product"}</Button>}>
        <Form<ProductForm> form={form} layout="vertical" requiredMark="optional" onFinish={save}>
          <Form.Item label="Product name" name="name" rules={[{ required: true, message: "Enter the product name." }, { min: 2 }]}><Input autoFocus maxLength={160} /></Form.Item>
          <Form.Item label="Barcode" name="barcode" extra="Scan or enter the manufacturer barcode. Letters, numbers, periods, underscores, and hyphens are accepted." rules={[{ required: true, message: "Enter a barcode." }, { pattern: /^[A-Za-z0-9._-]+$/, message: "Barcode contains unsupported characters." }]}><Input maxLength={80} /></Form.Item>
          <Form.Item label="Category" name="categoryId"><Select allowClear placeholder="Select a category" options={categories.map((category) => ({ value: category.id, label: category.name }))} /></Form.Item>
          <div className="form-grid">
            <Form.Item label="Unit" name="unit" rules={[{ required: true }]}><Input placeholder="piece, bottle, pack" maxLength={30} /></Form.Item>
            <Form.Item label="Low-stock level" name="minimumStock" rules={[{ required: true }]}><InputNumber min={0} max={1_000_000} precision={0} className="full-width" /></Form.Item>
          </div>
          <Form.Item label="Description" name="description"><Input.TextArea rows={4} maxLength={1000} showCount /></Form.Item>
        </Form>
      </Drawer>
    </div>
  );
}
