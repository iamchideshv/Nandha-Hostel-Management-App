'use client';

import { motion } from 'framer-motion';
import { ExternalLink, GraduationCap, School, HeartPulse, Stethoscope, Microscope, Settings, Landmark, ShieldCheck } from 'lucide-react';

const institutions = [
    { name: 'Nandha Medical College And Hospital', url: 'http://www.nandhamedicalcollege.org', icon: HeartPulse, color: 'red' },
    { name: 'Nandha Ayurveda Medical College and Hospital', url: 'http://www.nandhaayurveda.org', icon: Stethoscope, color: 'emerald' },
    { name: 'Nandha Siddha Medical College and Hospital', url: 'http://www.nandhasiddha.org', icon: Stethoscope, color: 'green' },
    { name: 'Nandha Naturopathy and Yoga Medical College', url: 'http://www.nandhanaturopathyyoga.org', icon: Landmark, color: 'lime' },
    { name: 'Nandha Dental College and Hospital', url: 'http://www.nandhadentalcollege.org', icon: Microscope, color: 'purple' },
    { name: 'Nandha College of Pharmacy', url: 'http://www.nandhapharmacy.org', icon: HeartPulse, color: 'pink' },
    { name: 'Nandha College of Physiotherapy', url: 'http://www.nandhaphysiotherapy.org', icon: HeartPulse, color: 'cyan' },
    { name: 'Nandha College of Nursing', url: 'http://www.nandhanursingcollege.org', icon: HeartPulse, color: 'rose' },
    { name: 'Nandha School of Nursing', url: 'http://www.nandhaschoolofnursing.org', icon: HeartPulse, color: 'orange' },
    { name: 'Nandha College of Allied Health Sciences', url: 'http://www.nandhaalliedhealth.org', icon: Microscope, color: 'teal' },
    { name: 'Nandha Academy of Allied Health Sciences', url: 'http://www.nandhaacademyahs.org', icon: Microscope, color: 'teal' },
    { name: 'Nandha Institute of Health Science', url: 'http://www.nandhahealthscience.org', icon: HeartPulse, color: 'blue' },
    { name: 'Nandha Engineering College', url: 'http://www.nandhaengg.org', icon: GraduationCap, color: 'blue' },
    { name: 'Nandha College of Technology', url: 'http://www.nandhatech.org', icon: Settings, color: 'green' },
    { name: 'Nandha Polytechnic College', url: 'http://www.nandhapolytechnic.org', icon: Settings, color: 'orange' },
    { name: 'Nandha Arts & Science College', url: 'http://www.nandhaarts.org', icon: School, color: 'sky' },
    { name: 'Nandha College of Education', url: 'http://www.nandhaeducationcollege.org', icon: GraduationCap, color: 'purple' },
    { name: 'Nandha Teacher Training Institute', url: 'http://www.nandhateachertraining.org', icon: GraduationCap, color: 'yellow' },
    { name: 'Nandha Central School', url: 'http://www.nandhacentralschool.org', icon: School, color: 'indigo' },
    { name: 'Nandha Central City School', url: 'http://www.nandhacentralcityschool.org', icon: School, color: 'violet' },
];

export function InstitutionGrid() {
    return (
        <section className="w-full max-w-7xl mx-auto px-4 py-20 overflow-hidden">
            <div className="text-center mb-16 space-y-4">
                <h2 className="text-3xl md:text-5xl font-black text-slate-900 dark:text-white tracking-tight">
                    Our <span className="text-blue-600 dark:text-blue-400">Institutions</span>
                </h2>
                <p className="text-slate-600 dark:text-slate-400 max-w-2xl mx-auto text-lg">
                    Nandha Educational Institutions are committed to excellence in education across medical, engineering, and arts streams.
                </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {institutions.map((inst, index) => (
                    <motion.a
                        key={inst.name}
                        href={inst.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: index * 0.05 }}
                        whileHover={{ y: -5, scale: 1.02 }}
                        className={`group relative p-6 rounded-3xl border-2 transition-all duration-300 bg-white dark:bg-slate-900 flex flex-col items-center text-center gap-4 hover:shadow-2xl hover:shadow-blue-500/10
              ${inst.color === 'blue' ? 'border-blue-50/50 hover:border-blue-500' :
                                inst.color === 'red' ? 'border-red-50/50 hover:border-red-500' :
                                    inst.color === 'green' ? 'border-green-50/50 hover:border-green-500' :
                                        inst.color === 'emerald' ? 'border-emerald-50/50 hover:border-emerald-500' :
                                            inst.color === 'orange' ? 'border-orange-50/50 hover:border-orange-500' :
                                                inst.color === 'purple' ? 'border-purple-50/50 hover:border-purple-500' :
                                                    inst.color === 'pink' ? 'border-pink-50/50 hover:border-pink-500' :
                                                        inst.color === 'sky' ? 'border-sky-50/50 hover:border-sky-500' :
                                                            inst.color === 'teal' ? 'border-teal-50/50 hover:border-teal-500' :
                                                                inst.color === 'lime' ? 'border-lime-50/50 hover:border-lime-500' :
                                                                    inst.color === 'rose' ? 'border-rose-50/50 hover:border-rose-500' :
                                                                        inst.color === 'indigo' ? 'border-indigo-50/50 hover:border-indigo-500' :
                                                                            inst.color === 'violet' ? 'border-violet-50/50 hover:border-violet-500' :
                                                                                'border-slate-50/50 hover:border-slate-500'
                            }`}
                    >
                        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all duration-300 group-hover:scale-110 shadow-lg
              ${inst.color === 'blue' ? 'bg-blue-500/10 text-blue-600' :
                                inst.color === 'red' ? 'bg-red-500/10 text-red-600' :
                                    inst.color === 'green' ? 'bg-green-500/10 text-green-600' :
                                        inst.color === 'emerald' ? 'bg-emerald-500/10 text-emerald-600' :
                                            inst.color === 'orange' ? 'bg-orange-500/10 text-orange-600' :
                                                inst.color === 'purple' ? 'bg-purple-500/10 text-purple-600' :
                                                    inst.color === 'pink' ? 'bg-pink-500/10 text-pink-600' :
                                                        inst.color === 'sky' ? 'bg-sky-500/10 text-sky-600' :
                                                            inst.color === 'teal' ? 'bg-teal-500/10 text-teal-600' :
                                                                inst.color === 'lime' ? 'bg-lime-500/10 text-lime-600' :
                                                                    inst.color === 'rose' ? 'bg-rose-500/10 text-rose-600' :
                                                                        inst.color === 'indigo' ? 'bg-indigo-500/10 text-indigo-600' :
                                                                            inst.color === 'violet' ? 'bg-violet-500/10 text-violet-600' :
                                                                                'bg-slate-500/10 text-slate-600'
                            }`}
                        >
                            <inst.icon className="w-7 h-7" />
                        </div>

                        <div className="space-y-1">
                            <h3 className="text-sm font-bold text-slate-900 dark:text-white leading-tight group-hover:text-blue-600 transition-colors">{inst.name}</h3>
                            <div className="flex items-center justify-center gap-1.5 opacity-50 group-hover:opacity-100 transition-opacity">
                                <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Official Site</span>
                                <ExternalLink className="w-3 h-3 text-blue-500" />
                            </div>
                        </div>
                    </motion.a>
                ))}
            </div>
        </section>
    );
}
