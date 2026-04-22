import { DashboardWrapper } from "@/components/layout/DashboardWrapper";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <DashboardWrapper>{children}</DashboardWrapper>;
}
