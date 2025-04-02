'use client';
import Head from "next/head";
import { useRouter } from "next/navigation";

export default function Gracias() {
  const router = useRouter();

  function handleReturn() {
    // Check if there's a previous route in the history; otherwise, navigate to the homepage
    if (window.history.length > 1) {
      router.back();
    } else {
      router.push("/");
    }
  }

  return (
    <>
      <Head>
        <title>Gracias</title>
        <meta name="description" content="Gracias por compartir tus recuerdos" />
        <link rel="icon" href="/favicon.ico" />
        {/* Import Google Fonts */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" />
        <link
          href="https://fonts.googleapis.com/css2?family=Dancing+Script:wght@400..700&family=Nunito:ital,wght@0,200..1000;1,200..1000&family=Open+Sans:ital,wght@0,300..800;1,300..800&display=swap"
          rel="stylesheet"
        />
      </Head>

      <main className="min-h-screen bg-gradient-to-br from-green-100 to-red-100 flex flex-col items-center justify-center p-4">
        <section className="w-full max-w-md bg-white shadow-xl rounded-lg p-8 text-center">
          <h1
            className="text-4xl font-bold mb-4 text-black"
            style={{ fontFamily: "Nunito, sans-serif" }}
          >
            ¡Gracias por compartir tus recuerdos en fotos!
          </h1>
          <p
            className="text-lg text-gray-700"
            style={{ fontFamily: "Nunito, sans-serif" }}
          >
            Tu aporte hará que este día sea aún más especial.
          </p>

          <button
            onClick={handleReturn}
            className="w-full py-2 bg-pink-500 hover:bg-blue-600 text-white font-semibold rounded-md transition duration-300 mt-4"
          >
            Regresar a la página anterior
          </button>
        </section>
      </main>
    </>
  );
}
