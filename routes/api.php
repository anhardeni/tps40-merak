<?php

use App\Http\Controllers\Api\DocumentController;
use App\Http\Controllers\Api\ExportController;
use App\Http\Controllers\Api\ReportController;
use App\Http\Controllers\Api\SoapController;
use App\Http\Controllers\Api\TangkiController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application. These
| routes are loaded by the RouteServiceProvider and all of them will
| be assigned to the "api" middleware group. Make something great!
|
*/

Route::middleware('auth:sanctum')->get('/user', function (Request $request) {
    return $request->user();
});

// API Routes dengan authentication (support both Sanctum & Web Session)
Route::middleware(['auth:sanctum,web'])->group(function () {

    // Documents CRUD
    Route::apiResource('documents', DocumentController::class);

    // Additional document actions
    Route::post('documents/{id}/submit', [DocumentController::class, 'submit'])
        ->name('documents.submit');
    Route::post('documents/{id}/approve', [DocumentController::class, 'approve'])
        ->name('documents.approve');
    Route::post('documents/{id}/check-sppb', [DocumentController::class, 'checkSppb'])
        ->name('documents.check-sppb');

    // Tangki CRUD
    Route::apiResource('tangki', TangkiController::class);
    Route::get('documents/{id}/tangki', [TangkiController::class, 'getByDocument'])
        ->name('tangki.by-document');

    // Export Routes - MOVED TO web.php for session-based auth
    // Route::prefix('export')->name('export.')->group(function () {
    //     Route::get('documents/{id}/download/xml', [ExportController::class, 'downloadXml'])
    //         ->name('xml');
    //     Route::get('documents/{id}/download/json', [ExportController::class, 'downloadJson'])
    //         ->name('json');
    //     Route::get('documents/{id}/preview/xml', [ExportController::class, 'previewXml'])
    //         ->name('preview.xml');
    //     Route::get('documents/{id}/preview/json', [ExportController::class, 'previewJson'])
    //         ->name('preview.json');
    //     Route::post('documents/bulk', [ExportController::class, 'bulkExport'])
    //         ->name('bulk');
    //     Route::post('documents/{id}/send-to-host', [ExportController::class, 'sendToHost'])
    //         ->name('send-to-host');
    // });    // SOAP Routes
    Route::prefix('soap')->name('soap.')->group(function () {
        Route::post('check-sppb', [SoapController::class, 'checkSppb'])
            ->name('check-sppb');
        Route::post('check-sppb-tpb', [SoapController::class, 'checkSppbTpb'])
            ->name('check-sppb-tpb');
        Route::get('test-connection', [SoapController::class, 'testConnection'])
            ->name('test-connection');
        Route::get('logs', [SoapController::class, 'getLogs'])
            ->name('logs');
    });

    // Reference Data Routes
    Route::prefix('reference')->name('reference.')->group(function () {
        Route::get('kd-dok', function () {
            return \App\Models\KdDok::where('is_active', true)->get();
        })->name('kd-dok');

        Route::get('kd-tps', function () {
            return \App\Models\KdTps::where('is_active', true)->get();
        })->name('kd-tps');

        Route::get('nm-angkut', function () {
            return \App\Models\NmAngkut::where('is_active', true)->get();
        })->name('nm-angkut');

        Route::get('kd-gudang', function () {
            return \App\Models\KdGudang::where('is_active', true)->get();
        })->name('kd-gudang');

        Route::get('kd-dok-inout', function () {
            return \App\Models\KdDokInout::where('is_active', true)->get();
        })->name('kd-dok-inout');

        Route::get('kd-sar-angkut-inout', function () {
            return \App\Models\KdSarAngkutInout::where('is_active', true)->get();
        })->name('kd-sar-angkut-inout');
    });

    // Reports Routes - TODO: Create ReportController
    // Route::prefix('reports')->name('reports.')->group(function () {
    //     Route::get('documents', [ReportController::class, 'documents'])
    //         ->name('documents');
    //     Route::get('tangki', [ReportController::class, 'tangki'])
    //         ->name('tangki');
    //     Route::get('soap-logs', [ReportController::class, 'soapLogs'])
    //         ->name('soap-logs');
    //     Route::get('export-summary', [ReportController::class, 'exportSummary'])
    //         ->name('export-summary');
    // });

    // User Management Routes (RBAC) - TODO: Create API UserController
    // Route::prefix('users')->name('users.')->middleware('role:admin')->group(function () {
    //     Route::get('/', [UserController::class, 'index'])->name('index');
    //     Route::post('/', [UserController::class, 'store'])->name('store');
    //     Route::get('{id}', [UserController::class, 'show'])->name('show');
    //     Route::put('{id}', [UserController::class, 'update'])->name('update');
    //     Route::delete('{id}', [UserController::class, 'destroy'])->name('destroy');
    //     Route::post('{id}/assign-role', [UserController::class, 'assignRole'])->name('assign-role');
    //     Route::post('{id}/revoke-role', [UserController::class, 'revokeRole'])->name('revoke-role');
    // });

    // Role Management Routes - TODO: Create API RoleController
    // Route::prefix('roles')->name('roles.')->middleware('role:admin')->group(function () {
    //     Route::get('/', [RoleController::class, 'index'])->name('index');
    //     Route::post('/', [RoleController::class, 'store'])->name('store');
    //     Route::get('{id}', [RoleController::class, 'show'])->name('show');
    //     Route::put('{id}', [RoleController::class, 'update'])->name('update');
    //     Route::delete('{id}', [RoleController::class, 'destroy'])->name('destroy');
    //     Route::post('{id}/assign-permission', [RoleController::class, 'assignPermission'])->name('assign-permission');
    //     Route::post('{id}/revoke-permission', [RoleController::class, 'revokePermission'])->name('revoke-permission');
    // });

    // Dashboard Stats
    Route::get('dashboard/stats', function () {
        $user = auth()->user();

        $stats = [
            'total_documents' => \App\Models\Document::count(),
            'draft_documents' => \App\Models\Document::where('status', 'DRAFT')->count(),
            'submitted_documents' => \App\Models\Document::where('status', 'SUBMITTED')->count(),
            'approved_documents' => \App\Models\Document::where('status', 'APPROVED')->count(),
            'my_documents' => \App\Models\Document::where('created_by', $user->id)->count(),
            'total_tangki' => \App\Models\Tangki::count(),
            'soap_requests_today' => \App\Models\SoapLog::whereDate('created_at', today())->count(),
            'documents_sent_to_host' => \App\Models\Document::where('sent_to_host', true)->count(),
        ];

        // Recent documents
        $recent_documents = \App\Models\Document::with(['kdDok', 'kdTps', 'createdBy'])
            ->orderBy('created_at', 'desc')
            ->limit(10)
            ->get();

        // Recent SOAP logs
        $recent_soap_logs = \App\Models\SoapLog::with(['user', 'document'])
            ->orderBy('created_at', 'desc')
            ->limit(10)
            ->get();

        return response()->json([
            'success' => true,
            'data' => [
                'stats' => $stats,
                'recent_documents' => $recent_documents,
                'recent_soap_logs' => $recent_soap_logs,
            ],
        ]);
    })->name('dashboard.stats');
});

// Public routes (jika ada)
Route::get('health', function () {
    return response()->json([
        'status' => 'OK',
        'timestamp' => now()->toISOString(),
        'version' => '1.0.0',
    ]);
});
