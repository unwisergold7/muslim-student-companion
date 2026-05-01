import { University } from "@/types";
export const UNIVERSITIES: University[] = [
  { id: "virginia-tech", name: "Virginia Tech", short_name: "VT", city: "Blacksburg", state: "Virginia", country: "US", coordinates: { lat: 37.2296, lng: -80.4139 }, timezone: "America/New_York", enabled: true },
];
export const DEFAULT_UNIVERSITY_ID = "virginia-tech";
export function getCurrentUniversity(id: string = DEFAULT_UNIVERSITY_ID): University { return UNIVERSITIES.find((u) => u.id === id) || UNIVERSITIES[0]; }
export function getDataForUniversity<T extends { university_id: string }>(data: T[], uid: string): T[] { return data.filter((d) => d.university_id === uid); }
