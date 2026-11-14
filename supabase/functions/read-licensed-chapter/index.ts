// Lector comercial: solo archivos de texto autorizados en el bucket PRIVADO.
// Desplegar con verify_jwt=true. Nunca devolver URLs firmadas al navegador.
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
const url = Deno.env.get("SUPABASE_URL")!;
const publishable = Deno.env.get("SUPABASE_ANON_KEY")!;
const service = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const origin = Deno.env.get("APP_ORIGIN")!;
const bucket = "tbd-biblia-protegida";
const previewOrigin = "https://indexhtml-ar4bkwq9g-juan-daniel-de-gouveia-s-projects.vercel.app";
const allowedOrigins = new Set([origin, previewOrigin]);
const corsFor = (requestOrigin: string | null) => ({ "Access-Control-Allow-Origin": requestOrigin && allowedOrigins.has(requestOrigin) ? requestOrigin : origin, "Access-Control-Allow-Headers": "authorization,apikey,content-type,x-client-info", "Access-Control-Allow-Methods": "POST,OPTIONS", "Vary": "Origin" });
const json = (value: unknown, status = 200, requestOrigin: string | null = null) => new Response(JSON.stringify(value), {status, headers:{...corsFor(requestOrigin),"Content-Type":"application/json; charset=utf-8","Cache-Control":"no-store"}});
Deno.serve(async req => {
  const requestOrigin = req.headers.get("origin");
  if(req.method==="OPTIONS") return new Response(null,{status:204,headers:corsFor(requestOrigin)});
  if(req.method!=="POST" || !requestOrigin || !allowedOrigins.has(requestOrigin)) return json({error:"Forbidden"},403,requestOrigin);
  const reply = (value: unknown, status = 200) => json(value,status,requestOrigin);
  const bearer=req.headers.get("authorization")||"";
  if(!/^Bearer .+/.test(bearer)) return reply({error:"Unauthorized"},401);
  const client=createClient(url,publishable,{global:{headers:{Authorization:bearer}},auth:{persistSession:false}});
  const {data:{user},error:authError}=await client.auth.getUser();
  if(authError||!user) return reply({error:"Unauthorized"},401);
  const {data:license,error:licenseError}=await client.from("entitlements").select("user_id").eq("user_id",user.id).maybeSingle();
  if(licenseError) return reply({error:"Access check failed"},500);
  if(!license) return reply({error:"License required"},403);
  let payload:unknown;
  try { payload=await req.json(); } catch { return reply({error:"Invalid JSON"},400); }
  if(!payload||typeof payload!=="object") return reply({error:"Invalid request"},400);
  const {book,chapter,language} = payload as Record<string,unknown>;
  // Nunca aceptar una ruta de almacenamiento proporcionada por el cliente.
  if(typeof book!=="string"||!/^[A-Z0-9]{2,12}$/.test(book)||
     typeof language!=="string"||!/^(es|en|pt|it)$/.test(language)||
     !Number.isInteger(chapter)||Number(chapter)<1||Number(chapter)>200) return reply({error:"Invalid reference"},400);
  const admin=createClient(url,service,{auth:{persistSession:false}});
  // Edición católica completa en inglés: textos CC0 importados en Postgres;
  // el cliente nunca recibe permisos directos sobre esta tabla.
  if(language==="en") {
    const {data:row,error:chapterError}=await admin.from("bible_chapters")
      .select("text,source_edition").eq("language","en").eq("book_id",book)
      .eq("chapter",chapter).maybeSingle();
    if(chapterError)return reply({error:"Chapter storage error"},500);
    if(row)return reply({book,chapter,language,text:row.text,edition:row.source_edition});
  }
  const objectPath=`licensed/${language}/${book}/${chapter}.txt`;
  const {data:file,error:fileError}=await admin.storage.from(bucket).download(objectPath);
  if(fileError||!file) return reply({error:"Chapter unavailable"},404);
  if(file.size>1024*1024) return reply({error:"Chapter too large"},413);
  const text=await file.text();
  return reply({book,chapter,language,text});
});
