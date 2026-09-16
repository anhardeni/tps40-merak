<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreKontainerRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return $this->user()->hasPermission('kontainer.create');
    }

    /**
     * Get the validation rules that apply to the request.
     */
    public function rules(): array
    {
        return [
            // Header Validation
            'header.kd_dok' => 'required|string|in:1',
            'header.kd_tps' => 'required|string|max:10|exists:kd_tps,kd_tps',
            'header.kd_gudang' => 'required|string|max:10|exists:kd_gudang,kd_gudang',
            'header.tgl_tiba' => 'required|date_format:d-m-Y',
            'header.no_bc11' => 'required|string|max:6',
            'header.tgl_bc11' => 'required|date_format:d-m-Y',
            'header.keterangan' => 'nullable|string',

            // Containers Detail Validation (Array)
            'kontainer' => 'required|array|min:1',
            'kontainer.*.no_kontainer' => 'required|string|max:20',
            'kontainer.*.ukuran_kontainer' => 'required|string|in:20,40,45,60',
            'kontainer.*.no_segel' => 'required|string|max:20',
            'kontainer.*.jns_kontainer' => 'required|string|in:4,7,8',
            'kontainer.*.bruto' => 'required|numeric|min:0',
            'kontainer.*.wk_inout' => 'required|date_format:d-m-Y H:i:s',
            
            // Optional Fields with schema constraints
            'kontainer.*.kd_kantor' => 'nullable|string|max:10',
            'kontainer.*.no_bl_awb' => 'nullable|string|max:30',
            'kontainer.*.tgl_bl_awb' => 'nullable|date_format:d-m-Y',
            'kontainer.*.no_master_bl_awb' => 'nullable|string|max:30',
            'kontainer.*.tgl_master_bl_awb' => 'nullable|date_format:d-m-Y',
            'kontainer.*.id_consignee' => 'nullable|string|max:22',
            'kontainer.*.consignee' => 'nullable|string|max:60',
            'kontainer.*.no_pos_bc11' => 'nullable|string|max:12',
            'kontainer.*.kd_timbun' => 'nullable|string|max:20',
            'kontainer.*.kd_sar_angkut' => 'nullable|string|max:5',
            'kontainer.*.no_pol' => 'nullable|string|max:15',
            'kontainer.*.fl_kontainer' => 'nullable|boolean',
            'kontainer.*.iso_code' => 'nullable|string|max:30',
            'kontainer.*.pel_muat' => 'nullable|string|max:5',
            'kontainer.*.pel_transit' => 'nullable|string|max:5',
            'kontainer.*.pel_bongkar' => 'nullable|string|max:5',
            'kontainer.*.gudang_tujuan' => 'nullable|string|max:5',
            'kontainer.*.no_daftar_pabean' => 'nullable|string|max:10',
            'kontainer.*.tgl_daftar_pabean' => 'nullable|date_format:d-m-Y',
            'kontainer.*.no_segel_bc' => 'nullable|string|max:30',
            'kontainer.*.tgl_segel_bc' => 'nullable|date_format:d-m-Y',
            'kontainer.*.no_ijin_tps' => 'nullable|string|max:40',
            'kontainer.*.tgl_ijin_tps' => 'nullable|date_format:d-m-Y',
            'kontainer.*.kd_dok_inout' => 'nullable|string|max:10',
        ];
    }

    /**
     * Get custom messages for validator errors.
     */
    public function messages(): array
    {
        return [
            'header.tgl_tiba.date_format' => 'Format tanggal tiba harus dd-mm-yyyy',
            'header.tgl_bc11.date_format' => 'Format tanggal BC 1.1 harus dd-mm-yyyy',
            'kontainer.*.ukuran_kontainer.in' => 'Ukuran kontainer harus salah satu dari: 20, 40, 45, 60',
            'kontainer.*.jns_kontainer.in' => 'Jenis kontainer harus salah satu dari: 4 (Empty), 7 (LCL), 8 (FCL)',
            'kontainer.*.wk_inout.date_format' => 'Format waktu In/Out harus dd-mm-yyyy HH:mm:ss',
            'kontainer.*.bruto.numeric' => 'Nilai bruto harus berupa angka',
        ];
    }

    /**
     * Prepare the data for validation.
     */
    protected function prepareForValidation(): void
    {
        $input = $this->all();

        // Convert header dates from Y-m-d to d-m-Y
        if (isset($input['header']['tgl_tiba'])) {
            $input['header']['tgl_tiba'] = $this->formatDate($input['header']['tgl_tiba']);
        }
        if (isset($input['header']['tgl_bc11'])) {
            $input['header']['tgl_bc11'] = $this->formatDate($input['header']['tgl_bc11']);
        }

        // Convert container dates
        if (isset($input['kontainer']) && is_array($input['kontainer'])) {
            foreach ($input['kontainer'] as $i => $k) {
                if (isset($k['wk_inout'])) {
                    $input['kontainer'][$i]['wk_inout'] = $this->formatDateTime($k['wk_inout']);
                }
                if (isset($k['tgl_bl_awb'])) {
                    $input['kontainer'][$i]['tgl_bl_awb'] = $this->formatDate($k['tgl_bl_awb']);
                }
                if (isset($k['tgl_master_bl_awb'])) {
                    $input['kontainer'][$i]['tgl_master_bl_awb'] = $this->formatDate($k['tgl_master_bl_awb']);
                }
                if (isset($k['tgl_daftar_pabean'])) {
                    $input['kontainer'][$i]['tgl_daftar_pabean'] = $this->formatDate($k['tgl_daftar_pabean']);
                }
                if (isset($k['tgl_segel_bc'])) {
                    $input['kontainer'][$i]['tgl_segel_bc'] = $this->formatDate($k['tgl_segel_bc']);
                }
                if (isset($k['tgl_ijin_tps'])) {
                    $input['kontainer'][$i]['tgl_ijin_tps'] = $this->formatDate($k['tgl_ijin_tps']);
                }
            }
        }

        $this->replace($input);
    }

    private function formatDate($value)
    {
        if (!$value) return $value;
        try {
            return \Illuminate\Support\Carbon::parse($value)->format('d-m-Y');
        } catch (\Exception $e) {
            return $value;
        }
    }

    private function formatDateTime($value)
    {
        if (!$value) return $value;
        try {
            return \Illuminate\Support\Carbon::parse($value)->format('d-m-Y H:i:s');
        } catch (\Exception $e) {
            return $value;
        }
    }
}
