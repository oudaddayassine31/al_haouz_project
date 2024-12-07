import { CHART_COLORS } from '../constants/chartConstants';

export const formatPovertyData = (data) => {
  return data.sort((a, b) => b.poverty - a.poverty);
};

export const formatMaterialsData = (data) => {
  return Object.entries(data).map(([name, value], index) => ({
    name,
    value,
    fill: CHART_COLORS[index % CHART_COLORS.length]
  }));
};

export const getChartConfig = (type) => {
  const baseConfig = {
    width: "100%",
    height: 400,
    margin: { top: 20, right: 30, left: 50, bottom: 100 }
  };

  switch (type) {
    case 'poverty':
      return {
        ...baseConfig,
        referenceLines: [
          { y: 5.5, label: 'Al Haouz (5.5%)', color: '#2196F3' },
          { y: 8, label: 'Zone sinistrée (8%)', color: '#FF5252' },
          { y: 4.8, label: 'Maroc (4.8%)', color: '#4CAF50' }
        ]
      };
    case 'materials':
      return {
        ...baseConfig,
        margin: { top: 20, right: 30, left: 30, bottom: 20 }
      };
    default:
      return baseConfig;
  }
};