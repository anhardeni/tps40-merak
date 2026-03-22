<?php

namespace App\Http\Controllers;

use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;

class LogController extends Controller
{
    /**
     * Display log viewer dashboard
     */
    public function index(Request $request)
    {
        $logFiles = $this->getLogFiles();
        $selectedLog = $request->get('file', 'laravel.log');
        $logEntries = $this->parseLogFile($selectedLog);

        // Filter by level if specified
        if ($request->has('level')) {
            $logEntries = collect($logEntries)->filter(function ($entry) use ($request) {
                return strtolower($entry['level']) === strtolower($request->level);
            })->values()->toArray();
        }

        // Search functionality
        if ($request->has('search')) {
            $search = $request->search;
            $logEntries = collect($logEntries)->filter(function ($entry) use ($search) {
                return stripos($entry['message'], $search) !== false ||
                       stripos($entry['context'], $search) !== false;
            })->values()->toArray();
        }

        // Pagination
        $perPage = 50;
        $currentPage = $request->get('page', 1);
        $offset = ($currentPage - 1) * $perPage;
        $totalEntries = count($logEntries);
        $logEntries = array_slice($logEntries, $offset, $perPage);

        return Inertia::render('Logs/Index', [
            'logFiles' => $logFiles,
            'selectedLog' => $selectedLog,
            'logEntries' => $logEntries,
            'pagination' => [
                'current_page' => (int) $currentPage,
                'per_page' => $perPage,
                'total' => $totalEntries,
                'last_page' => ceil($totalEntries / $perPage),
            ],
            'filters' => $request->only(['level', 'search']),
        ]);
    }

    /**
     * Get SOAP logs specifically
     */
    public function soapLogs(Request $request)
    {
        $query = \App\Models\SoapLog::query();

        // Filter by status
        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        // Filter by date range
        if ($request->has('date_from')) {
            $query->whereDate('created_at', '>=', $request->date_from);
        }

        if ($request->has('date_to')) {
            $query->whereDate('created_at', '<=', $request->date_to);
        }

        // Search functionality
        if ($request->has('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('method', 'like', "%{$search}%")
                    ->orWhere('endpoint', 'like', "%{$search}%")
                    ->orWhere('request_data', 'like', "%{$search}%")
                    ->orWhere('response_data', 'like', "%{$search}%");
            });
        }

        $soapLogs = $query->orderBy('created_at', 'desc')
            ->paginate(25)
            ->withQueryString();

        return Inertia::render('Logs/SoapLogs', [
            'soapLogs' => $soapLogs,
            'filters' => $request->only(['status', 'date_from', 'date_to', 'search']),
        ]);
    }

    /**
     * Display application errors
     */
    public function errors(Request $request)
    {
        $errorLogs = $this->parseLogFile('laravel.log', ['error', 'critical', 'alert', 'emergency']);

        // Search functionality
        if ($request->has('search')) {
            $search = $request->search;
            $errorLogs = collect($errorLogs)->filter(function ($entry) use ($search) {
                return stripos($entry['message'], $search) !== false ||
                       stripos($entry['context'], $search) !== false ||
                       stripos($entry['stack_trace'], $search) !== false;
            })->values()->toArray();
        }

        // Pagination
        $perPage = 20;
        $currentPage = $request->get('page', 1);
        $offset = ($currentPage - 1) * $perPage;
        $totalEntries = count($errorLogs);
        $errorLogs = array_slice($errorLogs, $offset, $perPage);

        return Inertia::render('Logs/Errors', [
            'errorLogs' => $errorLogs,
            'pagination' => [
                'current_page' => (int) $currentPage,
                'per_page' => $perPage,
                'total' => $totalEntries,
                'last_page' => ceil($totalEntries / $perPage),
            ],
            'filters' => $request->only(['search']),
        ]);
    }

    /**
     * Download log file
     */
    public function download($filename)
    {
        $logPath = storage_path('logs/'.$filename);

        if (! File::exists($logPath)) {
            abort(404, 'Log file not found');
        }

        return response()->download($logPath);
    }

    /**
     * Clear log file
     */
    public function clear($filename)
    {
        $logPath = storage_path('logs/'.$filename);

        if (! File::exists($logPath)) {
            return back()->with('error', 'Log file not found');
        }

        File::put($logPath, '');
        Log::info('Log file cleared', ['file' => $filename, 'user' => auth()->user()->name]);

        return back()->with('success', 'Log file cleared successfully');
    }

    /**
     * Create test log entries for demonstration
     */
    public function createTestLogs()
    {
        // Create various log levels
        Log::info('Test info message', ['test' => true, 'timestamp' => now()]);
        Log::warning('Test warning message', ['test' => true, 'user_id' => 1]);
        Log::error('Test error message', ['test' => true, 'exception' => 'TestException']);
        Log::debug('Test debug message', ['test' => true, 'data' => ['key' => 'value']]);

        // Create SOAP log entry
        \App\Models\SoapLog::create([
            'method' => 'CekDataSPPB',
            'endpoint' => 'https://tpsonline.beacukai.go.id/tps/service.asmx',
            'request_data' => json_encode(['sppb_number' => 'TEST001', 'test' => true]),
            'response_data' => json_encode(['status' => 'success', 'data' => 'Test response']),
            'status' => 'success',
            'response_time' => 150.5,
        ]);

        return back()->with('success', 'Test log entries created successfully');
    }

    /**
     * Get log summary for dashboard widget
     */
    public function summary()
    {
        $today = now()->startOfDay();

        // Get the latest log file
        $logFiles = $this->getLogFiles();
        $latestLogFile = collect($logFiles)->first();

        $totalLogs = 0;
        $errorsToday = 0;
        $warningsToday = 0;
        $recentLogs = collect();

        if ($latestLogFile) {
            $logs = $this->parseLogFile($latestLogFile['name']);
            $totalLogs = count($logs);

            foreach ($logs as $log) {
                $logDate = Carbon::parse($log['timestamp']);

                // Count today's errors and warnings
                if ($logDate->isToday()) {
                    if ($log['level'] === 'error') {
                        $errorsToday++;
                    } elseif ($log['level'] === 'warning') {
                        $warningsToday++;
                    }
                }
            }

            // Get recent logs (last 5)
            $recentLogs = collect($logs)->take(5);
        }

        // Get SOAP calls today
        $soapCallsToday = \App\Models\SoapLog::whereDate('created_at', $today)->count();

        return response()->json([
            'total_logs' => $totalLogs,
            'errors_today' => $errorsToday,
            'warnings_today' => $warningsToday,
            'recent_logs' => $recentLogs,
            'soap_calls_today' => $soapCallsToday,
        ]);
    }

    /**
     * Get available log files
     */
    private function getLogFiles()
    {
        $logPath = storage_path('logs');
        $files = File::files($logPath);

        return collect($files)->map(function ($file) {
            return [
                'name' => $file->getFilename(),
                'size' => $this->formatBytes($file->getSize()),
                'modified' => Carbon::createFromTimestamp($file->getMTime())->format('Y-m-d H:i:s'),
            ];
        })->sortByDesc('modified')->values()->toArray();
    }

    /**
     * Parse log file and extract entries
     */
    private function parseLogFile($filename, $levels = null)
    {
        $logPath = storage_path('logs/'.$filename);

        if (! File::exists($logPath)) {
            return [];
        }

        $content = File::get($logPath);
        $lines = explode("\n", $content);
        $entries = [];
        $currentEntry = null;

        foreach ($lines as $line) {
            if (empty(trim($line))) {
                continue;
            }

            // Check if line starts with timestamp pattern
            if (preg_match('/^\[(\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2})\] (\w+)\.(\w+): (.*)$/', $line, $matches)) {
                // Save previous entry if exists
                if ($currentEntry) {
                    $entries[] = $currentEntry;
                }

                // Start new entry
                $level = strtolower($matches[3]);

                // Skip if level filter is set and doesn't match
                if ($levels && ! in_array($level, $levels)) {
                    $currentEntry = null;

                    continue;
                }

                $currentEntry = [
                    'timestamp' => $matches[1],
                    'environment' => $matches[2],
                    'level' => $level,
                    'message' => $matches[4],
                    'context' => '',
                    'stack_trace' => '',
                ];
            } elseif ($currentEntry) {
                // Continuation of previous entry
                if (strpos($line, 'Stack trace:') !== false || strpos($line, '#0 ') !== false) {
                    $currentEntry['stack_trace'] .= $line."\n";
                } else {
                    $currentEntry['context'] .= $line."\n";
                }
            }
        }

        // Add last entry
        if ($currentEntry) {
            $entries[] = $currentEntry;
        }

        return array_reverse($entries); // Most recent first
    }

    /**
     * Format file size
     */
    private function formatBytes($size, $precision = 2)
    {
        $base = log($size, 1024);
        $suffixes = ['B', 'KB', 'MB', 'GB', 'TB'];

        return round(pow(1024, $base - floor($base)), $precision).' '.$suffixes[floor($base)];
    }
}
