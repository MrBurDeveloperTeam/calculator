import React, { useState } from 'react';
import { useCalculator } from '../context/CalculatorContext';
import { PieChart, Pie, Sector, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { Info, ChevronDown, ChevronUp, DollarSign } from 'lucide-react';

interface BreakdownItem {
  name: string;
  value: number;
  color: string;
  fill?: string;
}

interface ResultVisualsProps {
  title: string;
  mainValue: string;
  subValue?: string;
  data: BreakdownItem[];
  type?: 'cost' | 'profit';
  projectionData?: {
    dailyRevenue: number;
    dailyCost: number;
    dailyProfit: number;
  };
  tooltipData?: {
    title: string;
    content: React.ReactNode;
  };
  headerClassName?: string;
}

const COLORS = ['#94a3b8', '#3b82f6', '#22c55e', '#f59e0b', '#ef4444'];

const getSegmentColor = (item: BreakdownItem, index: number) =>
  item.fill || item.color || COLORS[index % COLORS.length];

const ResultVisuals: React.FC<ResultVisualsProps> = ({
  title,
  mainValue,
  subValue,
  data,
  type = 'cost',
  projectionData,
  tooltipData,
  headerClassName = "bg-slate-900"
}) => {
  const { state } = useCalculator();
  const { currencySymbol } = state.clinicSettings;
  const [isTooltipOpen, setIsTooltipOpen] = useState(false);

  // Projection Calculation
  const projections = projectionData ? [
    { freq: 'Daily', multiplier: 1 },
    { freq: 'Weekly', multiplier: 5 },
    { freq: 'Monthly', multiplier: 22 },
    { freq: 'Yearly', multiplier: 264 }
  ] : [];

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-2 border border-slate-200 shadow-lg rounded-lg">
          <p className="text-xs font-semibold text-slate-700">{payload[0].name}</p>
          <p className="text-sm font-bold text-slate-900">{currencySymbol} {payload[0].value.toFixed(2)}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="result-visuals bg-white rounded-xl shadow-lg border border-slate-200 h-full flex flex-col relative">
      {/* Header */}
      <div className={`p-6 text-white rounded-t-xl ${headerClassName}`}>
        <h3 className="opacity-80 text-xs font-bold uppercase tracking-wider mb-1">{title}</h3>
        <div className="flex items-baseline gap-2">
          <h2 className="text-4xl font-bold text-white">{mainValue}</h2>
          {subValue && <span className="opacity-70 text-sm">{subValue}</span>}
        </div>
      </div>

      {/* Chart Section */}
      <div className="p-6 flex-grow flex flex-col items-center justify-center min-h-[300px] relative bg-slate-50">
        <ResponsiveContainer width="100%" height={260}>
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={80}
              paddingAngle={5}
              dataKey="value"
              stroke="none"
              shape={(props: any) => (
                <Sector
                  {...props}
                  fill={getSegmentColor(data[props.index], props.index)}
                />
              )}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend
              verticalAlign="bottom"
              height={36}
              wrapperStyle={{ marginTop: '40px' }}
              content={() => (
                <div className="flex flex-wrap items-center justify-center gap-3">
                  {data.map((item, index) => (
                    <div key={`${item.name}-${index}`} className="flex items-center gap-1.5">
                      <span
                        className="inline-block h-3 w-3 rounded-full"
                        style={{ backgroundColor: getSegmentColor(item, index) }}
                      />
                      <span className="text-xs font-medium text-slate-600">{item.name}</span>
                    </div>
                  ))}
                </div>
              )}
            />
          </PieChart>
        </ResponsiveContainer>

        {/* Center Text (Total or Label) */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none pb-8">
          <div className="text-center">
            <p className="text-[10px] uppercase text-slate-400 font-bold tracking-widest">Total</p>
          </div>
        </div>
      </div>

      {/* Projection Table (Only for Profit type) */}
      {type === 'profit' && projectionData && (
        <div className="p-4 border-t border-slate-200 bg-white">
          <h4 className="text-sm font-bold text-slate-800 mb-3 flex items-center gap-2">
            <DollarSign className="w-4 h-4 text-teal-600" />
            Potential Revenue Projection
          </h4>
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="text-slate-500 bg-slate-50 border-b border-slate-100">
                <tr>
                  <th className="px-2 py-2 font-medium">Freq</th>
                  <th className="px-2 py-2 font-medium">Revenue</th>
                  <th className="px-2 py-2 font-medium">Net Profit</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {projections.map((proj) => (
                  <tr key={proj.freq}>
                    <td className="px-2 py-2 font-medium text-slate-700">{proj.freq}</td>
                    <td className="px-2 py-2 text-slate-600">
                      {currencySymbol} {(projectionData.dailyRevenue * proj.multiplier).toLocaleString(undefined, { maximumFractionDigits: 0 })}
                    </td>
                    <td className="px-2 py-2 font-bold text-teal-600">
                      {currencySymbol} {(projectionData.dailyProfit * proj.multiplier).toLocaleString(undefined, { maximumFractionDigits: 0 })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Educational Tooltip Accordion */}
      {tooltipData && (
        <div
          className={`result-tooltip-panel border-t border-slate-200 bg-blue-50 ${
            isTooltipOpen ? '' : 'rounded-b-xl'
          }`}
        >
          <button
            onClick={() => setIsTooltipOpen(!isTooltipOpen)}
            className="result-tooltip-trigger w-full p-3 flex items-center justify-between text-blue-800 hover:bg-blue-100 transition-colors"
          >
            <div className="flex items-center gap-2">
              <Info className="result-tooltip-icon w-4 h-4" />

              <span className="result-tooltip-label text-xs font-bold">
                How is this calculated?
              </span>
            </div>

            {isTooltipOpen ? (
              <ChevronUp className="result-tooltip-chevron w-4 h-4" />
            ) : (
              <ChevronDown className="result-tooltip-chevron w-4 h-4" />
            )}
          </button>

          {isTooltipOpen && (
            <div className="result-tooltip-content p-4 pt-0 text-xs text-blue-700 leading-relaxed rounded-b-xl">
              <p className="result-tooltip-title font-semibold mb-1">
                {tooltipData.title}
              </p>

              <div>{tooltipData.content}</div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ResultVisuals;
