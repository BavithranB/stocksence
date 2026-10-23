import EmptyState from '../ui/EmptyState';

const PlaceholderPage = ({
  title,
  description,
  icon,
  emptyTitle = 'Coming soon',
  emptyDescription = 'This module is under development and will be available in a future phase.',
  actions,
  filters,
}) => {
  return (
    <div>
      {/* Page header */}
      <div className="page-header flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="page-title">{title}</h1>
          <p className="page-description">{description}</p>
        </div>
        {actions && <div className="flex items-center gap-2 shrink-0">{actions}</div>}
      </div>

      {/* Filters */}
      {filters && (
        <div className="card p-4 mb-6 flex flex-wrap items-center gap-3">
          {filters}
        </div>
      )}

      {/* Content area */}
      <div className="card">
        <EmptyState
          icon={icon}
          title={emptyTitle}
          description={emptyDescription}
        />
      </div>
    </div>
  );
};

export default PlaceholderPage;
