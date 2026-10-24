/* Shared validation and money calculations. No network or device access. */
(function (root, factory) {
  const api = factory();
  if (typeof module === "object" && module.exports) module.exports = api;
  else root.UdharLedger = api;
})(typeof globalThis !== "undefined" ? globalThis : window, function () {
  "use strict";
  const MAX_BACKUP_BYTES = 10 * 1024 * 1024;
  function minor(amount) {
    if (typeof amount !== "number" || !Number.isFinite(amount) || amount <= 0) throw new Error("Use a positive, finite amount.");
    const cents = Math.round(amount * 100);
    if (!Number.isSafeInteger(cents) || cents <= 0 || Math.abs(amount * 100 - cents) > 0.001) {
      throw new Error("Use an amount with at most two decimal places within the supported range.");
    }
    return cents;
  }
  function text(value, label, max, allowEmpty) {
    if (typeof value !== "string" || (!allowEmpty && !value.trim()) || value.length > max) throw new Error("Invalid " + label + ".");
    return value;
  }
  function timestamp(value) {
    if (typeof value !== "number" || !Number.isFinite(value) || !Number.isFinite(new Date(value).getTime())) throw new Error("Invalid date.");
    return value;
  }
  function validate(data) {
    if (!data || typeof data !== "object" || !Array.isArray(data.people) || !Array.isArray(data.entries)) throw new Error("Not an Udhar backup.");
    if (data.people.length > 100000 || data.entries.length > 100000) throw new Error("Backup is too large.");
    const ids = new Set(), entryIds = new Set();
    const people = data.people.map(p => {
      if (!p || typeof p !== "object") throw new Error("Invalid person.");
      const id = text(p.id, "person ID", 200, false);
      if (ids.has(id)) throw new Error("Duplicate person ID.");
      ids.add(id);
      return {id, name: text(p.name, "person name", 120, false).trim()};
    });
    let totalMinor = 0;
    const entries = data.entries.map(e => {
      if (!e || typeof e !== "object") throw new Error("Invalid entry.");
      const id = text(e.id, "entry ID", 200, false);
      if (entryIds.has(id)) throw new Error("Duplicate entry ID.");
      entryIds.add(id);
      if (!ids.has(e.personId)) throw new Error("An entry refers to a missing person.");
      if (e.type !== "gave" && e.type !== "got") throw new Error("Invalid transaction type.");
      totalMinor += minor(e.amount);
      if (!Number.isSafeInteger(totalMinor)) throw new Error("Ledger total is outside the supported range.");
      return {id, personId: e.personId, type: e.type, amount: e.amount,
        reason: text(e.reason ?? e.note ?? "", "note", 2000, true), ts: timestamp(e.ts)};
    });
    const settings = data.settings ?? {};
    if (typeof settings !== "object" || Array.isArray(settings)) throw new Error("Invalid settings.");
    const currency = text(settings.currency ?? "₹", "currency symbol", 3, true).trim() || "₹";
    const result = {people, entries, settings: {currency}};
    if (data.createdAt !== undefined) result.createdAt = timestamp(data.createdAt);
    return result;
  }
  function parse(raw) {
    if (typeof raw !== "string" || new TextEncoder().encode(raw).length > MAX_BACKUP_BYTES) throw new Error("Backup must be smaller than 10 MB.");
    return validate(JSON.parse(raw));
  }
  function balance(data, id) {
    return data.entries.filter(e => e.personId === id)
      .reduce((sum, e) => sum + (e.type === "gave" ? minor(e.amount) : -minor(e.amount)), 0) / 100;
  }
  function totals(data) {
    let recv = 0, pay = 0;
    for (const p of data.people) {
      const cents = Math.round(balance(data, p.id) * 100);
      if (cents > 0) recv += cents; else pay -= cents;
    }
    return {recv: recv / 100, pay: pay / 100};
  }
  function shared(data) {
    if (!data || data.v !== 1 || !Array.isArray(data.people) || !data.people.length) throw new Error("Invalid shared ledger.");
    timestamp(data.at);
    const ledger = {settings: {currency: data.cur ?? "₹"}, people: [], entries: []};
    data.people.forEach((p, i) => {
      if (!p || !Array.isArray(p.entries)) throw new Error("Invalid shared person.");
      ledger.people.push({id: String(i), name: p.name});
      p.entries.forEach((e, j) => {
        if (!e || (e.t !== "g" && e.t !== "r")) throw new Error("Invalid shared transaction.");
        ledger.entries.push({id: i + ":" + j, personId: String(i), type: e.t === "g" ? "gave" : "got", amount: e.a, ts: e.ts, reason: e.n ?? ""});
      });
    });
    return validate(ledger);
  }
  return {MAX_BACKUP_BYTES, minor, validate, parse, balance, totals, shared};
});
