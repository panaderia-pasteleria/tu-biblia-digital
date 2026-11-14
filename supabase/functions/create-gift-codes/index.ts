// Private administrator Edge Function POST /functions/v1/create-gift-codes
// Requires ADMIN_USER_ID, SUPABASE_SERVICE_ROLE_KEY, SUPABASE_ANON_KEY,
// SUPABASE_URL, APP_ORIGIN. NEVER expose service_role to the frontend.
import {createClient} from "https://esm.sh/@supabase/supabase-js@2";
const url=Deno.env.get("SUPABASE_URL")!, anon=Deno.env.get("SUPABASE_ANON_KEY")!;
const origin=Deno.env.get("APP_ORIGIN")!;
const cors={"Access-Control-Allow-Origin":origin,"Access-Control-Allow-Headers":"authorization,apikey,content-type","Access-Control-Allow-Methods":"POST,OPTIONS","Content-Type":"application/json","Cache-Control":"no-store","Vary":"Origin"};
async function sha256(value:string){const buf=await crypto.subtle.digest("SHA-256",new TextEncoder().encode(value));return [...new Uint8Array(buf)].map(x=>x.toString(16).padStart(2,"0")).join("");}
Deno.serve(async req=>{
 if(req.method==="OPTIONS")return new Response(null,{status:204,headers:cors});
 if(req.method!=="POST"||req.headers.get("origin")!==origin)return new Response("Forbidden",{status:403,headers:cors});
 const token=req.headers.get("authorization")||"";
 if(!token.startsWith("Bearer "))return new Response("Unauthorized",{status:401,headers:cors});
 const client=createClient(url,anon,{global:{headers:{Authorization:token}}});
 const {data:{user}}=await client.auth.getUser();
 if(!user||user.id!==Deno.env.get("ADMIN_USER_ID"))return new Response("Forbidden",{status:403,headers:cors});
 let body:{labels?:unknown};
 try{body=await req.json()}catch{return new Response("Bad request",{status:400,headers:cors})}
 const labels=body.labels;
 if(!Array.isArray(labels)||labels.length===0||labels.length>10||labels.some(x=>typeof x!=="string"||x.length>80))
   return new Response("Invalid labels",{status:400,headers:cors});
 const admin=createClient(url,Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,{auth:{persistSession:false}});
 const response=[];
 for(const rawLabel of labels){
  const code="TBD-"+Array.from(crypto.getRandomValues(new Uint8Array(16))).map(x=>x.toString(16).padStart(2,"0")).join("").toUpperCase();
  const {error}=await admin.from("gift_codes").insert({code_hash:await sha256(code),label:rawLabel.trim()});
  if(error){console.error(error);return new Response("No se pudieron guardar todos los codigos",{status:500,headers:cors});}
  response.push({label:rawLabel.trim(),code});
 }
 return new Response(JSON.stringify({codes:response}),{headers:cors,status:200});
});