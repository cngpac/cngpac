import type { Options } from "@docusaurus/plugin-content-docs";
import type * as PresetClassic from "@docusaurus/preset-classic";
import type { Config } from "@docusaurus/types";
import { themes as prismThemes } from "prism-react-renderer";
import docsVersions from "./docsVersions.json";

// This runs in Node.js - Don't use client-side code here (browser APIs, JSX...)

const config: Config = {
  title: "Cngpac",
  tagline: "A highly configurable package release manager",
  favicon: "img/favicon.ico",

  // Future flags, see https://docusaurus.io/docs/api/docusaurus-config#future
  future: {
    v4: true, // Improve compatibility with the upcoming Docusaurus v4
    faster: true,
  },

  // Set the production url of your site here
  url: "https://cngpac.dev",
  // Set the /<baseUrl>/ pathname under which your site is served
  // For GitHub pages deployment, it is often '/<projectName>/'
  baseUrl: "/",

  // GitHub pages deployment config.
  // If you aren't using GitHub pages, you don't need these.
  organizationName: "cngpac", // Usually your GitHub org/user name.
  projectName: "cngpac", // Usually your repo name.

  onBrokenLinks: "throw",

  // Even if you don't use internationalization, you can use this field to set
  // useful metadata like html lang. For example, if your site is Chinese, you
  // may want to replace "en" with "zh-Hans".
  i18n: {
    defaultLocale: "en",
    locales: ["en"],
  },

  markdown: {
    format: "detect",
  },

  presets: [
    [
      "classic",
      {
        docs: false,
        blog: false,
        theme: {
          customCss: "./src/css/custom.css",
        },
      } satisfies PresetClassic.Options,
    ],
  ],

  plugins: [
    [
      "@docusaurus/plugin-content-docs",
      {
        path: "docs",
        breadcrumbs: true,
        editUrl: ({ versionDocsDirPath, docPath }) =>
          `https://github.com/cngpac/cngpac/edit/main/website/${versionDocsDirPath}/${docPath}`,
        routeBasePath: "docs",
        include: ["**/*.md"],
        exclude: [
          "**/_*.{js,jsx,ts,tsx}",
          "**/_*/**",
          "**/*.test.{js,jsx,ts,tsx}",
          "**/__tests__/**",
        ],
        sidebarPath: "./sidebars.ts",
        versions: docsVersions,
        remarkPlugins: [
          [
            require("@docusaurus/remark-plugin-npm2yarn"),
            {
              sync: true,
              converters: ["pnpm", "bun", "yarn"],
            },
          ],
        ],
      } satisfies Options,
    ],
    [
      "@docusaurus/plugin-content-docs",
      {
        id: "changelogs",
        path: "changelogs",
        routeBasePath: "changelogs",
        include: ["**/*.md"],
        sidebarPath: "./sidebarsChangelogs.ts",
        breadcrumbs: true,
        editUrl: ({ docPath }) =>
          `https://github.com/cngpac/cngpac/edit/main/website/changelogs/${docPath}`,
        async sidebarItemsGenerator({ defaultSidebarItemsGenerator, ...args }) {
          const items = await defaultSidebarItemsGenerator(args);
          return items.reverse();
        },
      } satisfies Options,
    ],
  ],

  themeConfig: {
    // Replace with your project's social card
    image: "img/og-image.png",
    colorMode: {
      respectPrefersColorScheme: true,
    },
    navbar: {
      title: "CNGPAC",
      logo: {
        alt: "Cngpac Logo",
        src: "img/logo.svg",
      },
      items: [
        {
          type: "docSidebar",
          sidebarId: "docsSidebar",
          label: "Docs",
          position: "left",
        },
        {
          type: "docSidebar",
          sidebarId: "changelogsSidebar",
          docsPluginId: "changelogs",
          label: "Changelogs",
          position: "left",
        },
        { to: "/sponsor", label: "Sponsor", position: "left" },
        {
          type: "docsVersionDropdown",
          position: "right",
          dropdownActiveClassDisabled: true,
        },
        {
          href: "https://github.com/cngpac/cngpac",
          label: "GitHub",
          position: "right",
        },
      ],
    },
    footer: {
      style: "dark",
      links: [
        {
          title: "Docs",
          items: [
            {
              label: "Get Started",
              to: "/docs/latest/intro",
            },
          ],
        },
        {
          title: "Community",
          items: [
            {
              label: "Stack Overflow",
              href: "https://stackoverflow.com/questions/tagged/cngpac",
            },
            {
              label: "Discord",
              href: "https://discordapp.com/invite/cngpac",
            },
            {
              label: "X",
              href: "https://x.com/cngpac",
            },
          ],
        },
        {
          title: "More",
          items: [
            {
              label: "GitHub",
              href: "https://github.com/cngpac/cngpac",
            },
          ],
        },
      ],
      copyright: `Copyright © ${new Date().getFullYear()} Cngpac. Built with Docusaurus.`,
    },
    prism: {
      theme: prismThemes.github,
      darkTheme: prismThemes.dracula,
    },
  } satisfies PresetClassic.ThemeConfig,
};

export default config;
