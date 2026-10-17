import { doc, setDoc, deleteDoc } from 'firebase/firestore';
import { db, auth, handleFirestoreError, OperationType } from './firebase';
import { getPendingSyncItems, removeSyncQueueItem } from './storage';
import { SyncStatus } from '../types';

let isSyncing = false;
let syncListeners: ((status: SyncStatus) => void)[] = [];

let currentStatus: SyncStatus = {
  state: 'synced',
  pendingCount: 0,
  lastSyncedAt: null,
};

export function subscribeToSyncStatus(listener: (status: SyncStatus) => void): () => void {
  syncListeners.push(listener);
  listener(currentStatus);
  return () => {
    syncListeners = syncListeners.filter((l) => l !== listener);
  };
}

function updateStatus(newStatus: Partial<SyncStatus>) {
  currentStatus = { ...currentStatus, ...newStatus };
  for (const listener of syncListeners) {
    listener(currentStatus);
  }
}

export async function syncPendingData(): Promise<void> {
  if (isSyncing) return;

  const isOnline = typeof navigator !== 'undefined' ? navigator.onLine : true;
  if (!isOnline) {
    const pending = await getPendingSyncItems();
    updateStatus({ state: 'offline', pendingCount: pending.length });
    return;
  }

  const pendingItems = await getPendingSyncItems();
  if (pendingItems.length === 0) {
    updateStatus({ state: 'synced', pendingCount: 0 });
    return;
  }

  isSyncing = true;
  updateStatus({ state: 'syncing', pendingCount: pendingItems.length });

  // Use current user's businessId, or default to admin business
  const businessId = auth.currentUser?.uid || 'biz_default';

  try {
    for (const item of pendingItems) {
      const collectionPath = `businesses/${businessId}/${item.collection}`;
      const docRef = doc(db, collectionPath, item.documentId);

      try {
        if (item.operation === 'delete') {
          await deleteDoc(docRef);
        } else {
          // Clean undefined values before writing to Firestore
          const cleanData = JSON.parse(JSON.stringify(item.data));
          cleanData.syncedAt = new Date().toISOString();
          await setDoc(docRef, cleanData, { merge: true });
        }
        await removeSyncQueueItem(item.id);
      } catch (err) {
        console.warn(`Sync failed for ${item.collection}/${item.documentId}:`, err);
        // If not authenticated yet, we retain in local IndexedDB queue
      }
    }

    const remaining = await getPendingSyncItems();
    isSyncing = false;
    updateStatus({
      state: remaining.length === 0 ? 'synced' : 'pending',
      pendingCount: remaining.length,
      lastSyncedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    });
  } catch (error) {
    isSyncing = false;
    const remaining = await getPendingSyncItems();
    updateStatus({
      state: 'error',
      pendingCount: remaining.length,
      errorMessage: error instanceof Error ? error.message : 'Sync error',
    });
  }
}

// Background auto-sync listener on window 'online' event
if (typeof window !== 'undefined') {
  window.addEventListener('online', () => {
    syncPendingData();
  });
  window.addEventListener('offline', () => {
    updateStatus({ state: 'offline' });
  });
}
