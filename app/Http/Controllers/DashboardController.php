<?php

namespace App\Http\Controllers;

use App\Models\Document;
use App\Models\SoapLog;
use App\Models\User;
use Inertia\Inertia;

class DashboardController extends Controller
{
    public function index()
    {
        $stats = [
            'total_documents' => Document::count(),
            'total_users' => User::count(),
            'active_sessions' => 1, // Mock for now
            'system_status' => 'online',
            'recent_documents' => Document::latest()->take(5)->get(),
            'soap_calls_today' => SoapLog::whereDate('created_at', today())->count(),
        ];

        return Inertia::render('Dashboard', compact('stats'));
    }
}
