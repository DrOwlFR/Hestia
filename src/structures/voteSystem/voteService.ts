import { Vote } from "../database/models";
import type { VoteChoice } from "./types";

// Result type for vote registration
type RegisterDirectVoteResult =
	| { success: true; isUpdate: boolean }
	| { success: false; reason: "CLOSED" | "NOT_FOUND" };
/**
 * Registers a direct vote for a given messageId by a user with a specific choice.
 * Summary: This function first removes any existing vote from the user for the specified messageId, and then adds the new vote to the votes array in the database.
 * Steps:
 * - Remove any existing vote from the user for the given messageId using the $pull operator.
 * - Add the new vote to the votes array using the $push operator.
 * - Return a boolean indicating whether an existing vote was updated (true if an existing vote was removed, false otherwise).
 * @param messageId - The ID of the message for which the vote is being registered.
 * @param user - An object containing the user's ID and display name.
 * @param choice - The choice made by the user, which is of type VoteChoice.
 * @returns - A promise that resolves to a RegisterDirectVoteResult indicating the success or failure of the operation.
 */
export async function registerDirectVote(messageId: string, user: { id: string; displayName: string }, choice: VoteChoice): Promise<RegisterDirectVoteResult> {
	// Check if the vote session exists and is open
	const voteDocument = await Vote.findOne({ messageId });
	if (!voteDocument) return { success: false, reason: "NOT_FOUND" };
	if (voteDocument.isClosed) return { success: false, reason: "CLOSED" };

	// Remove any existing vote from the user for the given messageId
	const pullResult = await Vote.updateOne(
		{ messageId },
		{ $pull: { votes: { userId: user.id } } },
	);

	// Add the new vote to the votes array
	await Vote.updateOne(
		{ messageId },
		{
			$push: {
				votes: {
					userId: user.id,
					displayName: user.displayName,
					choice,
				},
			},
		},
	);
	// Return wether an existing vote was updated
	return { success: true, isUpdate: pullResult.modifiedCount > 0 };
}

// Result type for proxy vote registration
type RegisterProxyVoteResult =
	| { success: true }
	| { success: false; reason: "CLOSED" | "NOT_FOUND" | "QUOTA_EXCEEDED" };

/**
	 * Registers a proxy vote for a given messageId by a user with a specific choice.
	 * Summary: This function checks if the vote session exists and is open, verifies that the user has not exceeded the maximum number of proxy votes allowed (3), and then adds the new proxy vote to the proxyVotes array in the database.
	 * Steps:
	 * - Clean the target pseudo by trimming whitespace.
	 * - Check if the vote session exists and is open, and if the holder has not exceeded the proxy vote quota.
	 * - If the vote session does not exist, return a failure result with reason "NOT_FOUND".
	 * - If the vote session is closed, return a failure result with reason "CLOSED".
	 * - If the holder has already reached the maximum number of proxy votes allowed (3), return a failure result with reason "QUOTA_EXCEEDED".
	 * - If all checks pass, add the new proxy vote to the proxyVotes array in the database and return a success result.
	 * @param messageId - The ID of the message for which the vote is being registered.
	 * @param holder - An object containing the holder's ID and display name.
	 * @param targetPseudo - The pseudo of the target user.
	 * @param choice - The choice made by the user, which is of type VoteChoice.
	 * @returns A promise that resolves to a RegisterProxyVoteResult indicating the success or failure of the operation.
	 */
export async function registerProxyVote(messageId: string, holder: { id: string, displayName: string }, targetPseudo: string, choice: VoteChoice): Promise<RegisterProxyVoteResult> {
	// Clean the target pseudo by trimming whitespace
	const cleanPseudo = targetPseudo.trim();

	// Check if the vote session exists and is open, and if the holder has not exceeded the proxy vote quota
	const voteDocument = await Vote.findOne({ messageId });
	if (!voteDocument) return { success: false, reason: "NOT_FOUND" };
	if (voteDocument.isClosed) return { success: false, reason: "CLOSED" };

	// Check if the holder has already reached the maximum number of proxy votes allowed (3)
	const holderProxies = voteDocument.proxyVotes.filter(proxy => proxy.holderId === holder.id).length;
	if (holderProxies >= 3) return { success: false, reason: "QUOTA_EXCEEDED" };

	// Add the new proxy vote to the proxyVotes array
	await Vote.updateOne(
		{ messageId },
		{
			$push: {
				proxyVotes: {
					holderId: holder.id,
					holderDisplayName: holder.displayName,
					targetPseudo: cleanPseudo,
					choice,
				},
			},
		},
	);

	// Return success
	return { success: true };
}

// Result type for setting vote status
type SetVoteStatusResult =
	| { success: true; isClosed: boolean }
	| { success: false; reason: "NOT_FOUND" | "ALREADY_IN_STATE" };

/**
 * Sets the status of a vote session (open or closed) for a given messageId.
 * Summary: This function checks if the vote session exists, verifies if the current status is different from the desired status, and updates the isClosed field in the database accordingly.
 * Steps:
 * - Check if the vote session exists for the given messageId.
 * - If the vote session does not exist, return a failure result with reason "NOT_FOUND".
 * - If the current status is already the same as the desired status, return a failure result with reason "ALREADY_IN_STATE".
 * - If all checks pass, update the isClosed field in the database to reflect the desired status and return a success result.
 * @param messageId - The ID of the message for which the vote status is being set.
 * @param isClosed - A boolean indicating whether the vote session should be closed (true) or open (false).
 * @returns - A promise that resolves to a SetVoteStatusResult indicating the success or failure of the operation.
 */
export async function setVoteStatus(messageId: string, isClosed: boolean): Promise<SetVoteStatusResult> {
	// Check if the vote session exists
	const voteDocument = await Vote.findOne({ messageId });
	if (!voteDocument) return { success: false, reason: "NOT_FOUND" };

	// Check if the vote session is already in the desired state to avoid unnecessary updates
	if (voteDocument.isClosed === isClosed) return { success: false, reason: "ALREADY_IN_STATE" };

	// Update the vote session's isClosed status in the database
	await Vote.updateOne(
		{ messageId },
		{ $set: { isClosed } },
	);

	// Return success with the new state
	return { success: true, isClosed };
}
