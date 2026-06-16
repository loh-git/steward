import { NextResponse } from "next/server";

export async function POST(req: Request) {
	try {
		// accept and ignore context for now
		await req.json().catch(() => null);
		return NextResponse.json({ ok: true });
	} catch (err) {
		return NextResponse.json({ ok: false }, { status: 400 });
	}
}
