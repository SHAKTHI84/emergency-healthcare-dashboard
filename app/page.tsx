export default function HomePage() {
  return (
    <div className="min-h-screen bg-blue-700 text-white flex items-center justify-center p-6">
      <div className="max-w-xl">
        <h1 className="text-4xl sm:text-5xl font-bold mb-6">
          India Emergency Healthcare Dashboard
        </h1>
        <p className="text-xl mb-8">
          A real-time emergency management system providing critical information during health emergencies
        </p>
        <div className="p-4 bg-white text-black rounded-lg shadow-lg">
          <h2 className="text-2xl font-bold mb-4 text-blue-700">Docker Preview</h2>
          <p className="mb-4">
            The Docker container is running successfully! This is a simplified version of the application.
          </p>
          <p>
            For the full application experience, please run the application in development mode.
          </p>
        </div>
      </div>
    </div>
  );
}
