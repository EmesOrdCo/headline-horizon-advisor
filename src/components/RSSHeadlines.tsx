
import { ScrollArea } from "@/components/ui/scroll-area";

const RSSHeadlines = () => {
  return (
    <div className="bg-white shadow-sm border border-gray-200 dark:bg-slate-800 dark:border-slate-700 rounded-xl p-6 h-[600px] flex flex-col sticky top-6">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Recent Headlines</h3>
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <div className="text-gray-400 dark:text-slate-500 mb-4">
            <svg className="w-16 h-16 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
            </svg>
          </div>
          <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            Headlines Not Available in Beta
          </h4>
          <p className="text-gray-600 dark:text-slate-400 text-sm">
            RSS news feeds are coming soon in the full release.
          </p>
        </div>
      </div>
    </div>
  );
};

export default RSSHeadlines;
