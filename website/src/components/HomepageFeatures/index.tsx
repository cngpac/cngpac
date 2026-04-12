import Heading from "@theme/Heading";
import {
  type LucideIcon,
  Puzzle,
  Rocket,
  Tags,
  TerminalSquare,
} from "lucide-react";
import type { ReactNode } from "react";
import styles from "./styles.module.css";

interface Feature {
  icon: LucideIcon;
  title: string;
  description: string;
}

const FEATURES: Feature[] = [
  {
    icon: Puzzle,
    title: "Plugin Architecture",
    description:
      "Compose your release pipeline from modular plugins — publishers, releasers, changelog generators, formatters, and savers.",
  },
  {
    icon: TerminalSquare,
    title: "CLI + Programmatic API",
    description:
      "Use the interactive CLI for day-to-day work, or import the core functions as a library to build custom tooling.",
  },
  {
    icon: Rocket,
    title: "GitHub Actions Ready",
    description:
      "Auto-generates a CI workflow that triggers versioning when prepare.json lands on main. Zero manual setup.",
  },
  {
    icon: Tags,
    title: "Prerelease Channels",
    description:
      "First-class support for alpha, beta, and RC channels with prepare prerelease. Semantic versioning handled automatically.",
  },
];

export default function HomepageFeatures(): ReactNode {
  return (
    <section className={styles.section}>
      <div className="container">
        <Heading as="h2" className={styles.sectionTitle}>
          Why Cngpac?
        </Heading>
        <p className={styles.sectionSubtitle}>
          Everything you need for professional package releases, nothing you
          don't.
        </p>
      </div>
      <div className={styles.grid}>
        {FEATURES.map((f) => {
          const Icon = f.icon;
          return (
            <article key={f.title} className={styles.card}>
              <span className={styles.cardIcon}>
                <Icon size={32} strokeWidth={1.5} />
              </span>
              <h3 className={styles.cardTitle}>{f.title}</h3>
              <p className={styles.cardDescription}>{f.description}</p>
            </article>
          );
        })}
      </div>
    </section>
  );
}
