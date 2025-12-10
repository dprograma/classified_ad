// Complete list of all 36 Nigerian States plus the Federal Capital Territory (FCT)
export const NIGERIAN_STATES = [
  { name: 'Abia', capital: 'Umuahia' },
  { name: 'Adamawa', capital: 'Yola' },
  { name: 'Akwa Ibom', capital: 'Uyo' },
  { name: 'Anambra', capital: 'Awka' },
  { name: 'Bauchi', capital: 'Bauchi' },
  { name: 'Bayelsa', capital: 'Yenagoa' },
  { name: 'Benue', capital: 'Makurdi' },
  { name: 'Borno', capital: 'Maiduguri' },
  { name: 'Cross River', capital: 'Calabar' },
  { name: 'Delta', capital: 'Asaba' },
  { name: 'Ebonyi', capital: 'Abakaliki' },
  { name: 'Edo', capital: 'Benin City' },
  { name: 'Ekiti', capital: 'Ado Ekiti' },
  { name: 'Enugu', capital: 'Enugu' },
  { name: 'FCT', capital: 'Abuja' }, // Federal Capital Territory
  { name: 'Gombe', capital: 'Gombe' },
  { name: 'Imo', capital: 'Owerri' },
  { name: 'Jigawa', capital: 'Dutse' },
  { name: 'Kaduna', capital: 'Kaduna' },
  { name: 'Kano', capital: 'Kano' },
  { name: 'Katsina', capital: 'Katsina' },
  { name: 'Kebbi', capital: 'Birnin Kebbi' },
  { name: 'Kogi', capital: 'Lokoja' },
  { name: 'Kwara', capital: 'Ilorin' },
  { name: 'Lagos', capital: 'Ikeja' },
  { name: 'Nasarawa', capital: 'Lafia' },
  { name: 'Niger', capital: 'Minna' },
  { name: 'Ogun', capital: 'Abeokuta' },
  { name: 'Ondo', capital: 'Akure' },
  { name: 'Osun', capital: 'Osogbo' },
  { name: 'Oyo', capital: 'Ibadan' },
  { name: 'Plateau', capital: 'Jos' },
  { name: 'Rivers', capital: 'Port Harcourt' },
  { name: 'Sokoto', capital: 'Sokoto' },
  { name: 'Taraba', capital: 'Jalingo' },
  { name: 'Yobe', capital: 'Damaturu' },
  { name: 'Zamfara', capital: 'Gusau' },
];

// Popular cities for quick access
export const POPULAR_CITIES = [
  'Lagos',
  'Abuja',
  'Port Harcourt',
  'Kano',
  'Ibadan',
  'Benin City',
  'Jos',
  'Kaduna',
  'Enugu',
  'Ilorin',
  'Aba',
  'Warri',
  'Calabar',
  'Uyo',
  'Maiduguri'
];

// Combined list for autocomplete (States with capitals + popular cities)
export const LOCATION_OPTIONS = [
  ...NIGERIAN_STATES.map(state => state.name),
  ...NIGERIAN_STATES.filter(s => s.capital !== s.name).map(state => state.capital),
  ...POPULAR_CITIES
].sort();

// Remove duplicates
export const UNIQUE_LOCATIONS = [...new Set(LOCATION_OPTIONS)];

export default {
  NIGERIAN_STATES,
  POPULAR_CITIES,
  UNIQUE_LOCATIONS
};
