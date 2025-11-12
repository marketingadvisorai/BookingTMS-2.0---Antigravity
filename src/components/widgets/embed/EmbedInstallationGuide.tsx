import { Card, CardContent, CardHeader, CardTitle } from '../../ui/card';
import { Separator } from '../../ui/separator';

export function EmbedInstallationGuide() {
  return (
    <Card className="border-gray-200 dark:border-[#2a2a2a] shadow-sm">
      <CardHeader className="p-4 sm:p-6">
        <CardTitle className="text-base sm:text-lg">Installation Guide</CardTitle>
      </CardHeader>
      <CardContent className="p-4 sm:p-6 pt-0">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
          <div>
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-100 dark:bg-[#4f46e5]/20 rounded-lg flex items-center justify-center mb-3 sm:mb-4">
              <span className="text-blue-600 dark:text-[#6366f1] text-sm sm:text-base font-semibold">
                1
              </span>
            </div>
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">
              Choose Template
            </h3>
            <p className="text-xs sm:text-sm text-gray-600 dark:text-[#a3a3a3]">
              Select the booking widget template that best fits your website design and user flow
            </p>
          </div>
          <div>
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-100 dark:bg-[#4f46e5]/20 rounded-lg flex items-center justify-center mb-3 sm:mb-4">
              <span className="text-blue-600 dark:text-[#6366f1] text-sm sm:text-base font-semibold">
                2
              </span>
            </div>
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">
              Customize Colors
            </h3>
            <p className="text-xs sm:text-sm text-gray-600 dark:text-[#a3a3a3]">
              Adjust the primary color to match your brand. The widget will automatically adapt
            </p>
          </div>
          <div>
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-100 dark:bg-[#4f46e5]/20 rounded-lg flex items-center justify-center mb-3 sm:mb-4">
              <span className="text-blue-600 dark:text-[#6366f1] text-sm sm:text-base font-semibold">
                3
              </span>
            </div>
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">
              Copy & Paste Code
            </h3>
            <p className="text-xs sm:text-sm text-gray-600 dark:text-[#a3a3a3]">
              Copy the embed code and paste it into your website. Replace YOUR_WIDGET_ID with your actual ID
            </p>
          </div>
        </div>

        <Separator className="my-4 sm:my-6" />

        <div className="bg-blue-50 dark:bg-[#4f46e5]/10 border border-blue-200 dark:border-[#4f46e5]/30 rounded-lg p-3 sm:p-4">
          <h3 className="text-xs sm:text-sm font-semibold text-blue-900 dark:text-[#6366f1] mb-1 sm:mb-2">
            💡 Pro Tip
          </h3>
          <p className="text-xs sm:text-sm text-blue-700 dark:text-[#818cf8]">
            Need help with installation? Contact our support team or check out our detailed integration guides in the documentation.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
