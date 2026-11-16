export const leadFields = [
  "summary",
  "role",
  "artist",
  "organization",
  "location",
  "timeframe",
  "budget",
  "projectUrl",
] as const;
export type Lead = Record<(typeof leadFields)[number], string>;
export type ChatMessage = { role: "user" | "assistant"; content: string };
export const emptyLead: Lead = {
  summary: "",
  role: "",
  artist: "",
  organization: "",
  location: "",
  timeframe: "",
  budget: "",
  projectUrl: "",
};
