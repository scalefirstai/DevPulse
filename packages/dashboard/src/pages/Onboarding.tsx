import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createTeam } from '../api/teams';

type Step = 'team' | 'connector' | 'collect' | 'done';

export default function Onboarding() {
  const navigate = useNavigate();
  const [step, setStep] = useState<Step>('team');
  const [teamName, setTeamName] = useState('');
  const [teamSlug, setTeamSlug] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleCreateTeam = async () => {
    if (!teamName || !teamSlug) {
      setError('Team name and slug are required');
      return;
    }
    setLoading(true);
    setError('');
    try {
      await createTeam({ name: teamName, slug: teamSlug });
      setStep('connector');
    } catch {
      setError('Failed to create team');
    } finally {
      setLoading(false);
    }
  };

  const handleNameChange = (name: string) => {
    setTeamName(name);
    setTeamSlug(name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''));
  };

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100 flex items-center justify-center p-8">
      <div className="max-w-lg w-full">
        <div className="text-center mb-8">
          <div className="inline-flex h-12 w-12 rounded-xl bg-brand-600 items-center justify-center font-bold text-lg mb-4">
            DP
          </div>
          <h1 className="text-2xl font-bold">Welcome to DevPulse</h1>
          <p className="text-gray-400 mt-2">Let's set up your engineering health dashboard.</p>
        </div>

        {/* Progress */}
        <div className="flex items-center justify-center gap-2 mb-8">
          {(['team', 'connector', 'collect'] as Step[]).map((s, i) => (
            <div key={s} className="flex items-center gap-2">
              <div className={`h-8 w-8 rounded-full flex items-center justify-center text-sm font-medium ${
                step === s ? 'bg-brand-600 text-white' :
                (s === 'team' && step !== 'team') ? 'bg-emerald-500 text-white' :
                'bg-gray-800 text-gray-500'
              }`}>
                {(s === 'team' && step !== 'team') ? '\u2713' : i + 1}
              </div>
              {i < 2 && <div className="w-12 h-px bg-gray-700" />}
            </div>
          ))}
        </div>

        <div className="rounded-xl border border-gray-800 bg-gray-900 p-6">
          {step === 'team' && (
            <div className="space-y-4">
              <h2 className="text-lg font-semibold">Create Your First Team</h2>
              <div>
                <label className="block text-sm text-gray-400 mb-1">Team Name</label>
                <input
                  type="text"
                  value={teamName}
                  onChange={(e) => handleNameChange(e.target.value)}
                  placeholder="e.g., Platform"
                  className="w-full rounded-lg bg-gray-800 border border-gray-700 px-3 py-2 text-sm text-gray-200"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">Slug</label>
                <input
                  type="text"
                  value={teamSlug}
                  onChange={(e) => setTeamSlug(e.target.value)}
                  placeholder="e.g., platform"
                  className="w-full rounded-lg bg-gray-800 border border-gray-700 px-3 py-2 text-sm text-gray-200"
                />
              </div>
              {error && <p className="text-sm text-red-400">{error}</p>}
              <button
                onClick={handleCreateTeam}
                disabled={loading}
                className="w-full rounded-lg bg-brand-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-brand-700 disabled:opacity-50"
              >
                {loading ? 'Creating...' : 'Create Team'}
              </button>
            </div>
          )}

          {step === 'connector' && (
            <div className="space-y-4">
              <h2 className="text-lg font-semibold">Configure Data Source</h2>
              <p className="text-sm text-gray-400">
                Connect a GitHub repository to start collecting engineering metrics.
                You can configure additional connectors later in Settings.
              </p>
              <div className="rounded-lg border border-gray-700 p-4 flex items-center gap-3 cursor-pointer hover:bg-gray-800">
                <div className="h-10 w-10 rounded-lg bg-gray-800 flex items-center justify-center text-xl">G</div>
                <div>
                  <div className="text-sm font-medium text-gray-200">GitHub</div>
                  <div className="text-xs text-gray-400">Pull requests, commits, and deployments</div>
                </div>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => setStep('collect')}
                  className="flex-1 rounded-lg bg-gray-800 px-4 py-2.5 text-sm font-medium text-gray-300 hover:bg-gray-700"
                >
                  Skip for now
                </button>
                <button
                  onClick={() => setStep('collect')}
                  className="flex-1 rounded-lg bg-brand-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-brand-700"
                >
                  Continue
                </button>
              </div>
            </div>
          )}

          {step === 'collect' && (
            <div className="space-y-4 text-center">
              <h2 className="text-lg font-semibold">You're All Set!</h2>
              <p className="text-sm text-gray-400">
                Your team has been created. Data collection will begin automatically,
                or you can use demo data to explore the dashboard.
              </p>
              <button
                onClick={() => navigate('/')}
                className="w-full rounded-lg bg-brand-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-brand-700"
              >
                Go to Dashboard
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
