"use client";
import React from "react";
import Section from "@/components/ui/Section";
import Card from "@/components/ui/Card";
import Tag from "@/components/ui/Tag";
import caseStudies from "@/data/case-studies.json";

type CaseStudy = {
  id: string;
  company: string;
  industry: string;
  tagline: string;
  challenge: string;
  outcome: string;
  metrics: Record<string, number>;
  businessImpact: Record<string, string>;
  architecture: string[];
  testimonial: string;
  quotePerson: string;
};

function MetricBar({ label, value, max = 100, unit = "%" }: { label: string; value: number; max?: number; unit?: string }) {
  const percentage = (value / max) * 100;
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-sm">
        <span className="text-slate-300">{label}</span>
        <span className="font-semibold text-emerald-400">{value}{unit}</span>
      </div>
      <div className="h-1.5 w-full rounded-full bg-slate-700/50">
        <div
          className="h-1.5 rounded-full bg-gradient-to-r from-emerald-400 to-cyan-400"
          style={{ width: `${Math.min(percentage, 100)}%` }}
        />
      </div>
    </div>
  );
}

function CaseStudyCard({ study }: { study: CaseStudy }) {
  const metricEntries = Object.entries(study.metrics).slice(0, 4);

  return (
    <Card className="overflow-hidden">
      <div className="space-y-4">
        {/* Header */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-lg font-bold text-white">{study.company}</h3>
            <Tag label={study.industry} variant="accent" />
          </div>
          <p className="text-sm text-cyan-300 font-semibold">{study.tagline}</p>
        </div>

        {/* Challenge & Outcome */}
        <div className="space-y-3 border-t border-slate-700/50 pt-3">
          <div>
            <span className="text-xs text-slate-400 uppercase tracking-wide">Challenge</span>
            <p className="text-sm text-slate-200 mt-1">{study.challenge}</p>
          </div>
          <div>
            <span className="text-xs text-emerald-400 uppercase tracking-wide font-semibold">Outcome</span>
            <p className="text-sm text-emerald-300 font-medium mt-1">{study.outcome}</p>
          </div>
        </div>

        {/* Metrics Grid */}
        <div className="space-y-3 border-t border-slate-700/50 pt-3">
          {metricEntries.map(([key, value]) => (
            <MetricBar
              key={key}
              label={key.replace(/([A-Z])/g, " $1").trim()}
              value={Math.round(value)}
              max={100}
              unit={key.includes("Improvement") || key.includes("Reduction") || key.includes("Uptime") ? "%" : "x"}
            />
          ))}
        </div>

        {/* Tech Stack */}
        <div className="border-t border-slate-700/50 pt-3">
          <p className="text-xs text-slate-400 uppercase tracking-wide mb-2">Architecture</p>
          <div className="flex flex-wrap gap-1.5">
            {study.architecture.map((tech) => (
              <Tag key={tech} label={tech} variant="muted" />
            ))}
          </div>
        </div>

        {/* Testimonial */}
        <div className="border-t border-slate-700/50 pt-3 bg-slate-900/30 -mx-4 -mb-4 px-4 py-3 rounded-b-lg">
          <p className="text-sm text-slate-300 italic">"{study.testimonial}"</p>
          <p className="text-xs text-slate-400 mt-2">— {study.quotePerson}</p>
        </div>
      </div>
    </Card>
  );
}

export default function CaseStudiesSection() {
  return (
    <>
      <Section
        id="case-studies"
        title="Case Studies"
        subtitle="How we deliver scalable systems that drive measurable business impact"
      >
      {/* Overview Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-12">
        <Card>
          <div className="text-center">
            <div className="text-3xl font-black text-emerald-400 mb-1">90%</div>
            <p className="text-sm text-slate-400">Product Code Quality + Security Enhancements</p>
          </div>
        </Card>
        <Card>
          <div className="text-center">
            <div className="text-3xl font-black text-cyan-400 mb-1">99.95%</div>
            <p className="text-sm text-slate-400">Avg. Uptime</p>
          </div>
        </Card>
        <Card>
          <div className="text-center">
            <div className="text-3xl font-black text-purple-400 mb-1">10x</div>
            <p className="text-sm text-slate-400">Deployment Speed</p>
          </div>
        </Card>
        <Card>
          <div className="text-center">
            <div className="text-3xl font-black text-orange-400 mb-1">65%</div>
            <p className="text-sm text-slate-400">Avg. Optimization</p>
          </div>
        </Card>
      </div>

      {/* Case Studies Grid */}
      <div className="grid gap-6 lg:grid-cols-3 mb-12">
        {(caseStudies as unknown as CaseStudy[]).map((study) => (
          <CaseStudyCard key={study.id} study={study} />
        ))}
      </div>

      {/* Scalability Visual */}
      <Card className="lg:col-span-3">
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-bold text-white mb-2">Scalability Proof Points</h3>
            <p className="text-sm text-slate-400">How our architectural approach scales reliably</p>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            {/* Growth Trajectory */}
            <div className="space-y-3">
              <h4 className="text-sm font-semibold text-emerald-300 uppercase tracking-wide">User Growth Handled</h4>
              <div className="space-y-4">
                {[
                  { label: "0K → 10K Users", time: "Week 1-4", status: "Flawless" },
                  { label: "10K → 100K Users", time: "Month 2-3", status: "Zero incidents" },
                  { label: "100K → 1M Users", time: "Month 4-6", status: "99.95% uptime" },
                  { label: "1M+ Users", time: "Ongoing", status: "Cost optimized" },
                ].map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-400 to-cyan-400 flex items-center justify-center text-xs font-bold text-black">
                        {idx + 1}
                      </div>
                      <div>
                        <p className="font-semibold text-slate-200">{item.label}</p>
                        <p className="text-xs text-slate-400">{item.time}</p>
                      </div>
                    </div>
                    <span className="text-xs font-semibold text-emerald-400">{item.status}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Performance Metrics */}
            <div className="space-y-3">
              <h4 className="text-sm font-semibold text-cyan-300 uppercase tracking-wide">Performance Under Load</h4>
              <div className="space-y-4">
                {[
                  { metric: "API Latency", baseline: "2.8s", optimized: "980ms", gain: "65% ↓" },
                  { metric: "Throughput", baseline: "100 req/s", optimized: "400 req/s", gain: "4x ↑" },
                  { metric: "Cost per Request", baseline: "$0.002", optimized: "$0.0011", gain: "45% ↓" },
                  { metric: "Deployment Time", baseline: "6 hours", optimized: "15 min", gain: "24x ↓" },
                ].map((item, idx) => (
                  <div key={idx} className="text-sm">
                    <p className="font-semibold text-slate-200 mb-1">{item.metric}</p>
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex gap-4">
                        <span className="text-slate-400">{item.baseline}</span>
                        <span className="text-slate-400">→</span>
                        <span className="text-emerald-300 font-semibold">{item.optimized}</span>
                      </div>
                      <span className="text-orange-400 font-bold">{item.gain}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </Card>

      </Section>
    </>
  );
}
