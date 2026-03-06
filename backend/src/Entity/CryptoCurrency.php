<?php

namespace App\Entity;

use App\Repository\CryptoCurrencyRepository;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\Common\Collections\Collection;
use Doctrine\ORM\Mapping as ORM;

#[ORM\Entity(repositoryClass: CryptoCurrencyRepository::class)]
class CryptoCurrency
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    private ?int $id = null;

    #[ORM\Column(length: 255)]
    private ?string $name = null;

    #[ORM\Column]
    private ?float $actualValue = null;

    /**
     * @var Collection<int, AcquieredCrypto>
     */
    #[ORM\OneToMany(targetEntity: AcquieredCrypto::class, mappedBy: 'cryptoId', orphanRemoval: true)]
    private Collection $aqcuieredCryptos;

    public function __construct()
    {
        $this->aqcuieredCryptos = new ArrayCollection();
    }

    public function getId(): ?int
    {
        return $this->id;
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

    public function getActualValue(): ?float
    {
        return $this->actualValue;
    }

    public function setActualValue(float $actualValue): static
    {
        $this->actualValue = $actualValue;

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
            $aqcuieredCrypto->setCryptoId($this);
        }

        return $this;
    }

    public function removeAqcuieredCrypto(AcquieredCrypto $aqcuieredCrypto): static
    {
        if ($this->aqcuieredCryptos->removeElement($aqcuieredCrypto)) {
            // set the owning side to null (unless already changed)
            if ($aqcuieredCrypto->getCryptoId() === $this) {
                $aqcuieredCrypto->setCryptoId(null);
            }
        }

        return $this;
    }
}
