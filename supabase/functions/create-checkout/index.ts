// Temporarily disabled commercial checkout. Re-enable only after verified content,
// deployment, consumer disclosures and end-to-end Stripe webhook test.
// The prior active implementation remains archived in GitHub and Supabase history.
const allowed = new Set([
  "https://app.tubibliadigital.com",
  "https://indexhtml-ar4bkwq9g-juan-daniel-de-gouveia-s-projects.vercel.app",
]);
Deno.serve((req:Request) => {
  const origin=req.headers.get("origin");
  const cors={
    "Access-Control-Allow-Origin": origin && allowed.has(origin) ? origin : "https://app.tubibliadigital.com",
    "Access-Control-Allow-Headers":"authorization,apikey,content-type,x-client-info",
    "Access-Control-Allow-Methods":"POST,OPTIONS","Vary":"Origin",
    "Content-Type":"application/json","Cache-Control":"no-store"
  };
  if(req.method==="OPTIONS")return new Response(null,{status:204,headers:cors});
  if(!origin||!allowed.has(origin))return new Response(JSON.stringify({error:"Origen no autorizado"}),{status:403,headers:cors});
  return new Response(JSON.stringify({error:"La compra no está disponible mientras finalizamos la verificación del contenido y el servicio.",sales_enabled:false}),{status:503,headers:cors});
});
