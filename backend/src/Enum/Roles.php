<?php

namespace App\Enum;

enum Roles: string
{
    case ROLE_ADMIN = 'ROLE_ADMIN';
    case ROLE_USER  = 'ROLE_USER';
}