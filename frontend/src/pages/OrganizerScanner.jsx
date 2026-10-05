
import { useEffect, useState } from "react";
import { Html5QrcodeScanner } from "html5-qrcode";
import axios from "axios";
import { Link } from "react-router-dom";

export default function OrganizerScanner() {
  const [result, setResult] = useState(null);
  const [message, setMessage] = useState("");
  const [scanKey, setScanKey] = useState(0);

  useEffect(() => {
    const scanner = new Html5QrcodeScanner(
      "qr-reader",
      {
        fps: 10,
        qrbox: { width: 220, height: 220 },
      },
      false
    );

    let processing = false;
    let active = true;

    const onScanSuccess = async (decodedText) => {
      if (processing || !active) return;
      processing = true;

      setMessage("Verifying QR pass...");
      setResult(null);

      try {
        await scanner.clear();

        const token = localStorage.getItem("token");

        const response = await axios.post(
          "https://campusconnect-backend-r9m6.onrender.com/api/registrations/verify",
          { qrToken: decodedText },
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (active) {
          setResult({
            success: true,
            message: response.data.message,
            event: response.data.event,
            status: response.data.status,
          });
          setMessage("");
        }
      } catch (error) {
        if (active) {
          setResult({
            success: false,
            message:
              error.response?.data?.message ||
              "Unable to verify QR pass. Please try again.",
          });
          setMessage("");
        }
      }
    };

    scanner.render(onScanSuccess, () => {});

    return () => {
      active = false;
      scanner.clear().catch(() => {});
    };
  }, [scanKey]);

  const scanAgain = () => {
    setResult(null);
    setMessage("");
    setScanKey((key) => key + 1);
  };

  return (
    <div className="min-h-screen w-full overflow-x-hidden bg-gray-50 px-4 py-6 sm:px-6 sm:py-10">
      <div className="mx-auto w-full max-w-2xl min-w-0 rounded-xl bg-white p-4 shadow sm:p-6">
        <h1 className="mb-2 break-words text-2xl font-bold text-gray-900 sm:text-3xl">
          Organizer QR Scanner
        </h1>

        <p className="mb-5 text-sm leading-relaxed text-gray-600 sm:mb-6 sm:text-base">
          Scan a student's QR pass to verify registration and mark attendance.
        </p>

        {!result && (
          <>
            <div className="w-full min-w-0 overflow-hidden rounded-lg">
              <div
                id="qr-reader"
                className="mx-auto w-full max-w-md overflow-hidden"
              />
            </div>

            {message && (
              <p className="mt-4 break-words text-center text-sm font-medium text-blue-600 sm:text-base">
                {message}
              </p>
            )}
          </>
        )}

        {result && (
          <div
            className={`mt-5 break-words rounded-xl p-4 sm:mt-6 sm:p-5 ${
              result.success
                ? "bg-green-50 text-green-800"
                : "bg-red-50 text-red-800"
            }`}
          >
            <h2 className="mb-2 text-lg font-semibold sm:text-xl">
              {result.success
                ? "Attendance Verified"
                : "Verification Failed"}
            </h2>

            <p className="text-sm leading-relaxed sm:text-base">
              {result.message}
            </p>

            {result.success && (
              <div className="mt-3 space-y-2 text-sm sm:text-base">
                <p className="break-words">
                  <strong>Event:</strong> {result.event}
                </p>
                <p className="break-words">
                  <strong>Status:</strong> {result.status}
                </p>
              </div>
            )}

            <button
              onClick={scanAgain}
              className="mt-5 min-h-11 w-full rounded-lg bg-blue-600 px-5 py-3 text-sm font-medium text-white hover:bg-blue-700 sm:w-auto sm:text-base"
            >
              Scan Another Pass
            </button>
          </div>
        )}

        <Link
          to="/events"
          className="mt-5 inline-flex min-h-11 items-center text-sm text-blue-600 hover:underline sm:mt-6 sm:text-base"
        >
          Back to Events
        </Link>
      </div>
    </div>
  );
}
