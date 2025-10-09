// Nigerian states and major cities
export const nigeriaLocations = [
  { state: 'Abia', cities: ['Aba', 'Umuahia', 'Ohafia', 'Arochukwu', 'Bende'] },
  { state: 'Adamawa', cities: ['Yola', 'Mubi', 'Jimeta', 'Numan', 'Ganye'] },
  { state: 'Akwa Ibom', cities: ['Uyo', 'Eket', 'Ikot Ekpene', 'Oron', 'Abak'] },
  { state: 'Anambra', cities: ['Awka', 'Onitsha', 'Nnewi', 'Ekwulobia', 'Agulu'] },
  { state: 'Bauchi', cities: ['Bauchi', 'Azare', 'Misau', 'Jama\'are', 'Katagum'] },
  { state: 'Bayelsa', cities: ['Yenagoa', 'Brass', 'Sagbama', 'Ogbia', 'Nembe'] },
  { state: 'Benue', cities: ['Makurdi', 'Gboko', 'Otukpo', 'Katsina-Ala', 'Vandeikya'] },
  { state: 'Borno', cities: ['Maiduguri', 'Biu', 'Bama', 'Dikwa', 'Monguno'] },
  { state: 'Cross River', cities: ['Calabar', 'Ugep', 'Ogoja', 'Ikom', 'Obudu'] },
  { state: 'Delta', cities: ['Asaba', 'Warri', 'Sapele', 'Ughelli', 'Agbor'] },
  { state: 'Ebonyi', cities: ['Abakaliki', 'Afikpo', 'Onueke', 'Ezza', 'Ishielu'] },
  { state: 'Edo', cities: ['Benin City', 'Auchi', 'Ekpoma', 'Uromi', 'Igarra'] },
  { state: 'Ekiti', cities: ['Ado-Ekiti', 'Ikere', 'Ilawe-Ekiti', 'Efon-Alaaye', 'Omuo-Ekiti'] },
  { state: 'Enugu', cities: ['Enugu', 'Nsukka', 'Agbani', 'Oji River', 'Udi'] },
  { state: 'FCT', cities: ['Abuja', 'Gwagwalada', 'Kubwa', 'Nyanya', 'Karu', 'Lugbe', 'Dutse', 'Bwari', 'Jabi', 'Maitama', 'Garki', 'Asokoro', 'Wuse', 'Gwarinpa'] },
  { state: 'Gombe', cities: ['Gombe', 'Kumo', 'Deba', 'Billiri', 'Kaltungo'] },
  { state: 'Imo', cities: ['Owerri', 'Orlu', 'Okigwe', 'Mbaise', 'Oguta'] },
  { state: 'Jigawa', cities: ['Dutse', 'Hadejia', 'Gumel', 'Kazaure', 'Ringim'] },
  { state: 'Kaduna', cities: ['Kaduna', 'Zaria', 'Kafanchan', 'Kagoro', 'Birnin Gwari'] },
  { state: 'Kano', cities: ['Kano', 'Wudil', 'Gwarzo', 'Bichi', 'Rano'] },
  { state: 'Katsina', cities: ['Katsina', 'Daura', 'Funtua', 'Malumfashi', 'Dutsin-Ma'] },
  { state: 'Kebbi', cities: ['Birnin Kebbi', 'Argungu', 'Zuru', 'Jega', 'Yauri'] },
  { state: 'Kogi', cities: ['Lokoja', 'Okene', 'Kabba', 'Idah', 'Ankpa'] },
  { state: 'Kwara', cities: ['Ilorin', 'Offa', 'Omu-Aran', 'Jebba', 'Lafiagi'] },
  { state: 'Lagos', cities: ['Ikeja', 'Lagos Island', 'Victoria Island', 'Lekki', 'Ikorodu', 'Epe', 'Badagry', 'Surulere', 'Yaba', 'Ajah', 'Festac', 'Apapa', 'Mushin', 'Oshodi', 'Alimosho', 'Agege', 'Ojo', 'Amuwo-Odofin', 'Ibeju-Lekki', 'Kosofe'] },
  { state: 'Nasarawa', cities: ['Lafia', 'Keffi', 'Akwanga', 'Nasarawa', 'Doma'] },
  { state: 'Niger', cities: ['Minna', 'Bida', 'Kontagora', 'Suleja', 'Lapai'] },
  { state: 'Ogun', cities: ['Abeokuta', 'Ijebu Ode', 'Sagamu', 'Ota', 'Ilaro', 'Sango Ota', 'Mowe', 'Ibafo'] },
  { state: 'Ondo', cities: ['Akure', 'Ondo', 'Owo', 'Ikare', 'Ore'] },
  { state: 'Osun', cities: ['Osogbo', 'Ile-Ife', 'Ilesa', 'Ede', 'Iwo'] },
  { state: 'Oyo', cities: ['Ibadan', 'Ogbomosho', 'Oyo', 'Iseyin', 'Saki'] },
  { state: 'Plateau', cities: ['Jos', 'Bukuru', 'Pankshin', 'Shendam', 'Langtang'] },
  { state: 'Rivers', cities: ['Port Harcourt', 'Obio-Akpor', 'Bonny', 'Eleme', 'Okrika', 'Oyigbo'] },
  { state: 'Sokoto', cities: ['Sokoto', 'Tambuwal', 'Wurno', 'Goronyo', 'Gwadabawa'] },
  { state: 'Taraba', cities: ['Jalingo', 'Wukari', 'Bali', 'Gembu', 'Ibi'] },
  { state: 'Yobe', cities: ['Damaturu', 'Potiskum', 'Gashua', 'Nguru', 'Geidam'] },
  { state: 'Zamfara', cities: ['Gusau', 'Kaura Namoda', 'Talata Mafara', 'Bungudu', 'Anka'] }
];

// Generate formatted location options as "City, State, Nigeria"
export const getLocationOptions = () => {
  const options = [];
  nigeriaLocations.forEach(({ state, cities }) => {
    cities.forEach(city => {
      options.push(`${city}, ${state}, Nigeria`);
    });
  });
  return options.sort();
};

// Get cities for a specific state
export const getCitiesByState = (stateName) => {
  const stateData = nigeriaLocations.find(loc => loc.state === stateName);
  return stateData ? stateData.cities : [];
};

// Get all states
export const getAllStates = () => {
  return nigeriaLocations.map(loc => loc.state);
};
