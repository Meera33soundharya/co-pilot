// Type shims for packages that may not bundle their types correctly
declare module "pdfjs-dist" {
  export const version: string;
  export const GlobalWorkerOptions: { workerSrc: string };
  export function getDocument(src: any): { promise: Promise<any> };
}
declare module "jszip" {
  const JSZip: any;
  export default JSZip;
}
declare module "tesseract.js" {
  export function createWorker(...args: any[]): Promise<any>;
  export function recognize(...args: any[]): Promise<any>;
  export const PSM: Record<string, any>;
  export const OEM: Record<string, any>;
  const tesseract: { recognize: (...args: any[]) => Promise<any>; [key: string]: any };
  export default tesseract;
}
declare module "jspdf" {
  const jsPDF: any;
  export { jsPDF };
  export default jsPDF;
}
declare module "jspdf-autotable" {
  const autoTable: any;
  export default autoTable;
}
declare module "@testing-library/react" {
  export const render: any;
  export const screen: any;
  export const fireEvent: any;
}
declare module "vitest" {
  export const describe: any;
  export const it: any;
  export const expect: any;
  export const test: any;
  export const vi: any;
  export const beforeEach: any;
  export const afterEach: any;
  export const beforeAll: any;
  export const afterAll: any;
}
