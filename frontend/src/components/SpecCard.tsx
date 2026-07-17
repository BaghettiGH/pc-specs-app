import { X, Cpu, HardDrive, Laptop, Layers, Tag, ShieldCheck, Mail, User } from 'lucide-react';

interface Specification {
    id: number;
    employee_name: string;
    employee_email: string;
    device_name: string;
    serial_number: string;
    cpu: string | null;
    ram: string | null;
    storage: string | null;
    gpu: string | null;
    os: string | null;
    status: string | null;
    created_at: string;
}

interface SpecCardProps {
    specification: Specification;
    onClose: () => void;
}

export function SpecCard({ specification, onClose }: SpecCardProps) {
    const formattedDate = new Date(specification.created_at).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });

    return (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-50 flex items-center justify-center p-4">
            <div className="bg-white border border-slate-200 shadow-2xl w-full max-w-md rounded-3xl flex flex-col relative overflow-hidden animate-fade-in-up">
                {/* Visual red/blue indicator glow */}
                <div className="absolute top-0 left-0 right-0 h-[1.5px] bg-gradient-to-r from-blue-500 via-purple-500 to-red-500" />
                <div className="absolute -top-12 -right-12 h-36 w-36 rounded-full bg-blue-500/5 blur-2xl pointer-events-none" />

                <div className="flex justify-between items-start p-6 pb-4">
                    <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-xl bg-slate-900/5 flex items-center justify-center border border-slate-200 text-blue-600">
                            <Laptop className="h-5 w-5" />
                        </div>
                        <div>
                            <h2 className="font-bold text-slate-800 text-lg leading-tight">Specification Sheet</h2>
                            <p className="text-xs text-slate-500">Asset Ref: #{specification.id}</p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-slate-400 hover:text-slate-600 transition-colors p-1.5 hover:bg-slate-100 rounded-xl"
                    >
                        <X className="h-4 w-4" />
                    </button>
                </div>

                <div className="px-6 pb-6 flex flex-col gap-5">
                    {/* Employee Block */}
                    <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl flex flex-col gap-2.5">
                        <div className="flex items-center gap-2 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                            <User className="h-3.5 w-3.5" />
                            <span>Assigned Employee</span>
                        </div>
                        <div>
                            <h3 className="font-bold text-slate-800 text-base">{specification.employee_name}</h3>
                            <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-0.5">
                                <Mail className="h-3.5 w-3.5" />
                                <span>{specification.employee_email}</span>
                            </div>
                        </div>
                    </div>

                    {/* Hardware Grid */}
                    <div className="flex flex-col gap-3">
                        <div className="flex items-center gap-2 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                            <Layers className="h-3.5 w-3.5" />
                            <span>System Configuration</span>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-3 text-xs">
                            <div className="p-3 bg-slate-50 border border-slate-200/60 rounded-xl flex items-center gap-2.5">
                                <Cpu className="h-4 w-4 text-slate-400 shrink-0" />
                                <div className="truncate">
                                    <p className="text-[10px] text-slate-400 font-semibold uppercase">Processor</p>
                                    <p className="text-slate-700 font-medium truncate">{specification.cpu || 'N/A'}</p>
                                </div>
                            </div>

                            <div className="p-3 bg-slate-50 border border-slate-200/60 rounded-xl flex items-center gap-2.5">
                                <Layers className="h-4 w-4 text-slate-400 shrink-0" />
                                <div className="truncate">
                                    <p className="text-[10px] text-slate-400 font-semibold uppercase">Memory (RAM)</p>
                                    <p className="text-slate-700 font-medium truncate">{specification.ram || 'N/A'}</p>
                                </div>
                            </div>

                            <div className="p-3 bg-slate-50 border border-slate-200/60 rounded-xl flex items-center gap-2.5">
                                <HardDrive className="h-4 w-4 text-slate-400 shrink-0" />
                                <div className="truncate">
                                    <p className="text-[10px] text-slate-400 font-semibold uppercase">Storage</p>
                                    <p className="text-slate-700 font-medium truncate">{specification.storage || 'N/A'}</p>
                                </div>
                            </div>

                            <div className="p-3 bg-slate-50 border border-slate-200/60 rounded-xl flex items-center gap-2.5">
                                <Laptop className="h-4 w-4 text-slate-400 shrink-0" />
                                <div className="truncate">
                                    <p className="text-[10px] text-slate-400 font-semibold uppercase">Operating System</p>
                                    <p className="text-slate-700 font-medium truncate">{specification.os || 'N/A'}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Serial and Status Tech Box */}
                    <div className="border border-dashed border-slate-200 rounded-2xl p-4 bg-slate-50 flex flex-col gap-3 font-mono text-xs">
                        <div className="flex justify-between items-center">
                            <span className="text-[10px] text-slate-400 font-semibold uppercase">Device Model</span>
                            <span className="text-slate-700 font-bold">{specification.device_name}</span>
                        </div>
                        <div className="flex justify-between items-center border-t border-slate-200 border-dashed pt-3">
                            <span className="text-[10px] text-slate-400 font-semibold uppercase">Status</span>
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-700 border border-emerald-200">
                                {specification.status || 'Assigned'}
                            </span>
                        </div>
                        <div className="flex flex-col gap-1 border-t border-slate-200 border-dashed pt-3">
                            <span className="text-[10px] text-slate-400 font-semibold uppercase">Serial Number</span>
                            <span className="text-blue-600 font-bold tracking-wider text-sm flex items-center gap-1.5">
                                <Tag className="h-3.5 w-3.5 text-blue-500" />
                                {specification.serial_number}
                            </span>
                        </div>
                    </div>

                    <div className="text-[10px] text-slate-400 flex justify-between items-center px-1">
                        <span>Report Generated: {formattedDate}</span>
                        <span className="flex items-center gap-1">
                            <ShieldCheck className="h-3.5 w-3.5 text-emerald-500" /> Verified Record
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
}
