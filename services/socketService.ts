import { io, Socket } from 'socket.io-client';

const SOCKET_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

class SocketService {
    private socket: Socket | null = null;

    connect() {
        if (!this.socket) {
            this.socket = io(SOCKET_URL);
            this.socket.on('connect', () => {
                console.log('Connected to WebSocket server');
            });
        }
        return this.socket;
    }

    getSocket() {
        return this.socket;
    }

    onDataUpdated(callback: (payload: any) => void) {
        this.socket?.on('data_updated', callback);
    }

    disconnect() {
        if (this.socket) {
            this.socket.disconnect();
            this.socket = null;
        }
    }
}

export const socketService = new SocketService();
