CREATE TABLE `songs` (
	`id` int AUTO_INCREMENT NOT NULL,
	`youtubeId` varchar(32) NOT NULL,
	`title` text NOT NULL,
	`artist` text NOT NULL,
	`channel` text NOT NULL,
	`channelUrl` text,
	`songLevel` enum('N5','N4','N3','N2','N1') NOT NULL,
	`mood` varchar(80) NOT NULL DEFAULT '日文歌',
	`reason` text,
	`lyricsUrl` text,
	`lyricsNote` text,
	`vocabularyNotes` text,
	`grammarNotes` text,
	`listeningPrompt` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`createdByUserId` int NOT NULL,
	CONSTRAINT `songs_id` PRIMARY KEY(`id`),
	CONSTRAINT `songs_youtubeId_unique` UNIQUE(`youtubeId`)
);
--> statement-breakpoint
ALTER TABLE `songs` ADD CONSTRAINT `songs_createdByUserId_users_id_fk` FOREIGN KEY (`createdByUserId`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;