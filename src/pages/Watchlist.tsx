
import DashboardNav from "@/components/DashboardNav";

const Watchlist = () => {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900">
      <DashboardNav />
      
      <main className="pt-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="py-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">
              Watchlist
            </h1>
            
            {/* Content will be added later */}
            <div className="text-center py-12">
              <p className="text-gray-500 dark:text-slate-400">
                Watchlist content coming soon...
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Watchlist;
