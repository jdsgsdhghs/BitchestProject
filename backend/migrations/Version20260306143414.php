<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20260306143414 extends AbstractMigration
{
    public function getDescription(): string
    {
        return '';
    }

    public function up(Schema $schema): void
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->addSql('CREATE TABLE acquiered_crypto (id INT AUTO_INCREMENT NOT NULL, name VARCHAR(255) NOT NULL, value DOUBLE PRECISION NOT NULL, crypto_id_id INT NOT NULL, wallet_id_id INT NOT NULL, INDEX IDX_D08CA6E969F28E2C (crypto_id_id), INDEX IDX_D08CA6E9F43F82D (wallet_id_id), PRIMARY KEY (id)) DEFAULT CHARACTER SET utf8mb4');
        $this->addSql('CREATE TABLE crypto_currency (id INT AUTO_INCREMENT NOT NULL, name VARCHAR(255) NOT NULL, actual_value DOUBLE PRECISION NOT NULL, PRIMARY KEY (id)) DEFAULT CHARACTER SET utf8mb4');
        $this->addSql('CREATE TABLE crypto_quotation (id INT AUTO_INCREMENT NOT NULL, value DOUBLE PRECISION NOT NULL, quoted_at DATETIME NOT NULL, crypto_id INT NOT NULL, INDEX IDX_A119B53BE9571A63 (crypto_id), PRIMARY KEY (id)) DEFAULT CHARACTER SET utf8mb4');
        $this->addSql('CREATE TABLE transactions (id INT AUTO_INCREMENT NOT NULL, crypto_id VARCHAR(255) NOT NULL, value DOUBLE PRECISION NOT NULL, date DATETIME NOT NULL, wallet_id_id INT NOT NULL, INDEX IDX_EAA81A4CF43F82D (wallet_id_id), PRIMARY KEY (id)) DEFAULT CHARACTER SET utf8mb4');
        $this->addSql('CREATE TABLE user (id INT AUTO_INCREMENT NOT NULL, mail VARCHAR(255) NOT NULL, password VARCHAR(255) NOT NULL, nom VARCHAR(255) DEFAULT NULL, prenom VARCHAR(255) DEFAULT NULL, fonction VARCHAR(255) DEFAULT NULL, creation_date DATETIME NOT NULL, role VARCHAR(255) NOT NULL, UNIQUE INDEX UNIQ_8D93D6495126AC48 (mail), PRIMARY KEY (id)) DEFAULT CHARACTER SET utf8mb4');
        $this->addSql('CREATE TABLE user_token (id INT AUTO_INCREMENT NOT NULL, token_hash VARCHAR(64) NOT NULL, created_at DATETIME NOT NULL, expires_at DATETIME DEFAULT NULL, user_id INT NOT NULL, UNIQUE INDEX UNIQ_BDF55A63B3BC57DA (token_hash), INDEX IDX_BDF55A63A76ED395 (user_id), PRIMARY KEY (id)) DEFAULT CHARACTER SET utf8mb4');
        $this->addSql('CREATE TABLE wallet (id INT AUTO_INCREMENT NOT NULL, balance DOUBLE PRECISION NOT NULL, client_id INT DEFAULT NULL, UNIQUE INDEX UNIQ_7C68921F19EB6921 (client_id), PRIMARY KEY (id)) DEFAULT CHARACTER SET utf8mb4');
        $this->addSql('CREATE TABLE messenger_messages (id BIGINT AUTO_INCREMENT NOT NULL, body LONGTEXT NOT NULL, headers LONGTEXT NOT NULL, queue_name VARCHAR(190) NOT NULL, created_at DATETIME NOT NULL, available_at DATETIME NOT NULL, delivered_at DATETIME DEFAULT NULL, INDEX IDX_75EA56E0FB7336F0E3BD61CE16BA31DBBF396750 (queue_name, available_at, delivered_at, id), PRIMARY KEY (id)) DEFAULT CHARACTER SET utf8mb4');
        $this->addSql('ALTER TABLE acquiered_crypto ADD CONSTRAINT FK_D08CA6E969F28E2C FOREIGN KEY (crypto_id_id) REFERENCES crypto_currency (id)');
        $this->addSql('ALTER TABLE acquiered_crypto ADD CONSTRAINT FK_D08CA6E9F43F82D FOREIGN KEY (wallet_id_id) REFERENCES wallet (id)');
        $this->addSql('ALTER TABLE crypto_quotation ADD CONSTRAINT FK_A119B53BE9571A63 FOREIGN KEY (crypto_id) REFERENCES crypto_currency (id)');
        $this->addSql('ALTER TABLE transactions ADD CONSTRAINT FK_EAA81A4CF43F82D FOREIGN KEY (wallet_id_id) REFERENCES wallet (id)');
        $this->addSql('ALTER TABLE user_token ADD CONSTRAINT FK_BDF55A63A76ED395 FOREIGN KEY (user_id) REFERENCES user (id) ON DELETE CASCADE');
        $this->addSql('ALTER TABLE wallet ADD CONSTRAINT FK_7C68921F19EB6921 FOREIGN KEY (client_id) REFERENCES user (id)');
    }

    public function down(Schema $schema): void
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->addSql('ALTER TABLE acquiered_crypto DROP FOREIGN KEY FK_D08CA6E969F28E2C');
        $this->addSql('ALTER TABLE acquiered_crypto DROP FOREIGN KEY FK_D08CA6E9F43F82D');
        $this->addSql('ALTER TABLE crypto_quotation DROP FOREIGN KEY FK_A119B53BE9571A63');
        $this->addSql('ALTER TABLE transactions DROP FOREIGN KEY FK_EAA81A4CF43F82D');
        $this->addSql('ALTER TABLE user_token DROP FOREIGN KEY FK_BDF55A63A76ED395');
        $this->addSql('ALTER TABLE wallet DROP FOREIGN KEY FK_7C68921F19EB6921');
        $this->addSql('DROP TABLE acquiered_crypto');
        $this->addSql('DROP TABLE crypto_currency');
        $this->addSql('DROP TABLE crypto_quotation');
        $this->addSql('DROP TABLE transactions');
        $this->addSql('DROP TABLE user');
        $this->addSql('DROP TABLE user_token');
        $this->addSql('DROP TABLE wallet');
        $this->addSql('DROP TABLE messenger_messages');
    }
}
