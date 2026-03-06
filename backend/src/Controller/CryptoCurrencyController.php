<?php

namespace App\Controller;

use App\Entity\CryptoCurrency;
use App\Form\CryptoCurrencyType;
use App\Repository\CryptoCurrencyRepository;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\Routing\Attribute\Route;
use App\Repository\CryptoQuotationRepository;

#[Route('api/crypto', name: "api_cryptocurrency_")]
final class CryptoCurrencyController extends AbstractController
{
    #[Route('', name: '_list', methods: ['GET'])]
    public function list(CryptoCurrencyRepository $CryptoCurrencyRepository): JsonResponse
    {
        $CryptoCurrencies = $CryptoCurrencyRepository->findAll();


        if (!$CryptoCurrencies) {
            return $this->json(['message' => 'No CryptoCurrencies found'], 404);
        }

        $result = array_map(
            fn(CryptoCurrency $c) => $this->cryptoToArray($c),
            $CryptoCurrencies
        );

        return $this->json([
            'CryptoCurrencies' => $result
        ]);
    }

    #[Route('/new', name: '_create', methods: ['POST'])]
    public function create(Request $request, EntityManagerInterface $entityManager): JsonResponse
    {
        $data = json_decode($request->getContent(), true);

        if (json_last_error() !== JSON_ERROR_NONE) {
            return $this->json(['error' => 'Invalid JSON: ' . json_last_error_msg()], 400);
        }

        $CryptoCurrency = new CryptoCurrency();
        $form = $this->createForm(CryptoCurrencyType::class, $CryptoCurrency);

        // true = création complète (tous les champs attendus)
        $form->submit($data);

        if (!$form->isSubmitted() || !$form->isValid()) {
            return $this->json([
                'errors' => (string) $form->getErrors(true, false),
            ], 422);
        }

        $entityManager->persist($CryptoCurrency);
        $entityManager->flush();

        return $this->json($CryptoCurrency);
    }

    #[Route('/{id}', name: '_show', methods: ['GET'])]
    public function show(int $id, CryptoCurrencyRepository $CryptoCurrencyRepository): JsonResponse
    {
        $CryptoCurrency = $CryptoCurrencyRepository->find($id);

        if (!$CryptoCurrency) {
            return $this->json(['message: no crypto founded'], 404);
        }

        return $this->json($this->cryptoToArray($CryptoCurrency));
    }
    #[Route('/{id}/quotations', name: '_quotations', methods: ['GET'])]
    public function quotations(
        int $id,
        CryptoCurrencyRepository $cryptoCurrencyRepository,
        CryptoQuotationRepository $quotationRepository
    ): JsonResponse {
        $crypto = $cryptoCurrencyRepository->find($id);

        if (!$crypto) {
            return $this->json(['message' => 'Crypto not found'], 404);
        }

        $quotations = $quotationRepository->findByCrypto($id);

        $result = array_map(fn($q) => [
            'value'    => $q->getValue(),
            'quotedAt' => $q->getQuotedAt()->format('d M'),
        ], $quotations);

        return $this->json([
            'crypto'     => $crypto->getName(),
            'quotations' => $result,
        ]);
    }

    #[Route('/{id}/edit', name: '_update', methods: ['PUT', 'PATCH'])]
    public function update(
        Request $request,
        EntityManagerInterface $entityManager,
        CryptoCurrency $CryptoCurrency
    ): JsonResponse {
        $data = json_decode($request->getContent(), true);

        if (json_last_error() !== JSON_ERROR_NONE) {
            return $this->json(['error' => 'Invalid JSON: ' . json_last_error_msg()], 400);
        }

        $form = $this->createForm(CryptoCurrencyType::class, $CryptoCurrency);

        // PATCH: update partiel (ne met pas à null les champs absents)
        $clearMissing = $request->getMethod() !== 'PATCH';
        $form->submit($data, $clearMissing);

        if (!$form->isValid()) {
            return $this->json([
                'errors' => (string) $form->getErrors(true, false),
            ], 422);
        }

        $entityManager->flush();

        return $this->json($CryptoCurrency);
    }

    #[Route('/{id}/delete', name: '_delete', methods: ['DELETE'])]
    public function delete(EntityManagerInterface $entityManager, CryptoCurrency $CryptoCurrency): JsonResponse
    {
        $entityManager->remove($CryptoCurrency);
        $entityManager->flush();

        return $this->json(['message' => 'CryptoCurrency deleted successfully'], 200);
    }

    private function cryptoToArray(CryptoCurrency $crypto): array
    {
        return [
            'id' => $crypto->getId(),
            'name' => $crypto->getName(),
            'actualValue' => $crypto->getActualValue(),
            'acquieredCryptos' => array_map(
                function ($acq) {
                    return [
                        'id' => $acq->getId(),
                        'value' => $acq->getValue(),
                        'walletId' => $acq->getWalletId()?->getId(),
                    ];
                },
                $crypto->getAqcuieredCryptos()->toArray()
            )
        ];
    }
}
