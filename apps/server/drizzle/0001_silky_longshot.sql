CREATE TABLE `categories` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`name` text NOT NULL,
	`created_at` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%SZ', 'now')) NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `categories_user_id_name_uq` ON `categories` (`user_id`,`name`);--> statement-breakpoint
CREATE TABLE `document_shares` (
	`id` text PRIMARY KEY NOT NULL,
	`document_id` text NOT NULL,
	`recipient_email` text NOT NULL,
	`permission` text NOT NULL,
	`created_at` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%SZ', 'now')) NOT NULL,
	FOREIGN KEY (`document_id`) REFERENCES `documents`(`id`) ON UPDATE no action ON DELETE cascade,
	CONSTRAINT "document_shares_permission_ck" CHECK("document_shares"."permission" in ('read', 'write'))
);
--> statement-breakpoint
CREATE UNIQUE INDEX `document_shares_document_id_recipient_email_uq` ON `document_shares` (`document_id`,`recipient_email`);--> statement-breakpoint
CREATE INDEX `document_shares_recipient_email_idx` ON `document_shares` (`recipient_email`);