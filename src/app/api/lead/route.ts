import { NextRequest, NextResponse } from 'next/server';

const GHL_LOCATION_ID = 'RfLavp9Gj19YJ8vaRGJG';
const GHL_API_KEY = process.env.GHL_API_KEY || '';

interface LeadPayload {
  name: string;
  email: string;
  phone?: string;
}

export async function POST(req: NextRequest) {
  try {
    const body: LeadPayload = await req.json();
    const { name, email, phone } = body;

    if (!name || !email) {
      return NextResponse.json(
        { error: 'name and email are required' },
        { status: 400 }
      );
    }

    const firstName = name.split(' ')[0];
    const lastName = name.split(' ').slice(1).join(' ') || firstName;

    // Build the GHL contact payload
    const contactPayload: Record<string, unknown> = {
      firstName,
      lastName,
      email,
      phone: phone || '',
      source: 'book_landing_page',
      tags: ['UnMortgage_Lead', 'Book_Download'],
    };

    // Try to upsert in GHL
    let ghlStatus = 'skipped';
    let ghlContactId: string | null = null;

    if (GHL_API_KEY) {
      try {
        const ghlRes = await fetch(
          'https://services.leadconnectorhq.com/contacts/upsert',
          {
            method: 'POST',
            headers: {
              Authorization: `Bearer ${GHL_API_KEY}`,
              'Content-Type': 'application/json',
              Version: '2021-07-28',
            },
            body: JSON.stringify({
              locationId: GHL_LOCATION_ID,
              ...contactPayload,
            }),
          }
        );

        if (ghlRes.ok) {
          const ghlData = await ghlRes.json();
          ghlStatus = 'created';
          ghlContactId = ghlData.contact?.id || null;
        } else {
          ghlStatus = `failed: ${ghlRes.status}`;
          console.error('GHL upsert failed:', await ghlRes.text());
        }
      } catch (err) {
        ghlStatus = 'error';
        console.error('GHL upsert error:', err);
      }
    }

    return NextResponse.json({
      success: true,
      ghl: ghlStatus,
      contactId: ghlContactId,
    });
  } catch (err) {
    console.error('Lead API error:', err);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
