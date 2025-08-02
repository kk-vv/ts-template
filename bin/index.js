#!/usr/bin/env node
const { program } = require('commander')
const path = require('path')
const fs = require('fs-extra')
const prompts = require('prompts');

program
  .version('1.0.0')
  .command('generate')
  .description('Generate a new project from template')
  .action(async () => {

    const answers = await prompts(
      {
        type: 'text',
        name: 'name',
        message: 'Enter project name:',
      },
    );

    const templateSrcDir = path.join(__dirname, '../templates/src');
    const templateConfigsDir = path.join(__dirname, '../templates/configs');
    const outputDir = path.join(process.cwd(), answers.name);
    const outputSrcDir = path.join(outputDir, 'src');

    // Copy templates
    fs.copySync(templateSrcDir, outputSrcDir);
    fs.copySync(templateConfigsDir, outputDir);

        // Replace placeholders
    const processFiles = (dir) => {
      fs.readdirSync(dir).forEach((file) => {
        const filePath = path.join(dir, file);
        const stats = fs.statSync(filePath);

        if (stats.isDirectory()) {
          processFiles(filePath);
        } else if (stats.isFile()) {
          let content = fs.readFileSync(filePath, 'utf8');
          content = content.replace(/__name__/g, answers.name);
          fs.writeFileSync(filePath, content);
        }
      });
    };
    processFiles(outputDir);

    console.log(`Project ${answers.name} generated successfully!`);
  });

program.parse(process.argv);