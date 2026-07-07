-- Seed super admin (email: admin@eventinlatina.it, password: Admin123!)
INSERT INTO "users" ("id", "email", "name", "role", "password_hash")
VALUES (
  gen_random_uuid(),
  'admin@eventinlatina.it',
  'Admin',
  'super_admin',
  '$2a$10$SWq.2n04.Z4ETI6.Z1G2Tub1dsbVv/6EduksJkKtvslNal2bP0sZa'
)
ON CONFLICT ("email") DO UPDATE SET "role" = 'super_admin', "password_hash" = '$2a$10$SWq.2n04.Z4ETI6.Z1G2Tub1dsbVv/6EduksJkKtvslNal2bP0sZa';
