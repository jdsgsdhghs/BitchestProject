<?php

namespace App\Controller;

use App\Entity\Transactions;
use App\Form\TransactionsType;
use App\Repository\TransactionsRepository;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\Routing\Attribute\Route;

#[Route('/api/transactions', name: 'api_transactions_')]
final class TransactionsController extends AbstractController
{

    #[Route('', name: '_list', methods: ['GET'])]
    public function list(TransactionsRepository $transactionsRepository): JsonResponse
    {
        $transactions = $transactionsRepository->findAll();
        if ($transactions) {
            return $this->json($transactions);
        } else {
            return $this->json(['message' => 'No transactions found'], 404);
        }
    }

    #[Route('/new', name: '_create', methods: ['POST'])]
    public function create(Request $request, EntityManagerInterface $entityManager): JsonResponse
    {
        $data = json_decode($request->getContent(), true);

        if (json_last_error() !== JSON_ERROR_NONE) {
            return $this->json(['error' => 'Invalid JSON: ' . json_last_error_msg()], 400);
        }

        $transaction = new Transactions();
        $form = $this->createForm(TransactionsType::class, $transaction);

        // true = création complète (tous les champs attendus)
        $form->submit($data);

        if (!$form->isSubmitted() || !$form->isValid()) {
            return $this->json([
                'errors' => (string) $form->getErrors(true, false),
            ], 422);
        }

        $entityManager->persist($transaction);
        $entityManager->flush();

        return $this->json($transaction);
    }

    #[Route('/{id}', name: '_show', methods: ['GET'])]
    public function show(int $id, TransactionsRepository $transactionsRepository): JsonResponse
    {
        $transactions = $transactionsRepository->find($id);

        if (!$transactions) {
            return $this->json(['message' => 'Transactions not found'], 404);
        }

        return $this->json($transactions);
    }

    #[Route('/{id}/edit', name: '_update', methods: ['PUT', 'PATCH'])]
    public function update(
        Request $request,
        EntityManagerInterface $entityManager,
        Transactions $transactions
    ): JsonResponse {
        $data = json_decode($request->getContent(), true);

        if (json_last_error() !== JSON_ERROR_NONE) {
            return $this->json(['error' => 'Invalid JSON: ' . json_last_error_msg()], 400);
        }

        $form = $this->createForm(TransactionsType::class, $transactions);

        // PATCH: update partiel (ne met pas à null les champs absents)
        $clearMissing = $request->getMethod() !== 'PATCH';
        $form->submit($data, $clearMissing);

        if (!$form->isValid()) {
            return $this->json([
                'errors' => (string) $form->getErrors(true, false),
            ], 422);
        }

        $entityManager->flush();

        return $this->json($transactions);
    }

    #[Route('/{id}/delete', name: '_delete', methods: ['DELETE'])]
    public function delete(EntityManagerInterface $entityManager, Transactions $transactions): JsonResponse
    {
        $entityManager->remove($transactions);
        $entityManager->flush();

        return $this->json(['message' => 'transactions deleted successfully'], 200);
    }
}
