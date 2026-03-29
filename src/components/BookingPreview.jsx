export default function BookingPreview({ merchant, interactive = false, onBook }) {
  const activeDays = (merchant.availability || []).filter((d) => d.enabled)

  return (
    <div className="bg-white rounded-2xl overflow-hidden shadow-2xl">
      {/* Header */}
      <div className="bg-zinc-900 px-6 py-8 text-center">
        {merchant.photo ? (
          <img src={merchant.photo} alt="" className="w-16 h-16 rounded-full mx-auto mb-3 object-cover border-2 border-amber-400" />
        ) : (
          <div className="w-16 h-16 rounded-full mx-auto mb-3 bg-amber-400/20 flex items-center justify-center">
            <span className="text-amber-400 text-xl font-black">
              {merchant.businessName?.[0]?.toUpperCase() || '?'}
            </span>
          </div>
        )}
        <h2 className="text-white font-bold text-lg">{merchant.businessName || 'Your Business'}</h2>
        {merchant.category && (
          <p className="text-zinc-400 text-xs mt-1">{merchant.category}</p>
        )}
        {merchant.bio && (
          <p className="text-zinc-400 text-sm mt-2 line-clamp-2">{merchant.bio}</p>
        )}
      </div>

      {/* Services */}
      <div className="p-5">
        {merchant.services?.length > 0 ? (
          <div className="space-y-2">
            <p className="text-zinc-500 text-xs font-semibold uppercase tracking-wider mb-3">Services</p>
            {merchant.services.map((s) => (
              <div key={s.id} className="flex items-center justify-between p-3 bg-zinc-50 rounded-xl">
                <div>
                  <p className="text-zinc-900 font-semibold text-sm">{s.name}</p>
                  <p className="text-zinc-400 text-xs">{s.duration} min</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-zinc-900 font-bold">${s.price.toFixed(2)}</span>
                  {interactive && (
                    <button
                      onClick={() => onBook?.(s)}
                      className="px-3 py-1.5 bg-amber-400 text-zinc-900 text-xs font-bold rounded-lg hover:bg-amber-300 transition"
                    >
                      Book
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-6">
            <p className="text-zinc-300 text-sm">No services added yet</p>
          </div>
        )}

        {/* Hours */}
        {activeDays.length > 0 && (
          <div className="mt-5 pt-4 border-t border-zinc-100">
            <p className="text-zinc-500 text-xs font-semibold uppercase tracking-wider mb-2">Hours</p>
            <div className="grid grid-cols-2 gap-x-4 gap-y-1">
              {activeDays.map((d) => (
                <div key={d.day} className="flex justify-between text-xs">
                  <span className="text-zinc-500 font-medium">{d.day}</span>
                  <span className="text-zinc-700">{d.open} – {d.close}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {merchant.location && (
          <div className="mt-4 pt-3 border-t border-zinc-100">
            <p className="text-zinc-400 text-xs flex items-center gap-1">
              <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              {merchant.location}
            </p>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="px-5 pb-4">
        <div className="text-center">
          <p className="text-zinc-300 text-[10px]">Powered by ServeUp</p>
        </div>
      </div>
    </div>
  )
}
