import React, { useMemo, useState } from 'react';
import { CalendarDays, ChevronDown } from 'lucide-react';

interface DOBPickerProps {
  value: string;
  onChange: (value: string) => void;
}

const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const pad = (value: number) => String(value).padStart(2, '0');

export default function DOBPicker({ value, onChange }: DOBPickerProps) {
  const [open, setOpen] = useState(false);
  const [day, setDay] = useState('');
  const [month, setMonth] = useState('');
  const [year, setYear] = useState('');
  const currentYear = new Date().getFullYear();
  const years = useMemo(() => Array.from({ length: 100 }, (_, index) => String(currentYear - index)), [currentYear]);
  const numberOfDays = month && year ? new Date(Number(year), Number(month), 0).getDate() : 31;
  const complete = Boolean(day && month && year);
  const display = value ? new Intl.DateTimeFormat('en-GB').format(new Date(`${value}T00:00:00`)) : 'dd/mm/yyyy';

  return (
    <div className="relative">
      <button type="button" onClick={() => setOpen((current) => !current)} className="flex w-full items-center gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3 text-left text-sm font-medium text-slate-800 transition focus:border-teal-600 focus:outline-none focus:ring-2 focus:ring-teal-600/20">
        <CalendarDays size={16} className="shrink-0 text-slate-300" />
        <span className={value ? '' : 'text-slate-400'}>{display}</span>
      </button>
      {open && (
        <div className="absolute z-30 mt-3 w-full rounded-2xl border border-slate-200 bg-white p-5 shadow-2xl">
          <p className="mb-4 text-[10px] font-black uppercase tracking-[0.15em] text-slate-400">Date of birth</p>
          <div className="grid grid-cols-3 gap-3">
            <DateSelect label="Day" value={day} onChange={setDay}>{['', ...Array.from({ length: numberOfDays }, (_, index) => String(index + 1))].map((item) => <option key={item || 'empty'} value={item}>{item ? pad(Number(item)) : '--'}</option>)}</DateSelect>
            <DateSelect label="Month" value={month} onChange={setMonth}>{['', ...months.map((_, index) => String(index + 1))].map((item) => <option key={item || 'empty'} value={item}>{item ? months[Number(item) - 1] : '--'}</option>)}</DateSelect>
            <DateSelect label="Year" value={year} onChange={setYear}>{['', ...years].map((item) => <option key={item || 'empty'} value={item}>{item || '----'}</option>)}</DateSelect>
          </div>
          {complete && <p className="mt-4 rounded-xl bg-slate-50 py-3 text-center text-sm font-bold text-slate-800">{day} {months[Number(month) - 1]} {year}</p>}
          <div className="mt-5 grid grid-cols-2 gap-3">
            <button type="button" onClick={() => setOpen(false)} className="rounded-xl border border-slate-200 py-3 font-bold text-slate-600">Cancel</button>
            <button type="button" disabled={!complete} onClick={() => { onChange(`${year}-${pad(Number(month))}-${pad(Number(day))}`); setOpen(false); }} className="rounded-xl bg-teal-600 py-3 font-bold text-white disabled:cursor-not-allowed disabled:opacity-40">Confirm</button>
          </div>
        </div>
      )}
    </div>
  );
}

function DateSelect({ label, value, onChange, children }: { label: string; value: string; onChange: (value: string) => void; children: React.ReactNode }) {
  return (
    <label className="block text-[10px] font-black uppercase tracking-[0.12em] text-slate-400">
      {label}
      <span className="relative mt-2 block">
        <select value={value} onChange={(event) => onChange(event.target.value)} className="w-full appearance-none rounded-xl border border-slate-200 bg-slate-50 px-3 py-3 text-sm font-medium normal-case tracking-normal text-slate-700 focus:border-teal-600 focus:outline-none">{children}</select>
        <ChevronDown size={15} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" />
      </span>
    </label>
  );
}

