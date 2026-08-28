import { User, AttendanceRecord, LeaveRequest, InventoryItem, SystemSettings } from '../types';
import { INITIAL_USERS, INITIAL_ATTENDANCE, INITIAL_LEAVES, INITIAL_INVENTORY, INITIAL_SETTINGS, getTodayDateString } from '../data/initialData';

const KEY_USERS = 'smanes_users_v2';
const KEY_ATTENDANCE = 'smanes_attendance_v2';
const KEY_LEAVES = 'smanes_leaves_v2';
const KEY_INVENTORY = 'smanes_inventory_v2';
const KEY_SETTINGS = 'smanes_settings_v2';
const KEY_CURRENT_USER = 'smanes_current_user_v2';

export class AppStorage {
  static getUsers(): User[] {
    try {
      const data = localStorage.getItem(KEY_USERS);
      if (!data) {
        localStorage.setItem(KEY_USERS, JSON.stringify(INITIAL_USERS));
        return INITIAL_USERS;
      }
      return JSON.parse(data);
    } catch {
      return INITIAL_USERS;
    }
  }

  static saveUsers(users: User[]): void {
    localStorage.setItem(KEY_USERS, JSON.stringify(users));
    try {
      fetch('/api/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ users })
      }).catch(() => {});
    } catch {}
  }

  static getAttendance(): AttendanceRecord[] {
    try {
      const data = localStorage.getItem(KEY_ATTENDANCE);
      if (!data) {
        localStorage.setItem(KEY_ATTENDANCE, JSON.stringify(INITIAL_ATTENDANCE));
        return INITIAL_ATTENDANCE;
      }
      return JSON.parse(data);
    } catch {
      return INITIAL_ATTENDANCE;
    }
  }

  static saveAttendance(records: AttendanceRecord[]): void {
    localStorage.setItem(KEY_ATTENDANCE, JSON.stringify(records));
    try {
      fetch('/api/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ attendance: records })
      }).catch(() => {});
    } catch {}
  }

  static getLeaves(): LeaveRequest[] {
    try {
      const data = localStorage.getItem(KEY_LEAVES);
      if (!data) {
        localStorage.setItem(KEY_LEAVES, JSON.stringify(INITIAL_LEAVES));
        return INITIAL_LEAVES;
      }
      return JSON.parse(data);
    } catch {
      return INITIAL_LEAVES;
    }
  }

  static saveLeaves(leaves: LeaveRequest[]): void {
    localStorage.setItem(KEY_LEAVES, JSON.stringify(leaves));
    try {
      fetch('/api/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ leaves })
      }).catch(() => {});
    } catch {}
  }

  static getInventory(): InventoryItem[] {
    try {
      const data = localStorage.getItem(KEY_INVENTORY);
      if (!data) {
        localStorage.setItem(KEY_INVENTORY, JSON.stringify(INITIAL_INVENTORY));
        return INITIAL_INVENTORY;
      }
      return JSON.parse(data);
    } catch {
      return INITIAL_INVENTORY;
    }
  }

  static saveInventory(items: InventoryItem[]): void {
    localStorage.setItem(KEY_INVENTORY, JSON.stringify(items));
    try {
      fetch('/api/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ inventory: items })
      }).catch(() => {});
    } catch {}
  }

  static getSettings(): SystemSettings {
    try {
      const data = localStorage.getItem(KEY_SETTINGS);
      if (!data) {
        localStorage.setItem(KEY_SETTINGS, JSON.stringify(INITIAL_SETTINGS));
        return INITIAL_SETTINGS;
      }
      return JSON.parse(data);
    } catch {
      return INITIAL_SETTINGS;
    }
  }

  static saveSettings(settings: SystemSettings): void {
    localStorage.setItem(KEY_SETTINGS, JSON.stringify(settings));
    // Persist to server asynchronously so other devices get the update
    try {
      fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings)
      }).catch(() => {});
    } catch {}
  }

  static async uploadLogoToServer(type: 'kiri' | 'kanan', dataUrl: string): Promise<string> {
    try {
      const res = await fetch('/api/upload-logo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type, dataUrl })
      });
      if (res.ok) {
        const data = await res.json();
        if (data.logoUrl) {
          const currentSettings = this.getSettings();
          if (type === 'kiri') currentSettings.custom_logo_kiri = data.logoUrl;
          else currentSettings.custom_logo_kanan = data.logoUrl;
          localStorage.setItem(KEY_SETTINGS, JSON.stringify(currentSettings));
          return data.logoUrl;
        }
      }
    } catch (e) {
      console.warn('Server upload failed, using local storage fallback', e);
    }
    return dataUrl;
  }

  static async syncWithServer(): Promise<{
    settings?: SystemSettings;
    attendance?: AttendanceRecord[];
    users?: User[];
    leaves?: LeaveRequest[];
    inventory?: InventoryItem[];
  } | null> {
    try {
      const localUsers = this.getUsers();
      const localAttendance = this.getAttendance();
      const localLeaves = this.getLeaves();
      const localInventory = this.getInventory();
      const localSettings = this.getSettings();

      const res = await fetch('/api/sync');
      if (res.ok) {
        const serverData = await res.json();
        if (serverData && typeof serverData === 'object') {
          let needServerPush = false;
          const pushPayload: any = {};

          // 1. SETTINGS SYNC
          if (serverData.settings) {
            const mergedSettings = { ...localSettings, ...serverData.settings };
            localStorage.setItem(KEY_SETTINGS, JSON.stringify(mergedSettings));
          }

          // 2. USERS SYNC (Bidirectional: Always keep the most complete student database)
          if (serverData.users && Array.isArray(serverData.users) && serverData.users.length > 0) {
            if (serverData.users.length >= localUsers.length) {
              // Server has the master database (e.g. 300+ students), sync to this device (HP)
              localStorage.setItem(KEY_USERS, JSON.stringify(serverData.users));
            } else {
              // This device (e.g. PC where 300+ were imported) has more students than server, push to server!
              needServerPush = true;
              pushPayload.users = localUsers;
            }
          } else if (localUsers.length > 0) {
            // Server has no users yet, upload local user list to server
            needServerPush = true;
            pushPayload.users = localUsers;
          }

          // 3. ATTENDANCE SYNC (Merge unique records)
          if (serverData.attendance && Array.isArray(serverData.attendance)) {
            const combined = [...serverData.attendance];
            localAttendance.forEach(loc => {
              if (!combined.some(s => s.user_id === loc.user_id && s.date === loc.date)) {
                combined.push(loc);
              }
            });
            localStorage.setItem(KEY_ATTENDANCE, JSON.stringify(combined));
            if (combined.length > serverData.attendance.length) {
              needServerPush = true;
              pushPayload.attendance = combined;
            }
          } else if (localAttendance.length > 0) {
            needServerPush = true;
            pushPayload.attendance = localAttendance;
          }

          // 4. LEAVES SYNC
          if (serverData.leaves && Array.isArray(serverData.leaves) && serverData.leaves.length > 0) {
            if (serverData.leaves.length >= localLeaves.length) {
              localStorage.setItem(KEY_LEAVES, JSON.stringify(serverData.leaves));
            } else {
              needServerPush = true;
              pushPayload.leaves = localLeaves;
            }
          } else if (localLeaves.length > 0) {
            needServerPush = true;
            pushPayload.leaves = localLeaves;
          }

          // 5. INVENTORY SYNC
          if (serverData.inventory && Array.isArray(serverData.inventory) && serverData.inventory.length > 0) {
            if (serverData.inventory.length >= localInventory.length) {
              localStorage.setItem(KEY_INVENTORY, JSON.stringify(serverData.inventory));
            } else {
              needServerPush = true;
              pushPayload.inventory = localInventory;
            }
          } else if (localInventory.length > 0) {
            needServerPush = true;
            pushPayload.inventory = localInventory;
          }

          // Send updates to server if this client had newer/more comprehensive data
          if (needServerPush) {
            await fetch('/api/sync', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(pushPayload)
            });
          }

          return serverData;
        }
      }
    } catch (e) {
      console.warn('Sync with server failed (offline mode)', e);
    }
    return null;
  }

  static getCurrentUser(): User {
    try {
      const data = localStorage.getItem(KEY_CURRENT_USER);
      if (data) {
        const parsed = JSON.parse(data);
        if (parsed && parsed.user_id) return parsed;
      }
    } catch {}
    // Default to student on initial access
    const users = this.getUsers();
    const defaultStudent = users.find(u => u.kategori === 'Siswa');
    return defaultStudent || users[0] || INITIAL_USERS[0];
  }

  static setCurrentUser(user: User): void {
    localStorage.setItem(KEY_CURRENT_USER, JSON.stringify(user));
  }

  static resetAllData(): void {
    const defaultStudent = INITIAL_USERS.find(u => u.kategori === 'Siswa') || INITIAL_USERS[0];
    localStorage.setItem(KEY_USERS, JSON.stringify(INITIAL_USERS));
    localStorage.setItem(KEY_ATTENDANCE, JSON.stringify(INITIAL_ATTENDANCE));
    localStorage.setItem(KEY_LEAVES, JSON.stringify(INITIAL_LEAVES));
    localStorage.setItem(KEY_INVENTORY, JSON.stringify(INITIAL_INVENTORY));
    localStorage.setItem(KEY_SETTINGS, JSON.stringify(INITIAL_SETTINGS));
    localStorage.setItem(KEY_CURRENT_USER, JSON.stringify(defaultStudent));
  }

  static setAllStudentsParentWhatsApp(phone: string): void {
    const users = this.getUsers().map(u => {
      if (u.kategori === 'Siswa') {
        return { ...u, no_wa_ortu: phone };
      }
      return u;
    });
    this.saveUsers(users);
  }

  static addOrUpdateAttendance(record: Omit<AttendanceRecord, 'attendance_id'>): AttendanceRecord {
    const records = this.getAttendance();
    const existingIndex = records.findIndex(
      r => r.user_id === record.user_id && r.date === record.date
    );

    let updatedRecord: AttendanceRecord;
    if (existingIndex >= 0) {
      updatedRecord = {
        ...records[existingIndex],
        ...record,
        attendance_id: records[existingIndex].attendance_id
      };
      records[existingIndex] = updatedRecord;
    } else {
      const newId = records.length > 0 ? Math.max(...records.map(r => r.attendance_id)) + 1 : 1;
      updatedRecord = {
        ...record,
        attendance_id: newId
      };
      records.unshift(updatedRecord);
    }

    this.saveAttendance(records);
    return updatedRecord;
  }
}
