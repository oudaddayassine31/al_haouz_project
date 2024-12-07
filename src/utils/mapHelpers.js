export const createBuildingLayer = (buildingClassFilters) => {
  const filterExpression = ['any'];
  Object.entries(buildingClassFilters).forEach(([label, isActive]) => {
    if (isActive) {
      const classInfo = BUILDING_CLASSES.area.find(c => c.label === label);
      if (classInfo) {
        if (classInfo.max === Infinity) {
          filterExpression.push(['>=', ['get', 'area_in_meters'], classInfo.max]);
        } else {
          filterExpression.push([
            'all',
            ['>=', ['get', 'area_in_meters'], classInfo.min],
            ['<', ['get', 'area_in_meters'], classInfo.max]
          ]);
        }
      }
    }
  });

  return {
    'id': 'buildings-3d',
    'type': 'fill-extrusion',
    'source': 'buildings',
    'paint': {
      'fill-extrusion-color': [
        'step',
        ['get', 'area_in_meters'],
        BUILDING_CLASSES.area[0].color,
        50, BUILDING_CLASSES.area[1].color,
        100, BUILDING_CLASSES.area[2].color,
        200, BUILDING_CLASSES.area[3].color
      ],
      'fill-extrusion-height': 3,
      'fill-extrusion-opacity': 0.8
    },
    'filter': filterExpression
  };
};

export const loadCommuneBoundaries = async () => {
  try {
    const response = await fetch("./data/commune_alhouz.geojson");
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error loading communes:', error);
    throw error;
  }
};

export const loadBuildingData = async (communeName) => {
  try {
    const response = await fetch(`./data/buildings/before/${communeName}.geojson`);
    if (!response.ok) {
      throw new Error(`Error loading buildings for ${communeName}`);
    }
    return await response.json();
  } catch (error) {
    console.error(error);
    throw error;
  }
};