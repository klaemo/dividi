#!/usr/bin/env node

const fs = require("fs-extra");
const path = require("path");
const replace = require("replace-in-file");

const DRY_RUN = false;

const lang = process.argv[2];

if (!lang) {
  console.error("Please specify a language!");
  process.exit(1);
}

const siteDir = path.join(process.cwd(), "site");
const targetDir = path.join(siteDir, lang);
const templateDir = path.join(__dirname, "new-language-template");

async function main() {
  // check if site directory exists
  await fs.stat(siteDir);

  try {
    await fs.stat(targetDir);
    console.error(`Error: "${lang}" already exists in ${targetDir}.`);
    process.exit(1);
  } catch (error) {}

  const appMessagesPath = path.join(siteDir, "_data", "app_messages.json");
  const appMessages = JSON.parse(await fs.readFile(appMessagesPath));
  const newAppMessages = { ...appMessages, [lang]: appMessages.en };
  const i18nConfigPath = path.join(siteDir, "_data", "i18n.json");
  const i18nConfig = JSON.parse(await fs.readFile(i18nConfigPath));
  const newI18nConfig = {
    ...i18nConfig,
    enabled_languages: [
      ...i18nConfig.enabled_languages,
      { code: lang, icon: lang },
    ],
  };

  if (!DRY_RUN) {
    await Promise.all([
      fs.copy(templateDir, targetDir),
      fs.writeFile(
        appMessagesPath,
        JSON.stringify(newAppMessages, null, 2) + "\n"
      ),
      fs.writeFile(
        i18nConfigPath,
        JSON.stringify(newI18nConfig, null, 2) + "\n"
      ),
    ]);
    await fs.move(
      path.join(targetDir, "lang.json"),
      path.join(targetDir, `${lang}.json`)
    );
    await replace({
      files: path.join(targetDir, "**", "*"),
      from: /\$\{lang\}/g,
      to: lang,
    });
  }

  console.log(`\nCongratulation! You can now start translating ${lang}.`);
  console.log(
    `Visit http://localhost:8080/${lang} to preview your translation.`
  );
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
