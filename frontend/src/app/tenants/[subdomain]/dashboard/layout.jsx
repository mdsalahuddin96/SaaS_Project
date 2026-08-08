import DashboardSidebar from "@/components/dashboard/DashboardSidebar";

export default async function DashboardLayout({ children, params }) {
  const { subdomain } =await params;
  const NavItems=[
    {text:"Bookings", href:"/dashboard"},
    {text:"Customers", href:"/dashboard/customers"},
    {text:"Pricing", href:"/dashboard/pricing"},
    {text:"Billing", href:"/dashboard/billing"},
  ]
  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-slate-900 text-slate-100 font-inter">
      {/* Responsive Sidebar */}
      <DashboardSidebar subdomain={subdomain} navItems={NavItems}/>

      {/* Main content area*/}
      <main className="flex-1 p-8">
        <header className="mb-8 border-b border-slate-800 pb-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold">Dashboard Overview</h1>
          <div className="text-sm text-slate-400">Tenant ID mode: Active</div>
        </header>
        {children}
      </main>
    </div>
  );
}