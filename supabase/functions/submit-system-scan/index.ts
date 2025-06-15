
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface SystemScanData {
  manufacturer: string;
  model: string;
  serialNumber: string;
  processor: string;
  ram: number;
  storage: number;
  tpmVersion: string;
  secureBootCapable: boolean;
  uefiCapable: boolean;
  directxVersion: string;
  displayResolution: string;
  internetConnection: boolean;
  sessionId: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const scanData: SystemScanData = await req.json()
    console.log('Received system scan data:', scanData)

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseKey)

    // Store the system scan data
    const { error } = await supabase
      .from('system_scans')
      .insert({
        session_id: scanData.sessionId,
        manufacturer: scanData.manufacturer,
        model: scanData.model,
        serial_number: scanData.serialNumber,
        processor: scanData.processor,
        ram_gb: scanData.ram,
        storage_gb: scanData.storage,
        tpm_version: scanData.tmpVersion,
        secure_boot_capable: scanData.secureBootCapable,
        uefi_capable: scanData.uefiCapable,
        directx_version: scanData.directxVersion,
        display_resolution: scanData.displayResolution,
        internet_connection: scanData.internetConnection,
        created_at: new Date().toISOString()
      })

    if (error) {
      console.error('Database error:', error)
      throw error
    }

    return new Response(
      JSON.stringify({ success: true, message: 'System scan data received successfully' }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      },
    )
  } catch (error) {
    console.error('Error processing system scan:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      },
    )
  }
})
