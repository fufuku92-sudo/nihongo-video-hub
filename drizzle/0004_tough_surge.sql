CREATE TABLE `pageViews` (
	`id` int AUTO_INCREMENT NOT NULL,
	`path` varchar(255) NOT NULL DEFAULT '/',
	`userAgent` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `pageViews_id` PRIMARY KEY(`id`)
);
