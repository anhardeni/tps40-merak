<?php

namespace App\Http\Controllers;

use App\Models\BeacukaiCredential;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Validator;
use Inertia\Inertia;
use Inertia\Response;

class BeacukaiCredentialController extends Controller
{
    public function __construct()
    {
        // Middleware permissions
        $this->middleware('permission:admin.settings')->only(['index', 'create', 'store', 'edit', 'update', 'destroy']);
        $this->middleware('permission:admin.manage')->only(['toggleStatus', 'testConnection']);
    }

    /**
     * Display a listing of the credentials
     */
    public function index(): Response
    {
        $credentials = BeacukaiCredential::with(['creator', 'updater'])
            ->orderBy('service_name')
            ->paginate(10);

        $stats = [
            'total' => BeacukaiCredential::count(),
            'active' => BeacukaiCredential::where('is_active', true)->count(),
            'configured' => BeacukaiCredential::whereNotNull('username')
                ->whereNotNull('password')
                ->whereNotNull('endpoint_url')
                ->count(),
            'test_mode' => BeacukaiCredential::where('is_test_mode', true)->count(),
        ];

        return Inertia::render('Settings/BeacukaiCredentials/Index', [
            'credentials' => $credentials,
            'stats' => $stats,
        ]);
    }

    /**
     * Show the form for creating a new credential
     */
    public function create(): Response
    {
        return Inertia::render('Settings/BeacukaiCredentials/Create', [
            'serviceOptions' => $this->getServiceOptions(),
            'serviceTypeOptions' => $this->getServiceTypeOptions(),
        ]);
    }

    /**
     * Store a newly created credential
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'service_name' => 'required|string|max:50|unique:beacukai_credentials,service_name',
            'service_type' => 'required|string|in:SOAP,REST,HTTP',
            'username' => 'required|string|max:255',
            'password' => 'required|string|min:6',
            'endpoint_url' => 'required|url|max:500',
            'description' => 'nullable|string|max:500',
            'is_active' => 'boolean',
            'is_test_mode' => 'boolean',
            'additional_config' => 'nullable|array',
        ]);

        if ($validator->fails()) {
            return back()->withErrors($validator)->withInput();
        }

        $credential = BeacukaiCredential::create([
            'service_name' => $request->service_name,
            'service_type' => $request->service_type,
            'username' => $request->username,
            'password' => $request->password, // Will be encrypted by model mutator
            'endpoint_url' => $request->endpoint_url,
            'description' => $request->description,
            'is_active' => $request->boolean('is_active', true),
            'is_test_mode' => $request->boolean('is_test_mode', false),
            'additional_config' => $request->additional_config ?? [],
            'created_by' => Auth::id(),
        ]);

        return redirect()->route('beacukai-credentials.index')
            ->with('success', 'Credential berhasil dibuat untuk service: '.$credential->service_name);
    }

    /**
     * Show the form for editing the specified credential
     */
    public function edit(BeacukaiCredential $beacukaiCredential): Response
    {
        // Don't send the actual password to frontend
        $credentialData = $beacukaiCredential->toArray();
        unset($credentialData['password']);
        $credentialData['has_password'] = ! empty($beacukaiCredential->getDecryptedPassword());

        return Inertia::render('Settings/BeacukaiCredentials/Edit', [
            'credential' => $credentialData,
            'serviceOptions' => $this->getServiceOptions(),
            'serviceTypeOptions' => $this->getServiceTypeOptions(),
        ]);
    }

    /**
     * Update the specified credential
     */
    public function update(Request $request, BeacukaiCredential $beacukaiCredential)
    {
        $validator = Validator::make($request->all(), [
            'service_name' => 'required|string|max:50|unique:beacukai_credentials,service_name,'.$beacukaiCredential->id,
            'service_type' => 'required|string|in:SOAP,REST,HTTP',
            'username' => 'required|string|max:255',
            'password' => 'nullable|string|min:6',
            'endpoint_url' => 'required|url|max:500',
            'description' => 'nullable|string|max:500',
            'is_active' => 'boolean',
            'is_test_mode' => 'boolean',
            'additional_config' => 'nullable|array',
        ]);

        if ($validator->fails()) {
            return back()->withErrors($validator)->withInput();
        }

        $updateData = [
            'service_name' => $request->service_name,
            'service_type' => $request->service_type,
            'username' => $request->username,
            'endpoint_url' => $request->endpoint_url,
            'description' => $request->description,
            'is_active' => $request->boolean('is_active', true),
            'is_test_mode' => $request->boolean('is_test_mode', false),
            'additional_config' => $request->additional_config ?? [],
            'updated_by' => Auth::id(),
        ];

        // Only update password if provided
        if ($request->filled('password')) {
            $updateData['password'] = $request->password;
        }

        $beacukaiCredential->update($updateData);

        return redirect()->route('beacukai-credentials.index')
            ->with('success', 'Credential berhasil diupdate untuk service: '.$beacukaiCredential->service_name);
    }

    /**
     * Remove the specified credential
     */
    public function destroy(BeacukaiCredential $beacukaiCredential)
    {
        $serviceName = $beacukaiCredential->service_name;
        $beacukaiCredential->delete();

        return redirect()->route('beacukai-credentials.index')
            ->with('success', 'Credential berhasil dihapus untuk service: '.$serviceName);
    }

    /**
     * Toggle status of credential
     */
    public function toggleStatus(BeacukaiCredential $beacukaiCredential)
    {
        $beacukaiCredential->update([
            'is_active' => ! $beacukaiCredential->is_active,
            'updated_by' => Auth::id(),
        ]);

        $status = $beacukaiCredential->is_active ? 'activated' : 'deactivated';

        return back()->with('success', "Credential {$beacukaiCredential->service_name} berhasil {$status}");
    }

    /**
     * Test connection with credential
     */
    public function testConnection(BeacukaiCredential $beacukaiCredential)
    {
        try {
            // Basic validation
            if (! $beacukaiCredential->isConfigured()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Credential tidak lengkap',
                ]);
            }

            // Create HTTP client for testing
            $client = new \GuzzleHttp\Client([
                'timeout' => 10,
                'verify' => false, // For development
            ]);

            // Test endpoint accessibility
            $response = $client->get($beacukaiCredential->endpoint_url);

            if ($response->getStatusCode() === 200) {
                // Record usage
                $beacukaiCredential->recordUsage();

                return response()->json([
                    'success' => true,
                    'message' => 'Koneksi berhasil ke endpoint',
                    'status_code' => $response->getStatusCode(),
                ]);
            } else {
                return response()->json([
                    'success' => false,
                    'message' => 'Endpoint tidak dapat diakses',
                    'status_code' => $response->getStatusCode(),
                ]);
            }

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error: '.$e->getMessage(),
            ]);
        }
    }

    /**
     * Get credential for service usage (API)
     */
    public function getByService($serviceName)
    {
        $credential = BeacukaiCredential::getByService($serviceName);

        if (! $credential) {
            return response()->json([
                'success' => false,
                'message' => 'Credential tidak ditemukan untuk service: '.$serviceName,
            ], 404);
        }

        if (! $credential->isConfigured()) {
            return response()->json([
                'success' => false,
                'message' => 'Credential tidak dikonfigurasi dengan lengkap',
            ], 422);
        }

        return response()->json([
            'success' => true,
            'data' => $credential->getServiceConfig(),
        ]);
    }

    /**
     * Get available service options
     */
    private function getServiceOptions(): array
    {
        return [
            'cocotangki' => 'CoCoTangki Service',
            'sppb' => 'SPPB Service',
            'sppb_tpb' => 'SPPB TPB Service',
            'manifest' => 'Manifest Service',
            'customs_response' => 'Customs Response Service',
            'bc16' => 'BC 1.6 Service',
            'bc23' => 'BC 2.3 Service',
            'bc25' => 'BC 2.5 Service',
            'bc30' => 'BC 3.0 Service',
            'bc40' => 'BC 4.0 Service',
        ];
    }

    /**
     * Get available service type options
     */
    private function getServiceTypeOptions(): array
    {
        return [
            'SOAP' => 'SOAP Web Service',
            'REST' => 'REST API',
            'HTTP' => 'HTTP Service',
            'XML' => 'XML Service',
        ];
    }
}
