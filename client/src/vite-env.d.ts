/// <reference types="vite/client" />

declare module "*.ttf?arraybuffer" {
  const src: ArrayBuffer;
  export default src;
}
