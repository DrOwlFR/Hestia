export type VoteChoice = "yes" | "no" | "abstain";

export const VOTE_TRANSLATIONS = {
	yes: "pour",
	no: "contre",
	abstain: "s'abstient",
} as const satisfies Record<VoteChoice, string>;

export const BUTTON_CHOICE_MAP = {
	voteYesButton: "yes",
	voteNoButton: "no",
	voteAbstainButton: "abstain",
} as const;

export type VoteButtonCustomId = keyof typeof BUTTON_CHOICE_MAP;
