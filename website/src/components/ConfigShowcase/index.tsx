import CodeBlock from "@theme/CodeBlock";
import type { ReactNode } from "react";
import styles from "./styles.module.css";

const CONFIG_CODE = `import {
  createChangelogGenerator,
  createNpmPublisher,
  createGitHubReleaser,
  defineConfig,
} from "cngpac";

export default defineConfig({
  package: "package.json",
  repository: {
    owner: "your-org",
    name: "your-repo",
  },
  changelog: {
    generator: createChangelogGenerator({
      githubToken: process.env.GITHUB_TOKEN!,
    }),
  },
  publishers: [
    createNpmPublisher({ provenance: true }),
  ],
  releasers: [
    createGitHubReleaser({
      token: process.env.GITHUB_TOKEN!,
    }),
  ],
});`;

const HIGHLIGHTS = [
  "Declarative config with full TypeScript support",
  "Composable plugin system — add only what you need",
  "Template variables & dynamic file paths",
  "Works with npm, pnpm, yarn, and bun",
];

export default function ConfigShowcase(): ReactNode {
  return (
    <section className={styles.section}>
      <div className={styles.inner}>
        <div className={styles.description}>
          <h2 className={styles.sectionTitle}>
            Configure Once, Release Forever
          </h2>
          <p className={styles.sectionText}>
            A single <code>cngpac.config.ts</code> file defines your entire
            release pipeline — changelog generation, npm publishing, GitHub
            releases, and formatting.
          </p>
          <ul className={styles.highlights}>
            {HIGHLIGHTS.map((h) => (
              <li key={h} className={styles.highlight}>
                <span className={styles.highlightDot} />
                {h}
              </li>
            ))}
          </ul>
        </div>
        <div className={styles.codeWrapper}>
          <div className={styles.codeHeader}>
            <span className={`${styles.codeDot} ${styles.codeDotRed}`} />
            <span className={`${styles.codeDot} ${styles.codeDotYellow}`} />
            <span className={`${styles.codeDot} ${styles.codeDotGreen}`} />
            <span className={styles.codeFileName}>cngpac.config.ts</span>
          </div>
          <div className={styles.codeBody}>
            <CodeBlock language="typescript">{CONFIG_CODE}</CodeBlock>
          </div>
        </div>
      </div>
    </section>
  );
}
