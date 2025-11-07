<?php

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;

class StoreBeacukaiCredentialRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'service_name' => ['required', 'string', 'max:50', 'unique:beacukai_credentials,service_name'],
            'service_type' => ['required', 'string', 'max:30'],
            'username' => ['nullable', 'string', 'max:255'],
            'password' => ['nullable', 'string', 'max:255'],
            'endpoint_url' => ['nullable', 'url', 'max:255'],
            'is_active' => ['boolean'],
            'is_test_mode' => ['boolean'],
            'description' => ['nullable', 'string', 'max:500'],
        ];
    }

    /**
     * Get custom messages for validator errors.
     */
    public function messages(): array
    {
        return [
            'service_name.required' => 'Service name harus diisi',
            'service_name.unique' => 'Service name sudah ada',
            'service_type.required' => 'Service type harus diisi',
            'endpoint_url.url' => 'URL harus valid',
        ];
    }
}
