export function familyCacheTag(familyId: string, scope: string) {
  return `family:${familyId}:${scope}`;
}

export function familyCacheTags(familyId: string) {
  return {
    accounts: familyCacheTag(familyId, "accounts"),
    cards: familyCacheTag(familyId, "cards"),
    categories: familyCacheTag(familyId, "categories"),
    dashboard: familyCacheTag(familyId, "dashboard"),
    goals: familyCacheTag(familyId, "goals"),
    options: familyCacheTag(familyId, "options"),
    recurring: familyCacheTag(familyId, "recurring"),
    transactions: familyCacheTag(familyId, "transactions"),
  };
}
