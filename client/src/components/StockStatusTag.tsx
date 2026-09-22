import { Tag } from "antd";
import { CheckCircleFilled, ExclamationCircleFilled, MinusCircleFilled } from "@ant-design/icons";
import type { StockStatus } from "../types";

const statusConfig = {
  IN_STOCK: { color: "success", label: "In stock", icon: <CheckCircleFilled aria-hidden="true" /> },
  LOW_STOCK: { color: "warning", label: "Low stock", icon: <ExclamationCircleFilled aria-hidden="true" /> },
  OUT_OF_STOCK: { color: "error", label: "Out of stock", icon: <MinusCircleFilled aria-hidden="true" /> },
} as const;

export function StockStatusTag({ status }: { status: StockStatus }) {
  const config = statusConfig[status];
  return <Tag color={config.color} icon={config.icon}>{config.label}</Tag>;
}

