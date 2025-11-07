<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\StoreBeacukaiCredentialRequest;
use App\Http\Requests\Admin\UpdateBeacukaiCredentialRequest;
use App\Models\BeacukaiCredential;
use App\Services\SoapClientService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class BeacukaiCredentialController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request): Response
    {
        $query = BeacukaiCredential::query()
            ->with(['creator', 'updater']);

        // Search
        if ($search = $request->input('search')) {
            $query->where(function ($q) use ($search) {
                $q->where('service_name', 'like', "%{$search}%")
                    ->orWhere('endpoint_url', 'like', "%{$search}%")
                    ->orWhere('description', 'like', "%{$search}%");
            });
        }

        // Filter by status
        if ($request->has('status') && $request->status !== 'all') {
            $query->where('is_active', $request->status === 'active');
        }

        // Filter by environment
        if ($request->has('environment') && $request->environment !== 'all') {
            $query->where('is_test_mode', $request->environment === 'test');
        }

        $credentials = $query->latest()->paginate(15);

        return Inertia::render('Admin/BeacukaiCredentials/Index', [
            'credentials' => [
                'data' => $credentials->items(),
                'links' => $credentials->linkCollection()->toArray(),
                'current_page' => $credentials->currentPage(),
                'last_page' => $credentials->lastPage(),
                'per_page' => $credentials->perPage(),
                'total' => $credentials->total(),
            ],
            'filters' => $request->only(['search', 'status', 'environment']),
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create(): Response
    {
        return Inertia::render('Admin/BeacukaiCredentials/Create');
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreBeacukaiCredentialRequest $request): RedirectResponse
    {
        $data = $request->validated();
        $data['created_by'] = auth()->id();

        BeacukaiCredential::create($data);

        return redirect()->route('admin.beacukai-credentials.index')
            ->with('success', 'Credential berhasil ditambahkan');
    }

    /**
     * Display the specified resource.
     */
    public function show(BeacukaiCredential $beacukaiCredential): Response
    {
        $beacukaiCredential->load(['creator', 'updater']);

        return Inertia::render('Admin/BeacukaiCredentials/Show', [
            'credential' => $beacukaiCredential,
        ]);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(BeacukaiCredential $beacukaiCredential): Response
    {
        return Inertia::render('Admin/BeacukaiCredentials/Edit', [
            'credential' => $beacukaiCredential,
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdateBeacukaiCredentialRequest $request, BeacukaiCredential $beacukaiCredential): RedirectResponse
    {
        $data = $request->validated();
        $data['updated_by'] = auth()->id();

        // Jangan update password jika kosong
        if (empty($data['password'])) {
            unset($data['password']);
        }

        $beacukaiCredential->update($data);

        return redirect()->route('admin.beacukai-credentials.index')
            ->with('success', 'Credential berhasil diupdate');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(BeacukaiCredential $beacukaiCredential): RedirectResponse
    {
        $beacukaiCredential->delete();

        return redirect()->route('admin.beacukai-credentials.index')
            ->with('success', 'Credential berhasil dihapus');
    }

    /**
     * Test connection dengan credential ini
     */
    public function test(BeacukaiCredential $beacukaiCredential)
    {
        try {
            $soapService = new SoapClientService();
            
            // Test dengan method sederhana - call ke endpoint
            $testResult = $soapService->call(
                $beacukaiCredential->endpoint_url,
                'GetRegBin', // Method test sederhana
                [],
                $beacukaiCredential->username,
                $beacukaiCredential->getDecryptedPassword()
            );

            // Update last tested
            $beacukaiCredential->update([
                'last_tested_at' => now(),
                'last_test_result' => json_encode(['success' => true, 'data' => $testResult]),
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Connection berhasil!',
                'data' => $testResult,
            ]);
        } catch (\Exception $e) {
            // Update last tested dengan error
            $beacukaiCredential->update([
                'last_tested_at' => now(),
                'last_test_result' => json_encode([
                    'success' => false,
                    'error' => $e->getMessage(),
                ]),
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Connection gagal: ' . $e->getMessage(),
            ], 500);
        }
    }
}
