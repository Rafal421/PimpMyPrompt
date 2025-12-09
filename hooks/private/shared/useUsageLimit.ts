import { useState, useEffect } from "react";

interface UsageInfo {
  requests_made: number;
  requests_remaining: number;
  daily_limit: number;
  can_make_request: boolean;
  reset_time: string; // Changed from reset_date to reset_time
}

export const useUsageLimit = () => {
  const [usageInfo, setUsageInfo] = useState<UsageInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const checkUsage = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/usage");

      if (!response.ok) {
        throw new Error("Failed to check usage");
      }

      const data = await response.json();
      setUsageInfo(data);
      setError(null);
    } catch (err) {
      console.error("Error checking usage:", err);
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  };

  const incrementUsage = async (): Promise<boolean> => {
    try {
      const response = await fetch("/api/usage", {
        method: "POST",
      });

      if (!response.ok) {
        throw new Error("Failed to increment usage");
      }

      const data = await response.json();
      setUsageInfo(data);
      setError(null);

      // Return true if the request was allowed (check current state after increment)
      return data.can_make_request && data.requests_made <= data.daily_limit;
    } catch (err) {
      console.error("Error incrementing usage:", err);
      setError(err instanceof Error ? err.message : "Unknown error");
      return false;
    }
  };
  useEffect(() => {
    checkUsage();

    // Check usage every 30 seconds to keep it up to date
    const interval = setInterval(() => {
      checkUsage();
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  return {
    usageInfo,
    loading,
    error,
    checkUsage,
    incrementUsage,
    canMakeRequest: usageInfo?.can_make_request ?? false,
    requestsRemaining: usageInfo?.requests_remaining ?? 0,
    resetTime: usageInfo?.reset_time,
    getTimeUntilReset: () => {
      if (!usageInfo?.reset_time) return null;
      const resetTime = new Date(usageInfo.reset_time);
      const now = new Date();
      const diffMs = resetTime.getTime() - now.getTime();

      if (diffMs <= 0) return "Reset available now";

      const hours = Math.floor(diffMs / (1000 * 60 * 60));
      const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));

      if (hours > 0) {
        return `${hours}h ${minutes}m until reset`;
      } else {
        return `${minutes}m until reset`;
      }
    },
  };
};
