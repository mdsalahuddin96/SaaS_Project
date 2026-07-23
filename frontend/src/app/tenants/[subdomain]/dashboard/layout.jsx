export default async function DashboardLayout({ children, params }) {
  const { subdomain } =await params;
  return (
    <div className="flex min-h-screen bg-slate-900 text-slate-100 font-inter">
      {/* Responsive Sidebar */}
      <aside className="w-64 bg-slate-950 border-r border-slate-800 p-6 hidden md:block">
        <div className="mb-8 font-bold text-xl uppercase tracking-wider text-indigo-400">
          {subdomain} Panel
        </div>
        <nav className="space-y-4">
          <a href="#" className="block p-3 rounded-lg bg-indigo-600 text-white font-medium">Bookings</a>
          <a href="#" className="block p-3 rounded-lg text-slate-400 hover:bg-slate-900 transition">Customers</a>
          <a href="#" className="block p-3 rounded-lg text-slate-400 hover:bg-slate-900 transition">Settings</a>
        </nav>
      </aside>

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