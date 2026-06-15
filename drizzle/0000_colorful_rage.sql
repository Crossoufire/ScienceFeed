CREATE TABLE `article` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`rss_feed_id` integer,
	`link` text NOT NULL,
	`title` text NOT NULL,
	`summary` text NOT NULL,
	`added_date` text DEFAULT (CURRENT_TIMESTAMP) NOT NULL,
	FOREIGN KEY (`rss_feed_id`) REFERENCES `rss_feed`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `ux_article_link` ON `article` (`link`);--> statement-breakpoint
CREATE INDEX `ix_article_rss_feed_id` ON `article` (`rss_feed_id`);--> statement-breakpoint
CREATE TABLE `keyword` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`user_id` integer NOT NULL,
	`name` text NOT NULL,
	`active` integer DEFAULT true NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `ux_keyword_user_name` ON `keyword` (`user_id`,`name`);--> statement-breakpoint
CREATE INDEX `ix_keyword_name` ON `keyword` (`name`);--> statement-breakpoint
CREATE INDEX `ix_keyword_active` ON `keyword` (`active`);--> statement-breakpoint
CREATE INDEX `ix_keyword_user_id` ON `keyword` (`user_id`);--> statement-breakpoint
CREATE TABLE `rss_feed` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`publisher` text NOT NULL,
	`journal` text NOT NULL,
	`url` text NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `rss_feed_url_unique` ON `rss_feed` (`url`);--> statement-breakpoint
CREATE TABLE `user_article` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`user_id` integer NOT NULL,
	`article_id` integer NOT NULL,
	`is_read` integer DEFAULT false NOT NULL,
	`is_archived` integer DEFAULT false NOT NULL,
	`is_deleted` integer DEFAULT false NOT NULL,
	`marked_as_read_date` text,
	`marked_as_deleted_date` text,
	`marked_as_archived_date` text,
	`added_date` text DEFAULT (CURRENT_TIMESTAMP) NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`article_id`) REFERENCES `article`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `ux_user_article_user_article` ON `user_article` (`user_id`,`article_id`);--> statement-breakpoint
CREATE TABLE `user_article_keyword` (
	`keyword_id` integer NOT NULL,
	`user_article_id` integer NOT NULL,
	FOREIGN KEY (`keyword_id`) REFERENCES `keyword`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`user_article_id`) REFERENCES `user_article`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `ux_user_article_keyword_article_keyword` ON `user_article_keyword` (`user_article_id`,`keyword_id`);--> statement-breakpoint
CREATE TABLE `user_rss_feed` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`user_id` integer NOT NULL,
	`rss_feed_id` integer NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`rss_feed_id`) REFERENCES `rss_feed`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `ux_user_rss_feed_user_feed` ON `user_rss_feed` (`user_id`,`rss_feed_id`);--> statement-breakpoint
CREATE INDEX `ix_user_rss_feed_user_id` ON `user_rss_feed` (`user_id`);--> statement-breakpoint
CREATE INDEX `ix_user_rss_feed_rss_feed_id` ON `user_rss_feed` (`rss_feed_id`);--> statement-breakpoint
CREATE TABLE `account` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`account_id` text NOT NULL,
	`provider_id` text NOT NULL,
	`user_id` integer NOT NULL,
	`access_token` text,
	`refresh_token` text,
	`id_token` text,
	`access_token_expires_at` integer,
	`refresh_token_expires_at` integer,
	`scope` text,
	`password` text,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `session` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`token` text NOT NULL,
	`ip_address` text,
	`user_agent` text,
	`expires_at` integer NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	`user_id` integer NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `session_token_unique` ON `session` (`token`);--> statement-breakpoint
CREATE TABLE `user` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`image` text,
	`email` text NOT NULL,
	`last_rss_update` text,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	`email_verified` integer NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `user_email_unique` ON `user` (`email`);--> statement-breakpoint
CREATE TABLE `verification` (
	`id` integer PRIMARY KEY NOT NULL,
	`identifier` text NOT NULL,
	`value` text NOT NULL,
	`expires_at` integer NOT NULL,
	`created_at` integer,
	`updated_at` integer
);
