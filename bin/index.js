#!/usr/bin/env node
const { program } = require('commander')
const path = require('path')
const fs = require('fs-extra')
const prompts = require('prompts');

program
  .version('1.1.0')
  .command('create')
  .description('Create a new project from template')
  .action(async () => {

    const answers = await prompts(
      {
        type: 'text',
        name: 'name',
        message: 'Enter project name:',
      },
    );

    const name = answers.name.trim()

    const templateSrcDir = path.join(__dirname, '../templates/src');
    const templateConfigsDir = path.join(__dirname, '../templates/configs');
    const outputDir = path.join(process.cwd(), name);
    const outputSrcDir = path.join(outputDir, 'src');

    // Copy templates
    fs.copySync(templateSrcDir, outputSrcDir, { filter: () => true });
    fs.copySync(templateConfigsDir, outputDir, { filter: () => true });

        // Replace placeholders
    const processFiles = (dir) => {
      fs.readdirSync(dir).forEach((file) => {
        const filePath = path.join(dir, file);
        const stats = fs.statSync(filePath);

        if (stats.isDirectory()) {
          processFiles(filePath);
        } else if (stats.isFile()) {
          let content = fs.readFileSync(filePath, 'utf8');
          content = content.replace(/__name__/g, name);
          fs.writeFileSync(filePath, content);
        }
      });
    };
    processFiles(outputDir);

    // Rename .gitignore.template to .gitignore, because NPM will discard .gitignore file
    const gitignoreTemplatePath = path.join(outputDir, '.gitignore.template');
    const gitignorePath = path.join(outputDir, '.gitignore');
    if (fs.existsSync(gitignoreTemplatePath)) {
      fs.renameSync(gitignoreTemplatePath, gitignorePath);
    }

    console.log(`Project ${name} created successfully!`);
  });

program.parse(process.argv);