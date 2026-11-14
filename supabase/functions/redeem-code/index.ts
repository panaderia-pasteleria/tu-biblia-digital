// Supabase Edge function POST /functions/v1/redeem-code
// Authenticated only. Never put a service role key in a browser.
import {createClient} from "https://esm.sh/@supabase/supabase-js@2";
const url=Deno.env.get("SUPABASE_URL")!,anon=Deno.env.get("SUPABASE_ANON_KEY")!;
const origin=Deno.env.get("APP_ORIGIN")!;
const headers={"Access-Control-Allow-Origin":origin,"Access-Control-Allow-Headers":"authorization,apikey,content-type","Access-Control-Allow-Methods":"OPTIONS,POST","Vary":"Origin","Content-Type":"application/json"};
async function sha256(value:string){const b=await crypto.subtle.digest("SHA-256",new TextEncoder().encode(value));return [...new Uint8Array(b)].map(x=>x.toString(16).padStart(2,"0")).join("");}
Deno.serve(async req=>{
 if(req.method==="OPTIONS")return new Response(null,{headers,status:204});
 if(req.method!=="POST"||req.headers.get("origin")!==origin)return new Response("Forbidden",{status:403,headers});
 const bearer=req.headers.get("authorization")||"";
 if(!bearer.startsWith("Bearer "))return new Response('{"error":"Sesión necesaria"}',{status:401,headers});
 const sb=createClient(url,anon,{global:{headers:{Authorization:bearer}}});
 const {data:{user},error:authErr}=await sb.auth.getUser();
 if(authErr||!user)return new Response('{"error":"Sesión no válida"}',{status:401,headers});
 try{
  const body=await req.json();
  const code=String(body.code||"").trim().toUpperCase().replaceAll(" ","");
  if(!/^TBD-[A-F0-9]{32}$/.test(code))return new Response('{"ok":false}',{status:400,headers});
  const hash=await sha256(code);
  const {data,error}=await sb.rpc("redeem_gift",{p_code_hash:hash});
  if(error){console.error(error);return new Response('{"error":"No se pudo validar"}',{status:500,headers});}
  return new Response(JSON.stringify({ok:data===true}),{headers});
 }catch(e){console.error(e);return new Response('{"error":"Solicitud no válida"}',{status:400,headers});}
});