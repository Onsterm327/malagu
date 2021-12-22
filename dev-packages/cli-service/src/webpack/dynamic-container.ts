import { Module } from '@malagu/cli-common/lib/package/package-protocol';

export interface DynamicContainerContext {
    registed?: boolean;
    modules: Module[];
    staticModules: Module[];

}

export function generateImports(modules: Module[], fn: 'import' | 'require'): string {
    let targetModules: string[] = [];
    targetModules = modules.map(m => {
        if (fn === 'require') {
            return `Promise.resolve(require('${m.path}'))`;
        }
        return `${fn}('${m.path}')`;
    });
    return targetModules.map(m => `then(function () { return ${m}.then(load) })`).join('.\n');
}

export function loadStaticModuls(modules: Module[]): string {
    return modules.map(m => `container.load(require('${m.path}').default);`).join('\n');
}

export function generateFrontendComponents(context: DynamicContainerContext) {
    const { modules, staticModules, registed } = context;
    return `
  require('reflect-metadata');
  require('setimmediate');
  const { Container } = require('inversify');
  const { FrontendApplication } = require('@malagu/core/lib/browser');
  
  const container = new Container({ skipBaseClassChecks: true });
  
  ${loadStaticModuls(staticModules)}
  
  function load(raw) {
    return Promise.resolve(raw.default).then(module => container.load(module));
  }
  
  module.exports.container = Promise.resolve()
    .${generateImports(modules, 'import')}
    .then(() => container).catch(reason => {
      console.error('Failed to start the frontend application.');
      if (reason) {
        console.error(reason);
      }
    });` + (registed ?
            `if ('serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        const href = document.getElementsByTagName('base')[0].href;
        navigator.serviceWorker.register(href + 'service-worker.js' + '?${new Date().getTime()}').then(registration => {
          console.log('SW registered: ', registration);
        }).catch(registrationError => {
          console.log('SW registration failed: ', registrationError);
        });
      });
    }` : '');
}

export function generateBackendComponents(context: DynamicContainerContext) {
    const { modules, staticModules } = context;
    return `
  require('reflect-metadata');
  const { Container } = require('inversify');
  require('source-map-support').install();
  
  const container = new Container({ skipBaseClassChecks: true });
  
  ${loadStaticModuls(staticModules)}
  
  function load(raw) {
    return Promise.resolve(raw.default).then(module => container.load(module));
  }
  
  module.exports.container = Promise.resolve()
    .${generateImports(modules, 'require')}
    .then(() => container).catch(reason => {
      console.error('Failed to start the backend application.');
      if (reason) {
        console.error(reason);
      }
    });`;
}
