const KAABA = { lat: 21.4225, lng: 39.8262 };
const toRad = (d: number) => (d * Math.PI) / 180;
const toDeg = (r: number) => (r * 180) / Math.PI;
export function calculateQiblaBearing(lat: number, lng: number): number { const p1 = toRad(lat), p2 = toRad(KAABA.lat), dL = toRad(KAABA.lng - lng); const y = Math.sin(dL) * Math.cos(p2); const x = Math.cos(p1) * Math.sin(p2) - Math.sin(p1) * Math.cos(p2) * Math.cos(dL); return (toDeg(Math.atan2(y, x)) + 360) % 360; }
export function bearingToCardinal(b: number): string { const d = ["N","NNE","NE","ENE","E","ESE","SE","SSE","S","SSW","SW","WSW","W","WNW","NW","NNW"]; return d[Math.round(b / 22.5) % 16]; }
