import gulp from 'gulp';
import { rm } from 'node:fs/promises';
import { build as viteBuild } from 'vite';

const { series } = gulp;

async function clean() {
  await rm('dist', { recursive: true, force: true });
}

async function frontend() {
  await viteBuild();
}

export const build = series(clean, frontend);
export default build;
