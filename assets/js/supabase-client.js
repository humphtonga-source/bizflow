// Supabase Client - REST API Implementation

const SUPABASE_CONFIG = {
    url: 'https://piaphpiowvgalvduacpt.supabase.co',
    anonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBpYXBocGlvd3ZnYWx2ZHVhY3B0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODA2OTg4MDUsImV4cCI6MjA5NjI3NDgwNX0.lEOrhLB0AaCzsDXWzXHkvth83-KtXKOpTYe8ndi3bFc'
};

class SupabaseClient {
    constructor(config) {
        this.url = config.url;
        this.anonKey = config.anonKey;
        this.session = null;
        this.user = null;
        this.loadSession();
    }

    loadSession() {
        try {
            const session = localStorage.getItem('bizflow_session');
            const user = localStorage.getItem('bizflow_user');
            if (session && user) {
                this.session = JSON.parse(session);
                this.user = JSON.parse(user);
            }
        } catch (error) {
            console.error('Error loading session:', error);
        }
    }

    setSession(session) {
        this.session = session;
        localStorage.setItem('bizflow_session', JSON.stringify(session));
    }

    setUser(user) {
        this.user = user;
        localStorage.setItem('bizflow_user', JSON.stringify(user));
    }

    getUser() {
        return this.user;
    }

    getSession() {
        return this.session;
    }

    async signUp(email, password, metadata = {}) {
        try {
            const response = await fetch(`${this.url}/auth/v1/signup`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'apikey': this.anonKey,
                },
                body: JSON.stringify({
                    email,
                    password,
                    data: metadata
                })
            });

            const data = await response.json();

            if (response.ok && data.user) {
                const user = {
                    id: data.user.id,
                    email: data.user.email,
                    ...metadata
                };
                this.setUser(user);
                if (data.session) {
                    this.setSession(data.session);
                }
                return { success: true, user, session: data.session };
            } else {
                return { success: false, error: data.error_description || 'Sign up failed' };
            }
        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    async signIn(email, password) {
        try {
            const response = await fetch(`${this.url}/auth/v1/token?grant_type=password`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'apikey': this.anonKey,
                },
                body: JSON.stringify({ email, password })
            });

            const data = await response.json();

            if (response.ok && data.user) {
                const user = {
                    id: data.user.id,
                    email: data.user.email
                };
                this.setUser(user);
                this.setSession(data);
                return { success: true, user, session: data };
            } else {
                return { success: false, error: 'Invalid email or password' };
            }
        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    async resetPassword(email) {
        try {
            const response = await fetch(`${this.url}/auth/v1/recovery`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'apikey': this.anonKey,
                },
                body: JSON.stringify({ email })
            });

            if (response.ok) {
                return { success: true };
            } else {
                return { success: false, error: 'Failed to send reset email' };
            }
        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    signOut() {
        this.user = null;
        this.session = null;
        localStorage.removeItem('bizflow_session');
        localStorage.removeItem('bizflow_user');
    }

    async insert(table, data) {
        if (!this.user) {
            return { success: false, error: 'Not authenticated' };
        }

        try {
            const response = await fetch(`${this.url}/rest/v1/${table}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'apikey': this.anonKey,
                    'Authorization': `Bearer ${this.session?.access_token}`
                },
                body: JSON.stringify(data)
            });

            const result = await response.json();
            return { success: response.ok, data: result };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    async query(table, filters = {}) {
        if (!this.user) {
            return { success: false, error: 'Not authenticated' };
        }

        try {
            let url = `${this.url}/rest/v1/${table}`;
            const params = new URLSearchParams();

            Object.keys(filters).forEach(key => {
                params.append(`${key}=eq.${filters[key]}`);
            });

            if (params.toString()) {
                url += `?${params.toString()}`;
            }

            const response = await fetch(url, {
                method: 'GET',
                headers: {
                    'apikey': this.anonKey,
                    'Authorization': `Bearer ${this.session?.access_token}`
                }
            });

            const data = await response.json();
            return { success: response.ok, data };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    async update(table, data, filters) {
        if (!this.user) {
            return { success: false, error: 'Not authenticated' };
        }

        try {
            let url = `${this.url}/rest/v1/${table}`;
            const params = new URLSearchParams();

            Object.keys(filters).forEach(key => {
                params.append(`${key}=eq.${filters[key]}`);
            });

            if (params.toString()) {
                url += `?${params.toString()}`;
            }

            const response = await fetch(url, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'apikey': this.anonKey,
                    'Authorization': `Bearer ${this.session?.access_token}`
                },
                body: JSON.stringify(data)
            });

            const result = await response.json();
            return { success: response.ok, data: result };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }
}

// Initialize Supabase client
const supabase = new SupabaseClient(SUPABASE_CONFIG);
