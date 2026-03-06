<?php

namespace App\Entity;

use App\Repository\TransactionsRepository;
use Doctrine\ORM\Mapping as ORM;

#[ORM\Entity(repositoryClass: TransactionsRepository::class)]
class Transactions
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    private ?int $id = null;

    #[ORM\Column(length: 255)]
    private ?string $cryptoId = null;

    #[ORM\Column]
    private ?float $value = null;

    #[ORM\Column]
    private ?\DateTime $date = null;

    #[ORM\ManyToOne(inversedBy: 'transactions')]
    #[ORM\JoinColumn(nullable: false)]
    private ?Wallet $walletId = null;

    public function getId(): ?int
    {
        return $this->id;
    }

    public function getCryptoId(): ?string
    {
        return $this->cryptoId;
    }

    public function setCryptoId(string $cryptoId): static
    {
        $this->cryptoId = $cryptoId;

        return $this;
    }

    public function getValue(): ?float
    {
        return $this->value;
    }

    public function setValue(float $value): static
    {
        $this->value = $value;

        return $this;
    }

    public function getDate(): ?\DateTime
    {
        return $this->date;
    }

    public function setDate(\DateTime $date): static
    {
        $this->date = $date;

        return $this;
    }

    public function getWalletId(): ?Wallet
    {
        return $this->walletId;
    }

    public function setWalletId(?Wallet $walletId): static
    {
        $this->walletId = $walletId;

        return $this;
    }
}
