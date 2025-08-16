-- Create production database schema for AutoDrop AI Agents

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Agents table
CREATE TABLE IF NOT EXISTS agents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    type VARCHAR(50) NOT NULL CHECK (type IN ('customer-service', 'product-research', 'order-management', 'marketing', 'analytics')),
    status VARCHAR(20) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'maintenance')),
    config JSONB NOT NULL DEFAULT '{}',
    metrics JSONB NOT NULL DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Chat messages table
CREATE TABLE IF NOT EXISTS chat_messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    agent_id UUID NOT NULL REFERENCES agents(id) ON DELETE CASCADE,
    user_id VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    response TEXT NOT NULL,
    language VARCHAR(2) NOT NULL DEFAULT 'en' CHECK (language IN ('en', 'ar')),
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    metadata JSONB DEFAULT '{}'
);

-- Agent tasks table
CREATE TABLE IF NOT EXISTS agent_tasks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    agent_id UUID NOT NULL REFERENCES agents(id) ON DELETE CASCADE,
    type VARCHAR(100) NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
    input JSONB NOT NULL DEFAULT '{}',
    output JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    completed_at TIMESTAMP WITH TIME ZONE
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_agents_type ON agents(type);
CREATE INDEX IF NOT EXISTS idx_agents_status ON agents(status);
CREATE INDEX IF NOT EXISTS idx_chat_messages_agent_id ON chat_messages(agent_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_user_id ON chat_messages(user_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_timestamp ON chat_messages(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_agent_tasks_agent_id ON agent_tasks(agent_id);
CREATE INDEX IF NOT EXISTS idx_agent_tasks_status ON agent_tasks(status);
CREATE INDEX IF NOT EXISTS idx_agent_tasks_created_at ON agent_tasks(created_at DESC);

-- Insert default agents
INSERT INTO agents (name, type, config, metrics) VALUES
(
    'Customer Service Agent',
    'customer-service',
    '{
        "model": "gpt-4",
        "provider": "openai",
        "temperature": 0.7,
        "max_tokens": 1000,
        "system_prompt": "You are a professional customer service agent for AutoDrop, a dropshipping platform. Help customers with orders, returns, and general inquiries. Be helpful, polite, and efficient. Support both English and Arabic languages.",
        "language": "both"
    }',
    '{
        "total_requests": 0,
        "successful_requests": 0,
        "failed_requests": 0,
        "avg_response_time": 0,
        "uptime_percentage": 100,
        "last_active": "2024-01-01T00:00:00Z"
    }'
),
(
    'Product Research Agent',
    'product-research',
    '{
        "model": "gemini-pro",
        "provider": "gemini",
        "temperature": 0.5,
        "max_tokens": 1500,
        "system_prompt": "You are a product research specialist for AutoDrop. Analyze market trends, competitor pricing, and product demand. Provide data-driven insights for dropshipping success.",
        "language": "both"
    }',
    '{
        "total_requests": 0,
        "successful_requests": 0,
        "failed_requests": 0,
        "avg_response_time": 0,
        "uptime_percentage": 100,
        "last_active": "2024-01-01T00:00:00Z"
    }'
),
(
    'Order Management Agent',
    'order-management',
    '{
        "model": "claude-3-sonnet-20240229",
        "provider": "anthropic",
        "temperature": 0.3,
        "max_tokens": 1200,
        "system_prompt": "You are an order management specialist for AutoDrop. Handle order processing, supplier communication, shipping updates, and inventory management efficiently.",
        "language": "both"
    }',
    '{
        "total_requests": 0,
        "successful_requests": 0,
        "failed_requests": 0,
        "avg_response_time": 0,
        "uptime_percentage": 100,
        "last_active": "2024-01-01T00:00:00Z"
    }'
),
(
    'Marketing Content Agent',
    'marketing',
    '{
        "model": "gpt-4",
        "provider": "openai",
        "temperature": 0.8,
        "max_tokens": 2000,
        "system_prompt": "You are a marketing content creator for AutoDrop. Generate compelling product descriptions, SEO content, social media posts, and ad copy that drives conversions.",
        "language": "both"
    }',
    '{
        "total_requests": 0,
        "successful_requests": 0,
        "failed_requests": 0,
        "avg_response_time": 0,
        "uptime_percentage": 100,
        "last_active": "2024-01-01T00:00:00Z"
    }'
),
(
    'Analytics Intelligence Agent',
    'analytics',
    '{
        "model": "gemini-pro",
        "provider": "gemini",
        "temperature": 0.2,
        "max_tokens": 1800,
        "system_prompt": "You are a business intelligence analyst for AutoDrop. Provide data insights, sales forecasting, performance analysis, and strategic recommendations based on business metrics.",
        "language": "both"
    }',
    '{
        "total_requests": 0,
        "successful_requests": 0,
        "failed_requests": 0,
        "avg_response_time": 0,
        "uptime_percentage": 100,
        "last_active": "2024-01-01T00:00:00Z"
    }'
) ON CONFLICT DO NOTHING;
