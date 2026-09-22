import { DeleteOutlined, EditOutlined, PlusOutlined } from "@ant-design/icons";
import { Alert, Button, Form, Input, Modal, Space, Table, message } from "antd";
import { useCallback, useEffect, useState } from "react";
import { api } from "../api/client";
import { useAuth } from "../auth/AuthProvider";
import { PageHeader } from "../components/PageHeader";
import type { Category } from "../types";

type CategoryForm = { name: string; description?: string };

export function CategoriesPage() {
  const [items, setItems] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Category | null>(null);
  const [saving, setSaving] = useState(false);
  const [form] = Form.useForm<CategoryForm>();
  const { user } = useAuth();
  const canManage = user?.role === "administrator" || user?.role === "manager";

  const load = useCallback(async () => {
    try { setItems((await api<{ categories: Category[] }>("/categories")).categories); setError(null); }
    catch (caught) { setError(caught instanceof Error ? caught.message : "Categories could not be loaded."); }
    finally { setLoading(false); }
  }, []);
  useEffect(() => {
    let active = true;
    api<{ categories: Category[] }>("/categories").then((result) => {
      if (active) setItems(result.categories);
    }).catch((caught) => {
      if (active) setError(caught instanceof Error ? caught.message : "Categories could not be loaded.");
    }).finally(() => {
      if (active) setLoading(false);
    });
    return () => { active = false; };
  }, []);

  function open(item?: Category) { setEditing(item ?? null); form.setFieldsValue({ name: item?.name ?? "", description: item?.description ?? "" }); setModalOpen(true); }
  async function save(values: CategoryForm) {
    setSaving(true);
    try { await api(editing ? `/categories/${editing.id}` : "/categories", { method: editing ? "PUT" : "POST", body: values }); message.success(editing ? "Category updated." : "Category created."); setModalOpen(false); await load(); }
    catch (caught) { message.error(caught instanceof Error ? caught.message : "Category could not be saved."); }
    finally { setSaving(false); }
  }
  function remove(item: Category) { Modal.confirm({ title: `Delete ${item.name}?`, content: "A category can only be deleted when it has no products.", okText: "Delete category", okButtonProps: { danger: true }, async onOk() { try { await api(`/categories/${item.id}`, { method: "DELETE" }); message.success("Category deleted."); await load(); } catch (caught) { message.error(caught instanceof Error ? caught.message : "Category could not be deleted."); } } }); }

  return <div className="view-enter">
    <PageHeader title="Categories" description="Keep the catalog organized with a simple, reusable category list." actions={canManage && <Button type="primary" icon={<PlusOutlined />} onClick={() => open()}>Add category</Button>} />
    {error && <Alert type="error" showIcon message={error} className="section-alert" />}
    <section className="ledger-panel"><Table<Category> rowKey="id" loading={loading} dataSource={items} pagination={false} columns={[
      { title: "Category", dataIndex: "name", render: (value) => <strong>{value}</strong> },
      { title: "Description", dataIndex: "description", render: (value) => value || "No description" },
      { title: "Active products", dataIndex: "productCount", align: "right", render: (value) => <span className="tabular">{value}</span> },
      { title: "Actions", width: 110, render: (_, row) => canManage && <Space><Button type="text" icon={<EditOutlined />} aria-label={`Edit ${row.name}`} onClick={() => open(row)} />{user?.role === "administrator" && <Button type="text" danger icon={<DeleteOutlined />} aria-label={`Delete ${row.name}`} onClick={() => remove(row)} />}</Space> },
    ]} /></section>
    <Modal title={editing ? "Edit category" : "Add category"} open={modalOpen} onCancel={() => setModalOpen(false)} okText={editing ? "Save changes" : "Create category"} confirmLoading={saving} onOk={() => form.submit()}>
      <Form<CategoryForm> form={form} layout="vertical" requiredMark="optional" onFinish={save}>
        <Form.Item label="Category name" name="name" rules={[{ required: true, message: "Enter a category name." }, { min: 2 }]}><Input autoFocus maxLength={100} /></Form.Item>
        <Form.Item label="Description" name="description"><Input.TextArea rows={3} maxLength={500} showCount /></Form.Item>
      </Form>
    </Modal>
  </div>;
}
