import { existsSync } from "node:fs";
import { join, relative } from "node:path";
import * as p from "@clack/prompts";
import { type ChangenoteMetadata, loadConfig, writeChangenote } from "cngpac";
import { CHANGENOTE_BODY_PLACEHOLDER, CONFIG_FILE_NAME } from "../../const";

export async function changeCommand(
  argBump?: string,
  argTitle?: string,
): Promise<void> {
  const rootDir = process.cwd();

  p.intro("Adding a new changenote!");

  let bump: "patch" | "minor" | "major";

  if (argBump && ["patch", "minor", "major"].includes(argBump)) {
    bump = argBump as "patch" | "minor" | "major";
  } else {
    const selected = await p.select({
      message: "Bump type?",
      options: [
        { value: "patch" as const, label: "patch", hint: "Bug fixes" },
        { value: "minor" as const, label: "minor", hint: "New features" },
        { value: "major" as const, label: "major", hint: "Breaking changes" },
      ],
    });

    if (p.isCancel(selected)) {
      p.cancel("Cancelled");
      process.exit(0);
    }
    bump = selected;
  }

  let title: string;

  if (argTitle) {
    title = argTitle;
  } else {
    const text = await p.text({
      message: "Title of the change?",
      placeholder: "feat: Short description of what changed...",
      validate: (val) => (val?.trim() ? undefined : "Title is required"),
    });

    if (p.isCancel(text)) {
      p.cancel("Cancelled");
      process.exit(0);
    }
    title = text;
  }

  let generateNoteName = defaultGenerateNoteName;
  try {
    const config = await loadConfig(join(rootDir, CONFIG_FILE_NAME));
    if (config.noteNameGenerator) {
      generateNoteName = config.noteNameGenerator;
    }
  } catch {}

  const changenotesDir = join(rootDir, ".changenotes");
  let noteName = generateNoteName();
  let nameFound = !existsSync(join(changenotesDir, `${noteName}.md`));
  for (let i = 1; i < 10 && !nameFound; i++) {
    noteName = generateNoteName();
    nameFound = !existsSync(join(changenotesDir, `${noteName}.md`));
  }

  if (!nameFound) {
    p.cancel(
      "ERROR: Failed to generate a unique changenote name after 10 attempts.",
    );
    process.exit(1);
  }

  const frontmatter: ChangenoteMetadata = { bump };

  const csPath = await writeChangenote(
    changenotesDir,
    noteName,
    frontmatter,
    title,
    CHANGENOTE_BODY_PLACEHOLDER,
  );

  p.log.success(`Changenote added! ${relative(rootDir, csPath)}`);
  p.log.step("Add a body if needed.");
  p.log.step(`Stage your changes.`);
  p.outro("Run `cngpac commit` when ready to commit.");
}

export function defaultGenerateNoteName(): string {
  const adjectives = [
    "brave",
    "calm",
    "dark",
    "eager",
    "fair",
    "gentle",
    "happy",
    "icy",
    "jolly",
    "keen",
    "lively",
    "merry",
    "noble",
    "odd",
    "proud",
    "quick",
    "rare",
    "shy",
    "tall",
    "warm",
  ];
  const colors = [
    "amber",
    "azure",
    "coral",
    "crimson",
    "ember",
    "fern",
    "frost",
    "gold",
    "jade",
    "lemon",
    "lilac",
    "maple",
    "ocean",
    "onyx",
    "pearl",
    "rose",
    "ruby",
    "sage",
    "slate",
    "teal",
  ];
  const nouns = [
    "fox",
    "bear",
    "deer",
    "wolf",
    "hawk",
    "lynx",
    "owl",
    "pike",
    "crow",
    "dove",
    "frog",
    "goat",
    "hare",
    "ibis",
    "jay",
    "kite",
    "lark",
    "mole",
    "newt",
    "orca",
  ];

  const adj = adjectives[Math.floor(Math.random() * adjectives.length)];
  const color = colors[Math.floor(Math.random() * colors.length)];
  const noun = nouns[Math.floor(Math.random() * nouns.length)];

  return `${adj}-${color}-${noun}`;
}
