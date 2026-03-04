import { create } from 'zustand';
import { io } from 'socket.io-client';

export const useContestStore = create((set, get) => ({
    contest: null,
    socket: null,
    isConnected: false,
    
    setContest: (contest) => set({ contest }),
    
    connectSocket: (contestId) => {
        const socket = io('http://localhost:5000');
        
        socket.on('connect', () => {
            console.log('Connected to socket');
            set({ isConnected: true });
            socket.emit('arena:join', contestId);
        });

        socket.on('disconnect', () => {
            console.log('Disconnected');
            set({ isConnected: false });
        });

        set({ socket });
        return socket;
    },

    disconnectSocket: () => {
        const { socket } = get();
        if (socket) {
            socket.disconnect();
            set({ socket: null, isConnected: false });
        }
    }
}));
