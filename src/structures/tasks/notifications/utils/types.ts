// This file contains TypeScript interfaces for notifications and pagination.

// --- Common field interface for all notification types ---
interface BaseNotification {
	id: number;
	avatarUrl?: string | null;
	defaultText: string;
	recipients: string[];
	createdAt: string;
}

// --- Specific field interfaces for different notification types ---

// Comments notification data interfaces

export interface StoryChapterCommentData {
	comment_id: number,
	author_name: string,
	author_slug: string,
	chapter_title: string,
	chapter_slug: string,
	is_reply: boolean,
	story_name: string,
	story_slug: string,
}

export interface StoryChapterRootCommentData {
	comment_id: number,
	author_name: string,
	author_slug: string,
	chapter_title: string,
	chapter_slug: string,
	story_name: string,
	story_slug: string,
}

export interface StoryChapterReplyCommentData {
	comment_id: number,
	author_name: string,
	author_slug: string,
	chapter_title: string,
	chapter_slug: string,
	story_name: string,
	story_slug: string,
}

// Collaboration notification data interfaces

export interface StoryCoAuthorChapterCreatedData {
	user_name: string,
	user_slug: string,
	story_title: string,
	story_slug: string,
	chapter_title: string,
	chapter_slug: string,
}

export interface StoryCoAuthorChapterUpdatedData {
	user_name: string,
	user_slug: string,
	story_title: string,
	story_slug: string,
	chapter_title: string,
	chapter_slug: string,
}

export interface StoryCoAuthorChapterDeletedData {
	user_name: string,
	user_slug: string,
	story_title: string,
	story_slug: string,
	chapter_title: string,
}

export interface StoryCollaboratorRoleGivenData {
	user_name: string,
	user_slug: string,
	story_title: string,
	story_slug: string,
	role: string,
}

export interface StoryCollaboratorRoleRemovedData {
	user_name: string,
	user_slug: string,
	story_title: string,
	story_slug: string,
}

export interface StoryCollaboratorLeftData {
	user_name: string,
	user_slug: string,
	story_title: string,
	story_slug: string,
}

// Readlist notification data interfaces

export interface ReadlistChapterPublishedData {
	author_name: string,
	author_slug: string,
	story_title: string,
	story_slug: string,
	chapter_title: string,
	chapter_slug: string,
}

export interface ReadlistChapterUnpublishedData {
	author_name: string,
	author_slug: string,
	story_title: string,
	story_slug: string,
	chapter_title: string,
	chapter_slug: string,
}

export interface ReadlistStoryAddedData {
	reader_name: string,
	reader_slug: string,
	story_title: string,
	story_slug: string,
}

export interface ReadlistStoryDeletedData {
	author_name: string,
	author_slug: string,
	story_title: string,
}

export interface ReadlistStoryUnpublishedData {
	author_name: string,
	author_slug: string,
	story_title: string,
}

export interface ReadlistStoryRepublishedData {
	author_name: string,
	author_slug: string,
	story_title: string,
	story_slug: string,
}

export interface ReadlistStoryCompletedData {
	author_name: string,
	author_slug: string,
	story_title: string,
	story_slug: string,
}

// News notification data interfaces

export interface NewsPublishedData {
	news_title: string,
	news_slug: string,
}

// Moderation notification data interfaces

export interface AuthPromotionAcceptedData {
	user_name: string,
}

export interface AuthPromotionRejectedData {
	user_name: string,
}

// Follow notification data interfaces

export interface FollowNewFollowerData {
	follower_id: number,
	follower_name: string,
	follower_slug: string,
}

export interface FollowNewStoryData {
	author_id: number,
	author_name: string,
	author_slug: string,
	story_id: number,
	story_title: string,
	story_slug: string,
}

// --- Individual notification type interfaces extending the base notification interface ---

// Comments notification types

export interface StoryChapterCommentNotification extends BaseNotification {
	type: "story.chapter.comment";
	data: StoryChapterCommentData;
}

export interface StoryChapterRootCommentNotification extends BaseNotification {
	type: "story.chapter.root_comment";
	data: StoryChapterRootCommentData;
}

export interface StoryChapterReplyCommentNotification extends BaseNotification {
	type: "story.chapter.reply_comment";
	data: StoryChapterReplyCommentData;
}

// Collaboration notification types

export interface StoryCoAuthorChapterCreatedNotification extends BaseNotification {
	type: "story.coauthor.chapter_created";
	data: StoryCoAuthorChapterCreatedData;
}

export interface StoryCoAuthorChapterUpdatedNotification extends BaseNotification {
	type: "story.coauthor.chapter_updated";
	data: StoryCoAuthorChapterUpdatedData;
}

export interface StoryCoAuthorChapterDeletedNotification extends BaseNotification {
	type: "story.coauthor.chapter_deleted";
	data: StoryCoAuthorChapterDeletedData;
}

export interface StoryCollaboratorRoleGivenNotification extends BaseNotification {
	type: "story.collaborator.role_given";
	data: StoryCollaboratorRoleGivenData;
}

export interface StoryCollaboratorRemovedNotification extends BaseNotification {
	type: "story.collaborator.removed";
	data: StoryCollaboratorRoleRemovedData;
}

export interface StoryCollaboratorLeftNotification extends BaseNotification {
	type: "story.collaborator.left";
	data: StoryCollaboratorLeftData;
}

// Readlist notification types

export interface ReadlistChapterPublishedNotification extends BaseNotification {
	type: "readlist.chapter.published";
	data: ReadlistChapterPublishedData;
}

export interface ReadlistChapterUnpublishedNotification extends BaseNotification {
	type: "readlist.chapter.unpublished";
	data: ReadlistChapterUnpublishedData;
}

export interface ReadlistStoryAddedNotification extends BaseNotification {
	type: "readlist.story.added";
	data: ReadlistStoryAddedData;
}

export interface ReadlistStoryDeletedNotification extends BaseNotification {
	type: "readlist.story.deleted";
	data: ReadlistStoryDeletedData;
}

export interface ReadlistStoryUnpublishedNotification extends BaseNotification {
	type: "readlist.story.unpublished";
	data: ReadlistStoryUnpublishedData;
}

export interface ReadlistStoryRepublishedNotification extends BaseNotification {
	type: "readlist.story.republished";
	data: ReadlistStoryRepublishedData;
}

export interface ReadlistStoryCompletedNotification extends BaseNotification {
	type: "readlist.story.completed";
	data: ReadlistStoryCompletedData;
}

// News notification types

export interface NewsPublishedNotification extends BaseNotification {
	type: "news.published";
	data: NewsPublishedData;
}

// Moderation notification types

export interface AuthPromotionAcceptedNotification extends BaseNotification {
	type: "auth.promotion.accepted";
	data: AuthPromotionAcceptedData;
}

export interface AuthPromotionRejectedNotification extends BaseNotification {
	type: "auth.promotion.rejected";
	data: AuthPromotionRejectedData;
}

// Follow notification types

export interface FollowNewFollowerNotification extends BaseNotification {
	type: "follow.new_follower";
	data: FollowNewFollowerData;
}

export interface FollowNewStoryNotification extends BaseNotification {
	type: "follow.new_story";
	data: FollowNewStoryData;
}

// Fallback notification type for unrecognized notification types
export interface FallbackNotification extends BaseNotification {
	type: string,
	data: Record<string, unknown>;
}

// --- Union type for all notification types ---
export type NotificationItem =
| StoryChapterCommentNotification
| StoryChapterRootCommentNotification
| StoryChapterReplyCommentNotification
| StoryCoAuthorChapterCreatedNotification
| StoryCoAuthorChapterUpdatedNotification
| StoryCoAuthorChapterDeletedNotification
| StoryCollaboratorRoleGivenNotification
| StoryCollaboratorRemovedNotification
| StoryCollaboratorLeftNotification
| ReadlistChapterPublishedNotification
| ReadlistChapterUnpublishedNotification
| ReadlistStoryAddedNotification
| ReadlistStoryDeletedNotification
| ReadlistStoryUnpublishedNotification
| ReadlistStoryRepublishedNotification
| ReadlistStoryCompletedNotification
| NewsPublishedNotification
| AuthPromotionAcceptedNotification
| AuthPromotionRejectedNotification
| FollowNewFollowerNotification
| FollowNewStoryNotification;

// Interface for pagination metadata
export interface Pagination {
	currentPage: number;
	perPage: number;
	total: number;
	lastPage: number;
	hasMore: boolean;
}

// Interface for the API response containing notifications and pagination
export interface NotificationsJson {
	data: NotificationItem[],
	pagination: Pagination,
}
