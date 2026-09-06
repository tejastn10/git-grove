import type { FC } from "react";
import type { DiagramKey } from "@/content/git/sections";
import { BranchPointerDiagram } from "./BranchPointerDiagram";
import { FetchVsPullDiagram } from "./FetchVsPullDiagram";
import { MergeVsRebaseDiagram } from "./MergeVsRebaseDiagram";
import { ObjectModelDiagram } from "./ObjectModelDiagram";
import { ResetModesDiagram } from "./ResetModesDiagram";
import { SnapshotDiagram } from "./SnapshotDiagram";
import { StagingFlowDiagram } from "./StagingFlowDiagram";
import { ThreeWayMergeDiagram } from "./ThreeWayMergeDiagram";

/** Maps a section's `diagram` key to the component that renders it. */
export const DIAGRAMS: Record<DiagramKey, FC> = {
	"staging-flow": StagingFlowDiagram,
	"branch-pointer": BranchPointerDiagram,
	"three-way-merge": ThreeWayMergeDiagram,
	"fetch-vs-pull": FetchVsPullDiagram,
	"merge-vs-rebase": MergeVsRebaseDiagram,
	"reset-modes": ResetModesDiagram,
	"object-model": ObjectModelDiagram,
	snapshot: SnapshotDiagram,
};
