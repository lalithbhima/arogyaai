import { AnswerMap, Condition } from "../types/assistant";

export function check(cond: Condition, a: AnswerMap): boolean {
  if ("anyOf" in cond) return cond.anyOf.some(k => truthy(a[k]));
  if ("allOf" in cond) return cond.allOf.every(k => truthy(a[k]));
  if ("eq"   in cond) { const [k,v] = cond.eq;  return a[k] === v; }
  if ("in"   in cond) { const [k,vs]= cond.in;  return vs.includes(a[k]); }
  if ("gte"  in cond) { const [k,n] = cond.gte; return num(a[k]) >= n; }
  if ("lte"  in cond) { const [k,n] = cond.lte; return num(a[k]) <= n; }
  if ("regex"in cond) { const [k,p] = cond.regex; return new RegExp(p,"i").test(String(a[k]??"")); }
  return true;
}
const truthy = (v:any)=> !(v===undefined||v===null||v===""||v===false);
const num = (v:any)=> Number(v ?? 0);
