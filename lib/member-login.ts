export const memberStatuses = ['ACTIVE', 'APPROVED'] as const;

export function preferredMembership<T extends { passwordHash: string | null }>(records: T[]): T | null {
  return records.find(record => Boolean(record.passwordHash)) || records[0] || null;
}

export function membershipAccountQuery(identity: string) {
  return {
    where: { OR: [{ nim: identity }, { email: identity }], status: { in: [...memberStatuses] } },
    orderBy: [{ registeredAt: 'desc' as const }, { createdAt: 'desc' as const }, { id: 'desc' as const }],
  };
}
