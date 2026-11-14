// Lector comercial: solo archivos de texto autorizados en el bucket PRIVADO.
// Desplegar con verify_jwt=true. Nunca devolver URLs firmadas al navegador.
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
const url = Deno.env.get("SUPABASE_URL")!;
const publishable = Deno.env.get("SUPABASE_ANON_KEY")!;
const service = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const origin = Deno.env.get("APP_ORIGIN")!;
const bucket = "tbd-biblia-protegida";
const cors = { "Access-Control-Allow-Origin": origin, "Access-Control-Allow-Headers": "authorization,apikey,content-type,x-client-info", "Access-Control-Allow-Methods": "POST,OPTIONS", "Vary": "Origin" };
const json = (value: unknown, status = 200) => new Response(JSON.stringify(value), {status, headers:{...cors,"Content-Type":"application/json; charset=utf-8","Cache-Control":"no-store"}});
Deno.serve(async req => {
  if(req.method==="OPTIONS") return new Response(null,{status:204,headers:cors});
  if(req.method!=="POST" || req.headers.get("origin")!==origin) return json({error:"Forbidden"},403);
  const bearer=req.headers.get("authorization")||"";
  if(!/^Bearer .+/.test(bearer)) return json({error:"Unauthorized"},401);
  const client=createClient(url,publishable,{global:{headers:{Authorization:bearer}},auth:{persistSession:false}});
  const {data:{user},error:authError}=await client.auth.getUser();
  if(authError||!user) return json({error:"Unauthorized"},401);
  const {data:license,error:licenseError}=await client.from("entitlements").select("user_id").eq("user_id",user.id).maybeSingle();
  if(licenseError) return json({error:"Access check failed"},500);
  if(!license) return json({error:"License required"},403);
  let payload:unknown;
  try { payload=await req.json(); } catch { return json({error:"Invalid JSON"},400); }
  if(!payload||typeof payload!=="object") return json({error:"Invalid request"},400);
  const {book,chapter,language} = payload as Record<string,unknown>;
  // Nunca aceptar una ruta de almacenamiento proporcionada por el cliente.
  if(typeof book!=="string"||!/^[A-Z0-9]{2,12}$/.test(book)||
     typeof language!=="string"||!/^(es|en|pt|it)$/.test(language)||
     !Number.isInteger(chapter)||Number(chapter)<1||Number(chapter)>200) return json({error:"Invalid reference"},400);
  const objectPath=`licensed/${language}/${book}/${chapter}.txt`;
  const admin=createClient(url,service,{auth:{persistSession:false}});
  const {data:file,error:fileError}=await admin.storage.from(bucket).download(objectPath);
  if(fileError||!file) return json({error:"Chapter unavailable"},404);
  if(file.size>1024*1024) return json({error:"Chapter too large"},413);
  const text=await file.text();
  return json({book,chapter,language,text});
});
