/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable no-undef */
import { defineConfig } from "cypress";
import createBundler from "@bahmutov/cypress-esbuild-preprocessor";
import { addCucumberPreprocessorPlugin } from "@badeball/cypress-cucumber-preprocessor";
import createEsbuildPlugin from "@badeball/cypress-cucumber-preprocessor/esbuild";
import fs from "fs-extra";
import path from "path";

// https://filiphric.com/cucumber-in-cypress-a-step-by-step-guide

const fetchConfigurationByFile = async (file: any) => {
  const pathOfConfigurationFile = `./cypress/config/cypress.${file}.json`;

  return (
    file &&
    (await fs.readJson(path.join(__dirname, "./", pathOfConfigurationFile)))
  );
};

async function setupNodeEvents(
  on: Cypress.PluginEvents,
  config: Cypress.PluginConfigOptions,
): Promise<Cypress.PluginConfigOptions> {
  await addCucumberPreprocessorPlugin(on, config);

  on(
    "file:preprocessor",
    createBundler({
      tsconfig: "./tsconfig.json",
      plugins: [createEsbuildPlugin(config)],
    }),
  );

  const environment = config.env.configFile || "development";
  const configurationForEnvironment = await fetchConfigurationByFile(
    environment,
  );
  const _config: Cypress.PluginConfigOptions = {
    ...config,
    ...configurationForEnvironment,
  };

  return _config;
}

export default defineConfig({
  video: false,
  chromeWebSecurity: false,
  screenshotsFolder: "cypress/reports/screenshots",
  videosFolder: "cypress/reports/videos",
  e2e: {
    setupNodeEvents,
    excludeSpecPattern: ["*.js", "*.md"],
    specPattern: "cypress/e2e/**/*.feature",
  },
});
