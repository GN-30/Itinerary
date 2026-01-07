export default function DayCard({ day, activities = [] }) {
  return (
    <div className="p-6 bg-white rounded-2xl shadow-sm border border-slate-100 hover:border-indigo-200 transition-colors">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center font-bold">
          {day}
        </div>
        <h3 className="text-lg font-bold text-slate-800">Day {day} Schedule</h3>
      </div>
      <ul className="space-y-3">
        {activities.map((act, i) => (
          <li key={i} className="flex items-start gap-3 text-slate-600">
            <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-indigo-400 shrink-0" />
            <span className="text-sm md:text-base leading-tight">{act}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
