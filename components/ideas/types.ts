import type { IdeaBankStatus } from "@/lib/domain";

export type PersonOption = { id: string; name: string };

export type IdeaData = {
  id: string;
  title: string;
  notes: string | null;
  url: string | null;
  approxPence: number | null;
  status: IdeaBankStatus;
  purchaseId: string | null;
  createdAt: string;
};

export type IdeaGroupData = {
  personId: string;
  personName: string;
  ideas: IdeaData[];
};
