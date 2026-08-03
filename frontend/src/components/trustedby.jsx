function TrustedBy() {
  return (
    <section className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-8">

        <p className="text-center text-sm font-semibold uppercase tracking-[4px] text-gray-500">
          Trusted by innovative businesses
        </p>

        <div className="mt-12 flex flex-wrap justify-center items-center gap-12">

          <div className="text-3xl font-bold text-gray-400 transition duration-300 hover:text-blue-600 cursor-pointer">
            Microsoft
          </div>

          <div className="text-3xl font-bold text-gray-400 transition duration-300 hover:text-blue-600 cursor-pointer">
            Amazon
          </div>

          <div className="text-3xl font-bold text-gray-400 transition duration-300 hover:text-blue-600 cursor-pointer">
            Google
          </div>

          <div className="text-3xl font-bold text-gray-400 transition duration-300 hover:text-blue-600 cursor-pointer">
            Spotify
          </div>

          <div className="text-3xl font-bold text-gray-400 transition duration-300 hover:text-blue-600 cursor-pointer">
            Netflix
          </div>

        </div>
      </div>
    </section>
  );
}

export default TrustedBy;