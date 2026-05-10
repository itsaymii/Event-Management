import React from 'react';

const steps = [
  {
    title: 'Submit request',
    desc: 'Enter event details, venue, and equipment in one form.',
  },
  {
    title: 'Auto review',
    desc: 'Requests enter the OSAS queue automatically for review.',
  },
  {
    title: 'Team decision',
    desc: 'Approve, reject, or pause with comments for follow-up.',
  },
  {
    title: 'Inventory check',
    desc: 'Property verifies equipment availability in real time.',
  },
  {
    title: 'Confirm booking',
    desc: 'Lock venue and assets, then notify the requester instantly.',
  },
];

export default function WorkflowSection() {
  return (
    <section id="workflow" className="relative bg-white px-6 py-24 lg:px-8 overflow-hidden">
      {/* Soft Gradient Background Element */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-cyan-50/40 blur-[120px] rounded-full -z-10" />

      <div className="mx-auto max-w-7xl">
        <div className="text-center">
          <h2 className="text-sm font-semibold uppercase tracking-[0.3em] text-cyan-600">
            Process Timeline
          </h2>
          <p className="mt-4 text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl">
            A workflow that <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-600 to-indigo-600">just flows</span>
          </p>
          <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-slate-600">
            Five steps from request to reserved — with zero spreadsheets in between.
          </p>
        </div>

        <div className="mt-20 relative">
          {/* Horizontal Line for Desktop (hidden on mobile) */}
          <div className="absolute top-12 left-0 hidden h-0.5 w-full bg-slate-100 lg:block" aria-hidden="true">
            <div className="h-full w-1/2 bg-gradient-to-r from-transparent via-cyan-200 to-transparent" />
          </div>

          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-5">
            {steps.map((step, index) => (
              <div key={step.title} className="group relative">
                {/* Number Badge */}
                <div className="relative z-10 flex h-24 items-center justify-center lg:h-auto lg:justify-start lg:pb-10">
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-slate-200 bg-white text-xl font-bold text-slate-900 shadow-sm transition-all duration-300 group-hover:border-cyan-500 group-hover:text-cyan-600 group-hover:shadow-md group-hover:shadow-cyan-500/10">
                    {index + 1}
                  </div>
                </div>

                {/* Content */}
                <div className="relative flex flex-col pt-4">
                  <div className="mb-2 h-1 w-12 rounded-full bg-cyan-600 opacity-0 transition-all duration-300 group-hover:w-20 group-hover:opacity-100" />
                  <h3 className="text-lg font-bold text-slate-900 tracking-tight">
                    {step.title}
                  </h3>
                  <p className="mt-3 text-sm leading-6 text-slate-500 font-medium">
                    {step.desc}
                  </p>
                </div>

                {/* Mobile Connector (visible only on mobile) */}
                {index !== steps.length - 1 && (
                  <div className="absolute left-7 top-14 -z-10 h-full w-px border-l-2 border-dotted border-slate-200 lg:hidden" />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}