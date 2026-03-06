<?php

namespace App\Form;

use App\Entity\AcquieredCrypto;
use App\Entity\CryptoCurrency;
use App\Entity\Wallet;
use Symfony\Bridge\Doctrine\Form\Type\EntityType;
use Symfony\Component\Form\AbstractType;
use Symfony\Component\Form\FormBuilderInterface;
use Symfony\Component\OptionsResolver\OptionsResolver;

class AcquieredCryptoType extends AbstractType
{
    public function buildForm(FormBuilderInterface $builder, array $options): void
    {
        $builder
            ->add('name')
            ->add('value')
            ->add('walletId', EntityType::class, [
                'class' => Wallet::class,
            ])
            ->add('cryptoId', EntityType::class, [
                'class' => CryptoCurrency::class,
            ]);;
    }

    public function configureOptions(OptionsResolver $resolver): void
    {
        $resolver->setDefaults([
            'data_class' => AcquieredCrypto::class,
            'csrf_protection' => false,
        ]);
    }
}
