const {test,expect}=require('@playwright/test');
const existing=()=>({people:[{id:'p1',name:'Amit'}],entries:[{id:'e1',personId:'p1',type:'gave',amount:500,reason:'Dinner',ts:1700000000000}],settings:{currency:'₹'}});
async function seeded(page, data=existing()){
 await page.addInitScript(raw=>{if(!sessionStorage.getItem('seeded')){localStorage.setItem('funds_v1',raw);localStorage.setItem('udhar_last_backup',Date.now());sessionStorage.setItem('seeded','1');}},JSON.stringify(data));await page.goto('/');
}
async function add(page,name,amount,type='gave'){
 await page.locator('#fabBtn').click();await page.locator('#fPerson').fill(name);await page.locator('#fAmount').fill(String(amount));await page.locator(type==='gave'?'#btnGave':'#btnGot').click();
}
async function db(page){return page.evaluate(()=>JSON.parse(localStorage.getItem('funds_v1')));}
test.beforeEach(async({page})=>{page.on('pageerror',e=>{throw e;});});
test('fresh ledger: lending, borrowing, search, activity and persistence',async({page})=>{
 await page.goto('/');await expect(page.locator('#peopleList')).toContainText('No people yet');
 await add(page,'Amit',500);await add(page,'Deep',200,'got');
 await expect(page.locator('#statRecv')).toHaveText('₹500');await expect(page.locator('#statPay')).toHaveText('₹200');
 await page.locator('#searchInput').fill('amit');await expect(page.locator('.person')).toHaveCount(1);
 await page.locator('[data-view="view-activity"]').click();await expect(page.locator('.entry')).toHaveCount(2);
 await page.reload();await expect(page.locator('#statRecv')).toHaveText('₹500');expect((await db(page)).entries).toHaveLength(2);
});
test('existing release data loads without rewriting it on startup',async({page})=>{
 await seeded(page);expect(await page.evaluate(()=>localStorage.getItem('funds_v1'))).toBe(JSON.stringify(existing()));await expect(page.locator('#statRecv')).toHaveText('₹500');
});
test('repayment, edit, delete and settle review work',async({page})=>{
 await seeded(page);await page.locator('.person').click();await page.locator('#pdSettleBtn').click();
 expect((await db(page)).entries).toHaveLength(1);await expect(page.locator('#fAmount')).toHaveValue('500');
 await page.locator('#btnGot').click();await expect(page.locator('#pdNet')).toHaveText('₹0');
 await page.locator('.entry').first().click();await page.locator('#fAmount').fill('300');await page.locator('#btnGot').click();await expect(page.locator('#pdNet')).toHaveText('owes you ₹200');
 await page.locator('.entry').first().click();page.once('dialog',d=>d.accept());await page.locator('#btnDelete').click();await expect(page.locator('#pdNet')).toHaveText('owes you ₹500');
});
test('rapid double tap saves one entry',async({page})=>{
 await page.goto('/');await page.locator('#fabBtn').click();await page.locator('#fPerson').fill('Amit');await page.locator('#fAmount').fill('5');
 await page.locator('#btnGave').evaluate(b=>{b.click();b.click();});expect((await db(page)).entries).toHaveLength(1);
});
test('0.1 + 0.2 - 0.3 settles exactly in the UI',async({page})=>{
 await page.goto('/');await add(page,'Amit','.1');await add(page,'Amit','.2');await add(page,'Amit','.3','got');await expect(page.locator('#statRecv')).toHaveText('₹0');await expect(page.locator('.tag')).toHaveText('SETTLED');
});
test('invalid precision and nonfinite amounts never enter storage',async({page})=>{
 await page.goto('/');await add(page,'Amit','1.234');await expect(page.locator('#toast')).toContainText('two decimal');expect(await db(page)).toBeNull();
 await page.locator('#fAmount').fill('1e309');await page.locator('#btnGave').click();expect(await db(page)).toBeNull();
});
test('storage quota failure keeps old data and the editor open',async({page})=>{
 await seeded(page);await page.evaluate(()=>{const set=Storage.prototype.setItem;Storage.prototype.setItem=function(k,v){if(k==='funds_v1')throw new DOMException('Full','QuotaExceededError');return set.call(this,k,v);};});
 await add(page,'New person',100);expect((await db(page)).entries).toHaveLength(1);await expect(page.locator('#sheet-entry')).toHaveClass(/on/);
 await expect(page.locator('#toast')).toContainText('Not saved');await expect(page.locator('#statRecv')).toHaveText('₹500');
});
test('corrupted saved data is preserved and can be copied',async({page})=>{
 await page.addInitScript(()=>{localStorage.setItem('funds_v1','{"broken":');});await page.goto('/');
 await expect(page.locator('#storageWarning')).toBeVisible();expect(await page.evaluate(()=>localStorage.getItem('funds_v1'))).toBe('{"broken":');
 await add(page,'Amit',50);await page.keyboard.press('Escape');expect(await page.evaluate(()=>localStorage.getItem('funds_v1'))).toBe('{"broken":');
 await page.locator('#recoverRaw').click();await expect(page.locator('#backupText')).toHaveValue('{"broken":');
});
test('blocked storage still renders a usable recovery screen',async({page})=>{
 await page.addInitScript(()=>{Storage.prototype.getItem=function(){throw new DOMException('Blocked','SecurityError');};Storage.prototype.setItem=function(){throw new DOMException('Blocked','SecurityError');};});await page.goto('/');await expect(page.locator('#storageWarning')).toBeVisible();await expect(page.locator('#settingsBtn')).toBeVisible();
});
async function restore(page,raw){await page.locator('#settingsBtn').click();await page.locator('#rowImport').click();await page.locator('#restoreText').fill(raw);await page.locator('#doRestorePaste').click();}
test('malformed restore preserves existing ledger',async({page})=>{
 await seeded(page);const d=existing();d.entries[0].amount='500';await restore(page,JSON.stringify(d));expect(await db(page)).toEqual(existing());await expect(page.locator('#toast')).toContainText('Invalid backup');
});
test('valid restore can be cancelled, then restored and reopened',async({page})=>{
 await seeded(page);const d=existing();d.entries[0].amount=700;
 page.once('dialog',d=>d.dismiss());await restore(page,JSON.stringify(d));expect(await db(page)).toEqual(existing());
 page.once('dialog',d=>d.accept());await page.locator('#doRestorePaste').click();await expect(page.locator('#statRecv')).toHaveText('₹700');await page.reload();await expect(page.locator('#statRecv')).toHaveText('₹700');
});
test('browser backup downloads valid round-trippable JSON',async({page})=>{
 await seeded(page);await page.locator('#settingsBtn').click();const downloaded=page.waitForEvent('download');await page.locator('#rowExport').click();const d=await downloaded;const stream=await d.createReadStream();const chunks=[];for await(const c of stream)chunks.push(c);expect(JSON.parse(Buffer.concat(chunks).toString())).toEqual(existing());
});
test('installed app backup uses copy sheet without blob download',async({page})=>{
 await page.addInitScript(()=>{window.Capacitor={isNativePlatform:()=>true};});await seeded(page);await page.locator('#settingsBtn').click();await page.locator('#rowExport').click();await expect(page.locator('#sheet-backup')).toHaveClass(/on/);expect(JSON.parse(await page.locator('#backupText').inputValue())).toEqual(existing());
});
test('native back handler closes sheets then returns to home',async({page})=>{
 await seeded(page);await page.locator('.person').click();await page.locator('#pdGaveBtn').click();expect(await page.evaluate(()=>window.udharHandleBack())).toBe(true);await expect(page.locator('#sheet-entry')).not.toHaveClass(/on/);
 expect(await page.evaluate(()=>window.udharHandleBack())).toBe(true);await expect(page.locator('#view-home')).toHaveClass(/on/);expect(await page.evaluate(()=>window.udharHandleBack())).toBe(false);
});
test('Escape closes a dialog and restores keyboard focus',async({page})=>{
 await page.goto('/');await page.locator('#fabBtn').click();await expect(page.locator('#sheet-entry')).toHaveAttribute('role','dialog');await page.keyboard.press('Escape');await expect(page.locator('#fabBtn')).toBeFocused();
});
test('sharing creates a Unicode-safe, read-only snapshot with correct balances',async({page,context})=>{
 const d=existing();d.people[0].name='अमित 🧡';await seeded(page,d);
 await page.evaluate(()=>{Object.defineProperty(navigator,'share',{value:async d=>{window.shared=d;},configurable:true});});
 await page.locator('.person').click();page.once('dialog',d=>d.accept());await page.locator('#pdShareBtn').click();await expect.poll(()=>page.evaluate(()=>window.shared?.url)).toBeTruthy();
 const shared=await page.evaluate(()=>window.shared);expect(shared.url).toMatch(/^https:\/\/udhar-dun.vercel.app\/share.html#d=/);
 const receiver=await context.newPage();await receiver.goto('/share.html'+new URL(shared.url).hash);await expect(receiver.locator('.card')).toContainText('अमित 🧡');await expect(receiver.locator('.card')).toContainText('₹500 to receive');await expect(receiver.locator('#foot')).toBeVisible();expect(await receiver.evaluate(()=>localStorage.getItem('funds_v1'))).toBe(JSON.stringify(d));
});
test('malformed shared entries render a helpful error',async({page})=>{
 const raw={v:1,at:Date.now(),people:[{name:'Amit'}]};await page.goto('/share.html#d='+Buffer.from(JSON.stringify(raw)).toString('base64url'));await expect(page.locator('#out')).toContainText('invalid ledger');
});
test('imported IDs, names and currency cannot inject HTML',async({page})=>{
 const d=existing();d.people[0].id='p1" onclick="window.injected=true';d.entries[0].personId=d.people[0].id;d.entries[0].id='e1" onclick="window.injected=true';d.people[0].name='<img src=x onerror="window.injected=true">';d.settings.currency='<b>';
 await seeded(page,d);await expect(page.locator('.person img')).toHaveCount(0);await page.locator('.person').click();await expect(page.locator('#personEntries b')).toHaveCount(0);expect(await page.evaluate(()=>window.injected)).toBeUndefined();
});
test('other-tab edits cannot be silently overwritten',async({page,context})=>{
 await seeded(page);const second=await context.newPage();await second.goto('/');await add(second,'Other',10);await expect(page.locator('#storageWarning')).toBeVisible();await add(page,'Overwrite',50);expect((await db(page)).people.map(p=>p.name)).toEqual(['Amit','Other']);
});
test('ledger remains usable offline after the app is loaded',async({page,context})=>{
 await seeded(page);await context.setOffline(true);await add(page,'Offline',25);await expect(page.locator('#statRecv')).toHaveText('₹525');expect((await db(page)).entries).toHaveLength(2);await context.setOffline(false);
});
test('erase requires confirmation and persists on reload',async({page})=>{
 await seeded(page);await page.locator('#settingsBtn').click();page.once('dialog',d=>d.dismiss());await page.locator('#rowWipe').click();expect((await db(page)).entries).toHaveLength(1);
 page.once('dialog',d=>d.accept());await page.locator('#rowWipe').click();await page.reload();await expect(page.locator('#peopleList')).toContainText('No people yet');
});
test('privacy policy returns to the existing ledger',async({page})=>{
 await seeded(page);await page.locator('#settingsBtn').click();await page.getByRole('link',{name:/Privacy policy/}).click();await expect(page).toHaveURL(/privacy.html$/);await page.getByRole('link',{name:'Return to Udhar'}).click();await expect(page.locator('#statRecv')).toHaveText('₹500');
});
test('mobile layouts have no horizontal overflow',async({page})=>{
 await seeded(page);for(const width of [320,390,768]){await page.setViewportSize({width,height:740});expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);}
 await page.setViewportSize({width:390,height:844});await page.screenshot({path:'test-results/ledger-mobile.png',fullPage:true});
});
test('currency changes refresh a person balance and remain escaped',async({page})=>{
 await seeded(page);await page.locator('.person').click();await page.locator('#settingsBtn').click();await page.locator('#setCur').fill('$');await page.locator('#setCur').press('Tab');await page.keyboard.press('Escape');await expect(page.locator('#pdNet')).toHaveText('owes you $500');await page.reload();await expect(page.locator('#statRecv')).toHaveText('$500');
});
test('Help & testing returns to the saved ledger',async({page})=>{
 await seeded(page);await page.locator('#settingsBtn').click();await page.getByRole('link',{name:/Help & testing/}).click();await expect(page).toHaveURL(/help.html$/);await expect(page.locator('body')).toContainText('1.0.3');await page.getByRole('link',{name:'← Return to Udhar'}).click();await expect(page.locator('#statRecv')).toHaveText('₹500');
});
test('file restore validates then confirms replacement',async({page})=>{
 await seeded(page);await page.locator('#settingsBtn').click();await page.locator('#rowImport').click();const d=existing();d.entries[0].amount=123.45;page.once('dialog',d=>d.accept());await page.locator('#importFile').setInputFiles({name:'backup.json',mimeType:'application/json',buffer:Buffer.from(JSON.stringify(d))});await expect(page.locator('#statRecv')).toHaveText('₹123.45');
});
test('failed restore write leaves the original ledger and restore sheet intact',async({page})=>{
 await seeded(page);await page.evaluate(()=>{const set=Storage.prototype.setItem;Storage.prototype.setItem=function(k,v){if(k==='funds_v1')throw new DOMException('Full','QuotaExceededError');return set.call(this,k,v);};});const d=existing();d.entries[0].amount=900;page.once('dialog',d=>d.accept());await restore(page,JSON.stringify(d));expect(await db(page)).toEqual(existing());await expect(page.locator('#sheet-restore')).toHaveClass(/on/);await expect(page.locator('#toast')).toContainText('Not saved');
});
