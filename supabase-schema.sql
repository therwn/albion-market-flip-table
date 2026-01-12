-- Market Flip Table Database Schema

-- Tables: Ana tablo bilgileri
CREATE TABLE IF NOT EXISTS tables (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_by TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  is_premium BOOLEAN NOT NULL DEFAULT false,
  order_type TEXT NOT NULL DEFAULT 'sell_order' CHECK (order_type IN ('buy_order', 'sell_order')),
  data JSONB NOT NULL DEFAULT '{}'::jsonb,
  version_number INTEGER NOT NULL DEFAULT 1
);

-- Table Versions: Tablo versiyon geçmişi
CREATE TABLE IF NOT EXISTS table_versions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  table_id UUID NOT NULL REFERENCES tables(id) ON DELETE CASCADE,
  version_number INTEGER NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  data JSONB NOT NULL,
  UNIQUE(table_id, version_number)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_tables_created_at ON tables(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_table_versions_table_id ON table_versions(table_id);
CREATE INDEX IF NOT EXISTS idx_table_versions_created_at ON table_versions(created_at DESC);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger to auto-update updated_at
CREATE TRIGGER update_tables_updated_at BEFORE UPDATE ON tables
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security (RLS)
ALTER TABLE tables ENABLE ROW LEVEL SECURITY;
ALTER TABLE table_versions ENABLE ROW LEVEL SECURITY;

-- Policy: Allow all operations (since we don't have authentication)
CREATE POLICY "Allow all operations on tables" ON tables
    FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Allow all operations on table_versions" ON table_versions
    FOR ALL USING (true) WITH CHECK (true);
