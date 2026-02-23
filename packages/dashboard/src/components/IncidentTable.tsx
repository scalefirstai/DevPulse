import { formatDateFull, formatDuration } from '../utils/formatters';

interface IncidentRow {
  id: string;
  severity: string;
  title: string;
  detectedAt: string;
  mttrc: number | null;
  rootCauseMethod: string | null;
  isRecurring: boolean;
}

interface IncidentTableProps {
  incidents: IncidentRow[];
}

const SEVERITY_STYLES: Record<string, string> = {
  p1: 'bg-red-500/10 text-red-400',
  p2: 'bg-amber-500/10 text-amber-400',
  p3: 'bg-blue-500/10 text-blue-400',
  p4: 'bg-gray-500/10 text-gray-400',
};

export default function IncidentTable({ incidents }: IncidentTableProps) {
  if (incidents.length === 0) return null;

  return (
    <div className="rounded-xl border border-gray-800 bg-gray-900 overflow-hidden">
      <div className="px-5 py-3 border-b border-gray-800">
        <h3 className="text-sm font-medium text-gray-400">Recent Incidents</h3>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-800">
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Severity</th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Title</th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Detected</th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">MTTRC</th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Root Cause Method</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-800">
            {incidents.map((inc) => (
              <tr key={inc.id} className="hover:bg-gray-800/50 transition-colors">
                <td className="px-4 py-2">
                  <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium uppercase ${SEVERITY_STYLES[inc.severity] || SEVERITY_STYLES.p4}`}>
                    {inc.severity}
                    {inc.isRecurring && ' (R)'}
                  </span>
                </td>
                <td className="px-4 py-2 text-gray-200">{inc.title}</td>
                <td className="px-4 py-2 text-gray-400">{formatDateFull(inc.detectedAt)}</td>
                <td className="px-4 py-2 text-gray-200">
                  {inc.mttrc !== null ? formatDuration(inc.mttrc) : '--'}
                </td>
                <td className="px-4 py-2 text-gray-400 capitalize">
                  {inc.rootCauseMethod?.replace('_', ' ') || '--'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
