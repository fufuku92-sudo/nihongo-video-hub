CREATE TABLE `videos` (
	`id` int AUTO_INCREMENT NOT NULL,
	`youtubeId` varchar(32) NOT NULL,
	`title` text NOT NULL,
	`channel` text NOT NULL,
	`level` enum('N5','N4','N3','N2','N1') NOT NULL,
	`topic` enum('文法','單字','聽解','讀解','綜合') NOT NULL,
	`reason` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`createdByUserId` int NOT NULL,
	CONSTRAINT `videos_id` PRIMARY KEY(`id`),
	CONSTRAINT `videos_youtubeId_unique` UNIQUE(`youtubeId`)
);
--> statement-breakpoint
ALTER TABLE `videos` ADD CONSTRAINT `videos_createdByUserId_users_id_fk` FOREIGN KEY (`createdByUserId`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;