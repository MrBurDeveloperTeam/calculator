import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { LogOut, Mail, Phone, Settings as SettingsIcon, User as UserIcon, ChevronRight, Wallet, Tv } from 'lucide-react';
import type { User as SupabaseUser } from '@supabase/supabase-js';
import type { Profile } from '../types';
import { useGetUserId } from '../lib/useAppLink';

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
  const [creditBalance, setCreditBalance] =
    useState<number | null>(null);

  const [creditLoading, setCreditLoading] =
    useState(true);

  const [creditError, setCreditError] =
    useState<string | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);
    const { mutateAsync: createAppLink, isPending } = useGetUserId();

  const displayName = profile?.name || (user?.user_metadata as any)?.full_name || user?.email?.split('@')[0] || 'Account';
  const badgeLabel = profile?.position || profile?.company_name || profile?.account_type;

  useEffect(() => {
    if (!user) {
      setCreditBalance(null);
      setCreditError(null);
      setCreditLoading(false);
      return;
    }

    let cancelled = false;

    async function loadCreditBalance() {
      setCreditLoading(true);
      setCreditError(null);

      try {
        const response = await fetch(
          '/api/wallet',
          {
            method: 'GET',
            credentials: 'include',
            headers: {
              Accept: 'application/json',
            },
            cache: 'no-store',
          }
        );

        const data = await response
          .json()
          .catch(() => null);

        if (!response.ok || !data?.ok) {
          throw new Error(
            data?.error ||
            'Unable to retrieve credit balance'
          );
        }

        const rawBalance =
          data?.data?.snabbb_balance ??
          data?.data?.balance ??
          data?.result?.snabbb_balance ??
          data?.result?.balance ??
          data?.snabbb_balance ??
          data?.balance;

        const balance = Number(rawBalance);

        if (!Number.isFinite(balance)) {
          throw new Error(
            'Invalid credit balance'
          );
        }

        if (!cancelled) {
          setCreditBalance(balance);
        }
      } catch (error) {
        console.error(
          'Failed to load Snabbb Credit:',
          error
        );

        if (!cancelled) {
          setCreditBalance(null);
          setCreditError(
            'Unable to load balance'
          );
        }
      } finally {
        if (!cancelled) {
          setCreditLoading(false);
        }
      }
    }

    void loadCreditBalance();

    return () => {
      cancelled = true;
    };
  }, [user?.id]);
  
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
                 onClick={async () => {
                          const res = await createAppLink({
                            app: 'reward',
                            email: user?.email,
                            name: user?.user_metadata.name,
                          });
                          
                          const supabaseUserId = res.result?.supabase_user_id;
                          const w = window.open('', '_blank');
                          if (supabaseUserId && w) {
                            w.location.href = `https://reward.snabbb.com`;
                          }
                        }}
                className="w-full flex items-center gap-3 px-4 py-3.5 hover:bg-[var(--app-surface-muted)] rounded-2xl transition-all group text-left"
              >
                <div className="w-7 h-7 rounded-xl bg-[var(--app-surface-muted)] flex items-center justify-center shrink-0">
                  <Wallet className="w-3.5 h-3.5 text-[var(--snabbb-primary)]" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-[var(--app-text)] leading-tight">Snabbb Credit</p>
                  <p className="text-[11px] font-semibold text-[var(--app-text-muted)] truncate">
                    {creditLoading
                      ? 'Loading...'
                      : creditError
                        ? creditError
                        : creditBalance !== null
                          ? `${creditBalance.toLocaleString()} credits`
                          : 'Balance unavailable'}
                  </p>
                </div>
                <ChevronRight className="w-3.5 h-3.5 text-[var(--app-border-strong)] group-hover:text-[var(--app-text-muted)] transition-colors" />
              </button>

              {/* My Channel */}
              <button
                onClick={async () => {
                          const res = await createAppLink({
                            app: 'e-learning',
                            email: user?.email,
                            name: user?.user_metadata.name,
                          });
                          
                          const supabaseUserId = res.result?.supabase_user_id;
                          const w = window.open('', '_blank');
                          if (supabaseUserId && w) {
                            w.location.href = `https://e-learning.snabbb.com/channel/${supabaseUserId}`;
                          }
                        }}
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
                onClick={async () => {
                          const res = await createAppLink({
                            app: 'snabbb',
                            email: user?.email,
                            name: user?.user_metadata.name,
                          });
                          
                          const supabaseUserId = res.result?.supabase_user_id;
                          const w = window.open('', '_blank');
                          if (supabaseUserId && w) {
                            w.location.href = `https://app.snabbb.com/profile-settings`;
                          }
                        }}
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
