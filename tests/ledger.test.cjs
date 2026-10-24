const {test} = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const core = require('../www/ledger-core.js');
const base = () => ({people:[{id:'p1',name:'Amit'}],entries:[{id:'e1',personId:'p1',type:'gave',amount:500,ts:1700000000000}],settings:{currency:'₹'}});
test('reads existing funds_v1 records without a migration or ID change',()=>{
  const d=core.parse(JSON.stringify(base())); assert.equal(d.entries[0].amount,500); assert.equal(d.entries[0].reason,''); assert.equal(d.people[0].id,'p1');
});
test('older note fields survive restore',()=>{const d=base();d.entries[0].note='old note';assert.equal(core.validate(d).entries[0].reason,'old note');});
test('money calculation settles decimal payments exactly',()=>{
 const d=base();d.entries[0].amount=0.1;
 d.entries.push({id:'e2',personId:'p1',type:'gave',amount:0.2,ts:1700000000000},{id:'e3',personId:'p1',type:'got',amount:0.3,ts:1700000000000});
 assert.equal(core.balance(core.validate(d),'p1'),0);assert.deepEqual(core.totals(d),{recv:0,pay:0});
});
test('borrowing and repayment produce the right pay/receive totals',()=>{
 const d=base();d.entries[0].type='got';assert.deepEqual(core.totals(d),{recv:0,pay:500});d.entries[0].type='gave';assert.deepEqual(core.totals(d),{recv:500,pay:0});
});
for(const amount of [0,-1,Infinity,NaN,'500',0.001,1.234,Number.MAX_SAFE_INTEGER])test('rejects invalid amount '+String(amount),()=>assert.throws(()=>core.minor(amount)));
for(const [label,mutate] of [
 ['missing person',d=>d.entries[0].personId='missing'],
 ['duplicate entry',d=>d.entries.push({...d.entries[0]})],
 ['duplicate person',d=>d.people.push({...d.people[0]})],
 ['unknown type',d=>d.entries[0].type='receive'],
 ['invalid date',d=>d.entries[0].ts='yesterday'],
 ['empty name',d=>d.people[0].name=' '],
 ['invalid settings',d=>d.settings=[]],
 ['object note',d=>d.entries[0].reason={}]
])test('rejects '+label,()=>{const d=base();mutate(d);assert.throws(()=>core.validate(d));});
test('validation never mutates the supplied ledger',()=>{const d=base(),before=JSON.stringify(d);core.validate(d);assert.equal(JSON.stringify(d),before);});
test('shared ledger validation and exact balances',()=>{
 const d=core.shared({v:1,at:1700000000000,cur:'₹',people:[{name:'Amit',entries:[{t:'g',a:.1,ts:1700000000000},{t:'g',a:.2,ts:1700000000000},{t:'r',a:.3,ts:1700000000000}]}]});assert.equal(core.balance(d,'0'),0);
 assert.throws(()=>core.shared({v:1,at:1700000000000,people:[{name:'Amit'}]}));
});
test('all shipped inline JavaScript parses',()=>{
 for(const file of fs.readdirSync('www').filter(n=>n.endsWith('.html'))){const html=fs.readFileSync('www/'+file,'utf8'); for(const m of html.matchAll(/<script(?:\s[^>]*)?>([\s\S]*?)<\/script>/g))new vm.Script(m[1],{filename:file});}
});
