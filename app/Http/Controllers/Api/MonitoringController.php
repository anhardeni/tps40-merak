<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\SoapClientService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class MonitoringController extends Controller
{
    protected $soapService;

    public function __construct(SoapClientService $soapService)
    {
        $this->soapService = $soapService;
    }

    /**
     * Cek Data Gagal Terkirim
     */
    public function checkFailedData(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'tgl_awal' => 'required|date_format:d-m-Y',
            'tgl_akhir' => 'required|date_format:d-m-Y',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }

        $result = $this->soapService->cekDataGagalKirim(
            $request->tgl_awal,
            $request->tgl_akhir
        );

        return response()->json($result);
    }

    /**
     * Cek Data Terkirim
     */
    public function checkSentData(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'tgl_awal' => 'required|date_format:d-m-Y',
            'tgl_akhir' => 'required|date_format:d-m-Y',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }

        $result = $this->soapService->cekDataTerkirim(
            $request->tgl_awal,
            $request->tgl_akhir
        );

        return response()->json($result);
    }

    /**
     * Cek Data SPPB Berdasarkan Tanggal
     */
    public function checkSppbByDate(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'tanggal' => 'required|date_format:d-m-Y',
            'is_tpb' => 'nullable|boolean'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }

        $result = $this->soapService->monitorSppbByDate(
            $request->tanggal,
            $request->boolean('is_tpb')
        );

        return response()->json($result);
    }

    /**
     * Cek Data Reject
     */
    public function checkRejectData(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'kd_tps' => 'required|string|max:10',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }

        $result = $this->soapService->getRejectData($request->kd_tps);

        return response()->json($result);
    }
}
