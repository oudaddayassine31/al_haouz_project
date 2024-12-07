export const CHART_COLORS = [
  "#0088FE",
  "#00C49F",
  "#FFBB28",
  "#FF8042",
  "#8884d8",
  "#82ca9d",
  "#ffc658"
];

export const CHART_OPTIONS = [
  "Taux de pauvreté",
  "Matériaux de mur",
  "Matériaux de toit",
  "Ménages par type"
];

export const POVERTY_DATA = [
  {"name": "Ait Hkim-Ait Yzid", "poverty": 20},
  {"name": "Alt Faska", "poverty": 15.8},
  // ... le reste des données
];

export const MATERIALS_DATA = {
  "Matériaux de mur": {
    "Béton armé/Briques": 36.6,
    "Pierres scellées mortier": 4.6,
    "Planches bois": 0.5,
    "Pierres scellées terre": 16.6,
    "Pisé/Briques terre": 41.5,
    "Bois récupéré": 0.2
  },
  "Matériaux de toit": {
    "Dalle": 36.5,
    "Planches bois/tuiles": 4.2,
    "Tôle/ciment/étain": 0.3,
    "Bois récupéré": 58.7,
    "Étain/plastique": 0.2
  },
  "Ménages par type": {
    "Villa": 0.9,
    "Appartement": 0.5,
    "Maison marocaine": 38.8,
    "Habitat sommaire": 0.4,
    "Logement rural": 58.9,
    "Autre": 0.5
  }
};