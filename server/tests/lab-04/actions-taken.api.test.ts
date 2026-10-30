import { beforeAll, afterAll, describe, it, expect, vi } from "vitest";
import request from "supertest";
import { PrismaClient } from "@prisma/client";
import { createHash } from "node:crypto";
import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
import path from "node:path";
import { app } from "../../src/app.js";
import * as database from "../../src/prisma.js";

const enabled = process.env.LAB4_DB_TEST === "1";
describe.skipIf(!enabled)("Lab 4 Actions Taken with disposable PostgreSQL", () => {
  let db: PrismaClient;
  let owner: any, other: any, staff: any, admin: any, inactive: any, ticket: any;
  let preserved = false, recovered = false;
  const root = process.cwd();
  const name = "toktickit_lab4_prep_" + Date.now();
  const container = "toktickit-postgres";
  let pgUser: string;
  function sql(text: string, target = name) {
    return execFileSync("docker", ["exec", "-i", container, "psql", "-X", "-v", "ON_ERROR_STOP=1", "-U", pgUser, "-d", target, "-At"], { input: text, encoding: "utf8", stdio: ["pipe", "pipe", "pipe"] }).trim();
  }
  function snapshot(target = name) {
    return sql(`SELECT jsonb_build_object(
      'users',(SELECT jsonb_agg(to_jsonb(t) ORDER BY id) FROM "RequesterUser" t),
      'tickets',(SELECT jsonb_agg(to_jsonb(t)-'workflowVersion' ORDER BY id) FROM "Ticket" t),
      'attachments',(SELECT jsonb_agg(to_jsonb(t) ORDER BY id) FROM "Attachment" t),
      'comments',(SELECT jsonb_agg(to_jsonb(t) ORDER BY id) FROM "PublicComment" t),
      'notes',(SELECT jsonb_agg(to_jsonb(t) ORDER BY id) FROM "InternalNote" t));`,target);
  }
  function call(method: "get"|"post"|"patch"|"delete", suffix = "", user = staff) {
    return request(app)[method](`/api/tickets/${ticket.id}/actions${suffix}`)
      .set("Cookie", `toktickit_session=lab4-${user.id}; toktickit_csrf=test-csrf`).set("X-CSRF-Token", "test-csrf");
  }
  function input(extra: Record<string, unknown> = {}) {
    return { actionDateTime: "2026-10-30T15:00:00+07:00", description: "  Inspect device  ", result: "Inspection planned",
      assigneeId: admin.id, status: "PLANNED", followUpRequired: false, ...extra };
  }
  async function create(extra: Record<string, unknown> = {}, user = staff) {
    return call("post", "", user).set("Idempotency-Key", crypto.randomUUID()).send(input(extra));
  }
  beforeAll(async () => {
    const info = JSON.parse(execFileSync("docker", ["inspect", container], { encoding: "utf8" }))[0];
    const env = Object.fromEntries(info.Config.Env.map((entry: string) => { const i = entry.indexOf("="); return [entry.slice(0,i),entry.slice(i+1)]; }));
    pgUser = env.POSTGRES_USER || "postgres";
    if (!/^toktickit_lab4_prep_[0-9]+$/.test(name)) throw Error("Unsafe disposable database name");
    sql(`CREATE DATABASE "${name}";`, "postgres");
    console.log("Disposable database:", name);
    sql('CREATE TABLE "Category" ("id" SERIAL PRIMARY KEY, "name" TEXT NOT NULL UNIQUE, "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP);');
    for (const migration of ["20260824000000_lab2_foundation", "20260919000000_lab3_auth_requester"]) {
      sql(readFileSync(path.join(root, "prisma/migrations", migration, "migration.sql"), "utf8"));
    }
    sql(`INSERT INTO "Category" ("name") VALUES ('Legacy');
      INSERT INTO "RelatedSystem" ("name") VALUES ('Legacy');
      INSERT INTO "RequesterUser" ("name","email") VALUES ('Legacy','legacy@example.com');
      INSERT INTO "Ticket" ("ticketNumber","requesterId","categoryId","relatedSystemId","requestedPriority","summary","description","updatedAt","status")
      VALUES ('TT-LEGACY',1,1,1,'HIGH','Preserve me','Original description',CURRENT_TIMESTAMP,'RESOLVED');
      INSERT INTO "Attachment" ("ticketId","originalFilename","storageKey","mimeType","sizeBytes") VALUES (1,'legacy.txt','legacy-storage-key','text/plain',17);
      INSERT INTO "PublicComment" ("ticketId","authorId","content") VALUES (1,1,'Legacy comment');
      INSERT INTO "InternalNote" ("ticketId","authorId","content") VALUES (1,1,'Legacy note');`);
    const before = snapshot();
    const backup = execFileSync("docker", ["exec", container, "pg_dump", "-U", pgUser, "-d", name, "--no-owner", "--no-acl"], { encoding: "utf8" });
    const recoveredName = name + "_recovery";
    sql(`CREATE DATABASE "${recoveredName}";`, "postgres");
    sql(backup, recoveredName);
    expect(snapshot(recoveredName)).toBe(before);
    const migration = readFileSync(path.join(root,"prisma/migrations/20261030000000_lab4_actions_foundation/migration.sql"),"utf8");
    expect(() => sql(migration.replace("COMMIT;", 'SELECT * FROM "__intentional_failed_rollout__"; COMMIT;'))).toThrow();
    expect(snapshot()).toBe(before);
    expect(sql(`SELECT to_regclass('"ActionTaken"') IS NULL;`)).toBe("t");
    recovered = true;
    sql(migration);
    expect(snapshot()).toBe(before);
    expect(sql('SELECT count(*) FROM "ActionTaken";')).toBe("0");
    preserved = true;
    const url = `postgresql://${encodeURIComponent(pgUser)}:${encodeURIComponent(env.POSTGRES_PASSWORD)}@localhost:5432/${name}`;
    db = new PrismaClient({ datasources: { db: { url } } });
    const seed = () => execFileSync(process.execPath, [path.join(root,"node_modules/tsx/dist/cli.mjs"),"prisma/seed.ts"], {
      cwd: root, env: { ...process.env, DATABASE_URL: url }, encoding:"utf8", stdio:["pipe","pipe","pipe"],
    });
    seed();
    const counts = async () => [await db.user.count(),await db.ticket.count(),await db.actionTaken.count(),await db.actionTakenEvent.count()];
    const first = await counts();
    seed();
    expect(await counts()).toEqual(first);
    expect(first.slice(2)).toEqual([4,4]);
    expect(await db.ticket.findUnique({where:{ticketNumber:"TT-LEGACY"},include:{actions:true}})).toMatchObject({status:"RESOLVED",actions:[]});
    await db.user.updateMany({data:{mustChangePassword:false}});
    const get = (email: string) => db.user.findUniqueOrThrow({where:{email}});
    [owner,other,staff,admin,inactive] = await Promise.all([
      get("ariya.somchai@example.com"),get("narin.kittisak@example.com"),get("somchai.staff@example.com"),get("admin@example.com"),get("inactive.staff@example.com"),
    ]);
    ticket = await db.ticket.findUniqueOrThrow({where:{ticketNumber:"TT-20260919-000003"}});
    // Make the zero-action fixture owned by the role used for ownership checks.
    await db.ticket.update({where:{id:ticket.id},data:{requesterId:owner.id}});
    for(const user of [owner,other,staff,admin,inactive]) await db.session.create({data:{
      userId:user.id,tokenHash:createHash("sha256").update("lab4-"+user.id).digest("hex"),expiresAt:new Date(Date.now()+3600000),
    }});
    vi.spyOn(database,"getPrisma").mockReturnValue(db);
  },120000);
  afterAll(async()=>{vi.restoreAllMocks();await db?.$disconnect();});

  it("preserves legacy records, rolls back a failed rollout, and seeds twice without duplicates",()=>{expect(preserved && recovered).toBe(true);});
  it("records immutable actor, independent assignee, UTC timestamp and one creation event",async()=>{
    const result = await create({performedById:999,version:99,createdAt:"1970-01-01T00:00:00Z"});
    expect(result.status).toBe(201);
    expect(result.body).toMatchObject({performedBy:{id:staff.id},assignee:{id:admin.id},description:"Inspect device",version:1,actionDateTime:"2026-10-30T08:00:00.000Z"});
    expect(result.body.performedBy.email).toBeUndefined();
    expect(await db.actionTakenEvent.findMany({where:{actionId:result.body.id}})).toMatchObject([{actorId:staff.id,kind:"CREATED",version:1}]);
  });
  it("replays the original create response after edits and rejects key reuse for different data",async()=>{
    const key=crypto.randomUUID();
    const a=await call("post").set("Idempotency-Key",key).send(input());
    const edit=await call("patch","/"+a.body.id).send({expectedVersion:1,description:"Updated"});
    expect(edit.status).toBe(200);
    const replay=await call("post").set("Idempotency-Key",key).send(input());
    expect(replay.body).toEqual(a.body);
    expect((await call("post").set("Idempotency-Key",key).send(input({description:"Different"}))).status).toBe(409);
    expect(await db.actionTakenEvent.count({where:{actionId:a.body.id}})).toBe(2);
  });
  it.each([
    {description:" "},{description:"x".repeat(2001)},{result:""},{followUpRequired:true},{followUpRequired:"false"},
    {actionDateTime:"2026-02-30T00:00:00Z"},{actionDateTime:"2026-10-30T15:00:00"},{status:"CANCELLED"},{assigneeId:"1"},
  ])("rejects invalid fields without writes: %j",async fields=>{
    const before=await db.actionTaken.count();expect((await create(fields)).status).toBe(422);expect(await db.actionTaken.count()).toBe(before);
  });
  it("requires an active eligible assignee and conditional follow-up note",async()=>{
    for(const id of [inactive.id,owner.id,999999]) expect((await create({assigneeId:id})).body.error.code).toBe("INVALID_ASSIGNEE");
    const valid=await create({followUpRequired:true,followUpNote:"  Call tomorrow  ",description:"x".repeat(2000),attachmentNotes:"x".repeat(1000)});
    expect(valid.status).toBe(201);expect(valid.body.followUpNote).toBe("Call tomorrow");
    const edited=await call("patch","/"+valid.body.id).send({expectedVersion:1,followUpRequired:false});
    expect(edited.body.followUpNote).toBeNull();
  });
  it("restricts Requesters to owned, read-only lists and hides cross-owner guessed IDs",async()=>{
    expect((await call("get","",owner)).body.readOnly).toBe(true);
    const denied=await call("get","",other);
    const missing=await request(app).get("/api/tickets/999999/actions").set("Cookie",`toktickit_session=lab4-${other.id}`);
    expect(denied.status).toBe(404);expect(denied.body).toEqual(missing.body);
    const a=await create();
    for(const [method,suffix] of [["post",""],["patch","/"+a.body.id],["post","/"+a.body.id+"/status"]] as const)
      expect((await call(method,suffix,owner).send(input({expectedVersion:1}))).status).toBe(403);
  });
  it("requires session and CSRF and rejects inactive sessions",async()=>{
    expect((await request(app).get(`/api/tickets/${ticket.id}/actions`)).status).toBe(401);
    expect((await call("get","",inactive)).status).toBe(401);
    expect((await call("post").set("X-CSRF-Token","wrong").send(input())).body.error.code).toBe("INVALID_CSRF");
    expect((await call("post").send(input())).status).toBe(422);
  });
  it("allows Administrator writes and returns only eligible display-safe assignee choices",async()=>{
    expect((await create({},admin)).status).toBe(201);
    const r=await request(app).get(`/api/tickets/${ticket.id}/action-assignees`).set("Cookie",`toktickit_session=lab4-${staff.id}`);
    expect(r.status).toBe(200);expect(r.body.items.some((u:any)=>u.id===inactive.id||u.id===owner.id)).toBe(false);
    expect(Object.keys(r.body.items[0]).sort()).toEqual(["id","name"]);
  });
  it.each(["PLANNED","IN_PROGRESS","COMPLETED","CANCELLED"].flatMap(from=>["PLANNED","IN_PROGRESS","COMPLETED","CANCELLED"].map(to=>[from,to])))("enforces lifecycle %s -> %s atomically",async(from,to)=>{
    const r=await create({status:from==="CANCELLED"?"PLANNED":from});
    let version=1;
    if(from==="CANCELLED"){expect((await call("post","/"+r.body.id+"/status").send({expectedVersion:1,status:"CANCELLED"})).status).toBe(200);version=2;}
    const allowed=({PLANNED:["IN_PROGRESS","COMPLETED","CANCELLED"],IN_PROGRESS:["COMPLETED","CANCELLED"],COMPLETED:[],CANCELLED:[]} as Record<string,string[]>)[from].includes(to);
    const count=await db.actionTakenEvent.count({where:{actionId:r.body.id}});
    const result=await call("post","/"+r.body.id+"/status").send({expectedVersion:version,status:to});
    expect(result.status).toBe(allowed?200:422);
    expect(await db.actionTakenEvent.count({where:{actionId:r.body.id}})).toBe(count+(allowed?1:0));
    expect(await db.actionTaken.findUnique({where:{id:r.body.id}})).toMatchObject({status:allowed?to:from,version:version+(allowed?1:0)});
  });
  it("rejects stale and cross-Ticket edits without history or data changes",async()=>{
    const a=await create();
    expect((await call("patch","/"+a.body.id).send({expectedVersion:1,description:"First"})).status).toBe(200);
    const stale=await call("patch","/"+a.body.id).send({expectedVersion:1,description:"Overwrite"});
    expect(stale.status).toBe(409);expect(stale.body.current.version).toBe(2);
    const wrong=await request(app).patch("/api/tickets/1/actions/"+a.body.id).set("Cookie",`toktickit_session=lab4-${staff.id}; toktickit_csrf=test-csrf`).set("X-CSRF-Token","test-csrf").send({expectedVersion:2,description:"Wrong"});
    expect(wrong.status).toBe(404);expect(await db.actionTakenEvent.count({where:{actionId:a.body.id}})).toBe(2);
  });
  it("orders by effective UTC timestamp and id, and keeps terminal records immutable",async()=>{
    const first=await create({actionDateTime:"2026-10-01T00:00:00Z",status:"COMPLETED"});
    const second=await create({actionDateTime:"2026-10-01T00:00:00Z"});
    const list=await call("get");
    const matching=list.body.items.filter((x:any)=>x.actionDateTime==="2026-10-01T00:00:00.000Z");
    expect(matching.map((x:any)=>x.id)).toEqual([first.body.id,second.body.id]);
    expect((await call("patch","/"+first.body.id).send({expectedVersion:1,description:"Rewrite"})).status).toBe(422);
    expect((await call("delete","/"+first.body.id)).status).toBe(404);
    await expect(db.actionTakenEvent.updateMany({where:{actionId:first.body.id},data:{version:99}})).rejects.toThrow();
  });
  it("allows only one of two simultaneous updates and creates exactly one revision event",async()=>{
    const a=await create();
    const results=await Promise.all(["Concurrent A","Concurrent B"].map(description=>call("patch","/"+a.body.id).send({expectedVersion:1,description})));
    expect(results.map(r=>r.status).sort()).toEqual([200,409]);
    expect(await db.actionTakenEvent.count({where:{actionId:a.body.id}})).toBe(2);
  });

  it("deduplicates simultaneous identical create requests",async()=>{
    const key=crypto.randomUUID();
    const results=await Promise.all([1,2].map(()=>call("post").set("Idempotency-Key",key).send(input())));
    expect(results.map(r=>r.status)).toEqual([201,201]);
    expect(results[0].body).toEqual(results[1].body);
    expect(await db.actionTakenEvent.count({where:{actionId:results[0].body.id}})).toBe(1);
  });
  it("rolls back action, event and Ticket version when persistence fails",async()=>{
    const before=[await db.actionTaken.count(),await db.actionTakenEvent.count(),(await db.ticket.findUniqueOrThrow({where:{id:ticket.id}})).workflowVersion];
    sql(`CREATE FUNCTION fail_test_action_event() RETURNS trigger LANGUAGE plpgsql AS $$ BEGIN RAISE EXCEPTION 'controlled test failure'; END; $$;
      CREATE TRIGGER fail_test_action_event BEFORE INSERT ON "ActionTakenEvent" FOR EACH ROW EXECUTE FUNCTION fail_test_action_event();`);
    const log=vi.spyOn(console,"error").mockImplementation(()=>{});
    try {
      const r=await create();
      expect(r.status).toBe(500);expect(r.body.error.code).toBe("INTERNAL_ERROR");
      expect(r.body.error.message).not.toContain("controlled");
      expect(r.headers["x-correlation-id"]).toBeTruthy();
    } finally {sql('DROP TRIGGER fail_test_action_event ON "ActionTakenEvent"; DROP FUNCTION fail_test_action_event();');log.mockRestore();}
    expect([await db.actionTaken.count(),await db.actionTakenEvent.count(),(await db.ticket.findUniqueOrThrow({where:{id:ticket.id}})).workflowVersion]).toEqual(before);
  });
});
