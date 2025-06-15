
-- Create the system_scans table to store PowerShell scan results
CREATE TABLE public.system_scans (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id TEXT NOT NULL,
  manufacturer TEXT,
  model TEXT,
  serial_number TEXT,
  processor TEXT,
  ram_gb INTEGER,
  storage_gb INTEGER,
  tmp_version TEXT,
  secure_boot_capable BOOLEAN DEFAULT false,
  uefi_capable BOOLEAN DEFAULT false,
  directx_version TEXT,
  display_resolution TEXT,
  internet_connection BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create an index on session_id for faster lookups
CREATE INDEX idx_system_scans_session_id ON public.system_scans(session_id);

-- Enable Row Level Security (though this table can be public for this use case)
ALTER TABLE public.system_scans ENABLE ROW LEVEL SECURITY;

-- Create a policy that allows anyone to insert and read scan data
CREATE POLICY "Allow public access to system scans" 
  ON public.system_scans 
  FOR ALL 
  USING (true) 
  WITH CHECK (true);
