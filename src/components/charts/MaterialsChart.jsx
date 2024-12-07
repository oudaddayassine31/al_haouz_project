import React from 'react';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { useChartData } from '../../hooks/useChartData';
import { getChartConfig } from '../../utils/chartFormatters';

export const MaterialsChart = ({ type }) => {
  const data = useChartData(type);
  const config = getChartConfig('materials');

  return (
    <ResponsiveContainer {...config}>
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          labelLine={true}
          label={({ name, value }) => `${name} (${value}%)`}
          outerRadius={150}
          fill="#8884d8"
          dataKey="value"
        >
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.fill} />
          ))}
        </Pie>
        <Tooltip />
        <Legend />
      </PieChart>
    </ResponsiveContainer>
  );
};