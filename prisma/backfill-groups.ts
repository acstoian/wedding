/**
 * One-off backfill: split pre-grouping Guest rows that have comma-joined
 * plusOneName / plusOneMenu fields into separate Guest rows linked by
 * parentGuestId. Idempotent — skips guests whose children already exist.
 *
 * Run with: npx tsx prisma/backfill-groups.ts
 */

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

type AllergyEntry = { name: string; details: string };

function parseAllergies(raw: string | null): AllergyEntry[] {
  if (!raw) return [];
  return raw
    .split("|")
    .map((chunk) => chunk.trim())
    .filter(Boolean)
    .map((chunk) => {
      const idx = chunk.indexOf(":");
      if (idx === -1) return { name: "", details: chunk };
      return { name: chunk.slice(0, idx).trim(), details: chunk.slice(idx + 1).trim() };
    });
}

function allergiesFor(name: string, entries: AllergyEntry[]): string | null {
  const match = entries.find(
    (e) => e.name && e.name.toLowerCase() === name.trim().toLowerCase()
  );
  return match ? match.details : null;
}

async function main(): Promise<void> {
  const candidates = await prisma.guest.findMany({
    where: {
      parentGuestId: null,
      plusOneName: { not: null },
    },
    include: { plusOnes: true },
  });

  console.log(`Found ${candidates.length} candidate primary guests with legacy plusOneName data.`);

  let created = 0;
  let skipped = 0;

  for (const primary of candidates) {
    if (primary.plusOnes.length > 0) {
      console.log(`  Skipping #${primary.id} (${primary.name}): already has ${primary.plusOnes.length} child rows.`);
      skipped++;
      continue;
    }

    const names = (primary.plusOneName ?? "")
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
    const menus = (primary.plusOneMenu ?? "")
      .split(",")
      .map((s) => s.trim());
    const allergyEntries = parseAllergies(primary.allergies);

    console.log(`  #${primary.id} (${primary.name}) → splitting ${names.length} plus-one(s)`);

    for (let i = 0; i < names.length; i++) {
      const childName = names[i];
      const childMenu = menus[i] || null;
      const childAllergies = allergiesFor(childName, allergyEntries);
      await prisma.guest.create({
        data: {
          name: childName,
          attending: primary.attending,
          menuPreference: childMenu,
          allergies: childAllergies,
          parentGuestId: primary.id,
        },
      });
      created++;
    }

    // Rewrite the primary's allergies to only contain their own entry (if any).
    const primaryAllergies = allergiesFor(primary.name, allergyEntries);
    await prisma.guest.update({
      where: { id: primary.id },
      data: {
        allergies: primaryAllergies,
        // Leave plusOne/plusOneName/plusOneMenu as legacy data — harmless,
        // and useful as a paper trail if we ever need to re-run this.
      },
    });
  }

  console.log(`Done. Created ${created} plus-one rows. Skipped ${skipped} primaries.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
