export const brand = {
  shortName: "EVAQ",
  productLine: "Inspection",
  title: "Inspection",
  subtitle: "Metal parts inspection",
  documentTitle: "EVAQ",
  description:
    "Vision inspection dashboard for metal sleeves, bellows, and grommets.",
} as const;

export const inspectedProducts = [
  { name: "Metal Sleeve", code: "MS-001", shortName: "Sleeve" },
  { name: "Metal Bellows", code: "MB-001", shortName: "Bellows" },
  { name: "Metal Grommet / Bush", code: "MG-001", shortName: "Grommet" },
] as const;

export type InspectedProductName = (typeof inspectedProducts)[number]["name"];
