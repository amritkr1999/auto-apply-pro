import React, { useEffect, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";

export const UnsubscribePage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [message, setMessage] = useState("Processing your unsubscribe request...");

  useEffect(() => {
    const token = searchParams.get("token");
    if (!token) {
      setStatus("error");
      setMessage("Invalid request. Unsubscribe token is missing.");
      return;
    }

    // Call backend API to unsubscribe
    fetch("http://localhost:8060/api/v1/marketing/unsubscribe", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ token }),
    })
      .then((res) => {
        if (res.ok) {
          setStatus("success");
          setMessage("You have been successfully unsubscribed from our marketing and promotional emails.");
        } else {
          res.json().then((data) => {
            setStatus("error");
            setMessage(data.message || "Failed to unsubscribe. The token may be invalid or expired.");
          }).catch(() => {
            setStatus("error");
            setMessage("Failed to unsubscribe. The token may be invalid or expired.");
          });
        }
      })
      .catch(() => {
        setStatus("error");
        setMessage("An error occurred. Please check your connection and try again.");
      });
  }, [searchParams]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 border border-slate-100 text-center">
        <div className="flex justify-center mb-6">
          <div className="w-16 h-16 bg-indigo-50 rounded-full flex items-center justify-center text-indigo-600">
            <svg
              className="w-8 h-8"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 19v-8.93a2 2 0 01.89-1.664l8-5.333a2 2 0 012.22 0l8 5.333A2 2 0 0121 10.07V19M3 19a2 2 0 002 2h14a2 2 0 002-2M3 19l6.75-4.5M21 19l-6.75-4.5M3 10l6.75 4.5M21 10l-6.75 4.5m0 0l-1.14.76a2 2 0 01-2.22 0l-1.14-.76"
              />
            </svg>
          </div>
        </div>

        <h1 className="text-2xl font-bold text-slate-900 mb-2">Email Preferences</h1>

        <div className="py-4">
          {status === "loading" && (
            <div className="flex flex-col items-center">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600 mb-4"></div>
              <p className="text-slate-600 text-sm font-medium">{message}</p>
            </div>
          )}

          {status === "success" && (
            <div className="space-y-4">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-green-100 text-green-600 mb-2">
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <p className="text-slate-700 font-semibold text-base">{message}</p>
              <p className="text-xs text-slate-500 leading-relaxed">
                It may take up to 24 hours for this to take full effect across our systems. We respect your privacy.
              </p>
            </div>
          )}

          {status === "error" && (
            <div className="space-y-4">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-red-100 text-red-600 mb-2">
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
              <p className="text-slate-700 font-semibold text-base">{message}</p>
            </div>
          )}
        </div>

        <div className="mt-8 pt-6 border-t border-slate-100">
          <Link
            to="/"
            className="inline-flex items-center justify-center w-full px-5 py-3 border border-transparent text-sm font-semibold rounded-xl text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 shadow-lg shadow-indigo-100 transition-all hover:-translate-y-0.5 active:translate-y-0"
          >
            Go to Home Page
          </Link>
        </div>
      </div>
    </div>
  );
};

export default UnsubscribePage;
