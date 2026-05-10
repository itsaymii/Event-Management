import React from 'react';

const roles = [
  {
    role: 'User',
    title: 'Requestors',
    description: 'Empowering students and faculty to initiate requests seamlessly.',
    items: ['Submit applications', 'View status (Pending / Approved / Rejected)', 'Edit or cancel requests'],
    color: 'from-cyan-500 to-blue-500',
    bgLight: 'bg-cyan-50/50',
    iconBg: 'bg-cyan-100 text-cyan-600',
  },
  {
    role: 'OSAS',
    title: 'Administrators',
    description: 'Complete oversight of the approval lifecycle and user management.',
    items: ['Review applications', 'Approve · Reject · Pending', 'Manage users and remarks'],
    color: 'from-blue-600 to-indigo-600',
    bgLight: 'bg-blue-50/50',
    iconBg: 'bg-blue-100 text-blue-600',
  },
  {
    role: 'Property',
    title: 'Inventory Managers',
    description: 'Real-time tracking and maintenance of institutional assets.',
    items: ['Manage equipment', 'Track availability', 'Handle equipment requests'],
    color: 'from-indigo-500 to-purple-500',
    bgLight: 'bg-indigo-50/50',
    iconBg: 'bg-indigo-100 text-indigo-600',
  },
];

export default function RolesSection() {
  return (
    <section id="roles" className="relative overflow-hidden bg-slate-50/50 py-24 sm:py-32">
      {/* Background Decorative Blob */}
      <div className="absolute -top-24 -right-24 h-96 w-96 rounded-full bg-cyan-100/50 blur-3xl" />
      <div className="absolute -bottom-24 -left-24 h-96 w-96 rounded-full bg-indigo-100/50 blur-3xl" />

      <div className="relative mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-base font-semibold uppercase tracking-[0.2em] text-cyan-600">
            Role-Based Access
          </h2>
          <p className="mt-4 text-4xl font-bold tracking-tight text-slate-900 sm:text-6xl">
            One platform. <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-600 to-indigo-600">Three workflows.</span>
          </p>
          <p className="mt-6 text-lg leading-8 text-slate-600">
            A centralized system designed to cater to the specific needs of every department involved.
          </p>
        </div>

        <div className="mx-auto mt-16 grid max-w-2xl grid-cols-1 gap-8 lg:mx-0 lg:max-w-none lg:grid-cols-3">
          {roles.map((card) => (
            <div
              key={card.role}
              className="group relative flex flex-col justify-between rounded-3xl border border-slate-200 bg-white p-8 shadow-sm transition-all duration-300 hover:-translate-y-2 hover:shadow-xl hover:shadow-cyan-500/10"
            >
              <div>
                <div className={`inline-flex rounded-lg p-3 ${card.iconBg} mb-6 font-bold text-xs tracking-widest uppercase`}>
                  {card.role}
                </div>
                <h3 className="text-2xl font-bold leading-7 text-slate-900">
                  {card.title}
                </h3>
                <p className="mt-4 text-sm leading-6 text-slate-500 font-medium">
                  {card.description}
                </p>
                
                <div className="mt-8 space-y-4">
                  {card.items.map((item) => (
                    <div key={item} className="relative flex items-start gap-3">
                      <div className="mt-1.5 h-1.5 w-1.5 flex-none rounded-full bg-cyan-600" />
                      <p className="text-sm leading-6 text-slate-700">{item}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Decorative Gradient Line at bottom */}
              <div className={`mt-8 h-1 w-full rounded-full bg-gradient-to-r ${card.color} opacity-0 transition-opacity group-hover:opacity-100`} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}