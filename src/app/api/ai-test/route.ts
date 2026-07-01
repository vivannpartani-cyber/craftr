import { NextResponse } from 'next/server';
import { generateJSON } from '@/lib/ai/gemini';

export async function GET() {
  try {
    const result = await generateJSON<{ message: string }>(
      'Say "Craftr AI is online!" and nothing else.',
      'You are a test endpoint. Respond with a JSON object with a single "message" key.'
    );
    return NextResponse.json({ ok: true, message: result.message });
  } catch (error: any) {
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  }
}
