// Supabase Client - REST API Implementation with .from() support

const SUPABASE_CONFIG = {
    url: 'https://piaphpiowvgalvduacpt.supabase.co',
    anonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBpYXBocGlvd3ZnYWx2ZHVhY3B0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODA2OTg4MDUsImV4cCI6MjA5NjI3NDgwNX0.lEOrhLB0AaCzsDXWzXHkvth83-KtXKOpTYe8ndi3bFc'
};

class SupabaseTable {
    constructor(supabaseClient, tableName) {
        this.client = supabaseClient;
        this.tableName = tableName;
        this.filters = [];
        this.selectColumns = '*';
    }

    select(columns = '*') {
        this.selectColumns = columns;
        return this;
    }

    eq(column, value) {
        this.filters.push({ column, operator: 'eq', value });
        return this;
    }

    async single() {
        const result = await this.execute();
        if (result.data && result.data.length > 0) {
            return { data: result.data[0], error: null };
        }
        return { data: null, error: result.error };
    }

    async execute() {
        try {
            let url = `${this.client.url}/rest/v1/${this.tableName}?select=${this.selectColumns}`;

            // Add filters
            this.filters.forEach(filter => {
                url += `&${filter.column}=${filter.operator}.${encodeURIComponent(filter.value)}`;
            });

            const response = await fetch(url, {
                method: 'GET',
                headers: {
                    'apikey': this.client.anonKey,
                    'Authorization': `Bearer ${this.client.session?.access_token || ''}`
                }
            });

            const data = await response.json();

            if (response.ok) {
                return { data, error: null };
            } else {
                return { data: null, error: data.message || 'Query failed' };
            }
        } catch (error) {
            console.error('Table query error:', error);
            return { data: null, error: error.message };
        }
    }

    async insert(records, options = {}) {
        try {
            let url = `${this.client.url}/rest/v1/${this.tableName}`;
            
            const headers = {
                'Content-Type': 'application/json',
                'apikey': this.client.anonKey,
                'Authorization': `Bearer ${this.client.session?.access_token || ''}`
            };

            if (options.returning === 'minimal') {
                headers['Prefer'] = 'return=minimal';
            } else if (options.returning === 'representation') {
                headers['Prefer'] = 'return=representation';
            }

            const response = await fetch(url, {
                method: 'POST',
                headers,
                body: JSON.stringify(records)
            });

            const data = await response.text();
            let parsedData = null;

            if (data) {
                try {
                    parsedData = JSON.parse(data);
                } catch (e) {
                    console.warn('Could not parse response');
                }
            }

            if (response.ok || response.status === 201) {
                return { data: parsedData, error: null };
            } else {
                return { data: null, error: parsedData?.message || 'Insert failed' };
            }
        } catch (error) {
            console.error('Insert error:', error);
            return { data: null, error: error.message };
        }
    }

    async update(data, options = {}) {
        try {
            let url = `${this.client.url}/rest/v1/${this.tableName}`;

            this.filters.forEach(filter => {
                url += `?${filter.column}=${filter.operator}.${encodeURIComponent(filter.value)}`;
            });

            const headers = {
                'Content-Type': 'application/json',
                'apikey': this.client.anonKey,
                'Authorization': `Bearer ${this.client.session?.access_token || ''}`
            };

            const response = await fetch(url, {
                method: 'PATCH',
                headers,
                body: JSON.stringify(data)
            });

            const result = await response.json();

            if (response.ok) {
                return { data: result, error: null };
            } else {
                return { data: null, error: result.message || 'Update failed' };
            }
        } catch (error) {
            console.error('Update error:', error);
            return { data: null, error: error.message };
        }
    }
}

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

    // NEW: .from() method for fluent API
    from(tableName) {
        return new SupabaseTable(this, tableName);
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
                    email: email,
                    password: password
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

                // FIX: Extract access_token directly from signup response
                // This works even if email confirmation is required
                if (data.session) {
                    this.setSession(data.session);
                } else if (data.access_token) {
                    // Fallback: use access_token directly if session object isn't available
                    this.setSession({
                        access_token: data.access_token,
                        refresh_token: data.refresh_token || null,
                        user: data.user
                    });
                }

                console.log('[BizFlow Auth] Signup successful, session set:', !!this.session?.access_token);
                return { success: true, user, session: data.session || { access_token: data.access_token } };
            } else {
                const errorMsg = data.error_description || data.message || JSON.stringify(data);
                return { success: false, error: errorMsg };
            }
        } catch (error) {
            console.error('Signup fetch error:', error);
            return { success: false, error: error.message || 'Network error' };
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
                body: JSON.stringify({
                    email: email,
                    password: password
                })
            });

            const data = await response.json();

            if (response.ok && data.user) {
                const user = {
                    id: data.user.id,
                    email: data.user.email
                };
                this.setUser(user);
                this.setSession({
                    access_token: data.access_token,
                    refresh_token: data.refresh_token,
                    user: data.user
                });
                return { success: true, user, session: data };
            } else {
                const errorMsg = data.error_description || data.error || 'Invalid credentials';
                return { success: false, error: errorMsg };
            }
        } catch (error) {
            console.error('Signin fetch error:', error);
            return { success: false, error: error.message || 'Network error' };
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
                const data = await response.json();
                return { success: false, error: data.error_description || 'Failed to send reset email' };
            }
        } catch (error) {
            console.error('Reset password error:', error);
            return { success: false, error: error.message || 'Network error' };
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

        const result = await this.from(table).insert([data], { returning: 'minimal' });
        return { success: !result.error, data: result.data, error: result.error };
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
                    'Authorization': `Bearer ${this.session?.access_token || ''}`
                }
            });

            const data = await response.json();
            return { success: response.ok, data };
        } catch (error) {
            console.error('Query error:', error);
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
                    'Authorization': `Bearer ${this.session?.access_token || ''}`
                },
                body: JSON.stringify(data)
            });

            const result = await response.json();
            return { success: response.ok, data: result };
        } catch (error) {
            console.error('Update error:', error);
            return { success: false, error: error.message };
        }
    }
}

// Initialize Supabase client
const supabase = new SupabaseClient(SUPABASE_CONFIG);
