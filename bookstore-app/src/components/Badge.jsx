export default function Badge({ status }) {
  const styles = {
    Processing:  'bg-blue-50 text-blue-700 border border-blue-200',
    Delivered:   'bg-green-50 text-green-700 border border-green-200',
    Shipped:     'bg-indigo-50 text-indigo-700 border border-indigo-200',
    Returned:    'bg-amber-50 text-amber-700 border border-amber-200',
    Cancelled:   'bg-red-50 text-red-600 border border-red-200',
    Gold:        'bg-yellow-50 text-yellow-700 border border-yellow-200',
    Silver:      'bg-gray-100 text-gray-600 border border-gray-200',
    'In Transit':'bg-sky-50 text-sky-700 border border-sky-200',
  };

  const dot = {
    Processing:  'bg-blue-500',
    Delivered:   'bg-green-500',
    Shipped:     'bg-indigo-500',
    Returned:    'bg-amber-500',
    Cancelled:   'bg-red-500',
    'In Transit':'bg-sky-500',
  };

  return (
    <span className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full ${styles[status] || 'bg-gray-100 text-gray-600 border border-gray-200'}`}>
      {dot[status] && <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${dot[status]}`} />}
      {status}
    </span>
  );
}
