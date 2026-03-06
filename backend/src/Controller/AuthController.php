<?php

namespace App\Controller;

use App\Entity\User;
use App\Entity\UserToken;
use App\Entity\Wallet;
use App\Enum\Roles;
use App\Repository\UserRepository;
use App\Repository\UserTokenRepository;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Cookie;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\PasswordHasher\Hasher\UserPasswordHasherInterface;
use Symfony\Component\Routing\Attribute\Route;

final class AuthController extends AbstractController
{
    #[Route('/api/register', methods: ['POST'])]
    public function register(
        Request $request,
        EntityManagerInterface $em,
        UserRepository $users,
        UserPasswordHasherInterface $hasher
    ): JsonResponse {
        $data = json_decode($request->getContent(), true) ?? [];

        $mail = trim((string) ($data['mail'] ?? ''));
        $password = (string) ($data['password'] ?? '');

        if ($mail === '' || $password === '') {
            return $this->json([
                'error' => 'mail/password requis'
            ], 400);
        }

        if ($users->findOneBy(['mail' => $mail])) {
            return $this->json(['error' => 'mail déjà utilisé'], 409);
        }

        $user = new User();
        $user->setMail($mail);
        $user->setCreationDate(new \DateTimeImmutable());
        $user->setRole(Roles::ROLE_USER);
        $user->setPassword($hasher->hashPassword($user, $password));

        $wallet = new Wallet();
        $wallet->setBalance(500);
        $user->setWallet($wallet);

        $em->persist($wallet);
        $em->persist($user);
        $em->flush();

        return $this->json([
            'ok' => true,
            'user' => $this->userToArray($user),
        ], 201);
    }

    #[Route('/api/login', methods: ['POST'])]
    public function login(
        Request $request,
        EntityManagerInterface $em,
        UserRepository $users,
        UserPasswordHasherInterface $hasher
    ): JsonResponse {
        $data = json_decode($request->getContent(), true) ?? [];

        $mail = trim((string) ($data['mail'] ?? ''));
        $password = (string) ($data['password'] ?? '');

        /** @var User|null $user */
        $user = $users->findOneBy(['mail' => $mail]);

        if (!$user || !$hasher->isPasswordValid($user, $password)) {
            return $this->json(['error' => 'identifiants invalides'], 401);
        }

        $rawToken = bin2hex(random_bytes(32));
        $hash = hash('sha256', $rawToken);
        $expiresAt = (new \DateTimeImmutable())->modify('+7 days');

        $token = new UserToken();
        $token->setUser($user);
        $token->setTokenHash($hash);
        $token->setCreatedAt(new \DateTimeImmutable());
        $token->setExpiresAt($expiresAt);

        $em->persist($token);
        $em->flush();

        $cookie = Cookie::create('connect_uid')
            ->withValue($rawToken)
            ->withHttpOnly(true)
            ->withSecure(false)
            ->withSameSite(Cookie::SAMESITE_LAX)
            ->withPath('/')
            ->withExpires($expiresAt->getTimestamp());

        $response = $this->json([
            'ok' => true,
            'user' => $this->userToArray($user),
        ]);

        $response->headers->setCookie($cookie);

        return $response;
    }

    #[Route('/api/me', methods: ['GET'])]
    public function me(): JsonResponse
    {
        /** @var User|null $user */
        $user = $this->getUser();

        if (!$user) {
            return $this->json([
                'ok' => false,
                'error' => 'unauthenticated'
            ], 401);
        }

        return $this->json([
            'ok' => true,
            'user' => $this->userToArray($user),
        ]);
    }

    #[Route('/api/me', methods: ['PATCH'])]
    public function updateMe(
        Request $request,
        EntityManagerInterface $em,
        UserRepository $users,
        UserPasswordHasherInterface $hasher
    ): JsonResponse {
        /** @var User|null $user */
        $user = $this->getUser();

        if (!$user) {
            return $this->json([
                'ok' => false,
                'error' => 'unauthenticated'
            ], 401);
        }

        $data = json_decode($request->getContent(), true) ?? [];

        if (array_key_exists('mail', $data)) {
            $mail = trim((string) $data['mail']);

            if ($mail === '') {
                return $this->json(['error' => 'mail requis'], 400);
            }

            $existingUser = $users->findOneBy(['mail' => $mail]);
            if ($existingUser && $existingUser->getId() !== $user->getId()) {
                return $this->json(['error' => 'mail déjà utilisé'], 409);
            }

            $user->setMail($mail);
        }

        if (array_key_exists('nom', $data)) {
            $nom = trim((string) $data['nom']);
            $user->setNom($nom !== '' ? $nom : null);
        }

        if (array_key_exists('prenom', $data)) {
            $prenom = trim((string) $data['prenom']);
            $user->setPrenom($prenom !== '' ? $prenom : null);
        }

        if (array_key_exists('fonction', $data)) {
            $fonction = trim((string) $data['fonction']);
            $user->setFonction($fonction !== '' ? $fonction : null);
        }

        if (!empty($data['password'])) {
            $user->setPassword(
                $hasher->hashPassword($user, (string) $data['password'])
            );
        }

        $em->flush();

        return $this->json([
            'ok' => true,
            'user' => $this->userToArray($user),
        ]);
    }

    #[Route('/api/logout', methods: ['POST'])]
    public function logout(
        Request $request,
        EntityManagerInterface $em,
        UserTokenRepository $tokens
    ): JsonResponse {
        $rawToken = (string) $request->cookies->get('connect_uid', '');

        if ($rawToken !== '') {
            $hash = hash('sha256', $rawToken);
            $token = $tokens->findOneBy(['tokenHash' => $hash]);

            if ($token) {
                $em->remove($token);
                $em->flush();
            }
        }

        $response = $this->json(['ok' => true]);

        $response->headers->clearCookie('connect_uid', '/');
        $response->headers->clearCookie('connect.uid', '/');

        return $response;
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
            'roles' => $user->getRoles(),
            'creationDate' => $user->getCreationDate()?->format('Y-m-d H:i:s'),
            'walletBalance' => $user->getWallet()?->getBalance(),
            'wallet' => $user->getWallet() ? [
                'id' => $user->getWallet()->getId(),
                'balance' => $user->getWallet()->getBalance(),
            ] : null,
        ];
    }
}