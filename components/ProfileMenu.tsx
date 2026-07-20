import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { LogOut, Mail, Phone, Settings as SettingsIcon, User as UserIcon, ChevronRight, Wallet, Tv } from 'lucide-react';
import type { User as SupabaseUser } from '@supabase/supabase-js';
import type { Profile } from '../types';
import { useAppLink } from '../lib/useAppLink';

interface ProfileMenuProps {
  user: SupabaseUser | null;
  profile: Profile | null;
  onSignOut: () => void;
  triggerClassName?: string;
}

const getInitials = (name: string) => {
  const initials = name
    .split(' ')
    .map((part) => part[0])
    .filter(Boolean)
    .slice(0, 2)
    .join('')
    .toUpperCase();
  return initials || 'U';
};

const ProfileMenu: React.FC<ProfileMenuProps> = ({ user, profile, onSignOut, triggerClassName }) => {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const { mutateAsync: getAppLink } = useAppLink();

  const displayName = profile?.name || (user?.user_metadata as any)?.full_name || user?.email?.split('@')[0] || 'Account';
  const badgeLabel = profile?.position || profile?.company_name || profile?.account_type;

  // Opens another Snabbb app via an SSO handoff so the destination recognizes
  // the session instead of bouncing back to its own login/home page.
  //
  // NOTE: result.url points at the SSO gateway (sso.snabbb.com), not the
  // final app — it's a token-carrying redirect the gateway resolves itself.
  // We don't know its redirect-target parameter convention yet, so for now
  // we use it as-is (lands on the app's default page, but at least
  // authenticated) rather than guessing at its path/query contract again.
  const openAppLink = async (appCode: string, targetUrl: string) => {
    setIsOpen(false);
    const win = window.open('', '_blank');
    try {
      const res = await getAppLink({
        app: appCode,
        email: user?.email || '',
        name: displayName,
      });
      const url = res?.result?.url || targetUrl;
      if (win) win.location.href = url;
    } catch (err) {
      console.error(`Failed to create SSO link for "${appCode}":`, err);
      if (win) win.location.href = targetUrl;
    }
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setIsOpen((v) => !v)}
        title="Account"
        aria-label="Account menu"
        className={
          triggerClassName ||
          'p-2 text-[var(--app-text-soft)] hover:bg-[var(--app-surface-muted)] rounded-full bg-[var(--app-surface)] border border-[var(--app-border)] shadow-sm transition-colors'
        }
      >
        {profile?.avatar_url ? (
          <img src={profile.avatar_url} alt={displayName} className="w-5 h-5 rounded-full object-cover" />
        ) : (
          <UserIcon className="w-5 h-5" />
        )}
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 mt-3 w-80 bg-[var(--app-surface)] border border-[var(--app-border)] rounded-3xl shadow-2xl overflow-hidden z-50"
          >
            {/* Profile Info */}
            <div className="p-6 border-b border-[var(--app-border)] bg-[var(--app-surface-soft)]">
              <p className="text-[10px] font-black text-[var(--app-text-muted)] uppercase tracking-[0.2em] mb-4">
                Profile Info
              </p>

              <div className="flex items-center gap-3 mb-4">
                <div className="w-11 h-11 rounded-full bg-[var(--snabbb-primary)] text-white flex items-center justify-center text-sm font-bold shrink-0 overflow-hidden">
                  {profile?.avatar_url ? (
                    <img src={profile.avatar_url} alt={displayName} className="w-full h-full object-cover" />
                  ) : (
                    getInitials(displayName)
                  )}
                </div>
                <div className="min-w-0">
                  <p className="text-base font-bold text-[var(--app-text)] truncate leading-tight">{displayName}</p>
                  {badgeLabel && (
                    <div className="mt-1.5 inline-flex items-center px-2 py-0.5 rounded-md bg-[var(--app-surface-muted)] text-[var(--snabbb-primary)] text-[9px] font-black uppercase tracking-wider border border-[var(--app-border)]">
                      {badgeLabel}
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center gap-2 text-[var(--app-text-soft)]">
                  <Mail className="w-3 h-3 shrink-0" />
                  <p className="text-xs font-semibold truncate">{user?.email}</p>
                </div>

                {profile?.phone && (
                  <div className="flex items-center gap-2 text-[var(--app-text-soft)]">
                    <Phone className="w-3 h-3 shrink-0" />
                    <p className="text-xs font-semibold truncate">{profile.phone}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Nav Items */}
            <div className="p-2 border-b border-[var(--app-border)]">
              {/* Snabbb Credit */}
              <button
                onClick={() => openAppLink('reward', 'https://reward.snabbb.com')}
                className="w-full flex items-center gap-3 px-4 py-3.5 hover:bg-[var(--app-surface-muted)] rounded-2xl transition-all group text-left"
              >
                <div className="w-7 h-7 rounded-xl bg-[var(--app-surface-muted)] flex items-center justify-center shrink-0">
                  <Wallet className="w-3.5 h-3.5 text-[var(--snabbb-primary)]" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-[var(--app-text)] leading-tight">Snabbb Credit</p>
                  <p className="text-[11px] font-semibold text-[var(--app-text-muted)] truncate">View your balance & rewards</p>
                </div>
                <ChevronRight className="w-3.5 h-3.5 text-[var(--app-border-strong)] group-hover:text-[var(--app-text-muted)] transition-colors" />
              </button>

              {/* My Channel */}
              <button
                onClick={() => openAppLink('e-learning', 'https://e-learning.snabbb.com')}
                className="w-full flex items-center gap-3 px-4 py-3.5 hover:bg-[var(--app-surface-muted)] rounded-2xl transition-all group text-left"
              >
                <div className="w-7 h-7 rounded-xl bg-[var(--app-surface-muted)] flex items-center justify-center shrink-0">
                  <Tv className="w-3.5 h-3.5 text-[var(--snabbb-accent)]" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-[var(--app-text)] leading-tight">My Channel</p>
                  <p className="text-[11px] font-semibold text-[var(--app-text-muted)] truncate">Manage your channel</p>
                </div>
                <ChevronRight className="w-3.5 h-3.5 text-[var(--app-border-strong)] group-hover:text-[var(--app-text-muted)] transition-colors" />
              </button>

              {/* Settings */}
              <button
                onClick={() => openAppLink('snabbb', 'https://app.snabbb.com/profile-settings')}
                className="w-full flex items-center gap-3 px-4 py-3.5 hover:bg-[var(--app-surface-muted)] rounded-2xl transition-all group text-left"
              >
                <div className="w-7 h-7 rounded-xl bg-[var(--app-surface-muted)] flex items-center justify-center shrink-0">
                  <SettingsIcon className="w-3.5 h-3.5 text-[var(--app-text-soft)]" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-[var(--app-text)] leading-tight">Settings</p>
                  <p className="text-[11px] font-semibold text-[var(--app-text-muted)] truncate">Account & preferences</p>
                </div>
                <ChevronRight className="w-3.5 h-3.5 text-[var(--app-border-strong)] group-hover:text-[var(--app-text-muted)] transition-colors" />
              </button>
            </div>

            {/* Log Out */}
            <div className="p-2">
              <button
                onClick={() => {
                  setIsOpen(false);
                  onSignOut();
                }}
                className="w-full flex items-center gap-3 px-4 py-3.5 text-sm font-bold text-[var(--danger-color)] hover:bg-[var(--app-surface-muted)] rounded-2xl transition-all text-left"
              >
                <LogOut className="w-4 h-4" /> Log Out
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ProfileMenu;
