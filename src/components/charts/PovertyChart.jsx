import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceLine
} from 'recharts';
import { useChartData } from '../../hooks/useChartData';
import { getChartConfig } from '../../utils/chartFormatters';

export const PovertyChart = () => {
  const data = useChartData("Taux de pauvreté");
  const config = getChartConfig('poverty');

  return (
    <ResponsiveContainer {...config}>
      <BarChart 
        data={data} 
        margin={config.margin}
      >
        <XAxis 
          dataKey="name" 
          angle={-45} 
          textAnchor="end" 
          interval={0} 
          height={100}
          tick={{ fontSize: 11 }}
        />
        <YAxis 
          label={{ 
            value: 'Taux de pauvreté (%)', 
            angle: -90, 
            position: 'insideLeft'
          }}
        />
        <Tooltip />
        <Legend />
        <Bar 
          dataKey="poverty" 
          fill="#8884d8" 
          name="Taux de pauvreté par commune" 
        />
        {config.referenceLines.map((line, index) => (
          <ReferenceLine 
            key={index}
            y={line.y} 
            stroke={line.color} 
            strokeDasharray="3 3" 
            label={{ 
              value: line.label, 
              position: 'right',
              fill: line.color
            }}
          />
        ))}
      </BarChart>
    </ResponsiveContainer>
  );
};