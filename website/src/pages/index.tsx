import Link from "@docusaurus/Link";
import useDocusaurusContext from "@docusaurus/useDocusaurusContext";
import ConfigShowcase from "@site/src/components/ConfigShowcase";
import HomepageFeatures from "@site/src/components/HomepageFeatures";
import PipelineSection from "@site/src/components/PipelineSection";
import Heading from "@theme/Heading";
import Layout from "@theme/Layout";
import { Check, Copy } from "lucide-react";
import { type ReactNode, useCallback, useState } from "react";
import styles from "./index.module.css";

function HeroSection() {
  const { siteConfig } = useDocusaurusContext();
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText("npx cngpac init");
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, []);

  return (
    <header className={styles.hero}>
      <div className={styles.heroInner}>
        <Heading as="h1" className={styles.heroTitle}>
          {siteConfig.title}
        </Heading>
        <p className={styles.heroTagline}>{siteConfig.tagline}</p>

        <button
          type="button"
          className={styles.installBox}
          onClick={handleCopy}
          title="Click to copy"
        >
          <span className={styles.installPrompt}>$</span>
          <span className={styles.installCmd}>npx cngpac init</span>
          <span className={styles.installCopy}>
            {copied ? <Check size={16} /> : <Copy size={16} />}
          </span>
        </button>

        <div className={styles.heroButtons}>
          <Link className={styles.btnPrimary} to="/docs/latest/intro">
            Get Started →
          </Link>
          <Link
            className={styles.btnSecondary}
            href="https://github.com/cngpac/cngpac"
          >
            GitHub ↗
          </Link>
        </div>
      </div>
    </header>
  );
}

function CTASection() {
  return (
    <section className={styles.cta}>
      <div className={styles.ctaInner}>
        <h2 className={styles.ctaTitle}>Ready to ship?</h2>
        <p className={styles.ctaText}>
          Set up Cngpac in under a minute and start managing releases like a
          pro.
        </p>
        <div className={styles.heroButtons}>
          <Link className={styles.btnPrimary} to="/docs/latest/intro">
            Read the Docs →
          </Link>
          <Link
            className={styles.btnSecondary}
            href="https://www.npmjs.com/package/cngpac"
          >
            View on npm ↗
          </Link>
        </div>
      </div>
    </section>
  );
}

export default function Home(): ReactNode {
  const { siteConfig } = useDocusaurusContext();
  return (
    <Layout
      title={siteConfig.title}
      description="A highly configurable package release manager for npm. Changenotes, semantic versioning, changelog generation, npm publishing, and GitHub releases — all from a single config file."
    >
      <HeroSection />
      <main>
        <PipelineSection />
        <HomepageFeatures />
        <ConfigShowcase />
        <CTASection />
      </main>
    </Layout>
  );
}
