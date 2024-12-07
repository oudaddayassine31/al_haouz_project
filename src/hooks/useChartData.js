import { useState, useEffect } from 'react';
import { POVERTY_DATA, MATERIALS_DATA } from '../constants/chartConstants';

export const useChartData = (selectedOption) => {
  const [chartData, setChartData] = useState([]);

  useEffect(() => {
    if (selectedOption === "Taux de pauvreté") {
      setChartData(POVERTY_DATA.sort((a, b) => b.poverty - a.poverty));
    } else {
      const data = MATERIALS_DATA[selectedOption];
      setChartData(
        Object.entries(data).map(([name, value]) => ({ name, value }))
      );
    }
  }, [selectedOption]);

  return chartData;
};