const rawBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';
export const API_BASE_URL = rawBaseUrl.endsWith('/api/v1') ? rawBaseUrl : `${rawBaseUrl.replace(/\/$/, '')}/api/v1`;

const getHeaders = () => {
    const token = localStorage.getItem('token');
    return {
        'Content-Type': 'application/json',
        ...(token ? { 'Authorization': `Bearer ${token}` } : {})
    };
};

const handleResponse = async (response: Response) => {
    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'API request failed');
    }
    const result = await response.json();
    return result.data;
};

export const apiService = {
    async getContacts() {
        try {
            const response = await fetch(`${API_BASE_URL}/contact`, {
                headers: getHeaders()
            });
            return await handleResponse(response);
        } catch (error) {
            console.error('Error fetching contacts:', error);
            return [];
        }
    },

    async getBookings() {
        try {
            const response = await fetch(`${API_BASE_URL}/consultation`, {
                headers: getHeaders()
            });
            return await handleResponse(response);
        } catch (error) {
            console.error('Error fetching bookings:', error);
            return [];
        }
    },

    async addBooking(booking: any) {
        try {
            const response = await fetch(`${API_BASE_URL}/consultation`, {
                method: 'POST',
                headers: getHeaders(),
                body: JSON.stringify(booking),
            });
            return await handleResponse(response);
        } catch (error) {
            console.error('Error adding booking:', error);
            throw error;
        }
    },

    async updateBooking(booking: any) {
        try {
            const response = await fetch(`${API_BASE_URL}/consultation/${booking.id}`, {
                method: 'PUT',
                headers: getHeaders(),
                body: JSON.stringify(booking),
            });
            return await handleResponse(response);
        } catch (error) {
            console.error('Error updating booking:', error);
            throw error;
        }
    },

    async deleteBooking(id: string) {
        try {
            const response = await fetch(`${API_BASE_URL}/consultation/${id}`, {
                method: 'DELETE',
                headers: getHeaders()
            });
            if (!response.ok) throw new Error('Failed to delete booking');
            return true;
        } catch (error) {
            console.error('Error deleting booking:', error);
            throw error;
        }
    },

    async addContact(contact: any) {
        try {
            const response = await fetch(`${API_BASE_URL}/contact`, {
                method: 'POST',
                headers: getHeaders(),
                body: JSON.stringify(contact),
            });
            return await handleResponse(response);
        } catch (error) {
            console.error('Error adding contact:', error);
            throw error;
        }
    },

    async updateContact(contact: any) {
        try {
            const response = await fetch(`${API_BASE_URL}/contact/${contact.id}`, {
                method: 'PUT',
                headers: getHeaders(),
                body: JSON.stringify(contact),
            });
            return await handleResponse(response);
        } catch (error) {
            console.error('Error updating contact:', error);
            throw error;
        }
    },

    async deleteContact(id: string) {
        try {
            const response = await fetch(`${API_BASE_URL}/contact/${id}`, {
                method: 'DELETE',
                headers: getHeaders()
            });
            if (!response.ok) throw new Error('Failed to delete contact');
            return true;
        } catch (error) {
            console.error('Error deleting contact:', error);
            throw error;
        }
    },

    // Manual Matches
    async getManualMatches() {
        try {
            const response = await fetch(`${API_BASE_URL}/manual-match`, {
                headers: getHeaders()
            });
            return await handleResponse(response);
        } catch (error) {
            console.error('Error fetching manual matches:', error);
            return [];
        }
    },

    async addManualMatch(match: any) {
        try {
            const response = await fetch(`${API_BASE_URL}/manual-match`, {
                method: 'POST',
                headers: getHeaders(),
                body: JSON.stringify(match),
            });
            return await handleResponse(response);
        } catch (error) {
            console.error('Error adding manual match:', error);
            throw error;
        }
    },

    async updateManualMatch(match: any) {
        try {
            const response = await fetch(`${API_BASE_URL}/manual-match/${match.id}`, {
                method: 'PUT',
                headers: getHeaders(),
                body: JSON.stringify(match),
            });
            return await handleResponse(response);
        } catch (error) {
            console.error('Error updating manual match:', error);
            throw error;
        }
    },

    async deleteManualMatch(id: string) {
        try {
            const response = await fetch(`${API_BASE_URL}/manual-match/${id}`, {
                method: 'DELETE',
                headers: getHeaders()
            });
            if (!response.ok) throw new Error('Failed to delete manual match');
            return true;
        } catch (error) {
            console.error('Error deleting manual match:', error);
            throw error;
        }
    },

    // Repositories
    async getRepositories() {
        try {
            const response = await fetch(`${API_BASE_URL}/repository`, {
                headers: getHeaders()
            });
            return await handleResponse(response);
        } catch (error) {
            console.error('Error fetching repositories:', error);
            return [];
        }
    },

    async addRepository(repo: any) {
        try {
            const response = await fetch(`${API_BASE_URL}/repository`, {
                method: 'POST',
                headers: getHeaders(),
                body: JSON.stringify(repo),
            });
            return await handleResponse(response);
        } catch (error) {
            console.error('Error adding repository:', error);
            throw error;
        }
    },

    async updateRepository(repo: any) {
        try {
            const response = await fetch(`${API_BASE_URL}/repository/${repo.id}`, {
                method: 'PUT',
                headers: getHeaders(),
                body: JSON.stringify(repo),
            });
            return await handleResponse(response);
        } catch (error) {
            console.error('Error updating repository:', error);
            throw error;
        }
    },

    async deleteRepository(id: string) {
        try {
            const response = await fetch(`${API_BASE_URL}/repository/${id}`, {
                method: 'DELETE',
                headers: getHeaders()
            });
            if (!response.ok) throw new Error('Failed to delete repository');
            return true;
        } catch (error) {
            console.error('Error deleting repository:', error);
            throw error;
        }
    },

    // Dashboard
    async getDashboardStats() {
        try {
            const response = await fetch(`${API_BASE_URL}/dashboard/stats`, {
                headers: getHeaders()
            });
            return await handleResponse(response);
        } catch (error) {
            console.error('Error fetching dashboard stats:', error);
            return null;
        }
    },
    async chatWithAI(prompt: string, context: string) {
        try {
            const response = await fetch(`${API_BASE_URL}/dashboard/chat`, {
                method: 'POST',
                headers: getHeaders(),
                body: JSON.stringify({ prompt, context }),
            });
            return await handleResponse(response);
        } catch (error) {
            console.error('Error chatting with AI:', error);
            throw error;
        }
    }
};
