import{c as n,z as o,n as k,a as s}from"./index-DZqy4yq5.js";import{c as t,u,a as c}from"./query-DCM8V-cX.js";/**
 * @license lucide-react v0.395.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const d=n("BookmarkCheck",[["path",{d:"m19 21-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2Z",key:"169p4p"}],["path",{d:"m9 10 2 2 4-4",key:"1gnqz4"}]]);/**
 * @license lucide-react v0.395.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const q=n("DollarSign",[["line",{x1:"12",x2:"12",y1:"2",y2:"22",key:"7eqyqh"}],["path",{d:"M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6",key:"1b0p4s"}]]),p=(e={})=>t({queryKey:["jobs",e],queryFn:async()=>{const a=new URLSearchParams;return Object.entries(e).forEach(([y,r])=>{r!=null&&r!==""&&a.append(y,String(r))}),(await s.get(`/jobs?${a.toString()}`)).data},staleTime:2*60*1e3}),l=e=>t({queryKey:["job",e],queryFn:async()=>(await s.get(`/jobs/${e}`)).data.data.job,enabled:!!e}),g=()=>{const e=u();return c({mutationFn:async a=>(await s.post("/bookmarks",{jobId:a})).data,onSuccess:()=>{e.invalidateQueries({queryKey:["bookmarks"]}),e.invalidateQueries({queryKey:["jobs"]}),o.success("Job saved")},onError:a=>o.error(k(a))})},h=()=>{const e=u();return c({mutationFn:async a=>{await s.delete(`/bookmarks/${a}`)},onSuccess:()=>{e.invalidateQueries({queryKey:["bookmarks"]}),e.invalidateQueries({queryKey:["jobs"]}),o.success("Job removed from saved")}})},j=()=>t({queryKey:["bookmarks"],queryFn:async()=>(await s.get("/bookmarks")).data.data.bookmarks});export{d as B,q as D,l as a,g as b,h as c,j as d,p as u};
