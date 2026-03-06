<?php

namespace App\Entity;

use App\Repository\WalletRepository;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\Common\Collections\Collection;
use Doctrine\ORM\Mapping as ORM;
use Symfony\Component\Serializer\Attribute\Ignore;

#[ORM\Entity(repositoryClass: WalletRepository::class)]
class Wallet
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    private ?int $id = null;

    #[ORM\Column]
    private ?float $balance = null;

    #[Ignore]
    #[ORM\OneToOne(inversedBy: 'wallet', cascade: ['persist', 'remove'])]
    private ?User $client = null;

    /**
     * @var Collection<int, Transactions>
     */
    #[ORM\OneToMany(targetEntity: Transactions::class, mappedBy: 'walletId', orphanRemoval: true)]
    private Collection $transactions;

    /**
     * @var Collection<int, AcquieredCrypto>
     */
    #[ORM\OneToMany(targetEntity: AcquieredCrypto::class, mappedBy: 'walletId', orphanRemoval: true)]
    private Collection $aqcuieredCryptos;

    public function __construct()
    {
        $this->transactions = new ArrayCollection();
        $this->aqcuieredCryptos = new ArrayCollection();
    }

    public function getId(): ?int
    {
        return $this->id;
    }

    public function getBalance(): ?float
    {
        return $this->balance;
    }

    public function setBalance(float $balance): static
    {
        $this->balance = $balance;
        return $this;
    }

    public function getClient(): ?User
    {
        return $this->client;
    }

    public function setClient(?User $client): static
    {
        $this->client = $client;
        return $this;
    }

    /**
     * @return Collection<int, Transactions>
     */
    public function getTransactions(): Collection
    {
        return $this->transactions;
    }

    public function addTransaction(Transactions $transaction): static
    {
        if (!$this->transactions->contains($transaction)) {
            $this->transactions->add($transaction);
            $transaction->setWalletId($this);
        }

        return $this;
    }

    public function removeTransaction(Transactions $transaction): static
    {
        if ($this->transactions->removeElement($transaction)) {
            if ($transaction->getWalletId() === $this) {
                $transaction->setWalletId(null);
            }
        }

        return $this;
    }

    /**
     * @return Collection<int, AcquieredCrypto>
     */
    public function getAqcuieredCryptos(): Collection
    {
        return $this->aqcuieredCryptos;
    }

    public function addAqcuieredCrypto(AcquieredCrypto $aqcuieredCrypto): static
    {
        if (!$this->aqcuieredCryptos->contains($aqcuieredCrypto)) {
            $this->aqcuieredCryptos->add($aqcuieredCrypto);
            $aqcuieredCrypto->setWalletId($this);
        }

        return $this;
    }

    public function removeAqcuieredCrypto(AcquieredCrypto $aqcuieredCrypto): static
    {
        if ($this->aqcuieredCryptos->removeElement($aqcuieredCrypto)) {
            if ($aqcuieredCrypto->getWalletId() === $this) {
                $aqcuieredCrypto->setWalletId(null);
            }
        }

        return $this;
    }
}