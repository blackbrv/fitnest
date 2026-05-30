-- AlterTable
ALTER TABLE `users` ADD COLUMN `reset_expiry` DATETIME(3) NULL,
    ADD COLUMN `reset_token` TEXT NULL,
    ADD COLUMN `verification_expiry` DATETIME(3) NULL,
    ADD COLUMN `verification_token` TEXT NULL;

-- Backwards compatibility: mark existing users as verified
UPDATE `users` SET `email_verified` = TRUE WHERE `email_verified` = FALSE;
