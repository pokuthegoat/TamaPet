// Shop catalogue: device shell colours and pet (pixel) colours, bought with TamaPoints.
// Device `rgb` = shell colour (the cream parts stay cream). Pet `dark` / `mid` = the two shades of the pet's
// pixels on the LCD; `rainbow` shifts hue across the pet instead.

export const DEVICE_COLOURS = [
  { id: 'blue', name: 'Blue', price: 0, rgb: [46, 98, 209] },
  { id: 'red', name: 'Red', price: 75, rgb: [205, 48, 52] },
  { id: 'pink', name: 'Pink', price: 75, rgb: [236, 122, 172] },
  { id: 'purple', name: 'Purple', price: 75, rgb: [128, 82, 204] },
  { id: 'mint', name: 'Mint', price: 75, rgb: [96, 204, 172] },
  { id: 'black', name: 'Black', price: 75, rgb: [38, 38, 44] },
  { id: 'white', name: 'White', price: 75, rgb: [236, 236, 240] },
  { id: 'gold', name: 'Gold', price: 400, rgb: [214, 172, 62], rare: true },
];

export const PET_COLOURS = [
  { id: 'classic', name: 'Classic', price: 0, dark: [38, 42, 36], mid: [96, 104, 86] },
  { id: 'red', name: 'Red', price: 75, dark: [150, 24, 34], mid: [206, 86, 86] },
  { id: 'pink', name: 'Pink', price: 75, dark: [176, 52, 118], mid: [232, 132, 178] },
  { id: 'purple', name: 'Purple', price: 75, dark: [84, 40, 156], mid: [150, 112, 214] },
  { id: 'blue', name: 'Blue', price: 75, dark: [24, 62, 168], mid: [92, 138, 226] },
  { id: 'green', name: 'Green', price: 75, dark: [24, 112, 52], mid: [92, 178, 102] },
  { id: 'orange', name: 'Orange', price: 75, dark: [186, 86, 14], mid: [240, 150, 64] },
  { id: 'rainbow', name: 'Rainbow', price: 400, rainbow: true, rare: true },
];

export const CATALOGUE = { device: DEVICE_COLOURS, pet: PET_COLOURS };
export const DEFAULTS = { device: 'blue', pet: 'classic' };
export const findItem = (kind, id) => CATALOGUE[kind].find((c) => c.id === id) || CATALOGUE[kind][0];
