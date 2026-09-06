import {
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

import {
  BranchContext,
  type Branch,
  type SelectedBranchId,
} from "../hooks/useBranch";

import { useAuth } from "../hooks/useAuth";
import { API_URL } from "../services/api";

interface BranchResponse {
  data: Branch[];
}

export function BranchProvider({
  children,
}: {
  children: ReactNode;
}) {
  const { user } = useAuth();

  const [branches, setBranches] = useState<Branch[]>(
    []
  );

  const [
    selectedBranchId,
    setSelectedBranchIdState,
  ] = useState<SelectedBranchId>("ALL");

  const [loadingBranches, setLoadingBranches] =
    useState(false);

  useEffect(() => {
    if (!user) {
      setBranches([]);
      setSelectedBranchIdState("ALL");
      return;
    }

    const fetchBranches = async () => {
      try {
        setLoadingBranches(true);

        const response = await fetch(
          `${API_URL}/branches`
        );

        if (!response.ok) {
          throw new Error(
            "Failed to fetch branches"
          );
        }

        const result: BranchResponse =
          await response.json();

        setBranches(result.data ?? []);
      } catch (error) {
        console.error(
          "Failed to load branches:",
          error
        );
      } finally {
        setLoadingBranches(false);
      }
    };

    fetchBranches();
  }, [user]);

  useEffect(() => {
    if (!user) {
      return;
    }

    if (user.role === "STAFF") {
      setSelectedBranchIdState(user.branch.id);
    }
  }, [user]);

  const setSelectedBranchId = (
    value: SelectedBranchId
  ) => {
    if (user?.role === "STAFF") {
      return;
    }

    setSelectedBranchIdState(value);
  };

  const selectedBranch = useMemo(() => {
    if (selectedBranchId === "ALL") {
      return null;
    }

    return (
      branches.find(
        (branch) =>
          branch.id === selectedBranchId
      ) ?? null
    );
  }, [branches, selectedBranchId]);

  return (
    <BranchContext.Provider
      value={{
        branches,
        selectedBranchId,
        selectedBranch,
        setSelectedBranchId,
        loadingBranches,
      }}
    >
      {children}
    </BranchContext.Provider>
  );
}