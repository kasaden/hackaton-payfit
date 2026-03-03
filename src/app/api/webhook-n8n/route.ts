import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'

/**
 * Webhook endpoint for N8N automations.
 *
 * Accepts POST requests with:
 * - Header: X-Webhook-Secret (validated against WEBHOOK_SECRET env var if set)
 * - Body: { type: 'trend' | 'benchmark', data: object }
 *
 * Actions:
 * - type 'trend'     -> inserts data into the `trends` table
 * - type 'benchmark' -> inserts data into the `benchmarks` table
 */
export async function POST(request: NextRequest) {
  try {
    // Validate webhook secret (mandatory)
    const webhookSecret = process.env.WEBHOOK_SECRET
    if (!webhookSecret) {
      console.error('WEBHOOK_SECRET environment variable is not configured')
      return NextResponse.json(
        { error: 'Server misconfiguration' },
        { status: 500 }
      )
    }

    const headerSecret = request.headers.get('X-Webhook-Secret')
    if (headerSecret !== webhookSecret) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { type, data } = body

    if (!type || !data) {
      return NextResponse.json(
        { error: 'Missing required fields: type, data' },
        { status: 400 }
      )
    }

    if (type !== 'trend' && type !== 'benchmark') {
      return NextResponse.json(
        { error: 'Invalid type. Must be "trend" or "benchmark".' },
        { status: 400 }
      )
    }

    const supabase = createServiceClient()

    const tableName = type === 'trend' ? 'trends' : 'benchmarks'

    const { error } = await supabase
      .from(tableName)
      .insert(data)

    if (error) {
      console.error(`Supabase insert into ${tableName} error:`, error)
      return NextResponse.json(
        { error: `Failed to insert into ${tableName}` },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Webhook N8N API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
