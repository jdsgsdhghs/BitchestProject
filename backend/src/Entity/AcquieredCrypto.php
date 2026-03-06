<?php

namespace App\Entity;

use App\Repository\AcquieredCryptoRepository;
use Doctrine\ORM\Mapping as ORM;

#[ORM\Entity(repositoryClass: AcquieredCryptoRepository::class)]
class AcquieredCrypto
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    private ?int $id = null;

    #[ORM\ManyToOne(inversedBy: 'aqcuieredCryptos')]
    #[ORM\JoinColumn(nullable: false)]
    private ?CryptoCurrency $cryptoId = null;

    #[ORM\ManyToOne(inversedBy: 'aqcuieredCryptos')]
    #[ORM\JoinColumn(nullable: false)]
    private ?Wallet $walletId = null;

    #[ORM\Column(length: 255)]
    private ?string $name = null;

    #[ORM\Column]
    private ?float $value = null;

    public function getId(): ?int
    {
        return $this->id;
    }

    public function getCryptoId(): ?CryptoCurrency
    {
        return $this->cryptoId;
    }

    public function setCryptoId(?CryptoCurrency $cryptoId): static
    {
        $this->cryptoId = $cryptoId;

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

    public function getName(): ?string
    {
        return $this->name;
    }

    public function setName(string $name): static
    {
        $this->name = $name;

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
}
