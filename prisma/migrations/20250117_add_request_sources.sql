-- Migration to add new request source values
-- This adds the new source types: WALK_IN, PARTNER_REFERRAL, WHATSAPP, OTHER

-- Note: This migration adds new enum values to the RequestSource enum
-- The actual enum modification should be done via Prisma schema changes
-- followed by `npx prisma db push` or `npma prisma migrate dev`

-- This file serves as documentation for the changes made to the RequestSource enum:
-- Added:
-- - WALK_IN (for walk-in customers)
-- - PARTNER_REFERRAL (for partner referrals)
-- - WHATSAPP (for WhatsApp inquiries)
-- - OTHER (for miscellaneous sources)

-- The enum now includes:
-- WEBSITE, PHONE, EMAIL, REFERRAL, SOCIAL_MEDIA, WALK_IN, PARTNER_REFERRAL, WHATSAPP, OTHER