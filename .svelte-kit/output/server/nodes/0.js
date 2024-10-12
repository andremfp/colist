import * as universal from '../entries/pages/_layout.ts.js';

export const index = 0;
let component_cache;
export const component = async () => component_cache ??= (await import('../entries/pages/_layout.svelte.js')).default;
export { universal };
export const universal_id = "src/routes/+layout.ts";
export const imports = ["_app/immutable/nodes/0.Cbe5idmn.js","_app/immutable/chunks/entry.DQhsLhOf.js","_app/immutable/chunks/scheduler.BRxxf2Ee.js","_app/immutable/chunks/index.DvX7goLC.js","_app/immutable/chunks/darkModeStore.B199Dr4D.js","_app/immutable/chunks/auth.ma2iFnjY.js","_app/immutable/chunks/firebase.BINCdQve.js","_app/immutable/chunks/stores.BMhX1clH.js"];
export const stylesheets = ["_app/immutable/assets/0.BNu_eYly.css"];
export const fonts = ["_app/immutable/assets/remixicon.BCkO1-UF.woff2","_app/immutable/assets/remixicon.IHD7miHF.woff","_app/immutable/assets/remixicon.KtvQcpfP.ttf","_app/immutable/assets/roboto-flex-cyrillic-ext-400-normal.Dy_fbCN1.woff2","_app/immutable/assets/roboto-flex-cyrillic-ext-400-normal.CYz-UdWe.woff","_app/immutable/assets/roboto-flex-cyrillic-400-normal.Byl5Asvg.woff2","_app/immutable/assets/roboto-flex-cyrillic-400-normal.ze0jS65n.woff","_app/immutable/assets/roboto-flex-greek-400-normal.DZ9SzitG.woff2","_app/immutable/assets/roboto-flex-greek-400-normal.CofrapJu.woff","_app/immutable/assets/roboto-flex-vietnamese-400-normal.Dlb1GyV4.woff2","_app/immutable/assets/roboto-flex-vietnamese-400-normal.BRDdhb9g.woff","_app/immutable/assets/roboto-flex-latin-ext-400-normal.CW32tKl8.woff2","_app/immutable/assets/roboto-flex-latin-ext-400-normal.LdXRH_c-.woff","_app/immutable/assets/roboto-flex-latin-400-normal.C-fvaPBU.woff2","_app/immutable/assets/roboto-flex-latin-400-normal.Bwz-7M7w.woff"];
