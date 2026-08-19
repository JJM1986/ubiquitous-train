const KEY = "geruestrechner_session";

export const WEIGHTS_PER_UNIT = {
  "Gerüstrahmen 2,00m": 15,
  "Kreuzverband": 8,
  "Gerüstbelag": 13,
  "Spindel + Kopf": 5,
  "Unterlegplatte": 3,
  "Geländerpfosten": 7,
  "Fanggitter/Bekleidung": 6,
  "Treppenwangen": 12,
  "Treppenstufen": 4,
  "Podestbelag": 15,
  "Turmrahmen 2,00m": 16,
  "Treppenlauf": 20,
  "Alu-Rahmen 2,00m": 8,
  "Alu-Podestbelag": 7,
  "Alu-Treppenlauf": 12,
  "Alu-Geländerpfosten": 3,
  "Alu-Kreuzverband": 4,
  "Schutznetz (m²)": 0.3,
  "Fanggitter": 6,
  "Konsolhalter": 2,
  "Spanngurt": 1,
  "Kabelbinder": 0.01,
  "RS-Rahmen 2,00m": 18,
  "Längsverbund": 6,
  "Querriegel": 5,
  "Belag (m²)": 12,
};

export function getWeight(name) {
  return WEIGHTS_PER_UNIT[name] ?? 0;
}

export function totalWeightForMaterials(materials) {
  return (materials || []).reduce((sum, m) => sum + m.qty * (m.weight ?? getWeight(m.name)), 0);
}

export function getSession() {
  try {
    return JSON.parse(localStorage.getItem(KEY) || "[]");
  } catch {
    return [];
  }
}

export function addToSession(item) {
  const items = getSession();
  items.push({
    ...item,
    id: Date.now().toString(36) + Math.random().toString(36).slice(2, 7),
  });
  localStorage.setItem(KEY, JSON.stringify(items));
  return items;
}

export function removeFromSession(id) {
  const items = getSession().filter((i) => i.id !== id);
  localStorage.setItem(KEY, JSON.stringify(items));
  return items;
}

export function clearSession() {
  localStorage.removeItem(KEY);
}

export function aggregateMaterials(items) {
  const map = {};
  items.forEach((item) => {
    (item.materials || []).forEach((m) => {
      const key = `${m.name}|${m.unit}`;
      if (!map[key]) map[key] = { name: m.name, unit: m.unit, qty: 0, weight: m.weight ?? null, dim: m.dim ?? null };
      map[key].qty += m.qty;
    });
  });
  return Object.values(map).sort((a, b) => b.qty - a.qty);
}