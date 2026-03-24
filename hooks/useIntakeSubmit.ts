import { useMutation } from '@tanstack/react-query';
import { router } from 'expo-router';
import { submitIntake } from '../lib/supabase';
import { useAppStore } from '../store/useAppStore';
import type { IntakeDraft } from '../types';

type SubmitPayload = IntakeDraft & { name: string; phone: string; email: string };

export function useIntakeSubmit() {
  const { setSession, setCurrentBookingId, clearDraft } = useAppStore();

  return useMutation({
    mutationFn: (data: SubmitPayload) => submitIntake(data),
    onSuccess: async (result, variables) => {
      // Persist session
      await setSession({
        name: variables.name,
        phone: variables.phone,
        email: variables.email,
      });

      setCurrentBookingId(result.bookingId);
      clearDraft();

      // Navigate to confirmation then dashboard
      router.replace('/(intake)/step4');
    },
    onError: (error: Error) => {
      console.error('[useIntakeSubmit] error:', error.message);
    },
  });
}
