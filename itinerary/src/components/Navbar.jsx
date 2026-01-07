export default function Navbar() {
  return (
    <nav className="flex justify-between items-center p-6 bg-white border-b border-slate-100 sticky top-0 z-50">
      <div className="text-2xl font-bold text-indigo-600 flex items-center gap-2">
        <span className="text-3xl">✈️</span> NomadicAI
      </div>
      <button className="bg-indigo-600 text-white px-5 py-2 rounded-full font-medium hover:bg-indigo-700 transition">
        Login
      </button>
    </nav>
  );
}
