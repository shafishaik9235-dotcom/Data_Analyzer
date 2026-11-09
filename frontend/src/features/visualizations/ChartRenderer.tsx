import React from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  LineChart,
  Line,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts';
import { ChartDataResponse } from '../../types';

interface ChartRendererProps {
  dataResponse: ChartDataResponse;
  height?: number;
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white p-3 rounded-xl border border-[#E8E4ED] shadow-md text-xs font-sans">
        <p className="font-semibold text-[#28263A] mb-1">{label}</p>
        {payload.map((entry: any, index: number) => (
          <div key={`item-${index}`} className="flex items-center gap-2 text-[#777487] my-0.5">
            <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: entry.color }} />
            <span>{entry.name}:</span>
            <span className="font-bold text-[#28263A]">
              {typeof entry.value === 'number' ? entry.value.toLocaleString() : entry.value}
            </span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

export const ChartRenderer: React.FC<ChartRendererProps> = ({ dataResponse, height = 360 }) => {
  const { chart_type, data, x_axis_key, series } = dataResponse;

  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-xs text-[#777487] italic bg-[#F7F5F0]/50 rounded-xl border border-dashed border-[#E8E4ED]">
        No data points available for this chart configuration.
      </div>
    );
  }

  // 1. Heatmap / Correlation Matrix view
  if (chart_type === 'heatmap') {
    const columns = series.map((s) => s.dataKey);
    return (
      <div className="overflow-x-auto p-2">
        <table className="w-full text-xs text-center border-collapse">
          <thead>
            <tr>
              <th className="p-2.5 border-b border-[#E8E4ED] text-left text-[#777487] font-semibold">Variable</th>
              {columns.map((col) => (
                <th key={col} className="p-2.5 border-b border-[#E8E4ED] font-semibold text-[#28263A] truncate max-w-[100px]">
                  {col}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map((row) => (
              <tr key={row[x_axis_key]} className="border-b border-[#E8E4ED]">
                <td className="p-2.5 text-left font-semibold text-[#28263A] truncate max-w-[120px]">
                  {row[x_axis_key]}
                </td>
                {columns.map((col) => {
                  const val = row[col] as number;
                  // Map correlation [-1, 1] to soft pastel violet or coral
                  const isPositive = val >= 0;
                  const intensity = Math.abs(val);
                  const bg = isPositive
                    ? `rgba(139, 123, 232, ${Math.max(0.1, intensity * 0.7)})`
                    : `rgba(197, 77, 88, ${Math.max(0.1, intensity * 0.7)})`;
                  const textColor = intensity > 0.6 ? '#FFFFFF' : '#28263A';

                  return (
                    <td
                      key={col}
                      className="p-2.5 font-mono text-[11px] font-bold rounded"
                      style={{ backgroundColor: bg, color: textColor }}
                    >
                      {val.toFixed(2)}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  // 2. Pie and Donut Charts
  if (chart_type === 'pie' || chart_type === 'donut') {
    const isDonut = chart_type === 'donut';
    const primarySeriesKey = series[0]?.dataKey || 'count';
    const pieColors = [
      '#8B7BE8', '#286A50', '#A95837', '#4B6B94', '#D97706',
      '#0284C7', '#7C3AED', '#059669', '#E11D48', '#64748B'
    ];

    return (
      <ResponsiveContainer width="100%" height={height}>
        <PieChart>
          <Tooltip content={<CustomTooltip />} />
          <Legend
            verticalAlign="bottom"
            height={36}
            formatter={(value) => <span className="text-xs text-[#28263A]">{value}</span>}
          />
          <Pie
            data={data}
            dataKey={primarySeriesKey}
            nameKey={x_axis_key}
            cx="50%"
            cy="50%"
            innerRadius={isDonut ? 70 : 0}
            outerRadius={110}
            paddingAngle={2}
          >
            {data.map((_, index) => (
              <Cell key={`cell-${index}`} fill={pieColors[index % pieColors.length]} />
            ))}
          </Pie>
        </PieChart>
      </ResponsiveContainer>
    );
  }

  // 3. Scatter Plot
  if (chart_type === 'scatter') {
    const yKey = series[0]?.dataKey;
    return (
      <ResponsiveContainer width="100%" height={height}>
        <ScatterChart margin={{ top: 15, right: 20, bottom: 20, left: 10 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#ECEAF1" />
          <XAxis
            dataKey={x_axis_key}
            type="number"
            stroke="#777487"
            fontSize={11}
            tickLine={false}
          />
          <YAxis
            dataKey={yKey}
            type="number"
            stroke="#777487"
            fontSize={11}
            tickLine={false}
          />
          <Tooltip cursor={{ strokeDasharray: '3 3' }} content={<CustomTooltip />} />
          <Scatter name={yKey} data={data} fill="#8B7BE8" />
        </ScatterChart>
      </ResponsiveContainer>
    );
  }

  // 4. Line Chart
  if (chart_type === 'line') {
    return (
      <ResponsiveContainer width="100%" height={height}>
        <LineChart data={data} margin={{ top: 15, right: 20, bottom: 20, left: 10 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#ECEAF1" />
          <XAxis
            dataKey={x_axis_key}
            stroke="#777487"
            fontSize={11}
            tickLine={false}
          />
          <YAxis stroke="#777487" fontSize={11} tickLine={false} />
          <Tooltip content={<CustomTooltip />} />
          {series.length > 1 && <Legend verticalAlign="top" height={36} />}
          {series.map((s) => (
            <Line
              key={s.dataKey}
              type="monotone"
              dataKey={s.dataKey}
              name={s.name}
              stroke={s.color}
              strokeWidth={2.5}
              dot={{ r: 3, fill: s.color }}
              activeDot={{ r: 6 }}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    );
  }

  // 5. Area Chart
  if (chart_type === 'area') {
    return (
      <ResponsiveContainer width="100%" height={height}>
        <AreaChart data={data} margin={{ top: 15, right: 20, bottom: 20, left: 10 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#ECEAF1" />
          <XAxis
            dataKey={x_axis_key}
            stroke="#777487"
            fontSize={11}
            tickLine={false}
          />
          <YAxis stroke="#777487" fontSize={11} tickLine={false} />
          <Tooltip content={<CustomTooltip />} />
          {series.length > 1 && <Legend verticalAlign="top" height={36} />}
          {series.map((s) => (
            <Area
              key={s.dataKey}
              type="monotone"
              dataKey={s.dataKey}
              name={s.name}
              stroke={s.color}
              fill={s.color}
              fillOpacity={0.25}
            />
          ))}
        </AreaChart>
      </ResponsiveContainer>
    );
  }

  // 6. Bar & Histogram Default
  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={data} margin={{ top: 15, right: 20, bottom: 20, left: 10 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#ECEAF1" />
        <XAxis
          dataKey={x_axis_key}
          stroke="#777487"
          fontSize={11}
          tickLine={false}
        />
        <YAxis stroke="#777487" fontSize={11} tickLine={false} />
        <Tooltip content={<CustomTooltip />} />
        {series.length > 1 && <Legend verticalAlign="top" height={36} />}
        {series.map((s) => (
          <Bar
            key={s.dataKey}
            dataKey={s.dataKey}
            name={s.name}
            fill={s.color}
            radius={[6, 6, 0, 0]}
          />
        ))}
      </BarChart>
    </ResponsiveContainer>
  );
};
