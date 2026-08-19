import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { getAccountOverview } from "@/lib/snapcut.functions";

export function useAccount() {
  const fetchOverview = useServerFn(getAccountOverview);
  return useQuery({
    queryKey: ["account-overview"],
    queryFn: () => fetchOverview(),
  });
}
