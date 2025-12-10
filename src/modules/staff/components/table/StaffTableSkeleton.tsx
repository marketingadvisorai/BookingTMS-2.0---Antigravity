/**
 * Staff Table Skeleton Component
 * Loading skeleton for staff table
 * @module staff/components/table/StaffTableSkeleton
 */

import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

interface StaffTableSkeletonProps {
  isDark: boolean;
}

export function StaffTableSkeleton({ isDark }: StaffTableSkeletonProps) {
  const cardBgClass = isDark ? 'bg-[#161616]' : 'bg-white';
  const borderClass = isDark ? 'border-[#2a2a2a]' : 'border-gray-200';
  const textMutedClass = isDark ? 'text-[#a3a3a3]' : 'text-gray-600';
  const skeletonBg = isDark ? 'bg-[#2a2a2a]' : 'bg-gray-200';

  return (
    <Card className={`${cardBgClass} border ${borderClass} shadow-sm`}>
      <CardHeader className="p-6">
        <Skeleton className={`h-6 w-32 ${skeletonBg}`} />
      </CardHeader>
      <CardContent className="p-6 pt-0">
        {/* Mobile skeleton cards */}
        <div className="sm:hidden space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className={`rounded-lg border p-4 ${borderClass}`}>
              <div className="flex items-center gap-3 mb-3">
                <Skeleton className={`w-10 h-10 rounded-full ${skeletonBg}`} />
                <div className="flex-1">
                  <Skeleton className={`h-4 w-24 mb-2 ${skeletonBg}`} />
                  <Skeleton className={`h-3 w-16 ${skeletonBg}`} />
                </div>
              </div>
              <Skeleton className={`h-3 w-full mb-2 ${skeletonBg}`} />
              <Skeleton className={`h-3 w-3/4 ${skeletonBg}`} />
            </div>
          ))}
        </div>
        
        {/* Desktop skeleton table */}
        <div className="hidden sm:block">
          <table className="w-full">
            <thead>
              <tr className={`border-b ${borderClass}`}>
                {['Member', 'Contact', 'Role', 'Department', 'Join Date', 'Status', 'Actions'].map((h) => (
                  <th key={h} className={`text-left py-3 px-4 text-sm ${textMutedClass}`}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {[1, 2, 3, 4, 5].map((i) => (
                <tr key={i} className={`border-b ${borderClass}`}>
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-3">
                      <Skeleton className={`w-10 h-10 rounded-full ${skeletonBg}`} />
                      <div>
                        <Skeleton className={`h-4 w-24 mb-2 ${skeletonBg}`} />
                        <Skeleton className={`h-3 w-32 ${skeletonBg}`} />
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <Skeleton className={`h-3 w-36 mb-2 ${skeletonBg}`} />
                    <Skeleton className={`h-3 w-24 ${skeletonBg}`} />
                  </td>
                  <td className="py-4 px-4">
                    <Skeleton className={`h-5 w-16 rounded-full ${skeletonBg}`} />
                  </td>
                  <td className="py-4 px-4">
                    <Skeleton className={`h-3 w-20 ${skeletonBg}`} />
                  </td>
                  <td className="py-4 px-4">
                    <Skeleton className={`h-3 w-24 ${skeletonBg}`} />
                  </td>
                  <td className="py-4 px-4">
                    <Skeleton className={`h-5 w-16 ${skeletonBg}`} />
                  </td>
                  <td className="py-4 px-4">
                    <Skeleton className={`h-8 w-8 rounded ${skeletonBg}`} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}
