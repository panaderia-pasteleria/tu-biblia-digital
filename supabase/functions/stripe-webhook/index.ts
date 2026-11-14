// Supabase Edge function: POST /functions/v1/stripe-webhook
// PUBLIC endpoint: verify Stripe-Signature against STRIPE_WEBHOOK_SECRET before processing.
// Required secrets: STRIPE_SECRET_KEY, STRIPE_WEBHOOK_SECRET, STRIPE_PRICE_ID,
// SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY.
import Stripe from "https://esm.sh/stripe@17.7.0?target=denonext";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
const stripe=new Stripe(Deno.env.get("STRIPE_SECRET_KEY")!,{apiVersion:"2024-12-18.acacia"});
const secret=Deno.env.get("STRIPE_WEBHOOK_SECRET")!;
const priceId=Deno.env.get("STRIPE_PRICE_ID")!;
const admin=createClient(Deno.env.get("SUPABASE_URL")!,Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,{auth:{persistSession:false}});
Deno.serve(async req=>{
 if(req.method!=="POST")return new Response("Method not allowed",{status:405});
 const sig=req.headers.get("stripe-signature");
 if(!sig)return new Response("Missing signature",{status:400});
 let event:Stripe.Event;
 try{event=await stripe.webhooks.constructEventAsync(await req.text(),sig,secret);}
 catch(e){console.error("Signature invalid",e);return new Response("Bad signature",{status:400});}
 if(event.type!=="checkout.session.completed"&&event.type!=="checkout.session.async_payment_succeeded")
   return new Response("Ignored",{status:200});
 const incoming=event.data.object as Stripe.Checkout.Session;
 try{
  // Retrieve from Stripe rather than relying on user-submitted callback parameters.
  const session=await stripe.checkout.sessions.retrieve(incoming.id,{expand:["line_items"]});
  if(session.mode!=="payment"||session.payment_status!=="paid")
    return new Response("Awaiting payment",{status:200});
  const userId=session.metadata?.supabase_user_id;
  if(!userId||session.client_reference_id!==userId)
    return new Response("Missing binding",{status:422});
  const items=session.line_items?.data||[];
  if(items.length!==1||items[0]?.price?.id!==priceId||items[0]?.quantity!==1)
    return new Response("Wrong product",{status:422});
  const {data:authUser,error:authError}=await admin.auth.admin.getUserById(userId);
  if(authError||!authUser.user)return new Response("Unknown user",{status:422});
  // Stripe retries are safe: unique session ID and user_id in database.
  const {error}=await admin.from("entitlements").upsert({
    user_id:userId,access_kind:"stripe",stripe_checkout_session_id:session.id,updated_at:new Date().toISOString()
  },{onConflict:"user_id"});
  if(error)throw error;
  await admin.from("stripe_events").upsert({event_id:event.id},{onConflict:"event_id"});
  return new Response("OK",{status:200});
 }catch(e){console.error("Webhook error",e);return new Response("Retry",{status:500});}
});
