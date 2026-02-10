#!/usr/bin/env node

const fs = require('fs/promises')
const path = require('path')

const projectRoot = process.cwd()
const firmwareBinDir = path.join(projectRoot, 'public', 'firmware', 'bin')
const outputPath = path.join(projectRoot, 'public', 'firmware', 'firmware-list.json')

function toItem(fileName) {
  return {
    name: fileName,
    label: fileName.replace(/\.bin$/i, ''),
    url: `/firmware/bin/${encodeURIComponent(fileName)}`
  }
}

async function generateFirmwareList() {
  let files = []

  try {
    const entries = await fs.readdir(firmwareBinDir, { withFileTypes: true })
    files = entries
      .filter(entry => entry.isFile() && entry.name.toLowerCase().endsWith('.bin'))
      .map(entry => entry.name)
      .sort((a, b) => a.localeCompare(b, 'zh-Hans-CN'))
  } catch (error) {
    if (error && error.code !== 'ENOENT') {
      throw error
    }
  }

  const payload = {
    generatedAt: new Date().toISOString(),
    items: files.map(toItem)
  }

  await fs.mkdir(path.dirname(outputPath), { recursive: true })
  await fs.writeFile(outputPath, JSON.stringify(payload, null, 2) + '\n', 'utf8')
  console.log(`Generated ${path.relative(projectRoot, outputPath)} with ${payload.items.length} item(s).`)
}

generateFirmwareList().catch(error => {
  console.error('Failed to generate firmware list:', error)
  process.exit(1)
})
