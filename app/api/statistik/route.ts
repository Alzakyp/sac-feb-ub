import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET() {
  const [visitors, repositoryCount, repositoryAccesses, resourceAccesses, ratings] = await Promise.all([
    prisma.visitorLog.findMany({ select: { checkInTime: true, checkOutTime: true, studyProgram: true } }),
    prisma.repositoryDocument.count(),
    prisma.repositoryActivityLog.count(),
    prisma.resourceAccessLog.groupBy({ by: ['resourceName'], _count: { resourceName: true }, orderBy: { _count: { resourceName: 'desc' } }, take: 10 }),
    prisma.visitorLog.aggregate({ where: { satisfactionRating: { not: null } }, _avg: { satisfactionRating: true }, _count: { satisfactionRating: true } }),
  ]);
  const completed = visitors.filter(v => v.checkOutTime && v.checkOutTime >= v.checkInTime);
  const averageDurationMinutes = completed.length ? Math.round(completed.reduce((sum, v) => sum + (v.checkOutTime!.getTime() - v.checkInTime.getTime()) / 60000, 0) / completed.length) : null;
  const monthly = new Map<string, number>();
  const programs = new Map<string, number>();
  for (const visitor of visitors) {
    const key = `${visitor.checkInTime.getFullYear()}-${String(visitor.checkInTime.getMonth() + 1).padStart(2, '0')}`;
    monthly.set(key, (monthly.get(key) || 0) + 1);
    const program = visitor.studyProgram?.trim() || 'Tidak diketahui';
    programs.set(program, (programs.get(program) || 0) + 1);
  }
  return NextResponse.json({
    success: true,
    data: {
      generatedAt: new Date(),
      totals: { visitors: visitors.length, repositoryCount, repositoryAccesses, averageDurationMinutes, satisfactionAverage: ratings._avg.satisfactionRating, satisfactionResponses: ratings._count.satisfactionRating },
      monthlyVisits: [...monthly].sort(([a], [b]) => a.localeCompare(b)).slice(-12).map(([month, count]) => ({ month, count })),
      programs: [...programs].sort((a, b) => b[1] - a[1]).slice(0, 10).map(([name, count]) => ({ name, count })),
      resources: resourceAccesses.map(item => ({ name: item.resourceName, count: item._count.resourceName })),
    },
  });
}
