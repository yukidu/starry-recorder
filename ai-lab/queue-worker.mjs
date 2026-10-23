/** Internal-only AI smoke consumer; NO public inference. Synthetic content ONLY. */
const MODEL='@cf/meta/llama-3.3-70b-instruct-fp8-fast';
export const DAILY_CAP_MICRO_USD=1000000;
export const MAX_CALLS=10;
export function validJob(job){
 return Boolean(job&&typeof job==='object'&&job.type==='synthetic_text'&&
  typeof job.id==='string'&&/^synthetic-[A-Za-z0-9_-]{8,80}$/.test(job.id)&&
  typeof job.prompt==='string'&&job.prompt.length>0&&job.prompt.length<=120);
}
export async function processSyntheticJob(env,job,day){
 if(!validJob(job)||!/^\d{4}-\d{2}-\d{2}$/.test(day))return {status:'rejected'};
 const reservation=await env.DB.prepare(`INSERT INTO ai_daily_reservations
  (id,usage_day,job_id,model,estimated_micro_usd)
  SELECT ?,?,?,?,?
  WHERE (SELECT COUNT(*) FROM ai_daily_reservations WHERE usage_day=?) < 10
   AND (SELECT COALESCE(SUM(estimated_micro_usd),0)
    FROM ai_daily_reservations WHERE usage_day=?) + ? <= ?
  ON CONFLICT(job_id) DO NOTHING RETURNING id`).bind(crypto.randomUUID(),day,job.id,MODEL,40000,day,day,40000,DAILY_CAP_MICRO_USD).first();
 if(!reservation)return {status:'budget_exhausted'};
 const model=await env.AI.run(MODEL,{
   messages:[{role:'system',content:'Summarize the following synthetic engineering test sentence in Traditional Chinese, briefly.'},
   {role:'user',content:job.prompt}],
   max_tokens:90,temperature:0
 });
 const answer=model?.response??model?.choices?.[0]?.message?.content;
 if(typeof answer!=='string'||answer.length>1000)throw Error('no usable model answer');
 // Store only synthetic text. Nothing in this queue ever accepts real member data.
 await env.DB.prepare(`INSERT INTO ai_synthetic_results(id,answer,status)
  VALUES (?,?,?) ON CONFLICT(id) DO UPDATE SET answer=excluded.answer,status=excluded.status`)
 .bind(job.id,answer,'succeeded').run();
 return {status:'succeeded'};
}
export default {
 async fetch(){
  return new Response('Not found',{status:404,headers:{'Cache-Control':'no-store','X-Robots-Tag':'noindex,nofollow'}});
 },
 async queue(batch,env){
  const day=new Date().toISOString().slice(0,10);
  for(const msg of batch.messages){
   // Do not waste inference on malformed messages; do not retry on hard budget stops.
   if(!validJob(msg.body)){msg.ack();continue;}
   try{
    const status=await processSyntheticJob(env,msg.body,day);
    if(status.status==='succeeded'||status.status==='budget_exhausted'||status.status==='rejected')msg.ack();
    else msg.retry({delaySeconds:600});
   }catch{
    msg.retry({delaySeconds:600}); // consumer max retries + DLQ enforce finite retry.
   }
  }
 }
};