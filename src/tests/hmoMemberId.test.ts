// Maxicare member IDs entered by HR: an ID already saved for another employee's family is refused, and a confirmed ID
// can be corrected with a reason kept in the history.
import {describe,expect,it} from 'vitest';
import {memberIdHolder} from '../../backend-render/hmoRules.js';
import server from '../../backend-render/server.js?raw';

const members=[{employee_id:'maria',maxicare_reference:'MC-2026-048213'},{employee_id:'maria',name:'Paolo Santos',maxicare_reference:'MC-2026-048214'},{employee_id:'carlo',maxicare_reference:'MC-2026-050000'}];

describe('duplicate member IDs',()=>{
 it('finds the ID on another employee',()=>{
  expect(memberIdHolder('MC-2026-048213','carlo',members)).toBe(members[0]);
 });
 it('finds the ID on another employee\'s dependent',()=>{
  expect(memberIdHolder('MC-2026-048214','carlo',members)?.name).toBe('Paolo Santos');
 });
 it('ignores capitals, spaces and dashes',()=>{
  expect(memberIdHolder(' mc 2026 048213','carlo',members)).toBe(members[0]);
 });
 it('allows a new ID',()=>{
  expect(memberIdHolder('MC-2026-099999','carlo',members)).toBeNull();
 });
 it('allows the same ID within one employee\'s family',()=>{
  expect(memberIdHolder('MC-2026-048213','maria',members)).toBeNull();
 });
});

describe('the server',()=>{
 it('checks for duplicates when confirming an employee or dependent and when correcting',()=>{
  expect(server.match(/await ensureMemberIdFree\(reference, await memberEmployeeId\(\)\);/g)).toHaveLength(3);
 });
 it('keeps the reason for a correction in the history',()=>{
  expect(server).toContain("'member_id_corrected', ctx.userId, previous, { ...updated, correction_reason: reason }");
 });
});
