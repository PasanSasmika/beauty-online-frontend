export default function AdminDashboard() {
  return (
    <>
      <h1 className="text-4xl font-serif font-bold text-[#000000]">Admin Dashboard</h1>
      <p className="text-stone-500 mt-2">Welcome back.</p>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-10">
        <div className="bg-white p-6 rounded-2xl shadow-sm">
          <h3 className="text-stone-500 text-sm font-bold uppercase">Total Users</h3>
          <p className="text-3xl font-bold text-[#000000] mt-2">1,240</p>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm">
            <h3 className="text-stone-500 text-sm font-bold uppercase">Revenue</h3>
            <p className="text-3xl font-bold text-[#000000] mt-2">$12,450</p>
        </div>
      </div>
    </>
  );
}