import {
  createContext,
  useContext,
} from "react";

export interface Branch {
  id: number;
  code: "BRANCH_1" | "BRANCH_2";
  name: string;
  status: "ACTIVE" | "INACTIVE";
}

export type SelectedBranchId = number | "ALL";

interface BranchContextType {
  branches: Branch[];
  selectedBranchId: SelectedBranchId;
  selectedBranch: Branch | null;
  setSelectedBranchId: (
    branchId: SelectedBranchId
  ) => void;
  loadingBranches: boolean;
}

export const BranchContext =
  createContext<BranchContextType | undefined>(
    undefined
  );

export function useBranch() {
  const context = useContext(BranchContext);

  if (!context) {
    throw new Error(
      "useBranch must be used within BranchProvider"
    );
  }

  return context;
}