<?php

namespace App\Controller;

use App\Entity\Wallet;
use App\Form\WalletType;
use App\Repository\WalletRepository;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\Routing\Attribute\Route;

#[Route('/api/wallet', name: 'api_wallet_')]
final class WalletController extends AbstractController
{
    #[Route(name: '', methods: ['GET'])]
    public function index(WalletRepository $walletRepository): JsonResponse
    {
        $wallets = $walletRepository->findAll();
        if (!$wallets) {
            return $this->json(['message' => 'No wallets found'], 404);
        }

        $result = array_map(
            fn(Wallet $w) => $this->walletToArray($w),
            $wallets
        );

        return $this->json([
            'wallets' => $result
        ]);
    }

    #[Route('/new', name: 'new', methods: ['GET', 'POST'])]
    public function new(Request $request, EntityManagerInterface $entityManager): JsonResponse
    {
        $data = json_decode($request->getContent(), true);

        if (json_last_error() !== JSON_ERROR_NONE) {
            return $this->json(['error' => 'Invalid JSON: ' . json_last_error_msg()], 400);
        }

        $wallet = new Wallet();
        $form = $this->createForm(WalletType::class, $wallet);

        // true = création complète (tous les champs attendus)
        $form->submit($data);

        if (!$form->isSubmitted() || !$form->isValid()) {
            return $this->json([
                'errors' => (string) $form->getErrors(true, false),
            ], 422);
        }

        $entityManager->persist($wallet);
        $entityManager->flush();

        return new JsonResponse([
            'id' => $wallet->getId(),
            'balance' => $wallet->getBalance(),
            'clientId' => $wallet->getClientId(),
        ]);
    }


    #[Route('/{id}', name: 'app_wallet_show', methods: ['GET'])]
    public function show(int $id, WalletRepository $walletRepository): JsonResponse
    {
        $wallet = $walletRepository->find($id);

        if (!$wallet) {
            return $this->json(['message' => 'Wallet not found'], 404);
        }

        return $this->json($this->walletToArray($wallet));
    }

    #[Route('/{id}/edit', name: 'app_wallet_edit', methods: ['PUT', 'PATCH'])]
    public function update(
        Request $request,
        EntityManagerInterface $entityManager,
        Wallet $wallet
    ): JsonResponse {
        $data = json_decode($request->getContent(), true);

        if (json_last_error() !== JSON_ERROR_NONE) {
            return $this->json(['error' => 'Invalid JSON: ' . json_last_error_msg()], 400);
        }

        $form = $this->createForm(WalletType::class, $wallet);

        // PATCH: update partiel (ne met pas à null les champs absents)
        $clearMissing = $request->getMethod() !== 'PATCH';
        $form->submit($data, $clearMissing);

        if (!$form->isValid()) {
            return $this->json([
                'errors' => (string) $form->getErrors(true, false),
            ], 422);
        }

        $entityManager->flush();

        return $this->json($this->walletToArray($wallet));
    }

    #[Route('/{id}/delete', name: '_delete', methods: ['DELETE'])]
    public function delete(EntityManagerInterface $entityManager, Wallet $wallet): JsonResponse
    {
        $entityManager->remove($wallet);
        $entityManager->flush();

        return $this->json(['message' => 'Wallet deleted successfully'], 200);
    }
    private function walletToArray(Wallet $wallet): array
    {
        $client = $wallet->getClientId();

        return [
            'id' => $wallet->getId(),
            'balance' => $wallet->getBalance(),
            'client' => $client ? [
                'id' => $client->getId(),
            ] : null,
        ];
    }
}
