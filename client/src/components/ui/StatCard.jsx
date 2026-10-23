const StatCard = ({
  title,
  value,
  icon: Icon,
  iconColor = 'text-emerald-600',
  iconBg = 'bg-emerald-50',
  trend,
  trendLabel,
  loading = false,
}) => {
  if (loading) {
    return (
      <div className="stat-card">
        <div className="flex items-start justify-between">
          <div className="skeleton h-4 w-28 mb-3" />
          <div className="skeleton w-9 h-9 rounded-lg" />
        </div>
        <div className="skeleton h-7 w-20 mb-1" />
        <div className="skeleton h-3 w-24" />
      </div>
    );
  }

  return (
    <div className="stat-card group hover:shadow-md transition-shadow duration-200">
      <div className="flex items-start justify-between mb-3">
        <p className="text-sm font-medium text-gray-500">{title}</p>
        {Icon && (
          <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${iconBg}`}>
            <Icon className={`w-4 h-4 ${iconColor}`} />
          </div>
        )}
      </div>
      <p className="text-2xl font-bold text-gray-900 mb-1">{value}</p>
      {(trend !== undefined || trendLabel) && (
        <p className="text-xs text-gray-400">{trendLabel}</p>
      )}
    </div>
  );
};

export default StatCard;
