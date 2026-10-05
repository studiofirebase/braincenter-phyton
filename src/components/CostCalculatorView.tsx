import React, { useState } from 'react';
import {
  DollarSign,
  TrendingDown,
  CheckCircle2,
  Zap,
  Server,
  Database,
  HardDrive,
  Layers,
  ShieldCheck
} from 'lucide-react';

export const CostCalculatorView: React.FC = () => {
  const [dailyRequests, setDailyRequests] = useState(25000);
  const [storageGb, setStorageGb] = useState(3.5);
  const [monthlyBuilds, setMonthlyBuilds] = useState(45);

  const costItems = [
    {
      service: 'Cloudflare Pages',
      spec: 'Next.js 15 Frontend Hosting',
      freeLimit: '500 builds / month · Unlimited Bandwidth',
      cfCost: 0,
      altHost: 'Vercel Pro',
      altCost: 20
    },
    {
      service: 'Cloudflare Workers',
      spec: 'Python FastAPI Microservice',
      freeLimit: '100,000 requests / day (3,000,000 / mo)',
      cfCost: 0,
      altHost: 'AWS Lambda + API Gateway',
      altCost: 18
    },
    {
      service: 'Cloudflare D1 Database',
      spec: 'Relational SQLite / Postgres DDL',
      freeLimit: '5 GB Storage · 5 Million reads / day',
      cfCost: 0,
      altHost: 'Supabase Pro / AWS Aurora',
      altCost: 25
    },
    {
      service: 'Cloudflare R2 Storage',
      spec: 'Object Media Bucket (Zero Egress)',
      freeLimit: '10 GB Storage · 1M Class A · 10M Class B',
      cfCost: 0,
      altHost: 'Amazon S3 + Egress Bandwidth',
      altCost: 35
    },
    {
      service: 'Cloudflare KV Namespaces',
      spec: 'Edge Cache & Session Storage',
      freeLimit: '100,000 reads / day · 1,000 writes / day',
      cfCost: 0,
      altHost: 'Upstash Redis / Redis Cloud',
      altCost: 15
    },
    {
      service: 'Cloudflare CDN, DNS & WAF',
      spec: 'DDoS Protection & SSL Certificates',
      freeLimit: 'Unlimited DDoS protection & DNS queries',
      cfCost: 0,
      altHost: 'AWS CloudFront + Route53 + Shield',
      altCost: 30
    }
  ];

  const totalAltCost = costItems.reduce((acc, curr) => acc + curr.altCost, 0);
  const annualSavings = totalAltCost * 12;

  // Usage meter calculations
  const workersPct = ((dailyRequests / 100000) * 100).toFixed(1);
  const storagePct = ((storageGb / 10) * 100).toFixed(1);
  const buildsPct = ((monthlyBuilds / 500) * 100).toFixed(1);

  return (
    <div className="space-y-8">
      {/* Top Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 sm:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 text-xs text-emerald-400 mb-2 font-mono">
            <span>ZERO CLOUD EXPENDITURE</span>
            <span>·</span>
            <span>CLOUDFLARE EDGE FREE TIER</span>
          </div>
          <h2 className="text-2xl font-bold text-white tracking-tight">
            Cost & Capacity Matrix: Cerebrocentral
          </h2>
          <p className="mt-1 text-sm text-slate-400 max-w-xl">
            By running Next.js 15 on Cloudflare Pages and Python FastAPI on Workers, your complete
            production environment operates at zero marginal cost.
          </p>
        </div>

        <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-right min-w-[200px]">
          <div className="text-xs text-slate-400 uppercase tracking-wider font-semibold">
            Total Monthly Cost
          </div>
          <div className="text-4xl font-bold text-emerald-400 font-mono my-1">$0.00</div>
          <div className="text-xs text-slate-500 font-mono">100% Free Tier</div>
        </div>
      </div>

      {/* Savings Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
          <div className="text-xs text-slate-400 uppercase font-semibold">Monthly Cloud Savings</div>
          <div className="text-2xl font-bold text-white font-mono mt-1 tabular-nums">
            ${totalAltCost}.00 / mo
          </div>
          <p className="text-xs text-slate-500 mt-1">vs AWS / Vercel / Supabase equivalent</p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
          <div className="text-xs text-slate-400 uppercase font-semibold">Annualized Savings</div>
          <div className="text-2xl font-bold text-emerald-400 font-mono mt-1 tabular-nums">
            ${annualSavings.toLocaleString()}.00 / yr
          </div>
          <p className="text-xs text-slate-500 mt-1">Direct operational runway preserved</p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
          <div className="text-xs text-slate-400 uppercase font-semibold">Egress Bandwidth Fee</div>
          <div className="text-2xl font-bold text-purple-400 font-mono mt-1 tabular-nums">$0.00</div>
          <p className="text-xs text-slate-500 mt-1">Zero egress fees on Cloudflare R2 & CDN</p>
        </div>
      </div>

      {/* Interactive Quota Simulator */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-5">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div>
            <h3 className="text-sm font-semibold text-white">Simulated Traffic & Quota Thresholds</h3>
            <p className="text-xs text-slate-400">
              Drag sliders to test your expected traffic against Cloudflare free limits.
            </p>
          </div>
          <span className="text-xs font-mono text-emerald-400 bg-emerald-950/60 border border-emerald-800/40 px-2 py-0.5 rounded">
            All Within Free Limits
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Worker Requests */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs font-mono">
              <span className="text-slate-300">Daily API Requests</span>
              <span className="text-orange-400 tabular-nums">
                {dailyRequests.toLocaleString()} / 100k ({workersPct}%)
              </span>
            </div>
            <input
              type="range"
              min={1000}
              max={100000}
              step={1000}
              value={dailyRequests}
              onChange={(e) => setDailyRequests(Number(e.target.value))}
              className="w-full accent-orange-500 cursor-pointer"
            />
            <div className="h-1.5 w-full bg-slate-950 rounded-full overflow-hidden">
              <div className="h-full bg-orange-500 rounded-full" style={{ width: `${workersPct}%` }} />
            </div>
          </div>

          {/* R2 + D1 Storage */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs font-mono">
              <span className="text-slate-300">R2 Object Storage</span>
              <span className="text-purple-400 tabular-nums">
                {storageGb} GB / 10 GB ({storagePct}%)
              </span>
            </div>
            <input
              type="range"
              min={0.5}
              max={10}
              step={0.5}
              value={storageGb}
              onChange={(e) => setStorageGb(Number(e.target.value))}
              className="w-full accent-purple-500 cursor-pointer"
            />
            <div className="h-1.5 w-full bg-slate-950 rounded-full overflow-hidden">
              <div className="h-full bg-purple-500 rounded-full" style={{ width: `${storagePct}%` }} />
            </div>
          </div>

          {/* Pages Builds */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs font-mono">
              <span className="text-slate-300">Pages CI/CD Builds</span>
              <span className="text-sky-400 tabular-nums">
                {monthlyBuilds} / 500 ({buildsPct}%)
              </span>
            </div>
            <input
              type="range"
              min={5}
              max={500}
              step={5}
              value={monthlyBuilds}
              onChange={(e) => setMonthlyBuilds(Number(e.target.value))}
              className="w-full accent-sky-500 cursor-pointer"
            />
            <div className="h-1.5 w-full bg-slate-950 rounded-full overflow-hidden">
              <div className="h-full bg-sky-500 rounded-full" style={{ width: `${buildsPct}%` }} />
            </div>
          </div>
        </div>
      </div>

      {/* Comparison Matrix Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
        <h3 className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
          Service by Service Free Tier Matrix
        </h3>

        <div className="overflow-x-auto border border-slate-800 rounded-lg">
          <table className="w-full text-left text-xs font-mono">
            <thead className="bg-slate-950/80 border-b border-slate-800 text-slate-400 text-[11px]">
              <tr>
                <th className="py-3 px-4">Cloudflare Component</th>
                <th className="py-3 px-4">Application Role</th>
                <th className="py-3 px-4">Free Tier Capacity</th>
                <th className="py-3 px-4 text-emerald-400">CF Cost</th>
                <th className="py-3 px-4 text-slate-400">Paid Cloud Alternative</th>
                <th className="py-3 px-4 text-slate-400">Alternative Cost</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80">
              {costItems.map((item, idx) => (
                <tr key={idx} className="hover:bg-slate-800/40 transition-colors">
                  <td className="py-3 px-4 font-semibold text-slate-100">{item.service}</td>
                  <td className="py-3 px-4 text-slate-400">{item.spec}</td>
                  <td className="py-3 px-4 text-slate-300">{item.freeLimit}</td>
                  <td className="py-3 px-4 text-emerald-400 font-bold">$0.00</td>
                  <td className="py-3 px-4 text-slate-400">{item.altHost}</td>
                  <td className="py-3 px-4 text-slate-500 tabular-nums">${item.altCost}/mo</td>
                </tr>
              ))}
            </tbody>
            <tfoot className="bg-slate-950 font-bold border-t border-slate-700">
              <tr>
                <td colSpan={3} className="py-3 px-4 text-right text-slate-300">
                  Total Monthly Cost:
                </td>
                <td className="py-3 px-4 text-emerald-400 text-sm">$0.00</td>
                <td className="py-3 px-4 text-slate-400">Total Alternative:</td>
                <td className="py-3 px-4 text-slate-300 text-sm">${totalAltCost}.00 / mo</td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </div>
  );
};
