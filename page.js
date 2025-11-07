
import React, { useState } from 'react';
import projects from '../data/projects.json';

const API_BASE = 'https://base.blockscout.com/api';

export default function Home() {
  const [address, setAddress] = useState('');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState([]);
  const [score, setScore] = useState(null);

  const checkEligibility = async (addr) => {
    setLoading(true);
    setResults([]);
    setScore(null);

    try {
      const txResp = await fetch(`${API_BASE}?module=account&action=txlist&address=${addr}`);
      const txJson = await txResp.json();
      const txs = Array.isArray(txJson.result) ? txJson.result : [];
      const txCount = txs.length;
      const toAddresses = new Set(txs.map(t => t.to?.toLowerCase()).filter(Boolean));

      const resultsTemp = projects.map(p => {
        const interacted = p.contract && toAddresses.has(p.contract.toLowerCase());
        const eligible = interacted || txCount > 0;
        return {
          name: p.name,
          interacted,
          eligible,
          weight: p.weight || 20,
        };
      });

      const totalScore = resultsTemp.reduce((sum, r) => sum + (r.eligible ? r.weight : 0), 0);
      setResults(resultsTemp);
      setScore(totalScore);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!address.startsWith('0x')) return alert('Please enter a valid address');
    checkEligibility(address.trim());
  };

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 p-6">
      <div className="max-w-2xl mx-auto bg-white shadow-lg rounded-2xl p-6">
        <h1 className="text-2xl font-bold mb-2">BaseDrop Scout</h1>
        <p className="text-sm text-gray-600 mb-4">
          Check your Base ecosystem airdrop readiness (read-only, no wallet connect).
        </p>

        <form onSubmit={handleSubmit} className="flex gap-2 mb-4">
          <input
            value={address}
            onChange={e => setAddress(e.target.value)}
            placeholder="Enter Base wallet address (0x...)"
            className="flex-1 p-2 border border-gray-300 rounded-lg"
          />
          <button disabled={loading} className="px-4 py-2 bg-blue-600 text-white rounded-lg">
            {loading ? 'Checking...' : 'Check'}
          </button>
        </form>

        {score !== null && (
          <div className="mb-4">
            <div className="text-lg font-semibold">Overall Score: {score}/100</div>
            <div className="text-sm text-gray-500">
              {score >= 80 && 'Likely Eligible'}
              {score >= 40 && score < 80 && 'Some Activity'}
              {score < 40 && 'Inactive / No Base activity'}
            </div>
          </div>
        )}

        {results.length > 0 && (
          <div className="space-y-3">
            {results.map((r) => (
              <div key={r.name} className="border border-gray-200 p-3 rounded-lg flex justify-between items-center">
                <div>
                  <div className="font-medium">{r.name}</div>
                  <div className="text-sm text-gray-500">{r.interacted ? 'Interacted with project' : 'No on-chain interaction yet'}</div>
                </div>
                <span className={`text-sm font-semibold ${r.eligible ? 'text-green-600' : 'text-gray-400'}`}>
                  {r.eligible ? 'Eligible' : 'Inactive'}
                </span>
              </div>
            ))}
          </div>
        )}

        {loading && <p className="mt-4 text-sm text-gray-500">Fetching on-chain data...</p>}
      </div>
    </div>
  );
}
