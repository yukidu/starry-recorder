import test from 'node:test';
import assert from 'node:assert/strict';
import worker,{validJob,processSyntheticJob} from './queue-worker.mjs';
test('public AI worker always rejects requests, including health routes',async()=>{
 const env={AI:{run(){throw Error('Should not execute')}}};
 const r=await worker.fetch(new Request('https://invalid.example/ai?prompt=hello'),env);
 assert.equal(r.status,404);
});
test('only explicitly synthetic bounded queue jobs are permitted',()=>{
 assert.equal(validJob({type:'synthetic_text',id:'synthetic-abcdefgh',prompt:'Water matters.'}),true);
 for(const data of [
  {type:'real_user',id:'synthetic-abcdefgh',prompt:'Bad'},
  {type:'synthetic_text',id:'user-real-member',prompt:'Bad'},
  {type:'synthetic_text',id:'synthetic-abcdefgh',prompt:'x'.repeat(121)}
 ])assert.equal(validJob(data),false);
});
test('D1 budget reservation happens before invoking Workers AI',async()=>{
 const calls=[];
 const env={
  DB:{prepare(sql){return{bind(...args){calls.push({sql,args});return this;},
   async first(){return{id:'one'};},
   async run(){return {meta:{changes:1}};}}}},
  AI:{async run(model,payload){calls.push({model,payload});return{response:'水的重要性'};}}
 };
 const out=await processSyntheticJob(env,{type:'synthetic_text',id:'synthetic-abcdefgh',prompt:'Water matters.'},'2026-10-24');
 assert.equal(out.status,'succeeded');
 assert.match(calls[0].sql,/ai_daily_reservations/);
 assert.equal(calls[1].model,'@cf/meta/llama-3.3-70b-instruct-fp8-fast');
 assert.match(calls[2].sql,/ai_synthetic_results/);
});
test('budget stop prevents any AI call',async()=>{
 const env={DB:{prepare(){return{bind(){return this;},async first(){return null;}}}},
  AI:{async run(){throw Error('budget bypass')}}};
 const r=await processSyntheticJob(env,{type:'synthetic_text',id:'synthetic-abcdefgh',prompt:'Water matters.'},'2026-10-24');
 assert.equal(r.status,'budget_exhausted');
});
