// Supabase Edge function: POST /functions/v1/create-checkout
// Secrets: STRIPE_SECRET_KEY, STRIPE_PRICE_ID, SUPABASE_URL, SUPABASE_ANON_KEY
// Price ID MUST be the verified 2,99€ one-time price. Never accept client prices.
import Stripe from "https://esm.sh/stripe@17.7.0?target=denonext";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY")!, { apiVersion: "2024-12-18.acacia" });
const supabaseUrl=Deno.env.get("SUPABASE_URL")!;
const anon=Deno.env.get("SUPABASE_ANON_KEY")!;
const priceId=Deno.env.get("STRIPE_PRICE_ID")!;
const appOrigin=Deno.env.get("APP_ORIGIN")!; // e.g. https://app.tubibliadigital.com
const cors={"Access-Control-Allow-Origin":appOrigin,"Access-Control-Allow-Headers":"authorization,apikey,content-type","Access-Control-Allow-Methods":"POST,OPTIONS","Vary":"Origin"};
Deno.serve(async req=>{
 if(req.method==="OPTIONS")return new Response(null,{status:204,headers:cors});
 if(req.method!=="POST"||req.headers.get("origin")!==appOrigin)return new Response("Forbidden",{status:403,headers:cors});
 try{
 const authHeader=req.headers.get("Authorization")||"";
 if(!authHeader.startsWith("Bearer "))return new Response("Unauthorized",{status:401,headers:cors});
 const supa=createClient(supabaseUrl,anon,{global:{headers:{Authorization:authHeader}}});
 const {data:{user},error}=await supa.auth.getUser();
 if(error||!user?.id||!user.email)return new Response("Unauthorized",{status:401,headers:cors});
 const {data:access,error:accessError}=await supa.from("entitlements").select("user_id").eq("user_id",user.id).maybeSingle();
 if(accessError)throw accessError;
 if(access)return new Response(JSON.stringify({already_active:true}),{headers:{...cors,"content-type":"application/json"}});
 const session=await stripe.checkout.sessions.create({
 mode:"payment",
 automatic_tax:{enabled:true},
 billing_address_collection:"required",
 line_items:[{price:priceId,quantity:1}],
 customer_email:user.email,
 client_reference_id:user.id,
 metadata:{supabase_user_id:user.id,product:"tu_biblia_digital"},
 payment_intent_data:{metadata:{supabase_user_id:user.id,product:"tu_biblia_digital"}},
 success_url:`${appOrigin}/comercial/checkout-exito.html?session_id={CHECKOUT_SESSION_ID}`,
 cancel_url:`${appOrigin}/comercial/checkout-cancelado.html`,
 allow_promotion_codes:false
 });
 return new Response(JSON.stringify({url:session.url}),{headers:{...cors,"content-type":"application/json"}});
 }catch(e){console.error(e);return new Response("Server error",{status:500,headers:cors});}
});
