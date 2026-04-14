import {
	createChangelogGenerator,
	createFormatter,
	createGitHubReleaser,
	createNpmPublisher,
	defineConfig,
} from "cngpac";

export default defineConfig({
	package: "__PACKAGE__",
	repository: {
		owner: "__OWNER__",
		name: "__REPO__",
	},
	changelog: {
		generator: createChangelogGenerator({
			githubToken: process.env.GITHUB_TOKEN!,
		}),
	},
	// formatters: [
	//   createFormatter({ extensions: ["json", "md"], command: "oxfmt" }),
	// ],
	publishers: [
		createNpmPublisher({
			provenance: true,
		}),
	],
	releasers: [
		createGitHubReleaser({
			token: process.env.GITHUB_TOKEN!,
		}),
	],
});
