import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, runAutoCleanup } from '../store';

/**
 * Hook to automatically run cleanup based on retention settings
 * Checks on mount and every 24 hours
 */
export const useAutoCleanup = () => {
    const dispatch = useDispatch();
    const { retentionEnabled, retentionDays } = useSelector((state: RootState) => state.admin);

    useEffect(() => {
        if (!retentionEnabled) return;

        // Run cleanup on mount
        dispatch(runAutoCleanup());

        // Set up interval to run cleanup every 24 hours
        const intervalId = setInterval(() => {
            dispatch(runAutoCleanup());
        }, 24 * 60 * 60 * 1000); // 24 hours in milliseconds

        return () => clearInterval(intervalId);
    }, [dispatch, retentionEnabled, retentionDays]);
};
