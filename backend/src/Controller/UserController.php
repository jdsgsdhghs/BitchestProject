<?php

namespace App\Controller;

use App\Entity\User;
use App\Entity\Wallet;
use App\Enum\Roles;
use App\Form\UserType;
use App\Repository\UserRepository;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\PasswordHasher\Hasher\UserPasswordHasherInterface;
use Symfony\Component\Routing\Attribute\Route;

#[Route('/api/admin', name: 'api_admin_users')]
final class UserController extends AbstractController
{
    #[Route('', name: '_list', methods: ['GET'])]
    public function list(UserRepository $userRepository): JsonResponse
    {
        $users = $userRepository->findAll();

        if (!$users) {
            return $this->json(['message' => 'No users found'], 404);
        }

        $result = array_map(fn(User $u) => $this->userToArray($u), $users);

        return $this->json(['users' => $result]);
    }

    #[Route('/{id}/password', name: '_verify_password', methods: ['POST', 'PATCH'])]
    public function verifyPassword(
        int $id,
        Request $request,
        UserRepository $userRepository,
        UserPasswordHasherInterface $passwordHasher
    ): JsonResponse {
        $data = json_decode($request->getContent(), true);

        $user = $userRepository->find($id);

        if (!$user) {
            return $this->json(['message' => 'User not found'], 404);
        }

        if (empty($data['password'])) {
            return $this->json(['message' => 'Password required'], 400);
        }

        if ($passwordHasher->isPasswordValid($user, $data['password'])) {
            return $this->json(['valid' => true]);
        }

        return $this->json(['valid' => false], 401);
    }

    #[Route('/{id}', name: '_show', methods: ['GET'])]
    public function show(int $id, UserRepository $userRepository): JsonResponse
    {
        $user = $userRepository->find($id);

        if (!$user) {
            return $this->json(['message' => 'User not found'], 404);
        }

        return $this->json($this->userToArray($user));
    }

    #[Route('/new', name: '_create', methods: ['POST'])]
    public function create(
        Request $request,
        EntityManagerInterface $em,
        UserPasswordHasherInterface $passwordHasher
    ): JsonResponse {
        $data = json_decode($request->getContent(), true);

        if (json_last_error() !== JSON_ERROR_NONE) {
            return $this->json(['error' => 'Invalid JSON: ' . json_last_error_msg()], 400);
        }

        $user = new User();
        $user->setCreationDate(new \DateTime());

        $form = $this->createForm(UserType::class, $user);
        $form->submit($data);

        if (!$form->isValid()) {
            return $this->json([
                'errors' => (string) $form->getErrors(true, false),
            ], 422);
        }

        $plainPassword = $this->generatePassword();
        $user->setPassword(
            $passwordHasher->hashPassword($user, $plainPassword)
        );

        if ($user->getRole() === Roles::ROLE_USER && $user->getWallet() === null) {
            $wallet = new Wallet();
            $wallet->setBalance(500);
            $user->setWallet($wallet);
            $em->persist($wallet);
        }

        $em->persist($user);
        $em->flush();

        return $this->json([
            'user' => $this->userToArray($user),
            'generatedPassword' => $plainPassword,
        ], 201);
    }

    #[Route('/{id}/edit', name: '_update', methods: ['PUT', 'PATCH'])]
    public function update(
        Request $request,
        EntityManagerInterface $entityManager,
        User $user,
        UserPasswordHasherInterface $passwordHasher
    ): JsonResponse {
        $data = json_decode($request->getContent(), true);

        if (json_last_error() !== JSON_ERROR_NONE) {
            return $this->json(['error' => 'Invalid JSON: ' . json_last_error_msg()], 400);
        }

        $form = $this->createForm(UserType::class, $user);
        $clearMissing = $request->getMethod() !== 'PATCH';
        $form->submit($data, $clearMissing);

        if (!$form->isValid()) {
            return $this->json([
                'errors' => (string) $form->getErrors(true, false),
            ], 422);
        }

        if (!empty($data['password'])) {
            $hashedPassword = $passwordHasher->hashPassword($user, $data['password']);
            $user->setPassword($hashedPassword);
        }

        $entityManager->flush();

        return $this->json($this->userToArray($user));
    }

    #[Route('/{id<\d+>}/delete', name: '_delete', methods: ['DELETE'])]
    public function delete(EntityManagerInterface $entityManager, User $user): JsonResponse
    {
        $entityManager->remove($user);
        $entityManager->flush();

        return $this->json(['message' => 'User deleted successfully'], 200);
    }

    private function generatePassword(int $length = 14): string
    {
        $characters = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()';
        $charactersLength = strlen($characters);
        $randomPassword = '';

        for ($i = 0; $i < $length; $i++) {
            $randomPassword .= $characters[random_int(0, $charactersLength - 1)];
        }

        return $randomPassword;
    }

    private function userToArray(User $user): array
    {
        return [
            'id' => $user->getId(),
            'mail' => $user->getMail(),
            'nom' => $user->getNom(),
            'prenom' => $user->getPrenom(),
            'fonction' => $user->getFonction(),
            'role' => $user->getRole()?->value,
            'creationDate' => $user->getCreationDate()?->format('Y-m-d H:i:s'),
            'walletBalance' => $user->getWallet()?->getBalance(),
            'wallet' => $user->getWallet() ? [
                'id' => $user->getWallet()->getId(),
                'balance' => $user->getWallet()->getBalance(),
            ] : null,
        ];
    }
}