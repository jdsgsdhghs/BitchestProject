<?php

namespace App\Security;

use App\Repository\UserTokenRepository;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Security\Core\Authentication\Token\TokenInterface;
use Symfony\Component\Security\Core\Exception\AuthenticationException;
use Symfony\Component\Security\Http\Authenticator\AbstractAuthenticator;
use Symfony\Component\Security\Http\Authenticator\Passport\Badge\UserBadge;
use Symfony\Component\Security\Http\Authenticator\Passport\SelfValidatingPassport;
use Symfony\Component\Security\Http\EntryPoint\AuthenticationEntryPointInterface;

final class CookieTokenAuthenticator extends AbstractAuthenticator implements AuthenticationEntryPointInterface
{
    public function __construct(private readonly UserTokenRepository $tokens) {}

    public function supports(Request $request): ?bool
    {
        if ($request->isMethod('OPTIONS')) {
            return false;
        }

        $path = $request->getPathInfo();

        if (in_array($path, ['/api/login', '/api/register', '/api/health'], true)) {
            return false;
        }

        return str_starts_with($path, '/api');
    }

    public function authenticate(Request $request): SelfValidatingPassport
    {
        $rawToken = (string) $request->cookies->get('connect_uid', '');
        if ($rawToken === '') {
            throw new AuthenticationException('Missing token cookie (connect_uid)');
        }

        $hash = hash('sha256', $rawToken);

        $token = $this->tokens->findOneBy(['tokenHash' => $hash]);
        if (!$token) {
            throw new AuthenticationException('Invalid token');
        }

        if ($token->getExpiresAt() && $token->getExpiresAt() < new \DateTimeImmutable()) {
            throw new AuthenticationException('Expired token');
        }

        $user = $token->getUser();

        return new SelfValidatingPassport(
            new UserBadge($user->getUserIdentifier(), fn () => $user)
        );
    }

    public function onAuthenticationSuccess(Request $request, TokenInterface $token, string $firewallName): ?Response
    {
        return null;
    }

    public function onAuthenticationFailure(Request $request, AuthenticationException $exception): ?Response
    {
        return new JsonResponse([
            'error' => 'unauthenticated',
            'reason' => $exception->getMessage(),
        ], 401);
    }

    public function start(Request $request, ?AuthenticationException $authException = null): Response
    {
        return new JsonResponse(['error' => 'unauthenticated'], 401);
    }
}