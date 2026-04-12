import clsx from "clsx";
import {
  Calculator,
  Eye,
  FileEdit,
  GitMerge,
  type LucideIcon,
  Package,
  Rocket,
  RotateCcw,
  UploadCloud,
  Zap,
} from "lucide-react";
import { type ReactNode, useEffect, useRef, useState } from "react";
import styles from "./styles.module.css";

/* ── Pipeline data model ── */

type Phase = "setup" | "dev" | "prep" | "ci";

interface PipelineNode {
  id: string;
  icon: LucideIcon;
  command: string;
  label: string;
  phase: Phase;
  ci?: boolean;
  subNodes?: PipelineNode[];
}

interface PipelinePhase {
  key: Phase;
  title: string;
  nodes: PipelineNode[];
}

const PHASES: PipelinePhase[] = [
  {
    key: "setup",
    title: "Setup",
    nodes: [
      {
        id: "init",
        icon: Zap,
        command: "init",
        label: "Scaffold config & CI",
        phase: "setup",
      },
    ],
  },
  {
    key: "dev",
    title: "Development",
    nodes: [
      {
        id: "change",
        icon: FileEdit,
        command: "change",
        label: "Add changenote",
        phase: "dev",
      },
      {
        id: "commit",
        icon: UploadCloud,
        command: "commit",
        label: "Commit & push",
        phase: "dev",
      },
    ],
  },
  {
    key: "prep",
    title: "Release Prep",
    nodes: [
      {
        id: "preview",
        icon: Eye,
        command: "preview",
        label: "Preview changelog in browser",
        phase: "prep",
      },
      {
        id: "prepare",
        icon: Calculator,
        command: "prepare",
        label: "Calculate version",
        phase: "prep",
      },
    ],
  },
  {
    key: "ci",
    title: "CI / Automated",
    nodes: [
      {
        id: "version",
        icon: GitMerge,
        command: "version",
        label: "Bump & changelog",
        phase: "ci",
        ci: true,
        subNodes: [
          {
            id: "publish",
            icon: Package,
            command: "publish",
            label: "Publish to npm",
            phase: "ci",
            ci: true,
          },
          {
            id: "release",
            icon: Rocket,
            command: "release",
            label: "GitHub Release",
            phase: "ci",
            ci: true,
          },
        ],
      },
    ],
  },
];

interface OptionalNode {
  id: string;
  icon: LucideIcon;
  command: string;
  label: string;
  branchFrom: string;
}

const OPTIONAL_NODES: OptionalNode[] = [
  {
    id: "reprepare",
    icon: RotateCcw,
    command: "reprepare",
    label: "Retry a failed release",
    branchFrom: "prepare",
  },
];

/* ── Hook: observe intersection once ── */

function useVisibleOnScroll<T extends HTMLElement>(): [
  React.RefObject<T | null>,
  boolean,
] {
  const ref = useRef<T | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return [ref, visible];
}

/* ── Sub-components ── */

const phaseClassMap: Record<Phase, { label: string; node: string }> = {
  setup: {
    label: styles.phaseLabelSetup,
    node: styles.nodeSetup,
  },
  dev: { label: styles.phaseLabelDev, node: styles.nodeDev },
  prep: {
    label: styles.phaseLabelPrep,
    node: styles.nodePrep,
  },
  ci: { label: styles.phaseLabelCi, node: styles.nodeCi },
};

function Connector({ wide }: { wide?: boolean }) {
  return (
    <div className={clsx(styles.connector, wide && styles.connectorWide)}>
      <div className={styles.connectorLine} />
    </div>
  );
}

function NodeCard({
  node,
  delay,
  visible,
}: {
  node: PipelineNode;
  delay: number;
  visible: boolean;
}) {
  const cls = phaseClassMap[node.phase];
  const Icon = node.icon;
  return (
    <div
      className={clsx(styles.nodeWrapper, visible && styles.visible)}
      style={{ transitionDelay: `${delay}ms` }}
    >
      <div className={clsx(styles.node, cls.node)}>
        {node.ci && <span className={styles.ciBadge}>auto</span>}
        <span className={styles.nodeIcon}>
          <Icon size={24} strokeWidth={1.5} />
        </span>
        <span className={styles.nodeCommand}>{node.command}</span>
        <span className={styles.nodeLabel}>{node.label}</span>
      </div>
    </div>
  );
}

/* ── Main component ── */

export default function PipelineSection(): ReactNode {
  const [trackRef, trackVisible] = useVisibleOnScroll<HTMLDivElement>();
  const [branchRef, branchVisible] = useVisibleOnScroll<HTMLDivElement>();

  let globalIndex = 0;

  return (
    <section className={styles.section}>
      <div className="container">
        <h2 className={styles.sectionTitle}>How It Works</h2>
        <p className={styles.sectionSubtitle}>
          From changenote to published release — every step of the pipeline,
          visualized.
        </p>
      </div>

      {/* Main pipeline */}
      <div className={styles.pipelineTrack} ref={trackRef}>
        {PHASES.map((phase, pi) => {
          const elements: ReactNode[] = [];

          // Connector between phase groups
          if (pi > 0) {
            // biome-ignore lint/suspicious/noArrayIndexKey: <>
            elements.push(<Connector key={`gc-${pi}`} wide />);
          }

          elements.push(
            <div className={styles.phaseGroup} key={phase.key}>
              <span
                className={clsx(
                  styles.phaseLabel,
                  phaseClassMap[phase.key].label,
                )}
              >
                {phase.title}
              </span>
              <div className={styles.phaseNodes}>
                {phase.nodes.map((node, ni) => {
                  const delay = globalIndex * 100;
                  globalIndex++;
                  return (
                    <div
                      key={node.id}
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        width: "100%",
                      }}
                    >
                      {ni > 0 && <Connector />}
                      <NodeCard
                        node={node}
                        delay={delay}
                        visible={trackVisible}
                      />
                      {node.subNodes && (
                        <div className={styles.subNodesGroup}>
                          {node.subNodes.map((sub) => {
                            const subDelay = globalIndex * 100;
                            globalIndex++;
                            return (
                              <div
                                key={sub.id}
                                className={clsx(
                                  styles.subNodeWrapper,
                                  trackVisible && styles.visible,
                                )}
                                style={{ transitionDelay: `${subDelay}ms` }}
                              >
                                <div className={styles.subConnectorLine} />
                                <div
                                  className={clsx(
                                    styles.subNode,
                                    phaseClassMap[sub.phase].node,
                                  )}
                                >
                                  {sub.ci && (
                                    <span className={styles.ciBadge}>auto</span>
                                  )}
                                  <span className={styles.nodeIcon}>
                                    <sub.icon size={20} strokeWidth={1.5} />
                                  </span>
                                  <span className={styles.nodeCommand}>
                                    {sub.command}
                                  </span>
                                  <span className={styles.nodeLabel}>
                                    {sub.label}
                                  </span>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>,
          );

          return elements;
        })}
      </div>

      {/* Optional branch nodes */}
      <div className={styles.optionalBranches} ref={branchRef}>
        {OPTIONAL_NODES.map((opt) => {
          const Icon = opt.icon;
          return (
            <div
              key={opt.id}
              className={clsx(
                styles.optionalBranch,
                branchVisible && styles.visible,
              )}
            >
              <span className={styles.branchLabel}>optional</span>
              <div className={styles.branchLine} />
              <div className={styles.nodeOptional}>
                <span className={styles.nodeIcon}>
                  <Icon size={24} strokeWidth={1.5} />
                </span>
                <span className={styles.nodeCommand}>{opt.command}</span>
                <span className={styles.nodeLabel}>{opt.label}</span>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
