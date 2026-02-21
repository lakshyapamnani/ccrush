import { NextRequest, NextResponse } from 'next/server'

const ONESIGNAL_APP_ID = '433596c7-2c5e-4d58-b144-05ad45f23093'
const ONESIGNAL_REST_API_KEY = process.env.ONESIGNAL_REST_API_KEY || ''

export async function POST(req: NextRequest) {
    try {
        const { targetUid, title, message } = await req.json()

        if (!targetUid || !title || !message) {
            return NextResponse.json({ error: 'Missing fields' }, { status: 400 })
        }

        if (!ONESIGNAL_REST_API_KEY) {
            // Key not configured — silently skip (don't break the app)
            return NextResponse.json({ ok: true, skipped: true })
        }

        const body = {
            app_id: ONESIGNAL_APP_ID,
            filters: [{ field: 'tag', key: 'uid', relation: '=', value: targetUid }],
            headings: { en: title },
            contents: { en: message },
        }

        const res = await fetch('https://onesignal.com/api/v1/notifications', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Basic ${ONESIGNAL_REST_API_KEY}`,
            },
            body: JSON.stringify(body),
        })

        const data = await res.json()
        return NextResponse.json({ ok: true, data })
    } catch (err) {
        console.error('OneSignal notify error:', err)
        return NextResponse.json({ error: 'Failed to send notification' }, { status: 500 })
    }
}
