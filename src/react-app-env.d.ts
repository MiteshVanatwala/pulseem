/// <reference types="react-scripts" />

// Plain (non-CSS-Module) stylesheets imported for their side effects, e.g.
// `import './css/index.css'`. react-scripts' own react-app.d.ts declares
// '*.module.css' and friends but never the plain form, so there is nothing for
// these imports to resolve to. TypeScript 4.x ignored side-effect-only imports of
// unresolvable modules; 5.x reports TS2882 for them, which is what surfaces in the
// editor (the IDE runs its own newer compiler than the 4.9 the project pins).
declare module '*.css';
declare module '*.scss';
declare module '*.sass';

declare module '@material-ui/core/styles/createBreakpoints' {
  interface BreakpointOverrides {
    sl: true;
  }
}
