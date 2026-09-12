import type { ShewenyClient } from "sheweny";

import { handleCalendarQuoteContestEntryRemoved, handleCalendarQuoteContestSubmissionsClosing, handleCalendarQuoteContestSubmissionsOpen, handleCalendarQuoteContestVotesClosing, handleCalendarQuoteContestVotesOpen } from "./handlers/calendarHandler";
import { handleStoryCoAuthorChapterCreated, handleStoryCoAuthorChapterDeleted, handleStoryCoAuthorChapterUpdated, handleStoryCollaboratorLeft, handleStoryCollaboratorRoleGiven, handleStoryCollaboratorRoleRemoved } from "./handlers/collaborationsHandler";
import { handleChapterComment, handleChapterReplyComment, handleChapterRootComment } from "./handlers/commentsHandler";
import { handleDefaultNotification } from "./handlers/defaultHandler";
import { handleFollowNewFollower, handleFollowNewStory } from "./handlers/followHandler";
import { handleAuthPromotionAccepted, handleAuthPromotionRejected } from "./handlers/moderationHandler";
import { handleNewsReplyComment } from "./handlers/newsCommentsHandler";
import { handleNewsPublished } from "./handlers/newsHandler";
import { handleStoryChapterScheduledPublished } from "./handlers/publicationHandler";
import { handleQuoteChapterQuoted } from "./handlers/quoteHandler";
import { handleReadlistChapterPublished, handleReadlistChapterUnpublished, handleReadlistStoryAdded, handleReadlistStoryCompleted, handleReadlistStoryDeleted, handleReadlistStoryRepublished, handleReadlistStoryUnpublished } from "./handlers/readlistHandler";
import type { NotificationItem } from "./utils/types";

type NotificationHandler = (client: ShewenyClient, notification: NotificationItem) => Promise<string[]>;

const handlers: Record<string, NotificationHandler> = {
	// Key (string): Value (NotificationHandler)
	"story.chapter.comment": handleChapterComment as NotificationHandler,
	"story.chapter.root_comment": handleChapterRootComment as NotificationHandler,
	"story.chapter.reply_comment": handleChapterReplyComment as NotificationHandler,
	"story.coauthor.chapter.created": handleStoryCoAuthorChapterCreated as NotificationHandler,
	"story.coauthor.chapter.updated": handleStoryCoAuthorChapterUpdated as NotificationHandler,
	"story.coauthor.chapter.deleted": handleStoryCoAuthorChapterDeleted as NotificationHandler,
	"story.collaborator.role_given": handleStoryCollaboratorRoleGiven as NotificationHandler,
	"story.collaborator.removed": handleStoryCollaboratorRoleRemoved as NotificationHandler,
	"story.collaborator.left": handleStoryCollaboratorLeft as NotificationHandler,
	"story.chapter.scheduled_published": handleStoryChapterScheduledPublished as NotificationHandler,
	"readlist.chapter.published": handleReadlistChapterPublished as NotificationHandler,
	"readlist.chapter.unpublished": handleReadlistChapterUnpublished as NotificationHandler,
	"readlist.story.added": handleReadlistStoryAdded as NotificationHandler,
	"readlist.story.deleted": handleReadlistStoryDeleted as NotificationHandler,
	"readlist.story.unpublished": handleReadlistStoryUnpublished as NotificationHandler,
	"readlist.story.republished": handleReadlistStoryRepublished as NotificationHandler,
	"readlist.story.completed": handleReadlistStoryCompleted as NotificationHandler,
	"news.published": handleNewsPublished as NotificationHandler,
	"news.reply_comment": handleNewsReplyComment as NotificationHandler,
	"auth.promotion.accepted": handleAuthPromotionAccepted as NotificationHandler,
	"auth.promotion.rejected": handleAuthPromotionRejected as NotificationHandler,
	"follow.new_follower": handleFollowNewFollower as NotificationHandler,
	"follow.new_story": handleFollowNewStory as NotificationHandler,
	"quote.chapter_quoted": handleQuoteChapterQuoted as NotificationHandler,
	"calendar.quote_contest.entry_removed": handleCalendarQuoteContestEntryRemoved as NotificationHandler,
	"calendar.quote_contest.submissions_open": handleCalendarQuoteContestSubmissionsOpen as NotificationHandler,
	"calendar.quote_contest.submissions_closing": handleCalendarQuoteContestSubmissionsClosing as NotificationHandler,
	"calendar.quote_contest.votes_open": handleCalendarQuoteContestVotesOpen as NotificationHandler,
	"calendar.quote_contest.votes_closing": handleCalendarQuoteContestVotesClosing as NotificationHandler,
};

export async function dispatchNotifications(client: ShewenyClient, notification: NotificationItem): Promise<string[]> {
	const handler = handlers[notification.type] || handleDefaultNotification;
	return await handler(client, notification);
}
