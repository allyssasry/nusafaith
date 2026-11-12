export interface FeedbackFormValues {
  fullName: string;
  division: string;
  otherDivision: string;
  feedback: string;
  rating: number;
  memorableMoment: string;
}

export interface FeedbackInsertPayload {
  full_name: string;
  division: string;
  feedback: string;
  rating: number;
  memorable_moment: string | null;
}

export type FeedbackFieldErrors = Partial<
  Record<keyof FeedbackFormValues, string>
>;

export interface SubmittedParticipant {
  fullName: string;
  division: string;
  rating: number;
}

export const RATING_LABELS: Record<number, string> = {
  1: "Sangat Kurang Puas",
  2: "Kurang Puas",
  3: "Cukup Puas",
  4: "Puas",
  5: "Sangat Puas",
};

