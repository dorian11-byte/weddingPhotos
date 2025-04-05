'use client';
// pages/index.tsx
import Head from "next/head";
import { useState } from "react";
import { useRouter } from "next/navigation";
import imageCompression from "browser-image-compression"; // Import the compression library

export default function Home() {
  const router = useRouter();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [uploadError, setUploadError] = useState("");

  // Opens the dialog and resets states
  const handleOpenDialog = () => {
    console.log("handleOpenDialog");
    setIsDialogOpen(true);
    setSelectedFiles([]);
    setPreviews([]);
    setError("");
    setUploadError("");
    setLoading(false);
  };

  // Closes the dialog and revokes preview URLs
  const handleCloseDialog = () => {
    previews.forEach(url => URL.revokeObjectURL(url));
    setIsDialogOpen(false);
    setSelectedFiles([]);
    setPreviews([]);
    setError("");
    setUploadError("");
    setLoading(false);
  };

  // Handles file changes, compresses new images, and adds them
  const handleFilesChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      // Limit the total number of images to 5
      if (selectedFiles.length + newFiles.length > 5) {
        setError("Solo puedes subir hasta 5 fotos.");
        return;
      }
      setError("");
      // Set compression options (adjust as needed)
      const options = {
        maxSizeMB: 0.5, // Target maximum size (0.5 MB)
        maxWidthOrHeight: 1920, // Maximum width or height
        useWebWorker: true,
      };

      try {
        // Compress new files in parallel
        const compressedFiles = await Promise.all(
          newFiles.map(async file => await imageCompression(file, options))
        );
        setSelectedFiles(prev => [...prev, ...compressedFiles]);
        const newPreviews = compressedFiles.map(file => URL.createObjectURL(file));
        setPreviews(prev => [...prev, ...newPreviews]);
        e.target.value = "";
      } catch (err) {
        console.error("Error compressing images:", err);
        setError("Error al comprimir las imágenes. Intenta de nuevo.");
      }
    }
  };

  // Allows removal of a photo by index
  const handleRemovePhoto = (index: number) => {
    URL.revokeObjectURL(previews[index]);
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
    setPreviews(prev => prev.filter((_, i) => i !== index));
  };

  // Sends photos to the API endpoint using FormData and navigates to the "Gracias" page
  const handleSendPhotos = async () => {
    if (selectedFiles.length === 0 || error) return;
    setLoading(true);
    setUploadError("");
    try {
      const formData = new FormData();
      selectedFiles.forEach(file => {
        formData.append("files", file);
      });
      const response = await fetch("/api/uploadPhotos", {
        method: "POST",
        body: formData
      });
      if (response.ok) {
        router.push("/gracias");
      } else {
        const data = await response.json();
        setUploadError(data.error || "Error al subir las fotos");
        setLoading(false);
      }
    } catch (err) {
      console.error("Error uploading files:", err);
      setUploadError("Error al subir las fotos, por favor inténtalo de nuevo.");
      setLoading(false);
    }
  };

  return (
    <>
      <Head>
        <title>Fabiola & Martin</title>
        <meta name="description" content="Sube tus fotos para la boda" />
        <link rel="icon" href="/favicon.ico" />
        {/* Import Google Fonts */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" />
        <link
          href="https://fonts.googleapis.com/css2?family=Dancing+Script:wght@400..700&family=Lobster:wght@400..700&family=Nunito:ital,wght@0,200..1000;1,200..1000&family=Open+Sans:ital,wght@0,300..800;1,300..800&family=Pacifico&display=swap"
          rel="stylesheet"
        />
      </Head>

      <main className="min-h-screen bg-white flex flex-col items-center">
        {/* Main container */}
        <section className="w-full max-w-md relative">
          {/* Background image with text overlay */}
          <div className="w-full h-auto relative">
            <img
              src="/img2.jpeg"
              alt="Wedding photo"
              className="w-full h-auto object-cover"
            />
            <div className="absolute top-0 left-0 w-full h-265 flex flex-col items-center justify-center bg-opacity-50 text-white text-center p-6">
              <h1
                className="text-5xl font-bold text-white rounded-md p-1"
                style={{ fontFamily: "Dancing Script, cursive" }}
              >
                Fabiola & Martin
              </h1>
              <p
                className="text-4xl mt-0 text-white rounded-md p-1 text-bold"
                style={{ fontFamily: "Dancing Script, cursive" }}
              >
                5 de Abril - Despedida de amigos.
              </p>
            </div>
            <div className="absolute top-0 left-0 right-0 w-full h-90 flex flex-col items-center justify-center bg-opacity-50 text-white text-center p-0">
              <img
                src="/flores3.png"
                alt="Wedding photo"
                className="w-full h-auto object-cover"
              />
            </div>
          </div>
          
          {/* Information and button (with higher z-index) */}
          <div className="text-center py-6 px-4 mt-2 relative z-10">
            <p
              className="text-2xl mt-2 text-black"
              style={{ fontFamily: "Dancing Script, cursive" }}
            >
              Agrega aquí tus fotos durante el evento
            </p>
            <button
              onClick={handleOpenDialog}
              className="w-full mt-4 py-2 bg-red-300 hover:bg-blue-600 text-black font-semibold rounded-full transition duration-300"
              style={{ fontFamily: "Lobster, sans-serif" }}
            >
              Subir fotos del recuerdo
            </button>
          </div>
        </section>

        {/* Modal for selecting photos */}
        {isDialogOpen && (
          <div className="fixed inset-0 flex items-center justify-center bg-red-100 bg-opacity-50 z-50 p-4">
            <div className="rounded-lg p-6 max-w-lg w-full max-h-[90vh] overflow-y-auto bg-white shadow-xl">
              <div className="w-full h-auto relative border-gray-300 rounded-md mb-4">
                <img
                  src="/camera1.png"
                  alt="Camera"
                  className="w-full h-auto object-cover rounded-md"
                />
              </div>
          
              <h2
                className="text-2xl font-bold mb-4 text-black"
                style={{ fontFamily: "Lobster, sans-serif" }}
              >
                Selecciona hasta 5 fotos
              </h2>
          
              {/* Hidden file input */}
              <input
                type="file"
                id="fileInput"
                multiple
                accept="image/png, image/jpg, image/jpeg, image/webp"
                onChange={handleFilesChange}
                className="hidden"
                disabled={loading}
              />
              {/* If no files are selected, show "Seleccionar Fotos" */}
              {selectedFiles.length === 0 && (
                <label
                  htmlFor="fileInput"
                  className={`cursor-pointer inline-block py-2 px-4 bg-red-500 text-black font-semibold rounded-full transition duration-300 mb-4 ${
                    loading ? "opacity-50 cursor-not-allowed" : ""
                  }`}
                >
                  Seleccionar Fotos
                </label>
              )}
              {/* If files exist but less than 5, show "Agregar más fotos" at the bottom */}
              {selectedFiles.length > 0 && selectedFiles.length < 5 && (
                <label
                  htmlFor="fileInput"
                  className={`cursor-pointer inline-block py-2 px-4 bg-blue-500 hover:bg-blue-600 text-black font-semibold rounded-full transition duration-300 mb-4 ${
                    loading ? "opacity-50 cursor-not-allowed" : ""
                  }`}
                >
                  Agregar más fotos
                </label>
              )}
              {error && <p className="text-red-500 mb-4">{error}</p>}
              
              {/* Responsive preview grid with option to delete each photo */}
              {previews.length > 0 && (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2 mb-4">
                  {previews.map((src, index) => (
                    <div key={index} className="relative">
                      <img
                        src={src}
                        alt={`Preview ${index + 1}`}
                        className="w-full h-auto rounded-md"
                      />
                      <button
                        onClick={() => handleRemovePhoto(index)}
                        className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs"
                      >
                        X
                      </button>
                    </div>
                  ))}
                </div>
              )}
              
              {/* Loader and message */}
              {loading && (
                <div className="flex flex-col items-center justify-center mb-4">
                  <svg
                    className="animate-spin h-8 w-8 text-black mb-2"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                    ></path>
                  </svg>
                  <p className="text-black text-center">
                    Enviando fotos, por favor no cierres esta ventana
                  </p>
                </div>
              )}
              
              {/* Centered buttons with rounded borders */}
              <div className="flex justify-center space-x-4 mt-20">
                <button
                  onClick={handleCloseDialog}
                  className="py-2 px-4 bg-gray-300 text-gray-700 rounded-full hover:bg-gray-400 transition"
                  disabled={loading}
                >
                  Cancelar
                </button>
                <button
                  onClick={handleSendPhotos}
                  disabled={selectedFiles.length === 0 || error !== "" || loading}
                  className="py-2 px-4 bg-pink-500 text-white rounded-full hover:bg-green-600 transition disabled:opacity-50"
                >
                  Enviar fotos
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </>
  );
}
