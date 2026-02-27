import { supabase } from '../lib/supabase';
import {
    GlobalState,
    OverheadItem,
    StaffMember,
    Asset,
    ConsumableItem,
    SavedProcedure,
    SavedPlan
} from '../types';

// Helper to handle standard Supabase errors
const handleResponse = (res: any) => {
    if (res.error) throw new Error(res.error.message);
    return res.data;
};

// --- Singular Configurations (Settings, Lab, Sterilization, etc.) ---

export const getSingularConfig = async <T,>(table: string, userId: string): Promise<T | null> => {
    const res = await supabase.from(table).select('*').eq('user_id', userId).maybeSingle();

    if (res.error) {
        console.error(`Error fetching ${table}:`, res.error);
        return null;
    }
    return res.data;
};

export const updateSingularConfig = async <T,>(table: string, userId: string, payload: Partial<T>) => {
    const res = await supabase
        .from(table)
        .upsert({ user_id: userId, ...payload }, { onConflict: 'user_id' });

    return handleResponse(res);
};

// --- List Items (Overhead, Staff, Depreciation, Consumables) ---

export const getListItems = async <T,>(table: string, userId: string): Promise<T[]> => {
    const res = await supabase.from(table).select('*').eq('user_id', userId).order('created_at', { ascending: true });
    return res.error ? [] : res.data;
};

export const upsertListItem = async <T extends { id: string }>(table: string, userId: string, item: T) => {
    const res = await supabase.from(table).upsert({
        user_id: userId,
        ...item
    }, { onConflict: 'id' });

    return handleResponse(res);
};

export const deleteListItem = async (table: string, id: string) => {
    const res = await supabase.from(table).delete().eq('id', id);
    return handleResponse(res);
};

// --- Batch Sync Operations (For overwriting lists) ---
export const syncEntireList = async <T extends { id: string }>(table: string, userId: string, items: T[]) => {
    // 1. Delete all existing for this user
    await supabase.from(table).delete().eq('user_id', userId);

    // 2. Insert new payload if there is one
    if (items.length > 0) {
        const payload = items.map(item => ({ ...item, user_id: userId }));
        const res = await supabase.from(table).insert(payload);
        // Note: the above delete and insert are distinct. RLS prevents inserting to another user
        handleResponse(res);
    }
};

// --- Specialized Procedures & Plans ---

export const getProcedures = async (userId: string): Promise<SavedProcedure[]> => {
    const items = await getListItems<any>('calc_saved_procedures', userId);
    return items.map(i => ({
        id: i.id,
        name: i.name,
        price: i.price,
        duration: i.duration,
        variableCost: i.variable_cost, // Map DB snake_case -> JS camelCase
        recipe: i.recipe
    }));
};

export const upsertProcedure = async (userId: string, proc: SavedProcedure) => {
    const payload = {
        id: proc.id,
        name: proc.name,
        price: proc.price,
        duration: proc.duration,
        variable_cost: proc.variableCost, // Map JS camelCase -> DB snake_case
        recipe: proc.recipe
    };
    return await upsertListItem('calc_saved_procedures', userId, payload);
};

export const deleteProcedure = async (id: string) => deleteListItem('calc_saved_procedures', id);

export const getPlans = async (userId: string): Promise<SavedPlan[]> => {
    const items = await getListItems<any>('calc_saved_plans', userId);
    return items.map(i => ({
        id: i.id,
        name: i.name,
        date: i.date,
        type: i.type,
        timeframe: i.timeframe,
        targetProfit: i.target_profit,
        algorithm: i.algorithm,
        inputs: i.inputs,
        results: i.results
    }));
};

export const upsertPlan = async (userId: string, plan: SavedPlan) => {
    const payload = {
        id: plan.id,
        name: plan.name,
        date: plan.date,
        type: plan.type,
        timeframe: plan.timeframe,
        target_profit: plan.targetProfit,
        algorithm: plan.algorithm,
        inputs: plan.inputs,
        results: plan.results
    };
    return await upsertListItem('calc_saved_plans', userId, payload);
};

export const deletePlan = async (id: string) => deleteListItem('calc_saved_plans', id);
