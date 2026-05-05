<?php
namespace App\Http\Controllers\Api;
use App\Http\Controllers\Controller;
use App\RAG\Pipeline\RagPipeline;
use Illuminate\Http\Request;

class RagController extends Controller {
    public function __construct(protected RagPipeline $pipeline) {}
    public function suggestHs(Request $request) {
        return response()->json(['success' => true, 'data' => $this->pipeline->query($request->validate(['query'=>'required|string'])['query'])]);
    }
    public function ingest(Request $request) {
        $val = $request->validate(['pdf_path'=>'required|string', 'source'=>'nullable|string']);
        return response()->json(['success' => true, 'data' => $this->pipeline->ingest($val['pdf_path'], ['source' => $val['source'] ?? 'Explanatory Notes'])]);
    }
}
