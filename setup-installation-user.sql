-- Kurulum Ekibi User'ı oluştur
INSERT INTO "User" (
  id,
  email,
  name,
  password,
  role,
  status,
  "createdAt",
  "updatedAt"
) VALUES (
  'installation_team_001',
  'kurulum@enerjios.com',
  'Kurulum Ekibi',
  '$2a$12$7splfbz4Zfdqt24Vw9bHIukin42tWFy7sEGDgYl1FFBGTWNo3EHka',
  'INSTALLATION_TEAM',
  'ACTIVE',
  NOW(),
  NOW()
);

-- Kurulum Ekibi için Company oluştur (Seçenek A: Kendi kurulum şirketi)
INSERT INTO "Company" (
  id,
  "userId",
  name,
  "taxNumber",
  type,
  description,
  verified,
  "createdAt",
  "updatedAt"
) VALUES (
  'installation_company_001',
  'installation_team_001',
  'EnerjiOS Kurulum Ekibi',
  '1234567890',
  'INSTALLER',
  'Profesyonel güneş enerji sistemi kurulum ekibi',
  true,
  NOW(),
  NOW()
);