import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export async function POST(request: Request) {
  console.log('✅ API route called!');
  try {
    const body = await request.json();
    console.log('📦 Received body:', body);
    
    const { service, tier, words, total, brief, customerName, email } = body;

    const { data, error } = await supabase
      .from('orders')
      .insert([
        {
          service: service,
          tier: tier,
          word_count: words,
          price: total,
          brief_file: brief || 'No file attached',
          customer_name: customerName || 'Guest',
          email: email || 'guest@email.com',
          status: 'Pending'
        }
      ]);

    if (error) {
      console.log('❌ Supabase error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    console.log('✅ Order saved successfully:', data);
    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.log('❌ Catch error:', error);
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 });
  }
}