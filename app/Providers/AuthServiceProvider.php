<?php

namespace App\Providers;

use App\Http\Middleware\CheckPermission;
use App\Http\Middleware\CheckRole;
use Illuminate\Routing\Router;
use Illuminate\Support\ServiceProvider;

class AuthServiceProvider extends ServiceProvider
{
    /**
     * Register services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap services.
     */
    public function boot(): void
    {
        $router = $this->app->make(Router::class);

        // Register middleware aliases
        $router->aliasMiddleware('permission', CheckPermission::class);
        $router->aliasMiddleware('role', CheckRole::class);
    }
}
