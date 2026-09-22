import { ArrowDownOutlined, ArrowUpOutlined, BarcodeOutlined, CheckCircleFilled } from "@ant-design/icons";
import { Alert, Button, Form, Input, InputNumber, Radio, Select, message } from "antd";
import { useEffect, useMemo, useState } from "react";
import { api } from "../api/client";
import { PageHeader } from "../components/PageHeader";
import { StockStatusTag } from "../components/StockStatusTag";
import type { Product } from "../types";

type MovementForm = { productId: string; quantity: number; notes?: string };

export function StockMovementPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [mode, setMode] = useState<"stock-in" | "stock-out">("stock-in");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form] = Form.useForm<MovementForm>();
  const productId = Form.useWatch("productId", form);
  const selected = useMemo(() => products.find((product) => product.id === productId), [products, productId]);

  useEffect(() => { api<{ products: Product[] }>("/products").then((result) => setProducts(result.products)).catch((caught) => setError(caught.message)); }, []);
  async function submit(values: MovementForm) {
    setSubmitting(true);
    try {
      const result = await api<{ movement: { productName: string; previousQuantity: number; newQuantity: number } }>(`/inventory/${mode}`, { method: "POST", body: values });
      message.success(`${result.movement.productName} updated from ${result.movement.previousQuantity} to ${result.movement.newQuantity}.`);
      setProducts((current) => current.map((product) => {
        if (product.id !== values.productId) return product;
        const quantity = result.movement.newQuantity;
        const stockStatus = quantity === 0 ? "OUT_OF_STOCK" : quantity <= product.minimumStock ? "LOW_STOCK" : "IN_STOCK";
        return { ...product, quantity, stockStatus };
      }));
      form.resetFields(["quantity", "notes"]);
    } catch (caught) { message.error(caught instanceof Error ? caught.message : "Stock movement could not be recorded."); }
    finally { setSubmitting(false); }
  }

  return <div className="view-enter">
    <PageHeader title="Stock movement" description="Receive or release inventory with an immediate, traceable quantity update." />
    {error && <Alert type="error" showIcon message={error} className="section-alert" />}
    <div className="movement-layout">
      <section className="movement-form-panel">
        <Radio.Group value={mode} onChange={(event) => setMode(event.target.value)} optionType="button" buttonStyle="solid" className="movement-toggle">
          <Radio.Button value="stock-in"><ArrowDownOutlined /> Stock in</Radio.Button>
          <Radio.Button value="stock-out"><ArrowUpOutlined /> Stock out</Radio.Button>
        </Radio.Group>
        <div className="movement-heading"><span className={`movement-icon ${mode}`}><BarcodeOutlined /></span><div><h2>{mode === "stock-in" ? "Receive inventory" : "Release inventory"}</h2><p>{mode === "stock-in" ? "Add delivered units to the selected product." : "Remove units while preventing negative stock."}</p></div></div>
        <Form<MovementForm> form={form} layout="vertical" requiredMark="optional" onFinish={submit}>
          <Form.Item label="Product" name="productId" rules={[{ required: true, message: "Select a product." }]}>
            <Select showSearch size="large" placeholder="Search by product or barcode" optionFilterProp="label" options={products.map((product) => ({ value: product.id, label: `${product.name} · ${product.barcode}` }))} />
          </Form.Item>
          <Form.Item label="Quantity" name="quantity" rules={[{ required: true, message: "Enter the quantity." }]}><InputNumber size="large" min={1} max={1_000_000} precision={0} className="full-width" /></Form.Item>
          <Form.Item label="Notes" name="notes"><Input.TextArea rows={4} maxLength={500} placeholder="Delivery reference, reason, or other context" showCount /></Form.Item>
          <Button type="primary" htmlType="submit" size="large" block loading={submitting}>{mode === "stock-in" ? "Confirm stock in" : "Confirm stock out"}</Button>
        </Form>
      </section>
      <aside className="stock-context" aria-live="polite">
        {selected ? <><div className="context-label">Selected product</div><h2>{selected.name}</h2><code>{selected.barcode}</code><div className="quantity-reading"><span>Available now</span><strong>{selected.quantity.toLocaleString()}</strong><small>{selected.unit}</small></div><StockStatusTag status={selected.stockStatus} /><div className="context-check"><CheckCircleFilled /><span>Every confirmed change creates a permanent ledger entry.</span></div></> : <><div className="context-placeholder"><BarcodeOutlined /><h2>Select a product</h2><p>Its current quantity and stock status will appear here before you confirm the movement.</p></div></>}
      </aside>
    </div>
  </div>;
}
