/**
 * Supabase 初期化と設定
 */

// URLは「/rest/v1/」を外したベースURLを設定します
const SUPABASE_URL = 'https://ylgumuwmpnnqzrfleyoc.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlsZ3VtdXdtcG5ucXpyZmxleW9jIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzYzNzA2MjgsImV4cCI6MjA5MTk0NjYyOH0.HP5miiB3Gbjvi0iDKgi9b1kXsf4FaOFY9AUt5fyun5Q';

// グローバルスコープでsupabaseクライアントを作成
// window.supabase は、HTMLでCDN版のSupabaseスクリプトを読み込んだときに使えるようになります
window.supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
