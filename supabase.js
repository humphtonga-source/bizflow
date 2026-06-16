/* ============================================
   BizFlow — supabase.js
   Single Supabase client — import on every page
   ============================================ */

const SUPABASE_URL = 'https://piaphpiowvgalvduacpt.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBpYXBocGlvd3ZnYWx2ZHVhY3B0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODA2OTg4MDUsImV4cCI6MjA5NjI3NDgwNX0.lEOrhLB0AaCzsDXWzXHkvth83-KtXKOpTYe8ndi3bFc';

// Initialise once the SDK is ready
function getSupabase() {
  if (!window._bzSupabase) {
    window._bzSupabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
  }
  return window._bzSupabase;
}
