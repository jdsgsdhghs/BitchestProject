<?php

namespace App\DataFixtures;

use App\Entity\CryptoCurrency;
use App\Entity\CryptoQuotation;
use Doctrine\Bundle\FixturesBundle\Fixture;
use Doctrine\Persistence\ObjectManager;

class CryptoFixtures extends Fixture
{

    private function generateFirstValue(string $cryptoName): float
    {
        $initialValues = [
            'Bitcoin'      => rand(15000, 30000),
            'Ethereum'     => rand(1000,  2000),
            'Ripple'       => round(rand(30, 80) / 100, 4),
            'Bitcoin cash' => rand(100,   300),
            'Cardano'      => round(rand(20, 60) / 100, 4),
            'Litecoin'     => rand(50,    150),
            'Dash'         => rand(30,    80),
            'Iota'         => round(rand(10, 50) / 100, 4),
            'NEM'          => round(rand(3, 15) / 100, 4),
            'Stellar'      => round(rand(5, 20) / 100, 4),
        ];

        return $initialValues[$cryptoName] ?? rand(1, 100);
    }


    private function generateNextValue(float $previousValue): float
    {

        $variationPercent = rand(-10, 10);
        $variation = $previousValue * ($variationPercent / 100);
        $newValue = $previousValue + $variation;


        return max(0.0001, round($newValue, 4));
    }


    public function load(ObjectManager $manager): void
    {
        $cryptoNames = [
            'Bitcoin',
            'Ethereum',
            'Ripple',
            'Bitcoin cash',
            'Cardano',
            'Litecoin',
            'Dash',
            'Iota',
            'NEM',
            'Stellar',
        ];

        foreach ($cryptoNames as $name) {

            $crypto = new CryptoCurrency();
            $crypto->setName($name);

            $firstValue = $this->generateFirstValue($name);
            $currentValue = $firstValue;

            for ($day = 30; $day >= 0; $day--) {
                $quotation = new CryptoQuotation();
                $quotation->setCrypto($crypto);
                $quotation->setValue($currentValue);

                $date = new \DateTime();
                $date->modify("-{$day} days");

                $date->setTime(12, 0, 0);
                $quotation->setQuotedAt($date);

                $manager->persist($quotation);


                $currentValue = $this->generateNextValue($currentValue);
            }


            $crypto->setActualValue($currentValue);

            $manager->persist($crypto);
        }

        $manager->flush();
    }
}
