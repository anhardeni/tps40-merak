<?php

use App\Http\Controllers\ProfileController;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    return Inertia::render('Welcome', [
        'canLogin' => Route::has('login'),
        'canRegister' => Route::has('register'),
        'laravelVersion' => Application::VERSION,
        'phpVersion' => PHP_VERSION,
    ]);
});

Route::get('/dashboard', function () {
    return Inertia::render('Dashboard', [
        'stats' => [
            'totalDocuments' => \App\Models\Document::count(),
            'totalTangki' => \App\Models\Tangki::count(),
            'totalUsers' => \App\Models\User::count(),
            'recentActivity' => \App\Models\Document::whereDate('created_at', today())->count(),
        ],
    ]);
})->middleware(['auth', 'verified'])->name('dashboard');

Route::middleware('auth')->group(function () {
    // Documents Routes - Using Resource Controller
    Route::resource('documents', \App\Http\Controllers\DocumentController::class)->except(['destroy']);
    Route::delete('/documents/{document}', [\App\Http\Controllers\DocumentController::class, 'destroy'])->name('documents.destroy');
    Route::post('/documents/{document}/submit', [\App\Http\Controllers\DocumentController::class, 'submit'])->name('documents.submit');

    // Export Routes - Preview and Download XML/JSON
    Route::prefix('api/export')->name('export.')->group(function () {
        // XML exports - available for all authenticated users
        Route::get('documents/{id}/preview/xml', [\App\Http\Controllers\Api\ExportController::class, 'previewXml'])->name('preview.xml');
        Route::get('documents/{id}/download/xml', [\App\Http\Controllers\Api\ExportController::class, 'downloadXml'])->name('xml');

        // JSON exports - requires export.json permission
        Route::middleware('permission:export.json')->group(function () {
            Route::get('documents/{id}/preview/json', [\App\Http\Controllers\Api\ExportController::class, 'previewJson'])->name('preview.json');
            Route::get('documents/{id}/download/json', [\App\Http\Controllers\Api\ExportController::class, 'downloadJson'])->name('json');
        });

        // Bulk export and send to host - requires export.json permission
        Route::middleware('permission:export.json')->group(function () {
            Route::post('documents/bulk', [\App\Http\Controllers\Api\ExportController::class, 'bulkExport'])->name('bulk');
            Route::post('documents/{id}/send-to-host', [\App\Http\Controllers\Api\ExportController::class, 'sendToHost'])->name('send-to-host');
        });
    });

    // CoCoTangki Routes
    Route::prefix('cocotangki')->name('cocotangki.')->group(function () {
        // View routes - requires documents.view permission
        Route::middleware('permission:documents.view')->group(function () {
            Route::get('/', [App\Http\Controllers\CoCoTangkiController::class, 'index'])->name('index');
            Route::get('/{document}', [App\Http\Controllers\CoCoTangkiController::class, 'show'])->name('show');
            Route::get('/{document}/validate', [App\Http\Controllers\CoCoTangkiController::class, 'validate'])->name('validate');
            Route::get('/{document}/status', [App\Http\Controllers\CoCoTangkiController::class, 'status'])->name('status');
        });

        // Export routes - requires documents.export permission
        Route::middleware('permission:documents.export')->group(function () {
            Route::get('/{document}/generate-xml', [App\Http\Controllers\CoCoTangkiController::class, 'generateXml'])->name('generate-xml');
            Route::get('/{document}/download', [App\Http\Controllers\CoCoTangkiController::class, 'download'])->name('download');
        });

        // Submit routes - requires documents.submit permission
        Route::middleware('permission:documents.submit')->group(function () {
            Route::post('/{document}/send', [App\Http\Controllers\CoCoTangkiController::class, 'send'])->name('send');
            Route::post('/send-bulk', [App\Http\Controllers\CoCoTangkiController::class, 'sendBulk'])->name('send-bulk');
            Route::post('/{document}/retry', [App\Http\Controllers\CoCoTangkiController::class, 'retry'])->name('retry');
        });
    });

    // Logs Routes
    Route::get('/logs', function () {
        return Inertia::render('Logs/Index');
    })->name('logs.index');

    Route::get('/logs/errors', function () {
        return Inertia::render('Logs/Errors');
    })->name('logs.errors');

    Route::get('/logs/soap', function () {
        $logs = \App\Models\SoapLog::latest()->paginate(50);

        return Inertia::render('Logs/SoapLogs', [
            'logs' => [
                'data' => $logs->items(),
                'meta' => [
                    'current_page' => $logs->currentPage(),
                    'from' => $logs->firstItem(),
                    'last_page' => $logs->lastPage(),
                    'per_page' => $logs->perPage(),
                    'to' => $logs->lastItem(),
                    'total' => $logs->total(),
                ],
                'links' => [
                    'first' => $logs->url(1),
                    'last' => $logs->url($logs->lastPage()),
                    'prev' => $logs->previousPageUrl(),
                    'next' => $logs->nextPageUrl(),
                ],
            ],
        ]);
    })->name('logs.soap');

    // Admin Routes (Requires manage.users permission)
    Route::prefix('admin')->middleware('permission:manage.users')->group(function () {
        // User Management Routes
        Route::get('/users', [\App\Http\Controllers\Admin\UserController::class, 'index'])->name('admin.users.index');
        Route::get('/users/create', [\App\Http\Controllers\Admin\UserController::class, 'create'])->name('admin.users.create');
        Route::post('/users', [\App\Http\Controllers\Admin\UserController::class, 'store'])->name('admin.users.store');
        Route::get('/users/{user}', [\App\Http\Controllers\Admin\UserController::class, 'show'])->name('admin.users.show');
        Route::get('/users/{user}/edit', [\App\Http\Controllers\Admin\UserController::class, 'edit'])->name('admin.users.edit');
        Route::put('/users/{user}', [\App\Http\Controllers\Admin\UserController::class, 'update'])->name('admin.users.update');
        Route::delete('/users/{user}', [\App\Http\Controllers\Admin\UserController::class, 'destroy'])->name('admin.users.destroy');
        Route::patch('/users/{user}/toggle-status', [\App\Http\Controllers\Admin\UserController::class, 'toggleStatus'])->name('admin.users.toggle-status');
        Route::patch('/users/{user}/roles', [\App\Http\Controllers\Admin\UserController::class, 'updateRoles'])->name('admin.users.update-roles');
        Route::patch('/users/{user}/reset-password', [\App\Http\Controllers\Admin\UserController::class, 'resetPassword'])->name('admin.users.reset-password');

        // Role Management Routes
        Route::get('/roles', [\App\Http\Controllers\Admin\RoleController::class, 'index'])->name('admin.roles.index');
        Route::get('/roles/create', [\App\Http\Controllers\Admin\RoleController::class, 'create'])->name('admin.roles.create');
        Route::post('/roles', [\App\Http\Controllers\Admin\RoleController::class, 'store'])->name('admin.roles.store');
        Route::get('/roles/{role}', [\App\Http\Controllers\Admin\RoleController::class, 'show'])->name('admin.roles.show');
        Route::get('/roles/{role}/edit', [\App\Http\Controllers\Admin\RoleController::class, 'edit'])->name('admin.roles.edit');
        Route::put('/roles/{role}', [\App\Http\Controllers\Admin\RoleController::class, 'update'])->name('admin.roles.update');
        Route::delete('/roles/{role}', [\App\Http\Controllers\Admin\RoleController::class, 'destroy'])->name('admin.roles.destroy');

        // Permission Management Routes
        Route::resource('permissions', \App\Http\Controllers\Admin\PermissionController::class)
            ->only(['index', 'create', 'store', 'edit', 'update', 'destroy'])
            ->names([
                'index' => 'admin.permissions.index',
                'create' => 'admin.permissions.create',
                'store' => 'admin.permissions.store',
                'edit' => 'admin.permissions.edit',
                'update' => 'admin.permissions.update',
                'destroy' => 'admin.permissions.destroy',
            ]);

        // Role-Permission Assignment
        Route::post('/roles/{role}/permissions', [\App\Http\Controllers\Admin\RolePermissionController::class, 'sync'])
            ->name('admin.roles.permissions.sync');

        // Beacukai Credentials Management
        Route::get('/beacukai-credentials', [\App\Http\Controllers\Admin\BeacukaiCredentialController::class, 'index'])->name('admin.beacukai-credentials.index');
        Route::get('/beacukai-credentials/create', [\App\Http\Controllers\Admin\BeacukaiCredentialController::class, 'create'])->name('admin.beacukai-credentials.create');
        Route::post('/beacukai-credentials', [\App\Http\Controllers\Admin\BeacukaiCredentialController::class, 'store'])->name('admin.beacukai-credentials.store');
        Route::get('/beacukai-credentials/{beacukaiCredential}', [\App\Http\Controllers\Admin\BeacukaiCredentialController::class, 'show'])->name('admin.beacukai-credentials.show');
        Route::get('/beacukai-credentials/{beacukaiCredential}/edit', [\App\Http\Controllers\Admin\BeacukaiCredentialController::class, 'edit'])->name('admin.beacukai-credentials.edit');
        Route::put('/beacukai-credentials/{beacukaiCredential}', [\App\Http\Controllers\Admin\BeacukaiCredentialController::class, 'update'])->name('admin.beacukai-credentials.update');
        Route::delete('/beacukai-credentials/{beacukaiCredential}', [\App\Http\Controllers\Admin\BeacukaiCredentialController::class, 'destroy'])->name('admin.beacukai-credentials.destroy');
        Route::post('/beacukai-credentials/{beacukaiCredential}/test', [\App\Http\Controllers\Admin\BeacukaiCredentialController::class, 'test'])->name('admin.beacukai-credentials.test');
    });        // Reference Data Routes (Requires manage.references permission)
    Route::prefix('reference')->middleware('permission:manage.references')->group(function () {
        // Kode Dokumen
        Route::resource('kd-dok', \App\Http\Controllers\Reference\KdDokController::class);

        // Kode Dokumen In/Out
        Route::resource('kd-dok-inout', \App\Http\Controllers\Reference\KdDokInoutController::class);

        // Kode TPS
        Route::resource('kd-tps', \App\Http\Controllers\Reference\KdTpsController::class);

        // Kode Gudang
        Route::resource('kd-gudang', \App\Http\Controllers\Reference\KdGudangController::class);

        // Kode Sarana Angkut In/Out
        Route::resource('kd-sar-angkut-inout', \App\Http\Controllers\Reference\KdSarAngkutInoutController::class);

        // Nama Angkutan (Keep existing route for now)
        Route::get('/nm-angkut', function () {
            $nmAngkut = \App\Models\NmAngkut::latest()->paginate(15);

            return Inertia::render('Reference/NmAngkut/Index', [
                'nmAngkut' => [
                    'data' => $nmAngkut->items(),
                    'meta' => [
                        'current_page' => $nmAngkut->currentPage(),
                        'from' => $nmAngkut->firstItem(),
                        'last_page' => $nmAngkut->lastPage(),
                        'per_page' => $nmAngkut->perPage(),
                        'to' => $nmAngkut->lastItem(),
                        'total' => $nmAngkut->total(),
                    ],
                    'links' => [
                        'first' => $nmAngkut->url(1),
                        'last' => $nmAngkut->url($nmAngkut->lastPage()),
                        'prev' => $nmAngkut->previousPageUrl(),
                        'next' => $nmAngkut->nextPageUrl(),
                    ],
                ],
            ]);
        })->name('reference.nm-angkut.index');
    });

    // Settings Routes
    Route::prefix('settings')->group(function () {
        Route::get('/beacukai-credentials', function () {
            $credentials = \App\Models\BeacukaiCredential::all();

            return Inertia::render('Settings/BeacukaiCredentials/Index', ['credentials' => $credentials]);
        })->name('settings.beacukai-credentials.index');

        Route::get('/beacukai-credentials/create', function () {
            return Inertia::render('Settings/BeacukaiCredentials/Create');
        })->name('settings.beacukai-credentials.create');

        Route::get('/beacukai-credentials/{id}/edit', function ($id) {
            $credential = \App\Models\BeacukaiCredential::findOrFail($id);

            return Inertia::render('Settings/BeacukaiCredentials/Edit', ['credential' => $credential]);
        })->name('settings.beacukai-credentials.edit');

        Route::get('/appearance', function () {
            return Inertia::render('Settings/Appearance');
        })->name('settings.appearance');
    });

    // Profile Routes
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
});

require __DIR__.'/auth.php';

