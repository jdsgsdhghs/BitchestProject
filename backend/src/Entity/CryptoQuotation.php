<?php

namespace App\Entity;

use App\Repository\CryptoQuotationRepository;
use Doctrine\ORM\Mapping as ORM;

#[ORM\Entity(repositoryClass: CryptoQuotationRepository::class)]
class CryptoQuotation
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    private ?int $id = null;

    #[ORM\ManyToOne(targetEntity: CryptoCurrency::class, inversedBy: 'quotations')]
    #[ORM\JoinColumn(nullable: false)]
    private ?CryptoCurrency $crypto = null;

    #[ORM\Column]
    private ?float $value = null;

    #[ORM\Column(type: 'datetime')]
    private ?\DateTimeInterface $quotedAt = null;

    public function getId(): ?int
    {
        return $this->id;
    }

    public function getCrypto(): ?CryptoCurrency
    {
        return $this->crypto;
    }

    public function setCrypto(?CryptoCurrency $crypto): static
    {
        $this->crypto = $crypto;
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

    public function getQuotedAt(): ?\DateTimeInterface
    {
        return $this->quotedAt;
    }

    public function setQuotedAt(\DateTimeInterface $quotedAt): static
    {
        $this->quotedAt = $quotedAt;
        return $this;
    }
}
