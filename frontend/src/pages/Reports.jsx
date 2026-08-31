import Sidebar from "../components/dashboard/sidebar";
import Topbar from "../components/dashboard/topbar";

function Reports() {

  const downloadPDF = () => {
    window.print();
  };

  return (
    <div className="min-h-screen bg-slate-100 flex">

      <Sidebar />

      <div className="flex-1">

        <Topbar />

        <main className="p-8">

          <h1 className="text-3xl font-bold">
            Reports
          </h1>

          <div className="grid md:grid-cols-3 gap-6 mt-8">

            {["Sales", "Revenue", "Customers"].map((item) => (

              <div
                key={item}
                className="bg-white rounded-2xl p-6 shadow"
              >

                <h2 className="text-xl font-bold">
                  {item} Report
                </h2>

                <p className="text-slate-500 mt-2">
                  Generate business report.
                </p>

                <button
                  onClick={downloadPDF}
                  className="mt-5 bg-blue-600 text-white px-4 py-2 rounded-lg"
                >
                  Download PDF
                </button>

              </div>

            ))}

          </div>

        </main>

      </div>

    </div>
  );
}

export default Reports;