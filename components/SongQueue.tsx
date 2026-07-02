"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Check, Clock3, Music, Trash2 } from "lucide-react";
import { SongRequest, supabase } from "@/lib/supabase";

function formatTime(value: string) {
  return new Intl.DateTimeFormat("th-TH", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false
  }).format(new Date(value));
}

export function SongQueue() {
  const [requests, setRequests] = useState<SongRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  const fetchRequests = useCallback(async () => {
    const { data, error } = await supabase
      .from("song_requests")
      .select("*")
      .order("created_at", { ascending: true });

    if (error) {
      setErrorMessage("โหลดคิวเพลงไม่สำเร็จ");
    } else {
      setRequests((data ?? []) as SongRequest[]);
      setErrorMessage("");
    }

    setIsLoading(false);
  }, []);

  useEffect(() => {
    fetchRequests();

    const channel = supabase
      .channel("song-requests-queue")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "song_requests" },
        () => fetchRequests()
      )
      .subscribe();

    const fallback = window.setInterval(fetchRequests, 5000);

    return () => {
      window.clearInterval(fallback);
      supabase.removeChannel(channel);
    };
  }, [fetchRequests]);

  const pendingCount = useMemo(
    () => requests.filter((request) => request.status === "pending").length,
    [requests]
  );
  const countText = useMemo(() => `รอเล่น ${pendingCount} เพลง`, [pendingCount]);

  async function markDone(id: string) {
    const { error } = await supabase.from("song_requests").update({ status: "done" }).eq("id", id);

    if (error) {
      setErrorMessage("เปลี่ยนสถานะเพลงไม่สำเร็จ");
      return;
    }

    setRequests((currentRequests) =>
      currentRequests.map((request) =>
        request.id === id ? { ...request, status: "done" } : request
      )
    );
    setErrorMessage("");
  }

  async function deleteRequest(id: string) {
    await supabase.from("song_requests").delete().eq("id", id);
    fetchRequests();
  }

  async function clearQueue() {
    await supabase.from("song_requests").delete().eq("status", "pending");
    fetchRequests();
  }

  return (
    <main className="relative min-h-screen overflow-hidden bg-black px-4 py-5 text-stone-50 md:px-8">
      <div
        className="absolute inset-0 bg-cover bg-center opacity-16"
        style={{ backgroundImage: "url('/IllustrationChiangmai.jpg')" }}
        aria-hidden="true"
      />
      <div className="absolute inset-0 bg-black/90" aria-hidden="true" />

      <section className="relative mx-auto max-w-6xl">
        <header className="border-b border-white/10 pb-5">
          <div className="flex flex-col items-center text-center">
            <p className="text-sm font-black uppercase tracking-[0.22em] text-[#d8ad24]">
              CHIT HOLE Song Queue
            </p>
            <h1 className="mt-3 text-4xl font-black leading-tight md:text-6xl">{countText}</h1>
          </div>
          <div className="mt-4 flex justify-center">
          <button
            type="button"
            onClick={clearQueue}
            disabled={pendingCount === 0}
            className="flex min-h-14 items-center justify-center gap-2 rounded-md border border-red-400/30 bg-red-500/10 px-5 py-3 text-lg font-black text-red-100 transition hover:bg-red-500/20 disabled:cursor-not-allowed disabled:opacity-40"
          >
            <Trash2 size={22} aria-hidden="true" />
            ล้างคิวคืนนี้
          </button>
          </div>
        </header>

        {errorMessage ? (
          <div className="mt-5 rounded-md border border-red-400/30 bg-red-500/10 px-4 py-3 text-red-100">
            {errorMessage}
          </div>
        ) : null}

        {isLoading ? (
          <div className="mt-8 rounded-lg border border-[#d8ad24]/20 bg-[#0b0b0a]/95 p-8 text-center text-2xl font-black text-stone-300">
            กำลังโหลดคิวเพลง...
          </div>
        ) : requests.length === 0 ? (
          <div className="mt-8 grid min-h-[50vh] place-items-center rounded-lg border border-[#d8ad24]/20 bg-[#0b0b0a]/95 p-8 text-center">
            <div>
              <Music className="mx-auto text-[#d8ad24]" size={48} aria-hidden="true" />
              <p className="mt-5 text-3xl font-black text-stone-100">ยังไม่มีคำขอเพลง</p>
            </div>
          </div>
        ) : (
          <div className="mt-6 grid gap-4">
            {requests.map((request) => (
              <article
                key={request.id}
                className={`rounded-lg border p-4 shadow-xl shadow-black/30 md:p-5 ${
                  request.status === "done"
                    ? "border-emerald-300 bg-emerald-500 text-black"
                    : "border-[#d8ad24]/20 bg-[#0b0b0a]/95"
                }`}
              >
                <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                  <div className="min-w-0">
                    <div
                      className={`flex flex-wrap items-center gap-3 text-base font-black ${
                        request.status === "done" ? "text-black" : "text-[#d8ad24]"
                      }`}
                    >
                      <span>{request.table_number ? `โต๊ะ ${request.table_number}` : "ไม่ระบุโต๊ะ"}</span>
                      {request.status === "done" ? (
                        <span className="rounded-full bg-black px-3 py-1 text-sm text-emerald-200">
                          เล่นแล้ว
                        </span>
                      ) : null}
                      <span
                        className={`flex items-center gap-1 ${
                          request.status === "done" ? "text-black/70" : "text-stone-400"
                        }`}
                      >
                        <Clock3 size={17} aria-hidden="true" />
                        {formatTime(request.created_at)}
                      </span>
                    </div>
                    <h2
                      className={`mt-3 break-words text-3xl font-black leading-tight md:text-5xl ${
                        request.status === "done" ? "text-black" : "text-white"
                      }`}
                    >
                      {request.song_title}
                    </h2>
                    {request.artist ? (
                      <p
                        className={`mt-2 break-words text-xl font-bold ${
                          request.status === "done" ? "text-black/80" : "text-stone-300"
                        }`}
                      >
                        {request.artist}
                      </p>
                    ) : null}
                    {request.message ? (
                      <p
                        className={`mt-4 break-words rounded-md border px-4 py-3 text-lg leading-7 ${
                          request.status === "done"
                            ? "border-black/15 bg-black/10 text-black"
                            : "border-[#d8ad24]/20 bg-[#d8ad24]/10 text-[#f2d879]"
                        }`}
                      >
                        {request.message}
                      </p>
                    ) : null}
                  </div>

                  <div className="grid shrink-0 grid-cols-2 gap-2 md:w-56 md:grid-cols-1">
                    <button
                      type="button"
                      onClick={() => markDone(request.id)}
                      disabled={request.status === "done"}
                      className={`flex min-h-12 items-center justify-center gap-2 rounded-md px-4 py-3 text-base font-black text-black transition disabled:cursor-default disabled:opacity-90 ${
                        request.status === "done"
                          ? "bg-emerald-300 hover:bg-emerald-300"
                          : "bg-[#d8ad24] hover:bg-[#efc447]"
                      }`}
                    >
                      <Check size={21} aria-hidden="true" />
                      {request.status === "done" ? "เล่นแล้ว" : "รอดำเนินการ"}
                    </button>
                    <button
                      type="button"
                      onClick={() => deleteRequest(request.id)}
                      className="flex min-h-12 items-center justify-center gap-2 rounded-md border border-red-400/30 bg-red-500/10 px-4 py-3 text-base font-black text-red-100 transition hover:bg-red-500/20"
                    >
                      <Trash2 size={21} aria-hidden="true" />
                      ลบ
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
