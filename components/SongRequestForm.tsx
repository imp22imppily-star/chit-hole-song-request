"use client";

import { FormEvent, useMemo, useState } from "react";
import { Music2, Send } from "lucide-react";
import { supabase } from "@/lib/supabase";

const COOLDOWN_MS = 3 * 60 * 1000;
const STORAGE_KEY = "chit-hole-last-song-request";

type SongRequestFormProps = {
  tableNumber?: string;
};

function minutesLeft(lastSentAt: number) {
  const remaining = Math.ceil((COOLDOWN_MS - (Date.now() - lastSentAt)) / 60000);
  return Math.max(1, remaining);
}

export function SongRequestForm({ tableNumber }: SongRequestFormProps) {
  const [songTitle, setSongTitle] = useState("");
  const [artist, setArtist] = useState("");
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "success" | "error">("idle");
  const [notice, setNotice] = useState("");

  const title = useMemo(
    () => (tableNumber ? `โต๊ะ ${tableNumber} ขอเพลง` : "ขอเพลง"),
    [tableNumber]
  );

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setNotice("");

    const cleanSongTitle = songTitle.trim();
    if (!cleanSongTitle) {
      setNotice("กรุณาใส่ชื่อเพลง");
      return;
    }

    const lastSentAt = Number(window.localStorage.getItem(STORAGE_KEY) ?? 0);
    if (lastSentAt && Date.now() - lastSentAt < COOLDOWN_MS) {
      setNotice(`ขอเพลงได้อีกครั้งในอีก ${minutesLeft(lastSentAt)} นาที`);
      return;
    }

    setStatus("sending");

    const { error } = await supabase.from("song_requests").insert({
      table_number: tableNumber ?? null,
      song_title: cleanSongTitle,
      artist: artist.trim() || null,
      message: message.trim() || null
    });

    if (error) {
      setStatus("error");
      setNotice("ส่งไม่สำเร็จ กรุณาลองใหม่อีกครั้ง");
      return;
    }

    window.localStorage.setItem(STORAGE_KEY, String(Date.now()));
    setSongTitle("");
    setArtist("");
    setMessage("");
    setStatus("success");
    setNotice("ส่งคำขอเพลงแล้ว ขอบคุณครับ 🍻");
  }

  return (
    <main className="relative min-h-screen overflow-hidden bg-black px-4 py-6 text-stone-50">
      <div
        className="absolute inset-0 bg-cover bg-center opacity-35"
        style={{ backgroundImage: "url('/IllustrationChiangmai.jpg')" }}
        aria-hidden="true"
      />
      <div className="absolute inset-0 bg-black/68" aria-hidden="true" />

      <section className="relative mx-auto flex min-h-[calc(100vh-3rem)] w-full max-w-2xl flex-col justify-center">
        <div className="mb-6 text-center">
          <h1 className="text-4xl font-black leading-tight text-white md:text-6xl">{title}</h1>
        </div>

        <form
          onSubmit={handleSubmit}
          className="rounded-lg border border-[#d8ad24]/30 bg-black p-5 shadow-2xl shadow-black md:p-7"
        >
          <label className="block">
            <span className="mb-2 block text-sm font-bold text-stone-200">ชื่อเพลง</span>
            <input
              value={songTitle}
              onChange={(event) => setSongTitle(event.target.value)}
              placeholder="ชื่อเพลง"
              className="h-16 w-full rounded-md border border-white/15 bg-[#080808] px-4 text-xl text-white outline-none transition placeholder:text-stone-400 focus:border-[#d8ad24] focus:ring-2 focus:ring-[#d8ad24]/20"
              required
            />
          </label>

          <label className="mt-4 block">
            <span className="mb-2 block text-sm font-bold text-stone-200">ศิลปิน</span>
            <input
              value={artist}
              onChange={(event) => setArtist(event.target.value)}
              placeholder="ศิลปิน ถ้ามี"
              className="h-16 w-full rounded-md border border-white/15 bg-[#080808] px-4 text-xl text-white outline-none transition placeholder:text-stone-400 focus:border-[#d8ad24] focus:ring-2 focus:ring-[#d8ad24]/20"
            />
          </label>

          <label className="mt-4 block">
            <span className="mb-2 block text-sm font-bold text-stone-200">ข้อความเพิ่มเติม</span>
            <textarea
              value={message}
              onChange={(event) => setMessage(event.target.value)}
              placeholder="ข้อความเพิ่มเติม เช่น เพลงนี้ให้เพื่อน"
              rows={5}
              className="w-full resize-none rounded-md border border-white/15 bg-[#080808] px-4 py-3 text-xl text-white outline-none transition placeholder:text-stone-400 focus:border-[#d8ad24] focus:ring-2 focus:ring-[#d8ad24]/20"
            />
          </label>

          <button
            type="submit"
            disabled={status === "sending"}
            className="mt-6 flex h-16 w-full items-center justify-center gap-2 rounded-md bg-[#d8ad24] px-5 text-xl font-black text-black transition hover:bg-[#efc447] disabled:cursor-wait disabled:opacity-70"
          >
            {status === "sending" ? (
              "กำลังส่ง..."
            ) : (
              <>
                <Send size={22} aria-hidden="true" />
                ส่งคำขอเพลง
              </>
            )}
          </button>

          {notice ? (
            <div
              className={`mt-4 rounded-md border px-4 py-3 text-center text-base font-bold ${
                status === "success"
                  ? "border-emerald-400/30 bg-emerald-400/10 text-emerald-200"
                  : "border-[#d8ad24]/30 bg-[#d8ad24]/10 text-[#e9c85b]"
              }`}
              role="status"
            >
              {notice}
            </div>
          ) : null}
        </form>

        <div className="mt-5 rounded-lg border border-[#d8ad24]/25 bg-black px-5 py-4 text-white shadow-xl shadow-black/40">
          <p className="flex items-start gap-2 text-base font-bold leading-7">
            <Music2 className="mt-1 shrink-0 text-[#d8ad24]" size={18} aria-hidden="true" />
            การเล่นเพลงขึ้นอยู่กับความเหมาะสมของนักดนตรีและเวลาการแสดง
          </p>
          <p className="mt-2 text-base font-bold leading-7 text-[#f2d879]">
            ให้ทิปนักดนตรีกับตัวนักดนตรีเองได้เลย
          </p>
          <div className="mt-4 border-t border-white/10 pt-4 text-sm leading-7 text-stone-100">
            <p className="font-black text-[#d8ad24]">📌 เงื่อนไขการรับคำขอเพลง</p>
            <p>• การรับคำขอเพลงจะสิ้นสุดลงเมื่อจบการแสดงในแต่ละรอบ</p>
            <p>• หากท่านต้องการให้ศิลปินแสดงต่อ สามารถแจ้งพนักงานเพื่อต่อเวลาได้</p>
            <p>
              • การต่อเวลาการแสดง รบกวนท่านลูกค้าชำระค่าใช้จ่าย
              ตามอัตราค่าจ้างต่อชั่วโมงจริงของศิลปิน ล่วงหน้าค่ะ/ครับ
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
