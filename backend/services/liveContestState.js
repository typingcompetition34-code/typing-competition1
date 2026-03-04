const liveByContestId = new Map();

const getLiveRoom = (contestId) => {
    const key = String(contestId || '').trim();
    if (!key) return null;
    let room = liveByContestId.get(key);
    if (!room) {
        room = {
            clients: new Set(), // For SSE clients
            snapshots: new Map(), // userId -> snapshot
            inactivityNotifiedFor: new Set(),
            completionNotified: false
        };
        liveByContestId.set(key, room);
    }
    return room;
};

const getParticipantState = (contestId, userId) => {
    const room = getLiveRoom(contestId);
    if (!room) return null;
    return room.snapshots.get(String(userId || '')) || null;
};

const updateParticipantState = (contestId, userId, snapshot) => {
    const room = getLiveRoom(contestId);
    if (!room) return;
    room.snapshots.set(String(userId || ''), snapshot);
};

const removeLiveRoom = (contestId) => {
    const key = String(contestId || '').trim();
    liveByContestId.delete(key);
};

const hasParticipated = (contestId, userId) => {
    const snap = getParticipantState(contestId, userId);
    if (!snap) return false;
    if (Number(snap?.typedChars || 0) > 0) return true;
    if (typeof snap?.typedText === 'string' && snap.typedText.trim().length > 0) return true;
    return false;
};

module.exports = {
    getLiveRoom,
    getParticipantState,
    updateParticipantState,
    removeLiveRoom,
    hasParticipated,
    liveByContestId
};
