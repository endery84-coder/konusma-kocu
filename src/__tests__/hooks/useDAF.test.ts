import { renderHook, act, waitFor } from '@testing-library/react';
import { useDAF } from '@/hooks/useDAF';
import { DAF_DEFAULTS } from '@/lib/constants';

describe('useDAF', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should initialize with default values', () => {
        const { result } = renderHook(() => useDAF());

        expect(result.current.isActive).toBe(false);
        expect(result.current.delayMs).toBe(DAF_DEFAULTS.DEFAULT_DELAY_MS);
        expect(result.current.error).toBeNull();
    });

    it('should update delay when setDelayMs is called', () => {
        const { result } = renderHook(() => useDAF());

        act(() => {
            result.current.setDelayMs(200);
        });

        expect(result.current.delayMs).toBe(200);
    });

    it('should start DAF when startDAF is called', async () => {
        const { result } = renderHook(() => useDAF());

        await act(async () => {
            await result.current.startDAF();
        });

        expect(result.current.isActive).toBe(true);
        expect(navigator.mediaDevices.getUserMedia).toHaveBeenCalledWith({
            audio: {
                echoCancellation: false,
                noiseSuppression: false,
                autoGainControl: false,
            },
        });
    });

    it('should stop DAF when stopDAF is called', async () => {
        const { result } = renderHook(() => useDAF());

        await act(async () => {
            await result.current.startDAF();
        });

        expect(result.current.isActive).toBe(true);

        act(() => {
            result.current.stopDAF();
        });

        expect(result.current.isActive).toBe(false);
    });

    it('should set error when microphone access fails', async () => {
        // Mock getUserMedia to reject
        const mockGetUserMedia = jest.fn().mockRejectedValue(new Error('Permission denied'));
        Object.defineProperty(navigator, 'mediaDevices', {
            writable: true,
            value: { getUserMedia: mockGetUserMedia },
        });

        const { result } = renderHook(() => useDAF());

        await act(async () => {
            await result.current.startDAF();
        });

        expect(result.current.isActive).toBe(false);
        expect(result.current.error).toBe('DAF başlatılamadı. Mikrofon izni gerekli.');
    });
});
