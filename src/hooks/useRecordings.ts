"use client";

import { useState, useCallback } from 'react';
import { supabase } from '@/lib/supabase';

interface Recording {
    id: string;
    user_id: string;
    title: string;
    duration: number;
    file_path: string;
    file_url: string;
    created_at: string;
    exercise_type?: string;
    score?: number;
}

interface UseRecordingsReturn {
    recordings: Recording[];
    isLoading: boolean;
    error: string | null;
    fetchRecordings: () => Promise<void>;
    uploadRecording: (blob: Blob, title: string, duration: number, exerciseType?: string) => Promise<Recording | null>;
    deleteRecording: (id: string) => Promise<boolean>;
    getRecordingUrl: (filePath: string) => string | null;
}

/**
 * Hook for managing audio recordings with Supabase Storage.
 * Handles upload, fetch, and delete operations.
 */
export function useRecordings(): UseRecordingsReturn {
    const [recordings, setRecordings] = useState<Recording[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    /**
     * Fetch all recordings for the current user
     */
    const fetchRecordings = useCallback(async () => {
        setIsLoading(true);
        setError(null);

        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                setError('Kullanıcı oturumu bulunamadı');
                setIsLoading(false);
                return;
            }

            const { data, error: fetchError } = await supabase
                .from('recordings')
                .select('*')
                .eq('user_id', user.id)
                .order('created_at', { ascending: false });

            if (fetchError) throw fetchError;

            // Generate signed URLs for each recording
            const recordingsWithUrls = await Promise.all(
                (data || []).map(async (rec) => {
                    const url = await getSignedUrl(rec.file_path);
                    return { ...rec, file_url: url || '' };
                })
            );

            setRecordings(recordingsWithUrls);
        } catch (err: any) {
            console.error('Error fetching recordings:', err);
            setError('Kayıtlar yüklenemedi');
        } finally {
            setIsLoading(false);
        }
    }, []);

    /**
     * Upload a new recording to Supabase Storage
     */
    const uploadRecording = useCallback(async (
        blob: Blob,
        title: string,
        duration: number,
        exerciseType?: string
    ): Promise<Recording | null> => {
        setError(null);

        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                setError('Kullanıcı oturumu bulunamadı');
                return null;
            }

            // Generate unique filename
            const timestamp = Date.now();
            const fileName = `${user.id}/${timestamp}.webm`;

            // Upload to Supabase Storage
            const { data: uploadData, error: uploadError } = await supabase.storage
                .from('recordings')
                .upload(fileName, blob, {
                    contentType: 'audio/webm',
                    cacheControl: '3600',
                });

            if (uploadError) throw uploadError;

            // Create database record
            const { data: recordData, error: recordError } = await supabase
                .from('recordings')
                .insert({
                    user_id: user.id,
                    title: title || `Kayıt ${new Date().toLocaleDateString('tr-TR')}`,
                    duration,
                    file_path: uploadData.path,
                    exercise_type: exerciseType,
                })
                .select()
                .single();

            if (recordError) throw recordError;

            // Get signed URL
            const url = await getSignedUrl(uploadData.path);

            const newRecording = { ...recordData, file_url: url || '' };
            setRecordings(prev => [newRecording, ...prev]);

            return newRecording;
        } catch (err: any) {
            console.error('Error uploading recording:', err);
            setError('Kayıt yüklenemedi');
            return null;
        }
    }, []);

    /**
     * Delete a recording
     */
    const deleteRecording = useCallback(async (id: string): Promise<boolean> => {
        setError(null);

        try {
            // Get the recording to find file path
            const recording = recordings.find(r => r.id === id);
            if (!recording) {
                setError('Kayıt bulunamadı');
                return false;
            }

            // Delete from storage
            const { error: storageError } = await supabase.storage
                .from('recordings')
                .remove([recording.file_path]);

            if (storageError) console.error('Storage delete error:', storageError);

            // Delete from database
            const { error: dbError } = await supabase
                .from('recordings')
                .delete()
                .eq('id', id);

            if (dbError) throw dbError;

            // Update local state
            setRecordings(prev => prev.filter(r => r.id !== id));

            return true;
        } catch (err: any) {
            console.error('Error deleting recording:', err);
            setError('Kayıt silinemedi');
            return false;
        }
    }, [recordings]);

    /**
     * Get a signed URL for a recording file
     */
    const getRecordingUrl = useCallback((filePath: string): string | null => {
        const { data } = supabase.storage
            .from('recordings')
            .getPublicUrl(filePath);

        return data?.publicUrl || null;
    }, []);

    return {
        recordings,
        isLoading,
        error,
        fetchRecordings,
        uploadRecording,
        deleteRecording,
        getRecordingUrl,
    };
}

/**
 * Helper to get signed URL
 */
async function getSignedUrl(filePath: string): Promise<string | null> {
    try {
        const { data, error } = await supabase.storage
            .from('recordings')
            .createSignedUrl(filePath, 3600); // 1 hour

        if (error) throw error;
        return data.signedUrl;
    } catch {
        return null;
    }
}
