/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { User, AttendanceRecord, LeaveRequest, InventoryItem, SystemSettings, ActiveView } from './types';
import { AppStorage } from './services/storage';
import { HeaderNavbar } from './components/HeaderNavbar';
import { StudentHome } from './components/StudentHome';
import { ScannerCamera } from './components/ScannerCamera';
import { PortalAdmin } from './components/PortalAdmin';
import { AttendanceCalculator } from './components/AttendanceCalculator';
import { MonthlyReport } from './components/MonthlyReport';
import { TeacherHonorary } from './components/TeacherHonorary';
import { StudentIdCards } from './components/StudentIdCards';
import { UserManager } from './components/UserManager';
import { LeaveValidation } from './components/LeaveValidation';
import { InventoryManager } from './components/InventoryManager';
import { DomainOnlineGuideModal } from './components/DomainOnlineGuideModal';
import { SystemSettingsModal } from './components/SystemSettingsModal';
import { LoginModal } from './components/LoginModal';
import { DailyInfographicModal } from './components/DailyInfographicModal';
import { LogoManagerModal } from './components/LogoManagerModal';

export default function App() {
  const [users, setUsers] = useState<User[]>([]);
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
  const [leaves, setLeaves] = useState<LeaveRequest[]>([]);
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [settings, setSettings] = useState<SystemSettings>(AppStorage.getSettings());
  const [currentUser, setCurrentUser] = useState<User>(AppStorage.getCurrentUser());
  const [activeView, setActiveView] = useState<ActiveView>('home');

  // Modals state
  const [domainModalOpen, setDomainModalOpen] = useState(false);
  const [settingsModalOpen, setSettingsModalOpen] = useState(false);
  const [logoModalOpen, setLogoModalOpen] = useState(false);
  const [loginModalOpen, setLoginModalOpen] = useState(false);
  const [stealthAdminModalOpen, setStealthAdminModalOpen] = useState(false);
  const [infographicClassName, setInfographicClassName] = useState<string | null>(null);

  // Load initial data from AppStorage
  const loadAllData = () => {
    setUsers(AppStorage.getUsers());
    setAttendance(AppStorage.getAttendance());
    setLeaves(AppStorage.getLeaves());
    setInventory(AppStorage.getInventory());
    setSettings(AppStorage.getSettings());
    setCurrentUser(AppStorage.getCurrentUser());
  };

  useEffect(() => {
    loadAllData();
    // Synchronize with server so changes from other devices appear automatically
    AppStorage.syncWithServer().then(() => {
      loadAllData();
    });

    // Auto-sync whenever user opens / returns to this tab on phone or PC
    const handleSync = () => {
      AppStorage.syncWithServer().then(() => {
        loadAllData();
      });
    };

    window.addEventListener('focus', handleSync);
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'visible') {
        handleSync();
      }
    });

    // Periodic background sync every 10 seconds
    const interval = setInterval(handleSync, 10000);

    return () => {
      window.removeEventListener('focus', handleSync);
      clearInterval(interval);
    };
  }, []);

  // Keyboard shortcut for Stealth Admin: Ctrl + Shift + A
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.shiftKey && (e.key === 'A' || e.key === 'a')) {
        e.preventDefault();
        setStealthAdminModalOpen(true);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleSwitchUser = (user: User) => {
    AppStorage.setCurrentUser(user);
    setCurrentUser(user);
    if (user.kategori === 'Admin') {
      setActiveView('portal');
    } else {
      setActiveView('home');
    }
  };

  const handleLogout = () => {
    const allUsers = users.length > 0 ? users : AppStorage.getUsers();
    const defaultStudent = allUsers.find(u => u.kategori === 'Siswa') || allUsers[0];
    if (defaultStudent) {
      AppStorage.setCurrentUser(defaultStudent);
      setCurrentUser(defaultStudent);
    }
    setActiveView('home');
  };

  const handleAttendanceSaved = (record: AttendanceRecord) => {
    setAttendance(AppStorage.getAttendance());
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col font-sans selection:bg-blue-600 selection:text-white">
      {/* Header Navigation Bar (Hanya ditampilkan khusus Administrator) */}
      {currentUser.kategori === 'Admin' && (
        <HeaderNavbar
          currentUser={currentUser}
          activeView={activeView}
          setActiveView={setActiveView}
          onOpenLoginModal={() => setLoginModalOpen(true)}
          onOpenDomainGuide={() => setDomainModalOpen(true)}
          onOpenSettings={() => setSettingsModalOpen(true)}
          onOpenLogoManager={() => setLogoModalOpen(true)}
          onStealthAdminTrigger={() => setStealthAdminModalOpen(true)}
          users={users}
          onSwitchUser={handleSwitchUser}
          onLogout={handleLogout}
        />
      )}

      {/* Main View Router */}
      <main className="flex-1 pb-16">
        {activeView === 'home' && (
          currentUser.kategori === 'Admin' ? (
            <PortalAdmin
              currentUser={currentUser}
              users={users}
              attendance={attendance}
              settings={settings}
              onNavigate={setActiveView}
              onOpenSettings={() => setSettingsModalOpen(true)}
              onOpenLogoManager={() => setLogoModalOpen(true)}
              onRefreshData={loadAllData}
              onLogout={handleLogout}
            />
          ) : (
            <StudentHome
              currentUser={currentUser}
              attendance={attendance}
              leaves={leaves}
              inventory={inventory}
              settings={settings}
              onNavigate={setActiveView}
              onOpenDomainGuide={() => setDomainModalOpen(true)}
              onOpenLeaveModal={() => setActiveView('admin_izin')}
              onOpenLoginModal={() => setLoginModalOpen(true)}
              onStealthAdminTrigger={() => setStealthAdminModalOpen(true)}
            />
          )
        )}

        {activeView === 'portal' && (
          <PortalAdmin
            currentUser={currentUser}
            users={users}
            attendance={attendance}
            settings={settings}
            onNavigate={setActiveView}
            onOpenSettings={() => setSettingsModalOpen(true)}
            onOpenLogoManager={() => setLogoModalOpen(true)}
            onRefreshData={loadAllData}
            onLogout={handleLogout}
          />
        )}

        {activeView === 'kamera' && (
          <ScannerCamera
            currentUser={currentUser}
            settings={settings}
            onAttendanceSaved={handleAttendanceSaved}
            onBack={() => setActiveView(currentUser.kategori === 'Admin' ? 'portal' : 'home')}
            users={users}
          />
        )}

        {activeView === 'hitung_kehadiran' && (
          <AttendanceCalculator
            currentUser={currentUser}
            users={users}
            attendance={attendance}
            settings={settings}
            onOpenInfographicModal={(cls) => setInfographicClassName(cls)}
            onRefreshData={loadAllData}
            onBack={() => setActiveView('home')}
          />
        )}

        {activeView === 'rekap' && (
          <MonthlyReport
            users={users}
            attendance={attendance}
            settings={settings}
            onBack={() => setActiveView(currentUser.kategori === 'Admin' ? 'portal' : 'home')}
          />
        )}

        {activeView === 'rekap_honor' && (
          <TeacherHonorary
            users={users}
            attendance={attendance}
            settings={settings}
            onBack={() => setActiveView('portal')}
          />
        )}

        {activeView === 'cetak_kartu' && (
          <StudentIdCards
            users={users}
            onBack={() => setActiveView(currentUser.kategori === 'Admin' ? 'portal' : 'home')}
          />
        )}

        {activeView === 'data_users' && (
          <UserManager
            users={users}
            onRefreshUsers={loadAllData}
            onBack={() => setActiveView('portal')}
          />
        )}

        {activeView === 'admin_izin' && (
          <LeaveValidation
            currentUser={currentUser}
            leaves={leaves}
            onRefreshLeaves={loadAllData}
            onBack={() => setActiveView(currentUser.kategori === 'Admin' ? 'portal' : 'home')}
          />
        )}

        {activeView === 'inventaris' && (
          <InventoryManager
            currentUser={currentUser}
            inventory={inventory}
            onRefreshInventory={loadAllData}
            onBack={() => setActiveView(currentUser.kategori === 'Admin' ? 'portal' : 'home')}
          />
        )}
      </main>

      {/* Domain Online & Mobile Access Modal */}
      {domainModalOpen && (
        <DomainOnlineGuideModal
          onClose={() => setDomainModalOpen(false)}
        />
      )}

      {/* System Settings Modal */}
      {settingsModalOpen && (
        <SystemSettingsModal
          settings={settings}
          onSaveSettings={(newSettings) => {
            setSettings(newSettings);
            loadAllData();
          }}
          onClose={() => setSettingsModalOpen(false)}
          onOpenLogoManager={() => {
            setSettingsModalOpen(false);
            setLogoModalOpen(true);
          }}
        />
      )}

      {/* Logo Manager Modal */}
      {logoModalOpen && (
        <LogoManagerModal
          settings={settings}
          onSaveSettings={(newSettings) => {
            setSettings(newSettings);
            loadAllData();
          }}
          onClose={() => setLogoModalOpen(false)}
        />
      )}

      {/* Standard Login Modal */}
      {loginModalOpen && (
        <LoginModal
          users={users}
          onSelectUser={handleSwitchUser}
          isStealthMode={false}
          onClose={() => setLoginModalOpen(false)}
        />
      )}

      {/* Stealth Admin Secret Modal */}
      {stealthAdminModalOpen && (
        <LoginModal
          users={users}
          onSelectUser={handleSwitchUser}
          isStealthMode={true}
          onClose={() => setStealthAdminModalOpen(false)}
        />
      )}

      {/* Infographic Generator Modal */}
      {infographicClassName && (
        <DailyInfographicModal
          classNameTarget={infographicClassName}
          users={users}
          attendance={attendance}
          settings={settings}
          onClose={() => setInfographicClassName(null)}
        />
      )}
    </div>
  );
}

