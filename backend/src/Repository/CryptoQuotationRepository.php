<?php

namespace App\Repository;

use App\Entity\CryptoQuotation;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\Persistence\ManagerRegistry;

/**
 * @extends ServiceEntityRepository<CryptoQuotation>
 */
class CryptoQuotationRepository extends ServiceEntityRepository
{
    public function __construct(ManagerRegistry $registry)
    {
        parent::__construct($registry, CryptoQuotation::class);
    }
    public function findByCrypto(int $cryptoId): array
    {
        return $this->createQueryBuilder('q')
            ->where('q.crypto = :id')
            ->setParameter('id', $cryptoId)
            ->orderBy('q.quotedAt', 'ASC')
            ->getQuery()
            ->getResult();
    }
    //    /**
    //     * @return CryptoQuotation[] Returns an array of CryptoQuotation objects
    //     */
    //    public function findByExampleField($value): array
    //    {
    //        return $this->createQueryBuilder('c')
    //            ->andWhere('c.exampleField = :val')
    //            ->setParameter('val', $value)
    //            ->orderBy('c.id', 'ASC')
    //            ->setMaxResults(10)
    //            ->getQuery()
    //            ->getResult()
    //        ;
    //    }

    //    public function findOneBySomeField($value): ?CryptoQuotation
    //    {
    //        return $this->createQueryBuilder('c')
    //            ->andWhere('c.exampleField = :val')
    //            ->setParameter('val', $value)
    //            ->getQuery()
    //            ->getOneOrNullResult()
    //        ;
    //    }
}
