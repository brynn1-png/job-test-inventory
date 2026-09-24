import {
  AppstoreOutlined,
  BarChartOutlined,
  FolderOpenOutlined,
  HistoryOutlined,
  LogoutOutlined,
  MenuFoldOutlined,
  MenuOutlined,
  ProductOutlined,
  SwapOutlined,
} from "@ant-design/icons";
import { Avatar, Button, Drawer, Dropdown, Layout, Menu, Space, Typography } from "antd";
import { useMemo, useState } from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthProvider";

const { Header, Sider, Content } = Layout;

const navigation = [
  { key: "/", icon: <AppstoreOutlined />, label: "Dashboard" },
  { key: "/products", icon: <ProductOutlined />, label: "Products" },
  { key: "/categories", icon: <FolderOpenOutlined />, label: "Categories" },
  { key: "/stock", icon: <SwapOutlined />, label: "Stock movement" },
  { key: "/transactions", icon: <HistoryOutlined />, label: "Transactions" },
  { key: "/reports", icon: <BarChartOutlined />, label: "Reports" },
];

function Brand() {
  return (
    <div className="brand-lockup">
      <img src="/inventory-mark.svg" alt="" aria-hidden="true" />
      <div><strong>Inventory</strong><span>Management system</span></div>
    </div>
  );
}

export function AppShell() {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const selected = location.pathname === "/" ? "/" : `/${location.pathname.split("/")[1]}`;

  const initials = useMemo(() => user?.fullName.split(" ").map((part) => part[0]).slice(0, 2).join("").toUpperCase(), [user]);
  const menu = (
    <Menu mode="inline" selectedKeys={[selected]} items={navigation} onClick={({ key }) => { setMobileOpen(false); navigate(key); }} className="app-menu" />
  );

  return (
    <Layout className="app-layout">
      <Sider className="desktop-sider" width={252} collapsedWidth={84} collapsed={collapsed} trigger={null}>
        <Brand />
        <nav aria-label="Primary navigation">{menu}</nav>
        <Button className="collapse-button" type="text" icon={<MenuFoldOutlined rotate={collapsed ? 180 : 0} />} onClick={() => setCollapsed((value) => !value)}>
          {!collapsed && "Collapse menu"}
        </Button>
      </Sider>

      <Drawer className="mobile-nav" placement="left" width={292} open={mobileOpen} onClose={() => setMobileOpen(false)} title={<Brand />}>
        <nav aria-label="Primary navigation">{menu}</nav>
      </Drawer>

      <Layout>
        <Header className="topbar">
          <Button className="mobile-menu-button" type="text" icon={<MenuOutlined />} aria-label="Open navigation" onClick={() => setMobileOpen(true)} />
          <div className="topbar-status"><span className="status-dot" /> Operational workspace</div>
          <Dropdown menu={{ items: [{ key: "logout", icon: <LogoutOutlined />, label: "Sign out", onClick: logout }] }} trigger={["click"]}>
            <Button type="text" className="account-button">
              <Space>
                <Avatar className="account-avatar">{initials}</Avatar>
                <span className="account-copy"><Typography.Text strong>{user?.fullName}</Typography.Text><small>{user?.role}</small></span>
              </Space>
            </Button>
          </Dropdown>
        </Header>
        <Content className="app-content"><Outlet /></Content>
      </Layout>
    </Layout>
  );
}
