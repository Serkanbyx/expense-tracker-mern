import { InboxIcon } from '@heroicons/react/24/outline';

/**
 * Reusable empty-state placeholder with icon, title, description,
 * and an optional action button.
 */
const EmptyState = ({
  icon: Icon = InboxIcon,
  title = 'No data found',
  description = '',
  action = null,
  compact = false,
}) => (
  <div
    className={`flex flex-col items-center justify-center ${
      compact ? 'py-10' : 'rounded-xl border border-gray-200 bg-white py-16 shadow-sm'
    }`}
  >
    <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gray-100">
      <Icon className="h-8 w-8 text-gray-400" />
    </div>

    <h3 className="mt-4 text-base font-semibold text-gray-800">{title}</h3>

    {description && (
      <p className="mt-1 max-w-xs text-center text-sm text-gray-400">
        {description}
      </p>
    )}

    {action && <div className="mt-4">{action}</div>}
  </div>
);

export default EmptyState;
