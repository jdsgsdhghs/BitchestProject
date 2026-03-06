<?php

namespace App\Controller;

use App\Entity\AcquieredCrypto;
use App\Entity\Transactions;
use App\Form\AcquieredCryptoType;
use App\Repository\AcquieredCryptoRepository;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\Routing\Attribute\Route;

#[Route('api/acquieredcrypto', name: 'api_acquiered_crypto_')]
final class AcquieredCryptoController extends AbstractController
{
    #[Route(name: '', methods: ['GET'])]
    public function index(AcquieredCryptoRepository $acquieredCryptoRepository): JsonResponse
    {
        $acquieredCrypto = $acquieredCryptoRepository->findAll();
        if (!$acquieredCrypto) {
            return $this->json(['message' => 'No acquieredCrypto found'], 404);
        }

        $result = array_map(
            fn(AcquieredCrypto $a) => $this->cryptoToArray($a),
            $acquieredCrypto
        );

        return $this->json([
            'acquieredCrypto' => $result
        ]);
    }

    #[Route('/new', name: 'new', methods: ['POST'])]
    public function new(Request $request, EntityManagerInterface $entityManager): JsonResponse
    {
        $data = json_decode($request->getContent(), true);

        if (json_last_error() !== JSON_ERROR_NONE) {
            return $this->json(['error' => 'Invalid JSON: ' . json_last_error_msg()], 400);
        }
        $acquiriedCrypto = new AcquieredCrypto();

        $form = $this->createForm(AcquieredCryptoType::class, $acquiriedCrypto);
        $form->submit($data);

        if (!$form->isValid()) {
            return $this->json([
                'errors' => (string) $form->getErrors(true),
            ], 422);
        }

        $transactions = new Transactions();
        $transactions->setDate(new \DateTime());
        $transactions->setValue($acquiriedCrypto->getValue());
        $transactions->setCryptoId($acquiriedCrypto->getCryptoId()->getId());
        $transactions->setWalletId($acquiriedCrypto->getWalletId());
        $entityManager->persist($transactions);

        $entityManager->persist($acquiriedCrypto);
        $entityManager->flush();

        return new JsonResponse([
            'id' => $acquiriedCrypto->getId(),
            'value' => $acquiriedCrypto->getValue(),
            'walletId' => $acquiriedCrypto->getWalletId(),
            'cryptoId' => $acquiriedCrypto->getCryptoId()
        ]);
    }

    #[Route('/{id<\d+>}', name: 'show', methods: ['GET'])]
    public function show(int $id, AcquieredCryptoRepository $acquieredCryptoRepository): JsonResponse
    {
        $acquieredCrypto = $acquieredCryptoRepository->find($id);
        if (!$acquieredCrypto) {
            return $this->json(['No crypto founded'], 404);
        }
        return $this->json($this->cryptoToArray($acquieredCrypto));
    }

    #[Route('/{id<\d+>}/edit', name: 'update', methods: ['PUT', 'PATCH'])]
    public function update(
        Request $request,
        EntityManagerInterface $entityManager,
        AcquieredCrypto $acquieredCrypto
    ): JsonResponse {
        $data = json_decode($request->getContent(), true);

        if (json_last_error() !== JSON_ERROR_NONE) {
            return $this->json(['error' => 'Invalid JSON: ' . json_last_error_msg()], 400);
        }

        $form = $this->createForm(AcquieredCryptoType::class, $acquieredCrypto);

        // PATCH: update partiel (ne met pas à null les champs absents)
        $clearMissing = $request->getMethod() !== 'PATCH';
        $form->submit($data, $clearMissing);

        if (!$form->isValid()) {
            return $this->json([
                'errors' => (string) $form->getErrors(true, false),
            ], 422);
        }

        $entityManager->flush();

        return $this->json($acquieredCrypto);
    }

    #[Route('/{id<\d+>}', name: 'app_acquiered_crypto_delete', methods: ['POST'])]
    public function delete(EntityManagerInterface $entityManager, AcquieredCrypto $acquieredCrypto): JsonResponse
    {
        $entityManager->remove($acquieredCrypto);
        $entityManager->flush();

        return $this->json(['message' => 'AcquieredCrypto deleted successfully'], 200);
    }

    private function cryptoToArray(AcquieredCrypto $acquieredCrypto): array
    {
        $wallet = $acquieredCrypto->getWalletId();
        $crypto = $acquieredCrypto->getCryptoId();
        return [
            'id' => $acquieredCrypto->getId(),
            'value' => $acquieredCrypto->getValue(),
            'wallet' => $wallet ? [
                'id' => $wallet->getId(),
            ] : null,
            'crypto' => $crypto ? [
                'id' => $crypto->getId(),
                'name' => $crypto->getName()
            ] : null
        ];
    }
}
