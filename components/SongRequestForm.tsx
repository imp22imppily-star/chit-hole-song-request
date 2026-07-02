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
  const subtitle = useMemo(
    () => (tableNumber ? `Table ${tableNumber} Song Request` : "Song Request"),
    [tableNumber]
  );

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setNotice("");

    const cleanSongTitle = songTitle.trim();
    if (!cleanSongTitle) {
      setNotice("กรุณาใส่ชื่อเพลง / Please enter a song title.");
      return;
    }

    const lastSentAt = Number(window.localStorage.getItem(STORAGE_KEY) ?? 0);
    if (lastSentAt && Date.now() - lastSentAt < COOLDOWN_MS) {
      setNotice(
        `ขอเพลงได้อีกครั้งในอีก ${minutesLeft(lastSentAt)} นาที / You can request again in ${minutesLeft(lastSentAt)} minute(s).`
      );
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
      setNotice("ส่งไม่สำเร็จ กรุณาลองใหม่อีกครั้ง / Could not send. Please try again.");
      return;
    }

    window.localStorage.setItem(STORAGE_KEY, String(Date.now()));
    setSongTitle("");
    setArtist("");
    setMessage("");
    setStatus("success");
    setNotice("ส่งคำขอเพลงแล้ว ขอบคุณครับ / Request sent. Thank you. 🍻");
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
          <p className="mt-2 text-lg font-bold text-[#f2d879] md:text-2xl">{subtitle}</p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="rounded-lg border border-[#d8ad24]/30 bg-black p-5 shadow-2xl shadow-black md:p-7"
        >
          <label className="block">
            <span className="mb-2 block text-sm font-bold text-stone-200">
              ชื่อเพลง / Song title
            </span>
            <input
              value={songTitle}
              onChange={(event) => setSongTitle(event.target.value)}
              placeholder="ชื่อเพลง / Song title"
              className="h-16 w-full rounded-md border border-white/15 bg-[#080808] px-4 text-xl text-white outline-none transition placeholder:text-stone-400 focus:border-[#d8ad24] focus:ring-2 focus:ring-[#d8ad24]/20"
              required
            />
          </label>

          <label className="mt-4 block">
            <span className="mb-2 block text-sm font-bold text-stone-200">
              ศิลปิน / Artist
            </span>
            <input
              value={artist}
              onChange={(event) => setArtist(event.target.value)}
              placeholder="ศิลปิน ถ้ามี / Artist, if any"
              className="h-16 w-full rounded-md border border-white/15 bg-[#080808] px-4 text-xl text-white outline-none transition placeholder:text-stone-400 focus:border-[#d8ad24] focus:ring-2 focus:ring-[#d8ad24]/20"
            />
          </label>

          <label className="mt-4 block">
            <span className="mb-2 block text-sm font-bold text-stone-200">
              ข้อความเพิ่มเติม / Message
            </span>
            <textarea
              value={message}
              onChange={(event) => setMessage(event.target.value)}
              placeholder="ข้อความเพิ่มเติม เช่น เพลงนี้ให้เพื่อน / Message, e.g. this song is for my friend"
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
              "กำลังส่ง... / Sending..."
            ) : (
              <>
                <Send size={22} aria-hidden="true" />
                ส่งคำขอเพลง / Send Request
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
            <span>
              การเล่นเพลงขึ้นอยู่กับความเหมาะสมของนักดนตรีและเวลาการแสดง
              <br />
              <span className="text-stone-300">
                Song selection depends on the musician and show timing.
              </span>
            </span>
          </p>
          <p className="mt-2 text-base font-bold leading-7 text-[#f2d879]">
            ให้ทิปนักดนตรีกับตัวนักดนตรีเองได้เลย
            <br />
            <span className="text-stone-300">Tips can be given directly to the musician.</span>
          </p>
          <div className="mt-4 border-t border-white/10 pt-4 text-sm leading-7 text-stone-100">
            <p className="font-black text-[#d8ad24]">เงื่อนไขการรับคำขอเพลง / Song Request Terms</p>
            <p>• การรับคำขอเพลงจะสิ้นสุดลงเมื่อจบการแสดงในแต่ละรอบ</p>
            <p className="text-stone-300">
              • Song requests close at the end of each performance round.
            </p>
            <p>• หากท่านต้องการให้ศิลปินแสดงต่อ สามารถแจ้งพนักงานเพื่อต่อเวลาได้</p>
            <p className="text-stone-300">
              • If you would like the artist to continue, please ask the staff about extending the show.
            </p>
            <p>
              • การต่อเวลาการแสดง รบกวนท่านลูกค้าชำระค่าใช้จ่าย
              ตามอัตราค่าจ้างต่อชั่วโมงจริงของศิลปิน ล่วงหน้าค่ะ/ครับ
            </p>
            <p className="text-stone-300">
              • For extra performance time, please pay the artist's actual hourly rate in advance.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
