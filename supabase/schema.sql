-- ============================================
-- Schema Sistema de Agendamento de Lives
-- ============================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE channels (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL,
    emoji VARCHAR(10) NOT NULL,
    description TEXT,
    youtube_channel_id VARCHAR(100),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE event_types (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(50) NOT NULL,
    color VARCHAR(7) NOT NULL,
    icon VARCHAR(20),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    channel_id UUID NOT NULL REFERENCES channels(id) ON DELETE CASCADE,
    event_type_id UUID REFERENCES event_types(id) ON DELETE SET NULL,
    title VARCHAR(200) NOT NULL,
    description TEXT,
    start_time TIMESTAMP WITH TIME ZONE NOT NULL,
    end_time TIMESTAMP WITH TIME ZONE NOT NULL,
    live_url VARCHAR(500),
    embed_url VARCHAR(500),
    is_live BOOLEAN DEFAULT false,
    is_published BOOLEAN DEFAULT true,
    cover_image_url VARCHAR(500),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_events_channel_id ON events(channel_id);
CREATE INDEX idx_events_start_time ON events(start_time);
CREATE INDEX idx_events_is_live ON events(is_live);

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_channels_updated_at BEFORE UPDATE ON channels
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_events_updated_at BEFORE UPDATE ON events
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

INSERT INTO channels (id, name, emoji, description, is_active) VALUES
    ('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'TV Mandacaru', '🌴', 'Canal de lives esportivas - Ítalo', true),
    ('b2c3d4e5-f6a7-8901-bcde-f12345678901', 'TV Papagaio Icó', '🦜', 'Canal do contratante', true)
ON CONFLICT (id) DO NOTHING;

INSERT INTO event_types (id, name, color, icon) VALUES
    ('c3d4e5f6-a7b8-9012-cdef-123456789012', 'Jogo Esportivo', '#FF6B6B', '⚽'),
    ('d4e5f6a7-b8c9-0123-def0-234567890123', 'Entrevista', '#4ECDC4', '🎤'),
    ('e5f6a7b8-c9d0-1234-ef01-345678901234', 'Análise Tática', '#45B7D1', '📊'),
    ('a7b8c9d0-e1f2-3456-0123-567890123456', 'Outro', '#FFEAA7', '📺')
ON CONFLICT (id) DO NOTHING;

ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE channels ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_types ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Events viewable by everyone" ON events FOR SELECT USING (is_published = true);
CREATE POLICY "Channels viewable by everyone" ON channels FOR SELECT USING (is_active = true);
CREATE POLICY "Event types viewable" ON event_types FOR SELECT USING (true);