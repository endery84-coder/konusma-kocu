import { NextResponse } from 'next/server';

export async function GET(request: Request) {
    const requestUrl = new URL(request.url);
    const code = requestUrl.searchParams.get('code');

    if (code) {
        // TODO: Implement code exchange when supabase-auth-helpers is properly configured or use @supabase/ssr
        // const supabase = createRouteHandlerClient({ cookies });
        // await supabase.auth.exchangeCodeForSession(code);
    }

    return NextResponse.redirect(new URL('/', requestUrl.origin));
}
