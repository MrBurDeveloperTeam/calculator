import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://xbpotsgtaocewhdotlwr.supabase.co';
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhicG90c2d0YW9jZXdoZG90bHdyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk0NTc2MDEsImV4cCI6MjA4NTAzMzYwMX0.VOMiTpDNJsEh-PJFhRuu5lcrzbJRudD6sOAQ4ve24lE';

const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
    const { data: authData, error: authErr } = await supabase.auth.signInWithPassword({
        email: 'test@example.com',
        password: 'password123'
    });

    if (authErr) {
        console.error('Auth error:', authErr);
        return;
    }

    const userId = authData.user.id;
    console.log('Logged in as', userId);

    const payload = {
        user_id: userId,
        clinic_name: 'TESTING CLINIC 333',
        working_days_per_week: 5,
        hours_per_day: 8,
        currency_symbol: '$'
    };

    console.log('Upserting...', payload);
    const { data, error } = await supabase
        .from('calc_settings')
        .upsert(payload, { onConflict: 'user_id' });

    if (error) {
        console.error('Upsert Error:', error);
    } else {
        console.log('Upsert Success:', data);
    }
}

run();
