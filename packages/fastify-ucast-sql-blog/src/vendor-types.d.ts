declare module '@ucast/sql/mikro-orm' {
  export function interpret(condition: any, query: any): any;
}
declare module '@ucast/sql/typeorm' {
  export function interpret(condition: any, query: any): any;
}
declare module 'better-sqlite3' {
  const Database: any;
  export default Database;
}
